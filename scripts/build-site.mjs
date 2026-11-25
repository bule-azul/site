// Copies the deployable files into dist/ and injects the widget's publishable
// key (from ALPHA_T_PUBLIC_KEY) in place of the placeholder in every .html.
// The key is never written to the repository and never printed.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const PLACEHOLDER = '__ALPHA_T_PUBLIC_KEY__';
const DEPLOYABLE = ['index.html', 'en', 'assets'];

const fail = (message) => {
  console.error(`build-site: ${message}`);
  process.exit(1);
};

const key = process.env.ALPHA_T_PUBLIC_KEY;
if (!key || !key.trim()) {
  fail('ALPHA_T_PUBLIC_KEY is not set or is empty. Set it as a repository variable (Settings > Secrets and variables > Actions > Variables).');
}
if (key.startsWith('at_sec_')) {
  fail('ALPHA_T_PUBLIC_KEY holds a secret key (at_sec_...). Only the publishable key (at_pub_...) may ship in a page.');
}
if (!key.startsWith('at_pub_')) {
  fail('ALPHA_T_PUBLIC_KEY does not look like a publishable key: it must start with at_pub_.');
}

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return p.endsWith('.html') ? [p] : [];
  });

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const entry of DEPLOYABLE) {
  cpSync(join(root, entry), join(dist, entry), { recursive: true });
}

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  writeFileSync(file, html.split(PLACEHOLDER).join(key));
}

console.log(`build-site: wrote dist/ (${DEPLOYABLE.join(', ')}), key injected.`);
