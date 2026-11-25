import { motion } from 'motion/react';

export interface CraftDomain {
  id: string;
  indexLabel: string;
  title: string;
  shortTitle: string;
  summary: string;
  keywords: string[];
}

export const CRAFT_DOMAINS: CraftDomain[] = [
  {
    id: 'frontend',
    indexLabel: '01',
    title: 'Frontend & UI',
    shortTitle: 'Frontend',
    summary: 'Component systems, responsive layouts, and motion-driven interfaces.',
    keywords: ['react', 'next', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'ui'],
  },
  {
    id: 'backend',
    indexLabel: '02',
    title: 'Backend & Realtime',
    shortTitle: 'Backend',
    summary: 'REST APIs, multi-tenant RBAC portals, and live WebSocket streams.',
    keywords: ['node', 'express', 'socket', 'api', 'server', 'auth'],
  },
  {
    id: 'data',
    indexLabel: '03',
    title: 'Cloud & Databases',
    shortTitle: 'Data',
    summary: 'Schema design, real-time Firestore rules, and cloud persistence.',
    keywords: ['firebase', 'mongo', 'supabase', 'sql', 'postgres', 'firestore', 'database'],
  },
  {
    id: 'ai',
    indexLabel: '04',
    title: 'AI & Integrations',
    shortTitle: 'AI & APIs',
    summary: 'Gemini API pipelines, OAuth classroom workflows, and structured prompts.',
    keywords: ['gemini', 'ai', 'classroom', 'oauth', 'llm', 'prompt', 'python'],
  },
  {
    id: 'design',
    indexLabel: '05',
    title: 'Visual & Canvas',
    shortTitle: 'Design',
    summary: 'Identity systems, SVG packaging editors, and typography craft.',
    keywords: ['fabric', 'graphic', 'photoshop', 'illustrator', 'figma', 'design', 'svg', 'print'],
  },
  {
    id: 'cs',
    indexLabel: '06',
    title: 'CS & Deployment',
    shortTitle: 'Systems',
    summary: 'Algorithmic problem solving, CI/CD pipelines, and production tuning.',
    keywords: ['leetcode', 'dsa', 'vercel', 'render', 'git', 'docker', 'linux'],
  },
];

export function matchSkillToDomain(skill: string): string {
  const lower = skill.toLowerCase();
  for (const domain of CRAFT_DOMAINS) {
    if (domain.keywords.some((kw) => lower.includes(kw))) {
      return domain.id;
    }
  }
  return 'cs';
}

function polarPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function buildHexWedge(index: number, cx: number, cy: number, outerR: number, innerR: number) {
  const startAngle = index * 60 - 90 + 3.5;
  const endAngle = (index + 1) * 60 - 90 - 3.5;

  const p1 = polarPoint(cx, cy, outerR, startAngle);
  const p2 = polarPoint(cx, cy, outerR, endAngle);
  const p3 = polarPoint(cx, cy, innerR, endAngle);
  const p4 = polarPoint(cx, cy, innerR, startAngle);

  const labelPos = polarPoint(cx, cy, (outerR + innerR) / 2, (startAngle + endAngle) / 2);

  return {
    path: `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`,
    labelPos,
  };
}

interface CraftHexagonWheelProps {
  activeDomainId: string;
  isFiltered: boolean;
  onSelectDomain: (domainId: string) => void;
  onToggleFilter: (domainId: string) => void;
}

export function CraftHexagonWheel({
  activeDomainId,
  isFiltered,
  onSelectDomain,
  onToggleFilter,
}: CraftHexagonWheelProps) {
  const activeDomain =
    CRAFT_DOMAINS.find((d) => d.id === activeDomainId) || CRAFT_DOMAINS[0];

  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-5 sm:p-6">
      {/* Top technical header (static, no auto/pause button) */}
      <div className="flex items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--muted)] mb-3">
        <span>ABR / CRAFT MATRIX 06</span>
        <span className="text-[var(--accent)] tabular-nums">
          {isFiltered ? 'FILTERED' : 'HOVER TO INSPECT'}
        </span>
      </div>

      {/* Interactive 6-Segment Hexagonal Wheel */}
      <div className="relative mx-auto w-full max-w-[300px] aspect-square flex items-center justify-center">
        <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
          {/* Subtle outer hexagon guide */}
          <polygon
            points={[0, 1, 2, 3, 4, 5]
              .map((i) => {
                const pt = polarPoint(130, 130, 118, i * 60 - 90);
                return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
              })
              .join(' ')}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />

          {CRAFT_DOMAINS.map((domain, idx) => {
            const isActive = domain.id === activeDomainId;
            const { path, labelPos } = buildHexWedge(idx, 130, 130, 108, 56);

            return (
              <g
                key={domain.id}
                role="button"
                tabIndex={0}
                aria-label={`${domain.indexLabel} ${domain.title}`}
                aria-pressed={isFiltered && isActive}
                onMouseEnter={() => onSelectDomain(domain.id)}
                onFocus={() => onSelectDomain(domain.id)}
                onClick={() => onToggleFilter(domain.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleFilter(domain.id);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <motion.path
                  d={path}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.045 : 1,
                    fill: isActive ? 'var(--accent)' : 'var(--surface-elevated)',
                    stroke: isActive ? 'var(--accent)' : 'var(--border-strong)',
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  style={{ transformOrigin: '130px 130px' }}
                  strokeWidth="1.25"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono text-[11px] font-semibold pointer-events-none select-none"
                  fill={isActive ? 'var(--accent-fg)' : 'var(--muted)'}
                >
                  {domain.indexLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Hub */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-16">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] mb-0.5">
            {activeDomain.indexLabel} / 06
          </span>
          <span className="font-display text-sm sm:text-base font-semibold leading-tight text-[var(--text)]">
            {activeDomain.shortTitle}
          </span>
        </div>
      </div>

      {/* Active Segment Caption + Numbered Tabs */}
      <div className="mt-3 pt-4 border-t border-[var(--border)] space-y-3">
        <div className="flex items-start justify-between gap-2 min-h-[44px]">
          <div>
            <p className="text-xs font-semibold text-[var(--text)]">
              {activeDomain.indexLabel}. {activeDomain.title}
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-0.5">
              {activeDomain.summary}
            </p>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={() => onToggleFilter(activeDomain.id)}
              className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded border border-[var(--accent)]/60 text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* 01 - 06 mini strip */}
        <div className="grid grid-cols-6 gap-1 pt-1">
          {CRAFT_DOMAINS.map((domain) => {
            const active = domain.id === activeDomainId;
            return (
              <button
                key={domain.id}
                type="button"
                onMouseEnter={() => onSelectDomain(domain.id)}
                onClick={() => onToggleFilter(domain.id)}
                className={`py-1.5 text-center rounded transition-colors cursor-pointer border ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-transparent hover:border-[var(--border-strong)] text-[var(--muted)]'
                }`}
              >
                <span className="block font-mono text-[10px] tabular-nums">
                  {domain.indexLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
