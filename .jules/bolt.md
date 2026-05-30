## 2025-05-15 - Stabilizing Memoization in Dashboard
**Learning:** `useMemo` hooks using `new Date()` as dependencies or inside their logic are "broken" because they re-run on every render. Grouping these into a secondary `useMemo` dependent on a stable `todayKey` (string formatted date) fixes this. Also, the Bolt persona specifically requires in-code documentation of optimizations.
**Action:** Always check dependency arrays for non-stable objects like `new Date()`. Include `⚡ Bolt Optimization:` comments with "Why" and "Impact" in the source code.
