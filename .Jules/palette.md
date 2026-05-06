## 2026-05-06 - [Button Loading State & ARIA Labels]
**Learning:** Adding a `loading` prop to a shared `Button` component significantly improves perceived performance and prevents double-submission issues across the app. Icon-only buttons (like mobile menu toggles) are common accessibility gaps that can be easily fixed with `aria-label`.
**Action:** When creating or modifying button components, always ensure they support a loading state and that icon-only variants have descriptive ARIA labels.
