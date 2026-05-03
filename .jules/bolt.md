## 2025-05-22 - [Optimizing DashboardHome Re-renders]
**Learning:** Found that `useMemo` was effectively broken because its dependencies (`todayStart`, `todayEnd`) were being re-calculated as new `Date` objects on every render in the component body. Moving these inside `useMemo` ensures they only recalculate when source data changes.
**Action:** Always check if `useMemo` dependencies are stable; move unstable object/date creations into the `useMemo` callback or memoize them separately.

## 2025-05-22 - [Redundant Array Filtering]
**Learning:** Filtering large arrays multiple times for the same status (e.g., `status === 'open'`) both in `useMemo` and later in JSX is inefficient.
**Action:** Pre-filter intermediate arrays (like `openTasks`) within `useMemo` and reuse them for derived calculations and rendering.
