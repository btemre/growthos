## 2025-05-10 - Calendar Page Rendering O(1) Lookups
**Learning:** Filtering arrays on every render or day grid cell in React is highly unoptimized and causes O(Days * Events) calculation overhead in calendars. Pre-grouping items using a memoized Map keyed by 'yyyy-MM-dd' reduces operations to O(Events) during calculation and O(1) during loop rendering.
**Action:** Always pre-group event-like collections by unique date keys using a memoized Map before rendering list grids like calendars.
