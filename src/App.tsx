import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomeDashboard } from './components/HomeDashboard.tsx';
import { MaterialsView } from './components/MaterialsView.tsx';
import { SakiraAiView } from './components/SakiraAiView.tsx';
import { AttendanceView } from './components/AttendanceView.tsx';
import { PortfolioView } from './components/PortfolioView.tsx';
import { CommentsView } from './components/CommentsView.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { QrModal } from './components/QrModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { api } from './services/api.ts';
import {
  User,
  Student,
  Material,
  Comment,
  AttendanceRecord,
  PortfolioItem,
  AiDocument,
  AiConversation
} from './types/index.ts';
import { School, Heart, Sparkles, BookOpen, Bot, CalendarCheck2, Image as ImageIcon, Share2 } from 'lucide-react';

export default function App() {
  // Global Data State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<AiDocument[]>([]);
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');

  // UI State
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [selectedQrMaterial, setSelectedQrMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync tab with URL query parameter for easy direct sharing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const validTabs = ['beranda', 'materi', 'ai', 'presensi', 'karya', 'umpan-balik', 'dashboard-guru'];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tab === 'beranda') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Initial Data Load
  const loadAllData = async () => {
    try {
      const [uList, sList, mList, cList, aList, pList, kList, convList] = await Promise.all([
        api.getUsers(),
        api.getStudents(),
        api.getMaterials(),
        api.getComments(),
        api.getAttendance(),
        api.getPortfolio(),
        api.getKnowledgeBase(),
        api.getAiConversations(),
      ]);

      setUsers(uList);
      setStudents(sList);
      setMaterials(mList);
      setComments(cList);
      setAttendance(aList);
      setPortfolio(pList);
      setKnowledgeDocs(kList);
      setConversations(convList);

      if (convList.length > 0 && !activeConversationId) {
        setActiveConversationId(convList[0].id);
      }

      // Check saved user session or default to Guru Aprilia Arista Sandi, S.Pd
      const savedUserId = localStorage.getItem('sakira_user_id');
      const apriliaUser = uList.find(u => u.name.includes('Aprilia')) || uList.find(u => u.id === 'user-guru-2');
      if (savedUserId) {
        const found = uList.find(u => u.id === savedUserId);
        if (found) setCurrentUser(found);
        else setCurrentUser(apriliaUser || uList[0]);
      } else {
        setCurrentUser(apriliaUser || uList[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Switch User handler
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sakira_user_id', user.id);
    // Reload comments & portfolio respecting new user role
    api.getComments().then(setComments);
    api.getPortfolio().then(setPortfolio);

    // If switching to parent while on Teacher Dashboard, navigate to home
    if (user.role === 'parent' && activeTab === 'dashboard-guru') {
      setActiveTab('beranda');
    }
  };

  // Material Actions
  const handleUpdateMaterial = async (id: string, updates: Partial<Material>) => {
    const updated = await api.updateMaterial(id, updates);
    setMaterials(prev => prev.map(m => (m.id === id ? updated : m)));
  };

  const handleResetSlots = async () => {
    const reset = await api.reset12Slots();
    setMaterials(reset);
  };

  // Comment Actions
  const handleSubmitFeedback = async (data: Partial<Comment>) => {
    const newCom = await api.createComment(data);
    setComments(prev => [newCom, ...prev]);
  };

  const handleMarkCommentRead = async (id: string) => {
    await api.markCommentRead(id);
    setComments(prev => prev.map(c => (c.id === id ? { ...c, isRead: true } : c)));
  };

  const handleReplyComment = async (id: string, reply: string) => {
    const updated = await api.replyComment(id, reply, currentUser?.name);
    setComments(prev => prev.map(c => (c.id === id ? updated : c)));
  };

  const handleDeleteComment = async (id: string) => {
    await api.deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  // Portfolio Actions
  const handleCreatePortfolio = async (item: Partial<PortfolioItem>) => {
    const created = await api.createPortfolio(item);
    setPortfolio(prev => [created, ...prev]);
  };

  const handleUpdatePortfolio = async (id: string, updates: Partial<PortfolioItem>) => {
    const updated = await api.updatePortfolio(id, updates);
    setPortfolio(prev => prev.map(p => (p.id === id ? updated : p)));
  };

  const handleDeletePortfolio = async (id: string) => {
    await api.deletePortfolio(id);
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  // Student Actions
  const handleCreateStudent = async (student: Partial<Student>) => {
    const created = await api.createStudent(student);
    setStudents(prev => [...prev, created]);
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    const updated = await api.updateStudent(id, updates);
    setStudents(prev => prev.map(s => (s.id === id ? updated : s)));
  };

  const handleDeleteStudent = async (id: string) => {
    await api.deleteStudent(id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Refresh Helpers
  const handleRefreshAttendance = async () => {
    const list = await api.getAttendance();
    setAttendance(list);
  };

  const handleRefreshKnowledge = async () => {
    const list = await api.getKnowledgeBase();
    setKnowledgeDocs(list);
  };

  const handleRefreshConversations = async () => {
    const list = await api.getAiConversations();
    setConversations(list);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F2] text-slate-800 p-4">
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-xl animate-bounce mb-4">
          🎒
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">
          SAKIRA DIGITAL
        </h2>
        <p className="text-xs font-bold text-amber-700 mt-1">
          TK DWP KEDANYANG • "Growing with Knowledge"
        </p>
        <div className="mt-5 w-40 h-2 bg-amber-200 rounded-full overflow-hidden">
          <div className="w-full h-full bg-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const unreadCount = comments.filter(c => !c.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-slate-800">
      
      {/* Navbar with Role Switcher & Share */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        unreadCommentsCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'beranda' && (
          <HomeDashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenShare={() => setIsShareModalOpen(true)}
            materials={materials}
            attendanceRecords={attendance}
            portfolioItems={portfolio}
            comments={comments}
          />
        )}

        {activeTab === 'materi' && (
          <MaterialsView
            materials={materials}
            currentUser={currentUser}
            students={students}
            comments={comments}
            onUpdateMaterial={handleUpdateMaterial}
            onResetSlots={handleResetSlots}
            onSubmitFeedback={handleSubmitFeedback}
            onViewQr={(m) => setSelectedQrMaterial(m)}
          />
        )}

        {activeTab === 'ai' && (
          <SakiraAiView
            currentUser={currentUser}
            conversations={conversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            knowledgeDocs={knowledgeDocs}
            onRefreshKnowledge={handleRefreshKnowledge}
            onRefreshConversations={handleRefreshConversations}
          />
        )}

        {activeTab === 'presensi' && (
          <AttendanceView
            currentUser={currentUser}
            students={students}
            allAttendance={attendance}
            onRefreshAttendance={handleRefreshAttendance}
          />
        )}

        {activeTab === 'karya' && (
          <PortfolioView
            portfolioItems={portfolio}
            students={students}
            currentUser={currentUser}
            onCreatePortfolio={handleCreatePortfolio}
            onUpdatePortfolio={handleUpdatePortfolio}
            onDeletePortfolio={handleDeletePortfolio}
          />
        )}

        {activeTab === 'umpan-balik' && (
          <CommentsView
            comments={comments}
            materials={materials}
            students={students}
            currentUser={currentUser}
            onSubmitFeedback={handleSubmitFeedback}
            onMarkRead={handleMarkCommentRead}
            onReplyComment={handleReplyComment}
            onDeleteComment={handleDeleteComment}
          />
        )}

        {activeTab === 'dashboard-guru' && (
          <TeacherDashboard
            currentUser={currentUser}
            students={students}
            materials={materials}
            comments={comments}
            attendanceRecords={attendance}
            portfolioItems={portfolio}
            onNavigate={(tab) => setActiveTab(tab)}
            onCreateStudent={handleCreateStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-amber-100 bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-xl shadow-sm">
              🎒
            </div>
            <div>
              <div className="font-black text-slate-900 font-display text-sm">
                SAKIRA DIGITAL – TK DWP KEDANYANG
              </div>
              <div className="text-[11px] text-amber-700 font-semibold">
                Saku Kreatif Interaktif Ramah Anak • "Growing with Knowledge"
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600">
            <button onClick={() => handleNavigate('beranda')} className="hover:text-amber-600">Beranda</button>
            <span>•</span>
            <button onClick={() => handleNavigate('materi')} className="hover:text-amber-600">12 Materi</button>
            <span>•</span>
            <button onClick={() => handleNavigate('ai')} className="hover:text-amber-600">SAKIRA AI</button>
            <span>•</span>
            <button onClick={() => handleNavigate('presensi')} className="hover:text-amber-600">Presensi</button>
            <span>•</span>
            <button onClick={() => handleNavigate('karya')} className="hover:text-amber-600">Karya Anak</button>
            <span>•</span>
            <button onClick={() => handleNavigate('umpan-balik')} className="hover:text-amber-600">Umpan Balik</button>
            <span>•</span>
            <button 
              onClick={() => setIsShareModalOpen(true)} 
              className="text-orange-600 font-extrabold flex items-center gap-1 hover:text-orange-700 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Web</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            © 2026 TK DWP Kedanyang, Kebomas, Gresik. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>

      {/* Floating Quick Share Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-black cursor-pointer border-2 border-white"
          title="Bagikan Website ke WhatsApp atau Tampilkan QR Code"
        >
          <Share2 className="w-4 h-4 animate-pulse" />
          <span>Bagikan Web</span>
        </button>
      </div>

      {/* Role / User Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
      />

      {/* QR Code Modal for specific material */}
      <QrModal
        material={selectedQrMaterial}
        onClose={() => setSelectedQrMaterial(null)}
      />

      {/* Full Website Share Modal (WhatsApp, QR Code, Copy Link) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeTab={activeTab}
      />

    </div>
  );
}
