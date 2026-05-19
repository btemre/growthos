## 2025-05-15 - Stabilizing useMemo dependencies in Dashboard
**Learning:** In `DashboardHome`, including `new Date()` or derived date objects (like `todayStart`) in a `useMemo` dependency array caused the memoization to bail on every render because they were new references every time. This made the expensive filtering logic run on every render regardless of data changes.
**Action:** Move all date threshold calculations inside the `useMemo` block and use a single `now` reference. This stabilizes the dependency array to only track actual data sources (`leads`, `tasks`, `deals`).
