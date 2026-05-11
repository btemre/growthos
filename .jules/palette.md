## 2025-05-14 - Button Loading State and Component Composition
**Learning:** When adding a `loading` prop to a core `Button` component that calculates its `disabled` state (e.g., `disabled={loading || disabled}`), you must explicitly destructure `disabled` from props before spreading `{...props}`. Failing to do so allows the spread to overwrite your calculated state with `undefined` if the caller didn't provide a `disabled` prop.
**Action:** Always destructure all props that contribute to calculated attributes before spreading remaining props onto the root element of a component.

## 2025-05-14 - Accessible Label Associations for Select Components
**Learning:** In this project's design system (based on Base UI), the `Select` component's accessibility is best handled by associating the `Label` with the `SelectTrigger`.
**Action:** Apply the `id` to the `SelectTrigger` component and the `htmlFor` to the `Label` to ensure semantic accessibility and screen reader support.
