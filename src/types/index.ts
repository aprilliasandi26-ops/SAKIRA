export type UserRole = 'admin' | 'teacher' | 'parent';

export type StudentClass = 'Kelompok A' | 'Kelompok B1' | 'Kelompok B2' | 'Kelompok B3';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export type MaterialStatus = 'Aktif' | 'Draf' | 'Selesai';

export type FileType = 'image' | 'video' | 'document';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string; // If role is parent, references the student
  phone?: string;
}

export interface Student {
  id: string;
  name: string;
  class: StudentClass;
  studentNumber: string; // Nomor induk / NIS
  parentId?: string;
  parentName?: string;
  status: 'Aktif' | 'Non-Aktif';
  gender?: 'L' | 'P';
  birthDate?: string;
}

export interface Material {
  id: string;
  number: number; // 1 to 12
  title: string;
  description: string;
  coverUrl: string;
  qrCodeUrl: string;
  materialUrl: string;
  videoUrl?: string;
  activities?: string;
  date: string;
  status: MaterialStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  materialId: string;
  materialTitle?: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  studentClass?: StudentClass;
  comment: string;
  childExperience?: string;
  childDifficulty?: string;
  suggestion?: string;
  createdAt: string;
  isRead: boolean;
  teacherReply?: string;
  teacherReplyAt?: string;
  teacherReplyBy?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: StudentClass;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  updatedAt?: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  studentName: string;
  class: StudentClass;
  title: string;
  description: string;
  fileUrl: string;
  fileType: FileType;
  theme: string;
  date: string; // YYYY-MM-DD
  month: string;
  semester: 'Semester 1' | 'Semester 2';
  teacherNote: string;
  createdAt: string;
}

export interface AiDocument {
  id: string;
  name: string;
  fileUrl: string;
  contentText: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'Tersinkronisasi' | 'Proses';
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AiMessage[];
}
