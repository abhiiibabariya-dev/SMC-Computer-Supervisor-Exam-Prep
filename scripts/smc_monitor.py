#!/usr/bin/env python3

import hashlib
import json
import os
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen

SOURCES = {
    "SMC Home": "https://www.suratmunicipal.gov.in/",
    "SMC Recruitment": "https://www.suratmunicipal.gov.in/Information/Recruitment",
    "SMC Recruitment News": "https://www.suratmunicipal.gov.in/Information/RecruitmentNews",
    "SMC Recruitment Dashboard": "https://www.suratmunicipal.gov.in/Information/RecruitmentDashboard",
}

STATE_FILE = Path(".smc-monitor/state.json")
REPORT_FILE = Path(".smc-monitor/report.json")


def fetch(url):
    req = Request(
        url,
        headers={
            "User-Agent": "SMC-Exam-Prep-Monitor/1.0"
        },
    )

    with urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8", errors="ignore")


def clean_html(html):
    html = re.sub(r"<script\b[^>]*>.*?</script>", " ", html, flags=re.I | re.S)
    html = re.sub(r"<style\b[^>]*>.*?</style>", " ", html, flags=re.I | re.S)
    html = re.sub(r"<[^>]+>", " ", html)
    html = re.sub(r"\s+", " ", html)
    return html.strip()


def fingerprint(html):
    text = clean_html(html)

    # Remove changing visitor-count / timestamp noise where possible.
    text = re.sub(
        r"Visitor Count\s+\d+",
        "Visitor Count",
        text,
        flags=re.I,
    )

    text = re.sub(
        r"Last Updated:\s+[^|]+",
        "Last Updated",
        text,
        flags=re.I,
    )

    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_state():
    if not STATE_FILE.exists():
        return {}

    try:
        return json.loads(STATE_FILE.read_text())
    except Exception:
        return {}


def main():
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

    old_state = load_state()
    new_state = {}
    changes = []

    for name, url in SOURCES.items():
        try:
            html = fetch(url)
            current_hash = fingerprint(html)

            new_state[name] = {
                "url": url,
                "hash": current_hash,
            }

            old_hash = old_state.get(name, {}).get("hash")

            if old_hash is None:
                changes.append({
                    "type": "initial",
                    "name": name,
                    "url": url,
                })
            elif old_hash != current_hash:
                changes.append({
                    "type": "changed",
                    "name": name,
                    "url": url,
                })

            print(f"[OK] {name}")

        except Exception as exc:
            print(f"[ERROR] {name}: {exc}")

    STATE_FILE.write_text(
        json.dumps(new_state, indent=2),
        encoding="utf-8",
    )

    report = {
        "changes": changes,
        "sources_checked": len(SOURCES),
    }

    REPORT_FILE.write_text(
        json.dumps(report, indent=2),
        encoding="utf-8",
    )

    print()
    print(f"Sources checked: {len(SOURCES)}")
    print(f"Changes detected: {len(changes)}")

    if changes:
        for change in changes:
            print(
                f"[CHANGE] {change['name']} -> {change['url']}"
            )
    else:
        print("[OK] No meaningful source changes detected.")


if __name__ == "__main__":
    main()
