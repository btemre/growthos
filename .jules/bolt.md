## 2026-06-17 - Optimize KPI calculations with single-pass loops
**Learning:** In pages with many metrics (like Reports or Dashboard), iterating over large arrays (leads, tasks) multiple times for different KPIs causes (k*N)$ complexity. Consolidating these into a single (N)$ loop within a memoized object significantly reduces render-phase overhead.
**Action:** Use a single-pass loop to categorize or aggregate items into a 'stats' object when calculating multiple metrics from the same data source.
