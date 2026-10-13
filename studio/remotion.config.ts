import {Config} from '@remotion/cli/config';
// Optional: point at a specific Chrome / headless shell (e.g. in CI containers)
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
// Software GL works everywhere; on a Mac you can try 'angle' for speed.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as any) || 'swangle');
Config.setConcurrency(process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : null);
