## 2026-05-24 - Stable Date Memoization
**Learning:** Using `new Date()` or derived date objects as dependencies in `useMemo` causes re-calculations on every render because each instantiation creates a new reference.
**Action:** Use a string-based key (e.g., `todayKey` formatted as 'yyyy-MM-dd') as the `useMemo` dependency and reconstruct specific date thresholds inside the memo block to ensure they only update when the calendar day changes or data changes.
