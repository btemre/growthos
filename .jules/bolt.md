## 2025-02-15 - Kanban Card Memoization
**Learning:** Kanban boards are highly prone to cascade re-renders across all card components during drags or stage updates. Wrapping cards with `React.memo` successfully prevents these redundant renders, as the card props are stable objects/primitives.
**Action:** When working with dynamic lists or drag-and-drop boards, identify the item components (e.g. `DealCard`, `LeadCard`) and wrap them with `React.memo` to optimize render cycles.
