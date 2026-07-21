# Cross-Platform Installer Support

## New

- **macOS support** — the installer now detects macOS, mounts the `.dmg`, copies the `.app` bundle to `/Applications` using `ditto`, and launches it automatically.
- **Linux support** — the installer detects Linux and runs `pkexec dpkg -i` (with a `sudo dpkg -i` fallback) to install the `.deb` package, then relaunches the app from `/usr/bin/void-presence`.

## Improved

- **Platform-aware install path** — `GetInstallPath` now returns the correct default directory for each OS: `%LOCALAPPDATA%\Programs\voidpresence` on Windows, `/Applications/Void Presence.app` on macOS, `/usr/bin` on Linux.
- **Platform-aware uninstall** — `RemoveVoidPresence` calls the NSIS uninstaller on Windows, `os.RemoveAll` on the `.app` bundle on macOS, and `pkexec dpkg --remove` on Linux.
- **GitHub Actions matrix build** — the release workflow now builds the installer for all three platforms in parallel and publishes them in a single GitHub Release.
