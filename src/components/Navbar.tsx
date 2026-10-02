import React, { useState } from 'react';
import {
  BookOpen,
  Bot,
  CalendarCheck2,
  Image as ImageIcon,
  MessageSquareHeart,
  LayoutDashboard,
  Home,
  UserCheck,
  Sparkles,
  Menu,
  X,
  School,
  Share2
} from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenShare: () => void;
  unreadCommentsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenShare,
  unreadCommentsCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home, color: 'text-amber-500' },
    { id: 'materi', label: '12 Materi', icon: BookOpen, color: 'text-sky-500' },
    { id: 'ai', label: 'SAKIRA AI', icon: Bot, color: 'text-purple-500', badge: 'AI' },
    { id: 'presensi', label: 'Presensi', icon: CalendarCheck2, color: 'text-emerald-500' },
    { id: 'karya', label: 'Karya Anak', icon: ImageIcon, color: 'text-pink-500' },
    {
      id: 'umpan-balik',
      label: 'Umpan Balik',
      icon: MessageSquareHeart,
      color: 'text-rose-500',
      count: isTeacher ? unreadCommentsCount : undefined
    },
    ...(isTeacher
      ? [{ id: 'dashboard-guru', label: 'Dashboard Guru', icon: LayoutDashboard, color: 'text-indigo-500' }]
      : []),
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-100 shadow-sm">
      {/* Top cheerful bar */}
      <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-sky-400 h-1.5 w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & School Identity */}
          <div 
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md flex items-center justify-center transform group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                <span className="text-2xl animate-pulse">🎒</span>
              </div>
              <div className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
                TK
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 font-display">
                  SAKIRA <span className="text-orange-500">DIGITAL</span>
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200 hidden sm:inline-block">
                  DWP
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <School className="w-3 h-3 text-orange-400" />
                <span className="font-semibold text-slate-600">TK DWP KEDANYANG</span>
                <span className="text-slate-300">•</span>
                <span className="italic text-amber-600 hidden md:inline">"Growing with Knowledge"</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-50 text-slate-900 shadow-sm border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.2 rounded-full font-black border border-purple-200">
                      {item.badge}
                    </span>
                  )}

                  {item.count && item.count > 0 ? (
                    <span className="bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {item.count}
                    </span>
                  ) : null}

                  {isActive && (
                    <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Role Badge & Switcher & Share */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Bagikan Website Button */}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl shadow-sm hover:shadow transition-all text-xs font-black cursor-pointer active:scale-95"
              title="Bagikan Website SAKIRA DIGITAL via WhatsApp, QR Code & Link"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl hover:border-amber-300 shadow-sm hover:shadow transition-all text-left"
              title="Klik untuk mengganti akun / role"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                {isTeacher ? '👩‍🏫' : '👨‍👩‍👧'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-black text-slate-800 line-clamp-1 max-w-[190px]" title={currentUser.name}>
                  {currentUser.name}
                </div>
                <div className="text-[10px] flex items-center gap-1 font-bold">
                  <span className={isTeacher ? 'text-indigo-600' : 'text-emerald-600'}>
                    {isTeacher ? 'Guru / Admin' : 'Orang Tua Murid'}
                  </span>
                  <span className="text-[9px] bg-white px-1.5 py-0.5 rounded-md text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 transition-colors">
                    Ganti
                  </span>
                </div>
              </div>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-lg px-4 pt-2 pb-5 space-y-1 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="p-3 mb-2 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 font-bold">Pengguna Aktif:</p>
              <p className="text-sm font-black text-slate-800">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{isTeacher ? 'Akses: Guru / Admin' : 'Akses: Orang Tua'}</p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-xl shadow-sm"
            >
              Ganti Akun
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-left transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                  <span className="truncate">{item.label}</span>
                  {item.count && item.count > 0 ? (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenShare();
            }}
            className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan Website SAKIRA (WhatsApp & QR)</span>
          </button>
        </div>
      )}
    </header>
  );
};
