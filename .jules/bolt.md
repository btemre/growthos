## 2026-05-05 - [React useMemo Dependency Anti-pattern]
**Learning:** In this codebase, `useMemo` hooks frequently included dependency variables that were redefined on every render (like `new Date()`), effectively disabling memoization.
**Action:** Always check if dependencies in `useMemo` or `useEffect` are stable; move unstable object/date creation inside the hook if they only depend on the current time.
