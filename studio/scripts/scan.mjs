// Frame scan (step 1 of the stillness / empty-frame check): one small JPEG every <step> seconds.
//   node scripts/scan.mjs <composition> [step=0.5]     -> .work/scan/<composition>/*.jpg
// Then scripts/scan.py analyses the frames. Use scripts/scan.sh to run both.
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';
import path from 'path'; import fs from 'fs'; import {fileURLToPath} from 'url';

const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [comp, stepArg] = process.argv.slice(2);
if (!comp) { console.error('usage: node scripts/scan.mjs <composition> [step seconds]'); process.exit(1); }
const step = parseFloat(stepArg ?? '0.5');
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: path.join(studio, 'public')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
const outputDir = path.join(studio, '.work', 'scan', comp);
fs.rmSync(outputDir, {recursive: true, force: true});
fs.mkdirSync(outputDir, {recursive: true});
const every = Math.max(1, Math.round(step * composition.fps));
await renderFrames({
  composition, serveUrl, outputDir, browserExecutable, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.25,
  everyNthFrame: every, inputProps: {}, onStart: () => {}, onFrameUpdate: () => {},
  concurrency: process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : null,
});
fs.writeFileSync(path.join(outputDir, 'scan.json'), JSON.stringify({composition: comp, fps: composition.fps, every, step: every / composition.fps}));
console.log('frames ->', outputDir);
