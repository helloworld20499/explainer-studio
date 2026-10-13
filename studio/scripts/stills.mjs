// Render key frames for checking.   node scripts/stills.mjs <ep> 2.5 14.2 63.0   -> out/<ep>/frames/*.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path'; import fs from 'fs'; import {fileURLToPath} from 'url';
const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [ep, ...secs] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: path.join(studio, 'public')});
const comp = await selectComposition({serveUrl, id: ep, browserExecutable});
const dir = path.join(studio, 'out', ep, 'frames'); fs.mkdirSync(dir, {recursive: true});
for (const s of secs) {
  const out = path.join(dir, `${s}.png`);
  await renderStill({composition: comp, serveUrl, output: out, frame: Math.round(parseFloat(s) * 30), browserExecutable});
  console.log(out);
}
