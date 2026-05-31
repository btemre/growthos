## 2026-05-31 - Loading state pattern for Button component
**Learning:** Adding a `loading` prop to the core `Button` component that automatically handles `disabled`, `aria-busy`, and renders a spinner (`Loader2Icon`) provides a consistent and accessible way to handle asynchronous actions across the application. For icon-only buttons, replacing the icon with the spinner is preferred to maintain layout consistency.
**Action:** Use the `loading` prop on `Button` for all asynchronous operations instead of manual `disabled` and spinner logic.
