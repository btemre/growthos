## 2026-03-31 - Initial Loading Feedback for Firestore Collections
**Learning:** When rendering lists fetched asynchronously (e.g. `listUsers`), initializing list state to `[]` without a loading indicator causes a jarring flash of `EmptyState` ("Kullanıcı bulunamadı") before data resolves.
**Action:** Always maintain an explicit `loading` state (set to `false` in `finally`) and render `Skeleton` placeholders during initial fetch to provide smooth visual continuity.
