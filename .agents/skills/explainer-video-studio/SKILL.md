---
name: explainer-video-studio
description: Make a 1–5 min animated explainer or short video for any channel or brand from a topic, text, link or image: research, script, TTS voice, Remotion animation, music, SFX, subtitles, thumbnails, upload package, with 3 approval gates.
---

# Explainer video studio (generic)

A brand-neutral method from a real explainer channel. It works for any channel, client or one-off video: science, product, history, how-to, news explainers.

**Start from the Explainer Studio template**: https://github.com/helloworld20499/explainer-studio (or a zip from the user). It already has everything below: 15 explanation patterns, an object library (50 animated objects in flat and whiteboard looks + ~5,000 pictograms), a pacing scanner, and the whole audio/render pipeline. Its `AGENTS.md` and `docs/` override this skill.

Reply in the user's language. Write repo docs in plain, simple English.

## 0. Before anything: the project card

Check the repo for `CLAUDE.md`, `docs/brand-guide.md` and `docs/production-pipeline.md`. If they exist, follow them; they override this skill.

If this is a new project, ask these questions in ONE message (or one question form), then write the answers to `docs/project-card.md`:

1. **Format**: 16:9 long-form (1–5 min), 9:16 Short (≤60 s), or both.
2. **Audience and tone**: age group ("made for kids" or not matters on YouTube), serious or playful.
3. **Presenter**: narrator only / recurring characters / mascot. Number of voices.
4. **Visual style**: flat 2D, paper cut-out, whiteboard, motion graphics, real photos + graphics. Brand colours and fonts, if any.
5. **Where it runs**: user's own computer (which OS and GPU/CPU) or cloud only. This decides where TTS and renders run.
6. **Where finished files go**: e.g. Drive folder, Dropbox, a local folder. Never git.

Defaults if the user does not answer: 16:9 + 9:16 cut-down, general 13+, narrator only, flat 2D, render on the user's machine.

## 1. Three gates (always stop and wait)

1. **Script** approved.
2. **Animatic**: real voice + rough frames + shot numbers + timecode. The most important gate (pace, shots, jokes). Asset requests (images, music) go out only after this gate.
3. **Final video**: feedback as "shot + time + problem"; change only that shot.

If the user says "just do it" or works unattended, take the most reasonable reading, say which at the top, and continue — but still deliver the animatic before spending effort on final art.

## 2. Steps

| # | Step | Output |
|---|---|---|
| 1 | Research: real sources, check every number, note where the input text is wrong | `research.md` + Sources |
| 2 | Script: hook in the first 15–20 s (a question or surprise, never "in this video"), one new term = one sentence of explanation, ~150 wpm, a one-sentence answer at the end, a callback or joke near the end | `script.md`, `lines.json` (`[scene, text, speaker]`), `pauses.json` |
| G1 | | |
| 3 | Voice: TTS per line, 2–3 takes, pick the best automatically (Whisper WER), lock pitch/voice per speaker. Then build `timeline.json` (line start/end) and `words.json` (word timestamps) | `vo/*.wav`, timing files |
| 4a | **Beat sheet**: each sentence → a visible verb (splits, flows, grows, blocks, turns into…) → an explanation pattern → one beat (word cue) per clause | `storyboard.md` |
| 4b | Build shots from patterns + library objects; custom drawing only where nothing fits. Run the scanner until it reports OK | `Main.tsx`, scan report |
| 4c | Animatic; list of images still missing (often none); music prompt | animatic, `assets.md`, `music-prompt.md` |
| G2 | | |
| 5 | Real art and music arrive by file name and replace placeholders automatically. Build scenes, SFX list | scenes, `sound.json` |
| 6 | Half-size preview with sound → fixes → full render, mix, subtitles | final mp4 + .srt |
| G3 | | |
| 7 | Publish package: 2–3 thumbnails, 3 title options, description with chapters and sources, tags, 9:16 cut-down, pinned comment | `publish/` |
| 8 | Deliver to the agreed places (two copies: cloud + local), log the time spent | |

After each scene, render 3 key-frame stills and check: heads or text cut off, text overflow, arrows or lines crossing text, text in the subtitle zone, crowding, contrast, timing (±0.3 s to the word).

## 3. Make the pictures move: patterns, objects, density

This is where explainers usually fail (a picture stays for 10 s, or the screen is empty). Use three layers:

1. **Explanation patterns** — one component per way of showing an idea, played on beats:

| The sentence says… | Pattern |
|---|---|
| the hook question | QuestionHook |
| A causes B causes C | CauseChain |
| it repeats | Cycle |
| how to do it | Steps |
| dates, history | Timeline |
| it changed | BeforeAfter |
| A vs B with numbers | Compare |
| "people think…, but…" | MythFact |
| X is like Y | Analogy |
| how big / small | ScaleLadder |
| inside / too small to see | ZoomInto |
| the parts of it | Cutaway |
| a share ("1 in 4") | CountUnits |
| one surprising number | BigReveal |
| where it goes (energy, money, data) | FlowNetwork |

   Each pattern shows its subject within 0.3 s (or dashed placeholders for what is coming), changes something on every beat, and keeps moving between beats (idle motion, flowing dots, camera drift).
2. **Object library** — things as STRUCTURE + ROLES (regions, centre lines, colour roles, moving groups, states), not pictures. Two renderers draw the same data: flat (filled, one outline width) and whiteboard (drawn live with markers). Rules: no hex colours in objects (roles only), line widths in screen px so every size matches, max 3 colour roles + shade + shine, every object has idle motion, overlapping shapes as one `union` region. New objects: pictogram (any Tabler icon) → upgrade (silhouette from a Tabler icon or the Phosphor duotone fill layer; never Phosphor's baked outline) → draw from scratch (science, body, nature).
3. **Pacing rules, checked by a scanner** (frames every 0.5 s): nothing on screen stays still longer than 4 s, no empty frame, one beat per clause, at least one fast run and one breath per minute, text held ≥ letters ÷ 15 + 1.5 s. Intended holds are allowed explicitly and explained in the storyboard.

4. **Text and layout** (the template's patterns do this; keep it in custom scenes too):
   - Big text: titles ~80 px, labels ~50 px on a 1920×1080 frame (it must read on a phone). Never below ~40 px.
   - A lively, rounded title font for titles, labels and numbers (the template uses Fredoka); a calm sans for long text.
   - Labels wrap to a set width; they never run into the next item or off the frame.
   - Fill the frame: the main subject is big (often a third of the frame height or more); no large empty bands.
   - Keep text and key objects above y ≈ 930: burned-in subtitles cover the bottom ~140 px.
   - Arrows between labelled items start and end outside the item **and its label** (template: `link()` in `patterns/common.tsx`). An arrow through a word is the most common layout bug.

Method: show what is wrong before the fix; hide-the-text test (without labels the picture must still tell what happens); one colour = one meaning; every move has anticipation, action, follow-through; camera moves only when the new view adds something; the ending shows the resulting state.

## 4. Studio setup for a new project (copy, do not reinvent)

Use the Explainer Studio template. Without it, copy an existing studio's `src/kit/`, `src/objlib/`, `src/patterns/` and `scripts/` and change only the brand files. Otherwise build this layout:

```
docs/            project-card, brand-guide, production-pipeline (the source of truth)
brand/           logo, colours, fonts, characters/<name>_<pose>.png, locations/, music/
episodes/<ep>/   script.md lines.json pauses.json storyboard.md assets.md sound.json assets/ music/ publish/
studio/          Remotion project
  src/kit/       lib (colours, fonts, shared shapes), chars (pose registry + placeholders), stage (sets, camera),
                 science/infographic pieces, bookends (intro/outro), thumb, cues (word anchors)
  src/objlib/    object library: types, tokens, flat + whiteboard renderers, objects/, Thing + Pictogram
  src/patterns/  explanation patterns
  src/episodes/<ep>/   Main.tsx, animatic, publish (thumbs, short), timeline.json, words.json
  scripts/       voice.sh animatic.sh final.sh publish.sh deliver.sh ensure_browser.sh
                 prep_assets.py sound.py mix.py subs.py music_info.py stills.mjs
                 scan.sh (stillness/empty check)  render-library.sh (catalogue, rendered on the user's computer)
```

Pinned versions that are known to work: Remotion 4.0.300, TypeScript 5.6.3, React 18.3.1. Inline fonts as base64 (staticFile font loading can time out), and render again once they are loaded before you measure text widths.

One script per step, each callable as `bash studio/scripts/<step>.sh <ep>`. Scripts that make generated files (timing, cut-out info) must be deterministic and commit their own output, so `git pull` never conflicts.

## 5. Rules that save the most time

- **Narration first, animation second.** All times come from the real voice. Animation follows words, never fixed seconds. Re-voicing a line then moves its animation automatically.
- **One colour = one meaning** in each video. Keep character/brand colours and "concept" colours separate.
- **Patterns first, library objects second, custom drawing last.** Add an object to the library instead of drawing it inside one episode.
- **Do not put absolute-time animation inside a `<Sequence>`**: its frame counter restarts at 0, things appear late or never (a common cause of empty screens). Switch shots by time instead.
- **Reuse before drawing**: a pose library (one image per character × pose, made once), a kit of infographic pieces (arrows, step flows, big numbers, bars, compare panels, zoom portal, particles), and fixed backgrounds with measured floor lines.
- **Images from an image AI**: one subject per image, full body, pure `#00FF00` background, reference sheet attached, exact file name. Key pure green everywhere (also in closed gaps), remove spill, trim. Talking poses with the mouth closed if lip sync is planned.
- **Placeholders by name**: code uses the final file name from day one; a missing file shows a placeholder, so the animatic and final share one codebase.
- **Music of any length**: AI music tools often give fixed ~1 min clips. Do not ask for a length. Ask for tempo, key and "a clear final chord". Detect the beat grid, cut on bar lines, time-stretch ≤5 %, and anchor the clip's ending to the scene cut.
- **Mix**: −14 LUFS integrated for YouTube; music ~18–20 dB under speech; duck under speech.
- **Re-timing old footage**: a piecewise-linear time warp (pairs of matching sentences old ↔ new) re-uses old scenes with a new voice track.
- **Subtitles**: upload the clean video + .srt rather than burned-in captions (unless the platform needs them; Shorts get burned-in karaoke captions).
- **Heavy work runs where the user said** (step 0). In a cloud session without that machine: write code, render stills only, and hand the user one copy-paste command per step.

## 6. Known problems and fixes

| Problem | Fix |
|---|---|
| TypeScript 6 breaks the Remotion bundler | TS 5.6.3 |
| "No browser found for rendering" (newer Node unpacks Chrome Headless Shell only partly) | unzip the missing files (`unzip -n`) before render; keep it in an `ensure_browser.sh` |
| ffmpeg 8 rejects `ass=file.ass` short form; Homebrew ffmpeg lacks libass | `ass=filename=…`; else deliver .srt |
| Whisper flags names and numbers as errors | listen before re-voicing |
| Voice clones drift higher in pitch | measure pitch per line and correct to the speaker's reference |
| Cut-outs from line-up sheets keep floor lines and neighbour pixels | keep only the largest connected component; better: request single images on #00FF00 |
| Characters look too small or too big in a real background | set heights per character in world pixels against a measured object (e.g. a counter) and keep the camera clamped inside the world |
| Big number shows "2,002" for a year | turn off thousands grouping |
| Wrong cloud account in a file connector | check the signed-in account before upload |
| Kokoro TTS: `…espeakng_loader//phontab` not found | espeak-ng cuts data paths over ~160 characters: keep the project (venv) in a short path |
| Icon package subpath import fails in the bundler (`exports` field) | copy the data you need into the repo (e.g. a generated JSON) |
| Arrows run through labels (cycle, flow diagrams) | cut each arrow where it leaves the item's circle *and* label box; footprints are not convex, so cut after the last point inside, not the first point outside |
| Pills and text boxes narrower than their text | widths were measured before the fonts loaded (fallback font): keep `delayRender` until the fonts are in, re-render, then measure |
| Chinese / Japanese text in a Latin display font falls back to a system font | add a CJK font with the same feel (e.g. a rounded CJK face) to the inlined fonts and to the font stack |

## 7. Platform notes (YouTube)

- "Made for kids" only if the content is for children; it switches off comments and many features. General-audience explainers: not made for kids, and avoid "for kids" wording in titles, tags and thumbnails.
- AI disclosure: check the current YouTube rule; clearly animated content usually does not need the "altered or synthetic" label. Look it up, do not assume.
- End screen: last 5–20 s; leave space in the outro for it.
- Thumbnail 1280×720, ≤3 words, one face/character with a strong expression, high contrast.

## 8. Benchmarks

First video with setup: ~10 h of active time. With the template (patterns + object library): 1.5–2.5 h from topic to upload package, plus the user's time for art and music. Final render of a 3 min 1080p video: ~3–4 min on an Apple M4.

Log the real time per step in `docs/production-pipeline.md` after each video and update this estimate.