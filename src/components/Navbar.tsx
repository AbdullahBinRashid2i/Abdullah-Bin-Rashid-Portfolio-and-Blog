import { useState } from 'react';
import { FileDown, Menu, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AppView } from '../types';

interface NavbarProps {
  view: AppView;
  onNavigateView: (next: AppView) => void;
  onJumpSection: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar({ view, onNavigateView, onJumpSection }: NavbarProps) {
  const { profile, isAdmin, signOutAdmin } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isBlogOrPost = view === 'blog' || view === 'post-detail';
  const primaryLabel = isBlogOrPost || view === 'admin' ? 'Portfolio' : 'Blog';

  const handlePrimaryAction = () => {
    setMobileOpen(false);
    if (isBlogOrPost || view === 'admin') {
      onNavigateView('portfolio');
    } else {
      onNavigateView('blog');
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setMobileOpen(false);
    onJumpSection(sectionId);
  };

  return (
    <>
      {isAdmin && view !== 'admin' && (
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 lg:px-8 py-2">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 text-xs">
            <span className="text-[var(--muted)] truncate">
              Admin session active ({profile.socialLinks.email || 'abdullahbinrashid0@gmail.com'})
            </span>
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateView('admin')}
                className="font-medium text-[var(--accent)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open CMS Dashboard
              </button>
              <button
                type="button"
                onClick={() => void signOutAdmin()}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => onNavigateView('portfolio')}
            className="font-display text-lg font-semibold tracking-tight text-[var(--text)] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            {profile.fullName}
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--muted)]"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionClick(item.id)}
                className="hover:text-[var(--text)] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-[var(--border-strong)]"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions - Resume Button & View Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={profile.resumeUrl || '/Abdullah_Bin_Rashid_Resume.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              download="Abdullah_Bin_Rashid_Resume.pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all whitespace-nowrap shadow-sm cursor-pointer"
              title="View or Download Resume"
            >
              <FileDown className="w-4 h-4 text-[var(--accent)]" />
              <span>Resume</span>
            </a>

            <button
              type="button"
              onClick={handlePrimaryAction}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            >
              {primaryLabel}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-3">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionClick(item.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-2 border-t border-[var(--border)]">
              <a
                href={profile.resumeUrl || '/Abdullah_Bin_Rashid_Resume.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                download="Abdullah_Bin_Rashid_Resume.pdf"
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)] transition-colors"
              >
                <FileDown className="w-4 h-4 text-[var(--accent)]" />
                View / Download Resume
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
