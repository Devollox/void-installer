# Layout & UX Update

## Improvements

- **Adjusted installer window size** — updated the default window to a more compact 680×472 layout for a tighter, more focused installer experience.
- **Refined top spacing for main sections** — tuned the `.segments-row` top margin to 80px so the primary action blocks sit at a more balanced distance below the header panel.
- **Fixed header panel width** — the soft top panel now uses an explicit 607px width instead of 100%, so it no longer overflows the window when positioned as a fixed element.

## Bug Fixes

- **Prevented unintended window resizing** — the installer window can no longer be resized, which keeps the layout stable and prevents visual distortions on different screen sizes.
