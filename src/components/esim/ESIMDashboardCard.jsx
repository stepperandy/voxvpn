import React, { useState, useEffect } from "react";
import { Wifi, Download, Eye, EyeOff, QrCode, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import QRCode from "qrcode";
import ESIMInstallationGuide from "./ESIMInstallationGuide";

const STATUS_COLORS = {
  active: "bg-green-500/15 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  expired: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
};

function QRCodeDisplay({ qrCode }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(qrCode).then(setQrDataUrl);
  }, [qrCode]);

  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "esim-qr.png";
    link.click();
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-xl">
      {qrDataUrl ? (
        <>
          <img src={qrDataUrl} alt="eSIM QR Code" className="w-48 h-48 border border-gray-700 rounded-lg" />
          <p className="text-xs text-gray-400 text-center break-all font-mono">{qrCode}</p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 text-xs rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download QR
          </button>
        </>
      ) : (
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      )}
    </div>
  );
}

export default function ESIMDashboardCard({ esim }) {
  const [showQR, setShowQR] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const isActive = esim.status === "active";
  const isExpired = esim.status === "expired";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <p className="text-white font-semibold text-lg">{esim.product_name || esim.product_id}</p>
          </div>
          <p className="text-xs text-gray-500">Purchased {new Date(esim.created_date).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2.5 py-1.5 rounded-full border font-semibold flex items-center gap-1.5 ${STATUS_COLORS[esim.status] || STATUS_COLORS.pending}`}>
            {isActive && <CheckCircle className="w-3 h-3" />}
            {isExpired && <AlertCircle className="w-3 h-3" />}
            {esim.status.charAt(0).toUpperCase() + esim.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-800">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">ICCID</p>
          <p className="text-sm font-mono text-gray-200 break-all">{esim.iccid}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Activation Code</p>
          <p className="text-sm font-mono text-gray-200 break-all select-text">{esim.qr_code.substring(0, 20)}...</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Amount Paid</p>
          <p className="text-sm font-semibold text-cyan-400">${esim.price_paid?.toFixed(2) || 'N/A'}</p>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Installation Steps</h3>
        <div className="space-y-2">
          {[
            { step: 1, title: "Open Settings", desc: "Go to Mobile > eSIM in your device settings" },
            { step: 2, title: "Add eSIM", desc: "Select 'Add eSIM' and choose 'Use QR Code'" },
            { step: 3, title: "Scan Code", desc: "Scan the QR code below" },
            { step: 4, title: "Activate", desc: "Follow the prompts to complete activation" }
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                {item.step}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{item.title}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm rounded-lg transition-colors font-medium"
        >
          <QrCode className="w-4 h-4" />
          {showQR ? "Hide QR" : "Show QR"}
        </button>
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm rounded-lg transition-colors font-medium"
        >
          <BookOpen className="w-4 h-4" />
          Guide
        </button>
      </div>

      {showQR && <QRCodeDisplay qrCode={esim.qr_code} />}
      
      <ESIMInstallationGuide 
        open={showGuide} 
        onOpenChange={setShowGuide}
        esim={esim}
      />
    </div>
  );
}