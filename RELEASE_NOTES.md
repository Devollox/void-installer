# Installer Backend Endpoint & Silent Flow

## Added

- **Internal installer version endpoint usage** — the installer now checks for updates via the `https://api.voidpresence.site/v1/github/installer` endpoint instead of talking to GitHub directly, using a small `updates` helper that normalizes tags and exposes a simple `hasUpdate` flag and download URL.
- **Application release endpoint integration** — the embedded installer app now fetches the latest Void Presence release metadata from `https://api.voidpresence.site/v1/github/application`, validating the tag, asset name, and download URL before starting the download.
- **Background installer download** — the main application installer is downloaded in the background through the new API-driven flow, with progress updates emitted as events while keeping the UI responsive.

## Changed

- **Silent installer execution** — the NSIS installer now runs with hidden window flags (`/S` and `HideWindow`), so the installation proceeds quietly without popping up an extra console or installer window.
- **Silent app launch after install** — once installation is complete, the newly installed Void Presence executable is started with hidden window flags as well, keeping the transition from installer to app smooth and unobtrusive for the user.
- **Silent updater bootstrap** — the installer updater binary is spawned in the background with a hidden window, and the existing installer process exits automatically after handing off control to the updater.
