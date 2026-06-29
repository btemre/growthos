## 2025-05-14 - [Standardized Loading State for Buttons]
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Always use the `loading` prop in the `Button` component for async operations to maintain UI consistency and accessibility.
