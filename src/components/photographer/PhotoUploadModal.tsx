import React, { useState } from 'react';
import {
  X,
  Upload,
  Image,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Photo, Session } from '../../types';
import { uploadPhotosToSession } from '../../services/photoService';
import { compressImageFile } from '../../utils/imageCompressor';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  currentPhotoCount: number;
  onPhotosUploaded: (newPhotos: Photo[]) => void;
}

interface PendingUploadItem {
  id: string;
  filename: string;
  url: string;
  category: string;
}

const PRESET_STOCK_PHOTOS = [
  {
    filename: 'DSC_2011_candid_senyum.jpg',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    category: 'Candid',
  },
  {
    filename: 'DSC_2045_detail_dekorasi.jpg',
    url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80',
    category: 'Detail',
  },
  {
    filename: 'DSC_2090_portrait_outdoor.jpg',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
    category: 'Outdoor',
  },
  {
    filename: 'DSC_2115_pasangan_estetik.jpg',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
    category: 'Portrait',
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  session,
  currentPhotoCount,
  onPhotosUploaded,
}) => {
  const [pendingPhotos, setPendingPhotos] = useState<PendingUploadItem[]>([]);
  const [selectedDefaultCategory, setSelectedDefaultCategory] = useState('Portrait');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const fileList = Array.from(files);

    try {
      const results = await Promise.all(
        fileList.map((file) => compressImageFile(file, 1400, 0.78))
      );

      const newItems: PendingUploadItem[] = results.map((res, idx) => ({
        id: `upload-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        filename: res.filename,
        url: res.dataUrl,
        category: selectedDefaultCategory,
      }));

      setPendingPhotos((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error('Error compressing files:', err);
      alert('Gagal memproses beberapa file gambar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPresetStock = () => {
    const items: PendingUploadItem[] = PRESET_STOCK_PHOTOS.map((p, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      filename: p.filename,
      url: p.url,
      category: p.category,
    }));
    setPendingPhotos((prev) => [...prev, ...items]);
  };

  const handleRemovePending = (id: string) => {
    setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStartUpload = async () => {
    if (pendingPhotos.length === 0 || isUploading) return;
    setIsUploading(true);

    try {
      const uploaded = await uploadPhotosToSession(
        session.id,
        session.photographerUid,
        pendingPhotos.map((p) => ({
          filename: p.filename,
          url: p.url,
          category: p.category,
        })),
        currentPhotoCount
      );

      onPhotosUploaded(uploaded);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setPendingPhotos([]);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Terjadi kendala saat upload foto.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#F8FBFE] rounded-3xl max-w-xl w-full border border-sky-100 shadow-2xl p-6 sm:p-7 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-2.5 py-0.5 rounded-full">
              Sesi: {session.title}
            </span>
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900 mt-1">
              Upload Foto untuk Klien
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-sky-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* File dropzone / picker */}
          <div className="relative border-2 border-dashed border-sky-200 hover:border-sky-400 rounded-3xl p-6 text-center bg-white transition-all group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-3">
              {isProcessing ? (
                <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>
            <h4 className="text-sm font-bold text-stone-800">
              {isProcessing
                ? 'Mengompresi & Memproses Foto...'
                : 'Pilih Foto dari Perangkat / Drag & Drop'}
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Foto akan dioptimasi otomatis agar cepat dimuat di HP klien dan tersimpan mulus di cloud.
            </p>
          </div>

          {/* Quick preset batch or Category selection */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-sky-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-700">Kategori Foto:</span>
              <select
                value={selectedDefaultCategory}
                onChange={(e) => setSelectedDefaultCategory(e.target.value)}
                className="bg-sky-50 border border-sky-200 text-xs text-sky-900 rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none"
              >
                <option value="Portrait">Portrait</option>
                <option value="Candid">Candid</option>
                <option value="Akad">Akad</option>
                <option value="Resepsi">Resepsi</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Detail">Detail</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddPresetStock}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 bg-sky-50 hover:bg-sky-100/80 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>+ Tambah Contoh Foto Preset</span>
            </button>
          </div>

          {/* Pending items list */}
          {pendingPhotos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">
                  Foto Siap Diupload ({pendingPhotos.length}):
                </span>
                <button
                  type="button"
                  onClick={() => setPendingPhotos([])}
                  className="text-[11px] text-rose-500 hover:underline font-semibold"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                {pendingPhotos.map((item) => (
                  <div
                    key={item.id}
                    className="relative group bg-white rounded-xl overflow-hidden border border-sky-100 p-1.5 flex items-center gap-2"
                  >
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-stone-800 truncate">
                        {item.filename}
                      </p>
                      <span className="text-[9px] bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded font-medium">
                        {item.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePending(item.id)}
                      className="text-stone-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Berhasil mengupload foto ke sesi galeri!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-sky-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={isUploading || isProcessing || pendingPhotos.length === 0}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-sky-200 flex items-center gap-2 transition-all"
          >
            {isUploading ? (
              <span>Mengupload {pendingPhotos.length} Foto...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload {pendingPhotos.length} Foto ke Sesi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
