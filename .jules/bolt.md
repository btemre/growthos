## 2025-05-14 - Broken useMemo due to unstable dependencies
**Learning:** Including unstable references (like new `Date()` objects created in the component body) in a `useMemo` dependency array causes the memoized block to re-execute on every render, defeating the optimization.
**Action:** Always move the creation of such objects inside the `useMemo` block if they are only used there, or ensure they are memoized themselves if used across multiple hooks.
