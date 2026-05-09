## 2026-05-09 - Unstable Date Dependencies in useMemo
**Learning:** In components like DashboardHome that use relative time thresholds (e.g., todayStart, weekAgo), defining these thresholds as dependencies to useMemo using 'new Date()' causes the memoization to invalidate on every render.
**Action:** Move date threshold calculations (startOfDay, subDays) inside the useMemo callback itself to ensure they only execute when the actual data sets change, or use a stable time-based trigger if periodic updates are needed.
