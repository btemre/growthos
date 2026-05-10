## 2026-05-10 - [Select Label Association]
**Learning:** In this design system (based on Radix/Base-UI), associating a `Label` with a `Select` component requires applying the `id` to the `SelectTrigger` and the `htmlFor` to the `Label`. This ensures semantic accessibility and correct screen reader announcements.
**Action:** Always apply `id` to `SelectTrigger` when linking with a `Label` in future forms.
