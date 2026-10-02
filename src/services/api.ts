import {
  User,
  Student,
  Material,
  Comment,
  AttendanceRecord,
  PortfolioItem,
  AiDocument,
  AiConversation,
  AiMessage,
  StudentClass
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Users & Auth
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  async login(payload: { email?: string; userId?: string; role?: string }): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal masuk ke akun');
    return res.json();
  },

  // Students
  async getStudents(className?: string): Promise<Student[]> {
    const url = className ? `${API_BASE}/students?class=${encodeURIComponent(className)}` : `${API_BASE}/students`;
    const res = await fetch(url);
    return res.json();
  },

  async createStudent(student: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    return res.json();
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteStudent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Materials
  async getMaterials(): Promise<Material[]> {
    const res = await fetch(`${API_BASE}/materials`);
    return res.json();
  },

  async getMaterial(id: string): Promise<Material> {
    const res = await fetch(`${API_BASE}/materials/${id}`);
    return res.json();
  },

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material> {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async reset12Slots(): Promise<Material[]> {
    const res = await fetch(`${API_BASE}/materials/reset-slots`, { method: 'POST' });
    return res.json();
  },

  // Comments / Parent Feedback
  async getComments(params?: { role?: string; studentId?: string; materialId?: string }): Promise<Comment[]> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.materialId) searchParams.set('materialId', params.materialId);

    const res = await fetch(`${API_BASE}/comments?${searchParams.toString()}`);
    return res.json();
  },

  async createComment(data: Partial<Comment>): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal mengirim umpan balik');
    return res.json();
  },

  async markCommentRead(id: string): Promise<{ success: boolean; comment: Comment }> {
    const res = await fetch(`${API_BASE}/comments/${id}/read`, { method: 'PATCH' });
    return res.json();
  },

  async replyComment(id: string, reply: string, teacherName?: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply, teacherName }),
    });
    return res.json();
  },

  async deleteComment(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/comments/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Attendance
  async getAttendance(date?: string, className?: string): Promise<AttendanceRecord[]> {
    const searchParams = new URLSearchParams();
    if (date) searchParams.set('date', date);
    if (className) searchParams.set('class', className);
    const res = await fetch(`${API_BASE}/attendance?${searchParams.toString()}`);
    return res.json();
  },

  async saveAttendanceBulk(records: Partial<AttendanceRecord>[]): Promise<{ success: boolean; count: number }> {
    const res = await fetch(`${API_BASE}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    });
    return res.json();
  },

  async getAttendanceRecap(params?: { startDate?: string; endDate?: string; class?: string; studentId?: string }): Promise<{
    summary: { total: number; hadir: number; izin: number; sakit: number; alpa: number };
    byStudent: Array<{ studentId: string; studentName: string; class: string; hadir: number; izin: number; sakit: number; alpa: number; total: number }>;
    records: AttendanceRecord[];
  }> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.class) searchParams.set('class', params.class);
    if (params?.studentId) searchParams.set('studentId', params.studentId);

    const res = await fetch(`${API_BASE}/attendance/recap?${searchParams.toString()}`);
    return res.json();
  },

  // Portfolio
  async getPortfolio(params?: { role?: string; studentId?: string; class?: string; fileType?: string; theme?: string; search?: string }): Promise<PortfolioItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.class) searchParams.set('class', params.class);
    if (params?.fileType) searchParams.set('fileType', params.fileType);
    if (params?.theme) searchParams.set('theme', params.theme);
    if (params?.search) searchParams.set('search', params.search);

    const res = await fetch(`${API_BASE}/portfolio?${searchParams.toString()}`);
    return res.json();
  },

  async createPortfolio(item: Partial<PortfolioItem>): Promise<PortfolioItem> {
    const res = await fetch(`${API_BASE}/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },

  async updatePortfolio(id: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem> {
    const res = await fetch(`${API_BASE}/portfolio/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deletePortfolio(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/portfolio/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Knowledge Base
  async getKnowledgeBase(): Promise<AiDocument[]> {
    const res = await fetch(`${API_BASE}/knowledge-base`);
    return res.json();
  },

  async createKnowledgeDoc(doc: Partial<AiDocument>): Promise<AiDocument> {
    const res = await fetch(`${API_BASE}/knowledge-base`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return res.json();
  },

  async deleteKnowledgeDoc(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/knowledge-base/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // SAKIRA AI Chat
  async getAiConversations(): Promise<AiConversation[]> {
    const res = await fetch(`${API_BASE}/ai/conversations`);
    return res.json();
  },

  async createAiConversation(title?: string, userId?: string): Promise<AiConversation> {
    const res = await fetch(`${API_BASE}/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, userId }),
    });
    return res.json();
  },

  async deleteAiConversation(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/ai/conversations/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getAiMessages(conversationId: string): Promise<AiMessage[]> {
    const res = await fetch(`${API_BASE}/ai/messages/${conversationId}`);
    return res.json();
  },

  async sendAiChat(payload: {
    conversationId: string;
    message: string;
    userRole: string;
    userName: string;
  }): Promise<{ reply: string; userMessage: AiMessage; assistantMessage: AiMessage }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal berkomunikasi dengan SAKIRA AI');
    }
    return res.json();
  },

  // File Upload
  async uploadFile(fileData: { name: string; data: string; type?: string }): Promise<{ url: string; filename: string; size: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileData),
    });
    if (!res.ok) throw new Error('Gagal mengunggah berkas');
    return res.json();
  },
};
