## 2025-05-13 - Stabilizing useMemo with todayKey pattern
**Learning:** Using new `Date()` objects or results of `startOfDay(new Date())` directly in `useMemo` dependency arrays causes the hook to re-run on every render because each `Date` instance is a new reference.
**Action:** Use a string-based `todayKey` (yyyy-MM-dd) calculated in the component body as the stable dependency for date-based memoization. Parse this string inside the hook to ensure local timezone consistency.

## 2025-05-13 - Single-pass Dashboard Statistics
**Learning:** Calculating multiple metrics from the same large collections (leads, tasks, deals) using individual `.filter()` or `.reduce()` calls results in O(k*N) complexity.
**Action:** Use a single `.forEach()` pass to accumulate all metrics in O(N) time, and expose common filtered subsets (like `openTasks`) from the memoized result to avoid re-filtering in the JSX.
