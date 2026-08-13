# Palette UX Journal

This journal records critical UX/accessibility learnings, patterns, and design decisions in the GOS Web project.

## 2025-02-18 - Select Component Accessibility & Association
**Learning:** Custom Radix/Base-UI `Select` dropdown components do not natively support nesting `<Label>` tags to implicitly associate form labels. They must be explicitly associated using the `htmlFor` attribute on the `<Label>` component pointing to the `id` on the `<SelectTrigger>` component.
**Action:** Always provide unique, deterministic `id` strings to `<SelectTrigger>` components and matching `htmlFor` attributes on their `<Label>` elements.

## 2025-02-18 - Localizing Screen Reader Utilities in Dual-Language/Turkish UI
**Learning:** Generic/Shadcn/Radix primitive UI close/dismiss helpers default to English ("Close"), which causes screen readers to announce mixed-language controls to native Turkish users.
**Action:** Ensure localized screen-reader accessibility controls (such as `aria-label="Kapat"` or localized visual helpers) are defined within application-level sheets and dialogs, keeping design system primitives clean.
