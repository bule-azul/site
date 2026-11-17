import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const pages = { 'index.html': 'pt-BR', 'en/index.html': 'en' };

const flat = (o, p = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object') flat(v, key, out); else out[key] = v;
  }
  return out;
};

test('both pages parse: doctype, one h1, a title and the right lang', () => {
  for (const [file, lang] of Object.entries(pages)) {
    const html = read(file);
    assert.match(html, /^<!doctype html>/i, `${file} doctype`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${file} h1 count`);
    assert.match(html, /<title[^>]*>[^<]+<\/title>/, `${file} title`);
    assert.match(html, new RegExp(`<html lang="${lang}"`), `${file} lang`);
  }
});

test('every data-i18n key used in index.html exists in both locale files', () => {
  const html = read('index.html');
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const pair of m[1].split(';')) keys.add(pair.split(':')[1].trim());
  }
  assert.ok(keys.size > 0);
  for (const loc of ['pt-BR', 'en']) {
    const d = flat(JSON.parse(read(`assets/i18n/${loc}.json`)));
    for (const key of keys) assert.equal(typeof d[key], 'string', `${loc} is missing ${key}`);
  }
});

test('index.html shows the pt-BR locale text (the source page is in sync)', async () => {
  const { localize } = await import('../scripts/i18n-pages.mjs');
  const src = read('index.html');
  assert.equal(localize(src, 'pt-BR'), src);
});

test('en/index.html equals a fresh run of the generator', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'bule-azul-'));
  execFileSync(process.execPath, [join(root, 'scripts/i18n-pages.mjs'), tmp], { stdio: 'pipe' });
  assert.equal(readFileSync(join(tmp, 'en/index.html'), 'utf8'), read('en/index.html'),
    'en/index.html is stale: run node scripts/i18n-pages.mjs');
});

test('every root-relative href and src points at a file in the repository', () => {
  for (const file of Object.keys(pages)) {
    const html = read(file);
    for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = m[1];
      if (/^(https?:)?\/\//.test(url) || !url.startsWith('/')) continue;
      const path = url.split(/[?#]/)[0];
      const target = path.endsWith('/') ? `${path}index.html` : path;
      assert.ok(existsSync(join(root, target)), `${file}: ${url} does not exist`);
    }
  }
});
