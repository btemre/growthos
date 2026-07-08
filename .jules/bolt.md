## 2025-05-15 - [Date Stability in useMemo]
**Learning:** Using unstable `Date` objects (e.g., `new Date()`) directly in `useMemo` dependency arrays causes the memoized value to be recomputed on every render, as a new object reference is created each time.
**Action:** Implement a stable string-based key (e.g., `todayKey` as 'yyyy-MM-dd') in the component body and use it as the dependency. Inside the hook, reconstruct necessary date boundaries from this string to maintain local timezone consistency and satisfy exhaustive-deps.
