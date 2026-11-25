import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface LoadingScreenProps {
  backendReady: boolean;
  fullName: string;
}

const SEGMENTS = [0, 1, 2, 3, 4, 5];

function getWedgePath(index: number, outerR: number, innerR: number): string {
  const startDeg = index * 60 - 90 + 4;
  const endDeg = (index + 1) * 60 - 90 - 4;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const x1 = 100 + outerR * Math.cos(toRad(startDeg));
  const y1 = 100 + outerR * Math.sin(toRad(startDeg));
  const x2 = 100 + outerR * Math.cos(toRad(endDeg));
  const y2 = 100 + outerR * Math.sin(toRad(endDeg));

  const x3 = 100 + innerR * Math.cos(toRad(endDeg));
  const y3 = 100 + innerR * Math.sin(toRad(endDeg));
  const x4 = 100 + innerR * Math.cos(toRad(startDeg));
  const y4 = 100 + innerR * Math.sin(toRad(startDeg));

  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} L ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
}

export function LoadingScreen({ backendReady, fullName }: LoadingScreenProps) {
  const [minDurationDone, setMinDurationDone] = useState(false);
  const [maxFallbackDone, setMaxFallbackDone] = useState(false);
  const [progress, setProgress] = useState(8);
  const [visible, setVisible] = useState(true);

  const shouldFinish = minDurationDone && (backendReady || maxFallbackDone);

  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinDurationDone(true), 1750);
    const maxTimer = window.setTimeout(() => setMaxFallbackDone(true), 4500);

    const tick = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92 && !backendReady && !maxFallbackDone) {
          return 92;
        }
        if (prev >= 100) return 100;
        const step = prev < 60 ? 6 : prev < 85 ? 4 : 3;
        return Math.min(100, prev + step);
      });
    }, 65);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.clearInterval(tick);
    };
  }, [backendReady, maxFallbackDone]);

  useEffect(() => {
    if (shouldFinish) {
      setProgress(100);
      const exitTimer = window.setTimeout(() => setVisible(false), 320);
      return () => window.clearTimeout(exitTimer);
    }
  }, [shouldFinish]);

  const activeLitCount = Math.min(6, Math.ceil((progress / 100) * 6));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader-curtain"
          initial={{ opacity: 1, y: 0 }}
          exit={{
            y: '-100%',
            opacity: 0.96,
            transition: { duration: 0.72, ease: [0.76, 0, 0.24, 1] },
          }}
          role="status"
          aria-live="polite"
          aria-label="Loading portfolio"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[var(--bg)] text-[var(--text)] px-6 py-7 sm:px-10 sm:py-9 overflow-hidden select-none"
        >
          {/* Architectural hairline grid overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
              backgroundSize: '96px 96px',
            }}
          />

          {/* Top Coordinates Bar */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] border-b border-[var(--border)] pb-4">
            <span>ABR // PORTFOLIO &amp; BLOG</span>
            <span className="tabular-nums">SYS.06</span>
          </div>

          {/* Center Emblem & Readout */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-7 my-auto">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              <motion.svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              >
                {SEGMENTS.map((idx) => {
                  const isLit = idx < activeLitCount;
                  return (
                    <path
                      key={idx}
                      d={getWedgePath(idx, 86, 48)}
                      fill={isLit ? 'var(--accent)' : 'var(--surface-elevated)'}
                      stroke="var(--border-strong)"
                      strokeWidth="1.5"
                      style={{
                        transition: 'fill 220ms ease',
                        opacity: isLit ? 1 : 0.65,
                      }}
                    />
                  );
                })}
              </motion.svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[var(--text)]">
                  {String(progress).padStart(2, '0')}
                  <span className="text-sm text-[var(--accent)]">%</span>
                </span>
              </div>
            </div>

            <div className="text-center space-y-2 max-w-sm">
              <p className="font-display text-xl sm:text-2xl font-medium tracking-tight text-[var(--text)]">
                {fullName || 'Abdullah Bin Rashid'}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                {progress >= 100
                  ? 'Interface & data synchronized'
                  : backendReady
                    ? 'Preparing visual layout'
                    : 'Loading projects & articles'}
              </p>
            </div>
          </div>

          {/* Bottom Progress Hairline */}
          <div className="relative z-10 space-y-3">
            <div className="h-[2px] w-full bg-[var(--border)] overflow-hidden">
              <motion.div
                className="h-full bg-[var(--accent)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.12, ease: 'linear' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)] uppercase tracking-[0.15em]">
              <span>Karachi · Full-Stack &amp; Design</span>
              <span>{progress < 100 ? 'Initializing' : 'Ready'}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
