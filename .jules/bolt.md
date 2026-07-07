## 2025-05-14 - Dashboard and Pipeline Board Optimizations
**Learning:** Consolidating multiple filter/reduce passes into a single O(N) loop significantly reduces redundant iterations on large datasets. Using a string-based `todayKey` stabilizes `useMemo` dependencies that would otherwise change on every render due to `new Date()` calls.
**Action:** Always prefer single-pass traversals for grouping/metrics and stabilize date-dependent hooks with formatted string keys.
