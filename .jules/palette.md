## 2025-07-24 - Custom Select Trigger Accessibility
**Learning:** Custom Base UI / Radix UI Select components do not natively propagate label attributes to their Trigger buttons. To ensure proper assistive technology (screen reader) announcements, SelectTrigger elements must be explicitly assigned a unique `id` attribute, and their descriptive Labels must refer to this ID via the `htmlFor` attribute.
**Action:** When using custom Select components, always pair the custom Trigger with a Label using `id` on the `<SelectTrigger>` and `htmlFor` on the `<Label>`.
