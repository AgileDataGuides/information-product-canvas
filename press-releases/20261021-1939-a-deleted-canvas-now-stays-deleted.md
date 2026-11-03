# A Deleted Canvas Now Stays Deleted in the Information Product Canvas App

**21 October 2026**

AgileDataGuides today released a fix to the Information Product Canvas app, so deleting a canvas that has unsaved changes removes it for good.

## The Problem

When a user changed a canvas and then deleted it before the next save, the canvas came back. The app deleted the file, then moved to the next canvas in the list. Moving on saves any unsaved changes first, and the changes still belonged to the canvas just deleted. So the app wrote it straight back to disk, and it reappeared in the switcher on the next reload.

## The Solution

Deleting a canvas now drops its unsaved changes before the delete is sent, so moving to the next canvas has nothing left to save. Unsaved changes to a different canvas are not affected.

## Key Benefits

- **Delete means delete**: a deleted canvas does not come back on reload
- **No clean-up loop**: no need to delete the same canvas twice
- **Same in six apps**: Metric Trees, Access, Business Glossary, Data Dictionary, Data Contract and the Information Product Canvas got the same fix

The fix is available now in the Information Product Canvas app in the Context Plane monorepo, and it reaches the public app at [github.com/AgileDataGuides/information-product-canvas](https://github.com/AgileDataGuides/information-product-canvas) on its next publish.
