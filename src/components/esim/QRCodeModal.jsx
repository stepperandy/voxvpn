import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function QRCodeModal({ esim, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [lpaCode, setLpaCode] = useState(esim?.qr_code || "");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const isValidLpa = (code) => code && code.startsWith("LPA:") && code.includes("$");

  // If stored qr_code is not a valid LPA, fetch from Airalo
  useEffect(() => {
    if (!isValidLpa(esim?.qr_code) && esim?.id) {
      fetchQrCode();
    }
  }, [esim]);

  const fetchQrCode = async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const res = await base44.functions.invoke("getEsimQrCode", { esim_id: esim.id });
      if (res.data?.qr_code) {
        setLpaCode(res.data.qr_code);
      } else {
        setFetchError("Could not retrieve activation code from Airalo.");
      }
    } catch (err) {
      console.error("Failed to fetch QR code:", err);
      setFetchError("Failed to fetch activation code.");
    } finally {
      setFetching(false);
    }
  };

  // Render QR once we have a valid LPA
  useEffect(() => {
    setQrError(false);
    if (canvasRef.current && isValidLpa(lpaCode)) {
      QRCode.toCanvas(canvasRef.current, lpaCode, {
        width: 240,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      }).catch((err) => {
        console.error("QR generation error:", err);
        setQrError(true);
      });
    }
  }, [lpaCode]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `esim-${esim.iccid}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lpaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validQr = isValidLpa(lpaCode) && !qrError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-white mb-1">Install eSIM</h2>
        <p className="text-sm text-gray-400 mb-4">{esim.product_name}</p>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          {fetching ? (
            <div className="w-60 h-60 bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-gray-400 text-xs">Loading QR code...</p>
            </div>
          ) : validQr ? (
            <div className="bg-white p-3 rounded-xl">
              <canvas ref={canvasRef} />
            </div>
          ) : (
            <div className="w-60 h-28 bg-gray-800 border border-yellow-500/30 rounded-xl flex flex-col items-center justify-center gap-2 px-4">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-300 text-xs text-center font-medium">
                {fetchError || "QR unavailable — use activation code below."}
              </p>
            </div>
          )}
        </div>

        {/* LPA String */}
        {lpaCode ? (
          <div className="bg-gray-800/60 border border-white/10 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Activation Code (LPA)</p>
            <p className="text-xs font-mono text-cyan-300 break-all select-text">{lpaCode}</p>
          </div>
        ) : !fetching ? (
          <div className="bg-gray-800/60 border border-white/10 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Activation Code</p>
            <p className="text-xs text-gray-500">Not available — contact support with your ICCID.</p>
          </div>
        ) : null}

        {/* ICCID */}
        <div className="bg-gray-800/60 border border-white/10 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">ICCID</p>
          <p className="text-sm font-mono text-cyan-300 break-all select-text">{esim.iccid || "—"}</p>
        </div>

        {/* Instructions */}
        <ol className="text-xs text-gray-400 space-y-1 mb-5 list-decimal list-inside">
          {validQr ? (
            <>
              <li>Go to Settings → Mobile / Cellular</li>
              <li>Tap "Add eSIM" or "Add Data Plan"</li>
              <li>Scan the QR code above</li>
            </>
          ) : (
            <>
              <li>Go to Settings → Mobile / Cellular</li>
              <li>Tap "Add eSIM" → "Enter Details Manually"</li>
              <li>Copy and paste the Activation Code above</li>
            </>
          )}
        </ol>

        {/* Actions */}
        <div className="flex gap-2">
          {validQr && (
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Save QR
            </button>
          )}
          {lpaCode && (
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-sm transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}