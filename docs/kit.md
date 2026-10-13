# Kit reference (`studio/src/kit/`)

Higher-level tools come first: **explanation patterns** (`docs/patterns.md`) and the **object library** (`docs/objlib.md`). The kit below is the lower level they are built on.

Reusable pieces. Use them before you draw new ones; add a piece here when a second video could use it.
See them all: composition `kit-gallery` (`node scripts/stills.mjs kit-gallery 2.5`, or `npx remotion studio`).

Conventions: the world is 1920×1080. SVG pieces are drawn around (0,0) — put them in place with `<At x y s>`.
Motion takes `t` (time now, seconds) and `at` (start time), so it can start on a word: `at={cue(4, 'molecules')}`.

## `lib.tsx` — basics

| Name | Use |
|---|---|
| `C`, `SLAB`, `SANS`, `FPS` | colours and fonts from `src/brand.ts` |
| `useFonts()` | call once in each top component (inlined fonts, no network) |
| `L(t,a,b,x,y)` | eased move from x to y between times a and b |
| `S(t,at)`, `SS(t,at)` | spring 0→1 ("pop"), without overshoot |
| `fadeIO(t,a,b)`, `wob(t,f,a)` | fade in/out, small wobble |
| `At`, `Scene` | place an SVG group; full-frame SVG |
| `Pill`, `Title`, `Bubble` | label, title text, speech bubble |
| `Arrow`, `Cross` | self-drawing arrow (`p` 0–1), red cross |
| `Mol`, `Enzyme`, `Spiky`, `Puff`, `Drop` | small "actors": particle with a face, Pac-Man worker, spiky thing, gas puff, drop |

## `science.tsx` — infographic pieces

| Piece | Use it for | Main props |
|---|---|---|
| `Portal` | zoom into a small world through a lens | `t, at, dur, x, y`, children = the inside |
| `ScaleBadge` | "× 1,000 — zoomed in" | `text, sub` |
| `Callout` | name a thing: dot + dashed leader + label | `text, dx, dy, color` |
| `FlowArrow` | A moves to B (curved, dots run along it) | `x1 y1 x2 y2, bend, color` |
| `StepFlow` | a process in steps | `steps[{icon,label}], times[], active` |
| `BigNumber` | a number that counts up (years: `grouping={false}`) | `to, from, unit, dur` |
| `Compare` | two panels side by side with ✓ / ✗ | `left/right {title,node,ok}` |
| `Bars` | up to 5 values | `items[{label,value,color}], unit` |
| `Particles` | molecules moving; `speed` = temperature | `n, w, h, color, speed, face` |
| `Molecule`, `WATER` | ball-and-stick molecules | `atoms[[x,y,r,color]], bonds` |
| `Wave` | sound, light, water waves | `wl, amp, speed, color` |
| `Heart`, `Lungs`, `Eye` | body topics | `bpm`, `rate`, `water` |
| `Sun`, `Planet`, `Orbit` | space | `r, color, ring`, `rx, ry, period` |
| `Cloud`, `Thermometer` | weather, heat | `rain`, `v` (0–1) |
| `MicroBG`, `SpaceBG`, `LabGrid` | backgrounds | `w, h` |

## Characters, sets, camera

| Name | File | Use |
|---|---|---|
| `Char` | `chars.tsx` | `<Char pose="host_point" x y talk flip k />` — real image if it exists, else a placeholder figure. (x, y) = feet. |
| `registerPoses` | `chars.tsx` | add poses with a height factor `k` (arms up > 1, sitting < 1) |
| `talkOf(lines, who, t)` | `chars.tsx` | small squash while a speaker talks |
| `SetBG`, `SETS` | `stage.tsx` | background image `brand/locations/<name>.png` or a flat set; store measured floor lines in `SETS` |
| `Cam` | `stage.tsx` | zoom `z` on (cx, cy); the view never leaves the world |
| `Panel` | `stage.tsx` | picture-in-picture with a label |
| `SvgLayer` | `stage.tsx` | full-frame SVG layer over HTML elements |

## Bookends and publishing

| Name | File | Use |
|---|---|---|
| `IntroSting` | `bookends.tsx` | 4 s channel intro (logo or word mark, tagline, series tag) |
| `Outro` | `bookends.tsx` | cast line-up, subscribe button, next-video card; `endscreen` keeps the right side free |
| `Logo` | `bookends.tsx` | logo image or word mark |
| `ThumbFrame` | `thumb.tsx` | 1280×720 thumbnail layout |
| `ShortCut`, `Caption` | `short.tsx` | 9:16 Short from segments of the episode, karaoke captions |
| `AnimaticOverlay` | `animatic.tsx` | shot id, timecode, current line (Gate 2) |
| `makeCue` | `cues.ts` | word anchors from `words.json` |
| `makeWarp` | `warp.ts` | re-time old footage to a new voice |
