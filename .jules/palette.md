## 2025-05-14 - Centralized Loading State in Button Component
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form. It also helps prevent hydration mismatches by wrapping children in a span when adding a spinner.
**Action:** When implementing async actions, always check if the trigger button supports a `loading` prop before manually managing disabled states or custom spinners. Add support to the base component if missing to maintain design system consistency.

## 2025-05-14 - Semantic Label Association for Select Components
**Learning:** For `Select` components built with primitives (like `@base-ui/react`), the `SelectTrigger` must have an `id` that matches the `Label`'s `htmlFor` to be correctly recognized by screen readers and to allow clicking the label to focus the trigger.
**Action:** Always ensure interactive triggers for complex components (Selects, Dialogs, Popovers) are programmatically associated with their descriptive labels.
