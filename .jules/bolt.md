## 2025-05-14 - DashboardHome Memoization Stabilization
**Learning:** Using `new Date()` directly in a component's render body as a dependency for `useMemo` causes the memoization to fail on every render, as a new object reference is created each time. In `DashboardHome`, this was causing expensive filtering logic to re-run on every state update.
**Action:** Stabilize date-based `useMemo` dependencies by generating a string-based key (e.g., `yyyy-MM-dd`) at the component level. Derive the actual `Date` objects inside the `useMemo` block using that key to ensure stability throughout the day.
