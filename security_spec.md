# Security Specification & Payload-First TDD (`security_spec.md`)

## 1. Data Invariants

1. **Strict Single-Admin Write Lockout**: Only a Google-authenticated user with `request.auth.token.email == "abdullahbinrashid0@gmail.com"` AND `request.auth.token.email_verified == true` may create, update, or delete any document in `siteContent`, `projects`, or `posts`.
2. **Draft Confidentiality**: Unauthenticated visitors and non-admin signed-in users may NEVER `get` or `list` any document in `posts` where `status == "draft"`.
3. **Singleton Profile Integrity**: Only the `profile` document ID is permitted in `siteContent`. Arbitrary document IDs in `siteContent` are denied.
4. **Schema & Boundary Integrity**: All writes must match exact required/allowed key allowlists (`hasAll`/`hasOnly`), strict string `.size()` ceilings, bounded arrays (`skills <= 40`, `techStack <= 15`, `tags <= 10`), valid ID regex (`^[a-zA-Z0-9_\-]+$`), immutable `createdAt`, and server-enforced `request.time` timestamps.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Unverified Admin Email Spoof**: Write to `siteContent/profile` with `email: "abdullahbinrashid0@gmail.com"` and `email_verified: false` -> `PERMISSION_DENIED`.
2. **Non-Admin Authenticated Write**: Create a project as `attacker@gmail.com` (`email_verified: true`) -> `PERMISSION_DENIED`.
3. **Unauthenticated Write**: Create a post without auth -> `PERMISSION_DENIED`.
4. **Public Draft Leak (Direct Get)**: Unauthenticated `get` on `/posts/secret-draft` (`status: "draft"`) -> `PERMISSION_DENIED`.
5. **Public Draft Leak (List Scraping)**: Unauthenticated `list` on `/posts` without filtering `status == "published"` -> `PERMISSION_DENIED`.
6. **Shadow Ghost Field Injection**: Admin writes `/projects/proj-1` with extra field `isFeaturedSuperAdmin: true` -> `PERMISSION_DENIED`.
7. **ID Poisoning Attack**: Admin creates `/projects/../../hack$id` (invalid chars or >128 chars) -> `PERMISSION_DENIED`.
8. **Denial of Wallet String Flood**: Admin writes `/siteContent/profile` with `bio` > 3000 characters -> `PERMISSION_DENIED`.
9. **Array Exhaustion Attack**: Admin writes `/posts/post-1` with 25 tags (exceeds max 10) -> `PERMISSION_DENIED`.
10. **Client Timestamp Tampering**: Admin creates `/posts/post-2` with forged `createdAt` not equal to `request.time` -> `PERMISSION_DENIED`.
11. **Immortal Field Mutation**: Admin updates `/projects/proj-1` and alters `createdAt` -> `PERMISSION_DENIED`.
12. **Type Poisoning on Update**: Admin updates `/posts/post-1` setting `status: "archived"` (outside enum `["draft", "published"]`) or `readingTimeMinutes: "five"` -> `PERMISSION_DENIED`.
