# Explanation patterns (`studio/src/patterns/`)

A pattern is one proven way to *show* an idea. It takes objects from the library and plays them on **beats** (times, normally word cues: `cue(line, 'word')`). Every pattern:

- shows its subject within 0.3 s of its start (or a dashed placeholder for what is coming);
- changes something at every beat (an item arrives, a link draws, a state changes, a highlight moves);
- keeps moving between beats (object idle motion, dots flowing along arrows, slow camera drift).

So a shot built from a pattern cannot be empty or frozen. See them all: `docs/library/patterns-sheet.png`, `docs/library/patterns-reel.mp4` (render with `bash studio/scripts/render-library.sh`), or `npx remotion studio` → `patterns-reel`.

## Choose a pattern from the sentence

Write each narration sentence as a **visible verb** first (grows, splits, flows, blocks, turns into, is bigger than…). Then pick:

| The sentence says… | Pattern | Beats |
|---|---|---|
| a question, the hook | **QuestionHook** | question, then each surrounding item |
| A causes B causes C | **CauseChain** | one per link |
| it goes round and starts again | **Cycle** | one per stage; a marker keeps looping after the last |
| first do this, then that | **Steps** | one per step |
| in 1879 … then in 1903 … | **Timeline** | one per event (the camera travels) |
| it used to be X, now it is Y | **BeforeAfter** | before, after |
| A vs B (with numbers) | **Compare** | left, right, verdict |
| "people think X, but actually Y" | **MythFact** | myth, cross-out, fact |
| X is like Y | **Analogy** | A, B (with ≈), what they share |
| how big / how small | **ScaleLadder** | one per step (×ratio badge, the old thing shrinks away) |
| what is inside / too small to see | **ZoomInto** | outer, lens opens, each inner thing |
| the parts of a thing | **Cutaway** | object, open (state), each part label |
| a share: "1 in 4", "60 %" | **CountUnits** | grid fills, share lights up |
| one surprising number | **BigReveal** | object, count-up |
| where it goes: energy, money, data, food | **FlowNetwork** | nodes, links, each highlighted path |

If no pattern fits, draw a custom scene (as `S4`/`S5` in the demo) — but keep the same three promises (subject at once, change on every beat, motion between beats).

## Use

```tsx
import {CauseChain} from '../../patterns';
// in Main.tsx, for the shot that starts at a0:
{shot === 'S3' && <CauseChain t={t} at={a0} title="How a fever fights germs"
  beats={[a0, cue(4, 'brain'), cue(4, 'fever'), cue(5, 'slow')]}
  items={[{thing: 'virus', label: 'Germs get in'}, {thing: 'brain', state: 'active', label: 'Brain turns up heat'},
          {thing: 'thermometer', state: 'hot', stateAt: cue(4, 'fever'), label: 'Fever'}, {thing: 'bacterium', label: 'Germs slow down'}]} />}
```

An `Item` is `{thing?: objectId, icon?: tablerName, text?: string, state?, stateAt?, label?, role?}`. All patterns take `t`, `at` (shot start), `beats`, optional `title` and `look` ('flat' | 'whiteboard', default from `BRAND.render`). Full props: the demos at the bottom of `patterns/index.tsx`.

### Text and layout (shared by all patterns, `patterns/common.tsx`)

- Sizes: `TITLE` = 80 px, `LABEL` = 50 px (1920×1080), in the brand title font (`BRAND.fonts.title`). Text must read on a phone; do not go smaller. Override per item with `labelSize` / `labelWidth` (labels wrap to that width).
- Keep text and key objects above y ≈ 930: burned-in subtitles cover the bottom of the frame.
- Arrows between items (CauseChain, Cycle, FlowNetwork) are cut with `link()`: they start and end outside each item's circle **and** its label, so an arrow never runs through text. Use `link()` too when you draw your own arrows between labelled items.
- FlowNetwork: you place the nodes. Leave at least ~350 px between nodes so their arrows are not stubs; `size` (default 220) sets the object size.

## Pacing rules (checked by `scripts/scan.sh`)

| Rule | Value |
|---|---|
| Something visibly changes at least every | 2–4 s (hard limit 4 s, scanner) |
| Empty frames (only background) | never, except a deliberate black or title moment (`--allow`) |
| Subject on screen after a cut | within 0.3 s |
| Beats per sentence | one per clause; a 6 s sentence has 2–3 beats |
| Text on screen | max 6 words per label; hold text ≥ letters ÷ 15 + 1.5 s (English) or characters ÷ 4.5 + 1.5 s (Chinese) |
| Title cards | ≥ 4 s, still moving (drift) |
| Pace | vary it: at least one fast run (beats < 1 s apart) and one breath (a 3–4 s hold with only idle motion) per minute |

## Visual thinking: method (from studying lemo-opuscar and claude-motion)

1. **Show what is wrong before you fix it.** If the viewer needs the narration to know what changed, the "before" was not shown.
2. **Hide-the-text test.** Mute and hide every label: can you still tell what happens? If not, the picture is too weak — change objects or states, not fonts.
3. **One colour = one meaning** in each video; write the meanings at the top of the storyboard.
4. **Every move has phases**: anticipation, action, follow-through, settle. A thing that arrives pops slightly past its size and settles; a thing hit by another reacts after the contact, not before.
5. **Camera with a reason**: wide to place, close to explain, cut or move only when the new view adds something. Use at least three different camera moves per minute (push, pan, cut, lens, scale change).
6. **The ending shows the result** (the state things are in now), not only a summary sentence.
7. **Not the demo again**: a new video must differ from the template demo in structure, opening, signature shot and ending.
