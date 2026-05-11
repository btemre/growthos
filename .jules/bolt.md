## 2025-05-14 - Unstable dependencies in useMemo
**Learning:** Creating new instances (like `new Date()`) in the component body and passing them as dependencies to `useMemo` or `useCallback` invalidates the memoization on every render.
**Action:** Move instantiation of objects or calculation of thresholds inside the `useMemo`/`useCallback` body unless they are truly external dependencies.

## 2025-05-14 - Redundant array filtering in render
**Learning:** Filtering the same array multiple times in the render path (e.g., `tasks.filter(t => t.status === 'open')`) is inefficient, especially when the filtered result is used in multiple places (KPIs and lists).
**Action:** Perform the filtering once inside `useMemo` and return the filtered array as part of the memoized value.
