## 2025-05-01 - [Avoid Unstable useMemo Dependencies]
**Learning:** Using `new Date()` or other object literals directly in a component body and including them in a `useMemo` dependency array causes the memoization to fail. Each render creates a new object reference, triggering the expensive computation every time.
**Action:** Move unstable object/date calculations INSIDE the `useMemo` callback itself, or memoize them separately if they are shared across multiple hooks.

## 2025-05-01 - [Unexpected Lockfile Generation]
**Learning:** Running `pnpm install` in a directory with a `package.json` but no `pnpm-lock.yaml` (or where only `package-lock.json` exists) will generate a new `pnpm-lock.yaml`. This can result in massive, unintentional file additions to a PR.
**Action:** Always check `git status` after installing dependencies and ensure only intended code changes are staged for commit. Avoid committing automatically generated lockfiles unless specifically requested.
