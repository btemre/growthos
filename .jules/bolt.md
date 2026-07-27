## 2025-07-27 - Cascading Renders in React effects
**Learning:** Calling setState synchronously within an effect causes cascading renders that hurt application performance. This is particularly prevalent in custom hooks or context providers when transitioning states during component initialization.
**Action:** Avoid calling setState synchronously inside a `useEffect` callback whenever the target state can instead be derived during the render phase or initial state setup.
