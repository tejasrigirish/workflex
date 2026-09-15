import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [target, setTarget] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'input' | 'card'>('default');
  const [isMagnetic, setIsMagnetic] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Check user preference or touch device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice =
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

    if (prefersReducedMotion || isTouchDevice) return;

    const onMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const targetEl = e.target as HTMLElement | null;

      // Check interactive elements
      if (targetEl) {
        const isInput = targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA';
        const buttonEl = targetEl.closest('button') || targetEl.closest('[role="button"]') || targetEl.closest('.btn-floating-primary') || targetEl.closest('.btn-floating-glass') || targetEl.closest('a');
        const cardEl = targetEl.closest('.role-card') || targetEl.closest('.glass-card') || targetEl.closest('.glass-card-static') || targetEl.closest('[data-magnetic="true"]');

        if (isInput) {
          setCursorType('input');
          setIsMagnetic(false);
          setTarget({ x: e.clientX, y: e.clientY });
          return;
        }

        if (buttonEl) {
          setCursorType('pointer');
          // Magnetic attraction to button center
          const rect = buttonEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distX = e.clientX - centerX;
          const distY = e.clientY - centerY;
          // Soft pull
          setTarget({
            x: centerX + distX * 0.35,
            y: centerY + distY * 0.35,
          });
          setIsMagnetic(true);
          return;
        }

        if (cardEl) {
          setCursorType('card');
          const rect = cardEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distX = e.clientX - centerX;
          const distY = e.clientY - centerY;
          setTarget({
            x: centerX + distX * 0.6,
            y: centerY + distY * 0.6,
          });
          setIsMagnetic(true);
          return;
        }
      }

      setCursorType('default');
      setIsMagnetic(false);
      setTarget({ x: e.clientX, y: e.clientY });
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Smooth lerp loop for the trailing ring
  useEffect(() => {
    let currentX = target.x;
    let currentY = target.y;

    const animate = () => {
      // Lerp factor
      const ease = isMagnetic ? 0.22 : 0.16;
      currentX += (target.x - currentX) * ease;
      currentY += (target.y - currentY) * ease;

      setPos({ x: currentX, y: currentY });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [target, isMagnetic]);

  if (!isVisible) return null;

  return (
    <>
      {/* Small center dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[100] transition-transform duration-75 ease-out ${
          cursorType === 'input'
            ? 'w-1.5 h-6 bg-[#BAE6FD] rounded-sm'
            : cursorType === 'card'
            ? 'w-3 h-3 bg-[#BAE6FD] rounded-full shadow-[0_0_14px_rgba(186,230,253,0.9)]'
            : cursorType === 'pointer'
            ? 'w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(199,210,254,0.6)]'
            : 'w-2 h-2 bg-[#BAE6FD] rounded-full shadow-[0_0_8px_rgba(186,230,253,0.8)]'
        }`}
        style={{
          transform: `translate3d(${target.x - (cursorType === 'input' ? 3 : 4)}px, ${target.y - (cursorType === 'input' ? 12 : 4)}px, 0)`,
        }}
      />

      {/* Soft trailing ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99] rounded-full transition-[width,height,border-color,background-color,box-shadow] duration-200 ${
          cursorType === 'input'
            ? 'w-8 h-8 border border-[#BAE6FD]/40 bg-[#BAE6FD]/5'
            : cursorType === 'card'
            ? 'w-14 h-14 border border-[#C7D2FE]/70 bg-[#C7D2FE]/10 shadow-[0_0_24px_rgba(199,210,254,0.3)]'
            : cursorType === 'pointer'
            ? 'w-10 h-10 border border-white/70 bg-white/10'
            : 'w-8 h-8 border border-[#BAE6FD]/40 bg-transparent'
        }`}
        style={{
          transform: `translate3d(${pos.x - (cursorType === 'card' ? 28 : cursorType === 'pointer' ? 20 : 16)}px, ${pos.y - (cursorType === 'card' ? 28 : cursorType === 'pointer' ? 20 : 16)}px, 0)`,
        }}
      />
    </>
  );
};
