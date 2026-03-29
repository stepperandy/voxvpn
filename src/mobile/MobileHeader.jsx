import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MobileHeader({ title, showBack = true, rootPath = '/' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === rootPath;

  return (
    <header
      className="sticky top-0 z-40 bg-[#080c18] border-b border-white/5 flex items-center justify-between px-4 h-14"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {showBack && !isRoot && (
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 touch-target hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} className="text-white" strokeWidth={2.5} />
        </button>
      )}

      {isRoot && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="text-white font-bold text-sm">VoxVPN</span>
        </div>
      )}

      {!isRoot && (
        <h1 className="text-white font-bold text-base flex-1 text-center">{title}</h1>
      )}

      <div className="w-8" />
    </header>
  );
}