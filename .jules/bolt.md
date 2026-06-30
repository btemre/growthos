## 2025-05-14 - Optimized Calendar Rendering

**Learning:** The calendar component was performing O(N) filtering of the events array for every cell in the O(M) calendar grid, leading to O(N*M) complexity. This pattern significantly impacts performance as the number of tasks and leads grows.

**Action:** Group events into a Map keyed by date string (yyyy-MM-dd) once per render (or when data changes) to allow O(1) lookups during grid rendering, reducing complexity to O(N+M).
