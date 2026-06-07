## 2025-05-14 - [Consolidated Single-Pass Traversals]
**Learning:** Multiple O(N) operations (filter, map, reduce) on the same large dataset (e.g., leads) can be consolidated into a single O(N) pass by populating multiple accumulators/sub-lists simultaneously within a single loop inside a useMemo block. This significantly reduces total iterations and execution time for component initialization and updates.
**Action:** Always check if a component is iterating over the same state/prop array multiple times to derive different metrics. Consolidate these into a single pass.

## 2025-05-14 - [O(1) Map Lookups for Relational Data]
**Learning:** Performing a .find() or .filter() on an array (O(M)) inside a loop over another array (O(N)) creates O(N*M) complexity. Pre-processing the lookup data into a Map (O(M)) allows for O(1) lookups inside the loop, resulting in O(N+M) total complexity.
**Action:** Use Map objects for ID-based lookups when joining data from different sources in the render path.
