## 2025-05-14 - Loading states for Button component
**Learning:** Adding a centralized `loading` prop to the base `Button` component ensures consistent UX across the app, prevents double-submissions by disabling the button, and improves accessibility via `aria-busy`.
**Action:** Always prefer a declarative `loading` prop on buttons rather than manually managing `disabled` and conditional spinners in forms.
