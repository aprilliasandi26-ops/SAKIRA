import React from 'react';
import { X, QrCode, Download, ExternalLink, Printer } from 'lucide-react';
import { Material } from '../types/index.ts';

interface QrModalProps {
  material: Material | null;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ material, onClose }) => {
  if (!material) return null;

  // If material has qrCodeUrl use it, otherwise generate a crisp dynamic QR via quickchart/qr server
  const targetUrl = material.materialUrl || `https://tkdwpkedanyang.sch.id/materi/${material.number}`;
  const qrImageSrc = material.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}&margin=10`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-sky-200 relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 mb-3 shadow-inner">
          <QrCode className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-sky-50 text-sky-700 text-xs font-black rounded-full border border-sky-200 mb-1">
          MATERI {material.number < 10 ? `0${material.number}` : material.number}
        </span>

        <h3 className="text-xl font-black text-slate-800 font-display">
          {material.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Pindai kode QR ini menggunakan kamera ponsel untuk langsung membuka lembar kerja atau materi pembelajaran.
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-gradient-to-b from-sky-50 to-white rounded-2xl border-2 border-dashed border-sky-300 inline-block shadow-sm">
          <img
            src={qrImageSrc}
            alt={`QR Code Materi ${material.number}`}
            className="w-52 h-52 object-contain mx-auto rounded-xl bg-white p-2 shadow-inner"
          />
          <div className="mt-2 text-[11px] font-bold text-sky-800">
            TK DWP KEDANYANG • SAKIRA
          </div>
        </div>

        {/* Direct Link */}
        {material.materialUrl && (
          <div className="mb-4 p-2 bg-slate-50 rounded-xl text-xs text-slate-600 truncate flex items-center justify-center gap-1.5 border border-slate-200">
            <span className="font-semibold">Tautan:</span>
            <a
              href={material.materialUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline truncate max-w-[240px] font-medium"
            >
              {material.materialUrl}
            </a>
            <ExternalLink className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={qrImageSrc}
            download={`QR_Materi_${material.number}_TK_DWP_Kedanyang.png`}
            target="_blank"
            rel="noreferrer"
            className="cartoon-button-primary py-2.5 px-4 flex items-center justify-center gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh QR</span>
          </a>

          <button
            onClick={handlePrint}
            className="cartoon-button-secondary py-2.5 px-4 flex items-center justify-center gap-2 text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
