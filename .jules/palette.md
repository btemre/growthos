## 2025-05-15 - Centrally Managed Loading States
**Learning:** Centrally managing `loading` states in the `Button` component ensures consistent keyboard accessibility (via `disabled` and `aria-busy`) and visual feedback (via `Loader2Icon`) without duplicating logic in every form.
**Action:** Always prefer adding functional props to core components rather than manual loading logic in individual pages.

## 2025-05-15 - Hydration and Nested Buttons
**Learning:** Using `@base-ui/react` components with a `render` prop (like `DialogPrimitive.Close`) wrapping the project's custom `Button` component can trigger hydration mismatches or nested button errors if the primitive and the custom component both attempt to render underlying button elements.
**Action:** Be mindful of component primitives and ensure they don't double-render interactive elements.
