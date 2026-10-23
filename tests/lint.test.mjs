import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintPostDir, lintText } from '../scripts/lint.mjs';

const fx = (name) => path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', name);
const rules = (issues, level = 'error') => issues.filter((i) => i.level === level).map((i) => i.rule);

test('good post passes with no errors', () => {
  assert.deepEqual(rules(lintPostDir(fx('good-post'))), []);
});

test('bad post trips every hard rule', () => {
  const r = rules(lintPostDir(fx('bad-post')));
  for (const id of ['dash', 'exclamation', 'percent', 'number-words', 'brand-name', 'banned', 'spaced-hyphen', 'meta'])
    assert.ok(r.includes(id), `expected ${id}, got ${r.join(',')}`);
  assert.equal(r.filter((x) => x === 'brand-name').length, 3);
  assert.equal(r.filter((x) => x === 'banned').length, 4);
});

test('bad post gets style warnings', () => {
  const w = rules(lintPostDir(fx('bad-post')), 'warn');
  assert.ok(w.includes('contraction'));
  assert.ok(w.includes('closer'));
});

test('Notes section and URLs are not linted', () => {
  assert.deepEqual(lintText('## Notes\nAI agency — 40%!\n'), []);
  assert.deepEqual(lintText('See https://x.com/a?b=10%25&c=!\n'), []);
});

test('correct brand forms pass', () => {
  assert.deepEqual(lintText("Content Systems.ai. Visit contentsystems.ai. We're Content Systems. AI is a tool."), []);
});

test('caption over limit and too many hashtags fail', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-'));
  fs.writeFileSync(path.join(dir, 'copy.md'), `## Caption\n${'a '.repeat(1600)}\n#a #b #c #d\n`);
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ channel: 'li-company', format: 'static', aspect: '1:1', pillar: 'case-studies', execution: 'proof', topic: 't', lead: false, cta_type: 'call', slot: '2026-10-26T12:00', timezone: 'America/New_York', status: 'draft' }));
  const r = rules(lintPostDir(dir));
  assert.ok(r.includes('length') && r.includes('hashtags'), r.join(','));
});
