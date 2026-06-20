import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePlugin } from '@songloft/plugin-builder';

const buildDir = fileURLToPath(new URL('../dist/_build', import.meta.url));
const staticDir = fileURLToPath(new URL('../dist/_build/static', import.meta.url));

function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
}

function assertNoStaleStaticAssets() {
  const pluginJson = readFileSync(`${buildDir}/plugin.json`, 'utf8');
  const staticFiles = walkFiles(staticDir);
  const referenceText = [
    pluginJson,
    ...staticFiles
      .filter((file) => /\.(html|css|js)$/i.test(file))
      .map((file) => readFileSync(file, 'utf8'))
  ].join('\n');

  const staleAssets = staticFiles
    .filter((file) => !/[/\\]index\.html$/i.test(file))
    .filter((file) => statSync(file).isFile())
    .map((file) => relative(staticDir, file).replace(/\\/g, '/'))
    .filter((file) => !referenceText.includes(file) && !referenceText.includes(file.split('/').pop()));

  if (staleAssets.length) {
    console.error('Validation failed: stale static assets found in dist/_build:');
    for (const asset of staleAssets) {
      console.error(`  - static/${asset}`);
    }
    process.exit(1);
  }
}

if (!existsSync(buildDir)) {
  console.error('dist/_build not found. Run `npm run build` first.');
  process.exit(1);
}

const result = await validatePlugin(buildDir);
if (!result.valid) {
  console.error('Validation failed:');
  for (const error of result.errors) {
    console.error(`  - ${error.field}: ${error.message}`);
  }
  process.exit(1);
}

assertNoStaleStaticAssets();
console.log('Built plugin is valid.');
