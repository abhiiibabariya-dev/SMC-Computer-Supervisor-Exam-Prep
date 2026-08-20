from pathlib import Path

path = Path('.github/workflows/daily-security-log.yml')
s = path.read_text(encoding='utf-8')

# Brand the security email consistently with the live website.
s = s.replace('SMC EXAM PREP &bull; SECURITY OPERATIONS', 'GUJARAT GOVT JOBS HUB &bull; SECURITY OPERATIONS')
s = s.replace('Generated automatically by GitHub Actions &bull; Sources: Firebase Realtime DB (visits, clicks, leads, security) + Google Analytics GA4 &bull; SMC Exam Prep SOC', 'Generated automatically by GitHub Actions &bull; Sources: Firebase Realtime DB (visits, clicks, leads, security) + Google Analytics GA4 &bull; Gujarat Govt Jobs Hub SOC')
s = s.replace('subject=🛡 SMC Activity — ${DATE_IST} IST —', 'subject=🛡 Gujarat Govt Jobs Hub — Security & Activity — ${DATE_IST} IST —')
s = s.replace('from: SMC Exam Prep Bot <${{ secrets.MAIL_USERNAME }}>', 'from: Gujarat Govt Jobs Hub Security Bot <${{ secrets.MAIL_USERNAME }}>')

# Enrich audit records from the identity/lead records using the mobile number.
anchor = "          jq --arg c \"$CUTOFF\" '[.[]? | select((.t    // \"\") > $c)]' audit.json    > audit_24.json    || echo '[]' > audit_24.json\n"
insert = r'''\n          # ---- Enrich audit identities (name + mobile + chosen post) ----
          # Firebase returns /audit as an object keyed by push IDs. Normalize it to
          # an array before joining identities, then match by normalized last-10-digit
          # mobile number so events with a number but no name get the correct identity.
          jq '[.[]?]' audit.json > audit_array.json && mv audit_array.json audit.json
          jq --slurpfile leads leads.json '
            ($leads[0] // []) as $ls
            | ($ls
              | map(select((.mobile // "") != "")
                    | {key: (((.mobile|tostring)|gsub("[^0-9]";"")|if length > 10 then .[-10:] else . end)), value:.})
              | from_entries) as $lm
            | map(
                . as $e
                | (((.mobile // "")|tostring)|gsub("[^0-9]";"")|if length > 10 then .[-10:] else . end) as $m
                | if ($m != "" and $lm[$m] != null) then
                    . + {
                      name: (if (($e.name // "") == "" or ($e.name // "") == "Anonymous" or ($e.name // "") == "Anonymous visitor") then ($lm[$m].name // $e.name // "") else $e.name end),
                      mobile: (if (($e.mobile // "") == "") then ($lm[$m].mobile // "") else $e.mobile end),
                      postLabel: (if (($e.postLabel // "") == "") then ($lm[$m].postLabel // "") else $e.postLabel end),
                      email: (if (($e.email // "") == "") then ($lm[$m].email // "") else $e.email end)
                    }
                  else . end
              )' audit.json > audit_enriched.json && mv audit_enriched.json audit.json

          # Enrich visit rows from the latest known audit identity. This makes the
          # Visits table show the real name + mobile instead of Anonymous when the
          # visit and authenticated audit event share the same sid.
          jq --slurpfile aud audit.json '
            ($aud[0] // []) as $a
            | ($a
              | sort_by(.t // "")
              | map(select((.sid // "") != "") | {sid:.sid,name:(.name // ""),mobile:(.mobile // ""),postLabel:(.postLabel // "")})
              | group_by(.sid)
              | map({key:.[0].sid,value:.[-1]})
              | from_entries) as $im
            | map(
                . as $v
                | ($im[.sid] // {}) as $i
                | . + {
                    name: (if (($v.name // "") == "" or ($v.name // "") == "Anonymous" or ($v.name // "") == "Anonymous visitor") then ($i.name // $v.name // "") else $v.name end),
                    mobile: (if (($v.mobile // "") == "") then ($i.mobile // "") else $v.mobile end),
                    postLabel: (if (($v.postLabel // "") == "") then ($i.postLabel // "") else $v.postLabel end)
                  }
              )' visits.json > visits_identity.json && mv visits_identity.json visits.json
'''
if 'Enrich audit identities (name + mobile + chosen post)' not in s:
    if anchor not in s:
        raise SystemExit('Expected audit slice anchor was not found')
    s = s.replace(anchor, anchor + insert, 1)

path.write_text(s, encoding='utf-8')
print('Security report branding and identity enrichment patched.')
