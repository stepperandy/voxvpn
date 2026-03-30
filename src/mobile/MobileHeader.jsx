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
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/e4e826602_f43645b8-7e9b-46cb-9b95-1fc45590f65b.png"
            alt="VoxVPN"
            className="h-8 w-auto"
          />
        </div>
      )}

      {!isRoot && (
        <h1 className="text-white font-bold text-base flex-1 text-center">{title}</h1>
      )}

      <div className="w-8" />
    </header>
  );
}