import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Send,
  CheckCheck,
  Reply,
  Trash2,
  Filter,
  User,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Comment, Material, Student, User as UserType } from '../types/index.ts';

interface CommentsViewProps {
  comments: Comment[];
  materials: Material[];
  students: Student[];
  currentUser: UserType;
  onSubmitFeedback: (data: Partial<Comment>) => Promise<void>;
  onMarkRead: (id: string) => Promise<void>;
  onReplyComment: (id: string, reply: string) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

export const CommentsView: React.FC<CommentsViewProps> = ({
  comments,
  materials,
  students,
  currentUser,
  onSubmitFeedback,
  onMarkRead,
  onReplyComment,
  onDeleteComment,
}) => {
  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  // Filters for Guru
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState<string>('Semua');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('Semua');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  // Parent New Feedback Form State
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || 'mat-1');
  const [commentText, setCommentText] = useState<string>('');
  const [childExperience, setChildExperience] = useState<string>('');
  const [childDifficulty, setChildDifficulty] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<boolean>(false);

  // Reply State for Guru
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Determine current parent's student
  const parentStudent = currentUser.studentId
    ? students.find(s => s.id === currentUser.studentId)
    : students[0];

  // Apply privacy filters
  let filteredComments = [...comments];

  if (!isTeacher) {
    // Parent strictly only sees their child's comments
    filteredComments = filteredComments.filter(c => c.studentId === currentUser.studentId);
  } else {
    // Teacher filters
    if (selectedMaterialFilter !== 'Semua') {
      filteredComments = filteredComments.filter(c => c.materialId === selectedMaterialFilter);
    }
    if (selectedStudentFilter !== 'Semua') {
      filteredComments = filteredComments.filter(c => c.studentId === selectedStudentFilter);
    }
    if (unreadOnly) {
      filteredComments = filteredComments.filter(c => !c.isRead);
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    const chosenMat = materials.find(m => m.id === selectedMaterialId);

    try {
      await onSubmitFeedback({
        materialId: selectedMaterialId,
        materialTitle: chosenMat?.title || 'Materi Pembelajaran',
        studentId: parentStudent?.id || 'student-1',
        studentName: parentStudent?.name || 'Ananda TK',
        studentClass: parentStudent?.class || 'Kelompok B2',
        parentId: currentUser.id,
        parentName: currentUser.name,
        comment: commentText,
        childExperience,
        childDifficulty,
        suggestion,
      });

      // Reset form
      setCommentText('');
      setChildExperience('');
      setChildDifficulty('');
      setSuggestion('');
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    await onReplyComment(commentId, replyText);
    setReplyingCommentId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="cartoon-card p-6 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-white border-rose-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black mb-2">
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-600" />
              <span>KEMITRAAN GURU & WALI MURID</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Umpan Balik Orang Tua
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Saluran komunikasi dua arah antara guru dan orang tua murid TK DWP Kedanyang. Ceritakan pengalaman belajar, respon ananda, dan saran terbaik Anda.
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-rose-200 shadow-sm shrink-0 flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <div className="text-xs font-black text-slate-800">Privasi Terjaga</div>
              <div className="text-[11px] text-slate-500">
                {isTeacher ? 'Guru melihat seluruh umpan balik' : 'Orang tua hanya melihat ananda sendiri'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PARENT VIEW: Submission Form + Their Child's Feedbacks */}
      {!isTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Feedback Form Card */}
          <div className="lg:col-span-1">
            <div className="cartoon-card p-5 border-rose-200 sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✍️</span>
                <h3 className="text-base font-black text-slate-900 font-display">
                  Tulis Umpan Balik Ananda
                </h3>
              </div>

              {parentStudent && (
                <div className="p-2.5 mb-4 bg-rose-50/60 rounded-xl border border-rose-200 text-xs text-rose-900">
                  <span className="font-bold">Ananda: </span>
                  <span className="font-extrabold">{parentStudent.name}</span> ({parentStudent.class})
                </div>
              )}

              {successBanner && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alhamdulillah, umpan balik berhasil dikirim ke Ibu Guru!</span>
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs">
                
                {/* Pilih Materi */}
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Pilih Materi Pembelajaran:
                  </label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        Materi {m.number < 10 ? `0${m.number}` : m.number}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Komentar Pokok */}
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Komentar / Catatan Utama <span className="text-rose-500">*</span>:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Contoh: Ananda sangat senang mengikuti kegiatan hari ini..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                {/* Pengalaman Belajar */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pengalaman anak saat belajar:
                  </label>
                  <input
                    type="text"
                    value={childExperience}
                    onChange={(e) => setChildExperience(e.target.value)}
                    placeholder="Contoh: Tertawa ceria saat mencoba..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                {/* Kesulitan Anak */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kesulitan yang dialami anak (jika ada):
                  </label>
                  <input
                    type="text"
                    value={childDifficulty}
                    onChange={(e) => setChildDifficulty(e.target.value)}
                    placeholder="Contoh: Masih butuh dibimbing saat..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                {/* Saran untuk Guru */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Saran / Harapan untuk Guru:
                  </label>
                  <input
                    type="text"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="Contoh: Mohon dipantau saat sesi..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="w-full cartoon-button-primary py-2.5 text-xs flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Mengirim...' : 'Kirim Umpan Balik'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* History of Feedbacks for Parent's Child */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
                <span>💬</span>
                <span>Riwayat Umpan Balik & Tanggapan Guru ({filteredComments.length})</span>
              </h3>
            </div>

            {filteredComments.length === 0 ? (
              <div className="cartoon-card p-10 text-center text-slate-500">
                <div className="text-4xl mb-2">🌸</div>
                <h4 className="font-extrabold text-slate-700 text-sm">Belum Ada Umpan Balik</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Silakan tuliskan tanggapan atau pengalaman belajar ananda pada formulir di samping.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((c) => (
                  <div key={c.id} className="cartoon-card p-5 border-slate-200 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black mr-2">
                          {c.materialTitle}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{c.studentName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                      <p className="font-bold text-slate-900">"{c.comment}"</p>
                      
                      {c.childExperience && (
                        <p className="text-slate-600">
                          <span className="font-bold text-slate-700">🌟 Pengalaman: </span>
                          {c.childExperience}
                        </p>
                      )}
                      {c.childDifficulty && (
                        <p className="text-slate-600">
                          <span className="font-bold text-slate-700">⚠️ Kesulitan: </span>
                          {c.childDifficulty}
                        </p>
                      )}
                      {c.suggestion && (
                        <p className="text-slate-600">
                          <span className="font-bold text-slate-700">💡 Saran: </span>
                          {c.suggestion}
                        </p>
                      )}
                    </div>

                    {/* Teacher Reply */}
                    {c.teacherReply ? (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                        <div className="flex items-center gap-1.5 font-black text-amber-800 mb-1">
                          <span>👩‍🏫</span>
                          <span>Tanggapan Guru ({c.teacherReplyBy || 'Guru Kelas'}):</span>
                        </div>
                        <p className="text-amber-950 font-medium leading-relaxed">
                          {c.teacherReply}
                        </p>
                        {c.teacherReplyAt && (
                          <div className="text-[10px] text-amber-600 mt-1">
                            Dibalas pada: {new Date(c.teacherReplyAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu ulasan dan tanggapan dari guru kelas.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEACHER VIEW: All Feedbacks with Filters & Quick Reply */}
      {isTeacher && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="cartoon-card p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-black text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-orange-500" />
                <span>Filter Umpan Balik:</span>
              </span>

              {/* Material Filter */}
              <select
                value={selectedMaterialFilter}
                onChange={(e) => setSelectedMaterialFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 font-bold bg-slate-50 focus:bg-white"
              >
                <option value="Semua">Semua Materi (1-12)</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>
                    Materi {m.number}: {m.title.slice(0, 24)}...
                  </option>
                ))}
              </select>

              {/* Student Filter */}
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 font-bold bg-slate-50 focus:bg-white"
              >
                <option value="Semua">Semua Siswa</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>

              {/* Unread toggle */}
              <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <span>Hanya Belum Dibaca</span>
              </label>
            </div>

            <div className="text-slate-500 font-semibold">
              Menampilkan <span className="font-extrabold text-slate-800">{filteredComments.length}</span> umpan balik
            </div>
          </div>

          {/* List of comments for Teacher */}
          {filteredComments.length === 0 ? (
            <div className="cartoon-card p-12 text-center text-slate-500">
              <div className="text-4xl mb-2">💬</div>
              <h4 className="font-extrabold text-slate-700">Tidak ada komentar sesuai filter</h4>
              <p className="text-xs text-slate-400 mt-1">
                Semua umpan balik orang tua telah tertangani atau belum ada yang dikirim.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComments.map((c) => (
                <div
                  key={c.id}
                  className={`cartoon-card p-5 transition-all ${
                    !c.isRead ? 'border-orange-300 bg-orange-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm">{c.studentName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          {c.studentClass}
                        </span>
                        {!c.isRead && (
                          <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                            BARU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Wali: <span className="font-semibold text-slate-700">{c.parentName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                        {c.materialTitle}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Main Comment Text */}
                  <div className="my-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                    <p className="font-extrabold text-slate-900">"{c.comment}"</p>
                    {c.childExperience && (
                      <p className="text-slate-600">
                        <span className="font-bold text-slate-700">🌟 Pengalaman: </span>
                        {c.childExperience}
                      </p>
                    )}
                    {c.childDifficulty && (
                      <p className="text-slate-600">
                        <span className="font-bold text-slate-700">⚠️ Kesulitan: </span>
                        {c.childDifficulty}
                      </p>
                    )}
                    {c.suggestion && (
                      <p className="text-slate-600">
                        <span className="font-bold text-slate-700">💡 Saran: </span>
                        {c.suggestion}
                      </p>
                    )}
                  </div>

                  {/* Existing Reply if any */}
                  {c.teacherReply && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs mb-3">
                      <span className="font-black text-amber-800 block text-[11px]">
                        Balasan Anda ({c.teacherReplyBy}):
                      </span>
                      <p className="text-amber-950 mt-0.5 font-medium">{c.teacherReply}</p>
                    </div>
                  )}

                  {/* Teacher Reply Input */}
                  {replyingCommentId === c.id ? (
                    <div className="mt-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                      <label className="font-bold text-indigo-900 block">
                        Tulis balasan untuk {c.parentName}:
                      </label>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Terima kasih Ibu/Bapak atas informasinya, besok kami dampingi di kelas..."
                        className="w-full p-2 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReplyingCommentId(null)}
                          className="px-3 py-1.5 rounded-lg text-slate-500 font-bold hover:bg-slate-100"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleSendReply(c.id)}
                          className="cartoon-button-primary py-1.5 px-3.5 text-xs flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Balasan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action Buttons */
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {!c.isRead && (
                          <button
                            onClick={() => onMarkRead(c.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Tandai Dibaca</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setReplyingCommentId(c.id);
                            setReplyText(c.teacherReply || '');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>{c.teacherReply ? 'Ubah Balasan' : 'Balas Komentar'}</span>
                        </button>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm('Hapus komentar ini?')) {
                            await onDeleteComment(c.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus komentar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
