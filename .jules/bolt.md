## 2025-05-15 - Stable Date Memoization
**Learning:** Using `new Date()` or derived date objects (like `startOfDay(new Date())`) directly in a `useMemo` dependency array causes the memoization to fail on every render because each instantiation creates a new object reference.
**Action:** Use a stable string key (e.g., `format(new Date(), 'yyyy-MM-dd')`) in the dependency array and derive the required Date objects inside the `useMemo` block using the components of that key to ensure consistency.
