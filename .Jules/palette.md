## 2025-07-12 - [Button Loading & Form Accessibility]
**Learning:** Standardizing loading states at the component level (adding a `loading` prop to `Button`) ensures consistent UX across async operations and reduces boilerplate in forms. Programmatic association of `Label` and `Select` components (using `id` and `htmlFor`) is critical for screen reader users and often missed in custom component implementations.
**Action:** Always check if core components (Button, Input, Select) support native accessibility and feedback props; if not, enhance them once rather than fixing every usage.
