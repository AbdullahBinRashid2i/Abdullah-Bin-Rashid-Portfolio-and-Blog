import { BlogPost, PostStatus, Project, ProjectCategory, SiteProfile } from '../types';

// Validation boundaries synced verbatim with firebase-blueprint.json & firestore.rules
export const LIMITS = {
  fullName: 120,
  tagline: 160,
  bio: 3000,
  location: 120,
  url: 1000,
  socialUrl: 300,
  email: 160,
  skillsMax: 40,
  itemMaxLen: 60,
  projectTitle: 140,
  projectDescription: 2000,
  techStackMax: 15,
  postTitle: 180,
  postSlug: 160,
  postExcerpt: 500,
  postContent: 50000,
  youtubeUrl: 500,
  tagsMax: 10,
} as const;

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const DOC_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

export function clampString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

export function sanitizeStringList(items: string[], maxItems: number): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const raw of items) {
    const val = raw.trim().slice(0, LIMITS.itemMaxLen);
    if (val && !seen.has(val.toLowerCase())) {
      seen.add(val.toLowerCase());
      cleaned.push(val);
      if (cleaned.length >= maxItems) break;
    }
  }
  return cleaned;
}

export function generateSlug(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, LIMITS.postSlug);

  return normalized && SLUG_PATTERN.test(normalized)
    ? normalized
    : `post-${Date.now().toString(36)}`;
}

export function calculateReadingTime(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' code ')
    .replace(/[#>*_`~[\]()]/g, ' ')
    .trim();
  const wordCount = stripped ? stripped.split(/\s+/).length : 0;
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, Math.min(120, minutes));
}

export function extractYouTubeId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
      }
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(segments[0])) {
        const id = segments[1];
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function sanitizeProfileInput(input: SiteProfile) {
  const fullName = clampString(input.fullName, LIMITS.fullName);
  const tagline = clampString(input.tagline, LIMITS.tagline);
  const bio = clampString(input.bio, LIMITS.bio);
  const location = clampString(input.location, LIMITS.location);

  if (!fullName || !tagline || !bio || !location) {
    throw new Error('Full Name, Tagline, Location, and Bio are required.');
  }

  return {
    fullName,
    tagline,
    bio,
    location,
    heroImageUrl: clampString(input.heroImageUrl || '', LIMITS.url),
    heroEyebrow: clampString(input.heroEyebrow || '', 120),
    showHeroImage: input.showHeroImage !== false,
    resumeUrl: clampString(input.resumeUrl || '', LIMITS.url),
    resumeLatex: clampString(input.resumeLatex || '', 30000),
    skills: sanitizeStringList(input.skills || [], LIMITS.skillsMax),
    socialLinks: {
      github: clampString(input.socialLinks?.github || '', LIMITS.socialUrl),
      linkedin: clampString(input.socialLinks?.linkedin || '', LIMITS.socialUrl),
      email: clampString(input.socialLinks?.email || '', LIMITS.email),
    },
    aboutSubtitle: clampString(input.aboutSubtitle || '', 300),
    aboutPillars: Array.isArray(input.aboutPillars)
      ? input.aboutPillars.slice(0, 6).map((p) => ({
          title: clampString(p.title || '', 60),
          description: clampString(p.description || '', 400),
        }))
      : [],
    timelineEntries: Array.isArray(input.timelineEntries)
      ? input.timelineEntries
          .slice(0, 10)
          .filter((t) => t.title?.trim() || t.period?.trim())
          .map((t) => ({
            period: clampString(t.period || '', 60),
            title: clampString(t.title || '', 120),
            org: clampString(t.org || '', 120),
            detail: clampString(t.detail || '', 400),
          }))
      : [],
    inquiryTopics: sanitizeStringList(input.inquiryTopics || [], 10),
    footerWordmark: clampString(input.footerWordmark || '', 80),
  };
}

export function sanitizeProjectInput(
  input: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'visibility'>
) {
  const title = clampString(input.title, LIMITS.projectTitle);
  const description = clampString(input.description, LIMITS.projectDescription);
  const category: ProjectCategory = ['Full-Stack', 'Graphic Design', 'Hybrid'].includes(
    input.category
  )
    ? input.category
    : 'Full-Stack';

  if (!title || !description) {
    throw new Error('Project title and description are required.');
  }

  const order = Math.max(0, Math.min(9999, Math.round(Number(input.order) || 0)));

  return {
    title,
    description,
    category,
    techStack: sanitizeStringList(input.techStack || [], LIMITS.techStackMax),
    coverImageUrl: clampString(input.coverImageUrl || '', LIMITS.url),
    liveUrl: clampString(input.liveUrl || '', LIMITS.url),
    githubUrl: clampString(input.githubUrl || '', LIMITS.url),
    order,
    visibility: 'public' as const,
  };
}

export function sanitizePostInput(
  input: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readingTimeMinutes'>
) {
  const title = clampString(input.title, LIMITS.postTitle);
  const excerpt = clampString(input.excerpt, LIMITS.postExcerpt);
  const content = clampString(input.content, LIMITS.postContent);

  if (!title || !excerpt || !content) {
    throw new Error('Post title, excerpt, and Markdown content are required.');
  }

  const slug = generateSlug(input.slug || title);
  const status: PostStatus = input.status === 'published' ? 'published' : 'draft';

  return {
    title,
    slug,
    excerpt,
    content,
    coverImageUrl: clampString(input.coverImageUrl || '', LIMITS.url),
    youtubeUrl: clampString(input.youtubeUrl || '', LIMITS.youtubeUrl),
    tags: sanitizeStringList(input.tags || [], LIMITS.tagsMax),
    status,
    readingTimeMinutes: calculateReadingTime(content),
  };
}

export function formatDate(date?: Date | null): string {
  if (!date) return 'Nov 2026';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
