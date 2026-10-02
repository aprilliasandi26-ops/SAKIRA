import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  Printer,
  ExternalLink,
  MessageCircle,
  Send,
  Facebook,
  Mail,
  Smartphone,
  Sparkles,
  School
} from 'lucide-react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'beranda',
}) => {
  const [selectedSection, setSelectedSection] = useState<string>(activeTab);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sections = [
    { id: 'beranda', label: '🏠 Beranda Utama', desc: 'Halaman pengenalan & portal utama SAKIRA DIGITAL' },
    { id: 'materi', label: '📚 12 Materi Pembelajaran', desc: 'Cover, modul belajar, QR materi, dan panduan kegiatan' },
    { id: 'presensi', label: '📋 Presensi Harian Siswa', desc: 'Rekapitulasi kehadiran 15 siswa TK DWP Kedanyang' },
    { id: 'karya', label: '🎨 Portofolio Karya Anak', desc: 'Galeri dokumentasi kreasi anak & catatan apresiasi guru' },
    { id: 'ai', label: '✨ Konsultasi SAKIRA AI', desc: 'Ide edukasi, ice breaking, & kurikulum PAUD Merdeka' },
    { id: 'umpan-balik', label: '💬 Umpan Balik Wali Murid', desc: 'Formulir pesan & komunikasi harian orang tua ke guru' },
  ];

  // Sync selectedSection when activeTab changes
  useEffect(() => {
    if (activeTab) setSelectedSection(activeTab);
  }, [activeTab]);

  // Determine current absolute URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tkdwpkedanyang.sch.id';
  const shareUrl = selectedSection === 'beranda' ? baseUrl : `${baseUrl}?tab=${selectedSection}`;

  // Check if browser supports navigator.share
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  // Generate QR Code on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      shareUrl,
      {
        width: 220,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) console.error('Error generating QR code:', error);
      }
    );
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const currentSectionObj = sections.find((s) => s.id === selectedSection) || sections[0];

  // Pre-formatted messages for sharing
  const shareTitle = 'SAKIRA DIGITAL - TK DWP KEDANYANG';
  const shareText = `Assalamu'alaikum Wr. Wb. Ayah & Bunda hebat TK DWP Kedanyang 🌈✨\n\nYuk akses Website Resmi *SAKIRA DIGITAL* (${currentSectionObj.label}):\n👉 ${shareUrl}\n\nPlatform pembelajaran ramah anak, presensi, portofolio karya, dan SAKIRA AI.\n"Growing with Knowledge" — TK DWP Kedanyang Gresik.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share dismissed or cancelled:', err);
      }
    }
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QR_SAKIRA_TK_DWP_Kedanyang_${selectedSection}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrintMiniFlyer = () => {
    window.print();
  };

  // WhatsApp share link
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  // Telegram share link
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle + ' - TK DWP Kedanyang')}`;
  // Facebook share link
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  // Email share link
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-200 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xl shadow-md shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black border border-amber-200">
                MUDAH DI-SHARE
              </span>
              <span className="text-xs text-slate-500 font-semibold">• TK DWP KEDANYANG</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              Bagikan Website SAKIRA DIGITAL
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Kirimkan tautan resmi ini kepada para wali murid, rekan pendidik, atau paguyuban kelas melalui WhatsApp, QR Code, atau media sosial.
        </p>

        {/* Section Target Selector */}
        <div className="mb-4">
          <label className="text-xs font-black text-slate-700 block mb-1.5">
            Pilih Halaman yang Ingin Dibagikan:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSection(sec.id)}
                className={`p-2 rounded-xl text-xs font-bold text-left transition-all border ${
                  selectedSection === sec.id
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="truncate">{sec.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 1-Click WhatsApp Banner */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-4 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] text-center"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>Bagikan Langsung ke WhatsApp Grup</span>
        </a>

        {/* Copy Link Input Bar */}
        <div className="mb-5 p-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-2.5 text-xs text-slate-800 font-mono focus:outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tersalin! ✅</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Tautan</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code Card */}
        <div className="p-4 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white rounded-3xl border-2 border-dashed border-amber-300 flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 shrink-0">
            <canvas ref={canvasRef} className="rounded-xl w-36 h-36 mx-auto block" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black text-amber-800 mb-1">
              <QrCode className="w-4 h-4 text-orange-500" />
              <span>Kode QR Pindai Cepat</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-3">
              Arahkan kamera ponsel wali murid ke kode QR ini untuk langsung membuka {currentSectionObj.label}.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-orange-500" />
                <span>Unduh Gambar QR</span>
              </button>

              <button
                type="button"
                onClick={handlePrintMiniFlyer}
                className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-sky-600" />
                <span>Cetak Kartu Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Other Social Media Icons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 block">
            Atau bagikan melalui kanal lainnya:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                <span>Menu HP</span>
              </button>
            )}

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold flex items-center justify-center gap-1.5 transition-colors border border-sky-200"
            >
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span>Telegram</span>
            </a>

            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
            >
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
              <span>Facebook</span>
            </a>

            <a
              href={emailUrl}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-600" />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            SAKIRA DIGITAL • TK DWP Kedanyang Gresik • "Growing with Knowledge"
          </p>
        </div>
      </div>
    </div>
  );
};
