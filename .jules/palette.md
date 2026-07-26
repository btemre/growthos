# Palette's Journal

## 2025-02-18 - Language Agnosticism in Core UI Primitives vs. App-Specific Layouts
**Learning:** Hardcoding localized Turkish text (like "Kapat") inside reusable design system components (such as core `Dialog` or `Sheet` primitive close buttons) breaks internationalization (i18n) support and introduces accessibility/localization regressions for multi-lingual setups. Core primitive components should remain clean and language-agnostic, while localized attributes (such as screen-reader labels and ARIA descriptors) should be defined on the application-specific layouts, shells, or pages where the contextual language is known.
**Action:** When improving accessibility via ARIA labels, prioritize application-level components (e.g., `app-shell.tsx` or page clients) for language-specific labels, rather than modifying generic design system primitives, to maintain clean division of concerns.
