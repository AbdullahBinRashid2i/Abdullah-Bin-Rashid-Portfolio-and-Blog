import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { BlogView } from './components/BlogView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { PortfolioView } from './components/PortfolioView';
import { SectionRail } from './components/SectionRail';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ToastContainer } from './components/ToastContainer';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppView } from './types';

function AppShell() {
  const { isAdmin, signInAsAdmin, authError, clearAuthError, loadingData, profile } = useData();
  const [view, setView] = useState<AppView>('portfolio');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Immediately exit admin view if admin signs out or loses authorization
  useEffect(() => {
    if (view === 'admin' && !isAdmin) {
      setView('portfolio');
    }
  }, [view, isAdmin]);

  const handleNavigateView = useCallback((next: AppView) => {
    if (next === 'admin' && !isAdmin) return;
    if (next !== 'post-detail') {
      setSelectedPostId(null);
    }
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAdmin]);

  const handleJumpSection = useCallback(
    (sectionId: string) => {
      if (view !== 'portfolio') {
        setView('portfolio');
        setSelectedPostId(null);
        window.setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [view]
  );

  const handleOpenPost = useCallback((postId: string | null) => {
    setSelectedPostId(postId);
    setView(postId ? 'post-detail' : 'blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenAdmin = useCallback(async () => {
    if (isAdmin) {
      setView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const ok = await signInAsAdmin();
    if (ok) {
      setView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAdmin, signInAsAdmin]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <LoadingScreen backendReady={!loadingData} fullName={profile.fullName} />
      <Navbar
        view={view}
        onNavigateView={handleNavigateView}
        onJumpSection={handleJumpSection}
      />
      {view === 'portfolio' && <SectionRail />}

      {authError && (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 mt-4">
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-xl border border-[var(--danger)]/40 bg-[var(--surface)] px-4 py-3 text-xs text-[var(--text)]"
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{authError}</p>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              aria-label="Dismiss alert"
              className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        {view === 'admin' && isAdmin ? (
          <AdminDashboard onExitAdmin={() => handleNavigateView('portfolio')} />
        ) : view === 'blog' || view === 'post-detail' ? (
          <BlogView
            selectedPostId={selectedPostId}
            onSelectPost={handleOpenPost}
            onBackToPortfolio={() => handleNavigateView('portfolio')}
          />
        ) : (
          <PortfolioView
            onOpenBlog={() => handleNavigateView('blog')}
            onOpenPost={(postId) => handleOpenPost(postId)}
          />
        )}
      </div>

      <Footer onOpenAdmin={() => void handleOpenAdmin()} onNavigateView={handleNavigateView} />
      <ThemeSwitcher />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DataProvider>
          <AppShell />
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
