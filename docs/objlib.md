# Object library (`studio/src/objlib/`)

50 animated objects and ~5,000 pictograms, in one visual style, for explainer videos. Every object is **structure + roles**, not a picture: two renderers draw the same data.

| Renderer | Look | Switch |
|---|---|---|
| `flat` | filled shapes, one ink outline width, picture-book colours | `BRAND.render = 'flat'` (default) |
| `whiteboard` | drawn live with dry-erase markers, stroke by stroke; fills become hatching | `BRAND.render = 'whiteboard'`, or `look="whiteboard"` on one object |

Catalogue pictures: `docs/library/` (rendered on your computer with `bash studio/scripts/render-library.sh`). Live: `npx remotion studio` → `objlib-flat-1` … `objlib-states`, `objlib-pictograms`.

## Use it

```tsx
import {Thing, Pictogram} from '../../objlib/Thing';
// inside an <svg>:
<Thing id="heart" t={t} x={960} y={540} size={400} />                       // idle motion included (it beats)
<Thing id="bulb" t={t} x={500} y={500} size={300} state="on" since={t - cue(4, 'idea')} />   // state change with its own motion
<Thing id="earth" t={t} x={960} y={540} size={500} look="whiteboard" start={cue(2, 'planet')} />  // draws itself from that word
<Pictogram name="building-factory-2" t={t} x={300} y={300} size={120} role="accent" />          // any Tabler icon (tabler.io/icons)
```

- `size` = the object's box on screen in px. Line width stays the same at every size (that is what keeps the style consistent).
- `state` + `since` (seconds since the state began) give the state's own motion (a pop, a shake, a fill rising).
- Find objects by word: `findObj('energy')` (`src/objlib/index.ts`) searches ids, names and tags.
- Most of the time you do not place objects by hand: the explanation patterns do it (`docs/patterns.md`).

## Catalogue

| Category | id | Name | Made from | States (first = default) | Notes |
|---|---|---|---|---|---|
| body | `bone` | Bone | scratch | — | One union region (four circles + a bar) drawn as a single shape. |
| body | `brain` | Brain | scratch | idle, active | States idle/active (thinking sparks flash). |
| body | `eye` | Eye | scratch | idle, dilate | Looks around and blinks. State dilate (pupil opens: dark / surprise). |
| body | `heart` | Heart | scratch | calm, fast | Beats (lub-dub). States calm (70 bpm) / fast (140 bpm). |
| body | `lungs` | Lungs | scratch | calm, fast | Breathe in and out. States calm/fast. |
| body | `tooth` | Tooth | scratch | idle, cavity, clean | States idle/cavity/clean (sparkles). |
| earth | `cloud` | Cloud | scratch | idle, rain, storm | States idle/rain/storm (grey cloud, rain, lightning flashes). The cloud is one union region. |
| earth | `drop` | Water drop | scratch | — | Bounces with a small squash. |
| earth | `earth` | Earth | scratch | spin, inside | Turns. State inside: a quarter opens and shows crust, mantle, outer and inner core. |
| earth | `snowflake` | Snowflake | scratch | — | Turns slowly. |
| earth | `volcano` | Volcano | scratch | idle, erupt | Smoke rises. State erupt: lava flows and blobs fly, the mountain shakes. |
| energy | `battery` | Battery | upgraded (tabler) | full, half, low, charging | States full/half/low/charging. |
| energy | `bulb` | Light bulb | upgraded (phosphor) | off, on | States off/on (the rays pop out on "on"). Use for ideas and electricity. |
| energy | `factory` | Factory | scratch | on, off | States on (smoke, lit windows) / off. |
| energy | `fire` | Fire | scratch | idle, big | Flickers. State big (grows a little). |
| everyday | `book` | Book | scratch | idle, flip | State flip: pages turn again and again. |
| everyday | `clock` | Clock | upgraded (phosphor) | tick, fast | States tick (minute hand ticks once per second) / fast (time-lapse). |
| everyday | `hourglass` | Hourglass | scratch | idle, wave, point, cheer | Sand runs down in an 8 s loop. |
| everyday | `house` | House | scratch | day, night | States day/night (windows light up). |
| everyday | `mug` | Mug | scratch | — | Steam rises. |
| money | `banknote` | Banknote | scratch | idle, fly | States idle/fly (flutters). |
| money | `coin` | Coin | upgraded (phosphor) | idle, spin | States idle/spin. |
| nature | `leaf` | Leaf | scratch | — | Sways from the stem. |
| nature | `sprout` | Sprout | scratch | idle, grow | State grow: the plant grows out of the pot (about 1.6 s). |
| nature | `tree` | Tree | scratch | summer, autumn | Sways. States summer/autumn. |
| people | `person` | Person (blue) | scratch | idle, wave, point, cheer | Generic person. Also person2 (red), person3 (green). |
| science | `atom` | Atom | scratch | idle, excited | Electrons orbit continuously. States idle/excited (vibrates). |
| science | `bacterium` | Bacterium | scratch | — | Swims gently (flagella wave). |
| science | `cell` | Animal cell | scratch | — | The membrane wobbles and the mitochondria drift. |
| science | `dna` | DNA | scratch | — | Turns continuously. |
| science | `flask` | Lab flask | scratch | idle, react | States idle/react (colour change, many bubbles, shaking). |
| science | `magnet` | Magnet | scratch | idle, field | States idle/field (field lines appear and pulse). |
| science | `magnifier` | Magnifier | scratch | idle, scan | States idle/scan (moves around as if searching). |
| science | `molecule` | Water molecule (H₂O) | scratch | idle, heat | States idle/heat (vibrates faster). For other molecules copy and change atoms and roles. |
| science | `thermometer` | Thermometer | scratch | mid, hot, cold | States mid/hot/cold (the level moves to the new value). |
| science | `virus` | Virus | scratch | idle, attack | Slowly turns. State attack (bigger, spins faster). |
| space | `moon` | Moon | scratch | full, crescent, phases | States full/crescent/phases (the shadow moves through all phases). |
| space | `rocket` | Rocket | scratch | idle, launch | States idle/launch (flame, shake, then lift-off). |
| space | `satellite` | Satellite | scratch | idle, send | States idle/send (signal arcs). Floats gently. |
| space | `sun` | Sun | scratch | idle, flare | Rays turn slowly. State flare (rays pulse). |
| tech | `gears` | Gears | scratch | run, stop | Two meshing gears (run/stop). Good for "how a process works". |
| tech | `laptop` | Laptop | upgraded (phosphor) | idle, code | States idle/code (red code lines, faster scrolling). |
| tech | `lock` | Padlock | upgraded (phosphor) | locked, open | States locked/open (the shackle lifts). |
| tech | `phone` | Smartphone | upgraded (phosphor) | idle, message | States idle/message (buzz + bubble). The screen content scrolls. |
| tech | `server` | Server | upgraded (tabler) | idle, busy | States idle/busy (fast LEDs, load bars). |
| tech | `wifi` | Wi-Fi | direct (tabler) | idle, weak | Line icon: best as a small symbol. States idle/weak. |
| transport | `car` | Car | scratch | idle, drive | Side view facing right. States idle/drive (wheels turn, speed lines). |
| transport | `plane` | Airplane | scratch | — | Side view facing right; floats. |
## Rules for every object (the style contract)

1. **No colours or widths in object files.** Colours are role names (`body`, `accent`, `heart`, `ocean`, …) defined in `objlib/tokens.ts`; line widths are multipliers of the token width (`w: 0.6`). Restyle the library by editing tokens only.
2. **Regions + centre lines.** `region` = a filled area (gets the ink outline); `line` = a stroke along its centre (draws on in whiteboard). Do not use `inkfill` (filled shapes that pretend to be lines) in new objects: they cannot follow the token width and cannot be drawn stroke by stroke.
3. **Box**: draw in a 256 × 256 box (24 for Tabler-based objects), subject centred, about 8–20 units of margin.
4. **Max 3 colour roles + `shade` + `shine`** per object. Shading = one flat `shade` region (no gradients). One `shine` line for highlights.
5. **Overlapping sub-shapes** (cloud puffs, bone ends, tree crown): one region with `union: true` — it is drawn as one shape without inner outlines. Draw sub-shapes clockwise (`circle()`, `rrect()` in `_shapes.ts` already are).
6. **Moving parts** are `group`s with a `pivot`; motion comes from `pose(t, state, since)`. Every object needs a small **idle motion** (breathing, bob, turn, flicker) so it is never frozen on screen.
7. **States** are named by meaning (`on`, `open`, `inside`, `fast`, `cavity`) and listed in `states`; parts can be limited to states with `when`.
8. **Silhouette test**: the object must be recognisable as a black shape at 120 px. If not, change the shape, not the details.
9. Fill in `tags` (synonyms the script may use) and `notes` (how to use it).
10. After adding or changing objects, check a page in Remotion Studio, then run `render-library.sh` and look at both looks.

## Three ways to make a new object

| Route | When | How |
|---|---|---|
| **Pictogram** (no new file) | small symbols, labels, legends, counting icons | `<Pictogram name="…" />`: any of the ~5,000 Tabler icons (MIT). They are centre lines, so both renderers work |
| **Upgrade an icon** | tech and everyday things (devices, tools, buildings) | take the silhouette from a Tabler icon (centre lines) or from the **duotone fill layer** of a Phosphor icon (`node_modules/@phosphor-icons/core/assets/duotone/<name>-duotone.svg`, first path); draw outlines yourself (regions), add fills, details, moving groups, states. Example: `bulb`, `phone`, `coin`, `server` |
| **From scratch** | science, body, nature (no icon set has these) | draw with `_shapes.ts` helpers (`circle`, `rrect`, `poly`, `smooth`, `blob`, `star`, `gear`, `capsule`, `arc`, `lines`); shapes can be functions of time (`d: (t) => …`) for wobbling membranes, flames, rain |

Phosphor's own outline layer has a baked line width (it is a filled shape): never use it, it breaks the uniform line width. Licences: Tabler Icons and Phosphor Icons are MIT (`LICENSES/`).

## Files

| File | What |
|---|---|
| `objlib/types.ts` | the format (`Obj`, `Part`, `Pose`) |
| `objlib/tokens.ts` | role colours (flat) and role → marker (whiteboard) |
| `objlib/render/flat.tsx`, `render/whiteboard.tsx` | the two renderers (pure React/SVG, no Remotion import) |
| `objlib/objects/*.ts` | the objects, by category; `_shapes.ts` = path helpers |
| `objlib/Thing.tsx` | `<Thing>`, `<Pictogram>` |
| `objlib/tabler-icons.json` | all Tabler outline icons as paths (`node scripts/build-icons.mjs` rebuilds it) |
| `objlib/Gallery.tsx` | catalogue pages |
