import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquareHeart,
  Image as ImageIcon,
  CalendarCheck2,
  Settings,
  Plus,
  Edit2,
  Trash2,
  School,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Heart,
  Bot
} from 'lucide-react';
import { Student, StudentClass, User, Material, Comment, AttendanceRecord, PortfolioItem } from '../types/index.ts';

interface TeacherDashboardProps {
  currentUser: User;
  students: Student[];
  materials: Material[];
  comments: Comment[];
  attendanceRecords: AttendanceRecord[];
  portfolioItems: PortfolioItem[];
  onNavigate: (tab: string) => void;
  onCreateStudent: (student: Partial<Student>) => Promise<void>;
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  students,
  materials,
  comments,
  attendanceRecords,
  portfolioItems,
  onNavigate,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'students' | 'settings'>('overview');

  // Student CRUD State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    name: '',
    class: 'Kelompok B2',
    studentNumber: '',
    parentName: '',
    status: 'Aktif',
    gender: 'L',
    birthDate: '',
  });

  const [filterClass, setFilterClass] = useState<string>('Semua');

  // Stats
  const totalStudents = students.length;
  const activeMaterials = materials.filter(m => m.status === 'Aktif').length;
  const unreadComments = comments.filter(c => !c.isRead).length;
  const totalPortfolios = portfolioItems.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === todayStr);
  const presentCount = todayAttendance.filter(r => r.status === 'Hadir').length;

  // Filter students (sorted alphabetically by name A-Z)
  const filteredStudents = (filterClass === 'Semua'
    ? [...students]
    : students.filter(s => s.class === filterClass)
  ).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));

  const handleOpenAddStudent = () => {
    setEditingStudentId(null);
    setStudentForm({
      name: '',
      class: 'Kelompok B2',
      studentNumber: `NIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      parentName: '',
      status: 'Aktif',
      gender: 'L',
      birthDate: '2020-01-01',
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (st: Student) => {
    setEditingStudentId(st.id);
    setStudentForm({ ...st });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.class) return;

    if (editingStudentId) {
      await onUpdateStudent(editingStudentId, studentForm);
    } else {
      await onCreateStudent(studentForm);
    }
    setIsStudentModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="cartoon-card p-6 bg-gradient-to-r from-sky-50/90 via-indigo-50/50 to-white border-sky-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
              <span>PUSAT KENDALI PENDIDIK & ADMINISTRATOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Dashboard Guru & Manajemen
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Kelola data peserta didik, 12 slot materi, tanggapan umpan balik wali murid, presensi harian, dan profil lembaga TK DWP Kedanyang.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeSection === 'overview'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Statistik
            </button>
            <button
              onClick={() => setActiveSection('students')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeSection === 'students'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👨‍👩‍👧 Data Siswa
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeSection === 'settings'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚙️ Pengaturan
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW SECTION: Summary cards & quick shortcuts */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          
          {/* Top 5 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* 1. Total Siswa */}
            <div
              onClick={() => setActiveSection('students')}
              className="cartoon-card p-4 border-emerald-200 bg-emerald-50/40 cursor-pointer hover:border-emerald-300 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-sm mx-auto mb-2">
                👦👧
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">Total Siswa</span>
              <span className="text-2xl font-black text-slate-900 font-display">{totalStudents}</span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Kelompok A & B</span>
            </div>

            {/* 2. Materi Aktif */}
            <div
              onClick={() => onNavigate('materi')}
              className="cartoon-card p-4 border-amber-200 bg-amber-50/40 cursor-pointer hover:border-amber-300 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm mx-auto mb-2">
                📚
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">Materi Aktif</span>
              <span className="text-2xl font-black text-slate-900 font-display">{activeMaterials}/12</span>
              <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">Modul Pembelajaran</span>
            </div>

            {/* 3. Komentar Orang Tua */}
            <div
              onClick={() => onNavigate('umpan-balik')}
              className="cartoon-card p-4 border-rose-200 bg-rose-50/40 cursor-pointer hover:border-rose-300 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg shadow-sm mx-auto mb-2">
                💬
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">Komentar Masuk</span>
              <span className="text-2xl font-black text-slate-900 font-display">{comments.length}</span>
              <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                {unreadComments > 0 ? `${unreadComments} Belum dibaca` : 'Semua terbaca'}
              </span>
            </div>

            {/* 4. Total Karya Anak */}
            <div
              onClick={() => onNavigate('karya')}
              className="cartoon-card p-4 border-pink-200 bg-pink-50/40 cursor-pointer hover:border-pink-300 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-lg shadow-sm mx-auto mb-2">
                🎨
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">Karya Anak</span>
              <span className="text-2xl font-black text-slate-900 font-display">{totalPortfolios}</span>
              <span className="text-[10px] text-pink-700 font-semibold block mt-0.5">Portofolio Tersimpan</span>
            </div>

            {/* 5. Presensi Hari Ini */}
            <div
              onClick={() => onNavigate('presensi')}
              className="cartoon-card p-4 border-sky-200 bg-sky-50/40 cursor-pointer hover:border-sky-300 transition-all text-center col-span-2 sm:col-span-1"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center text-lg shadow-sm mx-auto mb-2">
                📝
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">Hadir Hari Ini</span>
              <span className="text-2xl font-black text-slate-900 font-display">{presentCount}</span>
              <span className="text-[10px] text-sky-700 font-semibold block mt-0.5">
                {todayAttendance.length} siswa tercatat
              </span>
            </div>

          </div>

          {/* Quick Menu Launcher Grid */}
          <div>
            <h3 className="text-lg font-black text-slate-900 font-display mb-3 flex items-center gap-2">
              <span>🚀</span>
              <span>Pintasan Cepat Manajemen Guru</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              <div
                onClick={() => onNavigate('materi')}
                className="cartoon-card p-5 cursor-pointer hover:border-amber-300 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  📚
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">12 Materi Pembelajaran</h4>
                  <p className="text-slate-500 mt-0.5">Upload cover, QR code, tautan video & aktivitas.</p>
                </div>
              </div>

              <div
                onClick={() => onNavigate('umpan-balik')}
                className="cartoon-card p-5 cursor-pointer hover:border-rose-300 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  💬
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Umpan Balik Wali Murid</h4>
                  <p className="text-slate-500 mt-0.5">Baca respon ananda dan kirimkan balasan hangat.</p>
                </div>
              </div>

              <div
                onClick={() => onNavigate('ai')}
                className="cartoon-card p-5 cursor-pointer hover:border-purple-300 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🤖
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">SAKIRA AI & Knowledge Base</h4>
                  <p className="text-slate-500 mt-0.5">Konsultasi RPP PAUD & kelola dokumen sekolah.</p>
                </div>
              </div>

              <div
                onClick={() => onNavigate('presensi')}
                className="cartoon-card p-5 cursor-pointer hover:border-emerald-300 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  📝
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Presensi & Rekap Kehadiran</h4>
                  <p className="text-slate-500 mt-0.5">Input kehadiran, cetak laporan & export file Excel.</p>
                </div>
              </div>

              <div
                onClick={() => onNavigate('karya')}
                className="cartoon-card p-5 cursor-pointer hover:border-pink-300 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🎨
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Portofolio Karya Anak</h4>
                  <p className="text-slate-500 mt-0.5">Unggah dokumentasi gambar dan catatan asesmen.</p>
                </div>
              </div>

              <div
                onClick={() => setActiveSection('students')}
                className="cartoon-card p-5 cursor-pointer hover:border-sky-300 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  👨‍👩‍👧
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Data Siswa & Wali</h4>
                  <p className="text-slate-500 mt-0.5">Kelola data murid Kelompok A, B1, B2, B3.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* STUDENTS SECTION: Full CRUD Table */}
      {activeSection === 'students' && (
        <div className="space-y-4">
          
          <div className="cartoon-card p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-black text-slate-700">Filter Kelompok:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 font-bold bg-slate-50"
              >
                <option value="Semua">Semua Kelompok</option>
                <option value="Kelompok A">Kelompok A</option>
                <option value="Kelompok B1">Kelompok B1</option>
                <option value="Kelompok B2">Kelompok B2</option>
                <option value="Kelompok B3">Kelompok B3</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddStudent}
              className="cartoon-button-primary py-2 px-4 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>

          <div className="cartoon-card overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 w-12 text-center">No</th>
                    <th className="p-3.5">Nama Lengkap Siswa</th>
                    <th className="p-3.5">NIS</th>
                    <th className="p-3.5">Kelompok Kelas</th>
                    <th className="p-3.5">Orang Tua / Wali</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada data siswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3.5 font-extrabold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-xs">
                              {st.gender === 'P' ? '👧' : '👦'}
                            </span>
                            {st.name ? (
                              <span>{st.name}</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenEditStudent(st)}
                                className="text-amber-700 hover:text-amber-900 font-semibold italic flex items-center gap-1.5 text-left group"
                              >
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                <span>[Slot Siswa {idx + 1} - Klik untuk Mengisi Nama]</span>
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-300 group-hover:bg-amber-200">
                                  + Isi
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">{st.studentNumber}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-bold border border-sky-200">
                            {st.class}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium">
                          {st.parentName || <span className="text-slate-400 italic">Belum diisi</span>}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            {st.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditStudent(st)}
                              className="px-2.5 py-1 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1"
                              title="Isi / Edit Data Siswa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>{st.name ? 'Edit' : 'Isi Data'}</span>
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Hapus data slot siswa ${st.name || st.studentNumber}?`)) {
                                  await onDeleteStudent(st.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS SECTION: School Info & Policies */}
      {activeSection === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          <div className="cartoon-card p-6 border-slate-200 space-y-3">
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
              <School className="w-4 h-4 text-orange-500" />
              <span>Identitas Lembaga TK DWP Kedanyang</span>
            </h3>

            <div className="space-y-2 text-slate-700">
              <p><strong>Nama Sekolah:</strong> TK DWP KEDANYANG (Dharma Wanita Persatuan)</p>
              <p><strong>Kepala Sekolah:</strong> Sulatin Ruliati, S.Pd</p>
              <p><strong>Pendidik / Guru Kelas:</strong> Aprilia Arista Sandi, S.Pd</p>
              <p><strong>Slogan:</strong> "Growing with Knowledge"</p>
              <p><strong>NPSN:</strong> 20500124 (Terakreditasi A)</p>
              <p><strong>Alamat:</strong> Jl. Kedanyang No. 12, Kebomas, Kabupaten Gresik, Jawa Timur</p>
              <p><strong>Kelompok Usia:</strong> Kelompok A (4-5 th), Kelompok B (5-6 th)</p>
              <p><strong>Kurikulum:</strong> Kurikulum Merdeka PAUD Holistik Integratif</p>
            </div>
          </div>

          <div className="cartoon-card p-6 border-slate-200 space-y-3">
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Sistem SAKIRA DIGITAL</span>
            </h3>

            <div className="space-y-2 text-slate-700">
              <p><strong>Nama Aplikasi:</strong> SAKIRA DIGITAL (Saku Kreatif Interaktif Ramah Anak)</p>
              <p><strong>Model AI:</strong> Google Gemini 3.8 Flash (Server-Side Proxy)</p>
              <p><strong>Basis Data:</strong> Persistent JSON Storage (/data/sakira_db.json)</p>
              <p><strong>Keamanan & Privasi:</strong> Isolasi data orang tua siswa (RBAC)</p>
              <p><strong>Dukungan Perangkat:</strong> Web responsif desktop, tablet, dan smartphone</p>
            </div>
          </div>

        </div>
      )}

      {/* STUDENT ADD/EDIT MODAL */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-xs">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-sky-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-slate-900 font-display mb-1">
              {editingStudentId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lengkapi data peserta didik TK DWP Kedanyang.
            </p>

            <form onSubmit={handleSaveStudent} className="space-y-3">
              
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Nama Lengkap Siswa:
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.name || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Kelompok Kelas:
                  </label>
                  <select
                    value={studentForm.class || 'Kelompok B2'}
                    onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value as StudentClass })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="Kelompok A">Kelompok A</option>
                    <option value="Kelompok B1">Kelompok B1</option>
                    <option value="Kelompok B2">Kelompok B2</option>
                    <option value="Kelompok B3">Kelompok B3</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Jenis Kelamin:
                  </label>
                  <select
                    value={studentForm.gender || 'L'}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="L">Laki-laki (👦)</option>
                    <option value="P">Perempuan (👧)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Nomor Induk Siswa (NIS):
                </label>
                <input
                  type="text"
                  value={studentForm.studentNumber || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, studentNumber: e.target.value })}
                  placeholder="NIS-2026-xxx"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Nama Orang Tua / Wali:
                </label>
                <input
                  type="text"
                  value={studentForm.parentName || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                  placeholder="Nama Ibu / Bapak Wali Murid"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="cartoon-button-primary py-2 px-4 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Siswa</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
