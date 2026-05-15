## 2025-05-14 - Broken Memoization via Unstable Dependencies
**Learning:** In `DashboardHome.tsx`, `useMemo` was being used with dependencies that were recreated on every render (Date objects via `startOfDay(new Date())`). This caused the expensive filtering and calculation logic to run on every render, defeating the purpose of `useMemo`.
**Action:** Move date threshold calculations inside the `useMemo` callback or use stable dependencies (like timestamps or formatted date strings) to ensure memoization works as intended.
