## 2025-05-15 - Centralized Button Loading State
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Always prefer the `loading` prop on the `Button` component for async operations instead of manual spinner and disabled state management.
