## 2025-05-15 - [Calendar Performance Optimization]
**Learning:** Filtering a flat list of events for every day in a calendar grid results in O(N*M) complexity, which scales poorly as the number of tasks/leads increases. Pre-grouping events into a Map keyed by date strings (yyyy-MM-dd) reduces lookup complexity to O(1) per day.
**Action:** Always prefer Map-based lookups for grid-style rendering or repeated filtering of the same dataset.

## 2025-05-15 - [PR Hygiene and Scope]
**Learning:** Running 'pnpm install' in a subdirectory might generate a 'pnpm-lock.yaml' which should not be committed if the project uses a root 'package-lock.json'. Also, temporary verification routes and logs must be manually removed before PR.
**Action:** Double-check git status for junk files like logs, lockfiles, and temporary routes before calling submit.
