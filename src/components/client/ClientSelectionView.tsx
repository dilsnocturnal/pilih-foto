import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  MessageSquare,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Send,
  Filter,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  AlertCircle,
  Clock,
  Building2,
  Phone,
  FileText,
  X,
} from 'lucide-react';
import {
  Session,
  Photo,
  FilterCategory,
  FilterSelection,
  GridLayout,
  UserRole,
  StudioProfile,
} from '../../types';
import { togglePhotoSelection, submitClientSelection } from '../../services/photoService';
import { SelectedFilesColumn } from '../common/SelectedFilesColumn';

interface ClientSelectionViewProps {
  session: Session;
  photos: Photo[];
  onOpenComments: (photo: Photo) => void;
  onOpenLightbox: (photo: Photo) => void;
  currentRole: UserRole;
  studioProfile?: StudioProfile | null;
}

export const ClientSelectionView: React.FC<ClientSelectionViewProps> = ({
  session,
  photos,
  onOpenComments,
  onOpenLightbox,
  currentRole,
  studioProfile,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeSelectionFilter, setActiveSelectionFilter] = useState<FilterSelection>('all');
  const [gridLayout, setGridLayout] = useState<GridLayout>(3);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [clientNotesInput, setClientNotesInput] = useState(session.clientNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(session.status === 'submitted');
  const [isMobileFileListOpen, setIsMobileFileListOpen] = useState(false);

  // Selected photos
  const selectedPhotos = photos.filter((p) => p.isSelected);
  const selectedCount = selectedPhotos.length;
  const packageLimit = session.packageLimit;
  const isLimitReached = selectedCount >= packageLimit;
  const progressPercent = Math.min(100, Math.round((selectedCount / packageLimit) * 100));

  // Extract categories
  const categories: FilterCategory[] = [
    'all',
    ...Array.from(new Set(photos.map((p) => p.category).filter(Boolean) as FilterCategory[])),
  ];

  // Filtered photos
  const filteredPhotos = photos.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (activeSelectionFilter === 'selected' && !p.isSelected) return false;
    if (activeSelectionFilter === 'unselected' && p.isSelected) return false;
    if (activeSelectionFilter === 'has_comments' && (p.commentCount || 0) === 0) return false;
    return true;
  });

  const handleToggle = async (photo: Photo) => {
    if (!photo.isSelected && isLimitReached) {
      alert(`Batas kuota paket Anda adalah ${packageLimit} foto. Batalkan salah satu pilihan jika ingin memilih foto ini.`);
      return;
    }

    const nextCount = photo.isSelected ? selectedCount - 1 : selectedCount + 1;
    await togglePhotoSelection(
      session.id,
      photo.id,
      photo.isSelected,
      session.clientName,
      nextCount
    );
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitClientSelection(session.id, clientNotesInput, selectedCount);
      setIsSubmitModalOpen(false);
      setShowSuccessBanner(true);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE'],
        });
      } catch {
        // Confetti fallback
      }
    } catch (err) {
      console.error('Error submitting selection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-28 bg-[#F3F8FD] min-h-screen">
      {/* Session Hero Banner (Pastel Blue) */}
      <div className="bg-gradient-to-r from-sky-100/90 via-blue-50/70 to-cyan-50 border-b border-sky-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-200/80 text-sky-900 tracking-wide uppercase">
                Galeri Pemilihan Klien
              </span>
              {session.sessionGroup && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 tracking-wide">
                  🏷️ {session.sessionGroup}
                </span>
              )}
              {session.status === 'submitted' ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Pilihan Sudah Dikirim
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  Sesi Pemilihan Aktif (Real-Time)
                </span>
              )}
            </div>

            <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
              {session.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-stone-600 mt-2">
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <Building2 className="w-4 h-4 text-sky-500" />
                <span>{session.studioName || studioProfile?.studioName || session.photographerName}</span>
              </span>
              {(session.phoneNumber || studioProfile?.phoneNumber) && (
                <>
                  <span className="text-stone-300">•</span>
                  <span className="flex items-center gap-1 text-sky-700 font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{session.phoneNumber || studioProfile?.phoneNumber}</span>
                  </span>
                </>
              )}
              <span className="text-stone-300">•</span>
              <span>Klien: <strong>{session.clientName}</strong></span>
            </div>
          </div>

          {/* Quota Progress Card */}
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-sky-100 shadow-sm max-w-md w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Kuota Foto Paket
              </span>
              <span className="text-sm font-bold text-stone-900">
                <span className="text-sky-600 text-base">{selectedCount}</span> / {packageLimit} Foto
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-sky-50 rounded-full overflow-hidden p-[1px] border border-sky-100 mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLimitReached
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-500">
                {isLimitReached
                  ? '🎉 Kuota paket terpenuhi! Anda siap kirim.'
                  : `Tersisa ${packageLimit - selectedCount} foto lagi untuk dipilih.`}
              </span>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pilihan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Bar if submitted */}
      {showSuccessBanner && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 text-center text-xs sm:text-sm font-medium text-emerald-800 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            Terima kasih! Pilihan foto Anda telah berhasil dikirim ke fotografer dan siap masuk tahap editing.
          </span>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-700 hover:text-emerald-900 ml-2 underline text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-sky-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-sky-50 text-stone-600 hover:bg-sky-100/70'
                }`}
              >
                {cat === 'all' ? 'Semua Momen' : cat}
              </button>
            ))}
          </div>

          {/* Right Filters & Grid Layout */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
            {/* Selection Status Dropdown / Pills */}
            <div className="flex items-center gap-1 bg-sky-50/70 p-1 rounded-2xl border border-sky-100 text-xs">
              <button
                onClick={() => setActiveSelectionFilter('all')}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all ${
                  activeSelectionFilter === 'all' ? 'bg-white shadow-xs text-sky-900' : 'text-stone-500'
                }`}
              >
                Semua ({photos.length})
              </button>
              <button
                onClick={() => setActiveSelectionFilter('selected')}
                className={`px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                  activeSelectionFilter === 'selected'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-stone-600'
                }`}
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>Terpilih ({selectedCount})</span>
              </button>
              <button
                onClick={() => setActiveSelectionFilter('has_comments')}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${
                  activeSelectionFilter === 'has_comments'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                <MessageSquare className="w-3 h-3 text-amber-500" />
                <span>Catatan</span>
              </button>
            </div>

            {/* Mobile View Toggle for Dedicated File List */}
            <button
              onClick={() => setIsMobileFileListOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-900 rounded-xl text-xs font-bold border border-sky-200"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>Daftar File ({selectedCount})</span>
            </button>

            {/* Grid Layout Toggles */}
            <div className="hidden sm:flex items-center gap-1 bg-sky-50/70 p-1 rounded-xl border border-sky-100">
              <button
                onClick={() => setGridLayout(2)}
                className={`p-1.5 rounded-lg transition-all ${
                  gridLayout === 2 ? 'bg-white shadow-xs text-sky-900' : 'text-stone-400 hover:text-stone-600'
                }`}
                title="Tampilan 2 Kolom"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridLayout(3)}
                className={`p-1.5 rounded-lg transition-all ${
                  gridLayout === 3 ? 'bg-white shadow-xs text-sky-900' : 'text-stone-400 hover:text-stone-600'
                }`}
                title="Tampilan 3 Kolom"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridLayout(4)}
                className={`p-1.5 rounded-lg transition-all ${
                  gridLayout === 4 ? 'bg-white shadow-xs text-sky-900' : 'text-stone-400 hover:text-stone-600'
                }`}
                title="Tampilan 4 Kolom"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: Gallery on Left + Dedicated File List Column on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Photos Grid Area (8-9 columns on desktop) */}
          <div className="lg:col-span-8 xl:col-span-8">
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-sky-200 p-8">
                <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-400 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-800">
                  Tidak Ada Foto di Kategori Ini
                </h3>
                <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                  Coba ganti filter momen atau status pemilihan foto untuk melihat koleksi lainnya.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setActiveSelectionFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-5 ${
                  gridLayout === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : gridLayout === 3
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                }`}
              >
                {filteredPhotos.map((photo, idx) => {
                  const isCardLimitReached = !photo.isSelected && isLimitReached;

                  return (
                    <div
                      key={photo.id}
                      className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-md ${
                        photo.isSelected
                          ? 'border-sky-400 ring-3 ring-sky-200/60 shadow-sm'
                          : 'border-sky-100 hover:border-sky-300'
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-4/3 sm:aspect-3/2 bg-sky-50 overflow-hidden cursor-pointer">
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.filename}
                          loading="lazy"
                          onClick={() => onOpenLightbox(photo)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
                          <span className="bg-stone-900/70 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                            #{String(photo.orderIndex || idx + 1).padStart(2, '0')}
                          </span>

                          {photo.isSelected && (
                            <span className="bg-sky-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                              <span>Terpilih</span>
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay */}
                        <div
                          onClick={() => onOpenLightbox(photo)}
                          className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
                        >
                          <span className="bg-white/95 backdrop-blur-md text-stone-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
                            Perbesar
                          </span>
                        </div>
                      </div>

                      {/* Content & Action Bar */}
                      <div className="p-3 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="min-w-0 pr-1">
                            <p className="text-xs font-bold text-stone-900 truncate">
                              {photo.filename}
                            </p>
                            {photo.category && (
                              <span className="inline-block text-[10px] text-sky-800 bg-sky-50 font-medium px-2 py-0.5 rounded-md mt-0.5">
                                {photo.category}
                              </span>
                            )}
                          </div>

                          {/* Comment trigger */}
                          <button
                            onClick={() => onOpenComments(photo)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                              photo.commentCount > 0
                                ? 'bg-amber-100 text-amber-900 font-bold'
                                : 'bg-sky-50 text-stone-500 hover:bg-sky-100/70'
                            }`}
                            title="Beri Catatan / Komentar"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{photo.commentCount || 0}</span>
                          </button>
                        </div>

                        {/* Select Button */}
                        <button
                          onClick={() => handleToggle(photo)}
                          disabled={isCardLimitReached}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            photo.isSelected
                              ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
                              : isCardLimitReached
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition-transform ${
                              photo.isSelected ? 'fill-current scale-110' : 'text-sky-500'
                            }`}
                          />
                          <span>
                            {photo.isSelected
                              ? 'Batalkan Pilihan'
                              : isCardLimitReached
                              ? 'Kuota Penuh'
                              : 'Pilih Foto Ini'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dedicated Selected Files Column (Sticky on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-4 sticky top-24">
            <SelectedFilesColumn
              selectedPhotos={selectedPhotos}
              packageLimit={packageLimit}
              onRemovePhoto={handleToggle}
              onPhotoClick={(p) => onOpenLightbox(p)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer for Selected Files Column */}
      {isMobileFileListOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs lg:hidden animate-in fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b border-sky-100 flex items-center justify-between">
              <span className="font-bold text-sm text-stone-900">Kolom File Terpilih</span>
              <button
                onClick={() => setIsMobileFileListOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <SelectedFilesColumn
                selectedPhotos={selectedPhotos}
                packageLimit={packageLimit}
                onRemovePhoto={handleToggle}
                onPhotoClick={(p) => {
                  setIsMobileFileListOpen(false);
                  onOpenLightbox(p);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-sky-100 py-3 px-4 sm:px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500">
              <Heart className="w-5 h-5 fill-sky-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-500">Total Foto Dipilih:</p>
              <p className="text-sm sm:text-base font-bold text-stone-900">
                <span className="text-sky-600">{selectedCount}</span> / {packageLimit} Foto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFileListOpen(true)}
              className="lg:hidden px-3 py-2 bg-sky-50 text-sky-800 text-xs font-bold rounded-xl border border-sky-200"
            >
              Lihat Kolom File
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-sky-200 transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pilihan ke Fotografer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Final Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#F8FBFE] rounded-3xl max-w-lg w-full border border-sky-100 shadow-2xl p-6 sm:p-7 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-sky-100">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Konfirmasi Pilihan Klien
                </span>
                <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900 mt-0.5">
                  Kirim Pilihan ke Fotografer
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500">Jumlah Foto Dipilih:</p>
                  <p className="text-lg font-bold text-stone-900">
                    <span className="text-sky-600">{selectedCount}</span> / {packageLimit} Foto
                  </p>
                </div>
                {selectedCount > packageLimit && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                    Melebihi paket (+{selectedCount - packageLimit} foto)
                  </span>
                )}
              </div>

              {/* Thumbnails preview */}
              <div>
                <p className="text-xs font-semibold text-stone-700 mb-2">
                  Pratinjau Foto Terpilih ({selectedPhotos.length}):
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {selectedPhotos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.filename}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-sky-200"
                    />
                  ))}
                </div>
              </div>

              {/* Client Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Catatan Tambahan untuk Fotografer (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={clientNotesInput}
                  onChange={(e) => setClientNotesInput(e.target.value)}
                  placeholder="Contoh: Tolong prioritaskan foto outdoor untuk album, dan tone warna dibuat warm natural..."
                  className="w-full bg-white border border-sky-200 rounded-xl p-3 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
              >
                Kembali Memilih
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || selectedCount === 0}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-sky-200 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Ya, Kirim Pilihan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
