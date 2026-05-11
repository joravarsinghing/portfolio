---
name: Project Multi-Media Gallery
overview: Add a custom 2D project viewer with explicit stable project IDs, robust modal lifecycle (focus, scroll lock, teardown), and horizontal project navigation + vertical per-project media scrolling while preserving the existing portfolio card layout and filtering.
todos:
  - id: extend-project-data
    content: Restructure project entries with stable id/slug, explicit cover fallback rules, and ordered media arrays with image/video metadata.
    status: completed
  - id: update-project-rendering
    content: Render project cards with ids and pass project index into a custom viewer launcher.
    status: completed
  - id: build-two-dimensional-viewer
    content: Build custom modal with horizontal project navigation, vertical media scrolling, swipe handling, and media teardown for project switches.
    status: completed
  - id: accessibility-and-lifecycle
    content: Implement focus trap/restore, body scroll lock, and close behavior parity (button, backdrop, Escape).
    status: completed
  - id: verify-no-regression
    content: Test category filters, portfolio behavior, and certificates gallery compatibility.
    status: completed
isProject: false
---

# Two-Dimensional Project Gallery Plan

## Goal
Keep the portfolio grid as single-cover cards, and after clicking a project open a custom modal where:
- Left/right swipe (or arrow) switches between projects.
- Up/down scroll navigates all media for the current project.
- Each project supports mixed media (images + videos).

## Current State
- Project cards are rendered from `[data/projects.json](C:/Users/jvsin/Documents/GitHub/portfolio/data/projects.json)` with one `href` and one `imageSrc` per project.
- Card markup in `[index.html](C:/Users/jvsin/Documents/GitHub/portfolio/index.html)` uses a simple anchor click target per project item.
- Rendering logic in `[assets/js/script.js](C:/Users/jvsin/Documents/GitHub/portfolio/assets/js/script.js)` currently maps one card to one media item; there is no two-axis viewer state.

## Planned Changes
- **Data model extension** in `[data/projects.json](C:/Users/jvsin/Documents/GitHub/portfolio/data/projects.json)`:
  - Add explicit stable `id` (or slug) per project; do not use array index as identifier.
  - Add a `media` array per project (ordered list).
  - Define cover precedence now: `cover` field takes priority; fallback to `media[0]`.
  - Each media item will include type (`image`/`video`), source path, thumbnail path (for video), and title/caption.
- **Project card rendering update** in `[assets/js/script.js](C:/Users/jvsin/Documents/GitHub/portfolio/assets/js/script.js)`:
  - Render cards with stable project ids/slugs and retain reference to clicked trigger element for focus restore.
  - Preserve current single-photo card appearance and filtering.
  - Replace direct gallery link behavior with modal-launch behavior.
- **Custom modal structure** in `[index.html](C:/Users/jvsin/Documents/GitHub/portfolio/index.html)`:
  - Add one reusable modal container for the 2D viewer.
  - Include horizontal project rail/controls and a vertical media scroll container.
  - Add close and keyboard-accessible controls.
- **2D viewer controller** in `[assets/js/script.js](C:/Users/jvsin/Documents/GitHub/portfolio/assets/js/script.js)`:
  - Manage active project index and modal lifecycle.
  - Use Pointer Events + touch delta thresholds for left/right swipe detection (no new dependency).
  - On left/right gesture or controls: switch project and render that project's media stack.
  - On project switch: run `teardownProject()` to pause/reset any active media from previous project, then reset vertical scroll to top.
  - Keep horizontal project rail in view by auto-scrolling active project indicator/card into view.
  - Render image/video blocks in a vertically scrollable list.
  - Use `preload="none"` for videos with poster thumbnails to reduce mobile jank.
- **Styling updates** in `[assets/css/style.css](C:/Users/jvsin/Documents/GitHub/portfolio/assets/css/style.css)`:
  - Add modal layout styles for horizontal project navigation and vertical media scrolling.
  - Add a simple directional transition spec for project switches (slide or fade-with-direction class).
  - Keep the existing project card grid and hover effects unchanged.
  - Ensure responsive behavior for mobile swipe and desktop controls.
- **Accessibility and modal lifecycle** in `[assets/js/script.js](C:/Users/jvsin/Documents/GitHub/portfolio/assets/js/script.js)` + `[assets/css/style.css](C:/Users/jvsin/Documents/GitHub/portfolio/assets/css/style.css)`:
  - On open: lock background scroll (`body` overflow lock), move focus into modal (close button first), and start focus trap.
  - While open: trap Tab/Shift+Tab within modal controls/media.
  - On close: unlock background scroll, remove listeners, and restore focus to the original triggering project card.
  - Support close via close button, backdrop click, and Escape key with equivalent behavior.
- **Fancybox usage decision**:
  - Keep current Fancybox initialization for certificates.
  - Do not rely on Fancybox for portfolio 2D navigation, since it cannot cleanly model separate vertical-media and horizontal-project axes together.

## Validation
- Confirm filters still work exactly as now (`all`, category filters).
- Verify active filter state is preserved after closing modal and returning to portfolio grid.
- Verify clicked project opens in modal with that project selected.
- Verify vertical scrolling works through all media items for current project.
- Verify horizontal swipe/controls switch projects and load their media stacks.
- Verify mixed image/video media render and video playback works in modal.
- Verify playing video is paused/stopped when switching projects and when closing modal.
- Verify active project in horizontal rail remains visible after project changes.
- Verify close interactions all work: close button, Escape key, and backdrop click.
- Verify focus behavior: focus enters modal on open, remains trapped, and returns to triggering project card on close.
- Confirm no regression to certificates gallery behavior.

## Notes
- This delivers your requested UX exactly: project cards remain single-cover, with two-direction navigation inside the opened viewer.
- If desired later, we can add lazy-loading and media counters for faster loading on large projects.