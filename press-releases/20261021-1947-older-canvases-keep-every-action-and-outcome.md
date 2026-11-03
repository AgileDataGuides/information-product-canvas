# Older Information Product Canvases Now Keep Every Action and Outcome

**21 October 2026**

AgileDataGuides today released a fix to the Information Product Canvas, so a canvas saved before Actions and Outcomes became their own section keeps every outcome when it opens.

## The Problem

Early versions of the Information Product Canvas stored one action or outcome on each Business Question. Later versions gave Actions and Outcomes their own section, with any number of cards. When the app opened an older canvas, it moved the first Business Question's outcome into the new section and stopped. The outcomes on every other Business Question stayed hidden on the old field. The canvas no longer showed them, so a data product manager could not see or edit them, and only the PowerPoint export still found them.

## The Solution

Opening an older canvas for the first time now moves every distinct outcome into the Actions and Outcomes section. Two questions with the same outcome, in any letter case, give one card. The old field is then cleared, so the outcomes live in one place. The change reaches the saved file on the next save. A canvas whose Actions and Outcomes section already has cards is left as it is. An earlier version may have moved one outcome there, and its user may since have renamed or deleted that card, so bringing it back would undo their edit.

## Key Benefits

- **Every outcome shows**: an older canvas opened for the first time keeps every outcome
- **No duplicates**: an outcome shared by several questions becomes one card
- **One place to edit**: outcomes live only in the Actions and Outcomes section

The fix is available now in the Information Product Canvas app in the Context Plane monorepo, and it reaches the public app at [github.com/AgileDataGuides/information-product-canvas](https://github.com/AgileDataGuides/information-product-canvas) on its next publish.
