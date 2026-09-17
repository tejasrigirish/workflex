import React, { useEffect, useRef } from 'react';

/**
 * WORKFLEX — MAGNETIC FLUID BACKGROUND
 * 
 * Architecture:
 * - Layer 1: Distant soft ambient canvas base (Deep Midnight Slate: #070A12)
 * - Layer 2: 7 Large Organic Morphing Pastel Fluid Formations
 * - Layer 3: Magnetic Field interaction with spring physics & vertex deformation
 * - Layer 4: Subtle light scattering haze film
 * 
 * Colors: Lavender, Soft Violet, Powder Blue, Mint, Pale Cyan, Soft Peach, Subtle Pink
 * Saturation: Delicately controlled, no harsh neon, ultra-soft blending
 */

interface FluidBlob {
  id: number;
  name: string;
  color: string;
  baseXRatio: number;
  baseYRatio: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  vertexCount: number;
  vertexHarmonics: { freq: number; amp: number; phase: number }[];
  springK: number;
  damping: number;
  magneticSensitivity: number;
  driftSpeed: number;
  driftAngle: number;
  driftRadius: number;
}

export const MagneticBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse coordinates with spring state
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isMoving: false,
      lastMoveTime: 0,
      active: false,
    };

    // 7 Carefully curated atmospheric pastel colors
    const blobConfigs = [
      {
        name: 'Lavender',
        color: 'rgba(196, 181, 253, 0.28)', // Soft Lavender
        baseX: 0.22,
        baseY: 0.25,
        radiusRatio: 0.38,
        springK: 0.024,
        damping: 0.88,
        magneticSensitivity: 1.1,
        driftSpeed: 0.0006,
        driftRadius: 65,
      },
      {
        name: 'Powder Blue',
        color: 'rgba(186, 230, 253, 0.30)', // Powder Blue
        baseX: 0.78,
        baseY: 0.28,
        radiusRatio: 0.42,
        springK: 0.020,
        damping: 0.89,
        magneticSensitivity: 1.0,
        driftSpeed: 0.0005,
        driftRadius: 75,
      },
      {
        name: 'Soft Violet',
        color: 'rgba(216, 180, 254, 0.24)', // Soft Violet
        baseX: 0.50,
        baseY: 0.15,
        radiusRatio: 0.35,
        springK: 0.022,
        damping: 0.87,
        magneticSensitivity: 1.25,
        driftSpeed: 0.0007,
        driftRadius: 55,
      },
      {
        name: 'Mint',
        color: 'rgba(167, 243, 208, 0.25)', // Mint
        baseX: 0.18,
        baseY: 0.75,
        radiusRatio: 0.40,
        springK: 0.018,
        damping: 0.90,
        magneticSensitivity: 0.95,
        driftSpeed: 0.00055,
        driftRadius: 70,
      },
      {
        name: 'Pale Cyan',
        color: 'rgba(165, 243, 252, 0.26)', // Pale Cyan
        baseX: 0.82,
        baseY: 0.76,
        radiusRatio: 0.39,
        springK: 0.021,
        damping: 0.89,
        magneticSensitivity: 1.05,
        driftSpeed: 0.00065,
        driftRadius: 60,
      },
      {
        name: 'Soft Peach',
        color: 'rgba(254, 215, 170, 0.22)', // Soft Peach
        baseX: 0.48,
        baseY: 0.65,
        radiusRatio: 0.36,
        springK: 0.019,
        damping: 0.88,
        magneticSensitivity: 1.15,
        driftSpeed: 0.0006,
        driftRadius: 65,
      },
      {
        name: 'Subtle Pink',
        color: 'rgba(251, 207, 232, 0.24)', // Subtle Blush Pink
        baseX: 0.52,
        baseY: 0.90,
        radiusRatio: 0.37,
        springK: 0.023,
        damping: 0.87,
        magneticSensitivity: 0.9,
        driftSpeed: 0.0005,
        driftRadius: 50,
      },
    ];

    // Instantiate fluid formations with dynamic vertex harmonic sets
    const blobs: FluidBlob[] = blobConfigs.map((cfg, i) => {
      const minDim = Math.min(width, height);
      const baseR = minDim * cfg.radiusRatio;
      const initialX = width * cfg.baseX;
      const initialY = height * cfg.baseY;

      // 10 radial vertices per blob for smooth organic morphing
      const vertexCount = 10;
      const vertexHarmonics = [
        { freq: 1.8 + (i % 3) * 0.4, amp: 0.14, phase: (i * Math.PI) / 3 },
        { freq: 2.6 + ((i + 1) % 3) * 0.3, amp: 0.09, phase: (i * Math.PI) / 2 },
        { freq: 0.9 + (i % 2) * 0.3, amp: 0.07, phase: i },
      ];

      return {
        id: i,
        name: cfg.name,
        color: cfg.color,
        baseXRatio: cfg.baseX,
        baseYRatio: cfg.baseY,
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        baseRadius: baseR,
        radius: baseR,
        vertexCount,
        vertexHarmonics,
        springK: cfg.springK,
        damping: cfg.damping,
        magneticSensitivity: cfg.magneticSensitivity,
        driftSpeed: cfg.driftSpeed,
        driftAngle: (i * Math.PI * 2) / blobConfigs.length,
        driftRadius: cfg.driftRadius,
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      mouse.isMoving = true;
      mouse.lastMoveTime = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
        mouse.isMoving = true;
        mouse.lastMoveTime = performance.now();
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const currentDpr = width < 768 ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * currentDpr;
      canvas.height = height * currentDpr;
      ctx.scale(currentDpr, currentDpr);

      const minDim = Math.min(width, height);
      blobs.forEach((b, idx) => {
        const scaleMod = width < 640 ? 0.8 : 1;
        b.baseRadius = minDim * blobConfigs[idx].radiusRatio * scaleMod;
      });
    };

    const isTouchDevice =
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

    // Desktop: Full magnetic mouse interaction.
    // Mobile/Touch: Subtle ambient fluid drift (zero touchmove CPU overhead or scroll interference).
    if (!isTouchDevice && !prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.005;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      if (performance.now() - mouse.lastMoveTime > 300) {
        mouse.isMoving = false;
      }

      // Layer 1: Distant Deep Midnight Base
      ctx.fillStyle = '#070A12';
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Render each fluid blob with organic morphing & magnetic interaction
      blobs.forEach((blob) => {
        // Natural ambient continuous harmonic drift
        const curDriftAngle = blob.driftAngle + time * (blob.driftSpeed * 1000);
        const naturalAnchorX =
          width * blob.baseXRatio + Math.cos(curDriftAngle) * blob.driftRadius;
        const naturalAnchorY =
          height * blob.baseYRatio + Math.sin(curDriftAngle * 0.8) * (blob.driftRadius * 0.85);

        let targetPosX = naturalAnchorX;
        let targetPosY = naturalAnchorY;

        if (!prefersReducedMotion && mouse.active) {
          // Calculate distance to cursor
          const dx = mouse.x - blob.x;
          const dy = mouse.y - blob.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Magnetic attraction: nearest blob moves subtly toward cursor,
          // further blobs experience progressive soft falloff
          const maxInfluenceDist = Math.max(width, height) * 0.75;
          if (dist < maxInfluenceDist) {
            const pullStrength =
              Math.pow(1 - dist / maxInfluenceDist, 2) * 90 * blob.magneticSensitivity;
            const angle = Math.atan2(dy, dx);
            targetPosX += Math.cos(angle) * pullStrength;
            targetPosY += Math.sin(angle) * pullStrength;
          }
        }

        // Spring physics for slow, organic, smooth settling
        if (!prefersReducedMotion) {
          const ax = (targetPosX - blob.x) * blob.springK;
          const ay = (targetPosY - blob.y) * blob.springK;
          blob.vx = (blob.vx + ax) * blob.damping;
          blob.vy = (blob.vy + ay) * blob.damping;
          blob.x += blob.vx;
          blob.y += blob.vy;
        } else {
          blob.x = naturalAnchorX;
          blob.y = naturalAnchorY;
        }

        // Breathing pulsation (slight expansion/contraction)
        const breathe = Math.sin(time * 0.8 + blob.id * 1.3) * (blob.baseRadius * 0.08);
        const effectiveRadius = blob.baseRadius + breathe;

        // Draw the organic morphed fluid contour using radial vertices & smooth Bezier curves
        const vertexPoints: { x: number; y: number }[] = [];
        const count = blob.vertexCount;

        for (let j = 0; j < count; j++) {
          const theta = (j / count) * Math.PI * 2;

          // Continuous harmonic deformation
          let morphOffset = 0;
          if (!prefersReducedMotion) {
            blob.vertexHarmonics.forEach((h) => {
              morphOffset +=
                Math.sin(theta * h.freq + time * 1.2 + h.phase) * (effectiveRadius * h.amp);
            });

            // If mouse is active and near this vertex, gently stretch facing vertices toward cursor
            if (mouse.active) {
              const vx = blob.x + Math.cos(theta) * effectiveRadius;
              const vy = blob.y + Math.sin(theta) * effectiveRadius;
              const dMouse = Math.hypot(mouse.x - vx, mouse.y - vy);
              if (dMouse < effectiveRadius * 1.4) {
                const deformFactor = (1 - dMouse / (effectiveRadius * 1.4)) * 30;
                morphOffset += deformFactor;
              }
            }
          }

          const r = Math.max(effectiveRadius * 0.4, effectiveRadius + morphOffset);
          vertexPoints.push({
            x: blob.x + Math.cos(theta) * r,
            y: blob.y + Math.sin(theta) * r,
          });
        }

        // Create fluid radial gradient with ultra-soft falloff
        const grad = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          effectiveRadius * 1.25
        );
        grad.addColorStop(0, blob.color);
        // Soft intermediate blend
        grad.addColorStop(0.45, blob.color.replace(/[\d.]+\)$/, '0.12)'));
        grad.addColorStop(0.75, blob.color.replace(/[\d.]+\)$/, '0.03)'));
        grad.addColorStop(1, 'rgba(7, 10, 18, 0)');

        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();

        // Connect vertex points with smooth cardinal/cubic curves
        const len = vertexPoints.length;
        ctx.moveTo(
          (vertexPoints[0].x + vertexPoints[len - 1].x) / 2,
          (vertexPoints[0].y + vertexPoints[len - 1].y) / 2
        );

        for (let k = 0; k < len; k++) {
          const curr = vertexPoints[k];
          const next = vertexPoints[(k + 1) % len];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Layer 3: Atmospheric Light Scattering Haze & Vignette
      const hazeGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        Math.min(width, height) * 0.25,
        width / 2,
        height * 0.45,
        Math.max(width, height) * 0.85
      );
      hazeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
      hazeGrad.addColorStop(0.6, 'rgba(7, 10, 18, 0.15)');
      hazeGrad.addColorStop(1, 'rgba(4, 6, 12, 0.65)');

      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none"
      style={{ opacity: 1 }}
      aria-hidden="true"
    />
  );
};
