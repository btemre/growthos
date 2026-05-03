## 2025-05-14 - Loading State and Auth Logic
**Learning:** When adding a `loading` prop to shared components for async feedback, it is critical to preserve existing page-level `disabled` logic (like checking if Auth is initialized) to prevent race conditions or unexpected interactions.
**Action:** Always audit the existing `disabled` prop on buttons before replacing it with a `loading` prop; if the `disabled` state depends on multiple conditions, combine them or keep the secondary ones in the `disabled` prop.

## 2025-05-14 - Semantic Form Labels
**Learning:** In a large application, it's common to miss the explicit link between `Label` and `Input`/`Select` components, which breaks screen reader support. Using consistent ID patterns like `task-title` or `lead-name` helps maintain accessibility.
**Action:** Always verify that every `Label` component has an `htmlFor` attribute that matches a unique `id` on the target input element.
