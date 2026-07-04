# CYBERPUNK / CYBERPUNK 2077 UI REDESIGN SPEC

> Purpose: AI agent reference for future UI redesigns.
> Style target: Cyberpunk 2077-inspired HUD, industrial interface, cybernetic telemetry, street-tech branding, and tactical UI graphics.
> Core rule: This aesthetic is sharp, angular, engineered, high-contrast, and information-dense. It is not soft, rounded, cozy, minimal, or playful.

---

## 1. DESIGN PHILOSOPHY

Cyberpunk UI should feel like it belongs to a hostile high-tech world.

The interface should look like it was built for:

- cybernetic diagnostics
- encrypted data terminals
- tactical overlays
- black-market software
- megacorporate dashboards
- neural interface systems
- surveillance tools
- industrial machinery
- street-tech devices
- augmented reality HUDs

The design language should communicate:

- danger
- speed
- precision
- surveillance
- restricted access
- machine readability
- corporate control
- hacker interference
- underground utility
- urban grit

A good cyberpunk UI does not simply add neon colors. It should feel like a system of warnings, labels, scanners, ports, codes, and modular panels.

---

## 2. ABSOLUTE GEOMETRY RULES

### 2.1 No Rounded Corners

Cyberpunk UI elements must not use soft rounded corners.

Avoid:

```css
border-radius: 8px;
border-radius: 12px;
border-radius: 999px;
````

Rounded corners make the design feel friendly, app-like, SaaS-like, or mobile-consumer. That is the wrong tone.

Cyberpunk geometry should be sharp, cut, clipped, technical, and manufactured.

---

### 2.2 Preferred Corner Logic

The default cyberpunk container is not a rounded card.

It is a hard rectangle with one or more angular cuts.

Preferred base shape:

* 3 sharp 90-degree corners
* 1 chamfered corner
* the chamfer is preferably bottom-right

Example silhouette:

```text
┌───────────────┐
│               │
│               │
│            ╱──┘
└───────────╱
```

Recommended CSS approach:

```css
.cyber-card {
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - 18px),
    calc(100% - 18px) 100%,
    0 100%
  );
}
```

This creates a simple rectangle with a bottom-right chamfer.

---

### 2.3 Chamfers, Indents, and 45-Degree Cuts

Use hard angular modifications instead of curves.

Allowed geometry:

* 45-degree chamfers
* diagonal cuts
* clipped corners
* inset notches
* stepped edges
* angular brackets
* hard slashes
* chevrons
* trapezoid tabs
* octagonal frames
* rectangular frames with one cut corner

Preferred angles:

* 45 degrees
* 90 degrees
* occasional 30 or 60 degree mechanical cuts

Avoid:

* circles as primary containers
* pills
* bubbly cards
* soft blobs
* organic waves
* decorative curves

---

## 3. CYBERPUNK CONTAINER SYSTEM

### 3.1 Standard Panel

A standard panel should feel like a machine-readable module.

Use:

* black or near-black background
* thin technical border
* one chamfered corner
* small metadata label
* tiny serial number or system code
* one accent line
* optional corner bracket

Example:

```css
.panel {
  position: relative;
  background: #070b12;
  border: 1px solid rgba(0, 240, 255, 0.24);
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - 16px),
    calc(100% - 16px) 100%,
    0 100%
  );
}
```

---

### 3.2 Open-Frame Panels

Cyberpunk UI often uses frames instead of full boxes.

Use open frames when the content should feel scanned, targeted, or locked.

Recommended elements:

* corner brackets
* partial borders
* top-left technical label
* bottom-right serial marker
* tiny crosshair
* microtext on edges

Avoid heavy full borders on every element. Too many solid boxes make the interface look ordinary.

---

### 3.3 Bracket Corners

Use bracket-like framing around important content.

Example visual:

```text
┌─ DATA NODE 03
│
│   content
│
          SYS_45X
        ───────┘
```

Possible CSS elements:

```css
.panel::before {
  content: "SYS_NODE // 07";
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: monospace;
  color: rgba(0, 240, 255, 0.7);
}

.panel::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  width: 36px;
  height: 1px;
  background: currentColor;
}
```

---

## 4. COLOR SYSTEM

### 4.1 Core Cyberpunk Palette

The base should usually be dark.

Recommended base colors:

```css
--bg-black: #030406;
--bg-obsidian: #070b12;
--bg-blue-black: #0d1420;
--panel-dark: #101722;
```

Recommended accent colors:

```css
--cyber-yellow: #fcee09;
--toxic-green: #00ff9f;
--terminal-cyan: #00f0ff;
--hot-magenta: #ff2a6d;
--danger-red: #ff003c;
--dirty-white: #e6f1ff;
```

Cyberpunk 2077-style UI strongly favors:

* yellow on black
* cyan on dark blue-black
* acid green on black
* white technical graphics on black
* occasional red warning states

---

### 4.2 Color Usage Rules

Use color as signal, not decoration.

Yellow means:

* warning
* action
* highlighted control
* active state
* selected system

Cyan means:

* data
* interface
* scan
* system feedback
* holographic overlay

Green means:

* terminal
* hacker layer
* access granted
* toxic industrial tech
* machine status

Red means:

* danger
* error
* hostile state
* denied access
* corrupted system

White means:

* label
* technical print
* brand mark
* monochrome decal
* utilitarian information

---

### 4.3 Avoid These Palettes

Avoid:

* soft pastel gradients
* beige / cream / cozy colors
* glassmorphism with soft purple glow
* Apple-style clean gray UI
* low-contrast luxury minimalism
* rounded white SaaS dashboard cards

Cyberpunk UI can be premium, but it should not feel calm.

---

## 5. TYPOGRAPHY

### 5.1 Typography Mood

Cyberpunk typography should feel technical, compressed, industrial, and system-generated.

Preferred type styles:

* uppercase sans-serif
* condensed sans-serif
* squared geometric fonts
* monospace technical labels
* OCR-style numerals
* stencil-like headings
* broken or segmented display type

Use uppercase generously.

Example:

```css
.cyber-label {
  font-family: monospace;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
```

---

### 5.2 Heading Treatment

Headings should feel like system modules or branded machine labels.

Use:

* uppercase
* tight vertical rhythm
* high contrast
* accent bars
* small prefix labels
* ID numbers
* short technical descriptors

Example:

```text
[ SYS_09 ] PROJECT ARCHIVE
MODEL VER. 35-0001A
```

---

### 5.3 Microtext

Microtext is essential.

Use small text fragments around the interface:

```text
SYS.ID :: B2.09 85
MODEL VER. 35-0001A
AUTH // GRANTED
DATA_REC
VP:3742-011C
NODE_09
STAND CLEAR
JACK IN
INITIALIZING
ACCESS PORT
SECTOR 07
```

Microtext should usually be decorative and atmospheric. It must not replace important readable UI text.

Rules:

* keep microtext tiny
* use uppercase
* use monospace
* increase letter spacing
* place on panel edges
* do not let it affect layout flow

Microtext should be positioned absolutely when decorative.

---

## 6. LAYOUT LANGUAGE

### 6.1 Dense but Controlled

Cyberpunk layouts can be visually dense, but they must remain structured.

Use:

* grid alignment
* modular sections
* repeated panel logic
* technical labels
* edge decorations
* strong hierarchy

Avoid:

* random clutter
* decorations that reduce readability
* excessive glowing effects
* decorative elements inside body text flow

---

### 6.2 Information Architecture

Every UI region should look like a system component.

Examples:

* navigation = command strip
* cards = data modules
* buttons = access triggers
* modals = secure terminal windows
* forms = input consoles
* tags = classification chips
* timelines = telemetry tracks
* stats = diagnostic readouts
* image previews = secured media nodes

---

## 7. BUTTONS AND INTERACTIVE ELEMENTS

### 7.1 Button Shape

Buttons should use angular, mechanical shapes.

Preferred:

```css
.cyber-button {
  background: #fcee09;
  color: #030406;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    0 100%
  );
}
```

Avoid:

```css
border-radius: 999px;
```

Buttons should never look like soft pills unless intentionally breaking the cyberpunk style.

---

### 7.2 Button States

Hover states should feel like a machine response.

Use:

* quick snap transitions
* slight position shift
* border flash
* scanline sweep
* bracket activation
* color inversion
* glow only when subtle

Example:

```css
.cyber-button {
  transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

.cyber-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 18px rgba(252, 238, 9, 0.35);
}
```

---

## 8. NAVIGATION

Navigation should feel like a command interface.

Use:

* uppercase labels
* bracketed active states
* small system codes
* separators
* thin lines
* hard geometric indicators

Example active state:

```text
[ ACTIVE ] PROJECTS
```

or:

```text
> PROJECTS //
```

Navigation should not feel like a standard soft website navbar.

Avoid:

* rounded nav pills
* soft hover bubbles
* slow luxury fades
* overly spacious minimalist tabs

---

## 9. CARDS AND GRIDS

Cards should be redesigned as data panels.

Each card may include:

* chamfered corner
* thin technical border
* small top label
* serial number
* accent stripe
* corner bracket
* hover scan effect
* angular image mask

Example card content structure:

```text
┌─ PROJECT NODE
│
│  PROJECT TITLE
│  Short description
│
│  TAG_01 / TAG_02 / TAG_03
│
└────── SYS.ID 09
```

Card hover should not change layout size.

Allowed hover effects:

* brighten border
* activate corner brackets
* add subtle glow
* reveal scanline
* slightly increase contrast
* shift 1px or 2px

Avoid:

* scaling cards too much
* layout reflow
* bouncy animation
* rounded elevation shadows

---

## 10. MODALS AND OVERLAYS

A cyberpunk modal should feel like a secure file viewer or terminal window.

Use:

* dark translucent backdrop
* blur if appropriate
* hard-edged modal frame
* chamfered bottom-right corner
* technical header
* close button as system control
* media framed inside target brackets

Example:

```text
SECURE NODE VIEWER
FILE_ID :: PX-2099-A
STATUS :: DECRYPTED
```

Recommended modal background:

```css
.modal-backdrop {
  background: rgba(3, 4, 6, 0.78);
  backdrop-filter: blur(12px);
}
```

---

## 11. DIVIDERS AND SEPARATORS

Do not use plain default horizontal rules unless they are styled.

Preferred dividers:

```text
//////////
--- --- ---
▸ ▸ ▸ ▸
[ DATA BREAK ]
━━━━━━━━
```

CSS example:

```css
.cyber-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 240, 255, 0.7),
    transparent
  );
}
```

Hazard stripe version:

```css
.hazard-strip {
  height: 8px;
  background: repeating-linear-gradient(
    135deg,
    currentColor 0 6px,
    transparent 6px 12px
  );
}
```

---

## 12. ICONOGRAPHY

Icons should be simple, bold, geometric, and stencil-like.

Use:

* arrows
* brackets
* chevrons
* warning triangles
* plus signs
* crosshairs
* barcode blocks
* globe grids
* hex symbols
* circuit marks
* file icons
* lock icons
* scan reticles

Avoid:

* cute illustrated icons
* hand-drawn icons
* soft 3D icons
* emoji-like icons
* rounded bubbly icon sets

---

## 13. DECORATIVE CYBERPUNK ELEMENTS

Use decorative elements as technical artifacts.

Allowed:

```text
+ + +
/// /// ///
[ ]
< >
▸
◢
◣
SYS_09
VP:3742-011C
NO. 990-22
MODEL VER. 35-0001A
```

Decorative elements should feel functional, even if fictional.

They can imply:

* system status
* manufacturer label
* access code
* calibration marker
* scan region
* hazard warning
* serial classification
* firmware version

---

## 14. BACKGROUNDS

Cyberpunk backgrounds should support the UI without overpowering it.

Good background treatments:

* deep black
* obsidian blue-black
* subtle grid
* faint scanlines
* circuit traces
* low-opacity noise
* angular overlays
* soft but controlled glow
* large shadowed geometric blocks

Avoid:

* bright full-page gradients
* soft cloudy blobs
* decorative waves
* cozy textures
* paper grain unless used as damaged poster texture

---

## 15. TEXTURE AND EFFECTS

Cyberpunk can be clean, but it should not feel sterile.

Use subtle:

* scanlines
* glitch offsets
* worn decal texture
* pixel noise
* screen bloom
* chromatic offset
* flicker
* overprint marks
* distressed labels

Use effects sparingly. The interface must remain readable.

Avoid making everything glitch. Glitch is an accent, not the whole design.

---

## 16. CYBERPUNK 2077-SPECIFIC DESIGN NOTES

Cyberpunk 2077 is not only blue neon and rainy alleys.

It includes:

* yellow-black warning UI
* brutal corporate branding
* tactical industrial panels
* streetwear graphics
* weapon labels
* cyberware diagnostics
* desert-industrial grit
* megacity advertising
* gang decals
* AR overlays
* high-tech consumer trash

The style is loud, branded, dangerous, and commercial.

Think:

```text
military hardware + hacker terminal + streetwear sticker + corporate warning label
```

---

## 17. AI REDESIGN INSTRUCTIONS

When redesigning an existing UI into this aesthetic, preserve the product’s structure and usability first.

Do not destroy layout hierarchy.

Apply cyberpunk transformation in this order:

1. Preserve current content and layout.
2. Replace rounded containers with sharp or chamfered panels.
3. Add dark cyberpunk surface colors.
4. Introduce yellow, cyan, green, or red accents as signal colors.
5. Convert soft cards into technical data modules.
6. Add angular borders, brackets, and clipped corners.
7. Add microtext and system labels around perimeters.
8. Add hazard dividers, chevrons, and scan markers.
9. Add subtle glow, glitch, or scanline effects.
10. Ensure readability and spacing remain strong.

---

## 18. AI PROMPT BLOCK

Use this prompt when asking an AI agent to redesign a UI:

```text
Redesign this UI in a Cyberpunk 2077-inspired technical HUD aesthetic. Preserve the existing layout, hierarchy, content, and usability. Replace soft rounded cards with sharp angular panels. Do not use rounded corners. Use hard 90-degree corners, 45-degree chamfers, clipped corners, indents, angular brackets, and mechanical frame geometry. A standard rectangle should have 3 sharp corners and 1 chamfered corner, preferably bottom-right.

Use a dark obsidian / blue-black base with high-contrast cyberpunk accents such as yellow, cyan, toxic green, red, or white. Treat cards as diagnostic data modules, not soft SaaS cards. Add thin technical borders, open-frame brackets, system labels, small serial numbers, hazard stripe dividers, chevrons, scan markers, crosshairs, and micro-telemetry text.

Typography should be uppercase, condensed, technical, and machine-like. Use monospace microtext for labels such as SYS.ID, MODEL VER, DATA_REC, JACK IN, INITIALIZING, ACCESS PORT, NODE, SECTOR, AUTH, and VP codes. Decorative labels must be positioned around container edges and must not disrupt document flow or reduce readability.

The final UI should feel like a tactical cybernetic interface, megacorporate control panel, black-market terminal, augmented-reality HUD, or industrial machine dashboard. It should be sharp, hostile, dense, high-tech, branded, and dystopian. Avoid soft minimalism, rounded pills, playful icons, pastel colors, glassy luxury SaaS styling, organic shapes, and cozy spacing.
```

---

## 19. NEGATIVE PROMPT BLOCK

Use this to prevent the wrong aesthetic:

```text
Do not use rounded corners, pill buttons, soft cards, bubbly shapes, playful icons, pastel colors, organic waves, cozy whitespace, friendly SaaS styling, Apple-like minimalism, smooth luxury gradients, cute illustrations, hand-drawn elements, soft shadows, beige backgrounds, calm wellness design, fantasy motifs, or decorative curves. Avoid making the UI look like a generic neon gaming overlay. The design must be angular, technical, industrial, sharp, modular, and cyberpunk.
```

---

## 20. QUICK STYLE CHECKLIST

Before finalizing a cyberpunk redesign, check:

* Are the corners sharp or chamfered?
* Are rounded corners removed?
* Does at least one key container use a bottom-right chamfer?
* Are panels modular and technical?
* Is the color palette dark with high-contrast signal accents?
* Are labels uppercase and system-like?
* Are microtext elements decorative but non-disruptive?
* Are borders thin, angular, or bracket-like?
* Are buttons mechanical rather than soft?
* Are dividers styled as hazard, scan, or telemetry elements?
* Does the UI feel dangerous, high-tech, and dystopian?
* Is readability still preserved?

---

## 21. ONE-SENTENCE SUMMARY

Cyberpunk UI is a sharp, angular, high-contrast technical interface system made of dark panels, chamfered corners, warning-label graphics, machine typography, telemetry marks, and dystopian street-tech branding.
