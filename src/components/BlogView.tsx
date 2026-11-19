import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate } from '../lib/validation';
import { BlogPost } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ResilientImage } from './ResilientImage';

interface BlogViewProps {
  selectedPostId: string | null;
  onSelectPost: (postId: string | null) => void;
  onBackToPortfolio: () => void;
}

export function BlogView({
  selectedPostId,
  onSelectPost,
  onBackToPortfolio,
}: BlogViewProps) {
  const { publishedPosts, profile, loadingData } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('All');

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    publishedPosts.forEach((post) => {
      post.tags.forEach((t) => tagSet.add(t));
    });
    return ['All', ...Array.from(tagSet).sort((a, b) => a.localeCompare(b))];
  }, [publishedPosts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedPosts.filter((post) => {
      const matchesTag = activeTag === 'All' || post.tags.includes(activeTag);
      if (!matchesTag) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.content.toLowerCase().includes(q)
      );
    });
  }, [publishedPosts, searchQuery, activeTag]);

  const activePost: BlogPost | undefined = selectedPostId
    ? publishedPosts.find((p) => p.id === selectedPostId)
    : undefined;

  if (selectedPostId && activePost) {
    const related = publishedPosts.filter((p) => p.id !== activePost.id).slice(0, 2);

    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <button
          type="button"
          onClick={() => onSelectPost(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </button>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--muted)] mb-4">
              <span className="tabular-nums">{formatDate(activePost.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{activePost.readingTimeMinutes} min read</span>
              {activePost.tags.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activePost.tags.join(' / ')}</span>
                </>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.12] text-[var(--text)] mb-4">
              {activePost.title}
            </h1>

            <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-[65ch]">
              {activePost.excerpt}
            </p>
          </header>

          {activePost.coverImageUrl && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] aspect-[16/9]">
              <ResilientImage
                src={activePost.coverImageUrl}
                alt={activePost.title}
                fallbackTitle={activePost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="max-w-[70ch]">
            <MarkdownRenderer
              content={activePost.content}
              featuredYoutubeUrl={activePost.youtubeUrl}
            />
          </div>

          <div className="mt-14 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--muted)]">Written by</p>
              <p className="font-display text-base font-semibold text-[var(--text)]">
                {profile.fullName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectPost(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-strong)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] transition-colors self-start sm:self-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Articles
            </button>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[var(--border)]">
            <h2 className="font-display text-xl font-semibold text-[var(--text)] mb-6">
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => {
                    onSelectPost(post.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group text-left rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2 tabular-nums">
                    <span>{formatDate(post.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-1.5">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-10 border-b border-[var(--border)]">
        <div>
          <button
            type="button"
            onClick={onBackToPortfolio}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Portfolio
          </button>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text)] mb-3">
            Writing &amp; Notes
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-[58ch]">
            Articles, engineering breakdowns, and visual design essays on full-stack development, Firebase architecture, and typography.
          </p>
        </div>

        <p className="text-sm text-[var(--muted)] tabular-nums shrink-0">
          {filteredPosts.length} of {publishedPosts.length}{' '}
          {publishedPosts.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      {/* Live Search & Interactive Tag Filter Controls */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics, or code..."
            aria-label="Search blog articles"
            className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filter articles by tag"
          className="flex flex-wrap items-center gap-1.5"
        >
          {allTags.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Feed */}
      {loadingData && publishedPosts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-96 rounded-2xl border border-[var(--border)] bg-[var(--surface)] animate-pulse"
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="font-display text-lg font-semibold text-[var(--text)] mb-2">
            No matching articles found
          </p>
          <p className="text-sm text-[var(--muted)] mb-5">
            Try another search term or switch back to all topics.
          </p>
          {(searchQuery || activeTag !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTag('All');
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors"
            >
              <button
                type="button"
                onClick={() => {
                  onSelectPost(post.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="aspect-[16/9] w-full overflow-hidden bg-[var(--surface-elevated)] text-left cursor-pointer"
              >
                <ResilientImage
                  src={post.coverImageUrl}
                  alt={post.title}
                  fallbackTitle={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </button>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)] mb-2.5">
                  <span className="tabular-nums">{formatDate(post.createdAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{post.readingTimeMinutes} min read</span>
                  {post.tags.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{post.tags.join(' / ')}</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPost(post.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left cursor-pointer"
                >
                  <h2 className="font-display text-xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-2.5 leading-snug">
                    {post.title}
                  </h2>
                </button>

                <p className="text-sm text-[var(--muted)] leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPost(post.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Read Article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
