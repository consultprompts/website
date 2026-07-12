import React, { useEffect, useRef } from 'react';

const STATS = [
  { value: '40%', label: 'Avg. Sales Lift' },
  { value: '4.9', label: 'Client Rating' },
  { value: '34',  label: 'Sites Shipped' },
  { value: '72h', label: 'Avg. Turnaround' },
];

const BLOBS = [
  { cx: 0.25, cy: 0.35, r: 0.45, color: [0, 240, 255],  alpha: 0.14, sx: 0.18, sy: 0.12, speed: 0.00035 },
  { cx: 0.75, cy: 0.60, r: 0.40, color: [112, 0, 255],  alpha: 0.11, sx: 0.14, sy: 0.16, speed: 0.00025 },
  { cx: 0.50, cy: 0.80, r: 0.35, color: [0, 130, 255],  alpha: 0.09, sx: 0.20, sy: 0.10, speed: 0.00040 },
];

function AuroraCanvas() {
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

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header id="hero" className="relative px-6 overflow-hidden">
      <AuroraCanvas />

      {/* Centred content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pt-32 pb-20">
        <p className="text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
          Local Web Design — Live in 72 Hours
        </p>

        <h1 className="font-display font-black leading-[0.95] tracking-[-0.03em] mb-6 text-white text-5xl sm:text-6xl md:text-7xl xl:text-[5.5rem]">
          A website your neighbors{' '}
          <em className="text-brand-primary italic">actually</em> use.
        </h1>

        <p className="text-ink-muted text-base md:text-lg leading-relaxed mb-10 max-w-lg">
          We build fast, no-nonsense sites for local businesses. Three days, three prices, no
          agency overhead. Starting at $299.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo('pricing')}
            className="bg-brand-primary text-bg-base font-bold px-8 py-4 rounded-xl hover:bg-brand-primary/90 transition-colors cursor-pointer"
          >
            See pricing →
          </button>
          <button
            onClick={() => scrollTo('reviews')}
            className="border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:border-white/50 transition-colors cursor-pointer"
          >
            View recent work
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-20 border-y border-white/5 bg-bg-base/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-ink-muted mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
