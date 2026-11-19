import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Mail,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate } from '../lib/validation';
import { Project } from '../types';
import { ResilientImage } from './ResilientImage';

interface PortfolioViewProps {
  onOpenBlog: () => void;
  onOpenPost: (postId: string) => void;
}

export function PortfolioView({ onOpenBlog, onOpenPost }: PortfolioViewProps) {
  const { profile, projects, publishedPosts, loadingData } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const recentPosts = publishedPosts.slice(0, 2);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Split-Screen Hero & Bio Section */}
      <section id="about" className="pt-14 pb-16 lg:pt-20 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[var(--muted)] mb-4">
                {profile.location}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.06] text-[var(--text)] mb-5">
                {profile.fullName}
              </h1>
              <p className="font-display text-xl sm:text-2xl font-medium text-[var(--accent)] mb-6">
                {profile.tagline}
              </p>
              <p className="text-base leading-relaxed text-[var(--muted)] max-w-[60ch]">
                {profile.bio}
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
              >
                Explore Projects
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={onOpenBlog}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Read the Blog
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[280px] sm:min-h-[340px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <ResilientImage
                src={profile.heroImageUrl}
                alt={`${profile.fullName} studio workspace`}
                fallbackTitle={profile.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-width editorial highlights strip below the hero split */}
        <div className="mt-14 pt-8 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-[var(--muted)] mb-1">Academic Track</p>
            <p className="font-display text-lg font-semibold text-[var(--text)]">
              CS Undergraduate · GU Tech
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] mb-1">Core Discipline</p>
            <p className="font-display text-lg font-semibold text-[var(--text)]">
              Full-Stack Engineering &amp; Graphic Design
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] mb-1">Live Portfolio Index</p>
            <p className="font-display text-lg font-semibold text-[var(--text)] tabular-nums">
              {projects.length} Projects · {publishedPosts.length} Articles
            </p>
          </div>
        </div>
      </section>

      {/* Skills & Tech Stack Section */}
      <section id="skills" className="py-16 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-medium text-[var(--muted)] mb-2">01. Capabilities</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)] mb-3">
              Skills &amp; Craft Stack
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Tools, languages, and visual design disciplines I work with across web engineering and identity design.
            </p>
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
                  <div
                    key={`${skill}-${idx}`}
                    className="border-r border-b border-[var(--border)] bg-[var(--surface)]/50 px-4 py-4 flex items-baseline justify-between gap-2 hover:bg-[var(--surface)] transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--text)] truncate">{skill}</span>
                    <span className="font-mono text-[11px] text-[var(--muted)] tabular-nums shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-16 border-t border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium text-[var(--muted)] mb-2">02. Selected Works</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
              Featured Projects
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)] tabular-nums">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} live
          </p>
        </div>

        {loadingData && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] animate-pulse"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <article
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-elevated)] text-left cursor-pointer"
                >
                  <ResilientImage
                    src={project.coverImageUrl}
                    alt={project.title}
                    fallbackTitle={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </button>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)] mb-2">
                    <span>{project.category}</span>
                    <span className="font-mono tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="text-left cursor-pointer"
                  >
                    <h3 className="font-display text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-2 leading-snug">
                      {project.title}
                    </h3>
                  </button>

                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-5 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-[var(--border)] space-y-4">
                    {project.techStack.length > 0 && (
                      <p className="text-xs text-[var(--muted)] leading-relaxed">
                        {project.techStack.join(' · ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-4 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="text-[var(--text)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                      >
                        View Details
                      </button>

                      <div className="flex items-center gap-4">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                          >
                            <Github className="w-3.5 h-3.5" />
                            Code
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                          >
                            Live
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Latest Writing Preview Section */}
      {recentPosts.length > 0 && (
        <section className="py-16 border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-medium text-[var(--muted)] mb-2">03. Journal</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
                Latest from the Blog
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenBlog}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline cursor-pointer self-start sm:self-auto"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => onOpenPost(post.id)}
                className="group text-left flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--surface-elevated)]">
                  <ResilientImage
                    src={post.coverImageUrl}
                    alt={post.title}
                    fallbackTitle={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)] mb-2.5">
                    <span className="tabular-nums">{formatDate(post.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{post.readingTimeMinutes} min read</span>
                    {post.tags.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{post.tags.slice(0, 2).join(' / ')}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Contact & Social Links Section */}
      <section id="contact" className="py-16 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium text-[var(--muted)] mb-2">04. Contact</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-4">
              Let&apos;s build something thoughtful together.
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-[52ch]">
              Open to software engineering collaborations, freelance graphic design commissions, and student developer initiatives in Karachi and remotely.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
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
          </div>
        </div>
      </section>

      {/* Project Lightbox Detail Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          onClick={() => setSelectedProject(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-2xl my-auto"
          >
            <div className="relative aspect-[16/9] w-full bg-[var(--surface-elevated)]">
              <ResilientImage
                src={selectedProject.coverImageUrl}
                alt={selectedProject.title}
                fallbackTitle={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)] mb-2">
                <span>{selectedProject.category}</span>
                {selectedProject.techStack.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{selectedProject.techStack.join(' · ')}</span>
                  </>
                )}
              </div>

              <h3
                id="project-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text)] mb-4"
              >
                {selectedProject.title}
              </h3>

              <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed mb-7">
                {selectedProject.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--border)]">
                <div className="flex flex-wrap items-center gap-3">
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity"
                    >
                      Open Live Project
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--accent)] transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      View Source
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  Close (ESC)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
