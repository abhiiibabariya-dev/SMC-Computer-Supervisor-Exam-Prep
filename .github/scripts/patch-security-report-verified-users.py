from pathlib import Path

path = Path('.github/workflows/daily-security-log.yml')
s = path.read_text(encoding='utf-8')
anchor = "          jq --arg c \"$CUTOFF\" '[.[]? | select((.t    // \"\") > $c)]' visits.json   > visits_24.json   || echo '[]' > visits_24.json\n"
fetch = """          # Fetch the verified Firebase profile index so the security report can
          # replace client-supplied identity fields with the server-stored verified profile.
          curl -fsS \"${FIREBASE_URL}/users.json${AUTH}\" -o users.json || echo '{}' > users.json
          jq --slurpfile users users.json '
            ($users[0] // {}) as $um
            | map(
                . as $e
                | ($um[$e.uid] // {}) as $p
                | . + {
                    name: (if (($p.name // \"\") != \"\") then $p.name else ($e.name // \"\") end),
                    mobile: (if (($p.mobile // \"\") != \"\") then $p.mobile else ($e.mobile // \"\") end),
                    postLabel: (if (($p.postLabel // $p.post // \"\") != \"\") then ($p.postLabel // $p.post) else ($e.postLabel // \"\") end),
                    email: (if (($p.email // \"\") != \"\") then $p.email else ($e.email // \"\") end),
                    phoneVerified: (if ($p.phoneVerified == true) then true else ($e.phoneVerified // false) end),
                    emailVerified: (if ($p.emailVerified == true) then true else ($e.emailVerified // false) end)
                  }
              )' audit.json > audit_identity.json && mv audit_identity.json audit.json

"""
if 'verified Firebase profile index' not in s:
    if anchor not in s:
        raise SystemExit('Expected daily report anchor not found')
    s = s.replace(anchor, fetch + anchor, 1)
path.write_text(s, encoding='utf-8')
print('Daily security report now enriches audit identities from verified Firebase profiles.')
