# ✦ daydream ✦

*a private visual journal — artist of life*

A personal, cross-device visual journaling app. Part photo album, part collage scrapbook, part weekly check-in ritual. Built for Fern, by Fern (with help).

---

## what it is

A single-user, private journaling app with three kinds of entries living side by side:

- **photo posts** — a single image + caption, Instagram-for-one style
- **collages** — freeform scrapbook pages with draggable photos, stickers, handwritten text, and drawing
- **journal entries** — longform writing pages with inline photo insertion
- **weekly check-ins** — a structured 7-step self-reflection ritual (body, career, mind, creative life, overall vibe, artist of life, photos)

Everything shows up in a unified **feed** (square, vintage-Instagram style) and non-photo entries also appear in the **scrapbook** gallery.

---

## the aesthetic

Deep purple → hot pink → cyan gradient. Iridescent/holographic accents that shimmer. Floating sparkles. Scanline overlay. Three fonts doing different jobs:

- **Pacifico** (cursive) — big headers, entry titles
- **Caveat** (handwritten) — placeholders, journal text
- **VT323** (pixel mono) — timestamps, labels, retro tech feel
- **Space Grotesk** — body text

Inspired by: synthwave, anime lofi, kawaii, Stardew Valley, iridescent/opalescent things, private vintage Instagram circa 2012.

---

## current state

A working React prototype that runs as an artifact in Claude chat. Single file (`daydream.jsx`). Data persists in browser `localStorage`. Not yet a real app — no login, no cloud sync, no cross-device access. Everything lives in one browser tab.

### what works
- feed view with single-column square posts and filter chips (all / photos / collages / journals / check-ins)
- photo compose flow (upload from device, caption, mood emoji)
- scrapbook gallery view (2-column thumbnails of non-photo entries)
- three scrapbook templates: collage, journal, check-in
- collage editor: photos, stickers, freehand text, drawing (8 colors, sliding size), eraser, rotate/resize/delete selected items, page background picker
- journal editor: title + prose + inline images (from album or upload)
- check-in flow: 7 steps, progress dots, scale dots with neon glow, whimsy checklist, mood pills
- cover photo system per entry (auto-pick from entry images, or generated pink fallback with date)
- entry detail views for all 4 types
- PDF export for collages and journals (uses html2canvas + jsPDF loaded from CDN)
- localStorage persistence for entries

### what doesn't work yet
- nothing is actually private — anyone with the browser can see it
- no login or user accounts
- no cross-device sync (it's stuck in one browser)
- no real backups beyond localStorage (which can get cleared)
- no offline-first / PWA install
- check-in has no weekly streak tracking or history view (was in the original HTML, got dropped)
- pinch-to-resize on mobile for collage items
- no text editing for already-placed text items in collages (you can delete and re-add)
- export is visual only — no editable-text PDF

---

## structure

Everything lives in a single JSX file (`daydream.jsx`) organized into these major sections:

```
├── PHOTOS constant           — base64-encoded sample images (will be removed in real app)
├── Persistence helpers       — loadState / saveState via localStorage
├── Sample data               — 1 photo + 1 collage to start
├── Constants                 — stickers, pen colors, moods, whimsy items, page backgrounds
├── getCoverPhoto()           — cover photo resolution logic
├── App (main)                — state, routing between feed/scrapbook, compose modals
│
├── FeedView                  — timeline with filter chips
├── FeedPost                  — single square card (all entry types)
├── GeneratedCover            — pink "weekly check-in / journal / collage" fallback card
│
├── ScrapbookView             — 2-col gallery of non-photo entries
├── ScrapbookThumb            — thumbnail tile
├── ScrapbookComposeMenu      — "new page" picker (3 template options)
│
├── ComposePhotoModal         — simple photo upload + caption
├── CreateCollage             — name + open editor
├── CollageEditor             — the big canvas editor (drag, draw, sticker, text)
├── CollageItem               — individual draggable element on the canvas
├── CollageSettings           — gear-icon settings modal (title, cover, bg, delete)
│
├── JournalEditor             — writing page with inline images
│
├── CheckInFlow               — 7-step guided flow
├── StepBody / StepCareer / StepMind / StepCreative / StepVibe / StepArtistOfLife / StepPhotos
│
├── EntryViewer + PhotoView / CollageView / JournalView / CheckinView
│                             — detail/expanded view for each entry type
│
├── CoverPicker               — reusable cover photo picker
├── exportPageAsPDF()         — html2canvas + jsPDF at runtime
│
└── ToolBtn / BottomNav / NavBtn / NeonTextarea / NeonInput / NeonLabel
                             — shared UI building blocks
```

---

## data model

Everything is a flat list of `entries`. Each entry has a `type` and type-specific fields:

```js
// photo
{ id, type: "photo", date, time, image, caption, mood }

// collage
{ id, type: "collage", date, time, title, caption, coverPhoto, bg, dark,
  items: [{ id, type: "image"|"sticker"|"text", x, y, ...typeSpecific }],
  strokes: [{ id, color, size, points: [{x, y}, ...] }] }

// journal
{ id, type: "journal", date, time, title, body, images: [], mood, coverPhoto, caption }

// checkin
{ id, type: "checkin", date, time,
  bodyScore, bodyNotes, career, credentials, mindScore, mindNote,
  whimsy: [], creativeNotes, moods: [], vibeNotes, carry, release, freewrite,
  images: [], coverPhoto }
```

Coordinates (`x`, `y`, `w`) are percentages of the page dimensions, so items survive any page size.

Data is persisted under the `localStorage` key `daydream_v4`.

---

## roadmap to a real app

Rough order of things to do when moving from "artifact prototype" to "app that runs on my phone":

### phase 1 — get it running locally
1. set up a Next.js project on Mac (or in a browser IDE like StackBlitz / Replit if Mac OS is too old)
2. drop `daydream.jsx` in as the main page component
3. install dependencies: `react`, `lucide-react`, `tailwindcss`, `html2canvas`, `jspdf`
4. verify everything renders and data persists

### phase 2 — make it installable
5. add PWA manifest + service worker so it installs to home screen on iPhone/iPad/Android
6. add a proper app icon (iridescent ✦ in pink)
7. test the install flow on each device

### phase 3 — add real privacy + sync
8. add authentication (Supabase Auth, magic link email sign-in is simplest)
9. move entries from localStorage to a cloud database (Supabase postgres table)
10. move image uploads from base64 blobs to proper image storage (Supabase Storage)
11. add real-time sync so changes on one device show up on others

### phase 4 — nice-to-haves
12. offline-first with background sync when connection returns
13. check-in streak + weekly reminder notification
14. bulk photo upload to album
15. search / tags
16. export entire journal to PDF

---

## tech stack (current + planned)

- **React 18** (via artifact / Next.js)
- **Tailwind CSS** (utility classes)
- **lucide-react** for icons
- **html2canvas** + **jspdf** for PDF export (loaded from CDN at runtime)
- **localStorage** for data (for now)

### planned
- **Next.js** — app framework
- **Supabase** — auth, postgres, image storage
- **Vercel** — hosting

---

## known quirks & gotchas

- **localStorage has a ~5MB limit per origin.** Each photo is base64-encoded, which makes them ~30% bigger than binary. If you add ~50 photos, you'll hit the limit. Real app needs real image storage.
- **Collage drag is debounced to save performance.** There's a 300ms delay before changes flush to state, so if you drag then immediately close, the last ~300ms might not save. (Flush on close could be added.)
- **PDF export loads scripts from cdnjs.** Requires internet. First export is slow (~2s load), subsequent exports are instant.
- **Sample photos are embedded as base64 in the source.** They're ~210kb. In the real app, these would be separate files.
- **No undo.** Delete is permanent, with a confirm dialog for the top-level delete. Items on a collage page don't have undo.
- **Mobile Safari quirks:** the compose modals slide up from the bottom on mobile, center on desktop. Some touch events might feel slightly different than mouse.

---

## file locations

```
daydream.jsx                  — the app (single file)
README.md                     — this file
```

Eventually this becomes:

```
app/
  page.tsx                    — feed route
  scrapbook/page.tsx          — scrapbook route
  components/                 — split out components
    FeedPost.tsx
    CollageEditor.tsx
    CheckInFlow.tsx
    ...
  lib/
    supabase.ts
    cover-photo.ts
  globals.css
public/
  icons/
  manifest.json
```

---

## design decisions (so they aren't lost)

- **Feed is uniform squares regardless of entry type.** This keeps the rhythm consistent, vintage-Instagram-style. Type is communicated via a small glowing pill in the bottom-right corner.
- **Photo posts live only on the feed, not in the scrapbook.** Scrapbook is for "pages you make" — single photos are too atomic to be pages.
- **The + button is context-aware.** Feed's + adds a photo quickly. Scrapbook's + opens a template menu. Different mental models for "quick capture" vs "sit down and make a page."
- **Cover photos are per-entry, selectable.** Because auto-picking the first image isn't always what you want. The "auto" option generates a pink card with the entry type + date, which is its own cute vibe.
- **Check-in is 7 steps, not one long form.** One question at a time feels meditative rather than overwhelming. Progress dots tell you how close to the end you are.
- **Dark app, light scrapbook pages.** The app chrome is synthwave-dreamy, but scrapbook pages themselves are mostly light/cream so photos and handwritten text pop. (One dark page background option exists for moody pages.)
- **"Artist of Life" is the fixed tagline.** Not up for debate.

---

## credits

- design direction: iridescent pastel synthwave + anime lofi + kawaii maximalism
- inspiration photos: pink Christmas living room, anime lofi city, mermaid eye scales
- built collaboratively with Claude (Anthropic)
- coded as a working prototype in a Claude artifact, April 2026
