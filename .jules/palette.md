## 2025-05-14 - Loading state feedback in Button component
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Always prefer adding state support to base UI components rather than manual implementation in individual features.
