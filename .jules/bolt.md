## 2026-05-29 - Stable Date Thresholds in useMemo
**Learning:** Using `new Date()` or derived date objects directly in a `useMemo` dependency array causes memoization to fail on every render because a new object reference is created each time.
**Action:** Derive a string-based key from the current date (e.g., `yyyy-MM-dd`) and use it as a dependency for date threshold calculations. This ensures thresholds remain stable throughout the day and avoid triggering expensive recalculations on every component render.
