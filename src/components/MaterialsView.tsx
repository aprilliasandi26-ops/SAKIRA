import React, { useState } from 'react';
import {
  BookOpen,
  QrCode,
  ExternalLink,
  Edit3,
  Calendar,
  MessageSquare,
  Send,
  Upload,
  Sparkles,
  CheckCircle,
  Eye,
  Plus,
  RefreshCw,
  Video,
  FileText,
  Lock,
  X,
  Share2
} from 'lucide-react';
import { Material, Comment, User, Student } from '../types/index.ts';

interface MaterialsViewProps {
  materials: Material[];
  currentUser: User;
  students: Student[];
  comments: Comment[];
  onUpdateMaterial: (id: string, updates: Partial<Material>) => Promise<void>;
  onResetSlots: () => Promise<void>;
  onSubmitFeedback: (data: Partial<Comment>) => Promise<void>;
  onViewQr: (material: Material) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  currentUser,
  students,
  comments,
  onUpdateMaterial,
  onResetSlots,
  onSubmitFeedback,
  onViewQr,
}) => {
  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  // Detail Modal State
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Edit Modal State for Teacher
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editForm, setEditForm] = useState<Partial<Material>>({});
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  // Quick feedback state for card-level input
  const [cardFeedbackText, setCardFeedbackText] = useState<{ [materialId: string]: string }>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Get current user's student if parent
  const myStudent = currentUser.studentId
    ? students.find(s => s.id === currentUser.studentId)
    : students[0];

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setEditForm({
      title: material.title,
      description: material.description,
      materialUrl: material.materialUrl,
      videoUrl: material.videoUrl,
      activities: material.activities,
      date: material.date,
      status: material.status,
      coverUrl: material.coverUrl,
      qrCodeUrl: material.qrCodeUrl,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMaterial) return;
    await onUpdateMaterial(editingMaterial.id, editForm);
    setEditingMaterial(null);
  };

  // Handle Cover Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setEditForm(prev => ({ ...prev, coverUrl: dataUri }));
      setUploadingCover(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle QR Code Upload
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setEditForm(prev => ({ ...prev, qrCodeUrl: dataUri }));
      setUploadingQr(false);
    };
    reader.readAsDataURL(file);
  };

  // Quick feedback submit from material card
  const handleSendCardFeedback = async (material: Material) => {
    const text = cardFeedbackText[material.id];
    if (!text || !text.trim()) return;

    setSubmittingId(material.id);
    try {
      await onSubmitFeedback({
        materialId: material.id,
        materialTitle: material.title,
        studentId: myStudent?.id || 'student-1',
        studentName: myStudent?.name || 'Ananda TK',
        studentClass: myStudent?.class || 'Kelompok B2',
        parentId: currentUser.id,
        parentName: currentUser.name,
        comment: text,
      });

      setCardFeedbackText(prev => ({ ...prev, [material.id]: '' }));
      setFeedbackSuccess(material.id);
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } finally {
      setSubmittingId(null);
    }
  };

  // Preset themes generator for teacher convenience
  const handleFillKindergartenThemes = async () => {
    if (!confirm('Apakah Ibu Guru ingin mengisi 12 slot kosong dengan 12 tema Kurikulum Merdeka PAUD TK DWP Kedanyang?')) return;
    
    const themes = [
      { num: 1, title: 'Aku dan Diriku yang Istimewa', desc: 'Mengenal anggota tubuh, panca indera, nama diri, serta rasa syukur atas karunia Tuhan.', act: 'Menggambar bentuk wajah sendiri, meraba tekstur halus dan kasar, bernyanyi lagu Dua Mata Saya.' },
      { num: 2, title: 'Keluargaku yang Penuh Kasih', desc: 'Mengenal peran ayah, ibu, kakek, nenek, kakak, dan adik di rumah yang harmonis.', act: 'Menceritakan foto keluarga di depan kelas, membuat bingkai foto dari stik es krim warna-warni.' },
      { num: 3, title: 'Rumahku Surgaku Bersih dan Sehat', desc: 'Mengenal bagian-bagian rumah, perlengkapan makan, serta melatih kebiasaan merapikan mainan.', act: 'Membuat miniatur rumah dari balok kayu, melipat kertas origami bentuk atap rumah.' },
      { num: 4, title: 'Sekolahku TK DWP Kedanyang yang Ceria', desc: 'Mengenal guru, teman, ruangan kelas, tata tertib, dan halaman bermain ramah anak.', act: 'Piknik ceria di taman sekolah, tebak suara alat musik rebana dan marakas.' },
      { num: 5, title: 'Binatang Sahabat Ciptaan Tuhan', desc: 'Mengenal binatang peliharaan, hewan berkaki dua dan empat, serta suaranya.', act: 'Meniru gerakan kelinci melompat, kolase bulu domba dari kapas putih lembut.' },
      { num: 6, title: 'Tanaman dan Bunga di Sekitarku', desc: 'Mengenal pohon buah, bunga hias, sayur-mayur, serta cara menyiram tanaman.', act: 'Menanam biji kacang hijau di kapas basah, mencetak bentuk daun dengan cat air.' },
      { num: 7, title: 'Kendaraan di Darat, Laut, dan Udara', desc: 'Mengenal sepeda, mobil, perahu nelayan, kereta api, dan pesawat terbang.', act: 'Melipat origami perahu kertas diapungkan di air, permainan rambu lalu lintas.' },
      { num: 8, title: 'Alam Semesta: Siang, Malam, dan Cuaca', desc: 'Mengenal matahari, bulan, bintang, pelangi, awan mendung, dan hujan anugerah.', act: 'Mencampur warna cat pelangi, eksperimen sederhana hujan buatan dengan busa sabun.' },
      { num: 9, title: 'Negaraku Indonesia Tercinta', desc: 'Mengenal bendera Merah Putih, lagu kebangsaan, pakaian adat, dan budaya gotong royong.', act: 'Menyusun puzzle peta pulau Indonesia, mewarnai gambar garuda pancasila.' },
      { num: 10, title: 'Makanan Tradisional dan Sehat Bergizi', desc: 'Mengenal sayur, buah, susu, puding, dan kue tradisional khas Jawa Timur.', act: 'Membuat sate buah warna-warni bersama guru, membedakan rasa manis dan asin.' },
      { num: 11, title: 'Profesi dan Cita-citaku yang Mulia', desc: 'Mengenal dokter, guru, pemadam kebakaran, petani, koki, dan polisi sahabat anak.', act: 'Bermain peran (role-playing) dokter cilik memeriksa boneka beruang.' },
      { num: 12, title: 'Teknologi Sederhana dan Rekayasa Cilik', desc: 'Mengenal telepon, timbangan, jam dinding, kacamata, dan konsep sains bermain STEAM.', act: 'Membuat telepon sederhana dari gelas kertas dan benang kasur.' },
    ];

    for (const t of themes) {
      await onUpdateMaterial(`mat-${t.num}`, {
        title: `Materi ${t.num < 10 ? '0' + t.num : t.num}: ${t.title}`,
        description: t.desc,
        activities: t.act,
        status: 'Aktif',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 cartoon-card p-6 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white border-amber-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-2">
            <span>📚</span>
            <span>KURIKULUM MERDEKA PAUD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Jelajah 12 Materi Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Tersedia 12 slot pembelajaran terstruktur untuk anak usia dini TK DWP Kedanyang. Setiap materi dilengkapi cover kegiatan, kode QR interaktif, lembar aktivitas, dan ruang umpan balik orang tua.
          </p>
        </div>

        {/* Teacher controls */}
        {isTeacher && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleFillKindergartenThemes}
              className="cartoon-button-secondary py-2 px-3.5 text-xs flex items-center gap-1.5"
              title="Isi 12 slot dengan inspirasi tema Kurikulum Merdeka TK"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>Isi Inspirasi 12 Tema</span>
            </button>

            <button
              onClick={async () => {
                if (confirm('Reset ulang seluruh 12 slot materi menjadi slot kosong siap isi?')) {
                  await onResetSlots();
                }
              }}
              className="px-3 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kosongkan Slot</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of 12 Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((mat) => {
          const padNum = mat.number < 10 ? `0${mat.number}` : `${mat.number}`;
          const isConfigured = mat.title && !mat.title.includes('(Siap Diisi Guru)');
          
          // Relevant comments count for this material
          const materialComments = comments.filter(c => c.materialId === mat.id);
          const userComments = isTeacher
            ? materialComments
            : materialComments.filter(c => c.studentId === currentUser.studentId);

          return (
            <div
              key={mat.id}
              className={`cartoon-card overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                isConfigured ? 'border-amber-200' : 'border-dashed border-slate-300 bg-slate-50/60'
              }`}
            >
              <div>
                {/* Card Top: Cover Image or Placeholder */}
                <div className="relative h-48 w-full bg-gradient-to-br from-amber-100 via-orange-100 to-sky-100 overflow-hidden border-b-2 border-slate-100">
                  {mat.coverUrl ? (
                    <img
                      src={mat.coverUrl}
                      alt={mat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-inner flex items-center justify-center text-3xl mb-2">
                        📖
                      </div>
                      <span className="text-xs font-extrabold text-slate-500">
                        {isTeacher ? 'Belum Ada Cover Materi' : 'Materi Pembelajaran'}
                      </span>
                      {isTeacher && (
                        <button
                          onClick={() => handleOpenEdit(mat)}
                          className="mt-2 text-[11px] text-amber-700 font-bold underline flex items-center gap-1 hover:text-amber-800"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Cover</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Material Number Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                    <span className="text-xs font-black text-slate-800 font-display">
                      Materi {padNum}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-sm ${
                      mat.status === 'Aktif'
                        ? 'bg-emerald-500 text-white'
                        : mat.status === 'Selesai'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {mat.status}
                    </span>
                  </div>

                  {/* Teacher Quick Edit Button */}
                  {isTeacher && (
                    <button
                      onClick={() => handleOpenEdit(mat)}
                      className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-xl shadow-md border border-slate-200 transition-transform active:scale-95"
                      title="Edit materi ini"
                    >
                      <Edit3 className="w-4 h-4 text-orange-600" />
                    </button>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{mat.date || 'Tahun Ajaran 2026/2027'}</span>
                    <span>•</span>
                    <span className="text-orange-600 font-semibold">TK DWP Kedanyang</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 font-display line-clamp-1 mb-2">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {mat.description}
                  </p>

                  {/* Action Buttons: Lihat QR & Buka Materi & Bagikan ke WhatsApp */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <button
                      onClick={() => onViewQr(mat)}
                      className="cartoon-button-primary flex-1 py-2 px-2.5 text-xs flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Lihat QR</span>
                    </button>

                    <button
                      onClick={() => setSelectedMaterial(mat)}
                      className="cartoon-button-secondary flex-1 py-2 px-2.5 text-xs flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Buka</span>
                    </button>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `Assalamu'alaikum Ayah & Bunda TK DWP Kedanyang 🌈✨\n\nYuk buka lembar belajar ananda: *${mat.title}*\n👉 ${window.location.origin}?tab=materi\n\n"Growing with Knowledge" — TK DWP Kedanyang Gresik`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shrink-0 shadow-xs"
                      title="Bagikan materi ini ke WhatsApp Paguyuban"
                    >
                      <Share2 className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Feedback Section (Umpan Balik Orang Tua) */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-extrabold text-slate-700 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                        <span>Umpan Balik Orang Tua</span>
                      </span>
                      <span className="text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-200">
                        {userComments.length} Komentar
                      </span>
                    </div>

                    {/* Quick input field */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Tulis komentar/tanggapan ananda..."
                        value={cardFeedbackText[mat.id] || ''}
                        onChange={(e) => setCardFeedbackText({ ...cardFeedbackText, [mat.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendCardFeedback(mat);
                        }}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        onClick={() => handleSendCardFeedback(mat)}
                        disabled={submittingId === mat.id || !cardFeedbackText[mat.id]?.trim()}
                        className="p-2 cartoon-button-green shrink-0 disabled:opacity-50"
                        title="Kirim Komentar"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {feedbackSuccess === mat.id && (
                      <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Umpan balik berhasil dikirim ke guru!</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL: Buka Materi */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-4 border-amber-200 max-h-[85vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMaterial(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                MATERI {selectedMaterial.number < 10 ? `0${selectedMaterial.number}` : selectedMaterial.number}
              </span>
              <span className="text-xs text-slate-400">• TK DWP KEDANYANG</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 font-display">
              {selectedMaterial.title}
            </h2>

            {/* Cover image if available */}
            {selectedMaterial.coverUrl && (
              <div className="my-4 rounded-2xl overflow-hidden h-56 w-full border border-slate-200 shadow-sm">
                <img
                  src={selectedMaterial.coverUrl}
                  alt={selectedMaterial.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Deskripsi */}
            <div className="my-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">
                Deskripsi Materi:
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedMaterial.description}
              </p>
            </div>

            {/* Aktivitas Anak */}
            <div className="my-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
              <h4 className="text-xs font-black text-sky-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Petunjuk Aktivitas Anak (Sekolah & Rumah):</span>
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedMaterial.activities || 'Aktivitas eksplorasi anak bersama bimbingan guru dan orang tua.'}
              </p>
            </div>

            {/* Video / Tautan Tambahan */}
            {(selectedMaterial.materialUrl || selectedMaterial.videoUrl) && (
              <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Tautan & Media Materi:
                </h4>
                {selectedMaterial.materialUrl && (
                  <div className="flex items-center justify-between text-xs p-2 bg-white rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-600 truncate max-w-md">
                      🔗 {selectedMaterial.materialUrl}
                    </span>
                    <a
                      href={selectedMaterial.materialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      Buka Tautan <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {selectedMaterial.videoUrl && (
                  <div className="flex items-center justify-between text-xs p-2 bg-white rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-600 truncate max-w-md">
                      🎥 {selectedMaterial.videoUrl}
                    </span>
                    <a
                      href={selectedMaterial.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-600 font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      Tonton Video <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* QR Code Action in modal */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 my-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-xl shadow-sm text-sky-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Kode QR Pembelajaran</h4>
                  <p className="text-[11px] text-slate-500">Pindai kode QR untuk membuka di smartphone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const m = selectedMaterial;
                  setSelectedMaterial(null);
                  onViewQr(m);
                }}
                className="cartoon-button-primary py-2 px-3 text-xs"
              >
                Tampilkan QR
              </button>
            </div>

            {/* Riwayat Komentar & Feedback */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                <span>Umpan Balik Orang Tua untuk Materi Ini</span>
              </h3>

              {/* List comments for this material */}
              {(() => {
                const list = comments.filter(c => c.materialId === selectedMaterial.id);
                const displayList = isTeacher
                  ? list
                  : list.filter(c => c.studentId === currentUser.studentId);

                if (displayList.length === 0) {
                  return (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      Belum ada umpan balik yang diberikan untuk materi ini.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4">
                    {displayList.map(c => (
                      <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{c.parentName} (Wali {c.studentName})</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                          {c.comment}
                        </p>
                        {c.teacherReply && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                            <span className="font-extrabold block text-[10px] text-amber-700">
                              Balasan Guru ({c.teacherReplyBy || 'Guru'}):
                            </span>
                            <span>{c.teacherReply}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Direct Feedback Form inside modal */}
              <div className="space-y-2 mt-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Tuliskan Pengalaman / Umpan Balik Ananda:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Ananda sangat senang dan antusias mencoba..."
                    value={cardFeedbackText[selectedMaterial.id] || ''}
                    onChange={(e) => setCardFeedbackText({ ...cardFeedbackText, [selectedMaterial.id]: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    onClick={() => handleSendCardFeedback(selectedMaterial)}
                    disabled={!cardFeedbackText[selectedMaterial.id]?.trim()}
                    className="cartoon-button-green py-2.5 px-4 text-xs shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER EDIT MODAL: Mengedit Slot Materi */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-orange-200 max-h-[85vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingMaterial(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-orange-100 text-orange-600">
                <Edit3 className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-black text-slate-900 font-display">
                Kelola Slot Materi {editingMaterial.number < 10 ? `0${editingMaterial.number}` : editingMaterial.number}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Guru dapat mengunggah cover, qr code, serta memperbarui isi materi.
            </p>

            <div className="space-y-4 text-xs">
              
              {/* Judul Materi */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Judul Materi:
                </label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Contoh: Aku dan Tubuhku yang Istimewa"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400 font-bold"
                />
              </div>

              {/* Deskripsi Materi */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Deskripsi Singkat:
                </label>
                <textarea
                  rows={3}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Deskripsi tujuan pembelajaran anak usia dini..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Upload Cover */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <label className="font-extrabold text-slate-800 block mb-1">
                  🖼️ Upload Cover Materi:
                </label>
                <div className="flex items-center gap-3">
                  {editForm.coverUrl ? (
                    <img
                      src={editForm.coverUrl}
                      alt="Cover Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-amber-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-dashed border-amber-300 flex items-center justify-center text-slate-400 text-xl">
                      📷
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-white hover:file:bg-amber-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Mendukung JPG, PNG (Maks 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload QR Code */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
                <label className="font-extrabold text-slate-800 block mb-1">
                  🔍 Upload Kode QR (Opsional - Dibuat Otomatis jika kosong):
                </label>
                <div className="flex items-center gap-3">
                  {editForm.qrCodeUrl ? (
                    <img
                      src={editForm.qrCodeUrl}
                      alt="QR Preview"
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1 border border-sky-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-dashed border-sky-300 flex items-center justify-center text-slate-400 text-xl">
                      🔲
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-500 file:text-white hover:file:bg-sky-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Jika tidak diunggah, kode QR akan digenerate otomatis berdasarkan tautan materi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tautan URL Materi & Video */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    URL Materi / Lembar Kerja:
                  </label>
                  <input
                    type="url"
                    value={editForm.materialUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, materialUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    URL Video (Youtube/Drive):
                  </label>
                  <input
                    type="url"
                    value={editForm.videoUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                    placeholder="https://youtu.be/..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Aktivitas Anak */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Petunjuk Aktivitas Anak:
                </label>
                <textarea
                  rows={2}
                  value={editForm.activities || ''}
                  onChange={(e) => setEditForm({ ...editForm, activities: e.target.value })}
                  placeholder="Langkah kegiatan anak di sekolah dan pendampingan di rumah..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Status & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Status Materi:
                  </label>
                  <select
                    value={editForm.status || 'Aktif'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="Aktif">🟢 Aktif</option>
                    <option value="Draf">🟡 Draf</option>
                    <option value="Selesai">🔵 Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Tanggal Pembelajaran:
                  </label>
                  <input
                    type="date"
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="cartoon-button-primary py-2.5 px-5 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
