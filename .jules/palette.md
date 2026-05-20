## 2025-03-03 - [Accessibility: Label Association Pattern]
**Learning:** In this project's design system, standard association of `<Label>` and `<Input>` via `htmlFor`/`id` is often missing in custom forms. Furthermore, when using `<Select>`, the `id` should be applied to the `<SelectTrigger>` to ensure correct screen reader behavior and click-to-focus functionality.
**Action:** Always use `useId` to generate unique IDs for form fields and ensure both `Input` and `SelectTrigger` are correctly associated with their `Label` via `id` and `htmlFor` respectively.
