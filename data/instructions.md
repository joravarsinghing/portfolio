# How to add a new Project or Certificate/Award

This site loads **projects** and **certificates** dynamically from JSON files in `data/`. To add new items, you:
1) add the image/video file(s) in the right folder under `assets/`,
2) add a new JSON object to the right file,
3) rebuild so `dist/` is updated.

---

## Add a Project (`data/projects.json`)

### 1) Add your media files
- Put **project images/videos** in: `assets/images/Projects/`
- Prefer filenames **without spaces** (e.g. `MyProject-1.png`).
  - If you keep spaces, your paths may need URL-encoding (example in the repo: `%20` for spaces).

### 2) Create a new project entry
Add a new object to the JSON array in `data/projects.json`.

Notes:
- **Order matters**: the site shows projects in the same order as the array.
  - Put it at the **top** for newest/highlighted
  - Put it in the **middle** if it's an older project you're adding later
  - Put it at the **bottom** for oldest-first lists

Required / commonly used fields:
- `id`: unique, kebab-case (e.g. `my-new-project`)
- `category`: used for filtering (examples used in this repo: `code`, `hardware`, `research`, `3d design`)
- `title`: card title
- `displayCategory`: shown on the card (often a nicer label like `Code`, `Hardware`, `Research`, `3D Design`)
- `dataTitle`: used by the viewer/modal (often same as `title`)
- `cover`: thumbnail image path (usually the main image)
- `imageAlt`: alt text for accessibility
- `media`: list of images/videos shown in the viewer

Copy/paste template:
```json
{
  "id": "my-new-project",
  "category": "code",
  "title": "My New Project",
  "displayCategory": "Code",
  "dataTitle": "My New Project",
  "cover": "./assets/images/Projects/MyNewProject.png",
  "imageAlt": "Short description of the project image",
  "media": [
    {
      "type": "image",
      "src": "./assets/images/Projects/MyNewProject.png",
      "title": "My New Project"
    },
    {
      "type": "image",
      "src": "./assets/images/Projects/MyNewProject-2.png",
      "title": "My New Project (Screen 2)"
    },
    {
      "type": "video",
      "src": "./assets/images/Projects/MyNewProjectDemo.websafe.mp4",
      "poster": "./assets/images/Projects/MyNewProject.png",
      "title": "My New Project (Demo Video)"
    }
  ]
}
```

---

## Add a Certificate or Award (`data/certificates.json`)

### 1) Add your certificate image
- Put certificate images in: `assets/images/certificates/`

### 2) Create a new certificate/award entry
Add a new object to the JSON array in `data/certificates.json`.

Notes:
- **Order matters**: the site shows certificates in the same order as the array.
  - Put it at the **top** for newest/highlighted
  - Put it in the **middle** if it's older
  - Put it at the **bottom** for oldest-first lists

Fields used by the site:
- `href`: usually the same image path (used for opening/viewing)
- `imageSrc`: same image path
- `imageAlt`: alt text
- `category`: `Certificate` or `Award`
- `date`: a readable date string (match existing style, e.g. `Oct 21, 2025`)
- `title`: certificate name
- `description`: short summary
- `dataTitle`: keep consistent with existing entries (often `Portfolio website` in this repo)

Copy/paste template:
```json
{
  "href": "./assets/images/certificates/MyCertificate.jpg",
  "dataTitle": "Portfolio website",
  "imageSrc": "./assets/images/certificates/MyCertificate.jpg",
  "imageAlt": "My certificate",
  "category": "Certificate",
  "date": "Jan 1, 2026",
  "title": "My Certificate Title",
  "description": "One sentence describing what this certificate/award is for."
}
```

---

## Rebuild + Verify
After changing `data/projects.json` and/or `data/certificates.json`:
1) Run: `npm run build`
2) Confirm the build output updated:
   - `dist/data/projects.json`
   - `dist/data/certificates.json`
3) Open `dist/index.html` and verify:
   - Your new project/certificate appears
   - Clicking it opens the viewer
   - No broken images (check browser devtools Network tab for 404s)
