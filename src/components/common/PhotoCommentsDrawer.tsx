import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, Sparkles, User, ShieldCheck, Clock } from 'lucide-react';
import { Photo, Comment, UserRole } from '../../types';
import { subscribeComments, addPhotoComment } from '../../services/photoService';

interface PhotoCommentsDrawerProps {
  photo: Photo | null;
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  clientName: string;
  photographerName: string;
}

const QUICK_TAGS = [
  'Warna lebih hangat (warm)',
  'Retouching kulit natural',
  'Hapus objek/orang di latar',
  'Favorit cetak album utama',
  'Crop rasio 4:5 portrait',
];

export const PhotoCommentsDrawer: React.FC<PhotoCommentsDrawerProps> = ({
  photo,
  sessionId,
  isOpen,
  onClose,
  currentRole,
  clientName,
  photographerName,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!photo || !isOpen) return;
    const unsub = subscribeComments(sessionId, photo.id, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => unsub();
  }, [photo, sessionId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isOpen]);

  if (!isOpen || !photo) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    const author = currentRole === 'photographer' ? photographerName : `${clientName} (Klien)`;
    const role = currentRole === 'photographer' ? 'photographer' : 'client';

    try {
      await addPhotoComment(
        sessionId,
        photo.id,
        author,
        role,
        text,
        comments.length
      );
    } catch (err) {
      console.error('Error sending comment:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setInputText((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#F8FBFE] h-full shadow-2xl flex flex-col z-10 border-l border-sky-100 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-sky-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.filename}
              className="w-12 h-12 rounded-xl object-cover border border-sky-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-sm truncate max-w-[170px]">
                  {photo.filename}
                </span>
                {photo.isSelected && (
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Terpilih 💙
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Diskusi & Catatan Foto ({comments.length} komentar)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-sky-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800">Belum Ada Catatan</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-[260px] mx-auto">
                Tuliskan instruksi retouching, tone warna, atau cropping agar fotografer tahu preferensi Anda!
              </p>
            </div>
          ) : (
            comments.map((item) => {
              const isPhotographer = item.authorRole === 'photographer';
              const isSelf =
                (currentRole === 'photographer' && isPhotographer) ||
                (currentRole === 'client' && !isPhotographer);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {isPhotographer ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-md border border-sky-200">
                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                        {item.authorName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-md border border-blue-200">
                        <User className="w-3 h-3 text-blue-500" />
                        {item.authorName}
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isSelf
                        ? isPhotographer
                          ? 'bg-sky-600 text-white rounded-br-xs'
                          : 'bg-sky-500 text-white rounded-br-xs'
                        : 'bg-white text-stone-800 border border-sky-100 rounded-bl-xs'
                    }`}
                  >
                    {item.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Recommendation Tags */}
        <div className="px-4 py-2.5 bg-sky-50/70 border-t border-sky-100">
          <p className="text-[11px] font-bold text-sky-800 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" />
            Template catatan cepat:
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="shrink-0 text-[11px] bg-white hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-full px-2.5 py-1 font-medium transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-sky-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Tulis catatan sebagai ${
              currentRole === 'photographer' ? 'Fotografer' : 'Klien'
            }...`}
            className="flex-1 bg-sky-50/50 border border-sky-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 rounded-xl text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-40 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
