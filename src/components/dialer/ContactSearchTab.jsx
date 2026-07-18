import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Plus } from 'lucide-react';

export default function ContactSearchTab({ onSelectNumber }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const u = await base44.auth.me();
      const callNotes = await base44.entities.CallNote.filter({
        user_email: u.email,
      });
      
      const filtered = callNotes?.filter((c) =>
        c.phone_number.includes(query) || c.notes?.toLowerCase().includes(query.toLowerCase())
      ) || [];
      
      setResults(filtered);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2 max-h-80 overflow-auto">
        {loading && <p className="text-slate-400 text-sm">Searching...</p>}
        {!loading && results.length === 0 && search && (
          <p className="text-slate-400 text-sm">No contacts found</p>
        )}
        {results.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectNumber(contact.phone_number)}
            className="w-full p-3 bg-slate-700/30 hover:bg-slate-700 rounded-lg text-left transition"
          >
            <p className="font-semibold text-white">{contact.phone_number}</p>
            {contact.notes && <p className="text-xs text-slate-400">{contact.notes}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}