import React, { useState } from 'react';
import {
  X,
  Camera,
  Phone,
  Mail,
  Sparkles,
  CheckCircle2,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StudioProfile } from '../../types';
import { auth, loginWithGoogle } from '../../lib/firebase';
import { saveStudioProfile } from '../../services/photoService';

interface StudioAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudio: StudioProfile | null;
  onProfileUpdated: (profile: StudioProfile) => void;
}

export const StudioAuthModal: React.FC<StudioAuthModalProps> = ({
  isOpen,
  onClose,
  currentStudio,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'phone'>('gmail');
  const [studioName, setStudioName] = useState(currentStudio?.studioName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentStudio?.phoneNumber || '');
  const [ownerName, setOwnerName] = useState(currentStudio?.ownerName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(
    auth.currentUser?.email || currentStudio?.email || null
  );

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      const user = await loginWithGoogle();
      if (user) {
        setGoogleUserEmail(user.email);
        if (user.displayName && !ownerName) {
          setOwnerName(user.displayName);
        }
        if (!studioName) {
          setStudioName(`${user.displayName || 'Kreatif'} Studio`);
        }
      }
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioName.trim() || !phoneNumber.trim()) {
      alert('Mohon isi Nama Studio dan Nomor Telepon.');
      return;
    }

    setIsSubmitting(true);
    const uid = auth.currentUser?.uid || currentStudio?.uid || `studio-${Date.now()}`;
    const newProfile: StudioProfile = {
      uid,
      studioName: studioName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: googleUserEmail || auth.currentUser?.email || 'studio@aurapastel.id',
      ownerName: ownerName.trim() || 'Fotografer',
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveStudioProfile(newProfile);
      onProfileUpdated(newProfile);
      onClose();
    } catch (err) {
      console.error('Failed to save studio profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#F8FBFE] rounded-3xl max-w-md w-full border border-sky-100 shadow-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Soft pastel blue ambient glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-sky-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-md shadow-sky-200">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100/70 px-2.5 py-0.5 rounded-full">
              Fotografer & Studio
            </span>
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900 mt-0.5">
              Profil Studio Foto
            </h3>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex bg-sky-100/60 p-1 rounded-2xl mb-5 text-xs font-semibold text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'gmail'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-rose-500" />
            <span>Login Gmail</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'phone'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Nomor Telepon</span>
          </button>
        </div>

        {/* Tab 1: Gmail Authentication Section */}
        {activeTab === 'gmail' && (
          <div className="mb-5 p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Akun Google / Gmail</span>
                <span className="text-[11px] text-stone-500">
                  {googleUserEmail ? `Terhubung: ${googleUserEmail}` : 'Belum masuk dengan Gmail'}
                </span>
              </div>
              {googleUserEmail && (
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleUserEmail ? 'Ganti Akun Google' : 'Masuk dengan Akun Google'}</span>
            </button>
          </div>
        )}

        {/* Profile Details Form (Nama Studio & Nomor Telpon) */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Nama Studio Foto:</span>
            </label>
            <input
              type="text"
              required
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              placeholder="Contoh: Kroma Studio / Aura Visuals"
              className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-stone-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Nomor Telepon / WhatsApp:</span>
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-stone-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>Nama Fotografer / Pemilik:</span>
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Contoh: Rian Pratama"
              className="w-full bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-stone-400"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !studioName.trim() || !phoneNumber.trim()}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <span>Menyimpan Profil...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simpan & Aktifkan Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
