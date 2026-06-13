# Palette's Journal - UX & Accessibility Learnings

This journal documents critical UX and accessibility learnings discovered during the development of this project.

## 2025-05-22 - Unified Loading State Pattern
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Always prefer using the `loading` prop on the `Button` component over manual text swapping or local spinner implementations.
