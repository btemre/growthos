## 2025-05-14 - Stable Date References for Memoization

**Learning:** `React.memo` fails on `Date` props if the parent component recreates them on every render (e.g., using `eachDayOfInterval`). Even if the calendar grid doesn't change, new `Date` instances trigger unnecessary re-renders.

**Action:** Wrap date-generating functions (like `eachDayOfInterval`) in `useMemo` with stable dependencies to ensure consistent object references for memoized child components.
