import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const SECTIONS = [
  { id: 'hero', num: '01', label: 'Overview' },
  { id: 'about', num: '02', label: 'About' },
  { id: 'projects', num: '03', label: 'Projects' },
  { id: 'skills', num: '04', label: 'Skills' },
  { id: 'contact', num: '05', label: 'Contact' },
];

export function SectionRail() {
  const [activeId, setActiveId] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const triggerY = window.scrollY + window.innerHeight * 0.35;
      let current = 'hero';

      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= triggerY) {
          current = sec.id;
        }
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jumpTo = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Section index"
      className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-1.5 p-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md"
    >
      {SECTIONS.map((sec) => {
        const active = activeId === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => jumpTo(sec.id)}
            aria-label={`Jump to ${sec.label}`}
            title={`${sec.num} · ${sec.label}`}
            className="group relative w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
          >
            {active && (
              <motion.span
                layoutId="section-rail-active"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full bg-[var(--accent)]"
              />
            )}
            <span
              className={`relative z-10 font-mono text-[10px] tabular-nums transition-colors ${
                active
                  ? 'text-[var(--accent-fg)] font-semibold'
                  : 'text-[var(--muted)] group-hover:text-[var(--text)]'
              }`}
            >
              {sec.num}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
