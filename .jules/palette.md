## 2025-05-15 - Form Accessibility and Global Button Enhancement
**Learning:** Using `useId` for unique field identifiers and associating `Label` components with `Input` and `SelectTrigger` (via `htmlFor` and `id`) is the standard pattern for accessibility in this project. Additionally, centralizing the `loading` state in the `Button` component simplifies async form feedback.
**Action:** Apply the `useId` and `Label` association pattern to all new forms and utilize the `loading` prop on `Button` for all async actions.
