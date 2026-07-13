import React, { useEffect, useRef } from 'react';

const BLOBS = [
  { cx: 0.25, cy: 0.35, r: 0.45, color: [0, 240, 255],  alpha: 0.14, sx: 0.18, sy: 0.12, speed: 0.00035 },
  { cx: 0.75, cy: 0.60, r: 0.40, color: [112, 0, 255],  alpha: 0.11, sx: 0.14, sy: 0.16, speed: 0.00025 },
  { cx: 0.50, cy: 0.80, r: 0.35, color: [0, 130, 255],  alpha: 0.09, sx: 0.20, sy: 0.10, speed: 0.00040 },
];

// Drifting radial-gradient blobs on a canvas — the same background used
// behind Hero. Anywhere this sits behind liquid-glass cards, the glass
// blur has actual color to pick up instead of flattening to gray.
export default function AuroraBackground({ className = 'absolute inset-0 w-full h-full pointer-events-none' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let t = 0;

    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      const { width, height } = canvas!;
      ctx!.clearRect(0, 0, width, height);

      for (const b of BLOBS) {
        const x = (b.cx + Math.sin(t * b.speed * 1.0) * b.sx) * width;
        const y = (b.cy + Math.cos(t * b.speed * 1.3) * b.sy) * height;
        const r = b.r * Math.min(width, height);

        const g = ctx!.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${b.color.join(',')},${b.alpha})`);
        g.addColorStop(1, `rgba(${b.color.join(',')},0)`);
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      }

      t++;
      raf = requestAnimationFrame(draw);
    }

    // respect prefers-reduced-motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
