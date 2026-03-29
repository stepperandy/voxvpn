import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isRefreshing) return;
      if (container.scrollTop > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startYRef.current;

      if (distance > 0) {
        setPullDistance(Math.min(distance, 100));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 60 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative overflow-y-auto overscroll-none">
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center h-12 pointer-events-none">
          <div className="text-cyan-400" style={{ opacity: Math.min(pullDistance / 60, 1) }}>
            <RefreshCw
              size={20}
              className={isRefreshing ? 'animate-spin' : ''}
              style={{ transform: `rotate(${pullDistance * 3.6}deg)` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: `translateY(${Math.max(0, pullDistance * 0.5)}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}