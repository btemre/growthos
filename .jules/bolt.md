## 2026-06-26 - Optimize DashboardHome calculations and dependencies
**Learning:** Consolidating multiple O(N) traversals (filter/reduce) into a single-pass forEach loop significantly reduces computational overhead as the dataset grows. Additionally, using a string-based 'todayKey' instead of raw Date objects stabilizes useMemo dependencies while ensuring correctness across midnight if calculated correctly in the component body.
**Action:** Always look for opportunities to aggregate multiple metrics in a single pass over shared collections.
