## 2025-05-14 - Button loading and accessibility pattern
**Learning:** Standardizing a `loading` prop in the core `Button` component ensures consistent UI feedback for async actions (like login) and centralizes accessibility attributes like `aria-busy`. For icon-only buttons, the spinner should replace the icon to maintain layout stability.
**Action:** Always check if the shared `Button` component supports a `loading` state before manually implementing one with local state and icons. Ensure icon-only buttons use `aria-label` and decorative icons use `aria-hidden="true"`.
