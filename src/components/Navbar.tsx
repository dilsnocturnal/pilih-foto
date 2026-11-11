import React, { useState, useEffect } from 'react';
import {
  Camera,
  Eye,
  Shield,
  User,
  Phone,
  Building2,
  Share2,
  Sparkles,
  LogOut,
  LogIn,
} from 'lucide-react';
import { UserRole, Session, StudioProfile } from '../types';
import { auth, logoutUser } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeSession: Session | null;
  onGoHome: () => void;
  onOpenCodeModal: () => void;
  onOpenStudioModal: () => void;
  studioProfile: StudioProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeSession,
  onGoHome,
  onOpenCodeModal,
  onOpenStudioModal,
  studioProfile,
}) => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F0F7FD]/90 backdrop-blur-md border-b border-sky-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Studio Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="group flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-300 to-blue-400 p-[2px] shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Playfair_Display',serif] text-xl font-bold tracking-tight text-stone-900 block leading-tight">
                  Pilih<span className="text-sky-500 font-semibold">Fotomu</span>
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-sky-700 tracking-wide block truncate max-w-[160px] sm:max-w-xs">
                {studioProfile?.studioName || 'Studio Pemilihan Foto Klien'}
              </span>
            </div>
          </button>

          {/* Real-time Firebase Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/70 border border-sky-200/60 text-sky-900 text-xs font-semibold ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span>Real-Time Firebase</span>
          </div>
        </div>

        {/* Center/Right Nav Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Session badge */}
          {activeSession && (
            <div className="hidden md:flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-xl border border-sky-100 text-xs text-stone-700 shadow-2xs">
              <span className="font-semibold truncate max-w-[140px]">{activeSession.title}</span>
              <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                {activeSession.selectedCount}/{activeSession.packageLimit} Foto
              </span>
            </div>
          )}

          {/* Role Switcher Pills (Pastel Blue) */}
          <div className="bg-sky-100/60 p-1 rounded-2xl flex items-center shadow-inner border border-sky-200/50">
            <button
              onClick={() => onRoleChange('client')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                currentRole === 'client'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-sky-500" />
              <span>Klien</span>
            </button>
            <button
              onClick={() => onRoleChange('photographer')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                currentRole === 'photographer'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-100" />
              <span>Fotografer</span>
            </button>
          </div>

          {/* Studio Profile Trigger (Gmail & Phone & Studio Name) */}
          <button
            onClick={onOpenStudioModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-900 bg-white hover:bg-sky-50 border border-sky-200/80 rounded-xl transition-all shadow-xs"
            title="Pengaturan Studio & Login"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">
              {studioProfile?.studioName ? studioProfile.studioName : 'Profil Studio'}
            </span>
          </button>

          {/* Quick Access Code for Clients */}
          <button
            onClick={onOpenCodeModal}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white rounded-xl border border-sky-100 transition-colors"
          >
            <span>Kode PIN</span>
          </button>

          {/* Logout if logged in with Google */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
