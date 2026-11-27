#!/usr/bin/env python3
"""Build the documents for the Engine Room dashboard (Artifact `db`) from the repo.

Writes one JSON file per document under tmp/dashboard/<collection>/<id>.json and a
manifest tmp/dashboard/manifest.json. Claude then writes them to the artifact with
ArtifactData batch (file_path entries). Posts, signals and the queue are derived from
the repo every sync. Ideas and asks are only written with --seed (after that the
dashboard owns them; pull them back with ArtifactData list).

  python3 scripts/dashboard-sync.py [--seed]
"""
import glob, json, os, re, sys, datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tmp', 'dashboard')
NOW = dt.datetime.now(dt.timezone.utc)

CHANNEL = {  # repo channel -> dashboard lane row
    'ig-personal': 'ig-kk', 'ig-ai': 'ig-ai', 'ig-company': 'ig-co',
    'li-personal': 'li-korede', 'li-company': 'li-co', 'li-sanjana': 'li-sanjana',
}
ACCOUNT = {  # log account labels -> row
    '@koredekola': 'ig-kk', 'koredekola': 'ig-kk', '@koredekola.ai': 'ig-ai', 'koredekola.ai': 'ig-ai',
    '@contentsystems.ai': 'ig-co', 'contentsystems.ai': 'ig-co',
    'tiktok:koredekola': 'tt-korede', 'Korede Kola': 'tt-korede', 'TikTok Korede Kola': 'tt-korede',
    'tiktok:contentsystemsai': 'tt-co', 'Content Systems.ai': 'tt-co',
    'linkedin:korede': 'li-korede', 'linkedin:contentsystems': 'li-co',
}


def lane(pid, fmt):
    if pid.startswith('li-'): return 'linkedin'
    if re.search(r'what-if|you-decide|physics|every-level', pid): return 'whatif'
    if '-edit-' in pid or re.search(r'swap|skit', pid): return 'edit'
    if 'fight-card' in pid or fmt == 'carousel': return 'carousel'
    return 'news'


def caption(folder):
    p = os.path.join(folder, 'copy.md')
    if not os.path.exists(p): return ''
    t = open(p, encoding='utf8').read()
    m = re.search(r'## Caption\s*\n(.*?)(\n## |\Z)', t, re.S)
    return (m.group(1).strip() if m else '')[:700]


def title_of(pid):
    slug = re.sub(r'^(ig|li)-[a-z]+-[a-z]{3}-\d{4}-', '', pid)
    return slug.replace('-', ' ').strip().capitalize()


def load_logs():
    """post id -> {row -> {'n': count, 'next': iso, 'last': iso}}"""
    out = {}
    seen = set()
    for f in ('logs/trial-posts.jsonl', 'logs/autopilot-posts.jsonl'):
        for line in open(os.path.join(ROOT, f), encoding='utf8'):
            try: d = json.loads(line)
            except Exception: continue
            post = os.path.basename(str(d.get('post') or '').rstrip('/'))
            when = d.get('scheduledTime')
            if not post or not when or d.get('status') == 'deleted': continue
            sid = d.get('schedchiePostId') or d.get('schedchieId') or (post, when, d.get('variant'))
            if sid in seen: continue
            seen.add(sid)
            row = ACCOUNT.get(str(d.get('account') or ''), None)
            if not row and d.get('platform') == 'linkedin': row = 'li-korede'
            if not row: continue
            r = out.setdefault(post, {}).setdefault(row, {'n': 0, 'trial': 0, 'posted': 0, 'next': None, 'last': None})
            r['n'] += 1
            if d.get('trialReel') or 'trial' in f: r['trial'] += 1
            t = dt.datetime.fromisoformat(when.replace('Z', '+00:00'))
            if t <= NOW:
                r['posted'] += 1
                r['last'] = max(r['last'] or when, when)
            else:
                r['next'] = min(r['next'] or when, when)
    return out


def posts(logs):
    docs = {}
    for meta_p in sorted(glob.glob(os.path.join(ROOT, 'content', '2026-W*', '*', 'meta.json'))):
        folder = os.path.dirname(meta_p)
        pid = os.path.basename(folder)
        try: m = json.load(open(meta_p))
        except Exception: continue
        rows = logs.get(pid, {})
        home = CHANNEL.get(m.get('channel'), 'ig-ai' if pid.startswith('ig-ai') else 'ig-co')
        has_media = any(os.path.exists(os.path.join(folder, x)) for x in ('video.mp4', 'slide-01.png', 'slide-01.mp4', 'image.png'))
        posted = sum(r['posted'] for r in rows.values())
        upcoming = [r['next'] for r in rows.values() if r['next']]
        if m.get('status') == 'rejected': status = 'parked'
        elif posted: status = 'posted'
        elif upcoming: status = 'scheduled'
        elif has_media: status = 'review'
        else: status = 'scripting'
        slot = m.get('slot') or ''
        lastp = max([r['last'] for r in rows.values() if r['last']] or [''])
        variants = len(glob.glob(os.path.join(ROOT, 'content', '_trials', f'*{pid}*', 'v*.mp4')))
        docs[pid] = {
            'title': title_of(pid), 'pid': pid, 'week': os.path.basename(os.path.dirname(folder)),
            'row': home, 'lane': lane(pid, m.get('format')), 'format': m.get('format', ''),
            'status': status, 'slot': slot, 'lastPosted': lastp, 'nextPost': min(upcoming) if upcoming else '',
            'keyword': m.get('cta_keyword') or '', 'caption': caption(folder), 'variants': variants,
            'channels': {k: {'posts': v['n'], 'trials': v['trial'], 'posted': v['posted']} for k, v in rows.items()},
            'folder': os.path.relpath(folder, ROOT), 'source': 'repo',
        }
    return docs


def signals():
    files = sorted(glob.glob(os.path.join(ROOT, 'research', 'daily', '*.md')))[-3:]
    docs = {}
    for f in files:
        day = os.path.basename(f)[:-3]
        t = open(f, encoding='utf8').read()
        hot = re.search(r'## Hot today\s*\n(.*?)(\n## |\Z)', t, re.S)
        hot_txt = hot.group(1) if hot else ''
        for i, m in enumerate(re.finditer(r'^## (\d+)\. (.+)$', t, re.M), 1):
            head = m.group(2).strip()
            body = t[m.end():].split('\n## ', 1)[0]
            url = re.search(r'https?://[^\s)\]>]+', body)
            sm = re.search(r'^- Summary:\s*(.+)$', body, re.M)
            why = re.search(r'^- Why operators should care:\s*(.+)$', body, re.M)
            first = sm.group(1).strip() if sm else ''
            docs[f'{day}-{i}'] = {
                'date': day, 'headline': head, 'summary': first[:420], 'why': (why.group(1).strip() if why else '')[:300],
                'url': url.group(0) if url else '', 'hot': f'(item {i})' in hot_txt, 'rank': i,
            }
    return docs


SEED_IDEAS = [
    ('Gemini Tasks is free now (ui-reel pilot)', 'ig-ai', 'news', 'Google just made Gemini Tasks free and this is big news', 'research/daily 2026-11-26'),
    ('AI shopping agents on Black Friday: who is liable?', 'li-co', 'news', 'The AI bought it. The customer is angry. Whose fault is it?', 'research/daily 2026-11-26'),
    ('Instagram text-prompt Story effects', 'ig-ai', 'news', 'Instagram just let you build AR effects by typing', 'research/daily 2026-11-26'),
    ('Who signs off when the AI is wrong?', 'li-sanjana', 'linkedin', 'Most AI rollouts fail on 1 question nobody says out loud', 'Sanjana draft 1'),
    ('Aparigraha: the yoga word for AI overwhelm', 'li-sanjana', 'linkedin', 'I come from a line of yoga teachers', 'Sanjana draft 2 (carousel, her photos)'),
    ('Why AI pilots stall: 4 things ops leaders tell me', 'li-sanjana', 'linkedin', 'Same 4 things every time', 'Sanjana draft 3'),
    ('"You have a follow-up problem, not a sales problem"', 'li-sanjana', 'linkedin', 'A mentor said something last Tuesday', 'Sanjana draft 4'),
    ('Achilles to pro football: the 50 kg comeback', 'li-korede', 'linkedin', 'People called it a career-ending injury', 'LinkedIn plan 2026-10-28'),
    ('Amazon driver to CTO', 'li-korede', 'linkedin', 'The van taught me more about ops than any course', 'LinkedIn plan 2026-10-28'),
    ('Freight brokers: margin leaks through touches per load', 'li-korede', 'linkedin', 'Most brokers know margin per load. Few know touches per load.', 'LinkedIn plan 2026-10-28'),
    ('Print every ChatGPT answer from 1 day (what-if)', 'ig-ai', 'whatif', 'What if you printed every ChatGPT answer from 1 day?', 'Rendered stills, needs ~$14 kie'),
    ('NYC to London by jumping (physics what-if)', 'ig-kk', 'whatif', 'What would happen if you jumped from NYC to London?', 'Rendered stills, needs ~$14 kie'),
]

SEED_ASKS = [
    ('Reconnect Schedchie in claude.ai connector settings', 'korede', 'Nothing can post until this is done.'),
    ('Record the new clone footage (9:16, chest up, desk, ~2 min)', 'korede', 'For the face slots in the new @koredekola.ai reels.'),
    ('Pick Sanjana’s Instagram: @growwithsanj or @sanjana_dave', 'sanjana', ''),
    ('Send 10 to 20 photos of Sanjana', 'sanjana', 'Teaching, working, travelling, a few clean headshots.'),
    ('Approve or edit Sanjana’s 4 LinkedIn tone drafts', 'sanjana', 'content/linkedin-v2/sanjana/drafts-week1.md'),
    ('Connect Sanjana’s TikTok in Schedchie', 'sanjana', ''),
    ('Confirm Korede’s LinkedIn pillars (ops, football, technical, founder)', 'korede', 'research/linkedin-strategy-v2.md'),
    ('Top up kie by ~$14.40 for the 3 blocked reels', 'korede', 'print-ChatGPT, NYC to London, twice as rich'),
]


def write(coll, did, data):
    d = os.path.join(OUT, coll)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, did + '.json')
    json.dump(data, open(p, 'w'), ensure_ascii=False)
    return {'collection': coll, 'doc_id': did, 'file_path': p}


def main():
    seed = '--seed' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    man = []
    for pid, d in posts(load_logs()).items(): man.append(write('posts', pid, d))
    for sid, d in signals().items(): man.append(write('signals', sid, d))
    man.append(write('meta', 'sync', {'at': NOW.isoformat(timespec='seconds'), 'by': 'Claude'}))
    if seed:
        stamp = NOW.isoformat(timespec='seconds')
        for i, (t, row, ln, hook, src) in enumerate(SEED_IDEAS, 1):
            man.append(write('ideas', f'seed-{i:02d}', {'title': t, 'row': row, 'lane': ln, 'hook': hook, 'source': src, 'slot': '', 'createdAt': stamp, 'createdBy': ''}))
        for i, (t, who, note) in enumerate(SEED_ASKS, 1):
            man.append(write('asks', f'ask-{i:02d}', {'title': t, 'who': who, 'note': note, 'done': False, 'order': i}))
    json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    by = {}
    for x in man: by[x['collection']] = by.get(x['collection'], 0) + 1
    print(json.dumps(by))


if __name__ == '__main__':
    main()
