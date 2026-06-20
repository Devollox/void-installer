# Dynamic Paths, Safer Remove & Modal UX

## New features

- **Esc‑to‑close update modal** — the update dialog can now be dismissed with the Escape key, in addition to the “Back to installer” action.

## Improvements

- **Dynamic install path resolution** — the installer no longer relies on a hard‑coded `C:\Users\...\voidpresence` path and instead resolves the install directory at runtime in Go and passes it to the frontend.

## Bug Fixes

- **Fixed hard‑coded install path usage** — Remove flow and status messaging now use the resolved install path instead of a user‑specific hard‑coded value.
- **Fixed incorrect state after failed operations** — failed installs and updates now reset to an idle state, allowing another attempt without restarting the installer.
- **Fixed missing bindings after refactor** — internal Go packages for installer, updates, and paths are now correctly bound so TypeScript bindings generate as expected.
- **Safer update modal behavior** — the update modal correctly respects disabled states during long‑running update operations and avoids conflicting actions.

## Internal

- **Structured backend packages** — backend logic is now organized into `internal/installer`, `internal/updates`, and `internal/installer_paths` for clearer separation of responsibilities.
- **Process‑safe removal flow** — the Remove handler now attempts to terminate running `Void Presence.exe` processes before starting `Uninstall Void Presence.exe`, reducing the chance of uninstall conflicts.
- **Cleaner public API surface** — only the required methods for install, update, path resolution, and removal are exported and bound to the frontend.
