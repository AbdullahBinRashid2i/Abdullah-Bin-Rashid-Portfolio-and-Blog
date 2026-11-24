import { BlogPost, Project, SiteProfile } from '../types';
import { calculateReadingTime } from './validation';

export const DEFAULT_PROFILE: SiteProfile = {
  fullName: 'Abdullah Bin Rashid',
  tagline: 'builds things at the bench — software, systems, and scenes.',
  location: 'Karachi, Pakistan',
  bio: "First-semester Computer Science student and full-stack web developer with a background in graphic design. Builds React, Next.js, Node.js, and Python applications that solve real-world student and business problems, practices data structures and algorithms on LeetCode, and looks for opportunities at technical companies and in freelancing.",
  heroImageUrl: '/src/assets/images/abr_headshot.jpg',
  resumeUrl: '/Abdullah_Bin_Rashid_Resume.pdf',
  skills: [
    'React',
    'Next.js',
    'HTML & CSS',
    'JavaScript',
    'Node.js',
    'Express',
    'Socket.io',
    'Firebase',
    'MongoDB Atlas',
    'Supabase',
    'Google Gemini API',
    'Fabric.js',
    'Google Classroom API',
    'LeetCode (DSA)',
    'Graphic Design',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Vercel & Render',
  ],
  socialLinks: {
    github: 'https://github.com/AbdullahBinRashid2i',
    linkedin: 'https://www.linkedin.com/in/abdullah-bin-rashid-/',
    email: 'abdullahbinrashid0@gmail.com',
  },
  aboutSubtitle: 'BS in Computer Science (BSCS) at GU Tech (2026 – 2030 Expected).',
  aboutPillars: [
    {
      title: 'Architecture',
      description: 'Designing clean, modular codebases for web applications, backend AI scripts, and multi-tenant platforms.',
    },
    {
      title: 'Innovation',
      description: 'Using modern AI tools, Gemini API workflows, custom prompts, and performance tuning to deliver products faster.',
    },
    {
      title: 'Execution',
      description: 'Carrying ideas from concept to launch — from business web platforms to print-ready interactive canvases.',
    },
  ],
  updatedAt: new Date('2026-11-24T12:00:00Z'),
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'dynamicsaas-restaurant-platform',
    title: 'DynamicSaaS — Multi-Tenant Restaurant Platform',
    description:
      'A single-codebase multi-tenant restaurant SaaS with dynamic brand themes and a 12-switch feature engine per storefront. Engineered role-based access control with dedicated portals for Super Admins, Restaurant Admins, and live delivery dispatch.',
    category: 'Full-Stack',
    techStack: ['Next.js', 'Express', 'MongoDB Atlas', 'Socket.io'],
    coverImageUrl: '/src/assets/images/project_campus_hub_1795064687114.jpg',
    liveUrl: 'https://multi-tenant-restaurant-saas.vercel.app',
    githubUrl: 'https://github.com/AbdullahBinRashid2i/multi-tenant-restaurant-saas',
    order: 0,
    visibility: 'public',
    createdAt: new Date('2026-11-10T10:00:00Z'),
    updatedAt: new Date('2026-11-20T10:00:00Z'),
  },
  {
    id: 'taskscaffold-ai-study-assistant',
    title: 'TaskScaffold AI — Study Assistant & Micro-Stepping',
    description:
      'An AI study assistant that integrates with Google Classroom OAuth/API to import assignments and break them down into 5-minute micro-steps with starter code. Implemented a daily review system to help students reinforce concepts learned in class.',
    category: 'Full-Stack',
    techStack: ['React', 'Node.js', 'Firebase', 'Google Classroom API', 'Gemini API'],
    coverImageUrl: '/src/assets/images/project_design_tokens_1795064684877.jpg',
    liveUrl: 'https://assignment-helper-eosin.vercel.app',
    githubUrl: 'https://github.com/AbdullahBinRashid2i/assignment-helper',
    order: 1,
    visibility: 'public',
    createdAt: new Date('2026-11-05T10:00:00Z'),
    updatedAt: new Date('2026-11-18T10:00:00Z'),
  },
  {
    id: 'gutech-lms-learning-portal',
    title: 'GUTech LMS — Campus Learning Portal',
    description:
      'A student learning workspace featuring course progress tracking, study session analytics, assignments, quizzes, and a built-in AI study tutor built for campus workflows.',
    category: 'Full-Stack',
    techStack: ['React', 'Node.js', 'Firebase'],
    coverImageUrl: '/src/assets/images/project_campus_hub_1795064687114.jpg',
    liveUrl: 'https://gutech-lms-portal-two.vercel.app',
    githubUrl: 'https://github.com/AbdullahBinRashid2i/LMS',
    order: 2,
    visibility: 'public',
    createdAt: new Date('2026-10-15T10:00:00Z'),
    updatedAt: new Date('2026-11-15T10:00:00Z'),
  },
  {
    id: 'printable-design-platform',
    title: 'Printable Design Platform — Custom Box Templates',
    description:
      'A web app where users customize and download print-ready packaging designs such as box templates. Features an in-browser editing canvas using Fabric.js with SVG template rendering and Google Gemini API integration for AI-generated patterns and graphics.',
    category: 'Hybrid',
    techStack: ['React', 'Fabric.js', 'Node.js', 'Express', 'MongoDB', 'Gemini API'],
    coverImageUrl: '/src/assets/images/project_karachi_type_1795064737319.jpg',
    liveUrl: '',
    githubUrl: 'https://github.com/AbdullahBinRashid2i',
    order: 3,
    visibility: 'public',
    createdAt: new Date('2026-11-15T10:00:00Z'),
    updatedAt: new Date('2026-11-24T10:00:00Z'),
  },
  {
    id: 'developer-portfolio-and-blog',
    title: 'Developer Portfolio & Technical CMS Blog',
    description:
      'Personal portfolio and technical blog featuring an editorial typography layout, 3D text flip animations, and a secure admin CMS dashboard for publishing and managing articles and works.',
    category: 'Full-Stack',
    techStack: ['React', 'Next.js', 'Tailwind CSS', 'Firebase'],
    coverImageUrl: '/src/assets/images/hero_studio_desk_1795064684699.jpg',
    liveUrl: 'https://portfolio-and-blog-kappa.vercel.app',
    githubUrl: 'https://github.com/AbdullahBinRashid2i/Abdullah-Bin-Rashid-Portfolio-and-Blog',
    order: 4,
    visibility: 'public',
    createdAt: new Date('2026-11-18T10:00:00Z'),
    updatedAt: new Date('2026-11-24T10:00:00Z'),
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
