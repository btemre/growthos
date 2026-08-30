## 2025-08-30 - Deduplicate static Firestore lookups in custom hooks using module-level promise cache
**Learning:** Custom hooks called by multiple components on the same view (e.g., `useUserDirectory`) can re-fetch shared Firestore collections multiple times if caching is limited to component state.
**Action:** Use a module-level promise cache (`userDirectoryPromise`) to deduplicate in-flight and completed async fetches across component mounts.
