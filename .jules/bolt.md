## 2025-05-15 - Stabilizing Date Dependencies in Dashboard

**Learning:** Creating new `Date` objects (like `startOfDay(new Date())`) directly in the component body and passing them as `useMemo` dependencies causes the memoization to break on every render. This leads to expensive O(N) recalculations for every state change.

**Action:** Use a string-based key (e.g., `todayKey = format(new Date(), 'yyyy-MM-dd')`) in the dependency array. This ensures the memoized value only recalculates when the calendar date actually changes, or when the underlying data changes.
