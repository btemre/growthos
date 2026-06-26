## 2025-05-23 - Centralized Button Loading State
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Use the `loading` prop on `Button` for all async operations instead of manual `disabled` and spinner logic.
