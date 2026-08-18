#!/usr/bin/env python3
import concurrent.futures
import hashlib
import html as html_lib
import json
import re
import ssl
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
SOURCES = BASE / "sources.json"
JOBS = BASE / "jobs.json"
STATE = BASE / "jobs_state.json"
PUBLIC = ROOT / "gujarat-jobs.json"
REPORT = BASE / "jobs_report.json"

UA = "Mozilla/5.0 (X11; Linux x86_64) Gujarat-Govt-Job-Monitor/4.0"
TIMEOUT = 12
SSL_FALLBACK = ssl._create_unverified_context()

KEYWORDS = [
    "recruitment", "vacancy", "vacancies", "job", "jobs", "advertisement",
    "notification", "bharti", " ભરતી", "career", "apply online", "application",
    "exam", "call letter", "admit card", "answer key", "result", "merit",
    "selection", "provisional", "corrigendum", "computer supervisor", "supervisor",
    "clerk", "driver", "staff nurse", "engineer", "technician", "assistant",
    "officer", "teacher", "police", "constable", "forest guard", "apprentice",
    "laboratory", "lab technician", "pharmacist", "m phw", "f hw", "talati",
    "junior clerk", "senior clerk"
]
SMC_TERMS = ("surat municipal", "suratmunicipal.gov.in", "computer supervisor", "smc")
DISCOVERY_TERMS = ("recruitment", "vacancy", "vacancies", "job", "jobs", "exam", "admit card", "answer key", "result", "selection", "notification")


def load_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


def fetch(url):
    req = Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml,application/rss+xml,text/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,gu;q=0.8"
    })
    try:
        with urlopen(req, timeout=TIMEOUT) as r:
            return r.status, r.read(), r.geturl()
    except Exception:
        with urlopen(req, timeout=TIMEOUT, context=SSL_FALLBACK) as r:
            return r.status, r.read(), r.geturl()


def clean(text):
    text = html_lib.unescape(text or "")
    text = re.sub(r"<script.*?</script>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def links(document, base_url):
    result = []
    for m in re.finditer(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', document, re.I | re.S):
        href, title = html_lib.unescape(m.group(1).strip()), clean(m.group(2))
        if href and not href.startswith(("#", "javascript:", "mailto:", "tel:")):
            result.append((urljoin(base_url, href), title))
    for m in re.finditer(r'<item\b.*?<title[^>]*>(.*?)</title>.*?<link[^>]*>(.*?)</link>', document, re.I | re.S):
        result.append((html_lib.unescape(clean(m.group(2))), clean(m.group(1))))
    for m in re.finditer(r'<entry\b.*?<title[^>]*>(.*?)</title>.*?<link[^>]+href=["\']([^"\']+)["\']', document, re.I | re.S):
        result.append((urljoin(base_url, html_lib.unescape(m.group(2).strip())), clean(m.group(1))))
    seen, out = set(), []
    for u, title in result:
        key = (u, title)
        if u and key not in seen:
            seen.add(key)
            out.append((u, title))
    return out


def is_discovery(src):
    return str(src.get("type", "")).lower() == "discovery"


def relevant(title, url, src):
    text = f"{title} {url}".lower()
    if is_discovery(src):
        # Google News query URLs contain generic keywords, so NEVER use the
        # query itself to qualify an article. The article title must qualify.
        title_l = title.lower()
        if not any(k in title_l for k in DISCOVERY_TERMS):
            return False
        name = src.get("name", "").lower()
        if "smc" in name:
            return any(k in title_l for k in ("surat municipal", "smc", "surat municipal corporation"))
        return any(k in title_l for k in ("gujarat", "ojas", "gpsc", "gsssb", "gpssb", "government recruitment"))
    return any(k in text for k in KEYWORDS)


def is_smc(name, url, title, src):
    # Only official SMC sources or an article whose TITLE explicitly identifies
    # SMC count as SMC priority. The source name alone is not trusted.
    text = f"{url} {title}".lower()
    if "suratmunicipal.gov.in" in text or "surat municipal corporation" in text or "computer supervisor" in text:
        return True
    if is_discovery(src):
        return bool(re.search(r"\bsmc\b|surat municipal corporation", title, re.I))
    return "smc official" in name.lower() and "suratmunicipal.gov.in" in url.lower()


def priority(name, url, title, src):
    if is_smc(name, url, title, src):
        return "critical"
    s = f"{name} {url} {title}".lower()
    if any(x in s for x in ("gpsc", "gsssb", "gpssb", "ojas")):
        return "high"
    if src.get("type") in ("government", "municipal") or any(x in s for x in ("gov.in", "nic.in", "municipal")):
        return "high"
    return "medium"


def make_id(source, url, title):
    return hashlib.sha256(f"{source}|{url}|{title}".encode()).hexdigest()[:20]


def scan_source(src):
    name = src.get("name", "Unknown")
    base_url = src.get("url", "")
    found, seen = [], set()
    try:
        status, body, final_url = fetch(base_url)
        document = body.decode("utf-8", errors="ignore")
        source_text = clean(document)
        for u, title in links(document, final_url):
            if not relevant(title, u, src):
                continue
            key = (name, u, title)
            if key in seen:
                continue
            seen.add(key)
            found.append({
                "id": make_id(name, u, title),
                "source": name,
                "title": (title or u)[:300],
                "url": u,
                "priority": priority(name, u, title, src),
                "source_type": src.get("type", "government"),
                "checked_at": datetime.now(timezone.utc).isoformat()
            })
        # Keep one official source card, but don't manufacture a discovery item.
        if not is_discovery(src) and (relevant(name, base_url, src) or relevant(source_text[:5000], base_url, src)):
            found.append({
                "id": make_id(name, final_url, name),
                "source": name,
                "title": f"{name} official recruitment/update page",
                "url": final_url,
                "priority": priority(name, final_url, name, src),
                "source_type": src.get("type", "government"),
                "checked_at": datetime.now(timezone.utc).isoformat()
            })
        return {"source": name, "items": found, "error": None}
    except Exception as e:
        return {"source": name, "items": [], "error": {"source": name, "url": base_url, "error": str(e)}}


def main():
    sources = load_json(SOURCES, {"sources": []}).get("sources", [])
    results = []
    # Parallel fetching prevents one slow government server from blocking the
    # entire live update cycle.
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(scan_source, src) for src in sources]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results.append(result)
            if result["error"]:
                print(f"[ERROR] {result['source']} -> {result['error']['error']}")
            else:
                print(f"[OK] {result['source']} -> {len(result['items'])} relevant updates")

    found, errors = [], []
    for r in results:
        found.extend(r["items"])
        if r["error"]:
            errors.append(r["error"])

    # IMPORTANT: this is a LIVE snapshot. Do not merge old records forever.
    # Old Google News articles and expired notices therefore disappear on the
    # next successful scan instead of remaining on the site indefinitely.
    unique = {}
    for item in found:
        unique[item["id"]] = item
    all_jobs = list(unique.values())
    rank = {"critical": 0, "high": 1, "medium": 2}
    all_jobs.sort(key=lambda x: (rank.get(x.get("priority"), 9), x.get("source", "").lower(), x.get("title", "").lower()))

    now = datetime.now(timezone.utc).isoformat()
    smc_count = sum(1 for x in all_jobs if x.get("priority") == "critical")
    report = {
        "updated_at": now,
        "sources_scanned": len(sources),
        "links_found_this_scan": len(found),
        "new_items": len(all_jobs),
        "total_items": len(all_jobs),
        "errors": errors,
        "smc_items": smc_count,
        "mode": "live_snapshot",
    }

    save_json(JOBS, all_jobs)
    save_json(PUBLIC, {"updated_at": now, "region": "Gujarat", "focus": "Gujarat Government Jobs and SMC Recruitment", "total": len(all_jobs), "items": all_jobs})
    save_json(STATE, {"last_run": now, "total_items": len(all_jobs), "new_items": len(all_jobs), "errors": errors, "mode": "live_snapshot"})
    save_json(REPORT, report)

    print("\n==========================================")
    print(" Gujarat Government Job Monitor")
    print("==========================================")
    print(f"Sources scanned : {len(sources)}")
    print(f"Live items      : {len(all_jobs)}")
    print(f"SMC priority    : {smc_count}")
    print(f"Errors          : {len(errors)}")
    print("Mode            : LIVE SNAPSHOT")
    print(f"Data file       : {PUBLIC}")
    print("==========================================")


if __name__ == "__main__":
    main()
