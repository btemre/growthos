## 2025-05-15 - Centrally Managed Button Loading States

**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form. It also prevents common accessibility oversights like forgetting `aria-busy`.

**Action:** When implementing async actions, prefer adding a `loading` prop to the trigger component rather than manually managing disabled states and spinners in the caller. Always ensure the `loading` state correctly toggles `disabled` and `aria-busy` attributes.
