#!/usr/bin/env python3
import json, re, ssl
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "gujarat-monitor" / "smc-status.json"
UA = "Mozilla/5.0 SMC-Exam-Prep-Live-Status/1.0"
CTX = ssl._create_unverified_context()
URLS = [
    "https://www.suratmunicipal.gov.in/Information/RecruitmentNews",
    "https://www.suratmunicipal.gov.in/Information/AnswerKey",
    "https://www.suratmunicipal.gov.in/Information/RecruitmentDashboard",
]

def fetch(url):
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-IN,en;q=0.9"})
    try:
        with urlopen(req, timeout=30) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception:
        with urlopen(req, timeout=30, context=CTX) as r:
            return r.read().decode("utf-8", errors="ignore")

def clean(s):
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s).strip()

pages = []
errors = []
for u in URLS:
    try:
        pages.append((u, clean(fetch(u))))
    except Exception as e:
        errors.append({"url": u, "error": str(e)})

all_text = " ".join(t for _, t in pages)
# Prefer a 2026 SMC written-exam date mentioned near the recruitment notice.
dates = re.findall(r"(?:exam|written examination|written exam).{0,180}?(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(2026)", all_text, flags=re.I)
if not dates:
    dates = re.findall(r"(?:exam|written examination|written exam).{0,180}?(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(2026)", all_text, flags=re.I)

exam_date = None
for d in dates:
    try:
        if len(d[1]) <= 2:
            exam_date = datetime.strptime(f"{d[0]}/{d[1]}/{d[2]}", "%d/%m/%Y").date().isoformat()
        else:
            exam_date = datetime.strptime(f"{d[0]} {d[1]} {d[2]}", "%d %B %Y").date().isoformat()
        break
    except ValueError:
        pass

# The official Answer Key page is the strongest signal that the written exam has occurred.
answer_key_live = bool(re.search(r"provisional answer key.*written examination|exam dated 12/07/2026.*answer key|answer key.*12/07/2026", all_text, re.I))
today = datetime.now(timezone.utc).date()
exam_completed = bool(exam_date and datetime.fromisoformat(exam_date).date() < today)
if answer_key_live:
    exam_completed = True

status = {
    "updated_at": datetime.now(timezone.utc).isoformat(),
    "official_sources": URLS,
    "exam_date": exam_date,
    "exam_completed": exam_completed,
    "answer_key_available": answer_key_live,
    "application_status": "closed",
    "application_deadline": "2026-04-15",
    "errors": errors,
}
OUT.write_text(json.dumps(status, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(status, indent=2, ensure_ascii=False))
