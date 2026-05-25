## 2025-05-15 - Broken useMemo Dependency Stability
**Learning:** Using `new Date()` or derived date objects (like `startOfDay(new Date())`) directly in a `useMemo` dependency array causes the memoization to fail because a new object reference is created on every render.
**Action:** Use a stable primitive, such as a date string (e.g., 'yyyy-MM-dd') as the dependency, and derive the date objects inside the `useMemo` block. This ensures recalculations only occur when the actual day changes or relevant data updates.
