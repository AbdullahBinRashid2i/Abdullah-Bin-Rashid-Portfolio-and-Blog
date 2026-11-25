import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Code2,
  Database,
  Eye,
  FileText,
  FolderKanban,
  Heading2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  UserCircle2,
  Video,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  calculateReadingTime,
  extractYouTubeId,
  formatDate,
  generateSlug,
  LIMITS,
} from '../lib/validation';
import { AdminTab, BlogPost, PostStatus, Project, ProjectCategory, SiteProfile } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

const EMPTY_PROJECT_FORM = {
  title: '',
  description: '',
  category: 'Full-Stack' as ProjectCategory,
  techStack: [] as string[],
  coverImageUrl: '',
  liveUrl: '',
  githubUrl: '',
  order: 0,
};

const EMPTY_POST_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  youtubeUrl: '',
  tags: [] as string[],
  status: 'draft' as PostStatus,
};

export function AdminDashboard({ onExitAdmin }: AdminDashboardProps) {
  const {
    user,
    profile,
    projects,
    posts,
    isSeededInFirestore,
    seeding,
    saveProfile,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    createPost,
    updatePost,
    deletePost,
    seedDefaultContent,
    signOutAdmin,
    addToast,
  } = useData();

  const [activeTab, setActiveTab] = useState<AdminTab>('profile');

  // --- Tab 1: Profile & Bio State ---
  const [profileForm, setProfileForm] = useState<SiteProfile>(profile);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newTopicInput, setNewTopicInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  // --- Tab 2: Projects State ---
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);
  const [newTechInput, setNewTechInput] = useState('');
  const [savingProject, setSavingProject] = useState(false);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);

  // --- Tab 3: Blog Posts State ---
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState(EMPTY_POST_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [editorMode, setEditorMode] = useState<'split' | 'write' | 'preview'>('split');
  const [savingPost, setSavingPost] = useState(false);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);

  // Profile Handlers
  const handleAddSkill = () => {
    const cleaned = newSkillInput.trim().slice(0, LIMITS.itemMaxLen);
    if (!cleaned) return;
    if (profileForm.skills.length >= LIMITS.skillsMax) {
      addToast('error', `Maximum ${LIMITS.skillsMax} skills allowed.`);
      return;
    }
    if (profileForm.skills.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    setProfileForm((prev) => ({ ...prev, skills: [...prev.skills, cleaned] }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleAddTopic = () => {
    const cleaned = newTopicInput.trim().slice(0, LIMITS.itemMaxLen);
    if (!cleaned) return;
    const current = profileForm.inquiryTopics || [];
    if (current.length >= 10) {
      addToast('error', 'Maximum 10 inquiry topics allowed.');
      return;
    }
    if (current.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setNewTopicInput('');
      return;
    }
    setProfileForm((prev) => ({ ...prev, inquiryTopics: [...current, cleaned] }));
    setNewTopicInput('');
  };

  const handleRemoveTopic = (topic: string) => {
    setProfileForm((prev) => ({
      ...prev,
      inquiryTopics: (prev.inquiryTopics || []).filter((t) => t !== topic),
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await saveProfile(profileForm);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Project Handlers
  const startNewProject = () => {
    setEditingProjectId(null);
    setProjectForm({ ...EMPTY_PROJECT_FORM, order: projects.length });
    setNewTechInput('');
  };

  const startEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      description: project.description,
      category: project.category,
      techStack: [...project.techStack],
      coverImageUrl: project.coverImageUrl,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      order: project.order,
    });
    setNewTechInput('');
  };

  const handleAddTech = () => {
    const cleaned = newTechInput.trim().slice(0, LIMITS.itemMaxLen);
    if (!cleaned) return;
    if (projectForm.techStack.length >= LIMITS.techStackMax) {
      addToast('error', `Maximum ${LIMITS.techStackMax} tech tags per project.`);
      return;
    }
    if (projectForm.techStack.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setNewTechInput('');
      return;
    }
    setProjectForm((prev) => ({ ...prev, techStack: [...prev.techStack, cleaned] }));
    setNewTechInput('');
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, projectForm);
      } else {
        await createProject({ ...projectForm, order: projects.length });
      }
      startNewProject();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleMoveProject = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    try {
      await reorderProjects(reordered);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Could not reorder projects.');
    }
  };

  // Blog Post Handlers
  const startNewPost = () => {
    setEditingPostId(null);
    setPostForm(EMPTY_POST_FORM);
    setSlugTouched(false);
    setNewTagInput('');
  };

  const startEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl,
      youtubeUrl: post.youtubeUrl,
      tags: [...post.tags],
      status: post.status,
    });
    setSlugTouched(true);
    setNewTagInput('');
  };

  const handleAddPostTag = () => {
    const cleaned = newTagInput.trim().slice(0, LIMITS.itemMaxLen);
    if (!cleaned) return;
    if (postForm.tags.length >= LIMITS.tagsMax) {
      addToast('error', `Maximum ${LIMITS.tagsMax} tags per post.`);
      return;
    }
    if (postForm.tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setNewTagInput('');
      return;
    }
    setPostForm((prev) => ({ ...prev, tags: [...prev.tags, cleaned] }));
    setNewTagInput('');
  };

  const insertMarkdownSnippet = (snippet: string) => {
    setPostForm((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${snippet}` : snippet,
    }));
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPost(true);
    try {
      if (editingPostId) {
        await updatePost(editingPostId, postForm);
      } else {
        const createdId = await createPost(postForm);
        setEditingPostId(createdId);
        setSlugTouched(true);
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to save blog post.');
    } finally {
      setSavingPost(false);
    }
  };

  const handleQuickToggleStatus = async (post: BlogPost) => {
    const nextStatus: PostStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updatePost(post.id, {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        youtubeUrl: post.youtubeUrl,
        tags: post.tags,
        status: nextStatus,
      });
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Could not toggle status.');
    }
  };

  const detectedFeaturedYtId = postForm.youtubeUrl ? extractYouTubeId(postForm.youtubeUrl) : null;
  const liveReadingMinutes = calculateReadingTime(postForm.content);

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors';
  const labelClass = 'block text-xs font-medium text-[var(--muted)] mb-1.5';

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      {/* Contextual Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">
            Admin CMS / {user?.email}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            Content Management Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={seeding}
            onClick={() => void seedDefaultContent()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            title="Syncs latest resume specifications, headshot, and verified projects to Firestore"
          >
            <Database className="w-3.5 h-3.5 text-[var(--accent)]" />
            {seeding ? 'Syncing...' : 'Sync Resume Data to Firestore'}
          </button>
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            View Live Site
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOutAdmin();
              onExitAdmin();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* 3-Tab Switcher */}
      <div
        role="tablist"
        aria-label="Admin CMS sections"
        className="mt-6 flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4"
      >
        {(
          [
            { id: 'profile', label: 'Edit Profile & Bio', icon: UserCircle2 },
            { id: 'projects', label: `Manage Projects (${projects.length})`, icon: FolderKanban },
            { id: 'posts', label: `Manage Blog Posts (${posts.length})`, icon: FileText },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                active
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Edit Profile & Bio */}
      {activeTab === 'profile' && (
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--text)]">
              Profile, Skills &amp; Contact Links
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Changes saved here update the live Hero, Skills matrix, Contact section, and Footer immediately.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="profile-name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  maxLength={LIMITS.fullName}
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-tagline" className={labelClass}>
                  Title / Tagline
                </label>
                <input
                  id="profile-tagline"
                  type="text"
                  required
                  maxLength={LIMITS.tagline}
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm((p) => ({ ...p, tagline: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-location" className={labelClass}>
                  Location &amp; Institution
                </label>
                <input
                  id="profile-location"
                  type="text"
                  required
                  maxLength={LIMITS.location}
                  value={profileForm.location}
                  onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-hero-image" className={labelClass}>
                  Hero Portrait URL
                </label>
                <input
                  id="profile-hero-image"
                  type="text"
                  maxLength={LIMITS.url}
                  value={profileForm.heroImageUrl}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, heroImageUrl: e.target.value }))
                  }
                  placeholder="/abr_headshot.jpg or https://..."
                  className={inputClass}
                />
                <label className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={profileForm.showHeroImage !== false}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, showHeroImage: e.target.checked }))
                    }
                    className="accent-[var(--accent)] rounded"
                  />
                  <span>Display portrait in Hero section</span>
                </label>
              </div>

              <div>
                <label htmlFor="profile-hero-eyebrow" className={labelClass}>
                  Hero Eyebrow Role
                </label>
                <input
                  id="profile-hero-eyebrow"
                  type="text"
                  maxLength={120}
                  value={profileForm.heroEyebrow ?? ''}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, heroEyebrow: e.target.value }))
                  }
                  placeholder="Full-Stack Developer & Graphic Designer"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-resume" className={labelClass}>
                  Resume / CV Link or File URL
                </label>
                <input
                  id="profile-resume"
                  type="text"
                  maxLength={LIMITS.url}
                  value={profileForm.resumeUrl ?? ''}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, resumeUrl: e.target.value }))
                  }
                  placeholder="/Abdullah_Bin_Rashid_Resume.pdf or https://drive.google.com/..."
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-footer-wordmark" className={labelClass}>
                  Footer Monumental Wordmark
                </label>
                <input
                  id="profile-footer-wordmark"
                  type="text"
                  maxLength={80}
                  value={profileForm.footerWordmark ?? ''}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, footerWordmark: e.target.value }))
                  }
                  placeholder="abdullah.binrashid"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="profile-bio" className="text-xs font-medium text-[var(--muted)]">
                  Bio / About Me Narrative
                </label>
                <span className="text-[11px] font-mono text-[var(--muted)] tabular-nums">
                  {profileForm.bio.length} / {LIMITS.bio}
                </span>
              </div>
              <textarea
                id="profile-bio"
                rows={5}
                required
                maxLength={LIMITS.bio}
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Write your background and story here..."
                className={inputClass}
              />
            </div>

            {/* Dedicated About Me Section Settings */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  About Me Section Options
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Customize the tagline and pillar highlights displayed in the dedicated About section.
                </p>
              </div>

              <div>
                <label htmlFor="about-subtitle" className={labelClass}>
                  About Subtitle / Current Status
                </label>
                <input
                  id="about-subtitle"
                  type="text"
                  maxLength={300}
                  value={profileForm.aboutSubtitle ?? ''}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, aboutSubtitle: e.target.value }))
                  }
                  placeholder="e.g. Currently pursuing a BS in Computer Science, enrolling Fall 2026."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-2">
                  Highlight Pillars (up to 3)
                </label>
                <div className="space-y-3">
                  {[0, 1, 2].map((idx) => {
                    const pillar = (profileForm.aboutPillars || [])[idx] || {
                      title: idx === 0 ? 'Architecture' : idx === 1 ? 'Innovation' : 'Execution',
                      description: '',
                    };
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                      >
                        <div className="sm:col-span-1">
                          <label className="text-[11px] text-[var(--muted)] block mb-1">
                            Pillar {idx + 1} Title
                          </label>
                          <input
                            type="text"
                            maxLength={60}
                            value={pillar.title}
                            onChange={(e) => {
                              const updated = [...(profileForm.aboutPillars || [
                                { title: 'Architecture', description: '' },
                                { title: 'Innovation', description: '' },
                                { title: 'Execution', description: '' },
                              ])];
                              updated[idx] = { ...pillar, title: e.target.value };
                              setProfileForm((p) => ({ ...p, aboutPillars: updated }));
                            }}
                            placeholder="Title"
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-[var(--muted)] block mb-1">
                            Pillar {idx + 1} Description
                          </label>
                          <input
                            type="text"
                            maxLength={300}
                            value={pillar.description}
                            onChange={(e) => {
                              const updated = [...(profileForm.aboutPillars || [
                                { title: 'Architecture', description: '' },
                                { title: 'Innovation', description: '' },
                                { title: 'Execution', description: '' },
                              ])];
                              updated[idx] = { ...pillar, description: e.target.value };
                              setProfileForm((p) => ({ ...p, aboutPillars: updated }));
                            }}
                            placeholder="Short description..."
                            className={inputClass}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Academic & Craft Timeline Editor */}
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Academic &amp; Craft Timeline Entries
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setProfileForm((p) => ({
                        ...p,
                        timelineEntries: [
                          ...(p.timelineEntries || []),
                          { period: '2026', title: '', org: '', detail: '' },
                        ].slice(0, 10),
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Entry
                  </button>
                </div>
                <div className="space-y-3">
                  {(profileForm.timelineEntries || []).map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          maxLength={60}
                          value={entry.period}
                          onChange={(e) => {
                            const updated = [...(profileForm.timelineEntries || [])];
                            updated[idx] = { ...entry, period: e.target.value };
                            setProfileForm((p) => ({ ...p, timelineEntries: updated }));
                          }}
                          placeholder="Period (e.g. 2026 – 2030)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          maxLength={120}
                          value={entry.title}
                          onChange={(e) => {
                            const updated = [...(profileForm.timelineEntries || [])];
                            updated[idx] = { ...entry, title: e.target.value };
                            setProfileForm((p) => ({ ...p, timelineEntries: updated }));
                          }}
                          placeholder="Role / Degree Title"
                          className={inputClass}
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={120}
                            value={entry.org}
                            onChange={(e) => {
                              const updated = [...(profileForm.timelineEntries || [])];
                              updated[idx] = { ...entry, org: e.target.value };
                              setProfileForm((p) => ({ ...p, timelineEntries: updated }));
                            }}
                            placeholder="Organization / Campus"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (profileForm.timelineEntries || []).filter(
                                (_, i) => i !== idx
                              );
                              setProfileForm((p) => ({ ...p, timelineEntries: updated }));
                            }}
                            aria-label="Remove timeline entry"
                            className="px-2.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        maxLength={400}
                        value={entry.detail}
                        onChange={(e) => {
                          const updated = [...(profileForm.timelineEntries || [])];
                          updated[idx] = { ...entry, detail: e.target.value };
                          setProfileForm((p) => ({ ...p, timelineEntries: updated }));
                        }}
                        placeholder="Short milestone summary..."
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Skills Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="new-skill" className="text-xs font-medium text-[var(--muted)]">
                  Skills &amp; Tech Stack
                </label>
                <span className="text-[11px] font-mono text-[var(--muted)] tabular-nums">
                  {profileForm.skills.length} / {LIMITS.skillsMax}
                </span>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  id="new-skill"
                  type="text"
                  maxLength={LIMITS.itemMaxLen}
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add a skill (e.g., React, Figma, Python) and press Enter"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {profileForm.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileForm.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-medium text-[var(--text)]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        aria-label={`Remove skill ${skill}`}
                        className="text-[var(--muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Contact Inquiry Topics Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="new-topic" className="text-xs font-medium text-[var(--muted)]">
                  Contact Inquiry Topic Chips
                </label>
                <span className="text-[11px] font-mono text-[var(--muted)] tabular-nums">
                  {(profileForm.inquiryTopics || []).length} / 10
                </span>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  id="new-topic"
                  type="text"
                  maxLength={LIMITS.itemMaxLen}
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTopic();
                    }
                  }}
                  placeholder="Add an inquiry chip (e.g., Full-Stack Web App) and press Enter"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {(profileForm.inquiryTopics || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(profileForm.inquiryTopics || []).map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-medium text-[var(--text)]"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        aria-label={`Remove topic ${topic}`}
                        className="text-[var(--muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-[var(--border)]">
              <h3 className="font-display text-base font-semibold text-[var(--text)] mb-4">
                Social &amp; Contact Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="social-github" className={labelClass}>
                    GitHub URL
                  </label>
                  <input
                    id="social-github"
                    type="url"
                    maxLength={LIMITS.socialUrl}
                    value={profileForm.socialLinks.github}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        socialLinks: { ...p.socialLinks, github: e.target.value },
                      }))
                    }
                    placeholder="https://github.com/username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="social-linkedin" className={labelClass}>
                    LinkedIn URL
                  </label>
                  <input
                    id="social-linkedin"
                    type="url"
                    maxLength={LIMITS.socialUrl}
                    value={profileForm.socialLinks.linkedin}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        socialLinks: { ...p.socialLinks, linkedin: e.target.value },
                      }))
                    }
                    placeholder="https://linkedin.com/in/username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="social-email" className={labelClass}>
                    Public Contact Email
                  </label>
                  <input
                    id="social-email"
                    type="email"
                    maxLength={LIMITS.email}
                    value={profileForm.socialLinks.email}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        socialLinks: { ...p.socialLinks, email: e.target.value },
                      }))
                    }
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 2: Manage Projects */}
      {activeTab === 'projects' && (
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Project Form */}
          <div className="lg:col-span-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center justify-between gap-2 mb-5">
              <h2 className="font-display text-lg font-semibold text-[var(--text)]">
                {editingProjectId ? 'Edit Project' : 'Add New Project'}
              </h2>
              {editingProjectId && (
                <button
                  type="button"
                  onClick={startNewProject}
                  className="text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label htmlFor="proj-title" className={labelClass}>
                  Project Title
                </label>
                <input
                  id="proj-title"
                  type="text"
                  required
                  maxLength={LIMITS.projectTitle}
                  value={projectForm.title}
                  onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., CampusFlow Study Hub"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="proj-category" className={labelClass}>
                  Discipline Category
                </label>
                <select
                  id="proj-category"
                  value={projectForm.category}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      category: e.target.value as ProjectCategory,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="Full-Stack">Full-Stack</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Hybrid">Hybrid (Dev + Design)</option>
                </select>
              </div>

              <div>
                <label htmlFor="proj-desc" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="proj-desc"
                  rows={3}
                  required
                  maxLength={LIMITS.projectDescription}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="What problem does it solve and what did you build or design?"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="proj-tech" className={labelClass}>
                  Tech Stack / Tools ({projectForm.techStack.length}/{LIMITS.techStackMax})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    id="proj-tech"
                    type="text"
                    maxLength={LIMITS.itemMaxLen}
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder="Add tag & press Enter"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3.5 py-2 rounded-lg border border-[var(--border-strong)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
                {projectForm.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {projectForm.techStack.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setProjectForm((p) => ({
                              ...p,
                              techStack: p.techStack.filter((t) => t !== tag),
                            }))
                          }
                          aria-label={`Remove ${tag}`}
                          className="text-[var(--muted)] hover:text-[var(--danger)] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="proj-cover" className={labelClass}>
                  Cover Image URL
                </label>
                <input
                  id="proj-cover"
                  type="text"
                  maxLength={LIMITS.url}
                  value={projectForm.coverImageUrl}
                  onChange={(e) =>
                    setProjectForm((p) => ({ ...p, coverImageUrl: e.target.value }))
                  }
                  placeholder="https://... or /src/assets/images/..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="proj-live" className={labelClass}>
                    Live URL
                  </label>
                  <input
                    id="proj-live"
                    type="url"
                    maxLength={LIMITS.url}
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm((p) => ({ ...p, liveUrl: e.target.value }))}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="proj-github" className={labelClass}>
                    GitHub URL
                  </label>
                  <input
                    id="proj-github"
                    type="url"
                    maxLength={LIMITS.url}
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm((p) => ({ ...p, githubUrl: e.target.value }))}
                    placeholder="https://github.com/..."
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProject}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingProject
                  ? 'Saving...'
                  : editingProjectId
                  ? 'Update Project'
                  : 'Create Project'}
              </button>
            </form>
          </div>

          {/* Existing Projects Ordered List */}
          <div className="lg:col-span-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--text)]">
                Published Projects
              </h2>
              <span className="text-xs text-[var(--muted)] tabular-nums">
                Use arrows to reorder
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--muted)]">
                No projects yet. Create your first project using the form on the left.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[var(--surface-elevated)]/40 transition-colors"
                  >
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg)] shrink-0">
                      <ResilientImage
                        src={project.coverImageUrl}
                        alt={project.title}
                        fallbackTitle={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-0.5">
                        <span className="font-mono tabular-nums">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{project.category}</span>
                      </div>
                      <h3 className="font-display text-sm font-semibold text-[var(--text)] truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                        {project.techStack.join(' · ') || 'No tech tags'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => void handleMoveProject(index, -1)}
                        aria-label={`Move ${project.title} up`}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === projects.length - 1}
                        onClick={() => void handleMoveProject(index, 1)}
                        aria-label={`Move ${project.title} down`}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditProject(project)}
                        aria-label={`Edit ${project.title}`}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteProjectId === project.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteProject(project.id);
                              setConfirmDeleteProjectId(null);
                              if (editingProjectId === project.id) startNewProject();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[var(--danger)] text-white text-xs font-medium cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteProjectId(null)}
                            className="px-2 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--muted)] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteProjectId(project.id)}
                          aria-label={`Delete ${project.title}`}
                          className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: Manage Blog Posts */}
      {activeTab === 'posts' && (
        <section className="mt-8 space-y-8">
          {/* Existing Blog Posts Management Table */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--text)]">
                  All Blog Posts
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Published posts appear immediately in the public Blog feed; drafts stay private.
                </p>
              </div>
              <button
                type="button"
                onClick={startNewPost}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Article
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--muted)]">
                No blog posts yet. Write your first article below.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs text-[var(--muted)] bg-[var(--bg)]/40">
                      <th className="py-3 px-5 font-medium">Title</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Tags</th>
                      <th className="py-3 px-4 font-medium text-right">Read Time</th>
                      <th className="py-3 px-4 font-medium text-right">Updated</th>
                      <th className="py-3 px-5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-sm">
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-[var(--surface-elevated)]/40 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-medium text-[var(--text)] max-w-xs truncate">
                          {post.title}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => void handleQuickToggleStatus(post)}
                            className={`text-xs font-medium cursor-pointer hover:underline ${
                              post.status === 'published'
                                ? 'text-[var(--success)]'
                                : 'text-[var(--warning)]'
                            }`}
                          >
                            {post.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[var(--muted)] max-w-[180px] truncate">
                          {post.tags.join(' · ') || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[var(--muted)] text-right font-mono tabular-nums whitespace-nowrap">
                          {post.readingTimeMinutes} min
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[var(--muted)] text-right font-mono tabular-nums whitespace-nowrap">
                          {formatDate(post.updatedAt || post.createdAt)}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditPost(post)}
                              className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
                            >
                              Edit
                            </button>
                            {confirmDeletePostId === post.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deletePost(post.id);
                                    setConfirmDeletePostId(null);
                                    if (editingPostId === post.id) startNewPost();
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[var(--danger)] text-white text-xs font-medium cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePostId(null)}
                                  className="px-2 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--muted)] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePostId(post.id)}
                                aria-label={`Delete ${post.title}`}
                                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rich Markdown Editor + Live Preview */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text)]">
                  {editingPostId ? 'Edit Blog Post' : 'Write New Blog Post'}
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5 tabular-nums">
                  Estimated reading time: {liveReadingMinutes} min · Paste any YouTube URL on its own line to auto-embed
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                {(
                  [
                    { id: 'write', label: 'Write' },
                    { id: 'split', label: 'Split View' },
                    { id: 'preview', label: 'Preview' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setEditorMode(mode.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      editorMode === mode.id
                        ? 'bg-[var(--surface-elevated)] text-[var(--text)]'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="post-title" className={labelClass}>
                    Article Title
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    required
                    maxLength={LIMITS.postTitle}
                    value={postForm.title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setPostForm((p) => ({
                        ...p,
                        title: nextTitle,
                        slug: slugTouched ? p.slug : generateSlug(nextTitle),
                      }));
                    }}
                    placeholder="e.g., Designing Accessible Dark Themes"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="post-slug" className={labelClass}>
                    URL Slug
                  </label>
                  <input
                    id="post-slug"
                    type="text"
                    required
                    maxLength={LIMITS.postSlug}
                    value={postForm.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setPostForm((p) => ({ ...p, slug: e.target.value }));
                    }}
                    placeholder="designing-accessible-dark-themes"
                    className={`${inputClass} font-mono text-xs`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="post-excerpt" className={labelClass}>
                  Short Excerpt
                </label>
                <input
                  id="post-excerpt"
                  type="text"
                  required
                  maxLength={LIMITS.postExcerpt}
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="A crisp 1-2 sentence summary shown on the blog feed."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="post-cover" className={labelClass}>
                    Cover Image URL
                  </label>
                  <input
                    id="post-cover"
                    type="text"
                    maxLength={LIMITS.url}
                    value={postForm.coverImageUrl}
                    onChange={(e) =>
                      setPostForm((p) => ({ ...p, coverImageUrl: e.target.value }))
                    }
                    placeholder="https://... or /src/assets/images/..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="post-youtube" className="text-xs font-medium text-[var(--muted)]">
                      Featured YouTube Video URL (Optional)
                    </label>
                    {postForm.youtubeUrl && (
                      <span
                        className={`text-[11px] font-medium ${
                          detectedFeaturedYtId ? 'text-[var(--success)]' : 'text-[var(--warning)]'
                        }`}
                      >
                        {detectedFeaturedYtId ? 'Valid YouTube ID' : 'Unrecognized URL'}
                      </span>
                    )}
                  </div>
                  <input
                    id="post-youtube"
                    type="text"
                    maxLength={LIMITS.youtubeUrl}
                    value={postForm.youtubeUrl}
                    onChange={(e) =>
                      setPostForm((p) => ({ ...p, youtubeUrl: e.target.value }))
                    }
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Tags & Publication Status */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-8">
                  <label htmlFor="post-tag-input" className={labelClass}>
                    Tags ({postForm.tags.length}/{LIMITS.tagsMax})
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      id="post-tag-input"
                      type="text"
                      maxLength={LIMITS.itemMaxLen}
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPostTag();
                        }
                      }}
                      placeholder="Add topic tag (e.g., React, Graphic Design)"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={handleAddPostTag}
                      className="px-3.5 py-2 rounded-lg border border-[var(--border-strong)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  {postForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {postForm.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)]"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setPostForm((p) => ({
                                ...p,
                                tags: p.tags.filter((t) => t !== tag),
                              }))
                            }
                            aria-label={`Remove tag ${tag}`}
                            className="text-[var(--muted)] hover:text-[var(--danger)] cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-4">
                  <span className={labelClass}>Publication Status</span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                    <button
                      type="button"
                      onClick={() => setPostForm((p) => ({ ...p, status: 'draft' }))}
                      className={`py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        postForm.status === 'draft'
                          ? 'bg-[var(--surface-elevated)] text-[var(--warning)]'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostForm((p) => ({ ...p, status: 'published' }))}
                      className={`py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        postForm.status === 'published'
                          ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Published
                    </button>
                  </div>
                </div>
              </div>

              {/* Markdown Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('## Section Heading')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertMarkdownSnippet('```typescript\nconst hello = "world";\n```')
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Code Block
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertMarkdownSnippet('https://www.youtube.com/watch?v=9kRgVxULbag')
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  Embed YouTube Link
                </button>
              </div>

              {/* Split / Write / Preview Markdown Workspace */}
              <div
                className={`grid gap-5 ${
                  editorMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {editorMode !== 'preview' && (
                  <div>
                    <label htmlFor="post-content" className={labelClass}>
                      Markdown Body
                    </label>
                    <textarea
                      id="post-content"
                      rows={16}
                      required
                      maxLength={LIMITS.postContent}
                      value={postForm.content}
                      onChange={(e) => setPostForm((p) => ({ ...p, content: e.target.value }))}
                      placeholder="Write your article in Markdown. Paste any youtube.com/watch?v=... or youtu.be/... link on its own line for an automatic 16:9 player."
                      className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                    />
                  </div>
                )}

                {editorMode !== 'write' && (
                  <div>
                    <span className={labelClass}>Live Rendered Preview</span>
                    <div className="min-h-[380px] max-h-[540px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-5">
                      {postForm.content || postForm.youtubeUrl ? (
                        <MarkdownRenderer
                          content={postForm.content}
                          featuredYoutubeUrl={postForm.youtubeUrl}
                        />
                      ) : (
                        <p className="text-sm text-[var(--muted)]">
                          Start writing Markdown or add a YouTube URL to preview how the article will look to readers.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={startNewPost}
                  className="text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  Reset Editor
                </button>

                <button
                  type="submit"
                  disabled={savingPost}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingPost
                    ? 'Saving...'
                    : editingPostId
                    ? 'Save Post Changes'
                    : postForm.status === 'published'
                    ? 'Publish Article'
                    : 'Save Draft'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
