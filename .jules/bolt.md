## 2025-05-14 - Optimized TasksPageClient Grouping Logic
**Learning:** Multiple .filter and .map passes over a large array (like tasks) can be consolidated into a single O(N) pass to reduce computational overhead and improve rendering speed.
**Action:** Always check for repeated array iterations in useMemo blocks and consider refactoring to single-pass loops.
