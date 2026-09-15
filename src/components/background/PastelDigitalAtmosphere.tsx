import React, { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  targetX: number;
  targetY: number;
}

export const PastelDigitalAtmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Palette: Lavender, Powder blue, Mint, Peach, Blush
    const colors = [
      'rgba(196, 181, 253, 0.16)', // Lavender
      'rgba(186, 230, 253, 0.18)', // Powder Blue
      'rgba(167, 243, 208, 0.13)', // Mint
      'rgba(254, 215, 170, 0.15)', // Peach
      'rgba(251, 207, 232, 0.14)', // Blush
      'rgba(147, 197, 253, 0.14)', // Soft Sky
    ];

    const blobs: Blob[] = colors.map((color, i) => {
      const radius = Math.min(width, height) * (0.35 + (i % 3) * 0.08);
      const angle = (i / colors.length) * Math.PI * 2;
      const dist = Math.min(width, height) * 0.28;
      const x = width / 2 + Math.cos(angle) * dist;
      const y = height / 2 + Math.sin(angle) * dist;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius,
        color,
        targetX: x,
        targetY: y,
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.005;

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const mouseNormX = (mouse.x / width - 0.5) * 2;
      const mouseNormY = (mouse.y / height - 0.5) * 2;

      ctx.clearRect(0, 0, width, height);

      // Deep, luminous midnight base
      ctx.fillStyle = '#070A11';
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob, idx) => {
        if (!prefersReducedMotion) {
          // Slow organic floating orbit
          const orbitAngle = time * 0.4 + (idx * Math.PI * 2) / blobs.length;
          const orbitRadius = 60 + idx * 15;
          const targetFloatX = blob.targetX + Math.cos(orbitAngle) * orbitRadius;
          const targetFloatY = blob.targetY + Math.sin(orbitAngle * 0.8) * orbitRadius;

          // Parallax towards mouse
          const parallaxFactor = (idx + 1) * 12;
          const destX = targetFloatX + mouseNormX * parallaxFactor;
          const destY = targetFloatY + mouseNormY * parallaxFactor;

          blob.x += (destX - blob.x) * 0.02;
          blob.y += (destY - blob.y) * 0.02;
        }

        // Draw soft radiant radial gradient
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(0.6, blob.color.replace(/[\d.]+\)$/, '0.04)'));
        gradient.addColorStop(1, 'rgba(7, 10, 17, 0)');

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Subtle atmospheric ambient haze overlay
      const ambient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      ambient.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
      ambient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
