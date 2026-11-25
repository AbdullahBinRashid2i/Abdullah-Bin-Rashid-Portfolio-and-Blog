import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  FileDown,
  Github,
  Linkedin,
  Mail,
  Plus,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useData } from '../context/DataContext';
import { Project, ProjectCategory } from '../types';
import {
  CRAFT_DOMAINS,
  CraftHexagonWheel,
  matchSkillToDomain,
} from './CraftHexagonWheel';
import { ResilientImage } from './ResilientImage';

interface PortfolioViewProps {
  onOpenBlog: () => void;
  onOpenPost: (postId: string) => void;
}

const TIMELINE_ENTRIES = [
  {
    period: '2026 – 2030',
    title: 'BS in Computer Science (BSCS)',
    org: 'GU Tech · Karachi',
    detail:
      'Foundations in algorithms, data structures (LeetCode DSA), systems architecture, and campus software initiatives.',
  },
  {
    period: 'Present',
    title: 'Full-Stack & AI Product Engineering',
    org: 'Independent & Freelance',
    detail:
      'Shipping multi-tenant SaaS platforms, Socket.io real-time dispatch tools, and Gemini AI study/design workflows.',
  },
  {
    period: 'Background',
    title: 'Graphic Design & Visual Identity',
    org: 'Print, Typography & Canvas Systems',
    detail:
      'Brand systems, packaging templates, Photoshop & Illustrator craft — bridging visual precision directly into UI code.',
  },
];

const INQUIRY_TOPICS = [
  'Full-Stack Web App',
  'AI / Gemini Workflow',
  'UI & Brand Design',
  'Internship / Role',
  'SaaS MVP',
  'Technical Collaboration',
];

const TICKER_ITEMS = [
  { label: 'Full-Stack Engineering', accent: false },
  { label: 'UI & Brand Systems', accent: true },
  { label: 'AI & Gemini Workflows', accent: false },
  { label: 'Multi-Tenant Architecture', accent: true },
  { label: 'Interactive Canvas Craft', accent: false },
  { label: 'CS Undergraduate · GU Tech', accent: true },
];

function RevealBlock({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PortfolioView({ onOpenBlog, onOpenPost: _onOpenPost }: PortfolioViewProps) {
  const { profile, projects, publishedPosts, loadingData } = useData();

  // Projects interactive state
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null);

  // About timeline state
  const [timelineOpen, setTimelineOpen] = useState(false);

  // Skills 6-piece wheel state (strictly hover/click driven, no auto-rotation)
  const [activeDomainId, setActiveDomainId] = useState<string>(CRAFT_DOMAINS[0].id);
  const [filterByDomain, setFilterByDomain] = useState(false);

  // Contact interactive configurator state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Available categories dynamically derived from projects
  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category)));
    return ['All', ...unique] as ('All' | ProjectCategory)[];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  // Keep activeProjectId valid whenever filtered list changes
  useEffect(() => {
    if (filteredProjects.length === 0) {
      setActiveProjectId(null);
      return;
    }
    if (!activeProjectId || !filteredProjects.some((p) => p.id === activeProjectId)) {
      setActiveProjectId(filteredProjects[0].id);
    }
  }, [filteredProjects, activeProjectId]);

  const activeProject: Project | null =
    filteredProjects.find((p) => p.id === activeProjectId) || filteredProjects[0] || null;
  const activeProjectIndex = activeProject
    ? filteredProjects.findIndex((p) => p.id === activeProject.id)
    : 0;

  const handleSelectWheelDomain = (domainId: string) => {
    setActiveDomainId(domainId);
  };

  const handleToggleWheelFilter = (domainId: string) => {
    if (filterByDomain && activeDomainId === domainId) {
      setFilterByDomain(false);
    } else {
      setActiveDomainId(domainId);
      setFilterByDomain(true);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const copyTextWithFallback = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
      } catch {
        return false;
      }
    }
  };

  const handleCopyEmail = async () => {
    if (!profile.socialLinks.email) return;
    const ok = await copyTextWithFallback(profile.socialLinks.email);
    if (ok) {
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const inquiryMailto = useMemo(() => {
    const email = profile.socialLinks.email || 'abdullahbinrashid0@gmail.com';
    const subject =
      selectedTopics.length > 0
        ? `Inquiry: ${selectedTopics.join(' · ')}`
        : 'Project / Collaboration Inquiry';
    const body =
      selectedTopics.length > 0
        ? `Hi Abdullah,\n\nI'd love to discuss: ${selectedTopics.join(', ')}.\n\nDetails:\n`
        : `Hi Abdullah,\n\nI came across your portfolio and would love to connect.\n`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [profile.socialLinks.email, selectedTopics]);

  const handleCopyBrief = async () => {
    const summary =
      selectedTopics.length > 0
        ? `Inquiry for ${profile.fullName} — Focus: ${selectedTopics.join(', ')} (${profile.socialLinks.email})`
        : profile.socialLinks.email;
    const ok = await copyTextWithFallback(summary);
    if (ok) {
      setCopiedBrief(true);
      window.setTimeout(() => setCopiedBrief(false), 2000);
    }
  };

  const activeDomainObj =
    CRAFT_DOMAINS.find((d) => d.id === activeDomainId) || CRAFT_DOMAINS[0];

  const showPortrait = profile.showHeroImage !== false;
  const resolvedHeroImage =
    profile.heroImageUrl &&
    !profile.heroImageUrl.includes('hero_studio_desk') &&
    profile.heroImageUrl !== '/src/assets/images/abr_headshot.jpg'
      ? profile.heroImageUrl
      : '/abr_headshot.jpg';
  const timelineList =
    profile.timelineEntries && profile.timelineEntries.length > 0
      ? profile.timelineEntries
      : TIMELINE_ENTRIES;
  const topicsList =
    profile.inquiryTopics && profile.inquiryTopics.length > 0
      ? profile.inquiryTopics
      : INQUIRY_TOPICS;

  const taglineText = profile.tagline?.startsWith('builds')
    ? profile.tagline
    : 'builds software, systems & visual craft.';

  return (
    <div className="relative overflow-x-clip">
      {/* ============================================================
          01. HERO SECTION — Clean Editorial Architecture (No Headshot)
         ============================================================ */}
      <section id="hero" className="relative border-b border-[var(--border)]">
        {/* Subtle blueprint grid lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-20">
          {/* Top Coordinate Strip */}
          <RevealBlock className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-10 border-b border-[var(--border)] text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>ABR // FORM 01</span>
              <span className="hidden sm:inline text-[var(--border-strong)]">·</span>
              <span className="hidden sm:inline">{profile.location || 'Karachi, Pakistan'}</span>
            </div>
            <div className="flex items-center gap-4 tabular-nums">
              <span>BSCS · GU TECH</span>
              <span className="text-[var(--accent)]">01 / 05</span>
            </div>
          </RevealBlock>

          {/* Editorial Hero Grid (12-column split with theme-adaptive portrait) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className={showPortrait ? 'lg:col-span-7' : 'lg:col-span-10 max-w-4xl'}>
              <RevealBlock delay={0.05}>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent)] mb-5">
                  {profile.heroEyebrow || 'Full-Stack Developer & Graphic Designer'}
                </p>
              </RevealBlock>

              <RevealBlock delay={0.12}>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-medium tracking-tight leading-[1.06] mb-7">
                  <span className="block text-[var(--text)]">{profile.fullName}</span>
                  <span className="block text-[var(--accent)] italic font-normal mt-1.5">
                    {taglineText}
                  </span>
                </h1>
              </RevealBlock>

              <RevealBlock delay={0.18}>
                <p className="text-base sm:text-lg leading-relaxed text-[var(--muted)] max-w-[60ch]">
                  {profile.bio}
                </p>
              </RevealBlock>

              {/* Action Bar */}
              <RevealBlock delay={0.24}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <span>Explore Selected Works</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href={profile.resumeUrl || '/Abdullah_Bin_Rashid_Resume.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="Abdullah_Bin_Rashid_Resume.pdf"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-[var(--accent)]" />
                    <span>Resume / CV</span>
                  </a>

                  <button
                    type="button"
                    onClick={onOpenBlog}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-[var(--border)] bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Blog ({publishedPosts.length})</span>
                  </button>

                  <div className="flex items-center gap-2 sm:ml-1">
                    {profile.socialLinks.github && (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub profile"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn profile"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </RevealBlock>
            </div>

            {showPortrait && (
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <RevealBlock delay={0.16} className="w-full max-w-[360px]">
                  <div className="group relative rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 shadow-xl">
                    {/* Architectural top metadata */}
                    <div className="flex items-center justify-between px-1.5 pb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                      <span>PORTRAIT // 01</span>
                      <span className="text-[var(--accent)]">THEME-SYNCED</span>
                    </div>

                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
                      <ResilientImage
                        src={resolvedHeroImage}
                        alt={`${profile.fullName} Portrait`}
                        fallbackTitle={profile.fullName}
                        className="theme-portrait-img w-full h-full object-cover object-top group-hover:scale-[1.02]"
                      />
                      {/* Theme-adaptive atmospheric duotone wash (fades on hover for full color) */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 transition-opacity duration-500 group-hover:opacity-15"
                        style={{
                          background:
                            'linear-gradient(160deg, var(--accent-soft) 0%, transparent 45%, var(--bg) 115%)',
                          mixBlendMode: 'color',
                        }}
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)]/55 via-transparent to-transparent"
                      />
                    </div>
                  </div>
                </RevealBlock>
              </div>
            )}
          </div>

          {/* Architectural Index Strip */}
          <RevealBlock
            delay={0.3}
            className="mt-14 pt-7 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-[var(--accent)] tabular-nums">01</span>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  Academic Track
                </p>
                <p className="font-display text-base sm:text-lg font-medium text-[var(--text)] mt-0.5">
                  CS Undergraduate · GU Tech
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-[var(--accent)] tabular-nums">02</span>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  Dual Discipline
                </p>
                <p className="font-display text-base sm:text-lg font-medium text-[var(--text)] mt-0.5">
                  Full-Stack Engineering &amp; Visual Design
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-[var(--accent)] tabular-nums">03</span>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  Live Index
                </p>
                <p className="font-display text-base sm:text-lg font-medium text-[var(--text)] tabular-nums mt-0.5">
                  {projects.length} Shipped Projects · {profile.skills.length} Tools
                </p>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ============================================================
          DISCIPLINE MARQUEE TICKER
         ============================================================ */}
      <div className="ticker-wrapper border-b border-[var(--border)] bg-[var(--surface)]/60 py-3.5 overflow-hidden select-none">
        <div className="animate-ticker items-center gap-8">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 shrink-0">
              <span
                className={`font-display text-lg sm:text-xl tracking-tight ${
                  item.accent ? 'text-[var(--accent)] italic' : 'text-[var(--text)]/90'
                }`}
              >
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className="text-xs text-[var(--muted)] font-mono"
              >
                ⬡
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ============================================================
            02. ABOUT SECTION + INLINE EXPANDABLE TIMELINE
           ============================================================ */}
        <section id="about" className="scroll-mt-16 py-16 lg:py-20 border-b border-[var(--border)]">
          <RevealBlock className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
                02. Background &amp; Ethos
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">
                <span className="text-[var(--text)]">Engineering structure.</span>{' '}
                <span className="text-[var(--accent)] italic font-normal">
                  Editorial visual craft.
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[var(--muted)]">
              {profile.aboutSubtitle || 'BS in Computer Science (BSCS) at GU Tech.'}
            </p>
          </RevealBlock>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Narrative + Expandable Timeline */}
            <div className="lg:col-span-7 space-y-6">
              <RevealBlock delay={0.08}>
                <p className="text-base sm:text-[17px] leading-relaxed text-[var(--text)]/90 whitespace-pre-line">
                  {profile.bio}
                </p>
              </RevealBlock>

              {/* Interactive Timeline Trigger (Segment Six Kurzvita-inspired) */}
              <RevealBlock delay={0.14}>
                <button
                  type="button"
                  onClick={() => setTimelineOpen((prev) => !prev)}
                  aria-expanded={timelineOpen}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                >
                  <span className="w-5 h-5 chamfer-badge bg-[var(--accent)] text-[var(--accent-fg)] inline-flex items-center justify-center">
                    {timelineOpen ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </span>
                  <span>{timelineOpen ? 'Hide Academic & Craft Timeline' : 'View Academic & Craft Timeline'}</span>
                </button>
              </RevealBlock>

              <AnimatePresence initial={false}>
                {timelineOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                      {timelineList.map((entry, idx) => (
                        <div
                          key={`${entry.period}-${idx}`}
                          className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4"
                        >
                          <span className="sm:col-span-3 font-mono text-xs text-[var(--accent)] tabular-nums">
                            {entry.period}
                          </span>
                          <div className="sm:col-span-9">
                            <p className="text-sm font-semibold text-[var(--text)]">
                              {entry.title}{' '}
                              <span className="font-normal text-[var(--muted)]">
                                · {entry.org}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mt-1">
                              {entry.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Three Architectural Pillars */}
            <div className="lg:col-span-5 space-y-6 pl-5 sm:pl-6 border-l-2 border-[var(--accent)]/80">
              {(profile.aboutPillars && profile.aboutPillars.length > 0
                ? profile.aboutPillars
                : [
                    {
                      title: 'Architecture',
                      description:
                        'Designing clean, modular codebases for web applications, backend AI scripts, and multi-tenant platforms.',
                    },
                    {
                      title: 'Innovation',
                      description:
                        'Using modern AI tools, Gemini API workflows, custom prompts, and performance tuning to deliver products faster.',
                    },
                    {
                      title: 'Execution',
                      description:
                        'Carrying ideas from concept to launch — from business web platforms to print-ready interactive canvases.',
                    },
                  ]
              ).map((pillar, idx) => (
                <RevealBlock key={`${pillar.title}-${idx}`} delay={0.08 * idx}>
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 w-7 h-7 shrink-0 chamfer-badge bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center font-mono text-[11px] text-[var(--accent)] tabular-nums">
                      0{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-medium text-[var(--text)] mb-1">
                        {pillar.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--muted)]">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </RevealBlock>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            03. PROJECTS — Sticky Visual Canvas + Interactive Rows
           ============================================================ */}
        <section id="projects" className="scroll-mt-16 py-16 lg:py-20 border-b border-[var(--border)]">
          <RevealBlock className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
                03. Selected Works
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">
                <span className="text-[var(--text)]">Built for real users.</span>{' '}
                <span className="text-[var(--accent)] italic font-normal">
                  Engineered to scale.
                </span>
              </h2>
            </div>

            {/* Category Filter Pills */}
            {categories.length > 2 && (
              <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'text-[var(--accent-fg)]'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="project-category-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className="absolute inset-0 rounded-lg bg-[var(--accent)]"
                        />
                      )}
                      <span className="relative z-10">{cat}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </RevealBlock>

          {loadingData && projects.length === 0 ? (
            <div className="h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] animate-pulse" />
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
              <p className="font-display text-lg font-medium text-[var(--text)] mb-1">
                No projects match this category
              </p>
              <p className="text-sm text-[var(--muted)]">
                Select &ldquo;All&rdquo; or add projects from the Admin CMS Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* LEFT: Sticky Editorial Preview Showcase (Desktop) */}
              <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
                <AnimatePresence mode="wait">
                  {activeProject && (
                    <motion.div
                      key={activeProject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] overflow-hidden"
                    >
                      {/* Top Frame Metadata */}
                      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted)]">
                        <span>
                          PRJ / {String(activeProjectIndex + 1).padStart(2, '0')} OF{' '}
                          {String(filteredProjects.length).padStart(2, '0')}
                        </span>
                        <span className="text-[var(--accent)]">{activeProject.category}</span>
                      </div>

                      {/* Cover Image */}
                      <div className="aspect-[16/10] bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden">
                        <ResilientImage
                          src={activeProject.coverImageUrl}
                          alt={activeProject.title}
                          fallbackTitle={activeProject.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details & Links */}
                      <div className="p-5 space-y-4">
                        <h3 className="font-display text-xl font-medium text-[var(--text)] leading-snug">
                          {activeProject.title}
                        </h3>
                        <p className="text-sm text-[var(--muted)] leading-relaxed">
                          {activeProject.description}
                        </p>

                        {activeProject.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {activeProject.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="text-[11px] font-mono px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg)]/60 text-[var(--text)]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          {activeProject.liveUrl && (
                            <a
                              href={activeProject.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity"
                            >
                              <span>Live Project</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {activeProject.githubUrl && (
                            <a
                              href={activeProject.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)] transition-colors"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>View Code</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT: Architectural Interactive Project Rows */}
              <div className="lg:col-span-7 border-t border-[var(--border)] divide-y divide-[var(--border)] border-b">
                {filteredProjects.map((project, index) => {
                  const isActive = activeProject?.id === project.id;
                  const isMobileExpanded = expandedMobileId === project.id;

                  return (
                    <article
                      key={project.id}
                      onMouseEnter={() => setActiveProjectId(project.id)}
                      className={`relative transition-colors ${
                        isActive ? 'bg-[var(--surface)]/75' : 'hover:bg-[var(--surface)]/40'
                      }`}
                    >
                      {/* Left Accent Bar on Active Row */}
                      <span
                        aria-hidden="true"
                        className={`hidden lg:block absolute left-0 top-0 bottom-0 w-[2px] transition-opacity ${
                          isActive ? 'bg-[var(--accent)] opacity-100' : 'opacity-0'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setActiveProjectId(project.id);
                          setExpandedMobileId((prev) =>
                            prev === project.id ? null : project.id
                          );
                        }}
                        className="w-full px-4 sm:px-5 py-5 sm:py-6 flex items-start justify-between gap-4 text-left cursor-pointer"
                      >
                        <div className="flex items-baseline gap-4 min-w-0">
                          <span
                            className={`font-mono text-xs tabular-nums shrink-0 ${
                              isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                            }`}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0 space-y-1.5">
                            <h3
                              className={`font-display text-lg sm:text-2xl font-medium leading-snug transition-colors ${
                                isActive ? 'text-[var(--accent)]' : 'text-[var(--text)]'
                              }`}
                            >
                              {project.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                                {project.category}
                              </span>
                              <span className="text-[var(--border-strong)]">·</span>
                              <span className="text-xs text-[var(--muted)] truncate">
                                {project.techStack.slice(0, 4).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 mt-1">
                          <span className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--muted)]">
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isMobileExpanded ? 'rotate-180 text-[var(--accent)]' : ''
                              }`}
                            />
                          </span>
                          <span
                            className={`hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                              isActive
                                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                                : 'border-[var(--border)] text-[var(--muted)]'
                            }`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </div>
                      </button>

                      {/* Mobile/Tablet Accordion Details */}
                      <AnimatePresence initial={false}>
                        {isMobileExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:hidden overflow-hidden"
                          >
                            <div className="px-4 pb-6 pt-1 space-y-4">
                              <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[var(--border)]">
                                <ResilientImage
                                  src={project.coverImageUrl}
                                  alt={project.title}
                                  fallbackTitle={project.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-sm text-[var(--muted)] leading-relaxed">
                                {project.description}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {project.techStack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="text-[11px] font-mono px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {project.liveUrl && (
                                  <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-fg)]"
                                  >
                                    <span>Live Project</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {project.githubUrl && (
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)]"
                                  >
                                    <Github className="w-3.5 h-3.5" />
                                    <span>View Code</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ============================================================
            04. SKILLS — Interactive 6-Piece Hexagon Wheel + Matrix Grid
           ============================================================ */}
        <section id="skills" className="scroll-mt-16 py-16 lg:py-20 border-b border-[var(--border)]">
          <RevealBlock className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
                04. Capabilities &amp; Craft Stack
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">
                <span className="text-[var(--text)]">Six core domains.</span>{' '}
                <span className="text-[var(--accent)] italic font-normal">
                  One cohesive stack.
                </span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[var(--muted)]">
              Hover or click any segment to highlight &amp; filter
            </p>
          </RevealBlock>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Interactive 6-Piece Hexagon Craft Wheel (hover & click only) */}
            <div className="lg:col-span-5">
              <CraftHexagonWheel
                activeDomainId={activeDomainId}
                isFiltered={filterByDomain}
                onSelectDomain={handleSelectWheelDomain}
                onToggleFilter={handleToggleWheelFilter}
              />
            </div>

            {/* Right: Architectural Hairline Skills Matrix */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-3 text-xs font-mono text-[var(--muted)]">
                <span>
                  {filterByDomain
                    ? `Filtered: ${activeDomainObj.indexLabel} · ${activeDomainObj.title}`
                    : `Highlighting: ${activeDomainObj.indexLabel} · ${activeDomainObj.title}`}
                </span>
                <span className="tabular-nums">{profile.skills.length} Total</span>
              </div>

              {loadingData && profile.skills.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="h-14 rounded-lg border border-[var(--border)] bg-[var(--surface)] animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-[var(--border)]">
                  {profile.skills.map((skill, idx) => {
                    const domainId = matchSkillToDomain(skill);
                    const isDomainMatch = domainId === activeDomainId;
                    const domainObj =
                      CRAFT_DOMAINS.find((d) => d.id === domainId) || CRAFT_DOMAINS[5];
                    const dimmed = filterByDomain && !isDomainMatch;

                    return (
                      <motion.button
                        key={`${skill}-${idx}`}
                        type="button"
                        onClick={() => handleSelectWheelDomain(domainId)}
                        animate={{ opacity: dimmed ? 0.32 : 1 }}
                        transition={{ duration: 0.25 }}
                        className={`text-left border-r border-b border-[var(--border)] px-4 py-4 flex flex-col justify-between gap-2 transition-colors cursor-pointer ${
                          isDomainMatch
                            ? 'bg-[var(--accent-soft)]'
                            : 'bg-[var(--surface)]/45 hover:bg-[var(--surface)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span
                            className={`font-mono text-[10px] tabular-nums ${
                              isDomainMatch ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                            }`}
                          >
                            {domainObj.indexLabel} · {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDomainMatch ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--text)] truncate w-full">
                          {skill}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
            05. CONTACT & INTERACTIVE INQUIRY CONFIGURATOR
           ============================================================ */}
        <section id="contact" className="scroll-mt-16 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Heading + Interactive Topic Selector */}
            <div className="lg:col-span-6 space-y-6">
              <RevealBlock>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
                  05. Contact &amp; Inquiries
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight mb-4">
                  <span className="text-[var(--text)]">One conversation.</span>{' '}
                  <span className="text-[var(--accent)] italic font-normal">
                    Thoughtful execution.
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-[52ch]">
                  Open to software engineering roles, freelance graphic/UI design, and student developer collaborations in Karachi or remotely.
                </p>
              </RevealBlock>

              {/* Interactive Topic Chips */}
              <RevealBlock delay={0.08} className="space-y-3 pt-2">
                <p className="text-xs font-mono uppercase tracking-[0.15em] text-[var(--muted)]">
                  Select topics to pre-fill an inquiry:
                </p>
                <div className="flex flex-wrap gap-2">
                  {topicsList.map((topic) => {
                    const active = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        aria-pressed={active}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          active
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--surface)]/70 text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {topic}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={inquiryMailto}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity"
                  >
                    <Mail className="w-4 h-4" />
                    <span>
                      {selectedTopics.length > 0
                        ? `Compose Email (${selectedTopics.length})`
                        : 'Send an Email'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  {selectedTopics.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyBrief}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                    >
                      {copiedBrief ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                          <span>Brief Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Brief</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </RevealBlock>
            </div>

            {/* Right: Direct Channel Card */}
            <div className="lg:col-span-6">
              <RevealBlock delay={0.12}>
                <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
                  <div className="px-5 py-3 bg-[var(--surface-elevated)]/60 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                    <span>Direct Channels</span>
                    <span>Response &lt; 24h</span>
                  </div>

                  {profile.socialLinks.email && (
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Mail className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--muted)]">Email</p>
                          <a
                            href={`mailto:${profile.socialLinks.email}`}
                            className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors truncate block"
                          >
                            {profile.socialLinks.email}
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {copiedEmail ? (
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
                  )}

                  {profile.socialLinks.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 flex items-center justify-between gap-4 hover:bg-[var(--surface-elevated)]/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Github className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--muted)]">GitHub</p>
                          <p className="text-sm font-medium text-[var(--text)] truncate">
                            {profile.socialLinks.github.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[var(--muted)] shrink-0" />
                    </a>
                  )}

                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 flex items-center justify-between gap-4 hover:bg-[var(--surface-elevated)]/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Linkedin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--muted)]">LinkedIn</p>
                          <p className="text-sm font-medium text-[var(--text)] truncate">
                            {profile.socialLinks.linkedin.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[var(--muted)] shrink-0" />
                    </a>
                  )}
                </div>
              </RevealBlock>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
