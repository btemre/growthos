## 2025-07-10 - [Optimized data processing in ReportsPageClient]
**Learning:** Consolidating multiple `useMemo` hooks that iterate over the same collections into a single-pass `useMemo` block significantly reduces rendering overhead, especially as dataset sizes grow. Map-based lookups for related entities (e.g., users, sources) further improve performance from O(N*M) to O(N+M).
**Action:** Always look for patterns where multiple filters/maps are applied to the same array and consolidate them into a single loop or Map-based grouping pass.
