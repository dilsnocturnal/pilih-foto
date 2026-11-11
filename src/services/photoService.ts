import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Session, Photo, Comment, SessionStatus, StudioProfile } from '../types';
import {
  LOCAL_STORAGE_SESSIONS_KEY,
  LOCAL_STORAGE_PHOTOS_KEY,
  LOCAL_STORAGE_STUDIO_KEY,
} from '../data/mockSampleData';

// Local storage helpers for persistence
function getStoredSessions(): Session[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSessions(sessions: Session[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore
  }
}

function getStoredPhotos(sessionId: string): Photo[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PHOTOS_KEY}_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredPhotos(sessionId: string, photos: Photo[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PHOTOS_KEY}_${sessionId}`, JSON.stringify(photos));
  } catch {
    // Ignore
  }
}

let inMemorySessions: Session[] = getStoredSessions();

// Listener registries for instantaneous optimistic UI sync
const sessionsListeners = new Set<(sessions: Session[]) => void>();
const photosListenersMap = new Map<string, Set<(photos: Photo[]) => void>>();

function notifySessionsListeners() {
  sessionsListeners.forEach((listener) => {
    try {
      listener([...inMemorySessions]);
    } catch {
      // Ignore
    }
  });
}

function notifyPhotosListeners(sessionId: string) {
  const listeners = photosListenersMap.get(sessionId);
  if (listeners) {
    const current = getStoredPhotos(sessionId);
    listeners.forEach((listener) => {
      try {
        listener([...current]);
      } catch {
        // Ignore
      }
    });
  }
}

/**
 * Save Studio Profile
 */
export async function saveStudioProfile(profile: StudioProfile): Promise<void> {
  try {
    localStorage.setItem(LOCAL_STORAGE_STUDIO_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }

  const path = `studios/${profile.uid}`;
  try {
    const studioRef = doc(db, 'studios', profile.uid);
    await setDoc(studioRef, profile, { merge: true });
  } catch (error) {
    console.warn('Firestore studio save warning:', error);
  }
}

/**
 * Subscribe to Studio Profile
 */
export function subscribeStudioProfile(
  uid: string,
  onUpdate: (profile: StudioProfile | null) => void
): () => void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STUDIO_KEY);
    if (raw) {
      onUpdate(JSON.parse(raw));
    }
  } catch {
    // Ignore
  }

  const path = `studios/${uid}`;
  try {
    const studioRef = doc(db, 'studios', uid);
    return onSnapshot(
      studioRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as StudioProfile;
          localStorage.setItem(LOCAL_STORAGE_STUDIO_KEY, JSON.stringify(data));
          onUpdate(data);
        }
      },
      (error) => {
        console.warn('Studio onSnapshot fallback:', error.message);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Subscribe to ALL sessions for photographer dashboard (supports real-time groups & filtering)
 */
export function subscribeAllSessions(
  onUpdate: (sessions: Session[]) => void
): () => void {
  sessionsListeners.add(onUpdate);
  // Emit local cache immediately so UI is instant
  onUpdate(inMemorySessions);

  let unsubFirestore = () => {};

  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));

    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const list: Session[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Session);
        });
        inMemorySessions = list;
        saveStoredSessions(list);
        notifySessionsListeners();
      },
      (error) => {
        console.warn('All sessions onSnapshot fallback:', error.message);
        onUpdate(getStoredSessions());
      }
    );
  } catch (err) {
    onUpdate(getStoredSessions());
  }

  return () => {
    sessionsListeners.delete(onUpdate);
    unsubFirestore();
  };
}

/**
 * Subscribe to a specific session (client view or active selection)
 */
export function subscribeSession(
  sessionId: string,
  onUpdate: (session: Session | null) => void
): () => void {
  const localMatch = inMemorySessions.find((s) => s.id === sessionId) || null;
  if (localMatch) onUpdate(localMatch);

  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    return onSnapshot(
      sessionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const sess = docSnap.data() as Session;
          inMemorySessions = inMemorySessions.map((s) => (s.id === sess.id ? sess : s));
          if (!inMemorySessions.find((s) => s.id === sess.id)) {
            inMemorySessions.push(sess);
          }
          saveStoredSessions(inMemorySessions);
          onUpdate(sess);
          notifySessionsListeners();
        } else {
          onUpdate(localMatch);
        }
      },
      (error) => {
        console.warn('Session onSnapshot fallback:', error.message);
        onUpdate(localMatch);
      }
    );
  } catch (err) {
    onUpdate(localMatch);
    return () => {};
  }
}

/**
 * Subscribe to photos of a session
 */
export function subscribePhotos(
  sessionId: string,
  onUpdate: (photos: Photo[]) => void
): () => void {
  if (!photosListenersMap.has(sessionId)) {
    photosListenersMap.set(sessionId, new Set());
  }
  photosListenersMap.get(sessionId)!.add(onUpdate);

  const cachedPhotos = getStoredPhotos(sessionId);
  if (cachedPhotos.length > 0) {
    onUpdate(cachedPhotos);
  }

  let unsubFirestore = () => {};

  try {
    const photosRef = collection(db, 'sessions', sessionId, 'photos');
    const q = query(photosRef, orderBy('orderIndex', 'asc'));

    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const photosList: Photo[] = [];
        snapshot.forEach((d) => {
          photosList.push(d.data() as Photo);
        });
        saveStoredPhotos(sessionId, photosList);
        notifyPhotosListeners(sessionId);
      },
      (error) => {
        console.warn('Photos onSnapshot fallback:', error.message);
        onUpdate(getStoredPhotos(sessionId));
      }
    );
  } catch (err) {
    onUpdate(getStoredPhotos(sessionId));
  }

  return () => {
    photosListenersMap.get(sessionId)?.delete(onUpdate);
    unsubFirestore();
  };
}

/**
 * Subscribe to comments for a photo
 */
export function subscribeComments(
  sessionId: string,
  photoId: string,
  onUpdate: (comments: Comment[]) => void
): () => void {
  try {
    const commentsRef = collection(db, 'sessions', sessionId, 'photos', photoId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Comment[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Comment);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Comments onSnapshot fallback:', error.message);
        onUpdate([]);
      }
    );
  } catch (err) {
    onUpdate([]);
    return () => {};
  }
}

/**
 * Toggle photo selection state
 */
export async function togglePhotoSelection(
  sessionId: string,
  photoId: string,
  currentStatus: boolean,
  clientName: string,
  newSelectedCount: number
): Promise<void> {
  const nextStatus = !currentStatus;

  // Local storage cache update
  const localPhotos = getStoredPhotos(sessionId).map((p) =>
    p.id === photoId ? { ...p, isSelected: nextStatus, selectedBy: nextStatus ? clientName : '' } : p
  );
  saveStoredPhotos(sessionId, localPhotos);
  notifyPhotosListeners(sessionId);

  inMemorySessions = inMemorySessions.map((s) =>
    s.id === sessionId ? { ...s, selectedCount: newSelectedCount } : s
  );
  saveStoredSessions(inMemorySessions);
  notifySessionsListeners();

  try {
    const photoRef = doc(db, 'sessions', sessionId, 'photos', photoId);
    await updateDoc(photoRef, {
      isSelected: nextStatus,
      selectedBy: nextStatus ? clientName : '',
      updatedAt: new Date().toISOString(),
    });

    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      selectedCount: newSelectedCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error toggling photo selection in Firestore:', error);
  }
}

/**
 * Add a comment to a photo
 */
export async function addPhotoComment(
  sessionId: string,
  photoId: string,
  authorName: string,
  authorRole: 'photographer' | 'client',
  message: string,
  currentCount: number,
  authorUid?: string
): Promise<Comment> {
  const newComment: Comment = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    photoId,
    sessionId,
    authorName,
    authorRole,
    message,
    authorUid: authorUid || '',
    createdAt: new Date().toISOString(),
  };

  // Update photo comment count locally
  const localPhotos = getStoredPhotos(sessionId).map((p) =>
    p.id === photoId ? { ...p, commentCount: currentCount + 1 } : p
  );
  saveStoredPhotos(sessionId, localPhotos);
  notifyPhotosListeners(sessionId);

  try {
    const commentRef = doc(db, 'sessions', sessionId, 'photos', photoId, 'comments', newComment.id);
    await setDoc(commentRef, newComment);

    const photoRef = doc(db, 'sessions', sessionId, 'photos', photoId);
    await updateDoc(photoRef, {
      commentCount: currentCount + 1,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error adding comment to Firestore:', error);
  }

  return newComment;
}

/**
 * Submit client selection
 */
export async function submitClientSelection(
  sessionId: string,
  clientNotes: string,
  selectedCount: number
): Promise<void> {
  inMemorySessions = inMemorySessions.map((s) =>
    s.id === sessionId
      ? { ...s, status: 'submitted', clientNotes, selectedCount, updatedAt: new Date().toISOString() }
      : s
  );
  saveStoredSessions(inMemorySessions);
  notifySessionsListeners();

  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'submitted',
      clientNotes,
      selectedCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error submitting selection to Firestore:', error);
  }
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
): Promise<void> {
  inMemorySessions = inMemorySessions.map((s) =>
    s.id === sessionId ? { ...s, status, updatedAt: new Date().toISOString() } : s
  );
  saveStoredSessions(inMemorySessions);
  notifySessionsListeners();

  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error updating status in Firestore:', error);
  }
}

/**
 * Create a new custom session by photographer (with required sessionGroup)
 */
export async function createSession(
  sessionData: Omit<Session, 'selectedCount' | 'createdAt' | 'updatedAt'>,
  initialPhotos: { filename: string; url: string; thumbnailUrl?: string; category?: string }[]
): Promise<Session> {
  const newSession: Session = {
    ...sessionData,
    sessionGroup: sessionData.sessionGroup || 'Umum',
    selectedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to local cache & immediately notify subscribers
  inMemorySessions = [newSession, ...inMemorySessions.filter((s) => s.id !== newSession.id)];
  saveStoredSessions(inMemorySessions);
  notifySessionsListeners();

  const initialPhotoDocs: Photo[] = initialPhotos.map((p, idx) => ({
    id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    sessionId: newSession.id,
    photographerUid: newSession.photographerUid,
    filename: p.filename,
    url: p.url,
    thumbnailUrl: p.thumbnailUrl || p.url,
    category: p.category || 'Galeri',
    isSelected: false,
    commentCount: 0,
    orderIndex: idx + 1,
    createdAt: new Date().toISOString(),
  }));
  saveStoredPhotos(newSession.id, initialPhotoDocs);
  notifyPhotosListeners(newSession.id);

  try {
    const sessionRef = doc(db, 'sessions', newSession.id);
    await setDoc(sessionRef, newSession);

    for (const p of initialPhotoDocs) {
      const photoRef = doc(db, 'sessions', newSession.id, 'photos', p.id);
      await setDoc(photoRef, p);
    }
  } catch (error) {
    console.warn('Error writing new session to Firestore:', error);
  }

  return newSession;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  inMemorySessions = inMemorySessions.filter((s) => s.id !== sessionId);
  saveStoredSessions(inMemorySessions);
  notifySessionsListeners();

  try {
    localStorage.removeItem(`${LOCAL_STORAGE_PHOTOS_KEY}_${sessionId}`);
  } catch {
    // Ignore
  }

  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.warn('Error deleting session in Firestore:', error);
  }
}

/**
 * Upload photos to session
 */
export async function uploadPhotosToSession(
  sessionId: string,
  photographerUid: string,
  photosToAdd: { filename: string; url: string; thumbnailUrl?: string; category?: string }[],
  currentTotal: number
): Promise<Photo[]> {
  const newPhotos: Photo[] = photosToAdd.map((item, idx) => ({
    id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    sessionId,
    photographerUid,
    filename: item.filename,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl || item.url,
    category: item.category || 'Galeri',
    isSelected: false,
    commentCount: 0,
    orderIndex: currentTotal + idx + 1,
    createdAt: new Date().toISOString(),
  }));

  const existingPhotos = getStoredPhotos(sessionId);
  const updatedPhotos = [...existingPhotos, ...newPhotos];
  saveStoredPhotos(sessionId, updatedPhotos);
  notifyPhotosListeners(sessionId);

  try {
    for (const p of newPhotos) {
      const photoRef = doc(db, 'sessions', sessionId, 'photos', p.id);
      await setDoc(photoRef, p);
    }
  } catch (error) {
    console.warn('Error uploading photos to Firestore:', error);
  }

  return newPhotos;
}

/**
 * Delete a single photo from a session
 */
export async function deletePhoto(sessionId: string, photoId: string): Promise<void> {
  const existing = getStoredPhotos(sessionId).filter((p) => p.id !== photoId);
  saveStoredPhotos(sessionId, existing);
  notifyPhotosListeners(sessionId);

  try {
    const photoRef = doc(db, 'sessions', sessionId, 'photos', photoId);
    await deleteDoc(photoRef);
  } catch (error) {
    console.warn('Error deleting photo in Firestore:', error);
  }
}
