## 2025-05-14 - Button loading state and form accessibility patterns
**Learning:** Adding a native-feeling loading state to the base `Button` component ensures consistent UX across async actions, and using `useId` with `Select` components (associating `Label htmlFor` with `SelectTrigger id`) provides stable accessible name resolution for screen readers.
**Action:** Always utilize the `loading` prop on `Button` for async submissions and ensure all `Select` fields have associated `Label`s using the `useId` pattern.
