## 2025-05-15 - Stable Date Memoization in Dashboard
**Learning:** Using `new Date()` or its derivatives (like `startOfDay(new Date())`) as dependencies in `useMemo` causes the hook to re-run on every render because a new object reference is created each time. This nullifies the performance benefits of memoization.
**Action:** Use a stable string key (e.g., `format(new Date(), 'yyyy-MM-dd')`) in the dependency array. Derive the actual date objects inside the `useMemo` block by parsing this key to ensure they are consistent for the duration of that key's value.
