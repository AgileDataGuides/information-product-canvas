# Design System Toolbar -- SA Toolbar and CP Sub-Header Redesign

**Date:** 2026-03-30

## What's New

- **SA Toolbar rewritten to match the design system** -- The standalone toolbar has been rebuilt to follow the SA Standalone Toolbar pattern documented in DESIGN_SYSTEM.md, ensuring visual consistency across all standalone apps.

- **Custom switcher dropdown** -- The model switcher displays the current model name with a "Switch model" subtitle, providing clear context about which model is active and quick access to switch between models.

- **Inline New Canvas toggle** -- Creating a new canvas uses an inline toggle pattern with a text input field plus Create/Cancel buttons, replacing the previous modal-based flow for a faster workflow.

- **Save/Saved dirty state indicator** -- A visual indicator shows whether the current canvas has unsaved changes (Save) or is up to date (Saved), giving users confidence about their data persistence state.

- **Export/Import with auto-detect format** -- Import automatically detects whether the uploaded file is native IPC JSON or Context Plane { nodes, links } format and handles both correctly. Export supports both formats as well.
