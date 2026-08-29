/**
 * Set Admin Custom Claims for abhibabariya007@gmail.com
 * Run this script with: node functions/set-admin-claims.js
 */
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account.json'); // You'll need to download this

// For local development, we can also initialize with project ID
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'smc-exam-prep-38d22',
  databaseURL: 'https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const auth = admin.auth();
const db = admin.database();

async function setAdminClaims() {
  const adminEmail = 'abhibabariya007@gmail.com';

  try {
    // Get user by email
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log(`Found user: ${userRecord.uid} (${userRecord.email})`);

    // Check current claims
    const currentClaims = userRecord.customClaims || {};
    console.log('Current custom claims:', currentClaims);

    // Set new claims - full admin access
    const newClaims = {
      admin: true,
      premium: true,
      premiumPlan: 'premium199',
      fullAccess: true,
      subscriptionStatus: 'active',
      ...currentClaims
    };

    await auth.setCustomUserClaims(userRecord.uid, newClaims);
    console.log('✅ Custom claims set successfully!');
    console.log('New claims:', newClaims);

    // Also update user record in database for consistency
    await db.ref(`users/${userRecord.uid}`).update({
      plan: 'premium199',
      planLabel: 'Premium ₹199',
      subscriptionStatus: 'active',
      entitlements: {
        mockTests: true,
        fullAccess: true
      },
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Database user record updated!');

    // Verify the claims were set
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log('Verified claims:', updatedUser.customClaims);

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === 'auth/user-not-found') {
      console.log('User not found. The user needs to sign up first at the website.');
      console.log('After they sign up, run this script again.');
    }
  }
}

setAdminClaims().then(() => process.exit(0)).catch(() => process.exit(1));