# 🖥️ Joravar Singh - Cyberpunk System Handoff Documentation

Welcome, Operator. This document serves as the system map, specifications, and execution instructions for this terminal-style mechatronics portfolio interface. Read this before initiating any codebase writes.

---

## 📂 Codebase Map & Navigation

The codebase is organized as a lightweight static site utilizing JSON-driven content generation, compiled via a Node.js build pipeline.

```text
portfolio/
├── index.html               # Core DOM skeleton, metadata, schema markup, and HUD elements
├── data/
│   ├── projects.json        # Data array for all portfolio projects
│   └── certificates.json    # Data array for all certs and awards
├── assets/
│   ├── css/
│   │   └── style.css        # Core stylesheet (cyberpunk custom overrides are at the bottom)
│   ├── js/
│   │   └── script.js        # Interactive scripts, dynamic DOM injection, clocks, typewriter
│   ├── images/              # Media files, thumbnails, profile picture
│   └── vendor/              # Self-hosted Ionicons, Fancybox, and jQuery
├── tools/
│   └── build.mjs            # Production compiler (hashes assets, minifies files, writes to dist/)
├── package.json             # NPM build tasks and dependencies
└── dist/                    # Compiled and minified production build
```

---

## 🛠️ Build Pipeline & Production Workflows

Do NOT serve files directly from the root for production. Always compile and test the minified bundle:

```bash
# 1. Install dev dependencies
npm install

# 2. Build optimized static files to /dist (Minifies DOM, hashes and version-controls CSS/JS, minifies images)
npm run build

# 3. Quick build without image compression (Use this during iterative testing)
npm run build:quick
```

> [!IMPORTANT]
> Whenever you modify `index.html`, `style.css`, `script.js`, or the JSON files in `data/`, you **must** run `npm run build:quick` (or `npm run build`) to ensure the changes compile into the production-ready `dist/` directory.

---

## 🎨 Cyberpunk Design System & Styling Tokens

The system utilizes high-contrast neon accents, glassmorphic paneling, scanning laser overlays, and custom geometric clip-paths.

### CSS Custom Variables (`assets/css/style.css`)
- **Primary Accent (Neon Cyan/Blue)**: `var(--accent-primary) = #00f0ff` (used for standard status indications, hover states, and structural highlights)
- **Secondary Accent (Neon Yellow)**: `var(--accent-secondary) = #fcee09` (used for active navigational links, labels, and primary status alerts)
- **Green Accent (Status Green)**: `var(--accent-green) = #39ff14` (used for active blinking status indicators)
- **Background Palette**: Dark coal theme using HSL values (e.g., `hsla(240, 15%, 9%, 1)`)

### Micro-Animations & Atmospheric Filters
- **Scanline Background overlay**: A looping scanline sweep across the viewport overlaying a slow-moving grid background (`grid-move` animation).
- **Glitch aberration keyframes**: A chromatic aberration styling animation (`subtle-glitch`) that flashes occasionally after typewriter animation finishes.
- **Cyberpunk Badge Clip-Paths**:
  - Small Chamfer: `clip-path: var(--cyber-clip-sm)` (cuts bottom-left/top-right corners slightly for buttons/icons).
  - Medium Chamfer: `clip-path: var(--cyber-clip-md)`.

---

## ⚙️ Interactive UI Components & States

### 1. Unified Timezone Telemetry Clocks
Locked to the developer's timezone (**GST Dubai, Asia/Dubai - UTC+4**) using the browser's native `Intl.DateTimeFormat`:
- **Narrow Screens (< 768px)**: The clock displays inside `.sidebar` as a clean, bordered floating badge (`.top-telemetry-bar`) with a green blinking `.status-dot` next to the location tag `LOC::DUBAI_GST //`.
- **Middle/Desktop Screens (>= 768px)**: The top clock is hidden, and the timezone clock displays inside the bottom-left system status bar (`.system-status-bar`) formatted as `LOC::DUBAI_GST | [YYYY-MM-DD | HH:MM:SS]`.
- **Location Text**: The label `LOC::DUBAI_GST` is styled in yellow (`var(--accent-secondary)`) inside the status bar.

### 2. Sidebar Layout Modes
- **Narrow Screens (< 768px)**: Vertically centered header card with a "Show Contacts" toggle button.
- **Tablet/Medium Screens (768px - 1249px)**: Formatted as a clean, horizontal **"terminal header" layout** using CSS Flexbox.
  - Avatar on the far-left (`flex: 0 0 100px;` no shrink).
  - Profile info (Name + Title + Social Icons) stacked vertically and left-aligned next to the avatar inside `.info-content`.
  - The status bar sits absolutely positioned inside the right side of the sidebar card (`top: 68px; right: 30px`).
- **Desktop Screens (>= 1250px)**: Anchored as a vertical column on the left.
  - Sidebar top padding matches the main body (`padding-top: 75px`).
  - The status bar is centered horizontally inside the top padding space above the profile picture (`top: 15px; left: 50%` absolute).

### 3. Typewriter Headline effect
On page load, the developer's title (`AI × MECHATRONICS SYSTEMS BUILDER`) is typed out letter-by-letter, appending a blinking prompt cursor `_`. The typewriter engine skips HTML tags (`<` to `>`) instantly to prevent DOM rendering issues.

### 4. Navigation & Highlight states
- **Active Navigation links**: Active tabs in the navbar and portfolio filters display as bold yellow text framed by square brackets (e.g. `[ ABOUT ]` or `[ CODE ]`). Hover states highlight in neon blue/cyan.
- **About Page CTA Buttons**:
  - Inactive/Secondary buttons (Resume, GitHub, LinkedIn) fill to solid neon blue (`var(--accent-primary)`) on hover.
  - Primary button (Projects) fills to solid neon yellow (`var(--accent-secondary)`) on hover.

### 5. Resume Accordion Dropdowns
Timeline lists (Education, Experience) function as interactive toggles. Clicking on the header transitions the list height (`max-height: 0` to `1500px`) and reveals a status indicator (`[ + ]` when collapsed, `[ - ]` when expanded).

### 6. Project/Certificate Viewer dialog
Loads multi-asset projects dynamically without vertical cropping:
- Media cards have `flex: 0 0 auto !important` to override flexbox vertical shrinkage.
- Images scale to aspect ratio (`width: auto`, `max-width: 100%`) with max height bounded to `70vh` (and `65vh` for videos) to fit portrait screenshots beautifully.
- Active navigation tabs inside the viewer rail highlight in yellow, with inactive tabs highlighting in blue on hover.

---

## 🤖 Guide for Future AI Operators

When modifying this repository, follow these guidelines:
1. **Preserve Bracketing**: When active tabs change, retain the square bracketing system (`[ TABS ]`).
2. **Double check JSON Data**: Do not hardcode new projects or certificates in `index.html`. Add them to `data/projects.json` or `data/certificates.json`.
3. **Responsive Testing**: Verify that sidebar flex adjustments do not break the mobile vertical stack or desktop sticky column layouts.
4. **Build Command**: Always run `npm run build:quick` after CSS/JS changes and verify compilation logs.
