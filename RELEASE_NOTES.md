# CI/CD Automation & Version Sync

## Improvements

- **Automated multi-file version synchronization** — added a unified build script that reads the version from `wails.json` and syncs it across the codebase before compilation.
- **Synchronized frontend metadata** — version numbers are now automatically injected into `package.json` and `package-lock.json` (v3) to prevent lockfile desync warnings during dependency installation.
- **Automated Go update constants** — the update manager package now receives the fresh version tag directly into `updates.go` right inside the GitHub Actions pipeline, eliminating manual tracking errors.
