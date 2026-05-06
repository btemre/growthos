# Bolt's Performance Journal

## 2025-05-15 - [DashboardHome Optimization]
**Learning:** `useMemo` dependencies that are objects or arrays (like `new Date()`) cause the memoized value to be recalculated on every render because of shallow equality checks.Consolidating array filtering (e.g., `tasks.filter(t => t.status === 'open')`) into a single pass within `useMemo` and reusing the result in the JSX significantly reduces redundant computation.
**Action:** Always move date/object/array threshold calculations inside `useMemo` or `useCallback` unless they are stable constants. Pre-calculate common filtered subsets in the same `useMemo` block that derives other stats to avoid multiple iterations in the render path.
