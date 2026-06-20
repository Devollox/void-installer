# Components & UI Structure & Auto‑Updates

## New features

- **Built‑in installer auto‑update** — on startup, the installer now checks the latest `void-installer` release on GitHub and compares it with its current version.
- **Update modal for new versions** — when a newer installer is available, a dedicated modal shows the current and latest versions, the installer asset name, and a clear primary action.
- **“Download and install” handoff flow** — clicking **Download and install** downloads the new installer `.exe` to the system temp directory, launches it, and then cleanly exits the current instance so only the new installer remains running.

## Improvements

- **Centralized installer logic hook** — a `useInstaller` hook now owns installer and updater state (`mode`, `installState`, `statusLabel`, `progress`, `updateInfo`), subscriptions to `download:progress`, and orchestration of `DownloadInstaller`, `RunNsis`, and `RunInstallerUpdater`.
- **Header component** — renders the frameless window header with branding, a live status chip, and minimize/close controls.
- **Mode selector component** — manages the Install/Remove segmented buttons and displays install path, download path, and update availability inline.
- **Progress panel component** — shows the resolved release tag, refresh control, progress bar and percentage, and the main Install/Remove action button with correct disabled states.
- **Update modal component** — encapsulates the full‑screen overlay for installer updates, including version comparison, installer file details, a “Back to installer” action, and the primary **Download and install** button.
