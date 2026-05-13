## 2025-05-13 - Standardized Loading State in Button Component
**Learning:** For a consistent UX, async buttons should handle their own loading state. In this design system, icon buttons should replace their content with a spinner, while standard buttons should show it inline.
**Action:** Use the `loading` prop in the `Button` component, which automatically handles `disabled`, `aria-busy`, and displays the `Loader2Icon`. Detect icon-only buttons via `size.startsWith("icon")`.
