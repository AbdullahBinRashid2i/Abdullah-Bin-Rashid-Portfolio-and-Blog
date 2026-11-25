import { Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AppView } from '../types';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateView: (view: AppView) => void;
}

export function Footer({ onOpenAdmin, onNavigateView }: FooterProps) {
  const { profile, isAdmin, authLoading } = useData();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] mt-12 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
              ABR // KARACHI · REMOTE
            </p>
            <p className="text-xs text-[var(--muted)]">
              © {year} {profile.fullName}. Built with React, Motion &amp; Firebase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--muted)]">
            <button
              type="button"
              onClick={() => onNavigateView('portfolio')}
              className="hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              Portfolio
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('blog')}
              className="hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              Blog
            </button>
            {profile.socialLinks.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text)] transition-colors"
              >
                GitHub
              </a>
            )}
            {profile.socialLinks.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text)] transition-colors"
              >
                LinkedIn
              </a>
            )}
            <span aria-hidden="true" className="text-[var(--border-strong)]">
              ·
            </span>
            <button
              type="button"
              disabled={authLoading}
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3 h-3" />
              <span>{isAdmin ? 'Admin CMS' : authLoading ? 'Signing in...' : 'Admin Login'}</span>
            </button>
          </div>
        </div>

        {/* Monumental Editorial Wordmark */}
        <div
          aria-hidden="true"
          className="pt-6 border-t border-[var(--border)] select-none"
        >
          <p className="font-display text-[11vw] sm:text-[8.5vw] lg:text-[6.25rem] font-medium tracking-tight leading-[0.9] text-[var(--text)]/90">
            {(() => {
              const raw = (profile.footerWordmark || 'abdullah.binrashid').trim();
              const dotIdx = raw.indexOf('.');
              if (dotIdx > 0 && dotIdx < raw.length - 1) {
                return (
                  <>
                    {raw.slice(0, dotIdx)}
                    <span className="text-[var(--accent)]">.</span>
                    {raw.slice(dotIdx + 1)}
                  </>
                );
              }
              return raw;
            })()}
          </p>
        </div>
      </div>
    </footer>
  );
}
