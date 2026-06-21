# Installer UX Improvements

## Improvements

- **Added install progress events** — frontend now tracks installation progress in real time after the download finishes.
- **Clearer status transitions** — the UI now shows `Running installer…` and `Starting application…` while NSIS is doing the actual install.
- **Better user feedback** — the progress label updates without resetting the bar, so it’s obvious that the process is still continuing.
