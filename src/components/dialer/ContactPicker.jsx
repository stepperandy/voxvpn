import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, X, Phone, Bookmark } from "lucide-react";

// Checks if native Contact Picker API is available (Android Chrome)
const hasNativeContactPicker = () =>
  typeof navigator !== "undefined" &&
  "contacts" in navigator &&
  "ContactsManager" in window;

export default function ContactPicker({ onSelect }) {
  const [loading, setLoading] = useState(false);
  const [pickedContacts, setPickedContacts] = useState([]);
  const [savedContacts, setSavedContacts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Load saved contacts on mount
  useEffect(() => {
    loadSavedContacts();
  }, []);

  const loadSavedContacts = async () => {
    try {
      const data = await base44.entities.Contact.list();
      setSavedContacts(data || []);
    } catch (e) {
      console.error("Failed to load saved contacts:", e);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const handleButtonClick = async () => {
    if (hasNativeContactPicker()) {
      // Android Chrome — use native picker
      try {
        setLoading(true);
        const results = await navigator.contacts.select(["name", "tel"], { multiple: true });
        if (results?.length) {
          const parsed = results.flatMap(c =>
            (c.tel || []).map(tel => ({
              name: c.name?.[0] || "Unknown",
              tel: tel.replace(/[\s\-()]/g, ""),
            }))
          ).filter(c => c.tel);
          setPickedContacts(parsed);
          setSearch("");
          setShowDropdown(true);
        }
      } catch {
        // cancelled
      } finally {
        setLoading(false);
      }
    } else {
      // iPhone / desktop — toggle the manual search dropdown
      setShowDropdown(v => !v);
    }
  };

  const handleManualEntry = (e) => {
    if (e.key === "Enter" && search.trim()) {
      onSelect(search.trim());
      setShowDropdown(false);
      setSearch("");
    }
  };

  const handleSelect = (tel) => {
    onSelect(tel);
    setShowDropdown(false);
    setSearch("");
    setPickedContacts([]);
  };

  // Merge and filter contacts (saved contacts + picked contacts from native API)
  const allContacts = [...savedContacts, ...pickedContacts];
  const uniqueContacts = Array.from(
    new Map(allContacts.map(c => [c.phone_number, c])).values()
  );
  const filtered = uniqueContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone_number.replace(/[\s\-()]/g, "").includes(search.replace(/[\s\-()]/g, ""))
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={handleButtonClick}
        disabled={loading}
        title="Pick contact"
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90 disabled:opacity-50"
        style={{
          background: showDropdown ? "rgba(99,179,237,0.2)" : "rgba(255,255,255,0.07)",
          border: `1px solid ${showDropdown ? "rgba(99,179,237,0.4)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Users className="w-4 h-4 text-gray-300" />
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute left-0 mt-2 rounded-2xl overflow-hidden shadow-2xl z-50"
          style={{
            width: "280px",
            background: "#131924",
            border: "1px solid rgba(255,255,255,0.12)",
            top: "100%",
          }}
        >
          {/* Search / manual input */}
          <div className="flex items-center gap-2 px-3 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleManualEntry}
              placeholder={filtered.length ? "Search…" : "Type number + Enter"}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600 font-mono"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-600 hover:text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Contact list */}
          {filtered.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {filtered.map((c, i) => {
                const isSaved = savedContacts.some(sc => sc.id === c.id);
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(c.phone_number)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5 active:bg-white/10 border-b border-white/5 last:border-b-0"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: "rgba(99,179,237,0.15)", color: "#93c5fd" }}
                    >
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                      <p className="text-gray-500 text-[11px] font-mono">{c.phone_number}</p>
                    </div>
                    {isSaved && <Bookmark className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 fill-amber-400" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-4 text-center">
              <p className="text-gray-600 text-[11px] leading-relaxed">
                {savedContacts.length > 0
                  ? "No matching contacts"
                  : hasNativeContactPicker()
                    ? "Tap the button again to pick from contacts"
                    : "Type a number above and press Enter to dial"}
              </p>
            </div>
          )}

          {/* Saved contacts hint */}
          {savedContacts.length > 0 && pickedContacts.length === 0 && filtered.length === 0 && (
            <div className="px-4 py-2.5 text-center border-t border-white/5">
              <p className="text-gray-500 text-[10px]">
                {savedContacts.length} saved contact{savedContacts.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}