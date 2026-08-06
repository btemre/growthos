## 2025-08-06 - Accessible Custom Select Triggers and Unified Loading States

**Learning:** When custom design system wrappers around primitive components (like Radix Select or Base UI Button) are introduced, generic accessibility attributes such as `htmlFor`/`id` association can easily be broken if not passed down. Additionally, handling async loading states explicitly in every form button leads to visual inconsistency and verbose JSX with custom toggle checks (e.g. `disabled={busy} ... busy ? "Kaydediliyor..." : "Oluştur"`).

**Action:**
1. Always extend the design system's core primitive wrappers (such as `Button` and `SelectTrigger`) to accept and pass down `id` and `htmlFor` properties to maintain perfect screen reader association.
2. Standardize asynchronous submission buttons by utilizing a unified, design-system-integrated `loading` prop on the core `Button` component that seamlessly handles disabling, `aria-busy="true"`, and the animated `Loader2Icon` spinner.
