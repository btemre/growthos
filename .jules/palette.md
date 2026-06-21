## 2026-06-21 - [Centralized Loading State in Button]
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Always check if core UI components support standard UX states (loading, disabled, error) before implementing them locally in features.
