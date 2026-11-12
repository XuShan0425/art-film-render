import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Node 里 @remotion/renderer 是 CJS 包装，ESM 具名导入取不到；
// 加载 .ts/.tsx 时把 `import { x } from '@remotion/renderer'` 改写成运行时 require。
const require = createRequire(import.meta.url);

export async function resolve(spec, ctx, next) {
  try {
    return await next(spec, ctx);
  } catch (e) {
    if (spec.startsWith('.') || spec.startsWith('file:')) {
      for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
        try { return await next(spec + ext, ctx); } catch {}
      }
    }
    throw e;
  }
}

export async function load(url, ctx, next) {
  if (url.endsWith('.tsx') || url.endsWith('.ts')) {
    const src = readFileSync(new URL(url), 'utf8');
    const patched = src.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]@remotion\/renderer['"];?/g,
      (_m, names) => 'const {' + names + "} = (await import('node:module')).createRequire(import.meta.url)('@remotion/renderer');"
    );
    const out = ts.transpileModule(patched, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: url,
    }).outputText;
    return { format: 'module', source: out, shortCircuit: true };
  }
  return next(url, ctx);
}
