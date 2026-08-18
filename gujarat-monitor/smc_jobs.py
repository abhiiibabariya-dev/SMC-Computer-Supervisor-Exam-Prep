#!/usr/bin/env python3
import concurrent.futures
import hashlib
import html as html_lib
import json
import re
import ssl
import time
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

UA = "Mozilla/5.0 (X11; Linux x86_64) Gujarat-Govt-Job-Monitor/5.0"
TIMEOUT = 10
RETRIES = 3
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
DISCOVERY_TERMS = ("recruitment", "vacancy", "vacancies", "job", "jobs", "exam", "admit card", "answer key", "result", "selection", "notification")
CURRENT_YEARS = {str(datetime.now(timezone.utc).year), str(datetime.now(timezone.utc).year + 1)}


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
    last_error = None
    for attempt in range(1, RETRIES + 1):
        try:
            with urlopen(req, timeout=TIMEOUT) as r:
                return r.status, r.read(), r.geturl()
        except Exception as e:
            last_error = e
            if attempt < RETRIES:
                time.sleep(attempt)
                try:
                    with urlopen(req, timeout=TIMEOUT, context=SSL_FALLBACK) as r:
                        return r.status, r.read(), r.geturl()
                except Exception as e2:
                    last_error = e2
                    time.sleep(attempt)
    raise last_error


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
        title_l = title.lower()
        if not any(k in title_l for k in DISCOVERY_TERMS):
            return False
        # Discovery feeds are noisy. Keep current/future recruitment information,
        # but reject old articles such as 2019/2021 jobs that otherwise look relevant.
        years = re.findall(r"\b20\d{2}\b", title_l)
        if years and not any(y in CURRENT_YEARS for y in years):
            return False
        name = src.get("name", "").lower()
        if "smc" in name:
            return any(k in title_l for k in ("surat municipal", "smc", "surat municipal corporation"))
        return any(k in title_l for k in ("gujarat", "ojas", "gpsc", "gsssb", "gpssb", "government recruitment"))
    return any(k in text for k in KEYWORDS)


def is_smc(name, url, title, src):
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
        checked = datetime.now(timezone.utc).isoformat()
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
                "checked_at": checked
            })
        if not is_discovery(src) and (relevant(name, base_url, src) or relevant(source_text[:5000], base_url, src)):
            found.append({
                "id": make_id(name, final_url, name),
                "source": name,
                "title": f"{name} official recruitment/update page",
                "url": final_url,
                "priority": priority(name, final_url, name, src),
                "source_type": src.get("type", "government"),
                "checked_at": checked
            })
        return {"source": name, "items": found, "error": None}
    except Exception as e:
        return {"source": name, "items": [], "error": {"source": name, "url": base_url, "error": str(e)}}


def merge_change_metadata(items, old_items, now):
    old_by_id = {x.get("id"): x for x in old_items if isinstance(x, dict) and x.get("id")}
    changed = 0
    new_count = 0
    for item in items:
        old = old_by_id.get(item.get("id"))
        if not old:
            item["first_seen_at"] = now
            item["last_changed_at"] = now
            item["change_type"] = "new"
            new_count += 1
            continue
        item["first_seen_at"] = old.get("first_seen_at", old.get("checked_at", now))
        comparable = (old.get("title"), old.get("url"), old.get("priority"), old.get("source"), old.get("source_type"))
        current = (item.get("title"), item.get("url"), item.get("priority"), item.get("source"), item.get("source_type"))
        if comparable != current:
            item["last_changed_at"] = now
            item["change_type"] = "updated"
            changed += 1
        else:
            item["last_changed_at"] = old.get("last_changed_at", old.get("first_seen_at", now))
            item["change_type"] = "unchanged"
    return new_count, changed


def main():
    sources = load_json(SOURCES, {"sources": []}).get("sources", [])
    old_items = load_json(JOBS, [])
    if not isinstance(old_items, list):
        old_items = []

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(scan_source, src) for src in sources]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results.append(result)
            if result["error"]:
                print(f"[WARN] {result['source']} unavailable -> {result['error']['error']}")
            else:
                print(f"[OK] {result['source']} -> {len(result['items'])} relevant updates")

    found, errors = [], []
    for r in results:
        found.extend(r["items"])
        if r["error"]:
            errors.append(r["error"])

    unique = {item["id"]: item for item in found}
    all_jobs = list(unique.values())
    now = datetime.now(timezone.utc).isoformat()
    new_count, changed_count = merge_change_metadata(all_jobs, old_items, now)

    rank = {"critical": 0, "high": 1, "medium": 2}
    all_jobs.sort(key=lambda x: (rank.get(x.get("priority"), 9), x.get("last_changed_at", ""), x.get("source", "").lower(), x.get("title", "").lower()), reverse=True)

    smc_count = sum(1 for x in all_jobs if x.get("priority") == "critical")
    report = {
        "updated_at": now,
        "sources_scanned": len(sources),
        "links_found_this_scan": len(found),
        "new_items": new_count,
        "updated_items": changed_count,
        "total_items": len(all_jobs),
        "errors": errors,
        "smc_items": smc_count,
        "mode": "live_snapshot",
    }

    save_json(JOBS, all_jobs)
    save_json(PUBLIC, {"updated_at": now, "region": "Gujarat", "focus": "Gujarat Government Jobs and SMC Recruitment", "total": len(all_jobs), "new_items": new_count, "updated_items": changed_count, "items": all_jobs})
    save_json(STATE, {"last_run": now, "total_items": len(all_jobs), "new_items": new_count, "updated_items": changed_count, "errors": errors, "mode": "live_snapshot"})
    save_json(REPORT, report)

    print("\n==========================================")
    print(" Gujarat Government Job Monitor")
    print("==========================================")
    print(f"Sources scanned : {len(sources)}")
    print(f"Live items      : {len(all_jobs)}")
    print(f"New items       : {new_count}")
    print(f"Updated items   : {changed_count}")
    print(f"SMC priority    : {smc_count}")
    print(f"Warnings        : {len(errors)}")
    print("Mode            : LIVE SNAPSHOT")
    print("==========================================")


if __name__ == "__main__":
    main()
