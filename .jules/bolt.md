## 2025-05-18 - Server-side task filtering for entity detail views
**Learning:** In entity detail views (such as LeadDetailClient), subscribing to all user/tenant tasks via `subscribeTasksForUser` and filtering on the client downloads unnecessary task documents and triggers redundant snapshot re-renders when unrelated tasks change.
**Action:** Use targeted Firestore query subscriptions like `subscribeTasksForRelated` with server-side `where("relatedType", "==", ...) ` and `where("relatedId", "==", ...)` filters. Sort on client-side to avoid needing custom composite Firestore indexes.
