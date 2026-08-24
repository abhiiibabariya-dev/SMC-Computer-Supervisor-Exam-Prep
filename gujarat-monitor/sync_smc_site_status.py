#!/usr/bin/env python3
import concurrent.futures
import json, re, ssl
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "gujarat-monitor" / "smc-status.json"
UA = "Mozilla/5.0 SMC-Exam-Prep-Live-Status/3.3"
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
    last_error = None
    for _ in range(2):
        try:
            with urlopen(req, timeout=20, context=CTX) as r:
                return r.read().decode("utf-8", errors="ignore")
        except Exception as e:
            last_error = e
    raise last_error


def clean(s):
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def ascii_digits(s):
    table = str.maketrans("૦૧૨૩૪૫૬૭૮૯", "0123456789")
    return s.translate(table)


def fetch_one(url):
    try:
        return url, clean(fetch(url)), None
    except Exception as e:
        return url, "", str(e)


def semantic_equal(a, b):
    if not isinstance(a, dict) or not isinstance(b, dict):
        return a == b
    ignored = {"updated_at"}
    return {k: v for k, v in a.items() if k not in ignored} == {k: v for k, v in b.items() if k not in ignored}


pages, errors = [], []
with concurrent.futures.ThreadPoolExecutor(max_workers=len(URLS)) as pool:
    results = list(pool.map(fetch_one, URLS))
for u, text, error in results:
    if error:
        errors.append({"url": u, "error": error})
    else:
        pages.append((u, text))

errors.sort(key=lambda x: (x["url"], x["error"]))
page_text = {u: t for u, t in pages}
news_text = page_text.get(URLS[0], "")
answer_text = page_text.get(URLS[1], "")
result_text = page_text.get(URLS[3], "")
selection_text = page_text.get(URLS[4], "")
all_text = " ".join(page_text.values())
news_norm = ascii_digits(news_text)
answer_norm = ascii_digits(answer_text)
all_norm = ascii_digits(all_text)

events = []


def add_event(event_id, date, status, title, cadres, source=URLS[0]):
    events.append({"id": event_id, "date": date, "status": status, "title": title, "cadres": cadres, "source": source})


if re.search(r"12\s*/\s*07\s*/\s*2026", answer_norm, re.I) and re.search(r"public\s+relation\s+officer|જનસંપર્ક અધિકારી", answer_text, re.I):
    add_event("smc-2026-07-12-pro", "2026-07-12", "completed", "Public Relation Officer written examination", ["Public Relation Officer", "PRO"], URLS[1])

computer_supervisor_notice = re.search(
    r"(?:06\s*/\s*09\s*/\s*2026|06\s*-\s*09\s*-\s*2026|06\s*\.\s*09\s*\.\s*2026|6\s+September\s+2026)"
    r".{0,900}(?:supervisor\s*\(\s*computer\s*\)|computer\s+supervisor|સુપરવાઈઝર\s*\(\s*કોમ્પ્યુટર\s*\))",
    news_norm,
    re.I,
) or re.search(
    r"(?:supervisor\s*\(\s*computer\s*\)|computer\s+supervisor|સુપરવાઈઝર\s*\(\s*કોમ્પ્યુટર\s*\))"
    r".{0,900}(?:06\s*/\s*09\s*/\s*2026|06\s*-\s*09\s*-\s*2026|06\s*\.\s*09\s*\.\s*2026|6\s+September\s+2026)",
    news_norm,
    re.I,
)
if computer_supervisor_notice:
    add_event(
        "smc-2026-09-06-computer-supervisor",
        "2026-09-06",
        "scheduled",
        "Supervisor (Computer) written examination",
        ["Supervisor (Computer)", "Junior Pharmacist", "Assistant Auditor", "Technical Officer"],
        URLS[0],
    )

if re.search(r"26\s*/\s*07\s*/\s*2026", news_norm, re.I) and re.search(r"મુલતવી|postponed", news_text, re.I):
    add_event("smc-2026-07-26-postponed", "2026-07-26", "postponed", "Written examination postponed", ["Laboratory Technician", "Third Class Clerk (Audit)", "Pharmacist (GUHP)"], URLS[0])

answer_key_available = bool(re.search(r"provisional\s+answer\s+key|final\s+answer\s+key|answer\s+key", answer_text, re.I))
result_available = bool(re.search(r"(result|પરિણામ).{0,180}(download|post|exam|merit|selection)", result_text, re.I))
selection_available = bool(re.search(r"(selection|waiting\s+list|પસંદગી).{0,180}(download|post|cadre)", selection_text, re.I))
application_deadline = "2026-04-15" if re.search(r"15\s*(?:/|-|\.)\s*04\s*(?:/|-|\.)\s*2026|15\s+April\s+2026|15/04/2026", all_norm, re.I) else None

now = datetime.now(timezone.utc)
status = {
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

try:
    old = json.loads(OUT.read_text(encoding="utf-8"))
except Exception:
    old = {}

status["updated_at"] = old.get("updated_at", now.isoformat()) if semantic_equal(status, old) else now.isoformat()
OUT.write_text(json.dumps(status, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(status, indent=2, ensure_ascii=False))
