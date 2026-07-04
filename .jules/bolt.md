## 2025-05-15 - Stabilizing date-dependent hooks in DashboardHome
**Learning:** Using `new Date()` or date utility functions like `startOfDay(new Date())` directly in `useMemo` dependencies or hook bodies causes the calculation to run on every render because each `new Date()` call produces a new object instance.
**Action:** Implement a `todayKey` string pattern (e.g., `format(new Date(), 'yyyy-MM-dd')`) in the component body. Use this string to derive memoized date boundaries. This ensures the boundaries (and any downstream calculations) only update when the calendar day changes.

## 2025-05-15 - Strict functional parity in performance tasks
**Learning:** Introducing small, seemingly logical functional changes (like excluding 'enrolled' students from a 'hot leads' count) during a performance optimization task can be flagged as unintended scope creep or logic changes.
**Action:** Focus purely on technical performance (complexity, stability, re-renders) and avoid modifying the business logic or filtering criteria unless explicitly instructed.
