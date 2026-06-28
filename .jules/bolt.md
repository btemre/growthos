## 2026-06-28 - TasksPageClient Optimization
**Learning:** Replaced multiple `.filter` passes with a single-pass `forEach` loop in `TasksPageClient` to optimize O(N) grouping, and used a `todayKey` string pattern to stabilize `useMemo` dependencies for date-related calculations.
**Action:** Use single-pass aggregation for list grouping and string-based keys for stable date dependencies in future components.
