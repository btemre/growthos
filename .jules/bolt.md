## 2025-03-05 - Render-Phase State Adjustments
**Learning:** Calling `setState` synchronously within a `useEffect` triggers extra cascading renders in React. Adjusting state during the render phase conditionally instead of doing it in an effect avoids the extra commit phase and saves performance overhead.
**Action:** Always identify state values synchronized from props/dependencies in `useEffect` and convert them to conditional render-phase state adjustments if possible.
