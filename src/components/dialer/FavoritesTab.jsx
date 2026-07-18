import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Trash2 } from 'lucide-react';

export default function FavoritesTab({ onSelectNumber }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        const fav = await base44.entities.CallNote.filter({
          user_email: u.email,
          is_favorite: true,
        });
        setFavorites(fav || []);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const removeFavorite = async (id) => {
    await base44.entities.CallNote.update(id, { is_favorite: false });
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) return <div className="p-4 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-2 max-h-96 overflow-auto">
      {favorites.length === 0 ? (
        <p className="p-4 text-slate-400 text-sm">No favorites yet</p>
      ) : (
        favorites.map((fav) => (
          <div
            key={fav.id}
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
          >
            <button
              onClick={() => onSelectNumber(fav.phone_number)}
              className="flex-1 text-left"
            >
              <p className="font-semibold text-white">{fav.phone_number}</p>
              {fav.notes && <p className="text-xs text-slate-400">{fav.notes}</p>}
            </button>
            <button
              onClick={() => removeFavorite(fav.id)}
              className="p-2 text-yellow-400 hover:bg-red-500/20 rounded transition"
            >
              <Star size={18} fill="currentColor" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}