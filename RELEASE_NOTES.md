# Safer In-Place Client Updates

## Improved

- **Force-closed the running client before update** — the installer now terminates any active `Void Presence.exe` processes before launching the NSIS installer, reducing file lock issues and preventing partially applied updates.
