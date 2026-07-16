import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Upload, FileText, CheckCircle2, AlertTriangle, X,
  Loader2, ChevronRight, Clipboard
} from "lucide-react";

// Simple CSV parser that handles quoted fields
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell); cell = ""; }
      else if (char === '\n' || char === '\r') {
        if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); }
        row = []; cell = "";
        if (char === '\r' && text[i + 1] === '\n') i++;
      } else {
        cell += char;
      }
    }
  }
  if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

const NAME_KEYS = ["name", "full_name", "fullname", "first_name", "firstname", "contact_name", "display_name"];
const PHONE_KEYS = ["phone", "phone_number", "phonenumber", "number", "mobile", "cell", "tel", "telephone", "phone1", "primary_phone"];
const NOTES_KEYS = ["notes", "note", "description", "company", "organization", "label"];

function detectColumn(headers) {
  const lower = headers.map(h => h.toLowerCase().trim());
  const nameIdx = lower.findIndex(h => NAME_KEYS.some(k => h.includes(k)));
  const phoneIdx = lower.findIndex(h => PHONE_KEYS.some(k => h.includes(k)));
  const notesIdx = lower.findIndex(h => NOTES_KEYS.some(k => h.includes(k)));
  return { nameIdx, phoneIdx, notesIdx };
}

function parseContacts(text) {
  const rows = parseCSV(text.trim());
  if (rows.length === 0) return { contacts: [], error: "File is empty" };

  const headers = rows[0].map(h => h.trim());
  const { nameIdx, phoneIdx, notesIdx } = detectColumn(headers);

  // If no headers detected, try positional (col 0 = name, col 1 = phone, col 2 = notes)
  const useName = nameIdx >= 0 ? nameIdx : 0;
  const usePhone = phoneIdx >= 0 ? phoneIdx : 1;
  const useNotes = notesIdx >= 0 ? notesIdx : (rows[0].length > 2 ? 2 : -1);

  const contacts = [];
  const skipped = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[useName] || "").trim();
    const phone = (row[usePhone] || "").trim();
    const notes = useNotes >= 0 ? (row[useNotes] || "").trim() : "";
    if (!name || !phone) {
      skipped.push({ row: i + 1, name, phone });
      continue;
    }
    contacts.push({ name, phone_number: phone, notes });
  }

  return { contacts, skipped, detected: { nameCol: headers[useName], phoneCol: headers[usePhone], notesCol: useNotes >= 0 ? headers[useNotes] : null } };
}

export default function BulkContactImport({ onClose, onImported }) {
  const [stage, setStage] = useState("upload"); // upload -> preview -> importing -> done
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef(null);

  const handleFile = (file) => {
    setError(null);
    if (!file) return;
    const isCSV = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
    const isVCF = file.name.toLowerCase().endsWith(".vcf") || file.name.toLowerCase().endsWith(".vcard");
    const isTXT = file.name.toLowerCase().endsWith(".txt") || file.type === "text/plain";

    if (!isCSV && !isVCF && !isTXT) {
      setError("Please upload a CSV, vCard (.vcf), or text file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (isVCF) {
        const result = parseVCF(text);
        setParsed(result);
        setStage("preview");
      } else {
        const result = parseContacts(text);
        if (result.error) { setError(result.error); return; }
        setParsed(result);
        setStage("preview");
      }
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  const parseVCF = (text) => {
    const contacts = [];
    const cards = text.split(/BEGIN:VCARD/i).slice(1);
    for (const card of cards) {
      const lines = card.split(/\r?\n/);
      let name = "";
      let phone = "";
      let notes = "";
      for (const line of lines) {
        if (line.toUpperCase().startsWith("FN:")) name = line.slice(3).trim();
        else if (line.toUpperCase().startsWith("TEL")) {
          const val = line.split(":").pop().trim();
          if (val && !phone) phone = val;
        }
        else if (line.toUpperCase().startsWith("NOTE:")) notes = line.slice(5).trim();
        else if (line.toUpperCase().startsWith("N:") && !name) {
          const parts = line.slice(2).split(";");
          name = parts.filter(p => p.trim()).join(" ").trim();
        }
      }
      if (name && phone) contacts.push({ name, phone_number: phone, notes });
    }
    return { contacts, skipped: [], detected: { nameCol: "FN (vCard)", phoneCol: "TEL (vCard)", notesCol: "NOTE (vCard)" } };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handlePasteSubmit = () => {
    setError(null);
    if (!pasteText.trim()) { setError("Please paste some contact data."); return; }
    const result = parseContacts(pasteText);
    if (result.error) { setError(result.error); return; }
    if (result.contacts.length === 0) { setError("No valid contacts found. Ensure each row has a name and phone number."); return; }
    setParsed(result);
    setStage("preview");
  };

  const handleImport = async () => {
    setStage("importing");
    try {
      const contactsToCreate = parsed.contacts.map(c => ({
        name: c.name,
        phone_number: c.phone_number,
        notes: c.notes || "",
      }));
      const result = await base44.entities.Contact.bulkCreate(contactsToCreate);
      const imported = Array.isArray(result) ? result.length : (contactsToCreate.length);
      setImportResult({ success: imported, failed: parsed.skipped.length });
      setStage("done");
    } catch (err) {
      setError("Import failed: " + (err.message || "Unknown error"));
      setStage("preview");
    }
  };

  const handleDownloadTemplate = () => {
    const csv = "name,phone_number,notes\nJohn Doe,+1234567890,Client\nJane Smith,+1987654320,Vendor\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)", border: "1px solid rgba(255,255,255,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            Bulk Import Contacts
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {stage === "upload" && (
            <div className="space-y-4">
              {!pasteMode ? (
                <>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? "border-cyan-400 bg-cyan-500/10" : "border-white/15 hover:border-white/30"}`}
                  >
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Drop your file here or click to browse</p>
                    <p className="text-gray-500 text-xs">Supports CSV, vCard (.vcf), and text files</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.vcf,.vcard,.txt,text/csv,text/plain"
                      onChange={e => handleFile(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download CSV template
                    </button>
                    <button
                      onClick={() => setPasteMode(true)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      Or paste data instead
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 font-medium mb-2">Expected format:</p>
                    <p className="text-xs text-gray-500 font-mono">name, phone_number, notes (optional)</p>
                    <p className="text-xs text-gray-600 mt-1">Auto-detects common column names like "name", "phone", "mobile", "tel", etc.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">Paste contact data (one per line, comma-separated):</p>
                    <button
                      onClick={() => { setPasteMode(false); setPasteText(""); }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload file instead
                    </button>
                  </div>
                  <textarea
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    placeholder={"name,phone_number,notes\nJohn Doe,+1234567890,Client\nJane Smith,+1987654320"}
                    className="w-full h-48 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-cyan-500 text-sm font-mono resize-none"
                  />
                  <button
                    onClick={handlePasteSubmit}
                    className="w-full px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
                  >
                    Parse Contacts
                  </button>
                </>
              )}
            </div>
          )}

          {stage === "preview" && parsed && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">{parsed.contacts.length} contacts ready to import</span>
                {parsed.skipped.length > 0 && (
                  <span className="text-yellow-400">({parsed.skipped.length} skipped — missing name or phone)</span>
                )}
              </div>

              {parsed.detected && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <span className="text-xs text-gray-400">Detected columns:</span>
                  <span className="text-xs text-cyan-400">Name → {parsed.detected.nameCol || "col 1"}</span>
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-cyan-400">Phone → {parsed.detected.phoneCol || "col 2"}</span>
                  {parsed.detected.notesCol && (
                    <>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="text-xs text-cyan-400">Notes → {parsed.detected.notesCol}</span>
                    </>
                  )}
                </div>
              )}

              <div className="rounded-xl overflow-hidden border border-white/10 max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 text-gray-400 text-xs font-medium">#</th>
                      <th className="text-left py-2 px-3 text-gray-400 text-xs font-medium">Name</th>
                      <th className="text-left py-2 px-3 text-gray-400 text-xs font-medium">Phone Number</th>
                      <th className="text-left py-2 px-3 text-gray-400 text-xs font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.contacts.slice(0, 100).map((c, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-2 px-3 text-gray-600 text-xs">{i + 1}</td>
                        <td className="py-2 px-3 text-white text-xs">{c.name}</td>
                        <td className="py-2 px-3 text-gray-300 text-xs font-mono">{c.phone_number}</td>
                        <td className="py-2 px-3 text-gray-500 text-xs truncate max-w-[120px]">{c.notes || "—"}</td>
                      </tr>
                    ))}
                    {parsed.contacts.length > 100 && (
                      <tr><td colSpan={4} className="py-2 text-center text-xs text-gray-500">...and {parsed.contacts.length - 100} more</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setStage("upload"); setParsed(null); }}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-white/8 text-white hover:bg-white/12"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
                >
                  Import {parsed.contacts.length} Contacts
                </button>
              </div>
            </div>
          )}

          {stage === "importing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
              <p className="text-white font-medium">Importing contacts…</p>
              <p className="text-gray-500 text-sm mt-1">This may take a moment for large lists.</p>
            </div>
          )}

          {stage === "done" && importResult && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Import Complete!</h3>
              <p className="text-gray-400 text-sm">
                Successfully imported <span className="text-green-400 font-medium">{importResult.success} contacts</span>
                {importResult.failed > 0 && ` (${importResult.failed} rows skipped)`}
              </p>
              <button
                onClick={onImported}
                className="mt-6 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}