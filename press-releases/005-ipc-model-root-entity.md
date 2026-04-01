# IPC Model Root Entity -- Root Entity and Canvas Sub-Header

**Date:** 2026-03-31

## What's New

- **Added ipc_model root entity type** -- The IPC model is now represented as a first-class entity in the Context Plane with the ipc_model type and has_info_product relationships linking it to its Information Products. This provides a clear ownership hierarchy in the graph.

- **Canvas Sub-Header bar in Context Plane** -- A dedicated sub-header bar appears below the main CP header when viewing an IPC canvas. It contains the model switcher, New Canvas button (blue accent), Delete, Export PPTX, Export JSON, and Import JSON actions.

- **Editable model name and description** -- The model name and description are displayed below the sub-header and can be edited inline by double-clicking. Changes are persisted immediately to the data store.

- **showCanvasSelector prop controls visibility** -- The IPCLayout component accepts a showCanvasSelector prop that determines whether the canvas selector dropdown is visible. Standalone mode sets this to false (using its own toolbar), while Context Plane mode sets it to true.

- **Export/Import moved to IPCLayout sub-header** -- Export and Import actions have been relocated from the Context Plane's GraphToolbar into the IPC-specific sub-header, keeping canvas-specific actions grouped with their canvas rather than in the generic toolbar.
