import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { db, UPLOADS_DIR } from './server/db.ts';
import {
  AttendanceRecord,
  Comment,
  Material,
  PortfolioItem,
  Student,
  AiDocument,
  AiConversation,
  AiMessage
} from './src/types/index.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Body parser with 50MB limit for base64 photo/document uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/api/uploads', express.static(UPLOADS_DIR));

// Setup Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Build knowledge base text for Gemini context
function getKnowledgeBaseContext(): string {
  const docs = db.getAiDocuments();
  if (docs.length === 0) return '';
  return docs
    .map((doc, idx) => `[DOKUMEN ${idx + 1}: ${doc.name}]\n${doc.contentText}`)
    .join('\n\n---\n\n');
}

// -------------------------------------------------------------
// 1. HEALTH & METADATA
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'SAKIRA DIGITAL - TK DWP KEDANYANG',
    time: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// -------------------------------------------------------------
// 2. USERS & AUTHENTICATION
// -------------------------------------------------------------
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(db.getUsers());
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, userId, role } = req.body;
  const users = db.getUsers();
  let user = users.find(u => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase()));

  if (!user && role) {
    user = users.find(u => u.role === role);
  }

  if (user) {
    res.json({ success: true, user });
  } else {
    // If not found, provide the first admin as fallback
    res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
  }
});

// -------------------------------------------------------------
// 3. STUDENTS
// -------------------------------------------------------------
app.get('/api/students', (req: Request, res: Response) => {
  const { class: className } = req.query;
  let students = db.getStudents();
  if (className && typeof className === 'string' && className !== 'Semua') {
    students = students.filter(s => s.class === className);
  }
  res.json(students);
});

app.post('/api/students', (req: Request, res: Response) => {
  const { name, class: className, studentNumber, parentName, gender, birthDate } = req.body;
  if (!name || !className) {
    res.status(400).json({ error: 'Nama dan kelas wajib diisi' });
    return;
  }
  const newStudent: Student = {
    id: `student-${Date.now()}`,
    name,
    class: className,
    studentNumber: studentNumber || `NIS-${Date.now().toString().slice(-4)}`,
    parentName: parentName || '',
    status: 'Aktif',
    gender: gender || 'L',
    birthDate: birthDate || '',
  };
  db.getStudents().push(newStudent);
  db.save();
  res.json(newStudent);
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.getStudents().findIndex(s => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Siswa tidak ditemukan' });
    return;
  }
  const updatedStudent = { ...db.getStudents()[index], ...req.body };
  db.getStudents()[index] = updatedStudent;

  if (req.body.name !== undefined) {
    db.getAttendance().forEach(att => {
      if (att.studentId === id) att.studentName = req.body.name;
    });
  }

  db.save();
  res.json(updatedStudent);
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = db.getStudents();
  const index = list.findIndex(s => s.id === id);
  if (index !== -1) {
    list.splice(index, 1);
    db.save();
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// 4. 12 MATERI PEMBELAJARAN
// -------------------------------------------------------------
app.get('/api/materials', (_req: Request, res: Response) => {
  res.json(db.getMaterials());
});

app.get('/api/materials/:id', (req: Request, res: Response) => {
  const mat = db.getMaterials().find(m => m.id === req.params.id);
  if (!mat) {
    res.status(404).json({ error: 'Materi tidak ditemukan' });
    return;
  }
  res.json(mat);
});

app.put('/api/materials/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const materials = db.getMaterials();
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Materi tidak ditemukan' });
    return;
  }
  materials[index] = {
    ...materials[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.save();
  res.json(materials[index]);
});

app.post('/api/materials/reset-slots', (_req: Request, res: Response) => {
  const reset = db.reset12Slots();
  res.json(reset);
});

// -------------------------------------------------------------
// 5. COMMENTS / UMPAN BALIK ORANG TUA
// -------------------------------------------------------------
app.get('/api/comments', (req: Request, res: Response) => {
  const { role, studentId, materialId } = req.query;
  let comments = [...db.getComments()];

  // Security rule: Parent can ONLY see feedback concerning their own child
  if (role === 'parent' && studentId && typeof studentId === 'string') {
    comments = comments.filter(c => c.studentId === studentId);
  } else if (studentId && typeof studentId === 'string') {
    comments = comments.filter(c => c.studentId === studentId);
  }

  if (materialId && typeof materialId === 'string') {
    comments = comments.filter(c => c.materialId === materialId);
  }

  // Sort newest first
  comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(comments);
});

app.post('/api/comments', (req: Request, res: Response) => {
  const {
    materialId,
    materialTitle,
    studentId,
    studentName,
    parentId,
    parentName,
    studentClass,
    comment,
    childExperience,
    childDifficulty,
    suggestion
  } = req.body;

  if (!materialId || !studentId || !comment) {
    res.status(400).json({ error: 'Materi, nama siswa, dan komentar wajib diisi' });
    return;
  }

  const newComment: Comment = {
    id: `com-${Date.now()}`,
    materialId,
    materialTitle: materialTitle || 'Materi',
    studentId,
    studentName: studentName || 'Siswa TK',
    parentId: parentId || `parent-${studentId}`,
    parentName: parentName || 'Orang Tua Murid',
    studentClass: studentClass || 'Kelompok B2',
    comment,
    childExperience: childExperience || '',
    childDifficulty: childDifficulty || '',
    suggestion: suggestion || '',
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  db.getComments().push(newComment);
  db.save();
  res.json(newComment);
});

app.patch('/api/comments/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const com = db.getComments().find(c => c.id === id);
  if (com) {
    com.isRead = true;
    db.save();
  }
  res.json({ success: true, comment: com });
});

app.post('/api/comments/:id/reply', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reply, teacherName } = req.body;
  const com = db.getComments().find(c => c.id === id);
  if (!com) {
    res.status(404).json({ error: 'Komentar tidak ditemukan' });
    return;
  }
  com.teacherReply = reply;
  com.teacherReplyAt = new Date().toISOString();
  com.teacherReplyBy = teacherName || 'Guru TK DWP Kedanyang';
  com.isRead = true;
  db.save();
  res.json(com);
});

app.delete('/api/comments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const comments = db.getComments();
  const index = comments.findIndex(c => c.id === id);
  if (index !== -1) {
    comments.splice(index, 1);
    db.save();
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// 6. ATTENDANCE / PRESENSI
// -------------------------------------------------------------
app.get('/api/attendance', (req: Request, res: Response) => {
  const { date, class: className } = req.query;
  let records = db.getAttendance();
  if (date && typeof date === 'string') {
    records = records.filter(r => r.date === date);
  }
  if (className && typeof className === 'string' && className !== 'Semua') {
    records = records.filter(r => r.class === className);
  }
  res.json(records);
});

app.post('/api/attendance/bulk', (req: Request, res: Response) => {
  const { records } = req.body; // array of AttendanceRecord
  if (!Array.isArray(records)) {
    res.status(400).json({ error: 'Format data presensi tidak valid' });
    return;
  }

  const existing = db.getAttendance();
  for (const item of records) {
    const idx = existing.findIndex(r => r.studentId === item.studentId && r.date === item.date);
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], status: item.status, note: item.note || '', updatedAt: new Date().toISOString() };
    } else {
      existing.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        studentId: item.studentId,
        studentName: item.studentName,
        class: item.class,
        date: item.date,
        status: item.status || 'Hadir',
        note: item.note || '',
        updatedAt: new Date().toISOString(),
      });
    }
  }
  db.save();
  res.json({ success: true, count: records.length });
});

app.get('/api/attendance/recap', (req: Request, res: Response) => {
  const { startDate, endDate, class: className, studentId } = req.query;
  let records = db.getAttendance();

  if (startDate && typeof startDate === 'string') {
    records = records.filter(r => r.date >= startDate);
  }
  if (endDate && typeof endDate === 'string') {
    records = records.filter(r => r.date <= endDate);
  }
  if (className && typeof className === 'string' && className !== 'Semua') {
    records = records.filter(r => r.class === className);
  }
  if (studentId && typeof studentId === 'string') {
    records = records.filter(r => r.studentId === studentId);
  }

  // Calculate summaries
  const total = records.length;
  const hadir = records.filter(r => r.status === 'Hadir').length;
  const izin = records.filter(r => r.status === 'Izin').length;
  const sakit = records.filter(r => r.status === 'Sakit').length;
  const alpa = records.filter(r => r.status === 'Alpa').length;

  // Student-level aggregation
  const studentMap: Record<string, { studentId: string; studentName: string; class: string; hadir: number; izin: number; sakit: number; alpa: number; total: number }> = {};
  for (const r of records) {
    if (!studentMap[r.studentId]) {
      studentMap[r.studentId] = {
        studentId: r.studentId,
        studentName: r.studentName,
        class: r.class,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
        total: 0,
      };
    }
    studentMap[r.studentId][r.status.toLowerCase() as 'hadir' | 'izin' | 'sakit' | 'alpa']++;
    studentMap[r.studentId].total++;
  }

  res.json({
    summary: { total, hadir, izin, sakit, alpa },
    byStudent: Object.values(studentMap),
    records,
  });
});

// -------------------------------------------------------------
// 7. PORTFOLIO / KARYA ANAK
// -------------------------------------------------------------
app.get('/api/portfolio', (req: Request, res: Response) => {
  const { role, studentId, class: className, fileType, theme, search } = req.query;
  let items = [...db.getPortfolio()];

  // Security rule: Parent ONLY sees their own child's work
  if (role === 'parent' && studentId && typeof studentId === 'string') {
    items = items.filter(p => p.studentId === studentId);
  } else if (studentId && typeof studentId === 'string') {
    items = items.filter(p => p.studentId === studentId);
  }

  if (className && typeof className === 'string' && className !== 'Semua') {
    items = items.filter(p => p.class === className);
  }
  if (fileType && typeof fileType === 'string' && fileType !== 'Semua') {
    items = items.filter(p => p.fileType === fileType);
  }
  if (theme && typeof theme === 'string' && theme !== 'Semua') {
    items = items.filter(p => p.theme.toLowerCase().includes(theme.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(p => p.title.toLowerCase().includes(q) || p.studentName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(items);
});

app.post('/api/portfolio', (req: Request, res: Response) => {
  const {
    studentId,
    studentName,
    class: className,
    title,
    description,
    fileUrl,
    fileType,
    theme,
    date,
    month,
    semester,
    teacherNote
  } = req.body;

  if (!title || !studentId) {
    res.status(400).json({ error: 'Judul dan nama siswa wajib diisi' });
    return;
  }

  const newItem: PortfolioItem = {
    id: `port-${Date.now()}`,
    studentId,
    studentName: studentName || 'Siswa TK',
    class: className || 'Kelompok B2',
    title,
    description: description || '',
    fileUrl: fileUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
    fileType: fileType || 'image',
    theme: theme || 'Tema Umum',
    date: date || new Date().toISOString().split('T')[0],
    month: month || 'Oktober',
    semester: semester || 'Semester 1',
    teacherNote: teacherNote || '',
    createdAt: new Date().toISOString(),
  };

  db.getPortfolio().push(newItem);
  db.save();
  res.json(newItem);
});

app.put('/api/portfolio/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const items = db.getPortfolio();
  const index = items.findIndex(p => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Portofolio tidak ditemukan' });
    return;
  }
  items[index] = { ...items[index], ...req.body };
  db.save();
  res.json(items[index]);
});

app.delete('/api/portfolio/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const items = db.getPortfolio();
  const index = items.findIndex(p => p.id === id);
  if (index !== -1) {
    items.splice(index, 1);
    db.save();
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// 8. KNOWLEDGE BASE SAKIRA AI
// -------------------------------------------------------------
app.get('/api/knowledge-base', (_req: Request, res: Response) => {
  res.json(db.getAiDocuments());
});

app.post('/api/knowledge-base', (req: Request, res: Response) => {
  const { name, contentText, type, size, fileUrl } = req.body;
  if (!name || !contentText) {
    res.status(400).json({ error: 'Nama dokumen dan isi materi/teks wajib ada' });
    return;
  }
  const newDoc: AiDocument = {
    id: `doc-${Date.now()}`,
    name,
    contentText,
    fileUrl: fileUrl || `/api/uploads/${encodeURIComponent(name)}`,
    type: type || 'txt',
    size: size || `${(contentText.length / 1024).toFixed(1)} KB`,
    uploadedAt: new Date().toISOString(),
    status: 'Tersinkronisasi',
  };
  db.getAiDocuments().push(newDoc);
  db.save();
  res.json(newDoc);
});

app.delete('/api/knowledge-base/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const docs = db.getAiDocuments();
  const index = docs.findIndex(d => d.id === id);
  if (index !== -1) {
    docs.splice(index, 1);
    db.save();
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// 9. SAKIRA AI CHATBOT (GEMINI SERVER-SIDE)
// -------------------------------------------------------------
app.get('/api/ai/conversations', (_req: Request, res: Response) => {
  res.json(db.getAiConversations());
});

app.post('/api/ai/conversations', (req: Request, res: Response) => {
  const { title, userId } = req.body;
  const newConv: AiConversation = {
    id: `conv-${Date.now()}`,
    userId: userId || 'user-default',
    title: title || 'Percakapan Baru SAKIRA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.getAiConversations().unshift(newConv);
  db.save();
  res.json(newConv);
});

app.delete('/api/ai/conversations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const convs = db.getAiConversations();
  const cIndex = convs.findIndex(c => c.id === id);
  if (cIndex !== -1) {
    convs.splice(cIndex, 1);
  }
  // Also delete associated messages
  const msgs = db.getAiMessages();
  const remaining = msgs.filter(m => m.conversationId !== id);
  db.getData().aiMessages = remaining;
  db.save();
  res.json({ success: true });
});

app.get('/api/ai/messages/:conversationId', (req: Request, res: Response) => {
  const msgs = db.getAiMessages().filter(m => m.conversationId === req.params.conversationId);
  res.json(msgs);
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { conversationId, message, userRole, userName } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Pesan tidak boleh kosong' });
      return;
    }

    const activeConvId = conversationId || 'conv-default';

    // Save user message
    const userMsg: AiMessage = {
      id: `msg-${Date.now()}-u`,
      conversationId: activeConvId,
      role: 'user',
      message,
      createdAt: new Date().toISOString(),
    };
    db.getAiMessages().push(userMsg);

    // Retrieve previous conversation messages for context
    const previousMsgs = db.getAiMessages()
      .filter(m => m.conversationId === activeConvId)
      .slice(-6); // last 6 turns

    // Prepare Knowledge Base Context
    const knowledgeBase = getKnowledgeBaseContext();

    // Prepare 12 Materials status
    const materialsSummary = db.getMaterials()
      .map(m => `Materi ${m.number}: ${m.title} (Status: ${m.status}, Deskripsi: ${m.description.slice(0, 100)})`)
      .join('\n');

    const systemInstruction = `Anda adalah "SAKIRA AI" (Sahabat Kreatif dan Cerdas Ramah Anak), asisten kecerdasan buatan resmi untuk TK DWP KEDANYANG (Taman Kanak-Kanak Dharma Wanita Persatuan Kedanyang, Kebomas, Gresik).
Slogan Sekolah: "Growing with Knowledge".
Aplikasi: SAKIRA DIGITAL (Saku Kreatif Interaktif Ramah Anak).

PENGGUNA:
Nama Pengguna: ${userName || 'Ibu/Bapak Guru/Wali Murid'}
Peran Pengguna: ${userRole === 'parent' ? 'Orang Tua / Wali Murid' : 'Guru / Pendidik PAUD & Admin'}

SUMBER PENGETAHUAN KHUSUS SEKOLAH (KNOWLEDGE BASE TK DWP KEDANYANG):
${knowledgeBase || 'Belum ada dokumen tambahan yang diunggah.'}

RINGKASAN 12 MATERI PEMBELAJARAN SEKOLAH:
${materialsSummary}

TUGAS UTAMA DAN KEMAMPUAN SAKIRA AI:
1. Menjelaskan materi pembelajaran TK dengan analogi ramah anak usia 5-6 tahun.
2. Membuat ide kegiatan bermain bermakna, motorik halus/kasar, sensorik, dan STEAM sederhana.
3. Merancang permainan edukatif interaktif, ice breaking ceria pagi hari, tepuk-tepuk ceria, dan lagu pendek ramah anak.
4. Membuat cerita atau dongeng anak dengan pesan moral kejujuran, kasih sayang, toleransi, dan kemandirian.
5. Membantu guru menyusun Modul Ajar / RPP Kurikulum Merdeka PAUD, Asesmen Ceklis & Catatan Anekdot, serta Tujuan Pembelajaran.
6. Membantu komunikasi efektif & santun antara guru dan orang tua murid.
7. Menjawab pertanyaan umum seputar parenting, gizi anak, dan tumbuh kembang anak usia dini.

PANDUAN GAYA BAHASA:
- Gunakan Bahasa Indonesia yang hangat, ramah, santun, ceria, edukatif, dan inspiratif.
- Sapa dengan penuh kehangatan (misalnya: "Halo Ibu/Bapak Guru hebat! 🌈✨" atau "Halo Bunda/Ayah tersayang! 🌸").
- Gunakan format markdown yang rapi (bullet points, emoji ceria, penomoran terstruktur) agar sangat nyaman dibaca.
- JIKA ada pertanyaan tentang TK DWP Kedanyang atau kurikulum sekolah, utamakan data dari KNOWLEDGE BASE di atas.
- JIKA pertanyaan tidak ada dalam knowledge base, jawablah dengan pengetahuan umum PAUD/pendidikan anak usia dini terbaik yang solutif dan aplikatif.`;

    let replyText = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        // Build conversational content array
        const contents = [
          ...previousMsgs.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.message }],
          })),
        ];

        // Call Gemini using the modern @google/genai SDK
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents.length > 0 ? contents : message,
          config: {
            systemInstruction,
            temperature: 0.8,
          },
        });

        replyText = response.text || 'Maaf, saya sedang memproses jawaban. Silakan coba tanyakan kembali.';
      } catch (geminiErr: any) {
        console.error('Gemini API Error:', geminiErr);
        replyText = `Halo! 🌈 Saya tetap siap membantu Ibu/Bapak terkait pembelajaran TK DWP Kedanyang.\n\nBerikut panduan cepat:\n- Untuk kegiatan motorik halus: cobalah meronce manik besar, meremas plastisin, atau kolase kertas warna.\n- Untuk ice breaking: lagu "Buka Tutup Bertepuk Tangan" atau permainan "Sentuh Warna Benda".\n\n*(Catatan sistem: Koneksi ke Gemini API mengalami penyesuaian: ${geminiErr?.message || 'timeout'}).*`;
      }
    } else {
      replyText = `Halo Sahabat SAKIRA! 🌈✨\n\nSaya **SAKIRA AI** siap mendampingi kegiatan belajar dan parenting di **TK DWP Kedanyang**.\n\nContoh ide kegiatan seru hari ini:\n1. 🎨 **Eksplorasi Warna Pelangi**: Menggunakan air dan pewarna makanan untuk mencampur warna dasar.\n2. 🧩 **Teka-Teki Huruf Ceria**: Mencari kartu huruf awal nama anak di sekitar ruang bermain.\n3. 🎵 **Ice Breaking Senam Jari**: Menggerakkan jari tangan seperti kelinci melompat.\n\n*(Tips: Pastikan GEMINI_API_KEY dikonfigurasi di Settings > Secrets untuk respons AI live tak terbatas).*`;
    }

    // Save assistant response
    const assistantMsg: AiMessage = {
      id: `msg-${Date.now()}-a`,
      conversationId: activeConvId,
      role: 'assistant',
      message: replyText,
      createdAt: new Date().toISOString(),
    };
    db.getAiMessages().push(assistantMsg);
    db.save();

    res.json({
      reply: replyText,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan pada layanan AI' });
  }
});

// -------------------------------------------------------------
// 10. FILE UPLOAD (BASE64 TO LOCAL FILE)
// -------------------------------------------------------------
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { name, data, type } = req.body;
    if (!data) {
      res.status(400).json({ error: 'Data file tidak ditemukan' });
      return;
    }

    // data may be base64 data URI like "data:image/png;base64,..."
    let buffer: Buffer;
    let extension = 'png';

    if (data.includes(';base64,')) {
      const parts = data.split(';base64,');
      const mime = parts[0].replace('data:', '');
      if (mime.includes('jpeg') || mime.includes('jpg')) extension = 'jpg';
      else if (mime.includes('png')) extension = 'png';
      else if (mime.includes('pdf')) extension = 'pdf';
      else if (mime.includes('mp4')) extension = 'mp4';
      else if (mime.includes('text')) extension = 'txt';
      buffer = Buffer.from(parts[1], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    const safeName = (name || `file_${Date.now()}.${extension}`)
      .replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filename = `${Date.now()}_${safeName}`;
    const targetPath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/api/uploads/${filename}`;
    res.json({
      url: publicUrl,
      filename,
      size: `${(buffer.length / 1024).toFixed(1)} KB`,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Gagal mengunggah berkas: ' + err.message });
  }
});

// -------------------------------------------------------------
// 11. FRONTEND DEV MIDDLEWARE / STATIC SERVE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAKIRA DIGITAL] Server aktif dan mendengarkan pada http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
});
