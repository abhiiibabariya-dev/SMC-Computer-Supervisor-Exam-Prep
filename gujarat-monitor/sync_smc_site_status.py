#!/usr/bin/env python3
import json, re, ssl
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "gujarat-monitor" / "smc-status.json"
UA = "Mozilla/5.0 SMC-Exam-Prep-Live-Status/2.0"
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

all_text = " ".join(t for _, t in pages)

# Keep the important official notices as machine-readable events. These are
# intentionally post/cadre aware, so one cadre cannot change every site's status.
events = []

def add_event(event_id, date, status, title, cadres, keywords):
    if any(k.lower() in all_text.lower() for k in keywords):
        events.append({
            "id": event_id,
            "date": date,
            "status": status,
            "title": title,
            "cadres": cadres,
            "source": URLS[0]
        })

add_event(
    "smc-2026-07-12-pro",
    "2026-07-12",
    "completed",
    "Public Relation Officer written examination",
    ["Public Relation Officer", "PRO"],
    ["12/07/2026", "જનસંપર્ક અધિકારી"]
)
add_event(
    "smc-2026-07-26-postponed",
    "2026-07-26",
    "postponed",
    "Written examination postponed",
    ["Laboratory Technician", "Third Class Clerk (Audit)", "Pharmacist (GUHP)"],
    ["26/07/2026", "મુલતવી"]
)
add_event(
    "smc-2026-08-09",
    "2026-08-09",
    "scheduled",
    "Written examination date shown in official SMC notice",
    [],
    ["09/08/2026"]
)

# Fallback signals for future notices. Never mark a passed date as completed
# unless SMC provides an explicit result/answer-key/held signal.
answer_key_available = bool(re.search(r"answer\s*key|જવાબ|ઉત્તર કી", all_text, re.I))
result_available = bool(re.search(r"exam\s*result|result\s*|પરિણામ|પસંદગી|waiting list", all_text, re.I))

# Application status is not guessed from today's date. We only expose the
# known deadline if the official pages contain the corresponding 15 April date.
application_deadline = "2026-04-15" if re.search(r"15\s*(?:/|-|\.)\s*04\s*(?:/|-|\.)\s*2026|15\s+April\s+2026|15/04/2026", all_text, re.I) else None

now = datetime.now(timezone.utc)
status = {
    "updated_at": now.isoformat(),
    "official_sources": URLS,
    "events": events,
    "answer_key_available": answer_key_available,
    "result_available": result_available,
    "application_status": "closed" if application_deadline else "unknown",
    "application_deadline": application_deadline,
    "errors": errors,
    "source_health": {
        "sources_checked": len(URLS),
        "sources_ok": len(pages),
        "sources_failed": len(errors)
    }
}

# A global exam date is deliberately omitted. The site must use event/cadre
# status instead of turning every post into the same status.
OUT.write_text(json.dumps(status, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(status, indent=2, ensure_ascii=False))
