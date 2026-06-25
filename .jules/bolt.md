## 2025-06-25 - Stabilizing useMemo with todayKey

**Learning:** Using `new Date()` directly in `useMemo` dependencies (via variables like `todayStart`) causes the memoized value to be re-calculated on every render because each `new Date()` creates a unique object reference.

**Action:** Use a stable string representation like `todayKey` (yyyy-MM-dd) as the dependency, and derive local date objects inside the `useMemo` hook.
