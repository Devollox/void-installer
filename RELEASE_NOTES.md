# UI Polish, Safer Flow & Stability

## Improvements

- **Added a guided install flow with clear steps** — the installer now shows a more structured flow for download, verification, and installation, making it easier to understand what happens at each stage.
- **Improved progress feedback** — status updates and progress indicators are now more accurate during download and installation, reducing the feeling that the app is frozen.
- **Refined window appearance** — the frameless window styling, spacing, typography, and dark theme were polished for a cleaner and more readable interface.

## Bug Fixes

- **Fixed rare startup crashes** — key startup paths are now wrapped in panic recovery so the app logs failures instead of closing unexpectedly.
- **Fixed incorrect state after failed install** — failed installs now reset properly, allowing another attempt without restarting the application.
- **Fixed asset loading issues on some systems** — embedded resources from `frontend/dist` are now loaded more reliably across different environments.

## Stability

- **More robust installer workflow** — the installation flow is now more resilient to network errors and user interruption.
- **Improved logging for failures** — download and install errors are now logged with more detail, making troubleshooting easier.
- **Safer panic handling** — a global `recover()` in `main` catches unexpected panics and writes them to the log instead of failing silently.

## Dependencies

- Updated Go/Wails dependencies to current versions for better compatibility with modern Windows environments and improved runtime stability.
