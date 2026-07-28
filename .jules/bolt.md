# Bolt ⚡ - Performance-focused Journal

## 2025-02-18 - Eliminating Cascading Renders in Core React Hooks & Components
**Learning:** Calling setState synchronously inside a `useEffect` on mount/update causes the browser to execute double rendering cycles (cascading renders) before paint, hurting mount performance. React recommends "adjusting state during render" or pre-calculating state derived directly from render values.
**Action:** Replace mount-time `useEffect` state syncs with inline conditional rendering checks or initializer state updates, ensuring strict React Compiler and ESLint compliance.
