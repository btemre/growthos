## 2024-06-05 - Date-based Memoization Stability
**Learning:** Using `new Date()` or derived date objects (like `startOfDay(new Date())`) directly in a `useMemo` dependency array causes memoization to fail on every render because a new object reference is created each time.
**Action:** Use a stable string key (e.g., 'yyyy-MM-dd') in the dependency array and derive the date objects inside the `useMemo` block using the key components.

## 2024-06-05 - Task Grouping Optimization
**Learning:** Filtering a large list multiple times (e.g., separate filters for 'overdue', 'today', 'thisWeek', 'later') results in multiple O(N) traversals.
**Action:** Use a single-pass `for...of` loop to categorize items into different buckets in O(N) time.
