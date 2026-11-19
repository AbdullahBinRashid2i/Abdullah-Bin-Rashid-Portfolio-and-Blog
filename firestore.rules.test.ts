/**
 * Payload-First Security Rule Test Specification (Dirty Dozen)
 *
 * Verifies the 12 adversarial payloads defined in security_spec.md against
 * firestore.rules when run with @firebase/rules-unit-testing and the
 * Firestore Emulator.
 */
export const DIRTY_DOZEN_CASES = [
  {
    id: 1,
    name: 'Unverified Admin Email Spoof',
    path: 'siteContent/profile',
    operation: 'create',
    auth: { uid: 'spoof', email: 'abdullahbinrashid0@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-Admin Authenticated Write',
    path: 'projects/proj-1',
    operation: 'create',
    auth: { uid: 'attacker', email: 'attacker@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unauthenticated Write',
    path: 'posts/post-1',
    operation: 'create',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Public Draft Leak (Direct Get)',
    path: 'posts/secret-draft',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Public Draft Leak (Unfiltered List)',
    path: 'posts',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow Ghost Field Injection',
    path: 'projects/proj-1',
    operation: 'create',
    auth: { uid: 'admin', email: 'abdullahbinrashid0@gmail.com', email_verified: true },
    payloadExtra: { isSuperAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'ID Poisoning Attack',
    path: 'projects/bad$id!attack',
    operation: 'create',
    auth: { uid: 'admin', email: 'abdullahbinrashid0@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial of Wallet String Flood',
    path: 'siteContent/profile',
    operation: 'update',
    auth: { uid: 'admin', email: 'abdullahbinrashid0@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Array Exhaustion Attack',
    path: 'posts/post-1',
    operation: 'create',
    auth: { uid: 'admin', email: 'abdullahbinrashid0@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Client Timestamp Tampering',
    path: 'posts/post-2',
    operation: 'create',
    auth: { uid: 'admin', email: 'abdullahbinrashid0@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Immortal Field Mutation (createdAt)',
    path: 'projects/proj-1',
    operation: 'update',
    auth: { uid: 'admin', email: 'abdullahbinrashid0@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Type Poisoning on Update',
    path: 'posts/post-1',
    operation: 'update',
    auth: { uid: 'admin', email: 'abdullahbinrashid0@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
] as const;
