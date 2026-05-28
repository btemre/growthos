## 2025-05-15 - Date reference stabilization in useMemo
**Learning:** Using `new Date()` in the dependency array of `useMemo` or `useEffect` (or relying on it from the component scope) causes the hook to re-run on every render because each `new Date()` is a unique object reference.
**Action:** Use a stable string key (e.g., `format(new Date(), 'yyyy-MM-dd')`) as a dependency and re-instantiate necessary date objects inside the hook to ensure memoization works correctly while still responding to date changes (on a daily basis).
