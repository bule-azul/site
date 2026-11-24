import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const FAKE = 'at_pub_fake0123456789';

const build = (key) => {
  const env = { ...process.env };
  delete env.ALPHA_T_PUBLIC_KEY;
  if (key !== undefined) env.ALPHA_T_PUBLIC_KEY = key;
  return spawnSync(process.execPath, [join(root, 'scripts/build-site.mjs')], { env, encoding: 'utf8' });
};

test('with a publishable key it writes both pages with the key in place', () => {
  const r = build(FAKE);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!r.stdout.includes(FAKE) && !r.stderr.includes(FAKE), 'the key must not be printed');
  for (const page of ['index.html', 'en/index.html']) {
    const html = readFileSync(join(dist, page), 'utf8');
    assert.ok(html.includes(`apiKey: "${FAKE}"`), `${page} carries the key`);
    assert.ok(!html.includes('__ALPHA_T_PUBLIC_KEY__'), `${page} has no placeholder left`);
  }
  assert.ok(existsSync(join(dist, 'assets/styles.css')));
});

test('dist/ holds only the deployable files', () => {
  assert.equal(build(FAKE).status, 0);
  assert.deepEqual(readdirSync(dist).sort(), ['assets', 'en', 'index.html']);
});

test('without the variable, or with an empty one, it fails', () => {
  for (const value of [undefined, '', '   ']) {
    const r = build(value);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /ALPHA_T_PUBLIC_KEY/);
  }
});

test('a secret key or a malformed value is refused and never echoed', () => {
  for (const value of ['at_sec_shouldneverships', 'pk_other_12345']) {
    const r = build(value);
    assert.notEqual(r.status, 0);
    assert.ok(!r.stderr.includes(value) && !r.stdout.includes(value));
  }
});
