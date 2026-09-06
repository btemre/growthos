## 2025-05-18 - Targeted Firestore Entity Task Subscriptions
**Learning:** Subscribing to entity-specific task queries using `relatedType` and `relatedId` avoids fetching all tasks for the current user over WebSocket connections. Client-side sorting on `createdAt` avoids composite index requirements while significantly reducing network payload, client memory allocations, and re-renders on detail pages.
**Action:** On entity detail pages, use targeted query subscriptions (e.g. `subscribeTasksForRelated`) rather than broad user-level subscriptions with client-side filtering.
