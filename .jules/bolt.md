## 2025-07-06 - Optimizing Dashboard Statistics with Dependency Stabilization

**Learning:** Component metrics were being recalculated on every render because 'useMemo' dependencies were new 'Date' objects. Stabilizing these with a 'todayKey' string (yyyy-MM-dd) ensures calculations only run once per day or when data actually changes. Additionally, refactoring multiple filter/reduce passes into a single O(N) traversal significantly reduces CPU overhead for large datasets.

**Action:** Always stabilize date-based dependencies using string keys and prioritize single-pass O(N) traversals for multiple derived metrics.
