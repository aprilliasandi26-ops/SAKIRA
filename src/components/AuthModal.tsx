import React from 'react';
import { X, ShieldCheck, Heart, User, CheckCircle2, Sparkles, School } from 'lucide-react';
import { User as UserType } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  allUsers: UserType[];
  onSelectUser: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const teachers = allUsers.filter(u => u.role === 'admin' || u.role === 'teacher');
  const parents = allUsers.filter(u => u.role === 'parent');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner stars */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-200 to-transparent rounded-bl-full -z-0 opacity-60"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-sky-200 to-transparent rounded-tr-full -z-0 opacity-60"></div>

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-2xl shadow-md">
              🎒
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 font-display">
                Pilih Akun & Hak Akses
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Simulasi role Guru (Akses Penuh) & Orang Tua (Privasi Anak)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Guru / Admin Section */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Akun Guru & Admin (Akses Penuh)
              </h4>
            </div>

            <div className="space-y-2">
              {teachers.map((u) => {
                const isSelected = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shadow">
                        👩‍🏫
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          {u.name}
                          {isSelected && (
                            <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {u.email} • {u.role === 'admin' ? 'Kepala Sekolah / Admin' : 'Guru Kelas'}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orang Tua Section */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                <Heart className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Akun Orang Tua Murid (Data Anak Terisolasi)
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 mb-2 italic">
              🔒 Privasi terjamin: Orang tua hanya melihat materi, karya, dan umpan balik anaknya sendiri.
            </p>

            <div className="space-y-2">
              {parents.map((u) => {
                const isSelected = currentUser.id === u.id;
                let childDesc = 'Siswa TK';
                if (u.id === 'user-parent-1') childDesc = 'Wali dari: Muhammad Rizky Pratama (Kelompok B2)';
                if (u.id === 'user-parent-2') childDesc = 'Wali dari: Aisyah Putri Azzahra (Kelompok B1)';
                if (u.id === 'user-parent-3') childDesc = 'Wali dari: Kenzo Al-Ghifari (Kelompok A)';
                if (u.id === 'user-parent-4') childDesc = 'Wali dari: Nabila Khairunisa (Kelompok B3)';

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold flex items-center justify-center shadow">
                        👨‍👩‍👧
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          {u.name}
                          {isSelected && (
                            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700">
                          {childDesc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
            <span className="text-2xl">🌈</span>
            <div className="text-xs text-amber-900">
              <span className="font-extrabold">TK DWP KEDANYANG: </span>
              Sistem autentikasi dan otorisasi tersinkronisasi langsung dengan database server.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
