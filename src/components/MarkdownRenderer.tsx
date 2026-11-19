import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import { Check, Copy, Play } from 'lucide-react';
import { extractYouTubeId } from '../lib/validation';

export function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="my-7 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="relative w-full aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={title || 'Embedded YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5" />
          YouTube Video
        </span>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--text)] transition-colors no-underline"
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy if clipboard restricted
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[var(--code-border)] bg-[var(--code-bg)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--code-border)] text-xs text-[var(--muted)]">
        <span className="font-mono">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--success)]" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="m-0 p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono">
        <code
          className={`hljs ${language ? `language-${language}` : ''}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

function detectStandaloneYouTubeId(children: React.ReactNode): string | null {
  const items = React.Children.toArray(children).filter((child) => {
    if (typeof child === 'string') return child.trim().length > 0;
    return true;
  });

  if (items.length !== 1) return null;
  const sole = items[0];

  if (typeof sole === 'string') {
    const trimmed = sole.trim();
    if (!/\s/.test(trimmed)) {
      return extractYouTubeId(trimmed);
    }
    return null;
  }

  if (React.isValidElement(sole)) {
    const props = sole.props as { href?: string; children?: React.ReactNode };
    if (typeof props.href === 'string') {
      const id = extractYouTubeId(props.href);
      if (id) return id;
    }
  }

  return null;
}

interface MarkdownRendererProps {
  content: string;
  featuredYoutubeUrl?: string;
}

export function MarkdownRenderer({ content, featuredYoutubeUrl }: MarkdownRendererProps) {
  const featuredId = featuredYoutubeUrl ? extractYouTubeId(featuredYoutubeUrl) : null;

  return (
    <div className="article-prose">
      {featuredId && <YouTubeEmbed videoId={featuredId} title="Featured Article Video" />}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            const ytId = detectStandaloneYouTubeId(children);
            if (ytId) {
              return <YouTubeEmbed videoId={ytId} />;
            }
            return <p>{children}</p>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          pre({ children }) {
            const child = React.Children.toArray(children)[0];
            if (React.isValidElement(child)) {
              const props = child.props as { className?: string; children?: React.ReactNode };
              const match = /language-([\w-]+)/.exec(props.className || '');
              const lang = match ? match[1] : '';
              const rawCode = String(props.children ?? '').replace(/\n$/, '');
              return <CodeBlock language={lang} code={rawCode} />;
            }
            return <pre>{children}</pre>;
          },
          code({ className, children, ...props }) {
            return (
              <code
                className={`px-1.5 py-0.5 rounded bg-[var(--code-bg)] border border-[var(--code-border)] text-[0.875em] font-mono ${
                  className || ''
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt || 'Article visual'}
                referrerPolicy="no-referrer"
                className="my-6 w-full rounded-xl border border-[var(--border)] object-cover"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
