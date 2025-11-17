import { useEffect, useRef, useState } from 'react';

interface SwipeToCloseOptions {
  onClose: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useSwipeToClose = ({ 
  onClose, 
  threshold = 100,
  enabled = true 
}: SwipeToCloseOptions) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance to trigger close
  const minSwipeDistance = threshold;

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow swipe from the top portion of the dialog
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();
      const touchY = touch.clientY - rect.top;
      
      // Allow swipe if touching within first 20% of dialog height
      if (touchY < rect.height * 0.2) {
        setTouchStart(touch.clientY);
        setTouchEnd(null);
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStart === null) return;
      
      const touch = e.touches[0];
      const currentY = touch.clientY;
      const diff = currentY - touchStart;
      
      // Only allow downward swipes
      if (diff > 0) {
        setTranslateY(diff);
        setTouchEnd(currentY);
        
        // Prevent page scroll while swiping dialog
        if (diff > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) {
        setIsDragging(false);
        setTranslateY(0);
        return;
      }

      const distance = touchEnd - touchStart;
      
      if (distance > minSwipeDistance) {
        // Trigger close animation
        setTranslateY(window.innerHeight);
        setTimeout(() => {
          onClose();
          setTranslateY(0);
          setIsDragging(false);
        }, 200);
      } else {
        // Snap back
        setTranslateY(0);
        setIsDragging(false);
      }
      
      setTouchStart(null);
      setTouchEnd(null);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, onClose, enabled, minSwipeDistance]);

  return {
    elementRef,
    translateY,
    isDragging,
    swipeProps: {
      ref: elementRef,
      style: {
        transform: `translateY(${translateY}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      },
    },
  };
};
