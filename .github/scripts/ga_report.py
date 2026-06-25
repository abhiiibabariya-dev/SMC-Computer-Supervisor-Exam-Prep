#!/usr/bin/env python3
"""Build a Google Analytics (GA4) HTML panel (ga.html) for the daily email.

Reads the GA4 property via the Data API using a service-account key supplied
through GOOGLE_APPLICATION_CREDENTIALS. Property id comes from GA_PROPERTY_ID.
Any failure is non-fatal: the script prints the error and exits 0 without
writing ga.html, so the email simply omits the GA section.
"""
import os
import sys
import traceback


def main():
    prop = os.environ.get("GA_PROPERTY_ID", "").strip()
    if not prop:
        print("GA_PROPERTY_ID not set; skipping GA section.")
        return
    prop = prop.replace("properties/", "")

    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        RunReportRequest, DateRange, Metric, Dimension, OrderBy,
    )

    client = BetaAnalyticsDataClient()

    def run(dims, mets, start, end, limit=12, order_metric=None):
        order_bys = []
        if order_metric:
            order_bys = [OrderBy(
                metric=OrderBy.MetricOrderBy(metric_name=order_metric), desc=True)]
        req = RunReportRequest(
            property=f"properties/{prop}",
            dimensions=[Dimension(name=d) for d in dims],
            metrics=[Metric(name=m) for m in mets],
            date_ranges=[DateRange(start_date=start, end_date=end)],
            order_bys=order_bys,
            limit=limit,
        )
        return client.run_report(req)

    def totals(start, end):
        r = run([], ["activeUsers", "sessions", "screenPageViews",
                     "newUsers", "averageSessionDuration"], start, end, limit=1)
        if not r.rows:
            return {"users": 0, "sessions": 0, "views": 0, "new": 0, "dur": 0.0}
        v = r.rows[0].metric_values
        return {
            "users": int(float(v[0].value or 0)),
            "sessions": int(float(v[1].value or 0)),
            "views": int(float(v[2].value or 0)),
            "new": int(float(v[3].value or 0)),
            "dur": float(v[4].value or 0),
        }

    today = totals("today", "today")
    d7 = totals("7daysAgo", "today")
    d28 = totals("28daysAgo", "today")

    pages = run(["pagePath"], ["screenPageViews"], "28daysAgo", "today", 12, "screenPageViews")
    chans = run(["sessionDefaultChannelGroup"], ["sessions"], "28daysAgo", "today", 8, "sessions")
    devs = run(["deviceCategory"], ["sessions"], "28daysAgo", "today", 5, "sessions")
    ctry = run(["country"], ["activeUsers"], "28daysAgo", "today", 8, "activeUsers")

    def esc(s):
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def fmt_dur(sec):
        sec = int(sec)
        return f"{sec // 60}m {sec % 60}s"

    sp = "<td width='10'>&nbsp;</td>"

    def tile(val, label, color="#e5e7eb"):
        return (
            f"<td align='center' valign='top' style='background:#0f1626;border:1px solid "
            f"#1e293b;border-radius:10px;padding:14px 8px'><div style='font-size:24px;"
            f"font-weight:800;color:{color};font-family:Arial,sans-serif'>{val}</div>"
            f"<div style='font-size:11px;color:#94a3b8;text-transform:uppercase;"
            f"letter-spacing:.5px;font-family:Arial,sans-serif;margin-top:4px'>{label}</div></td>"
        )

    def rows_table(title, r, valcolor="#60a5fa"):
        h = [f"<div style='font-size:12px;color:#cbd5e1;font-weight:700;margin:16px 0 6px'>{title}</div>"]
        h.append("<table width='100%' cellpadding='6' cellspacing='0' "
                 "style='border-collapse:collapse;font-size:12px;color:#cbd5e1'>")
        if r.rows:
            for row in r.rows:
                k = esc(row.dimension_values[0].value) or "(not set)"
                v = row.metric_values[0].value
                try:
                    v = int(float(v))
                except (TypeError, ValueError):
                    pass
                h.append(
                    f"<tr style='border-bottom:1px solid #1e293b'><td>{k}</td>"
                    f"<td align='right' style='color:{valcolor};font-weight:700'>{v}</td></tr>")
        else:
            h.append("<tr><td style='color:#64748b'>No data in this window.</td></tr>")
        h.append("</table>")
        return "".join(h)

    out = []
    out.append("<div style='margin-top:22px;border:1px solid #1e3a8a;border-radius:12px;overflow:hidden'>")
    out.append("<div style='background:#1d4ed8;padding:10px 14px;font-size:13px;color:#dbeafe;"
               "font-weight:800'>\U0001F310 GOOGLE ANALYTICS (GA4) &mdash; last 28 days</div>")
    out.append("<div style='padding:14px'>")
    out.append("<table width='100%' cellpadding='0' cellspacing='0'><tr>")
    out.append(tile(d28['users'], "Active Users", "#60a5fa") + sp
               + tile(d28['sessions'], "Sessions") + sp
               + tile(d28['views'], "Page Views") + sp
               + tile(d28['new'], "New Users") + sp
               + tile(fmt_dur(d28['dur']), "Avg Session"))
    out.append("</tr></table>")
    out.append("<div style='font-size:11px;color:#94a3b8;margin:14px 0 6px;font-weight:700'>"
               "TODAY &amp; LAST 7 DAYS</div>")
    out.append("<table width='100%' cellpadding='0' cellspacing='0'><tr>")
    out.append(tile(today['users'], "Users Today", "#60a5fa") + sp
               + tile(today['views'], "Views Today") + sp
               + tile(d7['users'], "Users 7d") + sp
               + tile(d7['sessions'], "Sessions 7d") + sp
               + tile(d7['views'], "Views 7d"))
    out.append("</tr></table>")
    out.append(rows_table("\U0001F525 Top pages (GA4, by views)", pages))
    out.append(rows_table("\U0001F4C8 Traffic sources / channels", chans))
    out.append(rows_table("\U0001F4F1 Devices", devs))
    out.append(rows_table("\U0001F30D Top countries", ctry))
    out.append("</div></div>")

    with open("ga.html", "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"GA report built: users28={d28['users']} sessions28={d28['sessions']} "
          f"views28={d28['views']} today_users={today['users']}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # non-fatal: omit GA section rather than fail the job
        print(f"::warning::GA4 report failed ({e}); GA section will be omitted.")
        traceback.print_exc()
        sys.exit(0)
