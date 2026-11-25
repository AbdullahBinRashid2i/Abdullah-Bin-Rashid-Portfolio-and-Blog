import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ADMIN_EMAIL, auth, db, googleProvider, handleFirestoreError } from '../lib/firebase';
import { DEFAULT_POSTS, DEFAULT_PROFILE, DEFAULT_PROJECTS } from '../lib/seedData';
import {
  DOC_ID_PATTERN,
  generateSlug,
  sanitizePostInput,
  sanitizeProfileInput,
  sanitizeProjectInput,
} from '../lib/validation';
import { BlogPost, OperationType, Project, SiteProfile, ToastMessage } from '../types';

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'toDate' in value && typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate();
  }
  return null;
}

interface DataContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  authLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInAsAdmin: () => Promise<boolean>;
  signOutAdmin: () => Promise<void>;

  profile: SiteProfile;
  projects: Project[];
  posts: BlogPost[];
  publishedPosts: BlogPost[];
  loadingData: boolean;
  isSeededInFirestore: boolean;
  seeding: boolean;

  saveProfile: (data: SiteProfile) => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'visibility'>) => Promise<void>;
  updateProject: (
    id: string,
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'visibility'>
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (orderedProjects: Project[]) => Promise<void>;

  createPost: (
    data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readingTimeMinutes'>
  ) => Promise<string>;
  updatePost: (
    id: string,
    data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readingTimeMinutes'>
  ) => Promise<void>;
  deletePost: (id: string) => Promise<void>;

  seedDefaultContent: () => Promise<void>;

  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [remoteProfile, setRemoteProfile] = useState<SiteProfile | null>(null);
  const [remoteProjects, setRemoteProjects] = useState<Project[]>([]);
  const [remotePosts, setRemotePosts] = useState<BlogPost[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const autoSeedAttempted = useRef(false);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const isAdmin = Boolean(
    user &&
      user.email &&
      user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      user.emailVerified
  );

  // Auth listener with strict admin lockout enforcement
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        const matchesAdmin =
          nextUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && nextUser.emailVerified;
        if (!matchesAdmin) {
          setAuthError(
            `Access restricted. Signed in as ${nextUser.email || 'unknown account'}, which is not authorized for the Admin CMS.`
          );
          try {
            await signOut(auth);
          } catch {
            // Ignore signOut error
          }
          setUser(null);
          setAuthReady(true);
          return;
        }
      }
      setUser(nextUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to siteContent/profile
  useEffect(() => {
    const path = 'siteContent/profile';
    const profileRef = doc(db, 'siteContent', 'profile');

    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // Safeguards against stale or incomplete Firestore documents overriding verified resume profile
          const rawHero = String(data.heroImageUrl || '').trim();
          const heroImageUrl =
            !rawHero || rawHero.includes('hero_studio_desk') || rawHero === '/src/assets/images/abr_headshot.jpg'
              ? DEFAULT_PROFILE.heroImageUrl
              : rawHero;

          const heroEyebrow = String(data.heroEyebrow || DEFAULT_PROFILE.heroEyebrow || '');
          const showHeroImage = data.showHeroImage !== false;

          const rawResume = String(data.resumeUrl || '').trim();
          const resumeUrl =
            rawResume || DEFAULT_PROFILE.resumeUrl || '/Abdullah_Bin_Rashid_Resume.pdf';
          const resumeLatex = String(data.resumeLatex || '');

          const rawBio = String(data.bio || '').trim();
          const isOutdatedSeedBio =
            !rawBio ||
            rawBio.includes('Swiss grid systems') ||
            rawBio.includes('craft web products that feel both engineered');
          const bio = isOutdatedSeedBio ? DEFAULT_PROFILE.bio : rawBio;

          const rawSubtitle = String(data.aboutSubtitle || '').trim();
          const isOutdatedSubtitle =
            !rawSubtitle || rawSubtitle.includes('enrolling Fall 2026');
          const aboutSubtitle = isOutdatedSubtitle
            ? (DEFAULT_PROFILE.aboutSubtitle || '')
            : rawSubtitle;

          const aboutPillars =
            Array.isArray(data.aboutPillars) && data.aboutPillars.length > 0
              ? data.aboutPillars.map((p) => ({
                  title: String(p.title || ''),
                  description: String(p.description || ''),
                }))
              : DEFAULT_PROFILE.aboutPillars;

          const timelineEntries =
            Array.isArray(data.timelineEntries) && data.timelineEntries.length > 0
              ? data.timelineEntries.map((t) => ({
                  period: String(t.period || ''),
                  title: String(t.title || ''),
                  org: String(t.org || ''),
                  detail: String(t.detail || ''),
                }))
              : DEFAULT_PROFILE.timelineEntries;

          const inquiryTopics =
            Array.isArray(data.inquiryTopics) && data.inquiryTopics.length > 0
              ? data.inquiryTopics.map(String)
              : DEFAULT_PROFILE.inquiryTopics;

          const footerWordmark = String(
            data.footerWordmark || DEFAULT_PROFILE.footerWordmark || ''
          );

          const rawGithub = String(data.socialLinks?.github || '').trim();
          const github =
            !rawGithub || rawGithub.endsWith('/abdullahbinrashid')
              ? DEFAULT_PROFILE.socialLinks.github
              : rawGithub;

          const rawLinkedin = String(data.socialLinks?.linkedin || '').trim();
          const linkedin =
            !rawLinkedin || rawLinkedin.endsWith('/abdullahbinrashid')
              ? DEFAULT_PROFILE.socialLinks.linkedin
              : rawLinkedin;

          const email = String(data.socialLinks?.email || DEFAULT_PROFILE.socialLinks.email);

          const rawSkills = Array.isArray(data.skills) ? data.skills.map(String) : [];
          const skills = rawSkills.length >= 10 ? rawSkills : DEFAULT_PROFILE.skills;

          setRemoteProfile({
            fullName: String(data.fullName || DEFAULT_PROFILE.fullName),
            tagline: String(data.tagline || DEFAULT_PROFILE.tagline),
            bio,
            location: String(data.location || DEFAULT_PROFILE.location),
            heroImageUrl,
            heroEyebrow,
            showHeroImage,
            resumeUrl,
            resumeLatex,
            skills,
            socialLinks: {
              github,
              linkedin,
              email,
            },
            aboutSubtitle,
            aboutPillars,
            timelineEntries,
            inquiryTopics,
            footerWordmark,
            updatedAt: toDate(data.updatedAt),
          });
        } else {
          setRemoteProfile(null);
        }
        setProfileLoaded(true);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (err) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to projects collection
  useEffect(() => {
    if (!authReady) return;

    const path = 'projects';
    const projectsQuery = isAdmin
      ? collection(db, 'projects')
      : query(collection(db, 'projects'), where('visibility', '==', 'public'));

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const list: Project[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: String(data.title || ''),
              description: String(data.description || ''),
              category:
                data.category === 'Graphic Design' || data.category === 'Hybrid'
                  ? data.category
                  : 'Full-Stack',
              techStack: Array.isArray(data.techStack) ? data.techStack.map(String) : [],
              coverImageUrl: String(data.coverImageUrl || ''),
              liveUrl: String(data.liveUrl || ''),
              githubUrl: String(data.githubUrl || ''),
              order: typeof data.order === 'number' ? data.order : 0,
              visibility: 'public' as const,
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
            };
          })
          .sort((a, b) => a.order - b.order);

        setRemoteProjects(list);
        setProjectsLoaded(true);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (err) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, isAdmin]);

  // Subscribe to posts collection (public gets published only; admin gets drafts + published)
  useEffect(() => {
    if (!authReady) return;

    const path = 'posts';
    const postsQuery = isAdmin
      ? collection(db, 'posts')
      : query(collection(db, 'posts'), where('status', '==', 'published'));

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const list: BlogPost[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: String(data.title || ''),
              slug: String(data.slug || d.id),
              excerpt: String(data.excerpt || ''),
              content: String(data.content || ''),
              coverImageUrl: String(data.coverImageUrl || ''),
              youtubeUrl: String(data.youtubeUrl || ''),
              tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
              status: (data.status === 'published' ? 'published' : 'draft') as BlogPost['status'],
              readingTimeMinutes:
                typeof data.readingTimeMinutes === 'number' ? data.readingTimeMinutes : 1,
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
            };
          })
          .sort((a, b) => {
            const timeA = a.createdAt?.getTime() || 0;
            const timeB = b.createdAt?.getTime() || 0;
            return timeB - timeA;
          });

        setRemotePosts(list);
        setPostsLoaded(true);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (err) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, isAdmin]);

  const seedDefaultContent = useCallback(async () => {
    if (!isAdmin) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);

      const profilePayload = sanitizeProfileInput(DEFAULT_PROFILE);
      batch.set(doc(db, 'siteContent', 'profile'), {
        ...profilePayload,
        updatedAt: serverTimestamp(),
      });

      // Remove legacy mock projects if present
      const oldMockIds = [
        'campusflow-study-hub',
        'moderne-form-identity',
        'chromagrid-token-studio',
      ];
      for (const oldId of oldMockIds) {
        batch.delete(doc(db, 'projects', oldId));
      }

      const existingProjectIds = new Set(remoteProjects.map((p) => p.id));
      for (const proj of DEFAULT_PROJECTS) {
        const payload = sanitizeProjectInput({
          title: proj.title,
          description: proj.description,
          category: proj.category,
          techStack: proj.techStack,
          coverImageUrl: proj.coverImageUrl,
          liveUrl: proj.liveUrl,
          githubUrl: proj.githubUrl,
          order: proj.order,
        });
        const projRef = doc(db, 'projects', proj.id);
        if (existingProjectIds.has(proj.id)) {
          batch.update(projRef, {
            ...payload,
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(projRef, {
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      const existingPostIds = new Set(remotePosts.map((p) => p.id));
      for (const post of DEFAULT_POSTS) {
        const payload = sanitizePostInput({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          youtubeUrl: post.youtubeUrl,
          tags: post.tags,
          status: post.status,
        });
        const postRef = doc(db, 'posts', post.id);
        if (existingPostIds.has(post.id)) {
          batch.update(postRef, {
            ...payload,
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(postRef, {
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      await batch.commit();
      addToast('success', 'Initial portfolio, projects, and blog posts seeded to Firestore.');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, 'siteContent/profile');
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'Failed to seed Firestore.');
      }
    } finally {
      setSeeding(false);
    }
  }, [isAdmin, addToast]);

  // Auto-sync Cloud Firestore on admin sign-in if profile is unseeded or holds outdated boilerplate
  useEffect(() => {
    if (!isAdmin || !profileLoaded || autoSeedAttempted.current) return;

    const checkAndSync = async () => {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'profile'));
        if (!snap.exists()) {
          autoSeedAttempted.current = true;
          await seedDefaultContent();
        } else {
          const data = snap.data();
          const rawHero = String(data.heroImageUrl || '');
          const rawBio = String(data.bio || '');
          const isStale =
            rawHero.includes('hero_studio_desk') ||
            rawBio.includes('Swiss grid systems') ||
            !data.resumeUrl;
          if (isStale) {
            autoSeedAttempted.current = true;
            await seedDefaultContent();
          }
        }
      } catch {
        // Silently continue if background check encounters transient issue
      }
    };

    void checkAndSync();
  }, [isAdmin, profileLoaded, seedDefaultContent]);

  const signInAsAdmin = useCallback(async (): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;
      const authorized =
        signedInUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        signedInUser.emailVerified;

      if (!authorized) {
        await signOut(auth);
        const msg = `Access restricted. Only ${ADMIN_EMAIL} can access the Admin CMS.`;
        setAuthError(msg);
        addToast('error', msg);
        return false;
      }

      addToast('success', 'Signed in to Admin CMS.');
      return true;
    } catch (error) {
      const errCode = (error as { code?: string })?.code;
      if (errCode !== 'auth/popup-closed-by-user') {
        const msg = error instanceof Error ? error.message : 'Google sign-in failed.';
        setAuthError(msg);
        addToast('error', msg);
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [addToast]);

  const signOutAdmin = useCallback(async () => {
    try {
      await signOut(auth);
      addToast('info', 'Signed out of Admin CMS.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Failed to sign out.');
    }
  }, [addToast]);

  const saveProfile = useCallback(
    async (data: SiteProfile) => {
      const path = 'siteContent/profile';
      const sanitized = sanitizeProfileInput(data);
      try {
        await setDoc(doc(db, 'siteContent', 'profile'), {
          ...sanitized,
          updatedAt: serverTimestamp(),
        });
        addToast('success', 'Profile and bio updated live.');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [addToast]
  );

  const createProject = useCallback(
    async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'visibility'>) => {
      const sanitized = sanitizeProjectInput(data);
      const rawId = `${generateSlug(sanitized.title).slice(0, 48)}-${Date.now().toString(36)}`;
      const docId = DOC_ID_PATTERN.test(rawId) ? rawId : `proj-${Date.now().toString(36)}`;
      const path = `projects/${docId}`;
      try {
        await setDoc(doc(db, 'projects', docId), {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addToast('success', `Project "${sanitized.title}" published.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [addToast]
  );

  const updateProject = useCallback(
    async (id: string, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'visibility'>) => {
      const sanitized = sanitizeProjectInput(data);
      const path = `projects/${id}`;
      try {
        await updateDoc(doc(db, 'projects', id), {
          ...sanitized,
          updatedAt: serverTimestamp(),
        });
        addToast('success', `Project "${sanitized.title}" updated.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [addToast]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const path = `projects/${id}`;
      try {
        await deleteDoc(doc(db, 'projects', id));
        addToast('info', 'Project removed.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [addToast]
  );

  const reorderProjects = useCallback(
    async (orderedProjects: Project[]) => {
      try {
        const batch = writeBatch(db);
        orderedProjects.forEach((proj, index) => {
          batch.update(doc(db, 'projects', proj.id), {
            order: index,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        addToast('success', 'Project display order updated.');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'projects');
      }
    },
    [addToast]
  );

  const createPost = useCallback(
    async (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readingTimeMinutes'>) => {
      const sanitized = sanitizePostInput(data);
      const rawId = `${sanitized.slug.slice(0, 64)}-${Date.now().toString(36)}`;
      const docId = DOC_ID_PATTERN.test(rawId) ? rawId : `post-${Date.now().toString(36)}`;
      const path = `posts/${docId}`;
      try {
        await setDoc(doc(db, 'posts', docId), {
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addToast(
          'success',
          sanitized.status === 'published'
            ? `Published "${sanitized.title}".`
            : `Saved draft "${sanitized.title}".`
        );
        return docId;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [addToast]
  );

  const updatePost = useCallback(
    async (
      id: string,
      data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readingTimeMinutes'>
    ) => {
      const sanitized = sanitizePostInput(data);
      const path = `posts/${id}`;
      try {
        await updateDoc(doc(db, 'posts', id), {
          ...sanitized,
          updatedAt: serverTimestamp(),
        });
        addToast('success', `Updated "${sanitized.title}".`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [addToast]
  );

  const deletePost = useCallback(
    async (id: string) => {
      const path = `posts/${id}`;
      try {
        await deleteDoc(doc(db, 'posts', id));
        addToast('info', 'Blog post deleted.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [addToast]
  );

  if (fatalError) {
    throw fatalError;
  }

  const isSeededInFirestore = Boolean(remoteProfile);
  const profile = remoteProfile || DEFAULT_PROFILE;

  // Before the admin ever seeds Firestore, show default projects/posts cleanly to visitors.
  // Once seeded, reflect exact live Firestore records (even if empty).
  // If Firestore only holds the legacy template mock projects, display verified resume projects
  const isMockProjects =
    remoteProjects.length > 0 &&
    remoteProjects.some(
      (p) =>
        p.id === 'campusflow-study-hub' ||
        p.id === 'moderne-form-identity' ||
        p.id === 'chromagrid-token-studio'
    );

  const projects =
    isSeededInFirestore && !isMockProjects && remoteProjects.length > 0
      ? remoteProjects
      : DEFAULT_PROJECTS;
  const posts = isSeededInFirestore || remotePosts.length > 0 ? remotePosts : DEFAULT_POSTS;

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts]
  );

  const loadingData = !profileLoaded || !projectsLoaded || !postsLoaded;

  return (
    <DataContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        authLoading,
        authError,
        clearAuthError: () => setAuthError(null),
        signInAsAdmin,
        signOutAdmin,
        profile,
        projects,
        posts,
        publishedPosts,
        loadingData,
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
        toasts,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
