import React, { useState } from 'react';
import {
  Image as ImageIcon,
  FolderTree,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Edit3,
  Trash2,
  Calendar,
  Sparkles,
  Upload,
  User,
  X,
  CheckCircle,
  FileText,
  Video,
  ExternalLink
} from 'lucide-react';
import { PortfolioItem, Student, StudentClass, User as UserType, FileType } from '../types/index.ts';

interface PortfolioViewProps {
  portfolioItems: PortfolioItem[];
  students: Student[];
  currentUser: UserType;
  onCreatePortfolio: (item: Partial<PortfolioItem>) => Promise<void>;
  onUpdatePortfolio: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  onDeletePortfolio: (id: string) => Promise<void>;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolioItems,
  students,
  currentUser,
  onCreatePortfolio,
  onUpdatePortfolio,
  onDeletePortfolio,
}) => {
  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  // Gallery Filters
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('Semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('Semua');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);

  // Upload / Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    studentId: students[0]?.id || '',
    class: 'Kelompok B2',
    fileType: 'image',
    theme: 'Lingkunganku',
    date: new Date().toISOString().split('T')[0],
    month: 'Oktober',
    semester: 'Semester 1',
    teacherNote: '',
    fileUrl: '',
  });
  const [uploading, setUploading] = useState(false);

  // Current parent's student if parent
  const parentStudent = currentUser.studentId
    ? students.find(s => s.id === currentUser.studentId)
    : students[0];

  // Enforce Privacy: Parents only see their own child's artwork
  let displayedItems = [...portfolioItems];
  if (!isTeacher) {
    displayedItems = displayedItems.filter(p => p.studentId === currentUser.studentId);
  } else {
    // Teacher filters
    if (selectedClass !== 'Semua') {
      displayedItems = displayedItems.filter(p => p.class === selectedClass);
    }
    if (selectedStudentId !== 'Semua') {
      displayedItems = displayedItems.filter(p => p.studentId === selectedStudentId);
    }
  }

  // Type filter
  if (selectedType !== 'Semua') {
    displayedItems = displayedItems.filter(p => p.fileType === selectedType);
  }

  // Theme filter
  if (selectedTheme !== 'Semua') {
    displayedItems = displayedItems.filter(p => p.theme.toLowerCase() === selectedTheme.toLowerCase());
  }

  // Month filter
  if (selectedMonth !== 'Semua') {
    displayedItems = displayedItems.filter(p => p.month === selectedMonth);
  }

  // Search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedItems = displayedItems.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.studentName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.theme.toLowerCase().includes(q)
    );
  }

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        fileUrl: dataUri,
        fileType: file.type.startsWith('video') ? 'video' : file.type.includes('pdf') ? 'document' : 'image',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      studentId: students[0]?.id || '',
      class: 'Kelompok B2',
      fileType: 'image',
      theme: 'Lingkunganku',
      date: new Date().toISOString().split('T')[0],
      month: 'Oktober',
      semester: 'Semester 1',
      teacherNote: '',
      fileUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PortfolioItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      studentId: item.studentId,
      studentName: item.studentName,
      class: item.class,
      fileType: item.fileType,
      theme: item.theme,
      date: item.date,
      month: item.month,
      semester: item.semester,
      teacherNote: item.teacherNote,
      fileUrl: item.fileUrl,
    });
    setIsModalOpen(true);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.studentId) return;

    setUploading(true);
    const targetStudent = students.find(s => s.id === formData.studentId);

    try {
      const payload: Partial<PortfolioItem> = {
        ...formData,
        studentName: targetStudent?.name || formData.studentName || 'Siswa TK',
        class: targetStudent?.class || formData.class || 'Kelompok B2',
        fileUrl: formData.fileUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
      };

      if (editingId) {
        await onUpdatePortfolio(editingId, payload);
      } else {
        await onCreatePortfolio(payload);
      }
      setIsModalOpen(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="cartoon-card p-6 bg-gradient-to-r from-pink-50/90 via-rose-50/50 to-white border-pink-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-black mb-2">
              <span>🎨</span>
              <span>DOKUMENTASI KARYA & ASESMEN AUTENTIK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Portofolio Karya Anak
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Galeri dokumentasi gambar, mewarnai, kolase, dan proyek kreatif anak TK DWP Kedanyang yang dilengkapi catatan apresiasi perkembangan dari guru.
            </p>
          </div>

          {/* Teacher Upload Button */}
          {isTeacher && (
            <button
              onClick={handleOpenAddModal}
              className="cartoon-button-primary py-2.5 px-4 text-xs flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Karya Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cartoon-card p-4 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Media type tabs: Semua, Foto, Video, Dokumen */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'Semua', label: 'Semua Koleksi' },
            { id: 'image', label: '🖼️ Foto Karya' },
            { id: 'video', label: '🎥 Video' },
            { id: 'document', label: '📄 Dokumen' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedType === t.id
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter (Guru only) */}
          {isTeacher && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 font-bold bg-slate-50 focus:bg-white text-xs"
            >
              <option value="Semua">Semua Kelas</option>
              <option value="Kelompok A">Kelompok A</option>
              <option value="Kelompok B1">Kelompok B1</option>
              <option value="Kelompok B2">Kelompok B2</option>
              <option value="Kelompok B3">Kelompok B3</option>
            </select>
          )}

          {/* Student Filter (Guru only) */}
          {isTeacher && (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 font-bold bg-slate-50 focus:bg-white text-xs max-w-[150px] truncate"
            >
              <option value="Semua">Semua Siswa</option>
              {students.map((s, idx) => (
                <option key={s.id} value={s.id}>{s.name || `Siswa ${idx + 1} (${s.studentNumber})`}</option>
              ))}
            </select>
          )}

          {/* Search bar */}
          <div className="relative flex-1 min-w-[160px]">
            <input
              type="text"
              placeholder="Cari karya, tema, atau judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {displayedItems.length === 0 ? (
        <div className="cartoon-card p-12 text-center text-slate-500">
          <div className="text-4xl mb-2">🎨</div>
          <h4 className="font-extrabold text-slate-700 text-sm">Belum Ada Karya Anak</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isTeacher 
              ? 'Mulai dokumentasikan hasil gambar, kolase, atau proyek karya ananda melalui tombol "Unggah Karya Baru".'
              : 'Belum ada dokumentasi karya ananda yang diunggah oleh guru kelas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="cartoon-card overflow-hidden flex flex-col justify-between border-slate-200 hover:border-pink-300 transition-all group"
            >
              <div>
                {/* Media Image / Thumbnail */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={item.fileUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Class Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow text-[10px] font-black text-slate-800">
                    {item.class}
                  </div>

                  {/* Media Type Icon */}
                  <div className="absolute top-3 right-3 bg-pink-500 text-white p-1.5 rounded-full shadow text-xs">
                    {item.fileType === 'video' ? <Video className="w-3.5 h-3.5" /> : item.fileType === 'document' ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  </div>

                  {/* Preview Trigger */}
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Rincian</span>
                  </button>
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                    <span>{item.studentName}</span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 font-display line-clamp-1 group-hover:text-pink-600 transition-colors">
                    {item.title}
                  </h3>

                  <div className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Tema: {item.theme}
                  </div>

                  {/* Teacher Note Box */}
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                    <span className="font-extrabold block text-[10px] text-amber-700">
                      Catatan Guru:
                    </span>
                    <p className="mt-0.5 italic text-slate-700">"{item.teacherNote || item.description}"</p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <a
                    href={item.fileUrl}
                    download={`Karya_${item.studentName}_${item.title}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Unduh Karya"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {isTeacher && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Karya"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Hapus dokumentasi karya anak ini?')) {
                            await onDeletePortfolio(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Karya"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-4 border-pink-200 max-h-[90vh] overflow-y-auto relative text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-black">
                {previewItem.class}
              </span>
              <span className="text-slate-400">• TK DWP KEDANYANG</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              {previewItem.title}
            </h2>
            <div className="text-xs text-slate-600 mt-1 mb-4 flex items-center gap-3">
              <span>Siswa: <strong className="text-slate-900">{previewItem.studentName}</strong></span>
              <span>•</span>
              <span>Tanggal: <strong>{previewItem.date}</strong></span>
              <span>•</span>
              <span>Tema: <strong>{previewItem.theme}</strong></span>
            </div>

            {/* High-res Image / Media View */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96 w-full flex items-center justify-center bg-slate-100 mb-4 shadow-inner">
              <img
                src={previewItem.fileUrl}
                alt={previewItem.title}
                className="max-h-96 w-auto object-contain"
              />
            </div>

            {/* Description */}
            {previewItem.description && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
                <span className="font-extrabold text-slate-700 block mb-1">Deskripsi Kegiatan:</span>
                <p className="text-slate-600 leading-relaxed">{previewItem.description}</p>
              </div>
            )}

            {/* Teacher Assessment Note */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 mb-4">
              <span className="font-black text-amber-900 text-xs block mb-1 flex items-center gap-1.5">
                <span>👩‍🏫</span>
                <span>Catatan Perkembangan & Apresiasi Guru:</span>
              </span>
              <p className="text-amber-950 font-medium leading-relaxed italic">
                "{previewItem.teacherNote}"
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <a
                href={previewItem.fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="cartoon-button-primary py-2 px-4 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Karya</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* UPLOAD / EDIT MODAL (GURU ONLY) */}
      {isModalOpen && isTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-pink-200 max-h-[85vh] overflow-y-auto relative text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 font-display mb-1">
              {editingId ? 'Edit Karya Anak' : 'Unggah Karya Anak Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lengkapi informasi portofolio dan catatan apresiasi perkembangan anak.
            </p>

            <form onSubmit={handleSavePortfolio} className="space-y-3.5">
              
              {/* File upload */}
              <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-dashed border-pink-300">
                <label className="font-extrabold text-pink-900 block mb-1">
                  Pilih Foto Karya / Media:
                </label>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload}
                  className="file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-pink-600 file:text-white file:font-bold cursor-pointer"
                />
                {formData.fileUrl && (
                  <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Media berhasil dipilih</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Judul Karya:
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Menggambar Rumah & Taman Ceria"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Select Student */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Pilih Siswa:
                </label>
                <select
                  required
                  value={formData.studentId || ''}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {students.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {s.name || `Siswa ${idx + 1} (${s.studentNumber})`} ({s.class})
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Tema:
                  </label>
                  <input
                    type="text"
                    value={formData.theme || ''}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="Contoh: Lingkunganku"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Tanggal:
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Deskripsi Karya:
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan karya atau aktivitas eksplorasi anak..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Teacher Assessment Note */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Catatan Guru (Apresiasi & Perkembangan Anak):
                </label>
                <textarea
                  rows={3}
                  value={formData.teacherNote || ''}
                  onChange={(e) => setFormData({ ...formData, teacherNote: e.target.value })}
                  placeholder="Contoh: Ananda mampu mengekspresikan ide dengan mandiri dan memadukan warna cerah..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="cartoon-button-primary py-2 px-4 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{uploading ? 'Menyimpan...' : 'Simpan Karya'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
