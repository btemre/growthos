# Palette's Journal - Critical UX/A11y Learnings

## 2025-02-14 - Calendar Day Button Keyboard Focus & Screen Reader Context
**Learning:** Calendar days are often built with simple `button` elements that lack proper screen reader status and visible keyboard focus. By adding `aria-pressed` for current selection state, explicit localized Turkish `aria-label` with event counts, and applying `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none`, we provide keyboard navigators and screen readers with rich contextual information without redundant announcements (via `aria-hidden` on internal visual labels).
**Action:** Always verify calendar grid elements for keyboard focus rings and ensure interactive states like selected day and event/status readouts are clearly spoken in the target locale.
