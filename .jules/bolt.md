## 2025-05-15 - [Server-side Task Filtering]
**Learning:** Subscribing to a user's entire task list and filtering for a specific entity (e.g., a Lead) on the client side leads to unnecessary data transfer and processing, especially as the task count grows. Firestore should handle this filtering via `where` clauses.
**Action:** Use specific subscription functions like `subscribeTasksForRelated` that leverage Firestore's indexing to fetch only relevant records for detail views. Ensure corresponding composite indexes are added to `firestore.indexes.json`.
