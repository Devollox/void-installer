# Safer In-Place Client Updates

## Improved

- **Force-closed the running client before update** — the installer now terminates any active `Void Presence.exe` processes before launching the NSIS installer, reducing file lock issues and preventing partially applied updates.
- **Used unique temporary installer files** — downloads now save to a fresh temporary `.exe` name instead of reusing the same file, preventing conflicts when an older installer is still present or locked.
- **Added update-timeout safeguards** — HTTP requests for release checks and installer downloads now use explicit timeouts, making the update flow more stable under slow or unreliable network conditions.
