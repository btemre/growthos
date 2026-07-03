## 2026-07-03 - [Centralized Button Loading State]
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form. Spreading `...props` before explicit attribute overrides (e.g., `disabled`) ensures component-level state logic correctly dictates the final element state.
**Action:** Use the `loading` prop on `Button` for all async operations instead of manual `disabled` and spinner logic.
