import { useEffect, useRef } from "react";

export function usePullToRefresh(onRefresh, containerRef) {
  const touchStartY = useRef(0);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;

      if (container.scrollTop === 0 && diff > 60) {
        onRefresh();
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onRefresh, containerRef]);
}