import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../static/css/styles.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../static/js/app.js', import.meta.url), 'utf8');

const checks = [
  {
    name: 'page exposes a compact status summary rail',
    pass: /class="status-grid"/.test(html)
      && /id="summary-connection"/.test(html)
      && /id="summary-events"/.test(html)
      && /summary-connection/.test(js)
  },
  {
    name: 'playlist snapshot is rendered as responsive glass cards',
    pass: /id="playlist-body" class="playlist-grid"/.test(html)
      && /playlist-card/.test(js)
      && /\.playlist-grid/.test(css)
      && /\.playlist-card/.test(css)
  },
  {
    name: 'Liquid Glass material tokens and edge treatment are defined',
    pass: /--glass-clear/.test(css)
      && /--glass-tinted/.test(css)
      && /\.panel::after/.test(css)
      && /backdrop-filter:\s*var\(--glass-filter\)/.test(css)
  },
  {
    name: 'motion and small-screen accessibility are covered',
    pass: /prefers-reduced-motion:\s*reduce/.test(css)
      && /max-width:\s*720px/.test(css)
      && /overflow-wrap:\s*anywhere/.test(css)
  },
  {
    name: 'primary action regions use iOS-style control bars',
    pass: /class="[^"]*control-cluster/.test(html)
      && /\.control-cluster/.test(css)
      && /\.button\.icon/.test(css)
  }
];

let failed = 0;
for (const check of checks) {
  if (check.pass) {
    console.log(`ok - ${check.name}`);
  } else {
    failed += 1;
    console.error(`not ok - ${check.name}`);
  }
}

if (failed) process.exitCode = 1;
