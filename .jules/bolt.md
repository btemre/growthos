## 2025-05-22 - Dashboard Stats Memoization
**Learning:** React memoization using `useMemo` can be invalidated if dependencies like `new Date()` are calculated in the component body rather than inside the hook. Additionally, complex filtering logic in the render path can be optimized by pre-calculating intermediate arrays (like `openTasks`) to avoid redundant iterations.
**Action:** Always move unstable object/date calculations inside `useMemo` and pre-calculate filtered lists used multiple times in the render path.
