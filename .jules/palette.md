## 2025-05-14 - Button Loading State
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Always check if core UI components can handle common states (loading, error, etc.) before implementing them locally in components.
