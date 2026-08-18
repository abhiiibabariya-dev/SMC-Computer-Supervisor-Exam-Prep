import json
import hashlib
import os
import urllib.request
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.abspath(__file__))
SOURCES = os.path.join(BASE, "sources.json")
STATE = os.path.join(BASE, "state.json")
REPORT = os.path.join(BASE, "report.json")

with open(SOURCES, "r", encoding="utf-8") as f:
    sources = json.load(f)["sources"]

try:
    with open(STATE, "r", encoding="utf-8") as f:
        old_state = json.load(f)
except FileNotFoundError:
    old_state = {}

new_state = {}
changes = []

for source in sources:
    name = source["name"]
    url = source["url"]

    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 Gujarat-Exam-Monitor/1.0"
            }
        )

        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read()
            status = response.status

        digest = hashlib.sha256(content).hexdigest()
        previous = old_state.get(name, {}).get("hash")

        new_state[name] = {
            "url": url,
            "status": status,
            "hash": digest,
            "checked_at": datetime.now(timezone.utc).isoformat()
        }

        if previous is None:
            changes.append({
                "source": name,
                "type": "initial_scan",
                "url": url
            })
        elif previous != digest:
            changes.append({
                "source": name,
                "type": "changed",
                "url": url
            })

        print(f"[OK] {name} -> HTTP {status}")

    except Exception as e:
        new_state[name] = {
            "url": url,
            "error": str(e),
            "checked_at": datetime.now(timezone.utc).isoformat()
        }

        changes.append({
            "source": name,
            "type": "error",
            "url": url,
            "error": str(e)
        })

        print(f"[ERROR] {name} -> {e}")

report = {
    "checked_at": datetime.now(timezone.utc).isoformat(),
    "sources_checked": len(sources),
    "changes": changes
}

with open(STATE, "w", encoding="utf-8") as f:
    json.dump(new_state, f, indent=2, ensure_ascii=False)

with open(REPORT, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

print()
print(f"Checked: {len(sources)} sources")
print(f"Changes: {len(changes)}")
print(f"Report: {REPORT}")
