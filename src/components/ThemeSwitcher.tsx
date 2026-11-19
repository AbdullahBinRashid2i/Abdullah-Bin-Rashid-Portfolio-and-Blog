import { useEffect, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { THEMES, useTheme } from '../context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme, currentThemeDef } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-40">
      {open && (
        <div
          role="menu"
          aria-label="Select visual theme"
          className="mb-2.5 w-64 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-2 shadow-xl"
        >
          <div className="px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] border-b border-[var(--border)] mb-1.5">
            Visual Theme (4 Presets)
          </div>
          <div className="flex flex-col gap-1">
            {THEMES.map((item) => {
              const active = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setTheme(item.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--surface-elevated)] text-[var(--text)]'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex items-center -space-x-1 shrink-0" aria-hidden="true">
                      {item.swatches.map((hex, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-[var(--border-strong)]"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[var(--text)] truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Change theme. Current theme: ${currentThemeDef.name}`}
        className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-lg hover:border-[var(--accent)] transition-colors cursor-pointer"
      >
        <Palette className="w-4 h-4 text-[var(--accent)] shrink-0" />
        <span className="text-xs font-medium whitespace-nowrap">
          Theme: {currentThemeDef.shortName}
        </span>
        <span className="flex items-center -space-x-1 shrink-0" aria-hidden="true">
          {currentThemeDef.swatches.map((hex, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-[var(--border-strong)]"
              style={{ backgroundColor: hex }}
            />
          ))}
        </span>
      </button>
    </div>
  );
}
