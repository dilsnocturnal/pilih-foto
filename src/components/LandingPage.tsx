import React from 'react';
import {
  Camera,
  Heart,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Sliders,
  Eye,
  KeyRound,
  FileText,
  Building2,
  Phone,
  Share2,
} from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onEnterGallery: (role: UserRole, sessionId?: string) => void;
  onOpenCodeModal: () => void;
  onOpenStudioModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterGallery,
  onOpenCodeModal,
  onOpenStudioModal,
}) => {
  return (
    <div className="overflow-hidden bg-[#F3F8FD]">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Soft pastel blue ambient glow blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10">
          <div className="absolute -top-10 left-1/4 w-96 h-96 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute top-40 left-1/2 w-80 h-80 rounded-full bg-cyan-100/60 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Pastel badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs sm:text-sm font-semibold shadow-2xs">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Platform Pemilihan Foto Klien Real-Time & Simple</span>
          </div>

          {/* Headline */}
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.15]">
            Upload Foto, Kirim Link, <br className="hidden sm:inline" />
            <span className="italic font-normal text-sky-500">Klien Memilih</span> Secara{' '}
            <span className="bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              Real-time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-stone-600 text-sm sm:text-base sm:leading-relaxed font-normal">
            Fotografer upload foto, kirim link ke klien, dan pantau pilihan klien secara instan di dashboard.
            Daftar nama file langsung tersusun rapi di kolom tersendiri siap di-copy ke Adobe Lightroom!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onEnterGallery('photographer')}
              className="w-full sm:w-auto px-7 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-2xl shadow-md shadow-sky-200 hover:shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-sky-100" />
              <span>Dashboard Fotografer & Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterGallery('client')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-sky-50 text-stone-800 border border-sky-200 font-semibold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>Buka Galeri Klien</span>
            </button>

            <button
              onClick={onOpenStudioModal}
              className="w-full sm:w-auto px-5 py-3.5 bg-sky-100/70 hover:bg-sky-200/70 text-sky-900 font-semibold text-xs sm:text-sm rounded-2xl border border-sky-200 transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Login & Atur Studio</span>
            </button>
          </div>
        </div>

        {/* Visual Live Interactive Preview Mockup Card (Pastel Blue) */}
        <div className="max-w-5xl mx-auto mt-14 sm:mt-16">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-sky-100 p-4 sm:p-6 shadow-2xl shadow-sky-100 ring-1 ring-sky-950/5">
            {/* Top Bar Window */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-sky-100 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-300" />
                <span className="w-3 h-3 rounded-full bg-amber-300" />
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span className="ml-2 font-semibold text-stone-800 hidden sm:inline">
                  PilihFotomu — Studio & Kelompok Sesi
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span>Real-Time Firebase Aktif</span>
              </div>
            </div>

            {/* Layout simulation: Left Photos + Right Dedicated Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
              {/* Photo 1 Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-sky-200 shadow-xs group bg-stone-50">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
                  alt="Sample 1"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-sky-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Heart className="w-3 h-3 fill-current" />
                  Terpilih
                </div>
                <div className="p-3 bg-white flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 truncate">DSC_0891_akad.jpg</span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    Akad
                  </span>
                </div>
              </div>

              {/* Photo 2 Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-sky-200 shadow-xs group bg-stone-50">
                <img
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80"
                  alt="Sample 2"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-sky-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Heart className="w-3 h-3 fill-current" />
                  Terpilih
                </div>
                <div className="p-3 bg-white flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 truncate">DSC_0928_portrait.jpg</span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    Portrait
                  </span>
                </div>
              </div>

              {/* Dedicated Files Column Simulation */}
              <div className="bg-sky-50/60 rounded-2xl p-3.5 border border-sky-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      Kolom Nama File Terpilih
                    </span>
                    <span className="bg-sky-200/70 text-sky-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      5 Foto
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center justify-between">
                      <span className="font-medium text-stone-800 truncate">DSC_0891_akad_ijab.jpg</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center justify-between">
                      <span className="font-medium text-stone-800 truncate">DSC_0904_cincin_detail.jpg</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center justify-between">
                      <span className="font-medium text-stone-800 truncate">DSC_0928_portrait.jpg</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => onEnterGallery('photographer')}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Buka Dashboard Fotografer →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 sm:py-20 bg-white border-y border-sky-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              Dirancang Simpel & Anak Muda
            </span>
            <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-4xl font-bold text-stone-900 mt-1">
              Semua Fitur Berfungsi dengan Sempurna
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              Fotografer kirim link, klien pilih santai di ponsel atau laptop, nama file langsung tersedia di kolom tersendiri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#F8FBFE] border border-sky-100 hover:border-sky-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Upload & Kirim Link</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Fotografer upload foto batch dari laptop/HP, lalu 1-klik salin link langsung untuk dikirim lewat WhatsApp ke klien.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#F8FBFE] border border-sky-100 hover:border-sky-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Terpantau Real-Time</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Setiap kali klien mengetuk hati atau memilih foto, hasilnya langsung terpantau di dashboard fotografer detik itu juga.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#F8FBFE] border border-sky-100 hover:border-sky-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Kolom File Tersendiri</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Daftar nama file langsung tersusun di kolom khusus dengan tombol 1-klik copy untuk Adobe Lightroom / Capture One.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#F8FBFE] border border-sky-100 hover:border-sky-300 transition-all hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Profil Studio & Phone</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Login mudah via Gmail dan nomor telpon, lengkapi nama studio foto Anda yang tampil profesional di galeri klien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-100 py-8 px-4 text-center text-xs text-stone-500">
        <p className="font-['Playfair_Display',serif] text-stone-900 text-sm font-bold mb-1">
          PilihFotomu — Pastel Blue Edition
        </p>
        <p>
          Platform Pemilihan Foto Digital Fotografer & Klien. Terintegrasi Firebase Real-time Firestore.
        </p>
      </footer>
    </div>
  );
};
