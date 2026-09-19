## 2025-05-18 - Server-side Firestore Task Subscription for Entity Detail Views
**Learning:** Subscribing to all tasks for a user (`subscribeTasksForUser`) and filtering in memory on the client side causes unnecessary data transfer, increased memory footprint, and client CPU re-renders as task lists grow.
**Action:** Use `subscribeTasksForRelated` with `where("relatedType", "==", relatedType)` and `where("relatedId", "==", relatedId)` to query only relevant entity tasks on the Firestore server side. Sort in memory on the client to avoid composite index requirements.
