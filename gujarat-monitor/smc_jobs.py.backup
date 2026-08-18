#!/usr/bin/env python3
import json, hashlib, re, ssl
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin
from datetime import datetime, timezone

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
SOURCES = BASE / "sources.json"
JOBS = BASE / "jobs.json"
STATE = BASE / "jobs_state.json"
PUBLIC = ROOT / "gujarat-jobs.json"

UA = "Mozilla/5.0 (X11; Linux x86_64) Gujarat-Govt-Job-Monitor/2.0"
TIMEOUT = 30

# Used only when a government server has a broken/expired local certificate.
# We still prefer normal certificate validation first.
SSL_FALLBACK = ssl._create_unverified_context()

KEYWORDS = [
    "recruitment", "vacancy", "vacancies", "job", "jobs",
    "advertisement", "notification", "bharti", " ભરતી",
    "career", "apply online", "application", "exam",
    "call letter", "admit card", "answer key", "result",
    "merit", "selection", "provisional", "corrigendum",
    "computer supervisor", "supervisor", "clerk", "driver",
    "staff nurse", "engineer", "technician", "assistant",
    "officer", "teacher", "police", "constable"
]

SMC_WORDS = [
    "surat municipal corporation",
    "smc",
    "suratmunicipal.gov.in",
    "computer supervisor"
]

def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    tmp.replace(path)

def fetch(url):
    req = Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,gu;q=0.8"
    })

    try:
        with urlopen(req, timeout=TIMEOUT) as r:
            return r.status, r.read(), r.geturl()
    except Exception:
        try:
            with urlopen(req, timeout=TIMEOUT, context=SSL_FALLBACK) as r:
                return r.status, r.read(), r.geturl()
        except Exception as e:
            raise e

def clean(text):
    text = re.sub(r"<script.*?</script>", " ", text, flags=re.I|re.S)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.I|re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;", " ", text, flags=re.I)
    text = re.sub(r"&amp;", "&", text, flags=re.I)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def links(html, base_url):
    result = []
    for m in re.finditer(
        r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        html,
        flags=re.I|re.S
    ):
        href = m.group(1).strip()
        title = clean(m.group(2))
        if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue
        result.append((urljoin(base_url, href), title))
    return result

def relevant(title, url):
    s = (title + " " + url).lower()
    return any(k.lower() in s for k in KEYWORDS)

def is_smc(name, url, title):
    s = f"{name} {url} {title}".lower()
    return any(k in s for k in SMC_WORDS)

def priority(name, url, title):
    if is_smc(name, url, title):
        return "critical"
    s = f"{name} {url} {title}".lower()
    if "gpsc" in s or "gsssb" in s or "gp ssb" in s or "ojas" in s:
        return "high"
    if "government" in s or "gov.in" in s or "nic.in" in s:
        return "high"
    return "medium"

def make_id(source, url, title):
    raw = f"{source}|{url}|{title}".encode()
    return hashlib.sha256(raw).hexdigest()[:20]

def main():
    data = load_json(SOURCES, {"sources": []})
    sources = data.get("sources", [])

    old = load_json(STATE, {})
    old_jobs = load_json(JOBS, [])

    found = []
    seen = set()
    errors = []

    for src in sources:
        name = src.get("name", "Unknown")
        base_url = src.get("url", "")

        try:
            status, body, final_url = fetch(base_url)

            # Decode as generously as possible.
            html = body.decode("utf-8", errors="ignore")

            candidates = links(html, final_url)

            # Also consider the source homepage itself.
            source_text = clean(html)

            local = []

            for u, title in candidates:
                if not relevant(title, u):
                    continue

                key = (name, u)
                if key in seen:
                    continue
                seen.add(key)

                item = {
                    "id": make_id(name, u, title),
                    "source": name,
                    "title": title[:300] if title else u,
                    "url": u,
                    "priority": priority(name, u, title),
                    "source_type": src.get("type", "government"),
                    "checked_at": datetime.now(timezone.utc).isoformat()
                }

                local.append(item)

            # If page itself strongly looks like recruitment, preserve it.
            if relevant(name, base_url) or relevant(source_text[:5000], base_url):
                item = {
                    "id": make_id(name, base_url, name),
                    "source": name,
                    "title": f"{name} official recruitment/update page",
                    "url": final_url,
                    "priority": priority(name, final_url, name),
                    "source_type": src.get("type", "government"),
                    "checked_at": datetime.now(timezone.utc).isoformat()
                }
                if item["id"] not in {x["id"] for x in local}:
                    local.append(item)

            found.extend(local)

            print(f"[OK] {name} -> {len(local)} relevant updates")

        except Exception as e:
            errors.append({
                "source": name,
                "url": base_url,
                "error": str(e)
            })
            print(f"[ERROR] {name} -> {e}")

    # Merge with previous records so jobs do not disappear simply because
    # a website temporarily fails or removes an old link.
    merged = {x.get("id"): x for x in old_jobs if x.get("id")}

    new_count = 0
    for item in found:
        if item["id"] not in merged:
            new_count += 1
        merged[item["id"]] = item

    all_jobs = list(merged.values())

    # SMC first, then priority, then source/title.
    rank = {"critical": 0, "high": 1, "medium": 2}
    all_jobs.sort(
        key=lambda x: (
            rank.get(x.get("priority"), 9),
            x.get("source", "").lower(),
            x.get("title", "").lower()
        )
    )

    now = datetime.now(timezone.utc).isoformat()

    report = {
        "updated_at": now,
        "sources_scanned": len(sources),
        "links_found_this_scan": len(found),
        "new_items": new_count,
        "total_items": len(all_jobs),
        "errors": errors,
        "smc_items": sum(
            1 for x in all_jobs
            if x.get("priority") == "critical"
        )
    }

    save_json(JOBS, all_jobs)

    # Public machine-readable data for the website.
    public_data = {
        "updated_at": now,
        "region": "Gujarat",
        "focus": "Gujarat Government Jobs and SMC Recruitment",
        "total": len(all_jobs),
        "items": all_jobs
    }

    save_json(PUBLIC, public_data)

    save_json(STATE, {
        "last_run": now,
        "total_items": len(all_jobs),
        "new_items": new_count,
        "errors": errors
    })

    save_json(BASE / "jobs_report.json", report)

    print()
    print("==========================================")
    print(" Gujarat Government Job Monitor")
    print("==========================================")
    print(f"Sources scanned : {len(sources)}")
    print(f"Found this scan : {len(found)}")
    print(f"New items       : {new_count}")
    print(f"Total saved     : {len(all_jobs)}")
    print(f"SMC priority    : {report['smc_items']}")
    print(f"Errors          : {len(errors)}")
    print(f"Data file       : {PUBLIC}")
    print("==========================================")

if __name__ == "__main__":
    main()
