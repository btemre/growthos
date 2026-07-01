## 2025-07-01 - Optimizing DashboardHome data processing

**Learning:** Calculating `Date` objects directly in a component body or as dependencies for `useMemo` triggers re-renders and re-computations on every render because each `new Date()` call creates a new object identity. String-based keys (e.g., 'yyyy-MM-dd') provide a stable way to represent time-based dependencies that only change when the calendar day actually rolls over.

**Action:** Use a `todayKey` string derived from `format(new Date(), 'yyyy-MM-dd')` and move all date-boundary calculations inside the `useMemo` factory, deriving them from the split key to ensure stability and local timezone consistency.
