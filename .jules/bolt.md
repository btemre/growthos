## 2026-05-20 - Stabilizing Date-Based Memoization
**Learning:** Using `Date` objects created directly in the component body as `useMemo` dependencies breaks memoization, as new instances are created every render. This leads to expensive filtering logic (like KPI calculations) running more often than necessary.
**Action:** Replace unstable `Date` dependencies with a string-based key (e.g., `format(new Date(), "yyyy-MM-dd")`) and derive thresholds within a stable `useMemo` block to ensure calculations only trigger on data changes or day rollovers.
