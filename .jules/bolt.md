## 2025-05-18 - Avoid volatile Date object instantiations in useMemo dependency arrays
**Learning:** Creating fresh `Date` objects inside the render body (e.g. `startOfDay(new Date())`) and passing them directly into `useMemo` dependency arrays invalidates the memoization on every single render because object reference comparison fails (`new Date() !== new Date()`).
**Action:** Use a primitive string key (such as `format(new Date(), "yyyy-MM-dd")`) in the dependency array and instantiate `Date` objects inside the `useMemo` callback.
