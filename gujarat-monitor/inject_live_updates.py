#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
MARKER = 'auto-live-jobs.js'
TAG = '<script src="/SMC-Computer-Supervisor-Exam-Prep/auto-live-jobs.js" defer></script>'

changed = 0
scanned = 0

for path in DOCS.rglob('*.html'):
    if not path.is_file():
        continue
    scanned += 1
    text = path.read_text(encoding='utf-8', errors='ignore')
    if MARKER in text:
        continue
    lower = text.lower()
    pos = lower.rfind('</head>')
    if pos < 0:
        continue
    new_text = text[:pos] + '    ' + TAG + '\n' + text[pos:]
    path.write_text(new_text, encoding='utf-8')
    changed += 1

print(f'Live jobs script: scanned {scanned} HTML pages, injected {changed}.')
