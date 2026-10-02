import React from 'react';
import {
  BookOpen,
  Bot,
  CalendarCheck2,
  Image as ImageIcon,
  MessageSquareHeart,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  School,
  Heart,
  Star,
  Smile,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Share2,
  MessageCircle,
  QrCode
} from 'lucide-react';
import { User, Material, AttendanceRecord, PortfolioItem, Comment } from '../types/index.ts';

interface HomeDashboardProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
  onOpenShare?: () => void;
  materials: Material[];
  attendanceRecords: AttendanceRecord[];
  portfolioItems: PortfolioItem[];
  comments: Comment[];
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenShare,
  materials,
  attendanceRecords,
  portfolioItems,
  comments,
}) => {
  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === today);
  const presentCount = todayAttendance.filter(r => r.status === 'Hadir').length;
  const activeMaterialsCount = materials.filter(m => m.status === 'Aktif').length;
  const unreadComments = comments.filter(c => !c.isRead).length;

  const menuCards = [
    {
      id: 'materi',
      title: '12 Materi Pembelajaran',
      subtitle: 'Modul interaktif, lembar kerja anak, dan QR Code terhubung',
      icon: BookOpen,
      iconEmoji: '📚',
      gradient: 'from-amber-400 to-orange-500',
      badge: `${activeMaterialsCount} Aktif / 12 Slot`,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      tag: 'Kurikulum Merdeka PAUD',
      statLabel: 'Total Slot',
      statValue: '12 Slot',
    },
    {
      id: 'ai',
      title: 'Tanya SAKIRA AI',
      subtitle: 'Sahabat Kreatif dan Cerdas Ramah Anak berbasi Gemini AI & Modul Sekolah',
      icon: Bot,
      iconEmoji: '🤖',
      gradient: 'from-purple-500 to-indigo-600',
      badge: 'Cerdas & Terhubung',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      tag: 'Knowledge Base TK DWP',
      statLabel: 'Asisten AI',
      statValue: 'Online ✨',
    },
    {
      id: 'presensi',
      title: 'Presensi Siswa',
      subtitle: 'Pencatatan kehadiran harian santun, rekap bulanan, dan ekspor data',
      icon: CalendarCheck2,
      iconEmoji: '📝',
      gradient: 'from-emerald-400 to-teal-600',
      badge: todayAttendance.length > 0 ? `${presentCount} Hadir Hari Ini` : 'Pencatatan Hari Ini',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      tag: 'Kelompok A & B1-B3',
      statLabel: 'Kehadiran Hari Ini',
      statValue: `${presentCount} Anak`,
    },
    {
      id: 'karya',
      title: 'Portofolio Karya Anak',
      subtitle: 'Galeri dokumentasi gambar, kolase, mewarnai, dan catatan apresiasi guru',
      icon: ImageIcon,
      iconEmoji: '🎨',
      gradient: 'from-pink-400 to-rose-500',
      badge: `${portfolioItems.length} Karya Tersimpan`,
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
      tag: 'Dokumentasi Autentik',
      statLabel: 'Total Karya',
      statValue: `${portfolioItems.length} Koleksi`,
    },
    {
      id: 'umpan-balik',
      title: 'Komentar Orang Tua',
      subtitle: 'Ruang komunikasi umpan balik pembelajaran anak yang hangat dan privat',
      icon: MessageSquareHeart,
      iconEmoji: '💬',
      gradient: 'from-rose-400 to-red-500',
      badge: isTeacher && unreadComments > 0 ? `${unreadComments} Belum Dibaca` : 'Privasi Terjamin',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      tag: 'Kemitraan Guru & Wali',
      statLabel: 'Umpan Balik',
      statValue: `${comments.length} Catatan`,
    },
    {
      id: 'dashboard-guru',
      title: 'Dashboard Guru',
      subtitle: 'Pusat manajemen data siswa, slot materi, asesmen, dan pengaturan sekolah',
      icon: LayoutDashboard,
      iconEmoji: '👩‍🏫',
      gradient: 'from-sky-400 to-blue-600',
      badge: isTeacher ? 'Akses Penuh Admin' : 'Khusus Guru/Admin',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      tag: 'Pengelolaan Terpadu',
      statLabel: 'Role Anda',
      statValue: isTeacher ? 'Pendidik' : 'Wali Murid',
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Hero Banner with 3D Cartoon Kindergarten Vibe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-300 via-orange-400 to-pink-400 p-6 sm:p-10 shadow-xl border-4 border-amber-200/80 text-white">
        
        {/* Playful Floating Background Shapes */}
        <div className="absolute top-3 right-6 text-5xl opacity-40 animate-bounce select-none">🌈</div>
        <div className="absolute bottom-4 right-20 text-4xl opacity-40 animate-pulse select-none">⭐</div>
        <div className="absolute top-10 left-1/3 text-4xl opacity-30 select-none">☁️</div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* School Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 font-extrabold text-xs shadow-md mb-4 border border-white">
            <School className="w-4 h-4 text-orange-500" />
            <span>TK DWP KEDANYANG</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span className="text-amber-700 italic">"Growing with Knowledge"</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-white drop-shadow-sm leading-tight">
            SAKIRA DIGITAL 🎒
          </h1>

          <p className="text-base sm:text-xl font-bold text-amber-100 mt-1 drop-shadow-sm">
            Saku Kreatif Interaktif Ramah Anak
          </p>

          <div className="mt-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 shadow-lg border-2 border-white/60">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🌈</span>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-900 font-display">
                  "Halo, Sahabat SAKIRA! Mari belajar, berkarya, dan tumbuh bersama."
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Selamat datang di platform digital terpadu TK DWP Kedanyang. Jelajahi 12 materi pembelajaran, konsultasi cerdas bersama SAKIRA AI, presensi siswa ceria, dan galeri karya putra-putri tercinta.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/25 backdrop-blur-sm text-xs font-bold flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-200" />
              <span>Usia Emas 5–6 Tahun</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/25 backdrop-blur-sm text-xs font-bold flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-200" />
              <span>Kemitraan Guru & Orang Tua</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/25 backdrop-blur-sm text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>Didukung SAKIRA AI Pintar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Notice & Greeting */}
      <div className="cartoon-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-50/80 via-white to-sky-50/80 border-amber-200">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
            {isTeacher ? '👩‍🏫' : '👨‍👩‍👧'}
          </div>
          <div>
            <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
              {isTeacher ? 'Mode Guru / Administrator' : 'Mode Orang Tua Murid'}
            </div>
            <div className="text-base font-extrabold text-slate-900">
              {currentUser.name} {currentUser.studentId && <span className="text-xs text-slate-500 font-normal">(Wali Siswa)</span>}
            </div>
            <div className="text-xs text-slate-500">
              {isTeacher 
                ? 'Anda memiliki hak akses penuh untuk mengelola materi, presensi, portofolio, dan membalas komentar.'
                : 'Data portofolio, presensi, dan umpan balik tersaring khusus untuk ananda tercinta demi keamanan & privasi.'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('ai')}
          className="cartoon-button-primary px-4 py-2.5 text-xs flex items-center gap-2 shrink-0"
        >
          <Bot className="w-4 h-4" />
          <span>Tanya SAKIRA AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main 6 Menu Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Menu Utama SAKIRA
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            Pilih Layanan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="cartoon-card p-6 cursor-pointer group flex flex-col justify-between hover:border-amber-300 transition-all relative overflow-hidden"
              >
                {/* Decorative background circle */}
                <div className={`absolute -right-6 -bottom-6 w-28 h-28 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full group-hover:scale-125 transition-transform duration-300`}></div>

                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center text-2xl shadow-md transform group-hover:rotate-6 transition-transform`}>
                      <span>{card.iconEmoji}</span>
                    </div>

                    <span className={`cartoon-badge ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Tag */}
                  <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                    {card.tag}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-display group-hover:text-amber-600 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{card.statLabel}</span>
                    <span className="font-extrabold text-slate-800">{card.statValue}</span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                    <span>Buka</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share to WhatsApp & Parents Paguyuban Card */}
      {onOpenShare && (
        <div className="cartoon-card p-6 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 text-white shadow-lg border-2 border-orange-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center text-2xl shadow shrink-0">
                📲
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-1 backdrop-blur-xs">
                  <span>✨</span>
                  <span>Mudah Dibagikan</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-display text-white">
                  Bagikan Website SAKIRA ke Paguyuban Kelas
                </h3>
                <p className="text-xs text-orange-100 mt-0.5 max-w-xl">
                  Ajak Ayah & Bunda lainnya membuka materi belajar, presensi harian, portofolio karya anak, dan konsultasi AI dengan sekali klik via WhatsApp atau scan QR Code.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenShare}
              className="py-3 px-5 rounded-2xl bg-white hover:bg-orange-50 text-orange-600 font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-orange-600" />
              <span>Buka Menu Bagikan (WA & QR)</span>
            </button>
          </div>
        </div>
      )}

      {/* Inspirational Early Childhood Tip Card */}
      <div className="cartoon-card p-6 bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border-teal-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center text-3xl shadow shrink-0">
            🌱
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-teal-200 text-teal-900 px-2 py-0.5 rounded-md">
                Pesan Edukasi Hari Ini
              </span>
              <span className="text-xs text-slate-400">• TK DWP Kedanyang</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900">
              "Bermain adalah pekerjaan utama anak usia dini. Lewat bermain, anak membangun kecerdasan, empati, dan karakter mulia."
            </h4>
            <p className="text-xs text-slate-600">
              Dukung kemandirian ananda dengan memberikan apresiasi tulus pada setiap usaha kecil yang dilakukannya hari ini.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
