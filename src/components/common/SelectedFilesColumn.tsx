import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Photo } from '../../types';

interface SelectedFilesColumnProps {
  selectedPhotos: Photo[];
  packageLimit: number;
  onRemovePhoto?: (photo: Photo) => void;
  onPhotoClick?: (photo: Photo) => void;
  isCompact?: boolean;
}

export const SelectedFilesColumn: React.FC<SelectedFilesColumnProps> = ({
  selectedPhotos,
  packageLimit,
  onRemovePhoto,
  onPhotoClick,
  isCompact = false,
}) => {
  const [copiedType, setCopiedType] = useState<'comma' | 'newline' | null>(null);

  const filenamesComma = selectedPhotos.map((p) => p.filename).join(', ');
  const filenamesNewline = selectedPhotos.map((p) => p.filename).join('\n');

  const handleCopy = (type: 'comma' | 'newline') => {
    if (selectedPhotos.length === 0) return;
    const text = type === 'comma' ? filenamesComma : filenamesNewline;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadTxt = () => {
    if (selectedPhotos.length === 0) return;
    const element = document.createElement('a');
    const file = new Blob([filenamesNewline], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `daftar_foto_terpilih_${selectedPhotos.length}_foto.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header Panel */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-sky-50 via-blue-50/50 to-white border-b border-sky-100">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
                Daftar File Terpilih
              </h3>
              <p className="text-[11px] text-sky-700 font-medium">Kolom Nama File Siap Edit</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
            {selectedPhotos.length} / {packageLimit}
          </span>
        </div>

        {/* Mini progress indicator */}
        <div className="w-full h-2 bg-sky-100/70 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (selectedPhotos.length / packageLimit) * 100)}%` }}
          />
        </div>
      </div>

      {/* Action Bar (Copy & Download) */}
      <div className="p-3 bg-sky-50/40 border-b border-sky-100/80 flex flex-wrap gap-2">
        <button
          onClick={() => handleCopy('comma')}
          disabled={selectedPhotos.length === 0}
          className="flex-1 py-1.5 px-2.5 bg-white hover:bg-sky-50 disabled:opacity-40 text-sky-900 text-[11px] font-semibold rounded-xl border border-sky-200/90 shadow-xs flex items-center justify-center gap-1.5 transition-all"
          title="Format: foto1.jpg, foto2.jpg (Untuk Lightroom)"
        >
          {copiedType === 'comma' ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-sky-600" />
          )}
          <span>{copiedType === 'comma' ? 'Tersalin!' : 'Salin (Koma)'}</span>
        </button>

        <button
          onClick={() => handleCopy('newline')}
          disabled={selectedPhotos.length === 0}
          className="py-1.5 px-2.5 bg-white hover:bg-sky-50 disabled:opacity-40 text-stone-700 text-[11px] font-medium rounded-xl border border-sky-200/90 shadow-xs flex items-center justify-center gap-1.5 transition-all"
          title="Format: 1 baris per nama file"
        >
          {copiedType === 'newline' ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-stone-500" />
          )}
          <span>{copiedType === 'newline' ? 'Tersalin!' : 'Salin (Baris)'}</span>
        </button>

        <button
          onClick={handleDownloadTxt}
          disabled={selectedPhotos.length === 0}
          className="py-1.5 px-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-[11px] font-medium rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all"
          title="Download file .txt"
        >
          <Download className="w-3.5 h-3.5" />
          <span>.TXT</span>
        </button>
      </div>

      {/* File List Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[500px]">
        {selectedPhotos.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center mx-auto mb-2">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-stone-700">Belum Ada Foto Dipilih</p>
            <p className="text-[11px] text-stone-500 mt-1 max-w-[200px] mx-auto">
              Klik tombol hati pada foto untuk memasukkan nama filenya ke kolom ini.
            </p>
          </div>
        ) : (
          selectedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="group p-2 bg-sky-50/30 hover:bg-sky-100/40 rounded-2xl border border-sky-100/80 flex items-center justify-between gap-2.5 transition-all"
            >
              <div
                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                onClick={() => onPhotoClick && onPhotoClick(photo)}
              >
                <span className="w-5 h-5 rounded-md bg-white border border-sky-200 text-sky-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-sky-200"
                />

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900 truncate">
                    {photo.filename}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-sky-700 bg-sky-100/80 px-1.5 py-0.2 rounded font-medium">
                      {photo.category || 'Foto'}
                    </span>
                    {photo.commentCount > 0 && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                        💬 {photo.commentCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {onRemovePhoto && (
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                  title="Hapus dari daftar pilihan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      {selectedPhotos.length > 0 && (
        <div className="p-3 bg-stone-50 border-t border-sky-100 text-[11px] text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sky-700 font-medium">
            <Sparkles className="w-3 h-3 text-sky-500" />
            Tersinkron Real-time
          </span>
          <span className="font-semibold text-stone-700">{selectedPhotos.length} item</span>
        </div>
      )}
    </div>
  );
};
