import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ClientSelectionView } from './components/client/ClientSelectionView';
import { PhotographerDashboard } from './components/photographer/PhotographerDashboard';
import { PhotoCommentsDrawer } from './components/common/PhotoCommentsDrawer';
import { PhotoLightboxModal } from './components/common/PhotoLightboxModal';
import { ClientAccessModal } from './components/common/ClientAccessModal';
import { StudioAuthModal } from './components/common/StudioAuthModal';
import { Session, Photo, UserRole, StudioProfile } from './types';
import { testConnection } from './lib/firebase';
import {
  subscribeAllSessions,
  subscribeSession,
  subscribePhotos,
  togglePhotoSelection,
  subscribeStudioProfile,
} from './services/photoService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'app'>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSession = sessions.find((s) => s.id === activeSessionId) || (sessions.length > 0 ? sessions[0] : null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [studioProfile, setStudioProfile] = useState<StudioProfile | null>(null);

  // Modals & Drawers state
  const [commentPhoto, setCommentPhoto] = useState<Photo | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  // 1. Initial boot: Test connection
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Real-time subscription to ALL sessions (real data, zero mock forcing!)
  useEffect(() => {
    const unsub = subscribeAllSessions((loadedSessions) => {
      setSessions(loadedSessions);
      setActiveSessionId((prev) => {
        if (!prev && loadedSessions.length > 0) {
          return loadedSessions[0].id;
        }
        if (prev && !loadedSessions.some((s) => s.id === prev) && loadedSessions.length > 0) {
          return loadedSessions[0].id;
        }
        return prev;
      });
    });
    return () => unsub();
  }, []);

  // 3. Parse URL query parameters (?session=xyz&view=client)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    const viewParam = params.get('view');

    if (sessionParam) {
      setActiveSessionId(sessionParam);
      setCurrentRole(viewParam === 'photographer' ? 'photographer' : 'client');
      setCurrentPage('app');
    }
  }, []);

  // 4. Subscribe to Studio Profile
  useEffect(() => {
    const unsub = subscribeStudioProfile('default-studio', (profile) => {
      setStudioProfile(profile);
    });
    return () => unsub();
  }, []);

  // 5. Real-time subscription for active session details & its photos
  useEffect(() => {
    if (!activeSessionId) {
      setPhotos([]);
      return;
    }

    const unsubSession = subscribeSession(activeSessionId, (updatedSession) => {
      // Sessions list already updates via subscribeAllSessions
    });

    const unsubPhotos = subscribePhotos(activeSessionId, (updatedPhotos) => {
      setPhotos(updatedPhotos);

      // Keep lightbox and comment photo references up to date
      setLightboxPhoto((prev) => {
        if (!prev) return null;
        return updatedPhotos.find((p) => p.id === prev.id) || prev;
      });
      setCommentPhoto((prev) => {
        if (!prev) return null;
        return updatedPhotos.find((p) => p.id === prev.id) || prev;
      });
    });

    return () => {
      unsubSession();
      unsubPhotos();
    };
  }, [activeSessionId]);

  // Navigation handlers
  const handleEnterGallery = (role: UserRole, targetSessionId?: string) => {
    setCurrentRole(role);
    if (targetSessionId) {
      setActiveSessionId(targetSessionId);
    } else if (sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
    setCurrentPage('app');
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (currentPage === 'landing') {
      setCurrentPage('app');
    }
  };

  const handleSelectSession = (sess: Session) => {
    setActiveSessionId(sess.id);
  };

  const handleNewSessionCreated = (newSess: Session) => {
    setActiveSessionId(newSess.id);
  };

  const handleCodeSubmit = (code: string) => {
    setIsCodeModalOpen(false);
    const trimmed = code.trim();
    // Check if code matches a session id or pin
    const match = sessions.find(
      (s) => s.id === trimmed || s.clientAccessPin === trimmed || s.title.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (match) {
      setActiveSessionId(match.id);
      setCurrentRole('client');
      setCurrentPage('app');
    } else {
      setActiveSessionId(trimmed);
      setCurrentRole('client');
      setCurrentPage('app');
    }
  };

  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  // Lightbox handlers
  const handleLightboxNext = () => {
    if (!lightboxPhoto || photos.length === 0) return;
    const currentIndex = photos.findIndex((p) => p.id === lightboxPhoto.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    setLightboxPhoto(photos[nextIndex]);
  };

  const handleLightboxPrev = () => {
    if (!lightboxPhoto || photos.length === 0) return;
    const currentIndex = photos.findIndex((p) => p.id === lightboxPhoto.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setLightboxPhoto(photos[prevIndex]);
  };

  const handleToggleSelect = async (photo: Photo) => {
    if (!activeSession) return;
    const selectedCount = photos.filter((p) => p.isSelected).length;
    const isLimitReached = !photo.isSelected && selectedCount >= activeSession.packageLimit;

    if (isLimitReached) {
      alert(`Batas kuota paket adalah ${activeSession.packageLimit} foto.`);
      return;
    }

    const nextCount = photo.isSelected ? selectedCount - 1 : selectedCount + 1;
    await togglePhotoSelection(
      activeSession.id,
      photo.id,
      photo.isSelected,
      activeSession.clientName,
      nextCount
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F8FD] font-['Plus_Jakarta_Sans',sans-serif] text-stone-800 flex flex-col">
      {/* Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeSession={currentPage === 'app' ? activeSession : null}
        onGoHome={() => setCurrentPage('landing')}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenStudioModal={() => setIsStudioModalOpen(true)}
        studioProfile={studioProfile}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'landing' ? (
          <LandingPage
            onEnterGallery={handleEnterGallery}
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
            onOpenStudioModal={() => setIsStudioModalOpen(true)}
          />
        ) : currentRole === 'client' ? (
          activeSession ? (
            <ClientSelectionView
              session={activeSession}
              photos={photos}
              onOpenComments={(p) => setCommentPhoto(p)}
              onOpenLightbox={(p) => setLightboxPhoto(p)}
              currentRole={currentRole}
              studioProfile={studioProfile}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
              <div className="bg-white p-8 rounded-3xl border border-sky-100 shadow-sm">
                <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900 mb-2">
                  Belum Ada Sesi Dipilih
                </h3>
                <p className="text-xs text-stone-600 mb-5">
                  Silakan masukkan tautan atau PIN sesi yang diberikan oleh fotografer Anda.
                </p>
                <button
                  onClick={() => setIsCodeModalOpen(true)}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Masukkan Kode Sesi
                </button>
              </div>
            </div>
          )
        ) : (
          <PhotographerDashboard
            sessions={sessions}
            activeSession={activeSession}
            onSelectSession={handleSelectSession}
            photos={photos}
            onOpenComments={(p) => setCommentPhoto(p)}
            onOpenLightbox={(p) => setLightboxPhoto(p)}
            onSwitchToClientMode={() => setCurrentRole('client')}
            studioProfile={studioProfile}
            onOpenStudioModal={() => setIsStudioModalOpen(true)}
            onPhotosUploaded={handlePhotosUploaded}
            onNewSessionCreated={handleNewSessionCreated}
          />
        )}
      </main>

      {/* Lightbox Modal */}
      {activeSession && (
        <PhotoLightboxModal
          photo={lightboxPhoto}
          allPhotos={photos}
          isOpen={!!lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          onSelectNext={handleLightboxNext}
          onSelectPrev={handleLightboxPrev}
          onToggleSelect={handleToggleSelect}
          onOpenComments={(p) => setCommentPhoto(p)}
          currentRole={currentRole}
          packageLimit={activeSession.packageLimit}
          selectedCount={photos.filter((p) => p.isSelected).length}
        />
      )}

      {/* Real-time Comments Drawer */}
      {activeSession && (
        <PhotoCommentsDrawer
          photo={commentPhoto}
          sessionId={activeSession.id}
          isOpen={!!commentPhoto}
          onClose={() => setCommentPhoto(null)}
          currentRole={currentRole}
          clientName={activeSession.clientName}
          photographerName={studioProfile?.ownerName || activeSession.photographerName}
        />
      )}

      {/* Client Access PIN/ID Modal */}
      <ClientAccessModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSubmitCode={handleCodeSubmit}
      />

      {/* Studio Profile & Login Modal (Gmail & Phone) */}
      <StudioAuthModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        currentStudio={studioProfile}
        onProfileUpdated={(updated) => setStudioProfile(updated)}
      />
    </div>
  );
}
