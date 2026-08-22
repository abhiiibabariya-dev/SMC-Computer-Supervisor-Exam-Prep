# Security Audit

## Scope

Repository: `abhiiibabariya-dev/SMC-Computer-Supervisor-Exam-Prep`

Review date: 22 August 2026

Focus: Firebase Authentication, Realtime Database authorization, GitHub Pages deployment, client-side security, and the supplied pre-launch security checklist.

## Findings and actions

### 1. Firebase Web SDK was outdated
**Severity:** High reliability risk

The login page and protected-page gate were loading Firebase compat SDK 10.12.5. The project now uses Firebase 12.17.1 for the login page and authentication gate. The newer Firebase Auth release includes fixes for browser referrer handling with HTTP-referrer-restricted API keys, which is directly relevant to `auth/network-request-failed` reports on hosted sites.

**Status:** Fixed.

### 2. Login error handling was too generic
**Severity:** Medium

The login page previously surfaced the raw `auth/network-request-failed` error without retrying or distinguishing device/network problems from Firebase configuration problems.

**Status:** Fixed.

The login flow now:
- checks browser online state;
- retries a network-failed sign-in once;
- probes the Firebase Auth endpoint without creating an account when the failure persists;
- reports more useful Firebase error categories such as unauthorized domain, disabled provider, invalid credentials, and API-key problems.

### 3. Firebase persistence was not explicitly configured
**Severity:** Low/Medium

The login and protected-page flows now request local Firebase Auth persistence. Failure to set persistence does not grant access, so this is a reliability improvement rather than an authorization bypass.

**Status:** Fixed.

### 4. Realtime Database rules use a deny-by-default root
**Severity:** Positive control

The root `.read` and `.write` rules are false. Sensitive paths have explicit authenticated/admin conditions.

**Status:** Good.

### 5. User profile authorization was reviewed for rule cascading

Realtime Database `.write` rules cascade from parent to children. The current `/users/$uid` parent write rule only allows the owner to create a profile when the record does not already exist. Existing records therefore fall through to the more specific child write rules. Premium fields are not user-updatable after creation except by the configured administrator.

**Status:** Acceptable after review.

### 6. Premium access is server-rule controlled

The `premium_content` database read rule checks authentication, active subscription status, full-access entitlement, and expiration time. This is stronger than relying only on a client-side premium flag.

**Status:** Good control. Continue testing the rules in the Firebase Rules simulator before changing subscription logic.

### 7. Public client Firebase configuration

The Firebase Web API key in `firebase-config.js` is client configuration, not a service-account credential. It must still have appropriate API restrictions and the production web origin must be an authorized Firebase Authentication domain.

**Action:** Verify the live origin in Firebase Authentication > Settings > Authorized domains and verify the API key's HTTP referrers include the actual production origin.

### 8. Leaderboard integrity
**Severity:** Medium

The client is allowed to submit a leaderboard record containing its own score fields. Authentication prevents anonymous writes, but a malicious authenticated user could potentially submit fabricated scores because the database cannot independently verify the quiz result.

**Recommendation:** Treat leaderboard scores as untrusted until they are generated or verified server-side. Do not use client-submitted scores for prizes, payments, or other security-sensitive decisions.

### 9. Client-side admin identification
**Severity:** Medium design concern

The frontend uses the administrator email to choose the administrator UI. This is acceptable as a navigation hint, but it must never be treated as the security boundary. The database rules are the real authorization layer and currently use the Firebase auth email claim for admin access.

**Recommendation:** For stronger long-term design, migrate administrator authorization to a Firebase custom claim such as `admin: true` and use that claim in database rules.

### 10. Static GitHub Pages deployment
**Severity:** Architecture consideration

GitHub Pages is suitable for the static frontend, but it cannot safely hold server-only secrets. Any future payment verification, admin automation, AI API key, webhook secret, or privileged database operation should be moved to a trusted backend or Cloud Function.

**Status:** No server secret was added to the frontend.

## Deployment safety

The supplied security guide was added as an isolated `security-guide.html` page. It does not load the application's Firebase code, authentication gate, database, or subscription code, so it cannot alter application behavior.

## Remaining manual checks

1. Firebase Authentication > Sign-in method: confirm Email/Password is enabled.
2. Firebase Authentication > Settings > Authorized domains: add the exact production hostname used by the live site.
3. Google Cloud API key restrictions: confirm the production origin is allowed and the Identity Toolkit API is not blocked.
4. Firebase Realtime Database: deploy and verify `firebase-rules.json` is the active ruleset.
5. Test login from a clean browser session and from mobile data/Wi-Fi separately.
6. Test a normal user against another user's UID and another user's premium resource.
7. Test premium approval/rejection/expiration paths.
8. Rotate any credential if a private secret was ever committed to the repository.

## Important deployment mismatch to verify

The screenshot supplied for the failing login shows a GitHub Pages hostname that does not obviously match the repository owner's normal project-page URL. The repository is owned by `abhiiibabariya-dev` and has its own GitHub Pages deployment workflow. Before declaring production fixed, verify that the URL being opened by users is actually serving this repository's current `master` build. If the screenshot URL is an older/user-site deployment, updating this repository alone will not update that old deployment.
