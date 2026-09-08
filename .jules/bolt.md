## 2025-05-18 - Server-side entity filtering for Firestore subscriptions
**Learning:** Fetching all tasks for a user (`subscribeTasksForUser`) on entity detail pages (such as lead details) forces client-side array filtering across all user tasks, transferring unnecessary documents and causing client CPU re-filtering overhead whenever unrelated tasks change.
**Action:** Use targeted query functions (such as `subscribeTasksForRelated`) to query Firestore server-side on `relatedType` and `relatedId`, sorting on the client-side to prevent composite index overhead.
