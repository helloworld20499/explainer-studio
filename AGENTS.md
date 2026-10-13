# Instructions for AI assistants

This repository makes short animated explainer videos. Read these first, in this order:

1. `docs/project-card.md` — format, audience, cast, style, where things run, where files go. If it is still the empty template, ask the user the 6 questions in ONE message and fill it in.
2. `docs/production-pipeline.md` — the workflow, the 3 gates, all commands, known problems. Follow it exactly.
3. `docs/patterns.md` — the 15 explanation patterns and the pacing rules. Every shot starts from a pattern.
4. `docs/objlib.md` — the object library (50 animated objects in two looks + ~5,000 pictograms).
5. `docs/kit.md` — lower-level animation pieces.

## Rules

- Stop at the 3 gates (script, animatic, final video) and wait for the user's approval.
- Write the storyboard as a beat sheet: sentence → visible verb → pattern → one beat per clause.
- Patterns first, library objects second, custom drawing last. Add an object to the library (following its rules) instead of drawing it inside an episode.
- Before every gate run `bash studio/scripts/scan.sh <composition>`: no hold over 4 s, no empty frame (intended holds: `--allow`, explained in the storyboard).
- Narration first, animation second. Times come from `timeline.json` / `words.json`; anchor animation to words with `cue(line, 'word')`.
- Run TTS and video renders where the project card says. If you cannot run them (for example in a cloud session without that machine), write the code, render key-frame stills only (`node scripts/stills.mjs <composition> <sec> ...`), and give the user one command per step.
- After each scene, render 3 key frames and check: heads or text cut off, overflow, crowding, contrast, timing.
- One colour = one meaning in each video. Write the meanings at the top of the storyboard.
- Check every fact against a real source; put the sources in `research.md` and in the video description.
- Never commit videos, audio work files or model files. Finished files go to the `DELIVER_TO` folders (`studio/config.sh`).
- Keep TypeScript at 5.6.3 and Remotion at 4.0.300 unless you test an upgrade.
- Reply in the user's language.
