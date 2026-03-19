# SMC Exam Prep 2026 — Complete Website Architecture

## ============================================================
## WEBSITE MAP
## ============================================================

```
                    ┌─────────────────────┐
                    │     HOMEPAGE         │
                    │   index.html         │
                    │                      │
                    │ • Hero + Animations  │
                    │ • Stats (4000+ MCQs) │
                    │ • Countdown Timer    │
                    │ • Daily Quiz         │
                    │ • Quick Access Tabs  │
                    │ • Content Paywall    │
                    │ • 5 Exam Sections    │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
    ┌─────▼──────┐     ┌──────▼──────┐     ┌───────▼──────┐
    │ MOCK TESTS │     │  ONLINE     │     │  AI          │
    │ mock-test  │     │  EXAM       │     │  ASSISTANT   │
    │ .html      │     │  exam.html  │     │  ai.html     │
    │            │     │             │     │              │
    │ 9 Tests    │     │ 5 Posts     │     │ ChatGPT-like │
    │ 225 Q's    │     │ 2 Languages │     │ Web Search   │
    │ 2 FREE     │     │ Timer+Score │     │ 15+ Topics   │
    │ 7 PREMIUM  │     │             │     │              │
    └─────┬──────┘     └─────────────┘     └──────────────┘
          │
    ┌─────▼──────┐
    │ PREMIUM    │
    │ PAYMENT    │
    │ premium    │
    │ .html      │
    │            │
    │ UPI QR     │
    │ Rs 49/99   │
    │ Device Lock│
    │ Key Gen    │
    │ Receipts   │
    └────────────┘


    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │SUPERVISOR│ │  CLERK   │ │ LAB TECH │ │ MARSHAL  │ │ ANALYST  │
    │supervisor│ │clerk.html│ │lab-tech  │ │marshal   │ │analyst   │
    │.html     │ │          │ │.html     │ │.html     │ │.html     │
    │          │ │          │ │          │ │          │ │          │
    │Code-513  │ │Code-502  │ │40 Posts  │ │323 Posts │ │7 Posts   │
    │12 Posts  │ │717 Posts │ │Biochem   │ │GK+Gujarat│ │Microbio  │
    │820+ MCQs │ │330+ MCQs │ │Haematol  │ │Language  │ │Immunol   │
    │No Neg    │ │-0.25 Neg │ │Microbio  │ │Physical  │ │Lab Tech  │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘


    ┌─────────────────────┐     ┌─────────────────────┐
    │   HIDDEN PAGES      │     │   EXTERNAL SERVICES  │
    │                     │     │                      │
    │ 🔒 Admin Dashboard  │     │ 🔥 Firebase DB       │
    │   /admin-dashboard  │     │   (Cloud Tracking)   │
    │   -x7k9m.html       │     │                      │
    │   PIN: smc2026      │     │ 📊 Google Analytics  │
    │                     │     │   (GA4: G-1CP842CPFX)│
    │ 🔑 VIP Access       │     │                      │
    │   /vip-access.html  │     │ 📱 GitHub Pages      │
    │   3 Family Codes    │     │   (Free Hosting)     │
    └─────────────────────┘     └──────────────────────┘
```


## ============================================================
## MONEY FLOW
## ============================================================

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│  USER VISITS │────────►│  FREE CONTENT│────────►│  WANTS MORE  │
│  (Google,    │         │              │         │              │
│   WhatsApp,  │         │ • 2 Mock Tests│        │ • Sees locked │
│   Instagram) │         │ • Daily Quiz │         │   mock tests  │
│              │         │ • Some MCQs  │         │ • Blurred     │
│              │         │ • News       │         │   content     │
└──────────────┘         └──────────────┘         └──────┬───────┘
                                                         │
                                                         ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│  PREMIUM     │◄────────│  PAYMENT     │◄────────│  CLICKS      │
│  UNLOCKED    │         │              │         │  "UNLOCK"    │
│              │         │ Step 1: Plan │         │              │
│ • 9 Mock     │         │ Step 2: Name │         │  Goes to     │
│   Tests      │         │ Step 3: UPI  │         │  premium.html│
│ • All MCQs   │         │ Step 4: Key  │         │              │
│ • Full Access│         │              │         │              │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              ┌──────────┐┌──────────┐┌──────────┐
              │ WhatsApp ││  Email   ││   SMS    │
              │ Receipt  ││ Receipt  ││ Receipt  │
              └──────────┘└──────────┘└──────────┘
```


## ============================================================
## SECURITY LAYERS
## ============================================================

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: UPI PROTECTION                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ UPI ID stored as char-code array [49,53,48,46...]     │  │
│  │ Never visible as plain text in source code            │  │
│  │ Assembled at runtime only when user reaches Step 3    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 2: DEVICE FINGERPRINT LOCK                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Screen + GPU + Canvas + Audio + Platform + Fonts      │  │
│  │ Unique hash per device → key bound to device          │  │
│  │ Different device = key auto-revoked                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 3: ADMIN PROTECTION                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ PIN stored as hash (not plain text)                   │  │
│  │ 5 wrong attempts = 5 minute lockout                   │  │
│  │ 1 hour session expiry                                 │  │
│  │ Security log tracks all login attempts                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 4: VIP BYPASS                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 3 family codes (char-code encoded)                    │  │
│  │ Hidden page (/vip-access.html)                        │  │
│  │ 10 attempt limit                                      │  │
│  │ Skips device lock entirely                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 5: CONTENT PAYWALL                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ First 3 cards visible → rest fades with gradient      │  │
│  │ Mock Test 3-9 locked with overlay                     │  │
│  │ Premium check: VIP flag OR premium key + device match │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```


## ============================================================
## TRACKING & ANALYTICS
## ============================================================

```
┌─────────────┐
│ USER VISITS │
│  ANY PAGE   │
└──────┬──────┘
       │
       ├──────────────────┐──────────────────┐
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  tracker.js  │  │   Firebase   │  │   Google     │
│  (LOCAL)     │  │   (CLOUD)    │  │   Analytics  │
│              │  │              │  │              │
│ localStorage │  │ Real-time DB │  │ GA4 Property │
│ on user's    │  │ Visible from │  │ G-1CP842CPFX │
│ device only  │  │ ANY device   │  │              │
│              │  │              │  │ Full reports │
│ Backup only  │  │ Admin sees   │  │ Demographics │
│              │  │ ALL visitors │  │ Behavior     │
└──────────────┘  └──────────────┘  └──────────────┘
                         │
                         ▼
               ┌─────────────────┐
               │ ADMIN DASHBOARD │
               │                 │
               │ • All Visitors  │
               │ • Orders        │
               │ • Revenue       │
               │ • Security Log  │
               │ • Device Charts │
               │ • Click Tracking│
               │                 │
               │ Auto-refresh 5s │
               │ Cloud + Local   │
               └─────────────────┘
```


## ============================================================
## DAILY AUTO-CONTENT
## ============================================================

```
┌────────────────────────────────────────────────────┐
│              DAILY CONTENT ENGINE                    │
│           (Changes automatically every day)          │
├────────────────────────────────────────────────────┤
│                                                    │
│  📅 Date-based selection (day of year % total)     │
│                                                    │
│  ┌──────────────┐  Content Bank:                   │
│  │ Today in     │  • 35+ historical dates          │
│  │ History      │  • Indian + Gujarat events       │
│  └──────────────┘                                  │
│  ┌──────────────┐  Content Bank:                   │
│  │ GK Question  │  • 60 unique questions           │
│  │ of the Day   │  • Science, Polity, Computer     │
│  └──────────────┘                                  │
│  ┌──────────────┐  Content Bank:                   │
│  │ Current      │  • 15 latest affairs             │
│  │ Affairs      │  • PM, President, Missions       │
│  └──────────────┘                                  │
│  ┌──────────────┐  Content Bank:                   │
│  │ Word of      │  • 30 vocabulary words           │
│  │ the Day      │  • Meaning + Example             │
│  └──────────────┘                                  │
│  ┌──────────────┐  Content Bank:                   │
│  │ Exam Tip     │  • 30 study tips                 │
│  │              │  • Strategies + motivation        │
│  └──────────────┘                                  │
│                                                    │
│  🔄 Rotates every 2 months (60-day cycle)          │
│  ⚡ Zero maintenance — runs forever                │
└────────────────────────────────────────────────────┘
```


## ============================================================
## QUICK REFERENCE
## ============================================================

```
WEBSITE:     https://abhiiibabariya-dev.github.io/SMC-Computer-Supervisor-Exam-Prep/
ADMIN:       /admin-dashboard-x7k9m.html  (PIN: smc2026)
VIP PAGE:    /vip-access.html
FIREBASE:    console.firebase.google.com/project/smc-exam-prep-38d22
ANALYTICS:   analytics.google.com (G-1CP842CPFX)
BACKUP:      git branch: backup-stable-v1
UPI:         Encoded in source (char-code array)
COST:        Rs 0/month (all free services)

VIP CODES:
  You:       abhi2026
  Brother:   bhaijaan
  Sister:    behenji

MOCK TESTS:
  FREE:      Test 1 (Easy), Test 2 (Tricky)
  PREMIUM:   Test 3-9 (Rs 49 or Rs 99)

TOTAL CONTENT:
  MCQs:      4000+ (markdown files)
  Mock Q's:  225 (in JavaScript)
  Pages:     12
  Subjects:  5 exam posts
```
