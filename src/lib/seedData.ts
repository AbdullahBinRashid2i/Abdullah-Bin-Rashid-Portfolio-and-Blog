import { BlogPost, Project, SiteProfile } from '../types';
import { calculateReadingTime } from './validation';

export const DEFAULT_PROFILE: SiteProfile = {
  fullName: 'Abdullah Bin Rashid',
  tagline: 'Full-Stack Developer & CS Student',
  location: 'GU Tech · Karachi, Pakistan',
  bio: 'I am an undergraduate Computer Science student in my first semester at GU Tech, living in Karachi. Alongside full-stack web engineering, I practice graphic design—combining clean visual hierarchy, Swiss grid systems, and reliable modern software architecture to craft web products that feel both engineered and intentionally designed.',
  heroImageUrl: '/src/assets/images/hero_studio_desk_1795064684699.jpg',
  skills: [
    'React',
    'TypeScript',
    'Next.js',
    'Node.js',
    'Python',
    'C',
    'Firebase',
    'Tailwind CSS',
    'MongoDB',
    'Figma',
    'Adobe Illustrator',
    'Adobe Photoshop',
    'Brand Identity',
    'UI Systems',
  ],
  socialLinks: {
    github: 'https://github.com/abdullahbinrashid',
    linkedin: 'https://linkedin.com/in/abdullahbinrashid',
    email: 'abdullahbinrashid0@gmail.com',
  },
  aboutSubtitle: 'Currently pursuing a BS in Computer Science, enrolling Fall 2026.',
  aboutPillars: [
    {
      title: 'Architecture',
      description: 'Designing clean, modular codebases for web applications, backend AI scripts, and responsive systems.',
    },
    {
      title: 'Innovation',
      description: 'Using modern AI tools, custom prompts, and performance tuning to deliver products faster.',
    },
    {
      title: 'Execution',
      description: 'Carrying ideas from concept to launch — from business web platforms to interactive media.',
    },
  ],
  updatedAt: new Date('2026-11-18T12:00:00Z'),
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'campusflow-study-hub',
    title: 'CampusFlow — Student Course & Resource Hub',
    description:
      'A real-time semester workspace built for undergraduate CS students to organize lecture notes, assignment deadlines, and collaborative study boards with instant Cloud Firestore sync and clean dark-mode ergonomics.',
    category: 'Full-Stack',
    techStack: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
    coverImageUrl: '/src/assets/images/project_campus_hub_1795064687114.jpg',
    liveUrl: 'https://campusflow-demo.web.app',
    githubUrl: 'https://github.com/abdullahbinrashid/campusflow',
    order: 0,
    visibility: 'public',
    createdAt: new Date('2026-10-12T10:00:00Z'),
    updatedAt: new Date('2026-11-10T10:00:00Z'),
  },
  {
    id: 'moderne-form-identity',
    title: 'Moderne Form — Exhibition Brand Identity',
    description:
      'A complete print and digital graphic design identity rooted in Swiss typographic grids—spanning geometric exhibition posters, modular stationery, editorial booklets, and high-contrast monochrome packaging.',
    category: 'Graphic Design',
    techStack: ['Adobe Illustrator', 'Photoshop', 'Typography', 'Grid Systems'],
    coverImageUrl: '/src/assets/images/project_karachi_type_1795064737319.jpg',
    liveUrl: 'https://behance.net/abdullahbinrashid',
    githubUrl: '',
    order: 1,
    visibility: 'public',
    createdAt: new Date('2026-10-24T10:00:00Z'),
    updatedAt: new Date('2026-11-12T10:00:00Z'),
  },
  {
    id: 'chromagrid-token-studio',
    title: 'ChromaGrid — Design Token & Palette Workbench',
    description:
      'Bridging graphic design and frontend engineering: an interactive studio utility that generates WCAG-checked multi-theme CSS variables, fluid type scales, and exportable Tailwind theme blocks in seconds.',
    category: 'Hybrid',
    techStack: ['React', 'Node.js', 'Figma', 'CSS Variables'],
    coverImageUrl: '/src/assets/images/project_design_tokens_1795064684877.jpg',
    liveUrl: 'https://chromagrid-studio.web.app',
    githubUrl: 'https://github.com/abdullahbinrashid/chromagrid',
    order: 2,
    visibility: 'public',
    createdAt: new Date('2026-11-04T10:00:00Z'),
    updatedAt: new Date('2026-11-16T10:00:00Z'),
  },
];

const POST_1_CONTENT = `Building a personal website should not require opening a code editor every time you finish a new project, learn a new tool, or want to publish a technical write-up.

In this architecture walkthrough, I break down how this portfolio and blog run live on **React**, **TypeScript**, and **Cloud Firestore**—with strict single-admin security rules protecting every write.

## 1. Structuring Three Clean Firestore Collections

Instead of burying everything inside one monolithic document, separating the site into three focused collections keeps reads fast and security rules crystal clear:

- \`siteContent/profile\` holds the singleton bio, tagline, skills, and social links.
- \`projects/{projectId}\` stores each featured project along with its numeric display \`order\`.
- \`posts/{postId}\` stores Markdown articles with a strict \`draft\` or \`published\` visibility flag.

## 2. Real-Time Subscription Pattern

On the frontend, subscribing to published articles takes just a few lines of typed TypeScript:

\`\`\`typescript
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';

export function subscribePublishedPosts(onData: (posts: BlogPost[]) => void) {
  const postsQuery = query(
    collection(db, 'posts'),
    where('status', '==', 'published')
  );

  return onSnapshot(postsQuery, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BlogPost[];
    onData(items);
  });
}
\`\`\`

## 3. Locking Down Writes with Firestore Rules

Even though the Admin CMS routes are hidden from public visitors, real security happens at the database layer. Every mutation checks both the verified Google email and exact field allowlists before allowing a write.

> Never rely solely on hiding UI buttons—treat Firestore Security Rules as your true backend gatekeeper.

## Video Reference

Here is a helpful Firebase walkthrough embedded automatically just by pasting a YouTube link directly into Markdown:

https://www.youtube.com/watch?v=9kRgVxULbag

Once wired up, editing your bio or publishing a new article updates the live site for every visitor in under a second.`;

const POST_2_CONTENT = `Starting my first semester in Computer Science at GU Tech while coming from a graphic design background has shown me how tightly visual craft and clean code reinforce each other.

Most developer portfolios look identical because they treat layout as an afterthought. Borrowing three foundational principles from **Swiss graphic design** immediately transforms how a web interface feels.

## 1. Discipline in Spacing and Grid Alignment

Before writing a single component, establish a predictable spacing rhythm and stick to it. A crisp 12-column grid paired with generous outer margins gives every card and typographic block room to breathe.

\`\`\`css
:root {
  --bg: #111113;
  --surface: #18181b;
  --border: #27272a;
  --text: #f4f4f5;
  --accent: #e5a93c;
}

.editorial-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1.5rem;
}
\`\`\`

## 2. Typographic Contrast Over Box Clutter

Instead of wrapping every skill, date, and tag inside heavy bordered pills, let typography carry the hierarchy:

1. Pair an expressive geometric display font for headings with a quiet, legible body typeface.
2. Separate metadata using crisp typographic dots (\`·\`) and muted contrast.
3. Reserve your focal accent color strictly for primary interactive actions.

## 3. Designing Across Multiple Themes

When you map every surface, border, and text color to semantic CSS custom properties, supporting four distinct themes—from **Matte Charcoal** to **Editorial Ivory**—becomes a clean, maintainable engineering system rather than a tangle of overrides.

https://youtu.be/a5KYlHNKQB8

Whether you are building an identity poster in Illustrator or a full-stack React dashboard, clarity always wins.`;

export const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'realtime-portfolio-cms-firestore',
    title: 'Building a Real-Time Portfolio & Admin CMS with Cloud Firestore',
    slug: 'realtime-portfolio-cms-firestore',
    excerpt:
      'How to structure Firestore collections, enforce single-admin security rules, and edit every section of a personal site live from the browser.',
    content: POST_1_CONTENT,
    coverImageUrl: '/src/assets/images/blog_architecture_cover_1795064683424.jpg',
    youtubeUrl: '',
    tags: ['Full-Stack', 'Firebase', 'React', 'TypeScript'],
    status: 'published',
    readingTimeMinutes: calculateReadingTime(POST_1_CONTENT),
    createdAt: new Date('2026-11-15T14:30:00Z'),
    updatedAt: new Date('2026-11-15T14:30:00Z'),
  },
  {
    id: 'swiss-grid-systems-for-developers',
    title: 'Why Every Full-Stack Developer Should Learn Swiss Grid Systems',
    slug: 'swiss-grid-systems-for-developers',
    excerpt:
      'Practical lessons from graphic design—asymmetric alignment, typographic hierarchy, and semantic color tokens—that elevate web engineering.',
    content: POST_2_CONTENT,
    coverImageUrl: '/src/assets/images/blog_typography_cover_1795064688887.jpg',
    youtubeUrl: '',
    tags: ['Graphic Design', 'Typography', 'UI Systems'],
    status: 'published',
    readingTimeMinutes: calculateReadingTime(POST_2_CONTENT),
    createdAt: new Date('2026-11-10T09:15:00Z'),
    updatedAt: new Date('2026-11-10T09:15:00Z'),
  },
];
