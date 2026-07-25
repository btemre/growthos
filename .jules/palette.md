# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-07-25 - Programmatic Label Associations for Custom Dropdowns
**Learning:** In standard Tailwind CSS/shadcn setups, custom dropdown elements like `Select` (from `@radix-ui/react-select` or similar) do not automatically associate with native `<Label>` elements. This breaks screen readers and prevents users from focusing/activating the dropdown by clicking the label.
**Action:** Always programmatically associate `Label` components with `Select` inputs by assigning a unique `id` to the `SelectTrigger` and a matching `htmlFor` attribute to the `Label`.

## 2025-07-25 - Localization of Screen-Reader Helper Text
**Learning:** Interactive elements such as mobile menu toggle buttons or dialog close buttons must have explicit `aria-label` attributes to be accessible. In a localized app (Turkish in this case), using English fallbacks like "Close" or "Open Menu" breaks accessibility consistency.
**Action:** Localize all helper texts and ARIA labels (e.g., "Menüyü kapat", "Kapat", "Menüyü aç") to match the application's primary language.
