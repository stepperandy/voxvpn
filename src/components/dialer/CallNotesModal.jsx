import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Star } from 'lucide-react';

export default function CallNotesModal({ phoneNumber, onClose, user }) {
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!notes.trim()) return;
    
    setSaving(true);
    try {
      await base44.entities.CallNote.create({
        user_email: user.email,
        phone_number: phoneNumber,
        notes: notes.trim(),
        is_favorite: isFavorite,
      });
      onClose();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50 md:items-center md:justify-center">
      <div className="bg-slate-800 w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Add Note</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-2">Number: {phoneNumber}</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add call notes..."
            className="w-full p-3 bg-slate-700 text-white rounded-lg placeholder-slate-500 focus:outline-none resize-none h-24"
          />
        </div>

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`flex items-center gap-2 p-2 rounded-lg transition ${
            isFavorite
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-slate-700/30 text-slate-400 hover:text-white'
          }`}
        >
          <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!notes.trim() || saving}
            className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}