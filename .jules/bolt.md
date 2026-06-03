## 2026-06-03 - Optimize DashboardHome performance and memoization
**Learning:** Consolidating multiple array filter/reduce operations into a single loop significantly reduces the O(N) overhead in the render path. Stabilizing useMemo dependencies with a string-based date key (todayKey) prevents redundant re-computations that would otherwise occur on every render due to fresh Date objects.
**Action:** Always prefer single-pass array processing in complex useMemo blocks and use stable primitive keys for date-dependent memoization.
