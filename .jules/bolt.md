## 2025-05-15 - Dashboard Memoization Fix
**Learning:** Including values created inside the render body (like `new Date()`) as dependencies in `useMemo` or `useEffect` causes the hook to re-run on every render, as those values are recreationally unstable.
**Action:** Move such calculations inside the memoization/effect hook itself if they don't need to trigger updates, or stabilize them with `useMemo` if they are shared across multiple hooks.
