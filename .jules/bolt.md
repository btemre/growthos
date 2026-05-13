## 2025-05-13 - Fixing Broken Memoization in DashboardHome

**Learning:** Including unstable references like `new Date()` or objects created in the component body in a `useMemo` or `useEffect` dependency array causes the hook to re-run on every render, effectively disabling memoization. Similarly, wrapping a component in `React.memo` is ineffective if any of its props are object literals or functions redefined on every parent render.

**Action:** Always move date object creation and complex calculations inside `useMemo` to ensure stable references across renders. Consolidate redundant filtering logic (e.g., `tasks.filter(t => t.status === 'open')`) into the same `useMemo` to further reduce computation in the render path.
