import fs from 'fs';
import path from 'path';
import {
  User,
  Student,
  Material,
  Comment,
  AttendanceRecord,
  AttendanceStatus,
  PortfolioItem,
  AiDocument,
  AiConversation,
  AiMessage
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'sakira_db.json');

export interface DatabaseSchema {
  users: User[];
  students: Student[];
  materials: Material[];
  comments: Comment[];
  attendance: AttendanceRecord[];
  portfolio: PortfolioItem[];
  aiDocuments: AiDocument[];
  aiConversations: AiConversation[];
  aiMessages: AiMessage[];
}

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
  // 12 empty slots ready for teacher to fill as requested:
  const materials: Material[] = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const padNum = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `mat-${num}`,
      number: num,
      title: `Materi ${padNum} (Siap Diisi Guru)`,
      description: `Slot materi pembelajaran ${padNum} untuk TK DWP Kedanyang. Guru dapat mengunggah cover, kode QR modul, dan mengisi petunjuk aktivitas.`,
      coverUrl: '',
      qrCodeUrl: '',
      materialUrl: '',
      videoUrl: '',
      activities: 'Aktivitas eksplorasi anak bersama guru di sekolah dan orang tua di rumah.',
      date: new Date().toISOString().split('T')[0],
      status: 'Draf',
      order: num,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const studentNames = [
    { name: 'Abil', gender: 'L' as const, parent: 'Bapak Ahmad' },
    { name: 'Alina', gender: 'P' as const, parent: 'Ibu Rahma' },
    { name: 'Celline', gender: 'P' as const, parent: 'Ibu Linda' },
    { name: 'Diego', gender: 'L' as const, parent: 'Bapak Rudi' },
    { name: 'El', gender: 'L' as const, parent: 'Ibu Maya' },
    { name: 'Fiona', gender: 'P' as const, parent: 'Ibu Dewi' },
    { name: 'Gavin', gender: 'L' as const, parent: 'Bapak Budi' },
    { name: 'Haico', gender: 'L' as const, parent: 'Ibu Fitri' },
    { name: 'Kaysan', gender: 'L' as const, parent: 'Bapak Hendra' },
    { name: 'Keisha', gender: 'P' as const, parent: 'Ibu Tari' },
    { name: 'Khanza', gender: 'P' as const, parent: 'Ibu Nurul' },
    { name: 'Marvel', gender: 'L' as const, parent: 'Bapak Ilham' },
    { name: 'Rizky', gender: 'L' as const, parent: 'Ibu Siti' },
    { name: 'Salsa', gender: 'P' as const, parent: 'Ibu Wahyu' },
    { name: 'Sava', gender: 'P' as const, parent: 'Ibu Dian' },
  ];

  const students: Student[] = studentNames.map((s, i) => {
    const num = i + 1;
    const padNum = num < 10 ? `0${num}` : `${num}`;
    return {
      id: `student-${num}`,
      name: s.name,
      class: 'Kelompok B2',
      studentNumber: `NIS-2026-${padNum}`,
      parentName: s.parent,
      status: 'Aktif',
      gender: s.gender,
      birthDate: '2020-05-10',
    };
  });

  const users: User[] = [
    {
      id: 'user-guru-1',
      name: 'Sulatin Ruliati, S.Pd',
      email: 'sulatin@tkdwpkedanyang.sch.id',
      role: 'admin',
      phone: '081234567890',
    },
    {
      id: 'user-guru-2',
      name: 'Aprilia Arista Sandi, S.Pd',
      email: 'aprilliasandi26@gmail.com',
      role: 'teacher',
      phone: '081298765432',
    },
    {
      id: 'user-parent-1',
      name: 'Ibu Siti Fatimah',
      email: 'siti@gmail.com',
      role: 'parent',
      studentId: 'student-1',
      phone: '085712345678',
    },
    {
      id: 'user-parent-2',
      name: 'Ibu Dewi Sartika',
      email: 'dewi@gmail.com',
      role: 'parent',
      studentId: 'student-2',
      phone: '085812345678',
    },
    {
      id: 'user-parent-3',
      name: 'Bapak Budi Santoso',
      email: 'budi@gmail.com',
      role: 'parent',
      studentId: 'student-3',
      phone: '085912345678',
    },
    {
      id: 'user-parent-4',
      name: 'Ibu Maya Indah',
      email: 'maya@gmail.com',
      role: 'parent',
      studentId: 'student-4',
      phone: '085612345678',
    },
  ];

  const comments: Comment[] = [
    {
      id: 'com-1',
      materialId: 'mat-1',
      materialTitle: 'Materi 01',
      studentId: 'student-1',
      studentName: 'Muhammad Rizky Pratama',
      parentId: 'user-parent-1',
      parentName: 'Ibu Siti Fatimah',
      studentClass: 'Kelompok B2',
      comment: 'Ananda Rizky sangat antusias saat mencoba kegiatan bersama di rumah. Pengenalan warnanya semakin baik.',
      childExperience: 'Rizky senang sekali menunjuk warna-warna di sekitar rumah.',
      childDifficulty: 'Sedikit ragu membedakan warna ungu dan biru.',
      suggestion: 'Mohon dibantu pengulangan saat sesi lingkaran pagi ya Bu Aprilia.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      isRead: true,
      teacherReply: 'Alhamdulillah, terima kasih Ibu Siti. Besok di kelas akan kita ajak bermain tebak warna seru ya!',
      teacherReplyAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      teacherReplyBy: 'Aprilia Arista Sandi, S.Pd',
    },
  ];

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const attendance: AttendanceRecord[] = studentNames.map((s, i) => {
    const num = i + 1;
    return {
      id: `att-${num}`,
      studentId: `student-${num}`,
      studentName: s.name,
      class: 'Kelompok B2',
      date: today,
      status: 'Hadir' as AttendanceStatus,
    };
  });

  const portfolio: PortfolioItem[] = [
    {
      id: 'port-1',
      studentId: 'student-1',
      studentName: 'Abil',
      class: 'Kelompok B2',
      title: 'Karya Menggambar Rumah & Taman Bunga',
      description: 'Hasil karya mandiri menggambar bentuk geometri rumah, pohon ceria, dan bunga warna-warni.',
      fileUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
      fileType: 'image',
      theme: 'Lingkunganku Tercinta',
      date: today,
      month: 'Oktober',
      semester: 'Semester 1',
      teacherNote: 'Ananda Abil mampu mengekspresikan imajinasi secara mandiri dengan perpaduan warna yang ceria dan goresan yang mantap.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'port-2',
      studentId: 'student-2',
      studentName: 'Alina',
      class: 'Kelompok B2',
      title: 'Kolase Pelangi Kertas Warna',
      description: 'Aktivitas motorik halus menempel serpihan kertas lipat membentuk lengkungan pelangi.',
      fileUrl: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80',
      fileType: 'image',
      theme: 'Alam Semesta',
      date: yesterday,
      month: 'Oktober',
      semester: 'Semester 1',
      teacherNote: 'Alina menunjukkan kesabaran dan ketelitian tinggi dalam menyusun pola warna pelangi dengan rapi.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'port-3',
      studentId: 'student-3',
      studentName: 'Celline',
      class: 'Kelompok B2',
      title: 'Kreasi Plastisin Bentuk Hewan Lucu',
      description: 'Membentuk ulat dan kura-kura menggunakan plastisin warna-warni.',
      fileUrl: 'https://images.unsplash.com/photo-1560421683-680695857782?w=600&auto=format&fit=crop&q=80',
      fileType: 'image',
      theme: 'Binatang Ciptaan Tuhan',
      date: yesterday,
      month: 'Oktober',
      semester: 'Semester 1',
      teacherNote: 'Koordinasi tangan dan kekuatan jari Celline berkembang sangat baik.',
      createdAt: new Date().toISOString(),
    },
  ];

  const aiDocuments: AiDocument[] = [
    {
      id: 'doc-1',
      name: 'Profil & Visi Misi TK DWP Kedanyang.txt',
      fileUrl: '/api/uploads/profil-sekolah.txt',
      contentText: `TK DWP KEDANYANG
Slogan: "Growing with Knowledge"
Lokasi: Kedanyang, Kebomas, Gresik, Jawa Timur.
Kepala Sekolah: Sulatin Ruliati, S.Pd
Guru / Pendidik: Aprilia Arista Sandi, S.Pd
Visi: Mewujudkan generasi anak usia dini yang beriman, berakhlak mulia, cerdas, kreatif, mandiri, dan berbudaya lingkungan.
Misi:
1. Menyelenggarakan pembelajaran holistik integratif yang menyenangkan dan ramah anak.
2. Memfasilitasi tumbuh kembang fisik-motorik, kognitif, bahasa, sosial-emosional, dan nilai agama moral.
3. Membangun kemitraan erat, transparan, dan harmonis antara guru dan orang tua murid melalui program SAKIRA (Saku Kreatif Interaktif Ramah Anak).
Kelompok Belajar:
- Kelompok A (usia 4-5 tahun)
- Kelompok B (Kelompok B1, B2, B3 usia 5-6 tahun).`,
      type: 'txt',
      size: '2.4 KB',
      uploadedAt: new Date().toISOString(),
      status: 'Tersinkronisasi',
    },
    {
      id: 'doc-2',
      name: 'Pedoman Kurikulum Merdeka PAUD SAKIRA.txt',
      fileUrl: '/api/uploads/panduan-kurikulum.txt',
      contentText: `PEDOMAN KURIKULUM MERDEKA PAUD TK DWP KEDANYANG:
Fokus Pembelajaran:
1. Nilai Agama dan Budi Pekerti (Doa harian, rasa syukur, adab sopan santun).
2. Jati Diri (Kesehatan fisik, regulasi emosi, percaya diri, kebersihan diri).
3. Dasar-dasar Literasi, Matematika, Sains, Teknologi, Rekayasa, dan Seni (STEAM ramah anak usia dini).
4. Proyek Penguatan Profil Pelajar Pancasila (P5) bertema: Aku Sayang Bumi, Aku Cinta Indonesia, Kita Semua Bersaudara, Imajinasi & Kreativitasku.
Prinsip Asesmen SAKIRA:
- Observasi harian autentik
- Catatan anekdot
- Portofolio karya anak (foto, kolase, gambar, audio-visual)
- Komunikasi berkala dengan orang tua siswa melalui aplikasi SAKIRA DIGITAL.`,
      type: 'txt',
      size: '3.8 KB',
      uploadedAt: new Date().toISOString(),
      status: 'Tersinkronisasi',
    },
  ];

  const aiConversations: AiConversation[] = [
    {
      id: 'conv-default',
      userId: 'user-guru-1',
      title: 'Selamat Datang di SAKIRA AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const aiMessages: AiMessage[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-default',
      role: 'assistant',
      message: 'Halo Ibu/Bapak Pendidik dan Orang Tua Hebat TK DWP Kedanyang! 🌈✨\n\nSaya **SAKIRA AI** (Sahabat Kreatif dan Cerdas Ramah Anak). Saya siap membantu:\n- 💡 Menemukan ide kegiatan edukatif seru untuk anak TK\n- 🎲 Merancang permainan motorik & sensorik\n- 📖 Membuat dongeng atau cerita berkarakter\n- 🎵 Menciptakan lirik lagu sederhana & ceria\n- 📝 Menyusun draf Modul Ajar / RPP Kurikulum Merdeka PAUD\n- 💬 Menyiapkan pesan santun untuk orang tua murid\n- 🏫 Menjawab pertanyaan seputar panduan sekolah TK DWP Kedanyang.\n\nAda yang bisa saya bantu hari ini?',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users,
    students,
    materials,
    comments,
    attendance,
    portfolio,
    aiDocuments,
    aiConversations,
    aiMessages,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    ensureDirectories();
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all required collections exist
        const initial = getInitialData();
        const loadedStudents = (parsed.students && parsed.students.length === 15) ? parsed.students : initial.students;
        const loadedAttendance = (parsed.attendance && parsed.attendance.length >= 15) ? parsed.attendance : initial.attendance;
        return {
          users: parsed.users || initial.users,
          students: loadedStudents,
          materials: (parsed.materials && parsed.materials.length === 12) ? parsed.materials : initial.materials,
          comments: parsed.comments || initial.comments,
          attendance: loadedAttendance,
          portfolio: parsed.portfolio || initial.portfolio,
          aiDocuments: parsed.aiDocuments || initial.aiDocuments,
          aiConversations: parsed.aiConversations || initial.aiConversations,
          aiMessages: parsed.aiMessages || initial.aiMessages,
        };
      }
    } catch (e) {
      console.error('Failed to load db file, initializing with fresh schema:', e);
    }
    const fresh = getInitialData();
    this.saveDirect(fresh);
    return fresh;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      ensureDirectories();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Helper getters
  public getUsers(): User[] { return this.data.users; }
  public getStudents(): Student[] { return this.data.students; }
  public getMaterials(): Material[] { return this.data.materials; }
  public getComments(): Comment[] { return this.data.comments; }
  public getAttendance(): AttendanceRecord[] { return this.data.attendance; }
  public getPortfolio(): PortfolioItem[] { return this.data.portfolio; }
  public getAiDocuments(): AiDocument[] { return this.data.aiDocuments; }
  public getAiConversations(): AiConversation[] { return this.data.aiConversations; }
  public getAiMessages(): AiMessage[] { return this.data.aiMessages; }

  public reset12Slots() {
    const initial = getInitialData();
    this.data.materials = initial.materials;
    this.save();
    return this.data.materials;
  }
}

export const db = new Database();
export { UPLOADS_DIR };
