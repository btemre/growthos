## 2025-05-15 - Server-side Task Filtering
**Learning:** Client-side filtering of Firestore subscriptions (fetching all and filtering locally) is a major bottleneck as data scales. In this codebase, detail views often fetched all records for a user, leading to O(N) network and CPU overhead.
**Action:** Implement specific server-side subscription functions (like `subscribeTasksForRelated`) and ensure corresponding composite indexes are added to `firestore.indexes.json`.
