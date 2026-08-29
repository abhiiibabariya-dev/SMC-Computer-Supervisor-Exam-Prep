#!/usr/bin/env python3
"""
SMC Website Security Audit Report Generator
Generates a comprehensive PDF security audit report
"""

from fpdf import FPDF
import datetime

class SecurityAuditPDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_auto_page_break(auto=True, margin=15)
        self.set_margins(20, 15, 20)
        # Custom colors
        self.primary = (99, 102, 241)  # Indigo
        self.dark = (17, 19, 23)  # Dark
        self.gray = (113, 113, 122)  # Gray
        self.light_gray = (240, 240, 245)  # Light gray
        self.red = (239, 68, 68)
        self.orange = (249, 115, 22)
        self.yellow = (234, 179, 8)
        self.green = (34, 197, 94)
        self.critical = (220, 38, 38)
        self.high = (249, 115, 22)
        self.medium = (234, 179, 8)
        self.low = (34, 197, 94)

    def header(self):
        # Only add header on pages > 1
        if self.page_no() == 1:
            return
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*self.gray)
        self.cell(0, 8, 'SMC Website Security Audit Report', align='L')
        self.cell(0, 8, 'CONFIDENTIAL', align='R')
        self.ln(10)
        self.set_draw_color(*self.light_gray)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(3)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*self.gray)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

    def chapter_title(self, num, title):
        self.ln(2)
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*self.primary)
        self.cell(0, 10, f'{num}. {title}', ln=1)
        self.set_draw_color(*self.primary)
        self.set_line_width(0.5)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(4)

    def section_title(self, title):
        self.ln(2)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*self.dark)
        self.cell(0, 7, title, ln=1)
        self.ln(1)

    def body_text(self, text, size=10):
        self.set_font('Helvetica', '', size)
        self.set_text_color(*self.dark)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def bullet(self, text, size=10):
        self.set_font('Helvetica', '', size)
        self.set_text_color(*self.dark)
        x = self.get_x()
        self.cell(5, 5, chr(149))
        self.multi_cell(0, 5, text)
        self.set_x(x)

    def severity_badge(self, severity):
        colors = {
            'CRITICAL': self.critical,
            'HIGH': self.high,
            'MEDIUM': self.medium,
            'LOW': self.low,
            'INFO': self.gray
        }
        color = colors.get(severity, self.gray)
        self.set_fill_color(*color)
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 9)
        self.cell(28, 6, severity, border=0, align='C', fill=True)
        self.set_text_color(*self.dark)


def create_report():
    pdf = SecurityAuditPDF()

    # ===== COVER PAGE =====
    pdf.add_page()
    pdf.ln(40)

    # Shield icon (simple)
    pdf.set_fill_color(*pdf.primary)
    pdf.circle(105, 60, 18, 'F')
    pdf.set_fill_color(255, 255, 255)
    pdf.set_font('Helvetica', 'B', 24)
    pdf.set_xy(105, 52)
    pdf.cell(0, 16, '', align='C')
    pdf.text(96, 67, '[LOCK]')

    pdf.ln(50)
    pdf.set_font('Helvetica', 'B', 26)
    pdf.set_text_color(*pdf.dark)
    pdf.cell(0, 12, 'Security Audit Report', align='C', ln=1)
    pdf.ln(4)
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(*pdf.primary)
    pdf.cell(0, 10, 'SMC Computer Supervisor Exam Prep Website', align='C', ln=1)
    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(*pdf.gray)
    pdf.cell(0, 8, 'Comprehensive Penetration Test & Vulnerability Assessment', align='C', ln=1)

    pdf.ln(20)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(*pdf.dark)
    date_str = datetime.datetime.now().strftime('%B %d, %Y')
    pdf.cell(0, 8, f'Report Date: {date_str}', align='C', ln=1)
    pdf.cell(0, 8, 'Classification: CONFIDENTIAL', align='C', ln=1)
    pdf.cell(0, 8, 'Prepared for: Authorized Repository Owner', align='C', ln=1)
    pdf.cell(0, 8, 'Target: github.com/abhiiibabariya-dev/SMC-Computer-Supervisor-Exam-Prep', align='C', ln=1)

    pdf.ln(20)
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(*pdf.gray)
    pdf.multi_cell(0, 5, 'This report contains sensitive security information. Distribution is restricted to authorized personnel only. Findings and remediation guidance are provided to improve the security posture of the target application.', align='C')

    # ===== EXECUTIVE SUMMARY =====
    pdf.add_page()
    pdf.chapter_title(1, 'Executive Summary')

    pdf.body_text(
        'This security audit was conducted against the SMC Computer Supervisor Exam Preparation website, '
        'a static web application hosted on GitHub Pages with Firebase backend services. The assessment '
        'followed OWASP testing methodology and manual code review of the client-side application, '
        'Firebase security rules, and data handling practices.'
    )

    pdf.section_title('Key Statistics')
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*pdf.dark)
    pdf.cell(0, 6, 'Total Findings: 20', ln=1)
    pdf.set_text_color(*pdf.critical)
    pdf.cell(0, 6, 'Critical: 3', ln=1)
    pdf.set_text_color(*pdf.high)
    pdf.cell(0, 6, 'High: 5', ln=1)
    pdf.set_text_color(*pdf.medium)
    pdf.cell(0, 6, 'Medium: 8', ln=1)
    pdf.set_text_color(*pdf.low)
    pdf.cell(0, 6, 'Low: 4', ln=1)

    pdf.ln(3)
    pdf.section_title('Most Critical Issues')
    pdf.body_text(
        'The three most severe vulnerabilities identified are:\n\n'
        '1. VIP Access Bypass Codes Exposed in Client-Side Code (CRITICAL)\n'
        '   Hardcoded access codes allow anyone to unlock premium features without payment.\n\n'
        '2. Client-Side Premium Access Control (CRITICAL)\n'
        '   Premium status is enforced only in browser localStorage, not server-side.\n\n'
        '3. Insecure Payment Verification (CRITICAL)\n'
        '   Payment verification happens client-side with no server validation.'
    )

    pdf.section_title('Overall Risk Rating')
    pdf.set_fill_color(*pdf.critical)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 10, '  HIGH RISK - Immediate Remediation Required', border=0, ln=1, fill=True)

    # ===== METHODOLOGY =====
    pdf.add_page()
    pdf.chapter_title(2, 'Methodology')

    pdf.section_title('Testing Approach')
    pdf.body_text(
        'The assessment utilized a combination of techniques appropriate for static web applications '
        'with cloud backend services:'
    )
    pdf.bullet('Manual source code review of all HTML, JavaScript, and configuration files')
    pdf.bullet('Firebase security rules analysis and access control review')
    pdf.bullet('Client-side data flow and storage analysis')
    pdf.bullet('Authentication and authorization flow mapping')
    pdf.bullet('Payment processing and premium access control review')
    pdf.bullet('Privacy and data protection assessment')
    pdf.ln(2)

    pdf.section_title('Frameworks Referenced')
    pdf.bullet('OWASP Top 10 (2021) - Web Application Security Risks')
    pdf.bullet('OWASP ASVS (Application Security Verification Standard)')
    pdf.bullet('OWASP Testing Guide')
    pdf.bullet('Firebase Security Best Practices')
    pdf.bullet('GDPR / Privacy-by-Design Principles')

    pdf.section_title('Scope Limitations')
    pdf.body_text(
        'This assessment was a static analysis (white-box) review of the application source code and '
        'configuration. Dynamic testing against the live environment was not performed as it would '
        'require authenticated access and could impact production services. Findings are based on '
        'code review and security architecture analysis.'
    )

    # ===== DETAILED FINDINGS =====
    pdf.add_page()
    pdf.chapter_title(3, 'Detailed Findings')

    findings = [
        {
            'id': 'SMC-001',
            'title': 'VIP Access Bypass Codes Exposed in Client-Side Code',
            'severity': 'CRITICAL',
            'owasp': 'A05:2021 Security Misconfiguration / A01:2021 Broken Access Control',
            'files': 'vip-access.html (lines 80-87), premium.html (lines 650-657), mock-test.html (lines 541-549)',
            'desc': (
                'The application contains hardcoded VIP access codes that unlock premium features without payment. '
                'These codes are obfuscated using character code arrays but are trivially reversible by anyone '
                'with access to the source code. Three VIP codes are defined in vip-access.html: "abhi2611vip", '
                '"bhai2611vip", and "behen2611vip". Additionally, premium.html contains three more codes: '
                '"SMC-OWNER-2026", "SMC-FAMILY-BRO", and "SMC-FAMILY-SIS".'
            ),
            'impact': (
                'Anyone can extract these codes from the client-side JavaScript, decode them, and gain free '
                'premium access. This completely undermines the paid subscription model and represents a '
                'direct revenue loss. The obfuscation provides no real security as the decoding logic is '
                'visible in the same file.'
            ),
            'poc': (
                '1. Open vip-access.html in a browser\n'
                '2. View source / inspect element\n'
                '3. Extract the _codes array (lines 81-85)\n'
                '4. Decode: [97,98,104,105,50,54,49,49,118,105,112] = "abhi2611vip"\n'
                '5. Enter "abhi2611vip" in the access code field\n'
                '6. Premium access is granted via localStorage.setItem("smc_vip", "true")'
            ),
            'remediation': (
                '1. Remove all client-side VIP codes immediately\n'
                '2. Move premium entitlement verification to Firebase server-side rules\n'
                '3. Premium status should be stored in Firebase user profile, verified on every request\n'
                '4. Use Firebase Custom Claims for admin/premium users instead of client-side flags\n'
                '5. Implement server-side payment verification through Cloud Functions'
            )
        },
        {
            'id': 'SMC-002',
            'title': 'Client-Side Premium Access Control',
            'severity': 'CRITICAL',
            'owasp': 'A01:2021 Broken Access Control',
            'files': 'premium.html (lines 680-697, 864-941), mock-test.html (device lock verification)',
            'desc': (
                'Premium access is controlled entirely by client-side JavaScript checks against localStorage. '
                'The application checks localStorage.getItem("smc_premium_key") and localStorage.getItem("smc_vip") '
                'to determine premium status. The "DeviceLock.verify()" function (premium.html lines 565-646) '
                'only validates a locally-stored device fingerprint hash, which can be forged or copied.'
            ),
            'impact': (
                'An attacker can simply set localStorage values to gain premium access without any payment. '
                'The device fingerprinting is cosmetic security theater - the fingerprint is generated '
                'client-side and stored locally, so it provides no real protection against tampering.'
            ),
            'poc': (
                '1. Open the website in browser\n'
                '2. Open Developer Console\n'
                '3. Execute: localStorage.setItem("smc_vip", "true")\n'
                '4. Navigate to premium content\n'
                '5. Access is granted'
            ),
            'remediation': (
                '1. Store premium entitlement in Firebase user profile (server-side)\n'
                '2. Verify entitlement on every page load via Firebase rules\n'
                '3. Use Firebase Custom Claims for premium status\n'
                '4. Remove all localStorage-based premium checks\n'
                '5. Enforce access control in Firebase security rules, not client code'
            )
        },
        {
            'id': 'SMC-003',
            'title': 'Insecure Payment Verification (Client-Side)',
            'severity': 'CRITICAL',
            'owasp': 'A04:2021 Insecure Design / A08:2021 Software and Data Integrity Failures',
            'files': 'premium.html (lines 864-941), subscription-payments.js, premium-flow.js',
            'desc': (
                'Payment verification occurs entirely client-side. The verifyPayment() function generates an '
                '"access key" by hashing orderNumber + txnId + deviceFP - all values the client controls. '
                'There is no server-side validation that a UPI payment actually occurred. The Firebase '
                'payment_requests collection accepts submissions from any authenticated user without '
                'verifying payment authenticity.'
            ),
            'impact': (
                'Attackers can submit fake payment requests and self-approve premium access. The access key '
                'generation algorithm is visible in source code, allowing key forgery. No actual UPI payment '
                'verification occurs.'
            ),
            'poc': (
                '1. Complete payment flow with any UTR number\n'
                '2. Access key generated: "SMC-" + simpleHash(orderNumber + txnId + deviceFP)\n'
                '3. simpleHash is FNV-1a (visible in source, lines 943-947)\n'
                '4. Attacker can forge valid keys for any order/transaction combination'
            ),
            'remediation': (
                '1. Implement server-side payment verification via Firebase Cloud Functions\n'
                '2. Integrate with UPI payment gateway webhook verification\n'
                '3. Use Firebase Cloud Function to validate payment before granting entitlement\n'
                '4. Store approved payments with server-generated signatures\n'
                '5. Never trust client-submitted payment status'
            )
        },
        {
            'id': 'SMC-004',
            'title': 'Firebase API Key Exposed in Client-Side Code',
            'severity': 'HIGH',
            'owasp': 'A05:2021 Security Misconfiguration',
            'files': 'firebase-config.js (lines 9-18)',
            'desc': (
                'The Firebase Web API key (AIzaSyBsK3fKL8bmGZM8OY3g7mtLbAym0V5SIc0) is exposed in client-side '
                'JavaScript. While Firebase web API keys are designed to be public, they MUST be protected by '
                'strict security rules. The current rules have vulnerabilities (see SMC-006) that make this '
                'exposure dangerous.'
            ),
            'impact': (
                'With the API key exposed and weak security rules, attackers can potentially read/write Firebase '
                'data directly via REST API. Combined with SMC-006, this allows unauthorized data access.'
            ),
            'poc': (
                '1. Extract API key from firebase-config.js\n'
                '2. Use Firebase REST API: GET https://[project].firebasedatabase.app/users.json?auth=\n'
                '3. If rules are misconfigured, retrieve all user data'
            ),
            'remediation': (
                '1. Configure Firebase API key restrictions in Google Cloud Console\n'
                '2. Restrict key to specific APIs (Identity Toolkit, Firebase Realtime Database)\n'
                '3. Add HTTP referrer restrictions\n'
                '4. Ensure security rules are deny-by-default with explicit grants\n'
                '5. Regularly audit API key usage'
            )
        },
        {
            'id': 'SMC-005',
            'title': 'Broken Access Control - Admin Detection',
            'severity': 'HIGH',
            'owasp': 'A01:2021 Broken Access Control',
            'files': 'admin-console.html (lines 12, 18-20), login.html (line 30)',
            'desc': (
                'Admin privileges are determined by client-side email comparison: '
                'isAdmin(u) returns u.email.toLowerCase() === "abhibabariya007@gmail.com". While Firebase '
                'security rules also enforce admin checks, the client-side redirect is the first line of '
                'defense. If an attacker can bypass the client check (e.g., via modified JavaScript), they '
                'may access admin functionality.'
            ),
            'impact': (
                'Client-side admin detection is not a security control - it only affects UX. The real '
                'protection is Firebase rules, but any weakness there (SMC-006) becomes critical. Admin '
                'email is also hardcoded and visible to all users.'
            ),
            'poc': (
                '1. Admin email visible in source: abhibabariya007@gmail.com\n'
                '2. Client-side check can be bypassed by modifying JavaScript\n'
                '3. Firebase rules are the only real protection'
            ),
            'remediation': (
                '1. Use Firebase Custom Claims for admin role (not email comparison)\n'
                '2. Enforce admin checks in Firebase security rules (server-side)\n'
                '3. Never rely on client-side role detection for security\n'
                '4. Remove hardcoded admin email from client code'
            )
        },
        {
            'id': 'SMC-006',
            'title': 'Firebase Security Rules Allow Authenticated User Writes to PII Collections',
            'severity': 'HIGH',
            'owasp': 'A01:2021 Broken Access Control',
            'files': 'firebase-rules.json (lines 48-89)',
            'desc': (
                'The security rules allow any authenticated user to write to audit, auth_audit, visits, clicks, '
                'leads, and security collections. While reads are restricted to admin, writes from any '
                'authenticated user create data integrity and injection risks. For example, the "leads" '
                'collection (lines 76-82) accepts name/email from any user without validation beyond '
                'hasChildren check.'
            ),
            'impact': (
                'Malicious authenticated users can inject fake tracking data, spam collections, or potentially '
                'exploit weak validation. The "visits" collection stores IP, geo-location, and device data '
                'from any user without rate limiting.'
            ),
            'poc': (
                '1. Authenticate with any valid account\n'
                '2. POST to /visits.json with arbitrary data\n'
                '3. Data is accepted (rules line 62-68 allow any authenticated write)\n'
                '4. Repeat to spam/inject data'
            ),
            'remediation': (
                '1. Restrict writes to server-side only (Cloud Functions)\n'
                '2. Add validation rules for all fields\n'
                '3. Implement rate limiting via Cloud Functions\n'
                '4. Use Firebase App Check to prevent unauthorized API access\n'
                '5. Remove client-side writes to analytics collections'
            )
        },
        {
            'id': 'SMC-007',
            'title': 'PII Collection Without Encryption or Consent',
            'severity': 'HIGH',
            'owasp': 'A02:2021 Cryptographic Failures / GDPR Violation',
            'files': 'tracker.js (lines 4-26, 68-87), firebase-rules.json (audit/security/visits collections)',
            'desc': (
                'The tracker.js collects extensive PII including IP address, geo-location (city, region, '
                'country, ISP), device fingerprint, screen resolution, hardware specs, and browsing behavior. '
                'This data is stored in Firebase without encryption and without explicit user consent. The '
                'GeoIP lookup (ipwho.is) reveals precise location data.'
            ),
            'impact': (
                'Mass collection of PII without consent violates GDPR/privacy regulations. Data breach would '
                'expose sensitive user information. No data retention policy is enforced.'
            ),
            'poc': (
                '1. Visit any page with tracker.js loaded\n'
                '2. IP, location, device data collected automatically\n'
                '3. Data written to Firebase /visits without consent\n'
                '4. No opt-out mechanism exists'
            ),
            'remediation': (
                '1. Implement cookie consent banner with granular controls\n'
                '2. Minimize PII collection to essential data only\n'
                '3. Encrypt PII at rest in Firebase\n'
                '4. Add data retention and deletion policies\n'
                '5. Document data processing in Privacy Policy (currently inadequate)'
            )
        },
        {
            'id': 'SMC-008',
            'title': 'No Content Security Policy (CSP) Implemented',
            'severity': 'MEDIUM',
            'owasp': 'A05:2021 Security Misconfiguration',
            'files': 'All HTML files (no CSP meta tags or headers)',
            'desc': (
                'None of the HTML pages include a Content Security Policy. External scripts are loaded from '
                'multiple CDNs (gstatic.com, jsdelivr.net, cdn.jsdelivr.net, googleapis.com) without '
                'integrity attributes (SRI). This creates XSS risk if any CDN is compromised.'
            ),
            'impact': (
                'Without CSP, successful XSS attacks can execute arbitrary JavaScript, steal Firebase tokens, '
                'access localStorage premium keys, and exfiltrate user data.'
            ),
            'poc': (
                '1. If any CDN script is compromised, malicious code executes in user context\n'
                '2. No CSP to block inline scripts or unauthorized sources\n'
                '3. No SRI hashes to detect modified scripts'
            ),
            'remediation': (
                '1. Add CSP meta tags or server headers to all pages\n'
                '2. Use strict CSP: default-src self, script-src with nonces\n'
                '3. Add SRI integrity attributes to all external scripts\n'
                '4. Enable X-XSS-Protection and other security headers'
            )
        },
        {
            'id': 'SMC-009',
            'title': 'Sensitive Data in localStorage',
            'severity': 'MEDIUM',
            'owasp': 'A04:2021 Insecure Design',
            'files': 'premium.html (lines 533, 569-583), gate.js (line 21), vip-access.html (lines 122-123)',
            'desc': (
                'Premium keys, VIP status, device bindings, and user profiles are stored in localStorage. '
                'This data persists across sessions and is accessible to any JavaScript running on the page, '
                'including injected scripts (XSS). The device fingerprint binding (premium.html lines 521-562) '
                'stores access keys in three locations: localStorage, IndexedDB, and cookies.'
            ),
            'impact': (
                'XSS attacks can steal premium keys and session data. localStorage is accessible to all '
                'scripts on the origin. No encryption or protection for sensitive values.'
            ),
            'poc': (
                '1. XSS vulnerability (if present) can read localStorage\n'
                '2. localStorage.getItem("smc_premium_key") exposes premium key\n'
                '3. Data persists indefinitely, increasing exposure window'
            ),
            'remediation': (
                '1. Store premium entitlements server-side (Firebase)\n'
                '2. Use httpOnly cookies for session tokens where possible\n'
                '3. Encrypt sensitive localStorage values\n'
                '4. Implement automatic key rotation/expiry'
            )
        },
        {
            'id': 'SMC-010',
            'title': 'Client-Side Form Validation Only',
            'severity': 'MEDIUM',
            'owasp': 'A04:2021 Insecure Design',
            'files': 'login.html (form validation), premium.html (goStep validation), all forms',
            'desc': (
                'All form validation is performed client-side. While Firebase security rules provide some '
                'server-side validation, the application relies heavily on client checks for data integrity. '
                'Account enumeration is possible via distinct error messages for invalid email vs. wrong password.'
            ),
            'impact': (
                'Client-side validation can be bypassed. Account enumeration enables targeted attacks. '
                'Data integrity depends on Firebase rules which have gaps (SMC-006).'
            ),
            'poc': (
                '1. Intercept signup request, modify validation-bypassed data\n'
                '2. Firebase rules may not catch all invalid inputs\n'
                '3. Error messages distinguish "user not found" from "wrong password"'
            ),
            'remediation': (
                '1. Implement server-side validation in Firebase rules\n'
                '2. Use generic error messages for auth failures\n'
                '3. Add Cloud Functions for critical data validation\n'
                '4. Implement account enumeration protection'
            )
        },
        {
            'id': 'SMC-011',
            'title': 'Question Banks Exposed Client-Side',
            'severity': 'MEDIUM',
            'owasp': 'A01:2021 Broken Access Control (Business Logic)',
            'files': 'mcq-bank.js (lines 1-361), mock-test.html (embedded questions), exam.html',
            'desc': (
                'All examination questions AND their answers are embedded in client-side JavaScript. '
                'The mcq-bank.js file contains 100+ questions with correct answer indices (q.a property). '
                'Mock tests in mock-test.html include complete question banks with explanations.'
            ),
            'impact': (
                'Paid premium content (answers to mock tests) is freely extractable from source code. '
                'Anyone can scrape answers without purchasing premium access. Undermines the value proposition.'
            ),
            'poc': (
                '1. Open mcq-bank.js in browser\n'
                '2. Parse questions array with answer indices\n'
                '3. All answers accessible without payment'
            ),
            'remediation': (
                '1. Serve questions from Firebase (protected by rules)\n'
                '2. Separate questions from answers server-side\n'
                '3. Use server-side quiz logic for premium content\n'
                '4. Implement answer reveal only after submission'
            )
        },
        {
            'id': 'SMC-012',
            'title': 'No Session Timeout on Admin Console',
            'severity': 'MEDIUM',
            'owasp': 'A07:2021 Identification and Authentication Failures',
            'files': 'login.html (line 84: setPersistence LOCAL), admin-console.html',
            'desc': (
                'Firebase Auth persistence is set to LOCAL (login.html line 84), meaning admin sessions '
                'persist indefinitely across browser restarts. The admin console has no session timeout '
                'or re-authentication requirement for sensitive operations.'
            ),
            'impact': (
                'Admin sessions remain valid indefinitely. If an admin device is compromised or left '
                'unattended, attackers gain persistent admin access.'
            ),
            'poc': (
                '1. Admin logs in once\n'
                '2. Session persists across browser restarts (LOCAL persistence)\n'
                '3. No timeout forces re-authentication'
            ),
            'remediation': (
                '1. Use SESSION persistence for admin accounts\n'
                '2. Implement idle timeout (15-30 min)\n'
                '3. Require re-authentication for sensitive operations\n'
                '4. Add "active session" monitoring'
            )
        },
        {
            'id': 'SMC-013',
            'title': 'UPI ID Exposed via Client-Side Decoding',
            'severity': 'LOW',
            'owasp': 'A05:2021 Security Misconfiguration (Information Disclosure)',
            'files': 'premium.html (lines 411-415, 650-657)',
            'desc': (
                'The UPI payment ID is encoded as character codes and decoded at runtime '
                '(premium.html lines 411-415). While this is public payment information, exposing it '
                'in client code allows scraping and potential targeted attacks.'
            ),
            'impact': (
                'UPI ID visible to anyone inspecting source. Low risk but unnecessary exposure.'
            ),
            'remediation': (
                '1. Load UPI ID from Firebase (protected config)\n'
                '2. Or accept as unavoidable but document in privacy policy'
            )
        },
        {
            'id': 'SMC-014',
            'title': 'EmailJS Public Key Exposed',
            'severity': 'LOW',
            'owasp': 'A05:2021 Security Misconfiguration (Information Disclosure)',
            'files': 'receipt.js (line 8), premium.html (lines 1027-1033)',
            'desc': (
                'EmailJS public key (R9-pkw_CjpX-5Zayl) is exposed in client code. This is normal for '
                'EmailJS but combined with template injection risks, it could be abused for spam.'
            ),
            'impact': (
                'Public key exposure is standard for EmailJS. Risk is low but templates should be secured.'
            ),
            'remediation': (
                '1. Use EmailJS domain allowlist\n'
                '2. Rate-limit email sends via Cloud Functions\n'
                '3. Monitor EmailJS usage for abuse'
            )
        },
        {
            'id': 'SMC-015',
            'title': 'Device Fingerprinting Without Consent',
            'severity': 'MEDIUM',
            'owasp': 'GDPR / Privacy Violation',
            'files': 'premium.html (lines 420-647: DeviceLock engine)',
            'desc': (
                'The application performs extensive device fingerprinting (canvas, WebGL, audio context, '
                'fonts, screen, hardware) without user consent. This creates a persistent tracking identifier '
                'that survives browser cleanup in some cases (IndexedDB, cookies).'
            ),
            'impact': (
                'Privacy violation - tracking users without consent. Potential GDPR non-compliance. '
                'Fingerprint can be used for surveillance.'
            ),
            'remediation': (
                '1. Obtain explicit consent before fingerprinting\n'
                '2. Document fingerprinting in Privacy Policy\n'
                '3. Provide opt-out mechanism\n'
                '4. Limit fingerprint persistence'
            )
        },
        {
            'id': 'SMC-016',
            'title': 'No Rate Limiting on Authentication',
            'severity': 'MEDIUM',
            'owasp': 'A07:2021 Identification and Authentication Failures',
            'files': 'login.html (Firebase Auth), firebase-rules.json',
            'desc': (
                'While Firebase Auth has built-in protection, the application has no custom rate limiting '
                'for login attempts or payment submissions. Account enumeration via error messages is possible.'
            ),
            'impact': (
                'Brute force and credential stuffing attacks possible. Account enumeration enables targeted attacks.'
            ),
            'remediation': (
                '1. Implement rate limiting via Cloud Functions\n'
                '2. Add CAPTCHA for repeated failures\n'
                '3. Use generic auth error messages\n'
                '4. Monitor for suspicious login patterns'
            )
        },
        {
            'id': 'SMC-017',
            'title': 'Insecure Redirects and External Script Loading',
            'severity': 'LOW',
            'owasp': 'A05:2021 Security Misconfiguration',
            'files': 'All HTML files (external CDN scripts), premium.html (redirects)',
            'desc': (
                'Multiple external scripts loaded without SRI integrity checks. Redirects use location.replace '
                'with user-controlled return URLs (sessionStorage smc_auth_return).'
            ),
            'impact': (
                'CDN compromise could lead to XSS. Open redirect possible if return URL not validated.'
            ),
            'remediation': (
                '1. Add SRI hashes to all external scripts\n'
                '2. Validate return URLs against allowlist\n'
                '3. Use relative URLs where possible'
            )
        },
        {
            'id': 'SMC-018',
            'title': 'Admin Email Case Sensitivity Issues',
            'severity': 'LOW',
            'owasp': 'A04:2021 Insecure Design',
            'files': 'firebase-rules.json (line 7), login.html (line 30), admin-console.html (line 1)',
            'desc': (
                'Firebase security rules compare admin email with lower() function, but client-side checks '
                'use .toLowerCase() on user input. If Firebase Auth stores email in different case than '
                'expected, admin access may fail. Error message in admin-console.html acknowledges this issue.'
            ),
            'impact': (
                'Potential admin lockout if email case mismatch. Operational issue, not direct security risk.'
            ),
            'remediation': (
                '1. Use Firebase Custom Claims instead of email comparison\n'
                '2. Normalize email case consistently\n'
                '3. Document admin onboarding procedure'
            )
        },
        {
            'id': 'SMC-019',
            'title': 'Automated Reconnaissance Facilitation',
            'severity': 'LOW',
            'owasp': 'A05:2021 Security Misconfiguration (Information Disclosure)',
            'files': 'robots.txt, sitemap.xml, .nojekyll',
            'desc': (
                'robots.txt and sitemap.xml expose complete site structure. While not a vulnerability itself, '
                'it facilitates automated reconnaissance of admin pages and sensitive endpoints.'
            ),
            'impact': (
                'Attackers can easily discover admin-console.html, vip-access.html, and other sensitive pages.'
            ),
            'remediation': (
                '1. Exclude admin/sensitive pages from sitemap\n'
                '2. Add noindex to admin pages (already done)\n'
                '3. Use obscure URLs or additional auth for admin'
            )
        },
        {
            'id': 'SMC-020',
            'title': 'Missing Security Headers',
            'severity': 'MEDIUM',
            'owasp': 'A05:2021 Security Misconfiguration',
            'files': 'All HTML files (no security headers)',
            'desc': (
                'The application does not implement security headers: X-Frame-Options, X-Content-Type-Options, '
                'Referrer-Policy, Permissions-Policy, or HSTS. GitHub Pages has limited header control but '
                'meta tags could be added.'
            ),
            'impact': (
                'Missing headers enable clickjacking, MIME sniffing, and information leakage via referrers.'
            ),
            'remediation': (
                '1. Add meta tags for X-Content-Type-Options, Referrer-Policy\n'
                '2. Use CSP meta tag (see SMC-008)\n'
                '3. Consider custom domain with header configuration\n'
                '4. Enable HSTS if HTTPS-only'
            )
        },
    ]

    # Print each finding
    for i, f in enumerate(findings):
        # Check if we need a page break
        if pdf.get_y() > 230:
            pdf.add_page()

        # Finding header
        pdf.ln(3)
        pdf.set_fill_color(*pdf.light_gray)
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(*pdf.dark)
        pdf.cell(0, 8, f"  {f['id']}: {f['title']}", border=0, ln=1, fill=True)

        # Severity and OWASP
        pdf.ln(2)
        pdf.severity_badge(f['severity'])
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*pdf.gray)
        pdf.cell(0, 6, f"  OWASP: {f['owasp']}", ln=1)

        # Affected files
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*pdf.dark)
        pdf.cell(0, 5, 'Affected Files:', ln=1)
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(*pdf.gray)
        pdf.multi_cell(0, 4, f['files'])

        # Description
        pdf.ln(1)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*pdf.dark)
        pdf.cell(0, 5, 'Description:', ln=1)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*pdf.dark)
        pdf.multi_cell(0, 4, f['desc'])

        # Risk/Impact
        pdf.ln(1)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*pdf.red)
        pdf.cell(0, 5, 'Risk & Impact:', ln=1)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*pdf.dark)
        pdf.multi_cell(0, 4, f['impact'])

        # Proof of Concept
        pdf.ln(1)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*pdf.dark)
        pdf.cell(0, 5, 'Proof of Concept:', ln=1)
        pdf.set_font('Courier', '', 8)
        pdf.set_text_color(*pdf.gray)
        poc_text = f.get('poc', 'Not provided')
        pdf.multi_cell(0, 4, poc_text)

        # Remediation
        pdf.ln(1)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*pdf.green)
        pdf.cell(0, 5, 'Remediation:', ln=1)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*pdf.dark)
        rem_text = f.get('remediation', 'Not provided')
        pdf.multi_cell(0, 4, rem_text)

        pdf.ln(2)
        pdf.set_draw_color(*pdf.light_gray)
        pdf.line(20, pdf.get_y(), 190, pdf.get_y())

    # ===== RISK MATRIX =====
    pdf.add_page()
    pdf.chapter_title(4, 'Risk Assessment Matrix')

    pdf.section_title('Severity Distribution')
    pdf.set_font('Helvetica', '', 10)

    # Simple bar representation
    severities = [
        ('CRITICAL', 3, pdf.critical),
        ('HIGH', 5, pdf.high),
        ('MEDIUM', 8, pdf.medium),
        ('LOW', 4, pdf.low),
    ]

    for name, count, color in severities:
        pdf.set_fill_color(*color)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(25, 6, name, fill=True, align='C')
        pdf.set_text_color(*pdf.dark)
        pdf.set_font('Helvetica', '', 9)
        pdf.cell(10, 6, f' {count}', border=0)
        pdf.cell(0, 6, '', ln=1)
        pdf.ln(1)

    pdf.ln(3)
    pdf.section_title('Business Risk Summary')

    pdf.bullet('Revenue Loss: VIP bypass and client-side premium control enable free access to paid content', 9)
    pdf.bullet('Data Breach: PII collection without encryption exposes users to privacy violations', 9)
    pdf.bullet('Compliance: GDPR/privacy violations from undisclosed tracking', 9)
    pdf.bullet('Reputation: Security failures damage user trust', 9)
    pdf.bullet('Operational: Admin email exposure and session persistence create attack surface', 9)

    # ===== REMEDIATION ROADMAP =====
    pdf.add_page()
    pdf.chapter_title(5, 'Remediation Roadmap')

    pdf.section_title('Immediate Actions (0-7 days)')
    pdf.bullet('SMC-001: Remove all client-side VIP codes', 9)
    pdf.bullet('SMC-002: Move premium control to Firebase server-side', 9)
    pdf.bullet('SMC-003: Implement server-side payment verification', 9)
    pdf.bullet('SMC-005: Replace email-based admin with Custom Claims', 9)

    pdf.ln(2)
    pdf.section_title('Short-term (1-4 weeks)')
    pdf.bullet('SMC-004: Configure Firebase API key restrictions', 9)
    pdf.bullet('SMC-006: Tighten Firebase security rules', 9)
    pdf.bullet('SMC-007: Implement consent and data minimization', 9)
    pdf.bullet('SMC-008: Add Content Security Policy', 9)
    pdf.bullet('SMC-011: Move question banks server-side', 9)

    pdf.ln(2)
    pdf.section_title('Medium-term (1-3 months)')
    pdf.bullet('SMC-009: Encrypt sensitive localStorage', 9)
    pdf.bullet('SMC-012: Implement session timeout', 9)
    pdf.bullet('SMC-015: Add fingerprinting consent', 9)
    pdf.bullet('SMC-016: Add rate limiting', 9)
    pdf.bullet('SMC-020: Add security headers', 9)

    pdf.ln(2)
    pdf.section_title('Long-term (3-6 months)')
    pdf.bullet('Implement comprehensive monitoring and alerting', 9)
    pdf.bullet('Regular security audits and penetration testing', 9)
    pdf.bullet('Security training for development team', 9)
    pdf.bullet('Bug bounty program consideration', 9)

    # ===== CONCLUSION =====
    pdf.add_page()
    pdf.chapter_title(6, 'Conclusion')

    pdf.body_text(
        'The SMC Computer Supervisor Exam Preparation website has critical security vulnerabilities that '
        'directly impact revenue protection, user privacy, and data integrity. The most severe issues '
        'relate to premium access control being enforced client-side rather than server-side, allowing '
        'trivial bypass of paid content.'
    )

    pdf.body_text(
        'Immediate remediation of the three Critical findings (SMC-001, SMC-002, SMC-003) is essential to '
        'protect revenue and maintain the integrity of the subscription model. The High findings related to '
        'Firebase configuration and PII handling should be addressed within the first month.'
    )

    pdf.body_text(
        'Recommendation: Engage a security professional to implement server-side access control via Firebase '
        'Cloud Functions and Custom Claims, conduct a follow-up penetration test after remediation, and '
        'establish ongoing security monitoring.'
    )

    pdf.ln(5)
    pdf.set_fill_color(*pdf.primary)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(0, 10, '  END OF REPORT', border=0, ln=1, align='C', fill=True)

    # Save
    output_path = '/data/data/com.termux/files/home/smc-website/SMC-Security-Audit-Report.pdf'
    pdf.output(output_path)
    print(f"Report generated: {output_path}")
    return output_path


if __name__ == '__main__':
    create_report()
