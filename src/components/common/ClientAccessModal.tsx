import React, { useState } from 'react';
import { KeyRound, ArrowRight, X } from 'lucide-react';

interface ClientAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCode: (code: string) => void;
}

export const ClientAccessModal: React.FC<ClientAccessModalProps> = ({
  isOpen,
  onClose,
  onSubmitCode,
}) => {
  const [inputCode, setInputCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onSubmitCode(inputCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#F8FBFE] rounded-3xl max-w-sm w-full border border-sky-100 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-sky-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900 mb-1">
          Akses Galeri Klien
        </h3>
        <p className="text-xs text-stone-600 mb-4">
          Masukkan kode sesi atau PIN unik yang diberikan oleh fotografer Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Contoh: PIN 1234 atau Kode Sesi..."
              className="w-full bg-white border border-sky-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 font-medium tracking-wide placeholder:text-stone-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputCode.trim()}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Buka Galeri Foto</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
