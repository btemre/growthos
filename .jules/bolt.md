## 2025-05-18 - Server-side entity filtering for Firestore subscriptions
**Learning:** Subscribing to user-wide collections (`subscribeTasksForUser`) and filtering by entity ID on the client downloads unnecessary documents and causes full-list re-subscribes. Querying directly by `relatedType` and `relatedId` with client-side sorting avoids both composite index requirements and unnecessary network reads.
**Action:** Always prefer entity-level subscription functions (`subscribeTasksForRelated`) for detail views instead of filtering user-wide collection subscriptions on the client.
