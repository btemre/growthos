## 2025-05-14 - [Button Loading State]
**Learning:** Adding a native `loading` prop to core Button components allows for centralized accessibility management (aria-busy, disabled state) and consistent UX (spinning icons) across the app, reducing boilerplate in form components.
**Action:** Use the `loading` prop on `Button` instead of manually managing `disabled` and conditional text/icons for async operations.
