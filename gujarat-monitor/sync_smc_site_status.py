#!/usr/bin/env python3
import json, re, ssl
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "gujarat-monitor" / "smc-status.json"
UA = "Mozilla/5.0 SMC-Exam-Prep-Live-Status/3.0"
CTX = ssl._create_unverified_context()
URLS = [
    "https://www.suratmunicipal.gov.in/Information/RecruitmentNews",
    "https://www.suratmunicipal.gov.in/Information/AnswerKey",
    "https://www.suratmunicipal.gov.in/Information/RecruitmentDashboard",
    "https://www.suratmunicipal.gov.in/Information/RecruitmentResult",
    "https://www.suratmunicipal.gov.in/Information/SelectionWaitingList",
]

def fetch(url):
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-IN,en;q=0.9"})
    try:
        with urlopen(req, timeout=35) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception:
        with urlopen(req, timeout=35, context=CTX) as r:
            return r.read().decode("utf-8", errors="ignore")

def clean(s):
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s).strip()

pages, errors = [], []
for u in URLS:
    try:
        pages.append((u, clean(fetch(u))))
    except Exception as e:
        errors.append({"url": u, "error": str(e)})

page_text = {u: t for u, t in pages}
news_text = page_text.get(URLS[0], "")
answer_text = page_text.get(URLS[1], "")
result_text = page_text.get(URLS[3], "")
selection_text = page_text.get(URLS[4], "")
all_text = " ".join(page_text.values())

events = []

def add_event(event_id, date, status, title, cadres, source=URLS[0]):
    events.append({"id": event_id, "date": date, "status": status, "title": title, "cadres": cadres, "source": source})

# Explicit official signal: the Answer Key page lists the 12 July 2026 PRO
# provisional answer key. This is stronger than an old scheduled-date notice.
if re.search(r"12\s*/\s*07\s*/\s*2026", answer_text, re.I) and re.search(r"public\s+relation\s+officer|જનસંપર્ક અધિકારી", answer_text, re.I):
    add_event("smc-2026-07-12-pro", "2026-07-12", "completed", "Public Relation Officer written examination", ["Public Relation Officer", "PRO"], URLS[1])

# Explicit official postponement signal. Keep the cadre scope instead of
# incorrectly changing every SMC post to postponed.
if re.search(r"26\s*/\s*07\s*/\s*2026", news_text, re.I) and re.search(r"મુલતવી|postponed", news_text, re.I):
    add_event("smc-2026-07-26-postponed", "2026-07-26", "postponed", "Written examination postponed", ["Laboratory Technician", "Third Class Clerk (Audit)", "Pharmacist (GUHP)"], URLS[0])

# Do not label any other passed/future date as scheduled/completed merely
# because an old notice still contains it. New notices are surfaced by the
# jobs monitor and can be promoted to an event once an explicit status signal
# is present.

answer_key_available = bool(re.search(r"provisional\s+answer\s+key|final\s+answer\s+key|answer\s+key", answer_text, re.I))
result_available = bool(re.search(r"(result|પરિણામ).{0,180}(download|post|exam|merit|selection)", result_text, re.I))
selection_available = bool(re.search(r"(selection|waiting\s+list|પસંદગી).{0,180}(download|post|cadre)", selection_text, re.I))

application_deadline = "2026-04-15" if re.search(r"15\s*(?:/|-|\.)\s*04\s*(?:/|-|\.)\s*2026|15\s+April\s+2026|15/04/2026", all_text, re.I) else None

now = datetime.now(timezone.utc)
status = {
    "updated_at": now.isoformat(),
    "official_sources": URLS,
    "events": events,
    "answer_key_available": answer_key_available,
    "result_available": result_available,
    "selection_waiting_list_available": selection_available,
    "application_status": "closed" if application_deadline else "unknown",
    "application_deadline": application_deadline,
    "errors": errors,
    "source_health": {"sources_checked": len(URLS), "sources_ok": len(pages), "sources_failed": len(errors)}
}

OUT.write_text(json.dumps(status, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(status, indent=2, ensure_ascii=False))
