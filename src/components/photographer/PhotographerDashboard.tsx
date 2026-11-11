import React, { useState } from 'react';
import {
  Camera,
  Copy,
  Check,
  Share2,
  Plus,
  MessageSquare,
  Sparkles,
  Heart,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Upload,
  Building2,
  Phone,
  FileText,
  Link,
  FolderOpen,
  Layers,
  ChevronRight,
  Trash2,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import {
  Session,
  Photo,
  SessionStatus,
  UserRole,
  StudioProfile,
  DEFAULT_SESSION_GROUPS,
} from '../../types';
import {
  updateSessionStatus,
  createSession,
  deleteSession,
} from '../../services/photoService';
import { PhotoUploadModal } from './PhotoUploadModal';
import { SelectedFilesColumn } from '../common/SelectedFilesColumn';

interface PhotographerDashboardProps {
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (session: Session) => void;
  photos: Photo[];
  onOpenComments: (photo: Photo) => void;
  onOpenLightbox: (photo: Photo) => void;
  onSwitchToClientMode: () => void;
  studioProfile?: StudioProfile | null;
  onOpenStudioModal: () => void;
  onPhotosUploaded: (newPhotos: Photo[]) => void;
  onNewSessionCreated: (session: Session) => void;
}

export const PhotographerDashboard: React.FC<PhotographerDashboardProps> = ({
  sessions,
  activeSession,
  onSelectSession,
  photos,
  onOpenComments,
  onOpenLightbox,
  onSwitchToClientMode,
  studioProfile,
  onOpenStudioModal,
  onPhotosUploaded,
  onNewSessionCreated,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'selected' | 'comments'>('all');
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  // New session form state
  const [newClientName, setNewClientName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPackageLimit, setNewPackageLimit] = useState(15);
  const [newSessionGroup, setNewSessionGroup] = useState<string>('Wedding');
  const [customGroupInput, setCustomGroupInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Grouped sessions
  const availableGroups = Array.from(
    new Set(sessions.map((s) => s.sessionGroup || 'Umum'))
  );

  const filteredSessionsByGroup = sessions.filter((s) => {
    if (activeGroupFilter === 'all') return true;
    return (s.sessionGroup || 'Umum') === activeGroupFilter;
  });

  const selectedPhotos = photos.filter((p) => p.isSelected);
  const photosWithComments = photos.filter((p) => (p.commentCount || 0) > 0);

  const filteredPhotos = photos.filter((p) => {
    if (filterMode === 'selected') return p.isSelected;
    if (filterMode === 'comments') return (p.commentCount || 0) > 0;
    return true;
  });

  // Client Share Link with query params
  const clientShareUrl = activeSession
    ? `${window.location.origin}${window.location.pathname}?session=${activeSession.id}&view=client`
    : '';

  const handleCopyClientLink = () => {
    if (!clientShareUrl) return;
    navigator.clipboard.writeText(clientShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleStatusChange = async (newStatus: SessionStatus) => {
    if (!activeSession) return;
    await updateSessionStatus(activeSession.id, newStatus);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus sesi foto ini?')) {
      await deleteSession(sessionId);
    }
  };

  const handleCreateNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newTitle.trim()) return;
    setIsCreating(true);

    const group = customGroupInput.trim() || newSessionGroup || 'Umum';

    try {
      const generatedId = `session-${Date.now()}`;
      const created = await createSession(
        {
          id: generatedId,
          title: newTitle.trim(),
          clientName: newClientName.trim(),
          clientEmail: `${newClientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          clientAccessPin: '1234',
          sessionGroup: group,
          photographerUid: studioProfile?.uid || 'photographer-uid',
          photographerName: studioProfile?.ownerName || 'Fotografer',
          studioName: studioProfile?.studioName || 'Studio Foto',
          phoneNumber: studioProfile?.phoneNumber || '',
          packageLimit: Number(newPackageLimit) || 15,
          status: 'open',
          coverPhotoUrl: '',
        },
        [] // Start with empty photo list (clean & new as requested!)
      );

      setIsNewSessionModalOpen(false);
      setNewClientName('');
      setNewTitle('');
      setCustomGroupInput('');
      onNewSessionCreated(created);
    } catch (err) {
      console.error('Error creating new session:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // If no sessions exist yet, show clean initial state
  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-sky-100 p-8 sm:p-12 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Camera className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-sky-600 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Workspace Fotografer
          </span>

          <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-stone-900 mt-2 mb-2">
            Belum Ada Sesi Foto
          </h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto mb-8 leading-relaxed">
            Mulai dengan membuat sesi foto baru untuk klien Anda, atur kelompok sesi (seperti Wedding,
            Wisuda, Prewedding, Portrait), dan unggah foto untuk dikirimkan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsNewSessionModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Sesi Foto Baru</span>
            </button>

            <button
              onClick={onOpenStudioModal}
              className="w-full sm:w-auto px-6 py-3 bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-sm rounded-2xl border border-sky-200 transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Atur Profil Studio</span>
            </button>
          </div>
        </div>

        {/* Create Session Modal */}
        {isNewSessionModalOpen && (
          <CreateSessionModal
            isOpen={isNewSessionModalOpen}
            onClose={() => setIsNewSessionModalOpen(false)}
            onSubmit={handleCreateNewSession}
            newClientName={newClientName}
            setNewClientName={setNewClientName}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newPackageLimit={newPackageLimit}
            setNewPackageLimit={setNewPackageLimit}
            newSessionGroup={newSessionGroup}
            setNewSessionGroup={setNewSessionGroup}
            customGroupInput={customGroupInput}
            setCustomGroupInput={setCustomGroupInput}
            isCreating={isCreating}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F3F8FD]">
      {/* Sessions Browser Bar (Kelompok Sesi Tabs & Switcher) */}
      <div className="bg-white rounded-3xl border border-sky-100 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100">
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                Kelompok Sesi Foto ({sessions.length} Sesi Terdaftar)
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Pilih kelompok sesi untuk menyaring dan mengelola galeri foto klien.
            </p>
          </div>

          <button
            onClick={() => setIsNewSessionModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Sesi Baru</span>
          </button>
        </div>

        {/* Kelompok Sesi Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
          <button
            onClick={() => setActiveGroupFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeGroupFilter === 'all'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-sky-50 text-stone-600 hover:bg-sky-100'
            }`}
          >
            Semua Kelompok ({sessions.length})
          </button>

          {availableGroups.map((grp) => {
            const count = sessions.filter((s) => (s.sessionGroup || 'Umum') === grp).length;
            return (
              <button
                key={grp}
                onClick={() => setActiveGroupFilter(grp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeGroupFilter === grp
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-sky-50 text-stone-700 hover:bg-sky-100'
                }`}
              >
                <Tag className="w-3 h-3 text-sky-500" />
                <span>{grp}</span>
                <span className="text-[10px] bg-white/80 text-stone-700 px-1.5 py-0.2 rounded-full font-semibold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sessions Carousel / Reel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-sky-100">
          {filteredSessionsByGroup.map((sess) => {
            const isActive = activeSession?.id === sess.id;
            return (
              <div
                key={sess.id}
                onClick={() => onSelectSession(sess)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all relative group ${
                  isActive
                    ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-300 shadow-xs'
                    : 'bg-white hover:bg-sky-50/40 border-sky-100'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                    {sess.sessionGroup || 'Umum'}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 p-1 transition-opacity"
                    title="Hapus Sesi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="font-bold text-xs text-stone-900 truncate">{sess.title}</p>
                <p className="text-[11px] text-stone-500 truncate">Klien: {sess.clientName}</p>

                <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-sky-100/60">
                  <span className="font-semibold text-sky-700">
                    {sess.selectedCount}/{sess.packageLimit} Dipilih
                  </span>
                  {sess.status === 'submitted' ? (
                    <span className="text-emerald-700 font-bold text-[10px]">Selesai</span>
                  ) : (
                    <span className="text-sky-600 font-medium text-[10px]">Aktif</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Active Session Workspace */}
      {activeSession ? (
        <div className="space-y-6">
          {/* Active Session Header Card */}
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-sky-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 uppercase tracking-wide">
                    Kelompok: {activeSession.sessionGroup || 'Umum'}
                  </span>
                  <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>{studioProfile?.studioName || activeSession.studioName || 'Studio'}</span>
                  </span>
                  {(studioProfile?.phoneNumber || activeSession.phoneNumber) && (
                    <span className="text-xs text-stone-500 font-medium">
                      • {studioProfile?.phoneNumber || activeSession.phoneNumber}
                    </span>
                  )}
                </div>

                <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-stone-900">
                  {activeSession.title}
                </h1>
                <p className="text-sm text-stone-600 mt-1">
                  Klien: <strong className="text-stone-900">{activeSession.clientName}</strong> • Target Pilihan:{' '}
                  <strong className="text-sky-600">{activeSession.packageLimit} Foto</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopyClientLink}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-sky-200 transition-all hover:scale-[1.02]"
                  title="Salin link langsung ke galeri klien untuk dikirim via WhatsApp"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Tersalin! 🎉' : 'Kirim Link ke Klien'}</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs sm:text-sm font-semibold rounded-2xl border border-sky-200 transition-all"
                >
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>Upload Foto</span>
                </button>

                <button
                  onClick={onSwitchToClientMode}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold rounded-2xl border border-sky-100 transition-all"
                >
                  <Eye className="w-4 h-4 text-stone-500" />
                  <span>Tampilan Klien</span>
                </button>
              </div>
            </div>

            {/* Link box */}
            <div className="mt-4 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-sky-900 font-medium min-w-0">
                <Link className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="shrink-0 font-bold">Link Klien:</span>
                <span className="truncate text-stone-600 text-[11px] bg-white px-2 py-1 rounded-lg border border-sky-200">
                  {clientShareUrl}
                </span>
              </div>
              <button
                onClick={handleCopyClientLink}
                className="shrink-0 text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 bg-white hover:bg-sky-100/60 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors"
              >
                {copiedLink ? 'Tersalin!' : 'Salin Tautan'}
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-2xl bg-[#F8FBFE] border border-sky-100">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-xs font-semibold">Foto Dipilih Klien (Real-Time)</span>
                  <Heart className="w-4 h-4 text-sky-500 fill-sky-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900">{selectedPhotos.length}</span>
                  <span className="text-xs text-stone-500">/ {activeSession.packageLimit} foto target</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FBFE] border border-sky-100">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-xs font-semibold">Catatan / Komentar Klien</span>
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900">{photosWithComments.length}</span>
                  <span className="text-xs text-stone-500">foto ada instruksi</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FBFE] border border-sky-100">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-xs font-semibold">Status Tahapan</span>
                  <Clock className="w-4 h-4 text-sky-500" />
                </div>
                <div className="mt-0.5">
                  {activeSession.status === 'submitted' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Klien Selesai Memilih
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg">
                      Sedang Memilih (Live)
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <button
                    onClick={() =>
                      handleStatusChange(activeSession.status === 'submitted' ? 'open' : 'submitted')
                    }
                    className="text-[11px] text-sky-600 hover:text-sky-800 underline font-semibold"
                  >
                    Ubah Status Sesi
                  </button>
                </div>
              </div>
            </div>

            {/* Client Notes if any */}
            {activeSession.clientNotes && (
              <div className="mt-5 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-stone-800">
                <div className="flex items-center gap-2 mb-1 text-sky-900 font-bold text-xs uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  Pesan Khusus Klien ({activeSession.clientName}):
                </div>
                <p className="text-sm italic text-stone-700">
                  "{activeSession.clientNotes}"
                </p>
              </div>
            )}
          </div>

          {/* Photos Grid & Dedicated Selected Files Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Photos Grid Area (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-sky-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterMode === 'all'
                        ? 'bg-sky-500 text-white'
                        : 'bg-sky-50 text-stone-600 hover:bg-sky-100'
                    }`}
                  >
                    Semua Foto ({photos.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('selected')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      filterMode === 'selected'
                        ? 'bg-sky-500 text-white'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Dipilih Klien ({selectedPhotos.length})</span>
                  </button>
                  <button
                    onClick={() => setFilterMode('comments')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      filterMode === 'comments'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ada Catatan ({photosWithComments.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Upload Foto Baru</span>
                </button>
              </div>

              {photos.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-sky-200">
                  <Upload className="w-10 h-10 text-sky-400 mx-auto mb-3" />
                  <h4 className="font-bold text-stone-800 text-base">Belum Ada Foto di Sesi Ini</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Klik tombol di bawah untuk mengunggah foto sesi ini dari komputer atau HP Anda.
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-4 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Upload Foto Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className={`group bg-white rounded-2xl overflow-hidden border transition-all ${
                        photo.isSelected
                          ? 'border-sky-400 ring-2 ring-sky-200/80 shadow-xs'
                          : 'border-sky-100'
                      }`}
                    >
                      <div
                        className="relative aspect-3/2 bg-sky-50 cursor-pointer overflow-hidden"
                        onClick={() => onOpenLightbox(photo)}
                      >
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
                          <span className="bg-stone-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                          {photo.isSelected && (
                            <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                              Terpilih
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-white flex items-center justify-between">
                        <div className="min-w-0 pr-1">
                          <p className="text-xs font-bold text-stone-800 truncate">
                            {photo.filename}
                          </p>
                          <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded font-medium">
                            {photo.category || 'Foto'}
                          </span>
                        </div>

                        <button
                          onClick={() => onOpenComments(photo)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            photo.commentCount > 0
                              ? 'bg-amber-100 text-amber-900 font-bold hover:bg-amber-200'
                              : 'bg-sky-50 text-stone-500 hover:bg-sky-100/70'
                          }`}
                          title="Buka Komentar"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{photo.commentCount || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dedicated Selected Files Column (4 cols) */}
            <div className="lg:col-span-4 sticky top-24">
              <SelectedFilesColumn
                selectedPhotos={selectedPhotos}
                packageLimit={activeSession.packageLimit}
                onPhotoClick={(p) => onOpenLightbox(p)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Upload Photos Modal */}
      {activeSession && (
        <PhotoUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          session={activeSession}
          currentPhotoCount={photos.length}
          onPhotosUploaded={onPhotosUploaded}
        />
      )}

      {/* Create New Session Modal */}
      {isNewSessionModalOpen && (
        <CreateSessionModal
          isOpen={isNewSessionModalOpen}
          onClose={() => setIsNewSessionModalOpen(false)}
          onSubmit={handleCreateNewSession}
          newClientName={newClientName}
          setNewClientName={setNewClientName}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newPackageLimit={newPackageLimit}
          setNewPackageLimit={setNewPackageLimit}
          newSessionGroup={newSessionGroup}
          setNewSessionGroup={setNewSessionGroup}
          customGroupInput={customGroupInput}
          setCustomGroupInput={setCustomGroupInput}
          isCreating={isCreating}
        />
      )}
    </div>
  );
};

// Subcomponent for Creating a Session with Kelompok Sesi
interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newClientName: string;
  setNewClientName: (v: string) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newPackageLimit: number;
  setNewPackageLimit: (v: number) => void;
  newSessionGroup: string;
  setNewSessionGroup: (v: string) => void;
  customGroupInput: string;
  setCustomGroupInput: (v: string) => void;
  isCreating: boolean;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newClientName,
  setNewClientName,
  newTitle,
  setNewTitle,
  newPackageLimit,
  setNewPackageLimit,
  newSessionGroup,
  setNewSessionGroup,
  customGroupInput,
  setCustomGroupInput,
  isCreating,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#F8FBFE] rounded-3xl max-w-lg w-full border border-sky-100 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900 mb-1">
          Buat Sesi Foto Baru
        </h3>
        <p className="text-xs text-stone-500 mb-5">
          Tentukan kelompok sesi, nama klien, dan kuota foto untuk galeri pemilihan baru.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Kelompok Sesi Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-500" />
              <span>Kelompok Sesi Foto:</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DEFAULT_SESSION_GROUPS.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => {
                    setNewSessionGroup(grp);
                    setCustomGroupInput('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    newSessionGroup === grp && !customGroupInput
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white hover:bg-sky-100/70 text-stone-700 border border-sky-200'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customGroupInput}
              onChange={(e) => setCustomGroupInput(e.target.value)}
              placeholder="Atau ketik nama kelompok lain (misal: Dokumentasi Gathering)..."
              className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nama Klien / Pasangan:
            </label>
            <input
              type="text"
              required
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Contoh: Sarah & Kevin"
              className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Judul Sesi Foto:
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Contoh: Wedding & Resepsi Sarah - Kevin"
              className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Batas Kuota Foto yang Boleh Dipilih:
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={newPackageLimit}
              onChange={(e) => setNewPackageLimit(Number(e.target.value))}
              className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 font-bold"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Klien tidak akan bisa memilih lebih dari kuota ini.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCreating || !newClientName.trim() || !newTitle.trim()}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs"
            >
              {isCreating ? 'Menyimpan...' : 'Simpan & Buat Sesi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
