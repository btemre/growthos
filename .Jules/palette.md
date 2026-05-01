## 2026-05-01 - [Button Loading State Logic]
**Learning:** When adding a `loading` state to shared `Button` components, ensure that page-level `disabled` logic (e.g., checking if Auth is still initializing) is preserved alongside the new `loading` prop to prevent interaction regressions.
**Action:** Always check for existing `disabled` conditions when replacing them with a `loading` prop and combine them if necessary.
