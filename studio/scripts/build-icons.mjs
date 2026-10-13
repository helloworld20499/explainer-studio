// Make src/objlib/tabler-icons.json from the @tabler/icons package (MIT, © Paweł Kuna): {name: [path d, ...]}.
// Run after updating @tabler/icons:   node scripts/build-icons.mjs
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(fs.readFileSync(path.join(studio, 'node_modules/@tabler/icons/tabler-nodes-outline.json'), 'utf8'));
const out = {};
for (const [name, nodes] of Object.entries(src)) out[name] = nodes.filter(([, a]) => a.d && a.d !== 'M0 0h24v24H0z').map(([, a]) => a.d);
fs.writeFileSync(path.join(studio, 'src/objlib/tabler-icons.json'), JSON.stringify(out));
console.log(Object.keys(out).length, 'icons ->', 'src/objlib/tabler-icons.json');
