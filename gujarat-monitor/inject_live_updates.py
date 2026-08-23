#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
STATUS = ROOT / "gujarat-monitor" / "smc-status.json"
SCRIPT = "auto-live-jobs.js"
VERSION = "20260823-1"
TAG = f'<script src="/SMC-Computer-Supervisor-Exam-Prep/auto-live-jobs.js?v={VERSION}" defer></script>'
OLD_TAG_RE = r'<script\s+src="(?:/SMC-Computer-Supervisor-Exam-Prep/)?auto-live-jobs\.js(?:\?[^" ]*)?"[^>]*></script>'

try:
    status = json.loads(STATUS.read_text(encoding="utf-8"))
except Exception:
    status = {}

events = status.get("events", [])

def has_event(event_id):
    return any(e.get("id") == event_id for e in events)

pro_done = has_event("smc-2026-07-12-pro")
july26_postponed = has_event("smc-2026-07-26-postponed")
app_closed = status.get("application_status") == "closed"

changed = 0
injected = 0
scanned = 0

for path in DOCS.rglob("*.html"):
    if not path.is_file() or path.name.lower().endswith('.backup.html'):
        continue
    scanned += 1
    text = path.read_text(encoding="utf-8", errors="ignore")
    original = text

    text = re.sub(OLD_TAG_RE, TAG, text, flags=re.I)

    if pro_done:
        replacements = [
            (r"a\s+live\s+countdown\s+to\s+the\s+12\s+July\s+2026\s+exam", "official post-exam updates, answer keys and results"),
            (r"live\s+countdown\s+to\s+12\s+July\s+2026", "official post-exam updates, answer keys and results"),
            (r"countdown\s+to\s+the\s+12\s+July\s+2026\s+exam", "post-exam updates after 12 July 2026"),
            (r"Final\s+revision\s+time\s+is\s+NOW!", "Exam completed. Track official answer key, result and selection updates."),
            (r"NOW\s*[—-]\s*Exam\s+Prep", "NOW — Answer Key & Result Tracking"),
            (r"Before\s+12\s+July\s+2026", "Post-exam status"),
            (r"Final\s+revision\s+phase\.\s*Practice\s+mock\s+tests\s*&\s*daily\s+MCQs\.", "Post-exam tracking phase. Follow official answer key, result and merit updates."),
            (r"EXAM\s+DATE\s+OUT\s*[—-]\s*Written\s+Exam\s+on\s+12\s+July\s+2026!", "PRO EXAM COMPLETED — 12 JULY 2026"),
            (r"EXAM\s+12\s+JUL\s+CALL\s+LETTER\s+SOON", "PRO EXAM COMPLETED — ANSWER KEY / RESULT TRACKING"),
            (r"EXAM\s+ON\s+12\s+JULY\s+2026\s*[—-]\s*Final\s+Revision\s+Time!", "PRO EXAM COMPLETED — 12 JULY 2026"),
            (r"EXAM\s+ON\s+12\s+JULY\s+2026", "PRO EXAM COMPLETED — 12 JULY 2026"),
        ]
        for pattern, repl in replacements:
            text = re.sub(pattern, repl, text, flags=re.I)
        text = re.sub(r"SMC written exam scheduled for\s*12\s*July\s*2026[^<.]*\.", "SMC: Public Relation Officer written examination was held on 12 July 2026. Other cadres follow their own official SMC notices.", text, flags=re.I)
        text = re.sub(r"A live countdown switches on here the moment SMC announces the date\.\s*Until then[^<.]*\.", "The PRO exam was held on 12 July 2026. Track official answer key, result and selection updates here.", text, flags=re.I)
        text = re.sub(r"Written Exam:\s*To Be Announced", "Written Exam: PRO held 12 July 2026", text, flags=re.I)
        text = re.sub(r"Admit Card:\s*Coming Soon", "Admit Card: Check official SMC notices", text, flags=re.I)
        text = re.sub(r'"name":\s*"SMC Computer Supervisor / Clerk Exam 2026"', '"name": "SMC Public Relation Officer Written Examination 2026"', text, flags=re.I)
        text = re.sub(r'"description":\s*"Written examination for SMC 2026 posts \(Clerk, Staff Nurse, Driver, PRO\)\."', '"description": "SMC Public Relation Officer written examination held on 12 July 2026. Other cadres have separate official schedules and notices."', text, flags=re.I)

    if app_closed:
        text = re.sub(r"Applications\s+Closed\s*[—-]\s*15\s*April\s*2026", "Applications Closed", text, flags=re.I)
        text = re.sub(r"Application Deadline\s*:\s*15\s*April\s*2026", "Applications Closed", text, flags=re.I)

    if july26_postponed:
        text = re.sub(r"26\s*July\s*2026[^<]{0,180}(?:scheduled|written exam|exam date)", lambda m: m.group(0) + " — SMC POSTPONED NOTICE EXISTS; CHECK OFFICIAL NOTICE", text, flags=re.I)

    if SCRIPT not in text:
        pos = text.lower().rfind("</head>")
        if pos >= 0:
            text = text[:pos] + "    " + TAG + "\n" + text[pos:]
            injected += 1

    if text != original:
        path.write_text(text, encoding="utf-8")
        changed += 1

print(f"HTML pages scanned: {scanned}")
print(f"HTML pages changed: {changed}")
print(f"Live script injected/updated: {injected}")
