## 2025-05-15 - Dashboard Optimization Pattern
**Learning:** Derived values from large Firestore collections (leads, tasks, deals) were being recalculated on every render because `new Date()` was used in `useMemo` dependencies and inside loops. Stabilizing the "today" reference with a string-based `todayKey` prevents this.
**Action:** Use a `yyyy-MM-dd` key to stabilize date thresholds in `useMemo` and consolidate filtering of large arrays into a single memoized result.
