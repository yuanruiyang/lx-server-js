import { rmSync } from 'node:fs';

const targets = [
  new URL('../dist/_build', import.meta.url),
  new URL('../dist/lx-sync-server.jsplugin.zip', import.meta.url)
];

for (const target of targets) {
  rmSync(target, { force: true, recursive: true });
}
