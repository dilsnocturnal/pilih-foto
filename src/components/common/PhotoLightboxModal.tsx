import React, { useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  ZoomIn,
  Check,
  Tag,
} from 'lucide-react';
import { Photo, UserRole } from '../../types';

interface PhotoLightboxModalProps {
  photo: Photo | null;
  allPhotos: Photo[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNext: () => void;
  onSelectPrev: () => void;
  onToggleSelect: (photo: Photo) => void;
  onOpenComments: (photo: Photo) => void;
  currentRole: UserRole;
  packageLimit: number;
  selectedCount: number;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  allPhotos,
  isOpen,
  onClose,
  onSelectNext,
  onSelectPrev,
  onToggleSelect,
  onOpenComments,
  currentRole,
  packageLimit,
  selectedCount,
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onSelectNext();
      if (e.key === 'ArrowLeft') onSelectPrev();
      if (e.key === ' ' && photo) {
        e.preventDefault();
        onToggleSelect(photo);
      }
    },
    [isOpen, onClose, onSelectNext, onSelectPrev, onToggleSelect, photo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !photo) return null;

  const currentIndex = allPhotos.findIndex((p) => p.id === photo.id);
  const isLimitReached = !photo.isSelected && selectedCount >= packageLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="absolute top-0 inset-x-0 h-18 bg-gradient-to-b from-stone-950/80 to-transparent flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3 text-white">
          <span className="font-bold text-sm sm:text-base">{photo.filename}</span>
          {photo.category && (
            <span className="text-xs bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-sky-200 border border-white/10 flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3 text-sky-300" />
              {photo.category}
            </span>
          )}
          <span className="text-xs text-stone-400">
            ({currentIndex + 1} / {allPhotos.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed((prev) => !prev)}
            className={`p-2.5 rounded-full transition-colors ${
              isZoomed ? 'bg-sky-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Perbesar / Fit"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-hidden">
        <img
          src={photo.url}
          alt={photo.filename}
          className={`max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 shadow-2xl ${
            isZoomed ? 'scale-150 cursor-grab' : 'scale-100 cursor-pointer'
          }`}
          onClick={() => setIsZoomed((prev) => !prev)}
        />

        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectPrev();
          }}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-105"
          title="Foto Sebelumnya (Panah Kiri)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectNext();
          }}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-105"
          title="Foto Berikutnya (Panah Kanan)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center items-center z-20 px-4">
        <div className="bg-stone-900/85 backdrop-blur-lg border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-3 sm:gap-4 shadow-2xl">
          {/* Select / Heart Toggle */}
          <button
            onClick={() => onToggleSelect(photo)}
            disabled={isLimitReached}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
              photo.isSelected
                ? 'bg-sky-500 hover:bg-sky-600 text-white ring-2 ring-sky-300/40'
                : isLimitReached
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-white hover:bg-sky-50 text-stone-800'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                photo.isSelected ? 'fill-current text-white scale-110' : 'text-sky-500'
              }`}
            />
            <span>
              {photo.isSelected ? 'Foto Terpilih' : isLimitReached ? 'Kuota Penuh' : 'Pilih Foto Ini'}
            </span>
          </button>

          {/* Open Comments */}
          <button
            onClick={() => onOpenComments(photo)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Komentar ({photo.commentCount || 0})</span>
          </button>

          {/* Quota Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs text-stone-300">
            <span>Kuota:</span>
            <span className="font-bold text-sky-300">
              {selectedCount}/{packageLimit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
