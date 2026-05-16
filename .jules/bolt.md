## 2025-05-15 - Stabilizing useMemo Dependencies with Date Thresholds
**Learning:** Creating new `Date` objects (e.g., `new Date()`) inside a component body and passing them as dependencies to `useMemo` or `useEffect` causes them to re-run on every render because `Date` is a reference type and `new Date()` always returns a new reference.
**Action:** Consolidate and memoize date-based thresholds with an empty dependency array `[]` (if they only need to be calculated at mount) or a stable trigger to ensure downstream hooks only re-calculate when necessary.
