# Production pipeline

The source of truth for how a video is made. AI assistants follow this document; update it when the process changes.

## 1. Roles

| Who | Does |
|---|---|
| User (producer) | Gives the topic, approves the 3 gates, makes images and music with image/music AI tools (or gives them to an artist). |
| AI assistant | Research, script, storyboard, all code, voice, sound effects, mix, subtitles, thumbnails, upload text, checks. |

## 2. Where the work runs

Write it in `docs/project-card.md`. Two common set-ups:

- **Local**: the AI runs in a terminal on the user's computer (for example Claude Code, Codex CLI, Gemini CLI) and runs every script itself.
- **Cloud + local**: the AI runs in the cloud. It writes code and docs, renders key-frame stills only, pushes to git and gives the user one command per step to run on their computer. Generated timing files are committed by `voice.sh`, so the cloud session gets them with `git pull`.

TTS and full renders need a real computer: an Apple-silicon Mac renders a 3 min 1080p video in about 3–4 min.

## 3. Steps and gates

| # | Step | Who / where | Output |
|---|---|---|---|
| 1 | Research: real sources, check every number, note errors in the input text | AI | `research.md` with sources |
| 2 | Script: hook in the first 15–20 s (a question or a surprise, never "in this video"), one new term = one sentence of explanation, ~150 words per minute, a one-sentence answer at the end | AI | `script.md`, `lines.json`, `pauses.json` |
| **G1** | **Script approved** | User | |
| 3 | Voice: `voice.sh` (TTS, best of N takes, timeline, word times) | computer | `.work/<ep>/vo/*.wav`, `timeline.json`, `words.json` |
| 4a | **Beat sheet** (`storyboard.md`): each sentence → a visible verb → a pattern (`docs/patterns.md`) or a custom scene, with one beat per clause (word → what changes) | AI | `storyboard.md` |
| 4b | Build the shots from patterns + library objects (`docs/objlib.md`); custom drawing only where no pattern fits. Then `scan.sh <ep>-animatic` until it reports OK | AI + computer | `Main.tsx`, scan report |
| 4c | Animatic (`animatic.sh`), list of images still missing (most videos need none: the library covers objects), music prompt | AI + computer | animatic.mp4, `assets.md`, `music-prompt.md` |
| **G2** | **Animatic approved** — the most important gate (pace, shots, jokes). Show the scan report with it | User | |
| 5 | Images and music arrive by file name (no code change needed). Sound effects in `sound.json`. Final art and motion polish | User + AI | images, music, `sound.json` |
| 6 | `final.sh --preview` (half size, with sound) → fixes → `final.sh` | computer | final mp4 + .srt |
| **G3** | **Final video approved**. Feedback as "shot + time + problem"; change only that shot | User | |
| 7 | Publish package: thumbnails, 3 title options, description with chapters and sources, tags, Short: `publish.sh` | AI + computer | `publish/` |

No voice yet but you want to see the shots? `python3 scripts/timeline.py <ep> --estimate && python3 scripts/align.py <ep> --estimate` makes estimated timing (150 wpm). `voice.sh` replaces it with the real timing later; word anchors keep working.

## 4. Episode files

```
episodes/<ep>-<slug>/
  research.md  script.md  storyboard.md  assets.md  music-prompt.md
  lines.json      [[scene, text, speaker, {options}], ...]  speaker = narrator or a CAST id
  pauses.json     {"gap":0.35, "scene_gap":0.9, "lead":0.8, "tail":2.5, "extra":{"<line>": seconds}}
  sound.json      music sections and SFX; times as seconds or line anchors ("L4", "L4e+0.3", "end")
  assets/         images for this episode only
  music/          music clips for this episode (not in git)
  subtitles.en.srt  (made by subs.py)
  publish/        youtube.md, thumbnail PNGs
studio/src/episodes/<ep>/
  Main.tsx        shots (one component per shot), SHOTS list for the animatic overlay
  timeline.json   words.json   (made by voice.sh; commit them)
  publish/        thumbnails + Short
studio/src/Root.tsx   one block of compositions per episode: <ep>, <ep>-preview, <ep>-animatic, <ep>-short, <ep>-thumb-<x>
```

New episode: copy `ep000` in both places, rename, register the compositions in `Root.tsx`.

## 5. Images (after Gate 2)

- Characters: **1024×1536**, pure flat **`#00FF00`** background, one character, full body, feet visible, generous margins, no ground line. Attach the character reference sheet to every request. Talking poses with the mouth closed if you plan lip sync.
- Backgrounds: **1536×1024**, no people, the middle of the floor empty. After a new background arrives, measure its floor line and furniture and write them in `SETS` (`src/kit/stage.tsx`).
- Folders: `brand/characters/library/<id>_<pose>.png` (made one time, used in every video), `brand/locations/<name>.png`, `episodes/<ep>/assets/` (this video only).
- Pose names: `<cast id>_<pose>`. Default vocabulary (`src/kit/chars.tsx`): stand, side, blink, talk, point, think, surprised, laugh, walk, sit, hold, shrug, cheer. Make these first; then a normal video needs only 3–10 new images.
- `prep_assets.py` (run by the scripts) keys out pure green everywhere (also in closed gaps), removes green spill and trims. `<Char pose=… />` uses the real image when it exists, else a placeholder figure.

## 6. Music (after Gate 2)

- Ask the music tool for **tempo and key** (for example 120 BPM, F major) and "a clear final chord at the end". **Do not ask for a length**: many tools make fixed ~60 s clips.
- `sound.py` cuts each clip on its own bar grid and time-stretches it by 5 % or less to fit the section. `{"anchor": "end"}` puts the clip's own final chord on the section end (intro sting, outro, before a big cut). Check a clip: `python3 scripts/music_info.py <file>`.
- Clips: `episodes/<ep>/music/<name>*.mp3|wav|m4a` or `brand/music/` (series pieces). Several versions `<name>_v1`, `<name>_v2`: choose with `"pick": {"<name>": "v2"}`. A section without a file is synthesized, so the pipeline always runs.
- Sound effects are made in code (`sound.py`: pop, whoosh, click, ding, shimmer, chop, splash, tick, boing, …).
- Mix (`mix.py`): voice −16 LUFS, music about 18–20 dB under the voice with ducking, master −14 LUFS / −1 dBFS.

## 7. Voice

- `studio/voices.json`: one locked voice per speaker. Engines: `kokoro` (any computer, free, Apache 2.0), `mlx` (Apple silicon: design a voice from a text description, then clone it), `files` (own recordings: `voice.sh <ep> --files`).
- Each line is made N times; Whisper reads each take back and the take with the lowest word error rate wins. Lines marked `CHECK` need a listen: names and numbers are often "wrong" only in the transcript.
- Cloned voices can drift in pitch; voices with `ref_audio` are pitch-locked to the reference (`pitch_tol` semitones).
- Re-voice some lines: `bash scripts/voice.sh <ep> --lines 4,9 --takes 5`. The animation follows, because it is anchored to words.

## 8. Animation rules

- **Patterns first, objects second, custom drawing last.** Explanation patterns (`docs/patterns.md`) carry the shots; the object library (`docs/objlib.md`, 50 objects + ~5,000 pictograms) supplies the things; draw a custom scene only when nothing fits, and add a new object to the library when a second video could use it.
- **Density**: something visibly changes every 2–4 s; never an empty frame; the subject is on screen within 0.3 s of a cut; one beat per clause. `bash scripts/scan.sh <composition>` checks holds (> 4 s) and empty frames and makes a contact sheet. A hold that is intended (title card, breath) is passed with `--allow a-b` and explained in the storyboard.
- Times come from `timeline.json`. Anchor movements to words: `cue(line, 'word')` (`src/kit/cues.ts`). Words are lower-case, without punctuation (check `words.json`). Fixed seconds only where nobody speaks.
- Patterns and kit pieces take **absolute** seconds. Do not put them inside a `<Sequence>` (its frame counter restarts at 0 and everything appears late or never): switch shots with `shot === 'S3' && …` as in the demo.
- Reuse the kit (`docs/kit.md`) before you draw new pieces.
- One colour = one meaning in each video; cast colours only for people, concept colours only for concepts.
- Maximum 6 words of on-screen text at a time, one main movement at a time.
- After each scene: `node scripts/stills.mjs <ep>-animatic <sec> <sec> <sec>` and look at the PNGs in `out/`.
- Fixes after Gate 3: render only the changed frames (`--frames=A-B`) and join them with `scripts/splice.sh`.
- Old footage with a new voice: re-time it with `makeWarp([[newTime, oldTime], ...])` (`src/kit/warp.ts`) instead of redrawing.

## 9. Commands

| Step | Command (in `studio/`) |
|---|---|
| One-time setup | `bash scripts/setup.sh` |
| TTS smoke test | `.venv/bin/python scripts/tts.py check` |
| Preview in the browser | `npx remotion studio` |
| Stillness / empty-frame check | `bash scripts/scan.sh <composition> [--allow a-b]` → `.work/scan/<composition>/report.txt`, `contact.jpg` |
| Render the library catalogue (on this computer) | `bash scripts/render-library.sh [--whiteboard]` → `docs/library/` |
| Estimated timing (no voice) | `.venv/bin/python scripts/timeline.py <ep> --estimate && .venv/bin/python scripts/align.py <ep> --estimate` |
| Voice | `bash scripts/voice.sh <ep>` (`--lines 3,7 --takes 5`, or `--files`) |
| Key frames | `node scripts/stills.mjs <composition> <sec> ...` |
| Animatic | `bash scripts/animatic.sh <ep>` |
| Preview with sound | `bash scripts/final.sh <ep> --preview` |
| Final | `bash scripts/final.sh <ep>` |
| Publish package | `bash scripts/publish.sh <ep>` |
| Best render concurrency | `npx remotion benchmark` → `CONCURRENCY` in `config.sh` |

## 10. Known problems and fixes

| Problem | Fix |
|---|---|
| TypeScript 6 breaks the Remotion bundler | keep TypeScript 5.6.3 |
| Fonts via `staticFile` time out in renders | fonts are inlined as base64 (`fontcss.ts`) and loaded with `useFonts()` |
| Pills / text boxes narrower than their text | `useFonts()` re-renders after the fonts load, so `textW()` measures the real font; call `useFonts()` in every top component |
| Arrows run through labels | draw arrows between labelled items with `link()` (`patterns/common.tsx`) |
| "No browser found for rendering frames!" (newer Node unpacks Chrome Headless Shell only partly) | `scripts/ensure_browser.sh` (run by every script) unzips the missing files. In containers: `REMOTION_BROWSER=/path/to/headless_shell` |
| Kokoro: `Error processing file …espeakng_loader//phontab` | espeak-ng cuts data paths longer than ~160 characters. Keep the project in a short path (for example `~/Projects/mychannel`) or set `VENV` in `config.sh` to a short path |
| ffmpeg 8 rejects `ass=file.ass`; Homebrew ffmpeg has no libass | scripts use `ass=filename=…`; without libass there is no burned-in version — upload the clean video + `.srt` (better for YouTube anyway) |
| `git pull` conflicts on generated files | `voice.sh` commits timing files itself; generated files must be the same on every machine |
| Whisper "errors" on names and numbers | listen before you re-voice |
| Characters look too small or too big on a background | set `height` per cast member in `brand.ts` against a measured object; the camera is clamped inside the world |
| A year shows as "2,002" | `<BigNumber grouping={false} />` |

## 11. Review checklist (before Gate 2 and Gate 3)

- [ ] `scan.sh` reports OK (or only allowed ranges, explained in the storyboard).
- [ ] Hide-the-text test: with labels hidden, the pictures still show what happens.
- [ ] No head, hand or text is cut off by the frame or the camera.
- [ ] Text stays out of the subtitle area; contrast at least 4.5:1 for small text.
- [ ] Not crowded: 6 words maximum on screen, one main movement.
- [ ] Animation matches the speech (±0.3 s).
- [ ] Each new term has a one-sentence explanation.
- [ ] Each fact has a source in `research.md` and in the description.
- [ ] Music about 18 dB under speech; final mix −14 LUFS.
- [ ] Subtitles: 42 characters per line, 2 lines maximum.

## 12. Platform notes (YouTube)

- "Made for kids" only if the video is for children (it turns off comments and other features). A general-audience explainer is not made for kids; do not use "for kids" in titles, tags or thumbnails.
- AI disclosure: check YouTube's current rule. Clearly animated content usually does not need the "altered or synthetic content" label.
- End screen: last 5–20 s; the `Outro` has an `endscreen` variant that keeps the right side free.
- Thumbnail 1280×720, 3 words maximum, one face with a strong expression, high contrast.

## 13. Time per video (log yours here)

Benchmark from the channel this template comes from: first video with all setup about 10 h of active time; after the studio, voices and pose library exist, 1.5–2.5 h from topic to upload package, plus the user's time for images and music.

| Video | Date | Active time | Notes |
|---|---|---|---|
| | | | |
