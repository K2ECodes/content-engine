// Parse a post's copy.md into sections.
// Sections start at "## Name" headings. Text before the first heading is "_preamble".

export function parseSections(src) {
  const sections = [];
  const re = /^##[ \t]+(.+?)[ \t]*$/gm;
  let current = { name: '_preamble', headingStart: 0, start: 0 };
  let m;
  while ((m = re.exec(src))) {
    current.end = m.index;
    sections.push(current);
    current = { name: m[1].trim(), headingStart: m.index, start: m.index + m[0].length };
  }
  current.end = src.length;
  sections.push(current);
  return sections.map((s) => ({ ...s, body: src.slice(s.start, s.end) }));
}

export function getSection(src, name) {
  const s = parseSections(src).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return s ? s.body.trim() : null;
}

// Replace a range with spaces but keep newlines, so offsets and line numbers survive.
export function blank(str) {
  return str.replace(/[^\n]/g, ' ');
}
