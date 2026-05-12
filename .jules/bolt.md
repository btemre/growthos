## 2025-05-15 - Unstable useMemo Dependencies
**Learning:** Defining date thresholds (like `startOfDay(new Date())`) in the component body and passing them to `useMemo` dependencies causes the memoization to fail on every render, as new `Date` objects are created each time.
**Action:** Move volatile dependency calculations inside the `useMemo` block itself to ensure memoization is only invalidated by actual data changes (e.g., `leads`, `tasks`, `deals`).

## 2025-05-15 - Redundant Filtering in Render Path
**Learning:** Performing array filtering (e.g., `.filter(t => t.status === 'open')`) directly in the JSX or multiple times within a component body leads to wasted cycles on every render.
**Action:** Pre-calculate filtered subsets within a `useMemo` block and expose them as part of the memoized result to be reused throughout the component.
