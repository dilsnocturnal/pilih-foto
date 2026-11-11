export type SessionStatus = 'draft' | 'open' | 'submitted' | 'completed';

export const DEFAULT_SESSION_GROUPS = [
  'Wedding',
  'Prewedding',
  'Wisuda',
  'Studio & Portrait',
  'Event & Ultah',
  'Family & Kids',
  'Komersial / Produk',
] as const;

export type DefaultSessionGroup = (typeof DEFAULT_SESSION_GROUPS)[number] | string;

export interface StudioProfile {
  uid: string;
  studioName: string;
  phoneNumber: string;
  email?: string;
  ownerName?: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  clientAccessPin?: string;
  sessionGroup: string; // Kelompok sesi (e.g. Wedding, Prewedding, Wisuda, dll.)
  photographerUid: string;
  photographerName: string;
  studioName?: string;
  phoneNumber?: string;
  packageLimit: number;
  selectedCount: number;
  status: SessionStatus;
  clientNotes?: string;
  coverPhotoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Photo {
  id: string;
  sessionId: string;
  photographerUid: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  isSelected: boolean;
  selectedBy?: string;
  commentCount: number;
  orderIndex: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  photoId: string;
  sessionId: string;
  authorUid?: string;
  authorName: string;
  authorRole: 'photographer' | 'client';
  message: string;
  createdAt: string;
}

export type UserRole = 'photographer' | 'client';
export type FilterCategory = 'all' | string;
export type FilterSelection = 'all' | 'selected' | 'unselected' | 'has_comments';
export type GridLayout = 2 | 3 | 4;
