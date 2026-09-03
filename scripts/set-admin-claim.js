#!/usr/bin/env node
/**
 * Set Admin Custom Claim Script
 *
 * This script sets the admin: true custom claim for a specific user email.
 * Requires FIREBASE_SERVICE_ACCOUNT_JSON environment variable or service account file.
 *
 * Usage: node scripts/set-admin-claim.js <email> [serviceAccountPath]
 */

const fs = require('fs');
const path = require('path');

async function setAdminClaim(email, serviceAccountPath) {
  let serviceAccount;

  // Try to load service account from various sources
  if (serviceAccountPath) {
    console.log(`Loading service account from: ${serviceAccountPath}`);
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log('Loading service account from FIREBASE_SERVICE_ACCOUNT_JSON env var');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else if (fs.existsSync(path.join(process.cwd(), 'service-account.json'))) {
    console.log('Loading service account from local service-account.json');
    serviceAccount = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'service-account.json'), 'utf8'));
  } else {
    console.error('ERROR: No service account found!');
    console.error('Please either:');
    console.error('  1. Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable');
    console.error('  2. Place service-account.json in the project root');
    console.error('  3. Pass the path as second argument');
    process.exit(1);
  }

  // Dynamic import of firebase-admin
  const { initializeApp, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  // Initialize Firebase Admin
  const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app'
  });

  const auth = getAuth(app);

  try {
    // Find user by email (case-insensitive)
    const normalizedEmail = email.toLowerCase();
    console.log(`Looking up user: ${normalizedEmail}`);

    const userRecord = await auth.getUserByEmail(normalizedEmail);
    console.log(`Found user: ${userRecord.uid} (${userRecord.email})`);

    // Get existing custom claims
    const existingClaims = userRecord.customClaims || {};
    console.log('Existing claims:', existingClaims);

    // Set admin claim
    const newClaims = { ...existingClaims, admin: true };
    await auth.setCustomUserClaims(userRecord.uid, newClaims);

    console.log('✅ Successfully set admin: true custom claim!');
    console.log('New claims:', newClaims);

    // Verify the claim was set
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log('Verified claims:', updatedUser.customClaims);

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`ERROR: User with email ${email} not found in Firebase Auth`);
    } else {
      console.error('ERROR:', error.message);
    }
    process.exit(1);
  } finally {
    // Clean up
    await app.delete();
  }
}

// Run the script
const email = process.argv[2];
const serviceAccountPath = process.argv[3];

if (!email) {
  console.error('Usage: node scripts/set-admin-claim.js <email> [serviceAccountPath]');
  console.error('Example: node scripts/set-admin-claim.js abhibabariya007@gmail.com');
  process.exit(1);
}

setAdminClaim(email, serviceAccountPath);