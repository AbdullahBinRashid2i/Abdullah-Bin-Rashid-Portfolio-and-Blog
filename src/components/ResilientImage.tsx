import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  className = '',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-3 bg-[var(--surface-elevated)] text-[var(--muted)] p-6 text-center select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-lg border border-[var(--border-strong)] flex items-center justify-center">
          <Layers className="w-5 h-5 opacity-75" />
        </div>
        <span className="font-display text-sm font-medium text-[var(--text)] max-w-[24ch] leading-snug">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
