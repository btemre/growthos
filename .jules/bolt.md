## 2025-01-24 - Stable useMemo dependencies for dates
**Learning:** Using `new Date()` or its derivatives (like `startOfDay(new Date())`) directly in the dependency array of a `useMemo` or `useEffect` hook causes it to re-run on every render, as the Date object reference is always new.
**Action:** Use a `todayKey` (string in `yyyy-MM-dd` format) derived once per render to stabilize dependencies that only need to change when the calendar day changes.
