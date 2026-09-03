# Setting Up Admin Access for abhibabariya007@gmail.com

## Option 1: Firebase Console (Easiest - No Code Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **smc-exam-prep-38d22**
3. Go to **Authentication** → **Users**
4. Find user: `abhibabariya007@gmail.com`
5. Click the user → **Custom claims** (or "Custom claims" tab)
6. Add JSON:
   ```json
   {
     "admin": true
   }
   ```
7. Save. The user needs to sign out and sign back in for the claim to take effect.

---

## Option 2: Firebase CLI (If you have Firebase CLI installed)

```bash
# Login to Firebase
firebase login

# Set custom claim
firebase auth:custom-claims:set <USER_UID> '{"admin": true}'
```

To get the UID:
```bash
firebase auth:list
# Find the UID for abhibabariya007@gmail.com
```

---

## Option 3: Node.js Script (If you have service account key)

### Prerequisites
1. Download service account key from Firebase Console:
   - Project Settings → Service Accounts → Generate New Private Key
   - Save as `service-account.json` in project root

### Run the script
```bash
# Install dependencies
npm install firebase-admin

# Run the script
node scripts/set-admin-claim.js abhibabariya007@gmail.com
```

---

## Option 4: GitHub Actions (Automated)

The `cleanup-unverified-users.yml` workflow already has the service account configured via GitHub Secrets. You can:

1. Go to GitHub Actions → **Cleanup Unverified Accounts**
2. Click **Run workflow**
3. The workflow will skip the admin email (line 85 in the script)

But this doesn't set the admin claim. You'd need a separate workflow.

---

## After Setting Admin Claim

1. **Sign out and sign back in** at https://your-site/admin-control.html
2. The admin panel should now load properly
3. You can now:
   - View all users and their subscription status
   - Approve pending payments
   - Manually grant premium access to any user
   - Set custom claims directly from the admin panel

---

## Using the Enhanced Admin Panel

The updated `admin-control.html` now has:

### 👥 Users & Premium Tab
- Search and filter users
- See current plan, status, and custom claims
- Change subscription plan (Free/₹99/₹199)
- Open custom claims editor for any user

### 💳 Payment Requests Tab
- View all payment requests
- Approve payments (auto-grants premium + sets custom claims)

### 🎯 Custom Claims Tab (NEW)
- View all users with their current custom claims
- Modify admin/premium/fullAccess claims per user
- **Quick Grant** feature: Enter UID or email, select access type, click Grant

### 🕵️ Activity Logs Tab
- Audit, Security, Visits, Clicks, Leads, Quiz Scores

---

## Troubleshooting

### "Subscription details could not be loaded"
This happens when the user doesn't have `admin: true` custom claim. The Firebase rules require `auth.token.admin === true` to read all users.

### Admin link not showing in client-dashboard
The dashboard checks `user.getIdTokenResult(true).claims.admin === true`. After setting the claim, the user must refresh their token (sign out/in).

### Permission denied on database reads
Ensure the user has `emailVerified: true` in Firebase Auth AND `admin: true` custom claim.