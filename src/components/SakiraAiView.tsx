import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  FileText,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Lightbulb,
  Smile,
  Music,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { AiConversation, AiMessage, AiDocument, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface SakiraAiViewProps {
  currentUser: User;
  conversations: AiConversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  knowledgeDocs: AiDocument[];
  onRefreshKnowledge: () => Promise<void>;
  onRefreshConversations: () => Promise<void>;
}

export const SakiraAiView: React.FC<SakiraAiViewProps> = ({
  currentUser,
  conversations,
  activeConversationId,
  setActiveConversationId,
  knowledgeDocs,
  onRefreshKnowledge,
  onRefreshConversations,
}) => {
  const isTeacher = currentUser.role === 'admin' || currentUser.role === 'teacher';

  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Knowledge base upload modal / form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState('txt');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    api.getAiMessages(activeConversationId)
      .then(msgs => setMessages(msgs))
      .catch(e => console.error('Failed to load messages:', e));
  }, [activeConversationId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || loading) return;

    setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.sendAiChat({
        conversationId: activeConversationId || 'conv-default',
        message: text,
        userRole: currentUser.role,
        userName: currentUser.name,
      });

      // Update message list
      setMessages(prev => [...prev, res.userMessage, res.assistantMessage]);
      onRefreshConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      // Fallback message
      const fallbackMsg: AiMessage = {
        id: `msg-err-${Date.now()}`,
        conversationId: activeConversationId,
        role: 'assistant',
        message: `Maaf, sedang ada kendala jaringan saat menghubungi SAKIRA AI: ${err.message}. Mohon coba sesaat lagi.`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    const title = `Percakapan ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    const newConv = await api.createAiConversation(title, currentUser.id);
    await onRefreshConversations();
    setActiveConversationId(newConv.id);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Hapus percakapan ini?')) return;
    await api.deleteAiConversation(id);
    await onRefreshConversations();
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  // Browser speech synthesis (read aloud)
  const handleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Peramban web tidak mendukung fitur suara (Text-to-Speech).');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for clearer reading
    const cleanText = text.replace(/[*#_~`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // slightly higher friendly pitch for kindergarten vibe

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Upload or parse document for Knowledge Base
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    setDocType(ext);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDocContent(content);
    };
    reader.readAsText(file);
  };

  const handleSaveKnowledgeDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docContent) return;

    setUploadingDoc(true);
    try {
      await api.createKnowledgeDoc({
        name: docName,
        contentText: docContent,
        type: docType,
        size: `${(docContent.length / 1024).toFixed(1)} KB`,
      });
      await onRefreshKnowledge();
      setShowUploadModal(false);
      setDocName('');
      setDocContent('');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteKnowledgeDoc = async (id: string) => {
    if (!confirm('Hapus dokumen ini dari sumber pengetahuan SAKIRA AI?')) return;
    await api.deleteKnowledgeDoc(id);
    await onRefreshKnowledge();
  };

  // Quick suggestion prompts
  const suggestionChips = [
    { label: '💡 Ide Kegiatan TK Usia 5-6 Tahun', prompt: 'Berikan 3 ide kegiatan bermain motorik halus dan sensorik untuk anak TK B usia 5-6 tahun dengan tema Alam Semesta.' },
    { label: '🎲 Permainan Edukatif Ceria', prompt: 'Rancanglah 1 permainan edukatif kelompok yang melatih konsentrasi dan kerja sama anak TK di pagi hari.' },
    { label: '📖 Buatkan Dongeng Kejujuran', prompt: 'Tuliskan sebuah cerita fabel pendek yang ceria dan mendidik tentang kejujuran seekor kelinci bernama Kiko untuk anak TK.' },
    { label: '🎵 Lirik Lagu Pendek Ramah Anak', prompt: 'Buatkan lirik lagu ceria 2 bait bertema "Merapikan Mainan Sendiri" dengan nada riang untuk anak TK DWP Kedanyang.' },
    { label: '🧊 Ice Breaking Pagi Hari', prompt: 'Berikan 2 contoh ice breaking tepuk ceria dan gerakan badan yang membangkitkan semangat anak sebelum memulai kelas.' },
    { label: '📝 RPP / Modul Ajar PAUD', prompt: 'Bantu buatkan draf Modul Ajar Kurikulum Merdeka PAUD 1 hari untuk tema: Mengenal Sayuran Sehat di Sekitarku.' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="cartoon-card p-6 bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-white border-purple-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
              🤖
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black mb-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>KECERDASAN BUATAN RAMAH ANAK</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                SAKIRA AI
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold italic">
                "Sahabat Kreatif dan Cerdas Ramah Anak TK DWP Kedanyang"
              </p>
            </div>
          </div>

          {/* Tab buttons (Chat vs Knowledge Base for Teachers) */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💬 Percakapan AI
            </button>
            
            {isTeacher && (
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'knowledge'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Knowledge Base ({knowledgeDocs.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar: Conversation history */}
          <div className="lg:col-span-1 space-y-3">
            <button
              onClick={handleNewConversation}
              className="w-full cartoon-button-primary py-2.5 px-4 text-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Percakapan Baru</span>
            </button>

            <div className="cartoon-card p-3 border-slate-200 space-y-1 max-h-[500px] overflow-y-auto">
              <div className="text-[11px] font-black text-slate-400 px-2 py-1 uppercase tracking-wider">
                Riwayat Sesi Chat
              </div>

              {conversations.map((c) => {
                const isActive = c.id === activeConversationId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate flex items-center gap-2 max-w-[170px]">
                      <span>💬</span>
                      <span className="truncate">{c.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Hapus percakapan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Knowledge base summary chip */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900">
              <span className="font-extrabold flex items-center gap-1.5 mb-1">
                <FileCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Knowledge Base Aktif:</span>
              </span>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                SAKIRA AI secara otomatis mempelajari {knowledgeDocs.length} dokumen panduan sekolah & 12 modul pembelajaran.
              </p>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <div className="cartoon-card border-purple-200 flex flex-col h-[650px] overflow-hidden">
              
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg shadow-sm">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800">
                      SAKIRA AI Assistant
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Tersambung ke Google Gemini & Server Sekolah</span>
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  TK DWP Kedanyang
                </div>
              </div>

              {/* Chat Messages Scroll Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center text-4xl mb-3 shadow-inner">
                      🤖
                    </div>
                    <h4 className="text-lg font-black text-slate-800 font-display">
                      "Halo! Saya SAKIRA AI."
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Ada yang ingin Ibu/Bapak tanyakan seputar materi belajar, permainan edukatif anak usia 5-6 tahun, atau modul ajar?
                    </p>

                    {/* Quick suggestion prompt chips */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
                      {suggestionChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip.prompt)}
                          className="px-3 py-1.5 bg-white hover:bg-purple-50 border border-purple-200 text-purple-900 rounded-full text-xs font-bold transition-transform hover:scale-105 shadow-sm text-left"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAssistant = m.role === 'assistant';
                    const isSpeaking = speakingMsgId === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                      >
                        {isAssistant && (
                          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow shrink-0 mt-1">
                            🤖
                          </div>
                        )}

                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-sm text-xs leading-relaxed ${
                          isAssistant
                            ? 'bg-white border-2 border-purple-100 text-slate-800 rounded-tl-sm'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-sm font-medium'
                        }`}>
                          <div className="whitespace-pre-wrap font-sans">
                            {m.message}
                          </div>

                          {/* Assistant Action Bar (Audio Read Aloud) */}
                          {isAssistant && (
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                              <span>SAKIRA AI • TK DWP Kedanyang</span>
                              <button
                                onClick={() => handleSpeak(m.id, m.message)}
                                className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md transition-colors ${
                                  isSpeaking ? 'bg-purple-100 text-purple-700' : 'hover:text-purple-600'
                                }`}
                                title={isSpeaking ? 'Hentikan Suara' : 'Bacakan Suara Ceria'}
                              >
                                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                <span>{isSpeaking ? 'Hentikan' : 'Bacakan Suara'}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {!isAssistant && (
                          <div className="w-8 h-8 rounded-xl bg-amber-400 text-white flex items-center justify-center text-sm shadow shrink-0 mt-1">
                            {currentUser.role === 'parent' ? '👨‍👩‍👧' : '👩‍🏫'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {loading && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow shrink-0 animate-bounce">
                      🤖
                    </div>
                    <div className="bg-white border-2 border-purple-100 rounded-2xl px-4 py-3 shadow-sm text-xs text-purple-800 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                      <span>SAKIRA AI sedang meracik jawaban kreatif...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="Ketik pertanyaan untuk SAKIRA AI (ide bermain, cerita anak, ice breaking, kurikulum)..."
                    disabled={loading}
                    className="flex-1 p-3 text-xs sm:text-sm rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputPrompt.trim()}
                    className="cartoon-button-primary p-3 sm:px-5 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* KNOWLEDGE BASE TAB (GURU / ADMIN ONLY) */}
      {activeTab === 'knowledge' && isTeacher && (
        <div className="space-y-6">
          <div className="cartoon-card p-6 bg-white border-purple-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <span>Knowledge Base SAKIRA AI</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                  Guru dapat mengunggah dokumen sekolah (PDF, DOCX, TXT, materi pembelajaran, modul ajar, panduan sekolah). SAKIRA AI secara cerdas menggunakan dokumen ini sebagai sumber pengetahuan utama saat menjawab pertanyaan pengguna.
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="cartoon-button-primary py-2.5 px-4 text-xs flex items-center gap-2 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Dokumen Baru</span>
              </button>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Nama Dokumen</th>
                    <th className="p-3.5">Format</th>
                    <th className="p-3.5">Ukuran</th>
                    <th className="p-3.5">Tanggal Upload</th>
                    <th className="p-3.5">Status Sinkronisasi</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {knowledgeDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Belum ada dokumen knowledge base yang diunggah.
                      </td>
                    </tr>
                  ) : (
                    knowledgeDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-purple-50/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                            {doc.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{doc.size}</td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(doc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Tersinkronisasi</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteKnowledgeDoc(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-purple-200 relative text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <span>Upload Dokumen Knowledge Base</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKnowledgeDoc} className="space-y-3.5">
              
              {/* File input */}
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-dashed border-purple-300 text-center">
                <input
                  type="file"
                  accept=".txt,.pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white file:font-bold cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Mendukung TXT, PDF, DOCX (Maks 10MB)
                </p>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Nama Dokumen:
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Contoh: Modul_Ajar_PAUD_Bulan_Oktober.txt"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Isi / Ringkasan Materi untuk AI:
                </label>
                <textarea
                  rows={5}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Salin atau ketik poin materi, petunjuk modul ajar, panduan sekolah agar dipelajari oleh SAKIRA AI..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !docName || !docContent}
                  className="cartoon-button-primary py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{uploadingDoc ? 'Menyimpan...' : 'Sinkronkan ke AI'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
