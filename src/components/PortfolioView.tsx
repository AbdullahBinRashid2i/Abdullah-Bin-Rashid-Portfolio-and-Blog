import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  FileDown,
  Github,
  Linkedin,
  Mail,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useData } from '../context/DataContext';
import { ResilientImage } from './ResilientImage';

interface PortfolioViewProps {
  onOpenBlog: () => void;
  onOpenPost: (postId: string) => void;
}

/**
 * TextFlipWord / TextFlipBlock:
 * Creates an elegant 3D perspective flip effect when scrolled into view.
 */
function FlipText({
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
      initial={{ opacity: 0, rotateX: -60, y: 24 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
      }}
      style={{ transformOrigin: 'top center', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollRevealSection:
 * Wraps top-level sections with a smooth upward fade and subtle 3D lift.
 */
function ScrollRevealSection({
  children,
  id,
  className = '',
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function PortfolioView({ onOpenBlog: _onOpenBlog, onOpenPost: _onOpenPost }: PortfolioViewProps) {
  const { profile, projects, loadingData } = useData();
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const toggleProject = (projectId: string) => {
    setExpandedProjectId((prev) => (prev === projectId ? null : projectId));
  };

  const handleCopyEmail = async () => {
    if (!profile.socialLinks.email) return;
    try {
      await navigator.clipboard.writeText(profile.socialLinks.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <ScrollRevealSection id="hero" className="pt-14 pb-14 lg:pt-20 lg:pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline & Narrative */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div>
              <FlipText delay={0.05}>
                <p className="text-xs sm:text-sm font-medium text-[var(--accent)] tracking-wider uppercase mb-4">
                  {profile.location || 'Based in Karachi, Pakistan'}
                </p>
              </FlipText>

              <FlipText delay={0.15}>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.18] text-[var(--text)] mb-6">
                  <span>{profile.fullName}</span>{' '}
                  <span className="italic font-normal opacity-90 text-[var(--text)]">
                    {profile.tagline?.startsWith('builds')
                      ? profile.tagline
                      : `builds things at the bench — software, systems, and scenes.`}
                  </span>
                </h1>
              </FlipText>

              <FlipText delay={0.25}>
                <p className="text-base sm:text-lg leading-relaxed text-[var(--muted)] max-w-[62ch]">
                  {profile.bio}
                </p>
              </FlipText>
            </div>

            {/* GitHub, LinkedIn, and Resume Download Links */}
            <FlipText delay={0.35}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={profile.resumeUrl || '/Abdullah_Bin_Rashid_Resume.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Abdullah_Bin_Rashid_Resume.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-all shadow-sm"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download CV / Resume</span>
                </a>
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </a>
                )}
              </div>
            </FlipText>
          </div>

          {/* Right Column: Headshot Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, rotateY: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-xl"
            >
              <ResilientImage
                src={
                  profile.heroImageUrl && !profile.heroImageUrl.includes('hero_studio_desk')
                    ? profile.heroImageUrl
                    : '/abr_headshot.jpg'
                }
                alt={`${profile.fullName} Headshot`}
                fallbackTitle={profile.fullName}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/40 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </ScrollRevealSection>

      {/* Dedicated Editorial About Me Section */}
      <ScrollRevealSection id="about" className="py-16 border-t border-[var(--border)]">
        {/* Section Header */}
        <div className="mb-10">
          <FlipText>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-3">
              About
            </h2>
          </FlipText>
          <FlipText delay={0.1}>
            <p className="text-sm sm:text-base text-[var(--muted)]">
              {profile.aboutSubtitle || 'BS in Computer Science (BSCS) at GU Tech (2026 – 2030 Expected).'}
            </p>
          </FlipText>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            style={{ transformOrigin: 'left' }}
            className="mt-4 w-16 h-[2px] bg-[var(--accent)]"
          />
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Narrative Paragraphs */}
          <div className="lg:col-span-7 space-y-6 text-base sm:text-[17px] leading-relaxed text-[var(--text)]/90 whitespace-pre-line">
            <FlipText delay={0.15}>
              <p>{profile.bio}</p>
            </FlipText>
          </div>

          {/* Right Column: Pillars with Accent Left Border */}
          <div className="lg:col-span-5 space-y-8 pl-5 sm:pl-6 border-l-2 border-[var(--accent)]/80">
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
              <FlipText key={`${pillar.title}-${idx}`} delay={0.1 * idx + 0.1}>
                <div>
                  <h3 className="font-display text-base font-semibold text-[var(--accent)] mb-1.5 tracking-wide">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">
                    {pillar.description}
                  </p>
                </div>
              </FlipText>
            ))}
          </div>
        </div>
      </ScrollRevealSection>

      {/* Featured Projects Section - Clean Accordion List with Horizontal Line Wipe Mask Reveal */}
      <ScrollRevealSection id="projects" className="py-16 border-t border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <FlipText>
              <p className="text-xs font-medium text-[var(--muted)] mb-2">02. Selected Works</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
                Featured Projects
              </h2>
            </FlipText>
          </div>
          <p className="text-sm text-[var(--muted)] tabular-nums">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} live
          </p>
        </div>

        {loadingData && projects.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-xl border border-[var(--border)] bg-[var(--surface)] animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <p className="font-display text-lg font-medium text-[var(--text)] mb-1">
              No projects published yet
            </p>
            <p className="text-sm text-[var(--muted)]">
              Add featured projects from the Admin CMS Dashboard to showcase them here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {projects.map((project, index) => {
              const isExpanded = expandedProjectId === project.id;
              return (
                <article key={project.id} className="relative overflow-hidden transition-colors">
                  {/* Clickable Project Header / Row */}
                  <button
                    type="button"
                    onClick={() => toggleProject(project.id)}
                    aria-expanded={isExpanded}
                    className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
                      <span className="font-mono text-xs sm:text-sm text-[var(--muted)] tabular-nums shrink-0">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <h3 className="font-display text-lg sm:text-2xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {project.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block text-xs font-medium text-[var(--muted)] px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)]">
                        {project.category}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] group-hover:text-[var(--accent)] ${
                          isExpanded ? 'text-[var(--accent)]' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Horizontal Line Wipe Mask Reveal Animation */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="relative pb-7 pt-1">
                          {/* Animated Accent Line that shoots from Left to Right */}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            style={{ transformOrigin: 'left' }}
                            className="h-[2px] w-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/70 to-transparent mb-5"
                          />

                          {/* Mask Reveal: Text emerges sliding in and fading along the scan line */}
                          <motion.div
                            initial={{
                              clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                              opacity: 0,
                              x: -16,
                            }}
                            animate={{
                              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                              opacity: 1,
                              x: 0,
                            }}
                            exit={{
                              clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                              opacity: 0,
                              x: -16,
                            }}
                            transition={{
                              duration: 0.65,
                              delay: 0.08,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="pl-6 sm:pl-10 space-y-4"
                          >
                            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-[75ch]">
                              {project.description}
                            </p>

                            {project.techStack.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-xs text-[var(--muted)] font-mono">Tech:</span>
                                {project.techStack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Direct Live and Code Action Links */}
                            <div className="flex items-center gap-4 pt-2">
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity shadow-sm"
                                >
                                  Live Project
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors shadow-sm"
                                >
                                  <Github className="w-3.5 h-3.5" />
                                  View Code
                                </a>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}
      </ScrollRevealSection>

      {/* Skills & Tech Stack Section */}
      <ScrollRevealSection id="skills" className="py-16 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <FlipText>
              <p className="text-xs font-medium text-[var(--muted)] mb-2">03. Capabilities</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)] mb-3">
                Skills &amp; Craft Stack
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Tools, languages, and visual design disciplines I work with across web engineering and identity design.
              </p>
            </FlipText>
          </div>

          <div className="lg:col-span-8">
            {loadingData && profile.skills.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-14 rounded-lg border border-[var(--border)] bg-[var(--surface)] animate-pulse"
                  />
                ))}
              </div>
            ) : profile.skills.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6 border border-[var(--border)] rounded-xl px-5 bg-[var(--surface)]">
                Skills have not been added yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-[var(--border)]">
                {profile.skills.map((skill, idx) => (
                  <motion.div
                    key={`${skill}-${idx}`}
                    initial={{ opacity: 0, rotateX: -45, y: 15 }}
                    whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(0.04 * idx, 0.4),
                      ease: [0.215, 0.61, 0.355, 1],
                    }}
                    style={{ transformOrigin: 'top center' }}
                    className="border-r border-b border-[var(--border)] bg-[var(--surface)]/50 px-4 py-4 flex items-baseline justify-between gap-2 hover:bg-[var(--surface)] transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--text)] truncate">{skill}</span>
                    <span className="font-mono text-[11px] text-[var(--muted)] tabular-nums shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollRevealSection>

      {/* Contact & Social Links Section */}
      <ScrollRevealSection id="contact" className="py-16 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6">
            <FlipText>
              <p className="text-xs font-medium text-[var(--muted)] mb-2">04. Contact</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-4">
                Let&apos;s build something thoughtful together.
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-[52ch]">
                Open to software engineering collaborations, freelance graphic design commissions, and student developer initiatives in Karachi and remotely.
              </p>
            </FlipText>
          </div>

          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]"
            >
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
            </motion.div>
          </div>
        </div>
      </ScrollRevealSection>
    </main>
  );
}
