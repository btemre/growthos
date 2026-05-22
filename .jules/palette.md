## 2026-05-22 - [Button Prop Ordering and Select Accessibility]
**Learning:** Spreading props after defining conditional state (like 'loading') in a base component can lead to callers accidentally overriding critical UX logic. Additionally, in the current design system, Select components must have their 'id' on the SelectTrigger for proper Label association.
**Action:** Always spread '{...props}' before setting state-derived attributes like 'disabled' or 'aria-busy' in UI components, and ensure 'SelectTrigger' receives the 'id' for accessibility.
