# Palette UX Journal

<!-- This journal logs only critical, app-specific UX/accessibility learnings. No routine logs. -->

## 2025-02-18 - Base UI Dialog and Sheet Close Button Localization
**Learning:** The Base UI-based Dialog and Sheet components standardly render screen-reader-only labels (`<span className="sr-only">`) in English (e.g., `"Close"`), which creates a localized voice-over mismatch for users when the entire parent application's interface and controls are in Turkish.
**Action:** When creating or editing popup modal components, ensure close buttons and other helper labels are fully translated to `"Kapat"` (or localized alternatives) to align with the application's core Turkish localization for screen readers.
