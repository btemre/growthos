## 2025-05-14 - Single-pass Optimization for Reports

**Learning:** In the `ReportsPageClient` component, multiple `useMemo` hooks were independently filtering and traversing the `leads` array (e.g., `leadsInRange`, `enrolledInRange`, `bySource`, `conversionBySource`). This created O(k*N) complexity. Additionally, nested loop lookups in `ownerStats` using `users.find` resulted in O(N*M) complexity.

**Action:** Consolidate multiple metrics into a single `useMemo` block that performs a single O(N) pass over the data array. Pre-map related data (like `users`) into a hash map for O(1) lookups during traversal. This pattern should be applied to all dashboard/reporting pages with large datasets.
