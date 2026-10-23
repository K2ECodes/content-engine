#!/usr/bin/env node
// House-style lint for Content Systems.ai copy.
//
//   node scripts/lint.mjs                 lint every content/**/copy.md (+ its meta.json)
//   node scripts/lint.mjs <path ...>      lint specific post folders, copy.md files or any .md file
//   --strict                              warnings fail too
//   --json                                machine-readable output
//
// Exit code 1 when any error (or, with --strict, any warning) is found.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSections, blank } from './lib/copy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const STYLE = readJson('config/style.json');
const CHANNELS = readJson('config/channels.json');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SPELLED_NUMBERS = [
  'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand',
  'million', 'billion', 'dozen',
];

// Uncontracted pairs and their contraction. Warnings, since emphasis sometimes earns the long form.
const CONTRACTIONS = {
  'do not': "don't", 'does not': "doesn't", 'did not': "didn't", 'is not': "isn't",
  'are not': "aren't", 'was not': "wasn't", 'were not': "weren't", 'cannot': "can't",
  'can not': "can't", 'will not': "won't", 'would not': "wouldn't", 'should not': "shouldn't",
  'could not': "couldn't", 'have not': "haven't", 'has not': "hasn't", 'had not': "hadn't",
  'it is': "it's", 'that is': "that's", 'there is': "there's", 'what is': "what's",
  'here is': "here's", 'who is': "who's", 'let us': "let's", 'i am': "I'm", 'i have': "I've",
  'i will': "I'll", 'i would': "I'd", 'we are': "we're", 'we have': "we've", 'we will': "we'll",
  'you are': "you're", 'you have': "you've", 'you will': "you'll", 'they are': "they're",
  'they have': "they've", 'they will': "they'll",
};

// Each rule: { id, level, re, message(match) }. Regexes run on the masked text.
const RULES = [
  { id: 'dash', level: 'error', re: /[‒–—―−]/g,
    message: (m) => `${m === '—' ? 'em' : 'en/figure'} dash. Use a comma, period, "to" or a middot` },
  { id: 'spaced-hyphen', level: 'error', re: /(?<=\S) {1,}-{1,2} {1,}(?=\S)/g,
    message: () => 'hyphen used as a dash. Use a comma, period, "to" or a middot' },
  { id: 'post-type-label', level: 'error', re: /\b(belief[\s-]shift|calm[\s-]playbooks?|operational[\s-]clarity|tools[\s-]vs\.?[\s-]systems)\b/gi,
    message: (m) => `internal post-type label "${m}". Never name the pillar or execution in copy or on media` },
  { id: 'exclamation', level: 'error', re: /!/g, message: () => 'exclamation mark' },
  { id: 'percent', level: 'error', re: /%|\bper ?cent\b/gi,
    message: () => 'percent in prose. Write "4 in 10", "40 in 100" or rephrase' },
  ...STYLE.bannedPhrases.map(({ phrase, suggest }) => ({
    id: 'banned', level: 'error',
    re: new RegExp(`\\b${phrase.split(/[-\s]+/).map(escapeRe).join('[-\\s]+')}\\b`, 'gi'),
    message: (m) => `banned phrase "${m}"${suggest ? `. Say "${suggest}"` : ''}`,
  })),
  { id: 'brand-name', level: 'error', re: /content[\s-]*systems?(?:\.|\s+)ai\b/gi,
    test: (m) => m !== 'Content Systems.ai' && m !== 'contentsystems.ai',
    message: (m) => `"${m}" must be written "Content Systems.ai"` },
  { id: 'number-words', level: 'error', re: new RegExp(`\\b(${SPELLED_NUMBERS.join('|')})\\b`, 'gi'),
    message: (m) => `spelled-out number "${m}". Use numerals` },
  { id: 'number-one', level: 'warn', re: /\bone\b/gi,
    message: () => 'spelled-out "one". Use "1" unless it is a pronoun ("no one", "the right one")' },
  { id: 'contraction', level: 'warn',
    re: new RegExp(`\\b(${Object.keys(CONTRACTIONS).map(escapeRe).join('|')})\\b`, 'gi'),
    message: (m) => `use a contraction: "${CONTRACTIONS[m.toLowerCase()]}"` },
];

const UNLINTED_SECTIONS = new Set(['notes']);

function lineCol(src, index) {
  const before = src.slice(0, index);
  const line = before.split('\n').length;
  return { line, col: index - before.lastIndexOf('\n') };
}

// Mask what we never lint (Notes section, heading lines, URLs) without moving offsets.
function maskSource(src) {
  let out = src;
  for (const s of parseSections(src)) {
    if (s.name !== '_preamble') {
      out = out.slice(0, s.headingStart) + blank(src.slice(s.headingStart, s.start)) + out.slice(s.start);
    }
    if (UNLINTED_SECTIONS.has(s.name.toLowerCase())) {
      out = out.slice(0, s.start) + blank(s.body) + out.slice(s.end);
    }
  }
  return out.replace(/https?:\/\/\S+/g, blank);
}

export function lintText(src, { file = '<text>' } = {}) {
  const issues = [];
  const masked = maskSource(src);
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(masked))) {
      if (rule.test && !rule.test(m[0])) continue;
      issues.push({ file, ...lineCol(src, m.index), level: rule.level, rule: rule.id, message: rule.message(m[0]) });
    }
  }
  return issues;
}

const countChars = (s) => [...s].length;
const hashtags = (s) => s.match(/(?:^|\s)#[\p{L}\p{N}_]+/gu) || [];

function lintCaption(caption, meta, file) {
  const issues = [];
  const push = (level, rule, message) => issues.push({ file, line: 0, col: 0, level, rule, message });
  const limits = STYLE.limits[meta.channel];
  if (!limits) return issues;

  const n = countChars(caption);
  if (n > limits.maxChars) push('error', 'length', `caption is ${n} chars, max ${limits.maxChars}`);
  else if (limits.targetMin && (n < limits.targetMin || n > limits.targetMax))
    push('warn', 'length', `caption is ${n} chars, aim for ${limits.targetMin} to ${limits.targetMax}`);

  const tags = hashtags(caption).length;
  if (tags > limits.maxHashtags) push('error', 'hashtags', `${tags} hashtags, max ${limits.maxHashtags} on ${meta.channel}`);
  if (limits.minHashtags && tags < limits.minHashtags) push('error', 'hashtags', `${tags} hashtags, min ${limits.minHashtags} on ${meta.channel}`);

  if (meta.lead) {
    if (!meta.cta_keyword) push('error', 'cta', 'lead post without cta_keyword in meta.json');
    else if (!new RegExp(`\\b${escapeRe(meta.cta_keyword)}\\b`).test(caption))
      push('error', 'cta', `cta_keyword "${meta.cta_keyword}" doesn't appear in the caption`);
    else if (!/^[A-Z0-9]+$/.test(meta.cta_keyword))
      push('warn', 'cta', `cta_keyword "${meta.cta_keyword}" should be 1 uppercase word`);
  }

  if (meta.cta_keyword) {
    const head = caption.split('\n').filter((l) => l.trim()).slice(0, 3).join(' ');
    if (!new RegExp(`\\b${escapeRe(meta.cta_keyword)}\\b`).test(head))
      push('warn', 'cta', `put "${meta.cta_keyword}" in the first 3 lines, before the "more" cut`);
  }

  const lastLines = caption.split('\n').map((l) => l.trim())
    .filter((l) => l && !/^(#[\p{L}\p{N}_]+\s*)+$/u.test(l)).slice(-2).join(' ');
  for (const p of STYLE.motivationalCloserPatterns) {
    if (new RegExp(`\\b${p}\\b`, 'i').test(lastLines)) {
      push('warn', 'closer', `motivational closer ("${p}"). End on the point or the CTA`);
      break;
    }
  }
  return issues;
}

const REQUIRED_META = ['channel', 'format', 'aspect', 'pillar', 'execution', 'topic', 'lead', 'cta_type', 'slot', 'timezone', 'status'];
const FORMATS = ['static', 'carousel', 'video'];

function lintMeta(meta, file) {
  const issues = [];
  const push = (message) => issues.push({ file, line: 0, col: 0, level: 'error', rule: 'meta', message });
  for (const k of REQUIRED_META) if (meta[k] === undefined || meta[k] === '') push(`missing "${k}"`);
  if (meta.channel && !CHANNELS.channels[meta.channel]) push(`unknown channel "${meta.channel}"`);
  if (meta.format && !FORMATS.includes(meta.format)) push(`unknown format "${meta.format}"`);
  if (meta.pillar && !CHANNELS.pillars.includes(meta.pillar)) push(`unknown pillar "${meta.pillar}"`);
  if (meta.execution && !CHANNELS.executions.includes(meta.execution)) push(`unknown execution "${meta.execution}"`);
  if (meta.aspect && !['1:1', '4:5', '9:16'].includes(meta.aspect)) push(`aspect "${meta.aspect}" must be 1:1, 4:5 or 9:16`);
  if (meta.cta_type && !CHANNELS.ctaTypes.includes(meta.cta_type)) push(`unknown cta_type "${meta.cta_type}"`);
  if (meta.lead && meta.cta_type && meta.cta_type !== 'comment-keyword') push('lead posts use cta_type "comment-keyword"');
  if (meta.status && !CHANNELS.statuses.includes(meta.status)) push(`unknown status "${meta.status}"`);
  if (meta.slot && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(meta.slot)) push(`slot "${meta.slot}" must be local YYYY-MM-DDTHH:mm`);
  if (meta.timezone && meta.timezone !== CHANNELS.timezone) push(`timezone must be ${CHANNELS.timezone}`);
  if (meta.lead !== undefined && typeof meta.lead !== 'boolean') push('"lead" must be true or false');
  return issues;
}

// On-media text lives in render.json. Lint every string except structural keys.
const STRUCTURAL_KEYS = /^(template|theme|aspect|type|.*icon|posterAt|voice|voSay|style|title)$/i;
function lintRenderJson(node, file, keyPath = '') {
  if (Array.isArray(node)) return node.flatMap((v, i) => lintRenderJson(v, file, `${keyPath}[${i}]`));
  if (node && typeof node === 'object')
    return Object.entries(node).flatMap(([k, v]) => {
      const here = keyPath ? `${keyPath}.${k}` : k;
      if (/^(eyebrow|series|kicker|overline)$/i.test(k))
        return [{ file: `${file} ${here}`, line: 0, col: 0, level: 'error', rule: 'eyebrow', message: 'no eyebrow or series labels on media' }];
      return STRUCTURAL_KEYS.test(k) ? [] : lintRenderJson(v, file, here);
    });
  if (typeof node !== 'string') return [];
  return lintText(node, { file }).map((i) => ({ ...i, line: 0, col: 0, file: `${file} ${keyPath}` }));
}

function lintJargon(text, meta, file) {
  const j = STYLE.companyJargon;
  if (!j || !j.channels.includes(meta.channel)) return [];
  const re = new RegExp(`\\b(${j.terms.map(escapeRe).join('|')})\\b`, 'gi');
  return [...text.matchAll(re)].map((m) => ({ file, line: 0, col: 0, level: 'warn', rule: 'jargon', message: `"${m[0]}" is jargon on a company channel. Say what it does for them` }));
}

export function lintPostDir(dir) {
  const copyPath = path.join(dir, 'copy.md');
  const metaPath = path.join(dir, 'meta.json');
  const rel = (p) => path.relative(process.cwd(), p);
  if (!fs.existsSync(copyPath)) return [{ file: rel(dir), line: 0, col: 0, level: 'error', rule: 'structure', message: 'missing copy.md' }];

  const src = fs.readFileSync(copyPath, 'utf8');
  const issues = lintText(src, { file: rel(copyPath) });

  let meta = null;
  if (!fs.existsSync(metaPath)) {
    issues.push({ file: rel(dir), line: 0, col: 0, level: 'error', rule: 'structure', message: 'missing meta.json' });
  } else {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      issues.push(...lintMeta(meta, rel(metaPath)));
    } catch (e) {
      issues.push({ file: rel(metaPath), line: 0, col: 0, level: 'error', rule: 'meta', message: `invalid JSON: ${e.message}` });
    }
  }

  const renderPath = path.join(dir, 'render.json');
  if (fs.existsSync(renderPath)) {
    try {
      issues.push(...lintRenderJson(JSON.parse(fs.readFileSync(renderPath, 'utf8')), rel(renderPath)));
    } catch (e) {
      issues.push({ file: rel(renderPath), line: 0, col: 0, level: 'error', rule: 'meta', message: `invalid JSON: ${e.message}` });
    }
  }

  const caption = parseSections(src).find((s) => s.name.toLowerCase() === 'caption');
  if (!caption || !caption.body.trim()) {
    issues.push({ file: rel(copyPath), line: 0, col: 0, level: 'error', rule: 'structure', message: 'missing "## Caption" section' });
  } else if (meta) {
    issues.push(...lintCaption(caption.body.trim(), meta, rel(copyPath)));
    issues.push(...lintJargon(caption.body, meta, rel(copyPath)));
    if (fs.existsSync(renderPath)) issues.push(...lintJargon(fs.readFileSync(renderPath, 'utf8'), meta, rel(renderPath)));
  }
  return issues;
}

function findPostDirs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findPostDirs(p));
    else if (entry.name === 'copy.md') out.push(dir);
  }
  return out;
}

function main(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const targets = argv.filter((a) => !a.startsWith('--'));
  if (!targets.length) targets.push(path.join(ROOT, 'content'));

  const issues = [];
  let checked = 0;
  for (const t of targets) {
    const stat = fs.statSync(t);
    if (stat.isDirectory()) {
      for (const d of findPostDirs(t)) { issues.push(...lintPostDir(d)); checked++; }
    } else if (path.basename(t) === 'copy.md') {
      issues.push(...lintPostDir(path.dirname(t))); checked++;
    } else {
      issues.push(...lintText(fs.readFileSync(t, 'utf8'), { file: path.relative(process.cwd(), t) })); checked++;
    }
  }

  issues.sort((a, b) => a.file.localeCompare(b.file) || (a.line || 1e9) - (b.line || 1e9) || a.col - b.col);
  const errors = issues.filter((i) => i.level === 'error').length;
  const warnings = issues.length - errors;

  if (flags.has('--json')) {
    console.log(JSON.stringify({ checked, errors, warnings, issues }, null, 2));
  } else {
    for (const i of issues) {
      const loc = i.line ? `${i.file}:${i.line}:${i.col}` : i.file;
      console.log(`${i.level === 'error' ? 'ERROR' : 'warn '}  ${loc}  [${i.rule}] ${i.message}`);
    }
    console.log(`\n${checked} checked · ${errors} errors · ${warnings} warnings`);
  }
  return errors > 0 || (flags.has('--strict') && warnings > 0) ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
