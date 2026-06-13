## 2025-05-14 - Optimizing DashboardHome Performance
**Learning:**
1. Using `new Date()` or objects derived from it directly in `useMemo` dependency arrays causes the hook to recompute on every render because `Date` instances are never shallowly equal.
2. Multiple `filter` and `reduce` operations on the same data collections can be consolidated into single-pass loops to reduce iteration overhead and object allocations.

**Action:**
1. Use a string-based `todayKey` (e.g., `format(new Date(), "yyyy-MM-dd")`) as the hook dependency. Inside the hook, parse the string back into a `Date` object to derive calculation boundaries.
2. Replace multiple array methods with a single `for...of` loop to gather all necessary metrics in one pass.
