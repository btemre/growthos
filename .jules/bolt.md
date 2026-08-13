# Bolt ⚡ Performance Optimization Journal

## 2025-02-14 - PR Hygiene and Local Lockfile Noise
**Learning:** Running `pnpm install` inside the `web/` directory generates a local `web/pnpm-lock.yaml` file which adds unnecessary file changes to the git status. Since the project doesn't use a pnpm workspace structure with sub-lockfiles, this creates a major diff distraction.
**Action:** Always delete and unstage `web/pnpm-lock.yaml` before committing and submitting PRs.
