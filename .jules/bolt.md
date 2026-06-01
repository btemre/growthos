## 2026-06-01 - DashboardHome Optimization
**Learning:** Using `new Date()` or derived date objects directly in a `useMemo` dependency array causes memoization to fail on every render.
**Action:** Derive a stable string key (e.g., 'yyyy-MM-dd') from the current date and use it as a dependency for date threshold calculations inside the `useMemo` block.
