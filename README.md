# Joravar Singh Portfolio

Static personal portfolio website built with HTML, CSS, and vanilla JavaScript.

## Overview

This repository contains a single-page portfolio site with:
- Sidebar profile and contact details
- About and Resume sections
- Filterable Portfolio gallery (Code, Hardware, Research, 3D Design)
- Certificates gallery
- Testimonials with modal popup

The project is intentionally lightweight and suitable for static hosting.

## Tech Stack

- HTML5 (`index.html`)
- CSS3 (`assets/css/style.css`)
- Vanilla JavaScript (`assets/js/script.js`)
- External libraries:
  - Fancybox 3.5.7 (self-hosted in `assets/vendor/fancybox/`)
  - Ionicons 5.5.2 (self-hosted in `assets/vendor/ionicons/`)
  - jQuery 3.6.0 (self-hosted in `assets/vendor/jquery/`)
  - [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)

## Local Preview

No build step is required for local editing and preview.

### Option 1: Open directly
Double-click `index.html` to open it in your browser.

### Option 2: Run a local static server (recommended)
Using Python:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

Using Node:

```bash
npx serve .
```

Then open the URL printed in the terminal.

## Optimization Build Pipeline

The repository now includes a lightweight optimization pipeline for production output.

Install dependencies:

```bash
npm install
```

Build optimized static files:

```bash
npm run build
```

Quick build without image optimization:

```bash
npm run build:quick
```

Build output is generated in `dist/` with:
- Minified CSS and JS
- Content-hashed CSS/JS filenames for cache-friendly versioning
- Minified `index.html` with rewritten asset references
- Compressed images and generated `.webp` versions (full build)

## Project Structure

```text
portfolio/
|- index.html
|- index.txt
|- lightbox.css
|- implementation_plan.md
|- assets/
|  |- css/
|  |  |- style.css
|  |- js/
|  |  |- script.js
|  |- vendor/
|     |- fancybox/
|     |- ionicons/
|     |- jquery/
|  |- images/
|     |- ... (profile, icons, project media, certificates)
|- tools/
|  |- build.mjs
|- package.json
|- .github/
|  |- FUNDING.yml
```

## Content Editing Guide

Most content is currently hardcoded in `index.html`.

### Update basic profile/about info
Edit:
- Sidebar identity and contact block in `index.html`
- About text and services/testimonials sections in `index.html`

Tips:
- Keep image paths relative (for example, `./assets/images/...`).
- Preserve existing `class` and `data-*` attributes used by JavaScript.

### Add or edit projects
Projects are in the `Portfolio` article under:
- `<article class="portfolio" data-page="portfolio">`
- `<ul class="project-list">`

Each project card uses this structure:
- `li.project-item` with `data-filter-item`
- `data-category` must match filter values used by JS (`code`, `hardware`, `research`, `3d design`)
- `a` tag points to image/video media opened by Fancybox
- `h3.project-title` and `p.project-category` for card text

Checklist when adding a project:
- Add media file under `assets/images/Projects/` (or update path accordingly).
- Use a valid category so filtering works.
- Keep `data-fancybox="gallery"` if you want it in the gallery lightbox group.
- Verify thumbnail path in `<img src="...">` and lightbox path in `<a href="...">`.

### Add or edit certificates
Certificates are in:
- `<article class="certificates" data-page="certificates">`
- `<ul class="certificates-posts-list">`

Each certificate card includes:
- `li.certificates-post-item`
- `a href="...certificate image..."` with `data-fancybox="gallery"`
- Certificate category label (`Certificate`/`Award`)
- Date in `<time datetime="YYYY-MM-DD">Visible Date</time>`
- Title and description text

Checklist when adding a certificate:
- Place image in `assets/images/certificates/`.
- Update both `href` and inner `<img src>` paths.
- Keep the card class names unchanged to preserve styling.

### Add or edit testimonials
Testimonials are in the About page section:
- `<section class="testimonials">`
- `<ul class="testimonials-list">`

Each testimonial item should keep:
- `data-testimonials-item` on the clickable card
- `data-testimonials-avatar` on avatar image
- `data-testimonials-title` on name/title element
- `data-testimonials-text` on the testimonial text block

These attributes are required by `assets/js/script.js` to populate the modal.

Checklist when adding a testimonial:
- Add the person image to `assets/images/`.
- Ensure all required `data-testimonials-*` attributes exist.
- Click the card locally and confirm the modal shows correct avatar, name, and text.

## Behavior Controlled by JavaScript

`assets/js/script.js` handles:
- Sidebar show/hide on mobile
- Testimonials modal open/close
- Portfolio category filtering
- Navbar page switching

When editing HTML, preserve matching selectors and `data-*` attributes used by JS.

## Deployment Notes

This site can be deployed to any static host.

### GitHub Pages
1. Push repository to GitHub.
2. In repository settings, open **Pages**.
3. Set source to your default branch (root folder).
4. Save and wait for Pages build.

### Netlify
1. Import the GitHub repository into Netlify.
2. Build command: leave empty.
3. Publish directory: `/` (repo root).
4. Deploy.

### Vercel
1. Import repository.
2. Framework preset: `Other`.
3. Build command: none.
4. Output directory: default/root.
5. Deploy.

## Troubleshooting

### Missing images or media
- Verify file exists in `assets/images/...`.
- Check path case sensitivity (important on Linux-based hosts).
- Confirm there are no spaces/typos in filenames, or URL-encode spaces if needed.

### Broken navigation or filtering
- Ensure `data-page` values match navbar text in lowercase.
- Ensure project `data-category` values exactly match filter values.
- Keep `data-filter-item`, `data-filter-btn`, `data-select-item`, and related classes.

### Broken links
- Recheck external URLs (`https://...`) and internal relative paths (`./assets/...`).
- For social links, verify target profile URLs are still valid.

### Fancybox or icon failures
- Verify local vendor files exist in `assets/vendor/...`.
- Ensure static host serves `.js` and `.css` files from that directory.
- If scripts fail to load, the gallery falls back to normal link behavior.

### Console errors
- Open browser devtools console and refresh.
- Typical causes are missing selectors/attributes after HTML edits, or invalid media paths.

## Maintenance Notes

- Keep markup consistent with existing card patterns.
- Prefer small, incremental edits and test in browser after each section update.
- If adding many new cards, keep formatting tidy for readability and easier diffs.
