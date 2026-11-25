import { motion } from 'motion/react';
import { THEMES, useTheme } from '../context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Select visual theme"
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-1 p-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/95 backdrop-blur-md shadow-xl"
    >
      {THEMES.map((item) => {
        const active = item.id === theme;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTheme(item.id)}
            aria-pressed={active}
            aria-label={`Switch to ${item.name} theme`}
            className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              active ? 'text-[var(--accent-fg)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {active && (
              <motion.span
                layoutId="active-theme-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-full bg-[var(--accent)]"
              />
            )}
            <span
              className="relative z-10 w-2.5 h-2.5 rounded-full border border-black/25 shrink-0"
              style={{ backgroundColor: item.swatches[0] }}
              aria-hidden="true"
            />
            <span className="relative z-10 whitespace-nowrap">{item.shortName}</span>
          </button>
        );
      })}
    </div>
  );
}
