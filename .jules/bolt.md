## 2025-05-14 - [Unstable Date Dependencies in useMemo]
**Learning:** Defining `Date` objects (like `new Date()`) in the component body and passing them as dependencies to `useMemo` defeats memoization. Since `new Date()` returns a new object reference on every render, the `useMemo` hook executes every time.
**Action:** Calculate time-dependent thresholds inside the `useMemo` block to ensure stable dependencies and prevent redundant calculations.
