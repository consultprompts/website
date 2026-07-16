import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const BLOBS_DARK = [
  { cx: 25, cy: 35, r: 45, color: '0,240,255',  alpha: 0.14, dx: 18, dy: 12, dur: 34 },
  { cx: 75, cy: 60, r: 40, color: '112,0,255',  alpha: 0.11, dx: 14, dy: 16, dur: 46 },
  { cx: 50, cy: 80, r: 35, color: '0,130,255',  alpha: 0.09, dx: 20, dy: 10, dur: 28 },
];

// Light theme: warm orange palette matching the light-mode brand
// accent (#EA580C), pushed to more saturated/brighter hues and higher
// alpha than the brand color itself — low-alpha, low-saturation color
// barely registers on white and just looks like a gray smudge.
const BLOBS_LIGHT = [
  { cx: 25, cy: 35, r: 45, color: '255,87,34',  alpha: 0.38, dx: 18, dy: 12, dur: 34 },
  { cx: 75, cy: 60, r: 40, color: '255,110,20', alpha: 0.32, dx: 14, dy: 16, dur: 46 },
  { cx: 50, cy: 80, r: 35, color: '255,61,0',   alpha: 0.30, dx: 20, dy: 10, dur: 28 },
];

// Drifting radial-gradient blobs — the same background used behind Hero.
// Anywhere this sits behind liquid-glass cards, the glass blur has actual
// color to pick up instead of flattening to gray.
//
// Plain CSS (not <canvas>) on purpose: Chromium has a long-standing bug
// where backdrop-filter: blur() over a freshly-mounted <canvas> samples an
// uninitialized (black) texture until the canvas's GPU layer is composited,
// producing a black flash on load wherever a blurred glass card sits above
// this background. Painted divs don't have a separate raster/texture-upload
// step, so there's nothing for backdrop-filter to race.
export default function AuroraBackground({ className = 'absolute inset-0 w-full h-full pointer-events-none overflow-hidden' }: { className?: string }) {
  const { theme } = useTheme();
  const BLOBS = theme === 'light' ? BLOBS_LIGHT : BLOBS_DARK;

  return (
    <div className={className} aria-hidden="true">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="aurora-blob absolute rounded-full"
          style={{
            left: `${b.cx}%`,
            top: `${b.cy}%`,
            width: `${b.r * 2}vmin`,
            height: `${b.r * 2}vmin`,
            background: `radial-gradient(circle, rgba(${b.color},${b.alpha}) 0%, rgba(${b.color},0) 70%)`,
            ['--aurora-dx' as string]: `${b.dx}vmin`,
            ['--aurora-dy' as string]: `${b.dy}vmin`,
            animationDuration: `${b.dur}s`,
            animationDelay: `${-i * 7}s`,
          }}
        />
      ))}
    </div>
  );
}
