export type ThemeId = 'charcoal' | 'ivory' | 'monochrome' | 'slate';

export type AppView = 'portfolio' | 'blog' | 'post-detail' | 'admin';

export type AdminTab = 'profile' | 'projects' | 'posts';

export type ProjectCategory = 'Full-Stack' | 'Graphic Design' | 'Hybrid';

export type PostStatus = 'draft' | 'published';

export interface SocialLinks {
  github: string;
  linkedin: string;
  email: string;
}

export interface SiteProfile {
  fullName: string;
  tagline: string;
  bio: string;
  location: string;
  heroImageUrl: string;
  skills: string[];
  socialLinks: SocialLinks;
  updatedAt?: Date | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  techStack: string[];
  coverImageUrl: string;
  liveUrl: string;
  githubUrl: string;
  order: number;
  visibility: 'public';
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  youtubeUrl: string;
  tags: string[];
  status: PostStatus;
  readingTimeMinutes: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
