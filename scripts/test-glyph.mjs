import { register } from 'node:module';
register(new URL('./_loader.mjs', import.meta.url));
await import('./test-glyph-run.mjs');
