## 2025-07-19 - useUserDirectory Memoization
**Learning:** Returning unmemoized objects and function references from custom hooks can trigger cascade re-renders of list cards and pipeline boards (such as `DealCard` or `LeadCard`) because consumer components think the hook outputs have changed, even if their inputs or inner state remain identical.
**Action:** Always memoize helper functions (with `useCallback`) and returned object shapes (with `useMemo`) in custom hooks that are consumed in high-frequency update loops or complex layouts.
