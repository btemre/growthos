## 2025-05-15 - Stabilizing Date Dependencies in useMemo
**Learning:** Using `new Date()` or derived Date objects directly in `useMemo` dependencies causes the memoization to bail out on every render because Date objects are reference types and new instances are created every time. This was causing expensive KPI calculations (filtering/reducing large arrays) to run on every render in `DashboardHome`.
**Action:** Use a string-based date key (e.g., `format(new Date(), 'yyyy-MM-dd')`) as a dependency to ensure recalculations only happen when the calendar day actually changes.
