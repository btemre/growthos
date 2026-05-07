## 2025-05-15 - Fixing broken memoization with unstable date thresholds
**Learning:** Initializing date objects like `new Date()` or thresholds like `startOfDay(new Date())` in the component body and passing them as dependencies to `useMemo` causes the memoization to fail on every render, as those objects are new references every time.
**Action:** Always move date threshold calculations inside the `useMemo` block to ensure stable dependency checks and avoid redundant re-calculations.

## 2025-05-15 - Redundant filtering in render path
**Learning:** Filtering the same array multiple times for the same status (e.g., `tasks.filter(t => t.status === "open")`) in both the logic and the JSX causes unnecessary O(n) operations during the render cycle.
**Action:** Pre-calculate filtered intermediate arrays within a `useMemo` block and reuse them throughout the component.
