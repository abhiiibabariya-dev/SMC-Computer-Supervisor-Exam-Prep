const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.database();
const auth = admin.auth();

// Configuration - these should be set via Firebase Functions config
const UPI_MERCHANT_ID = functions.config().upi?.merchant_id || process.env.UPI_MERCHANT_ID;
const UPI_API_KEY = functions.config().upi?.api_key || process.env.UPI_API_KEY;
const UPI_CALLBACK_URL = functions.config().upi?.callback_url || process.env.UPI_CALLBACK_URL;

// Verify UPI payment with bank/payment gateway
async function verifyUPIPayment(txnId, amount, merchantId, apiKey) {
  try {
    // Example: Verify with a UPI payment gateway API
    // This is a template - actual implementation depends on your payment provider
    const response = await axios.post(
      'https://api.razorpay.com/v1/payments/fetch', // Example endpoint
      {
        transaction_id: txnId,
        amount: amount,
        merchant_id: merchantId
      },
      {
        auth: {
          username: apiKey,
          password: '' // Many UPI APIs use API key as username
        },
        timeout: 10000
      }
    );

    // Check if payment is successful
    // Response structure varies by provider - adjust accordingly
    return {
      success: response.data.status === 'captured' || response.data.status === 'success',
      status: response.data.status,
      rawResponse: response.data
    };
  } catch (error) {
    console.error('UPI verification failed:', error.message);
    // Return failed verification but don't throw - we handle gracefully
    return {
      success: false,
      status: 'verification_failed',
      error: error.message
    };
  }
}

// Cloud Function: Verify payment and update user subscription
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { orderId, txnId, amount, plan } = data;
  const uid = context.auth.uid;

  // Validate required fields
  if (!orderId || !txnId || !amount || !plan) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  // Validate plan type
  if (!['premium99', 'premium199'].includes(plan)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type');
  }

  // Validate amount matches plan
  const expectedAmount = plan === 'premium99' ? 99 : 199;
  if (Number(amount) !== expectedAmount) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount does not match plan');
  }

  try {
    // Get the payment request from database
    const paymentRef = db.ref(`payment_requests/${orderId}`);
    const paymentSnap = await paymentRef.once('value');
    const paymentData = paymentSnap.val();

    if (!paymentData) {
      throw new functions.https.HttpsError('not-found', 'Payment request not found');
    }

    // Verify this payment belongs to the authenticated user
    if (paymentData.uid !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Payment request does not belong to user');
    }

    // Check if already processed
    if (paymentData.status === 'approved') {
      throw new functions.https.HttpsError('already-exists', 'Payment already processed');
    }

    // Verify UPI payment server-side
    // NOTE: In production, implement actual UPI gateway verification here
    // For now, we simulate verification - replace with real implementation
    let verificationResult;

    if (UPI_MERCHANT_ID && UPI_API_KEY) {
      // Real verification with payment gateway
      verificationResult = await verifyUPIPayment(txnId, amount, UPI_MERCHANT_ID, UPI_API_KEY);
    } else {
      // Development mode: simulate verification (REMOVE IN PRODUCTION)
      console.warn('UPI credentials not configured - using DEVELOPMENT MODE verification');
      verificationResult = {
        success: true,
        status: 'simulated_success',
        rawResponse: { note: 'Development mode - replace with real verification' }
      };
    }

    if (!verificationResult.success) {
      // Update payment request with failure
      await paymentRef.update({
        status: 'failed',
        verificationResult: verificationResult,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'system'
      });

      throw new functions.https.HttpsError('failed-precondition', 'Payment verification failed');
    }

    // Payment verified successfully - update user subscription
    const isPremium199 = plan === 'premium199';
    const planLabel = isPremium199 ? 'Premium ₹199' : 'Premium ₹99';

    const userUpdates = {
      plan: plan,
      planLabel: planLabel,
      subscriptionStatus: 'active',
      expiresAt: null, // Lifetime subscription
      entitlements: {
        mockTests: true,
        fullAccess: isPremium199
      },
      updatedAt: new Date().toISOString()
    };

    // Update user record
    await db.ref(`users/${uid}`).update(userUpdates);

    // Set Custom Claims for premium access (server-side enforcement)
    const customClaims = {
      premium: true,
      premiumPlan: plan,
      fullAccess: isPremium199,
      subscriptionStatus: 'active'
    };
    await auth.setCustomUserClaims(uid, customClaims);

    // Update payment request
    await paymentRef.update({
      status: 'approved',
      verifiedAt: new Date().toISOString(),
      verifiedBy: uid,
      verificationResult: verificationResult,
      approvedPlan: plan
    });

    // Log audit trail
    await db.ref('audit').push({
      uid: uid,
      ev: 'subscription_activated',
      t: new Date().toISOString(),
      d: {
        plan: plan,
        orderId: orderId,
        txnId: txnId,
        amount: amount,
        verificationStatus: verificationResult.status
      }
    });

    return {
      success: true,
      message: `${planLabel} activated successfully`,
      plan: plan,
      entitlements: userUpdates.entitlements
    };

  } catch (error) {
    console.error('Payment verification error:', error);

    // Re-throw HttpsError as-is
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Payment verification failed: ' + error.message);
  }
});

// Cloud Function: Get user's subscription status (for client-side checks)
exports.getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = context.auth.uid;

  try {
    const userSnap = await db.ref(`users/${uid}`).once('value');
    const userData = userSnap.val();

    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    return {
      plan: userData.plan || 'free',
      planLabel: userData.planLabel || 'Free',
      subscriptionStatus: userData.subscriptionStatus || 'none',
      entitlements: userData.entitlements || { mockTests: false, fullAccess: false },
      expiresAt: userData.expiresAt || null
    };
  } catch (error) {
    console.error('Get subscription error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get subscription status');
  }
});

// Cloud Function: Admin - bulk approve payments (for admin console)
exports.adminApprovePayment = functions.https.onCall(async (data, context) => {
  // Check admin Custom Claim
  if (!context.auth || !context.auth.token.admin === true) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { orderId, plan } = data;

  if (!orderId || !plan) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  if (!['premium99', 'premium199'].includes(plan)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type');
  }

  try {
    const paymentRef = db.ref(`payment_requests/${orderId}`);
    const paymentSnap = await paymentRef.once('value');
    const paymentData = paymentSnap.val();

    if (!paymentData) {
      throw new functions.https.HttpsError('not-found', 'Payment request not found');
    }

    if (paymentData.status === 'approved') {
      throw new functions.https.HttpsError('already-exists', 'Payment already approved');
    }

    const isPremium199 = plan === 'premium199';
    const planLabel = isPremium199 ? 'Premium ₹199' : 'Premium ₹99';
    const uid = paymentData.uid;

    // Update user
    await db.ref(`users/${uid}`).update({
      plan: plan,
      planLabel: planLabel,
      subscriptionStatus: 'active',
      expiresAt: null,
      entitlements: {
        mockTests: true,
        fullAccess: isPremium199
      },
      updatedAt: new Date().toISOString()
    });

    // Set Custom Claims for premium access (server-side enforcement)
    const customClaims = {
      premium: true,
      premiumPlan: plan,
      fullAccess: isPremium199,
      subscriptionStatus: 'active'
    };
    await auth.setCustomUserClaims(uid, customClaims);

    // Update payment request
    await paymentRef.update({
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: context.auth.uid,
      approvedPlan: plan
    });

    // Audit log
    await db.ref('audit').push({
      uid: context.auth.uid,
      ev: 'admin_subscription_approved',
      t: new Date().toISOString(),
      d: {
        targetUid: uid,
        plan: plan,
        orderId: orderId
      }
    });

    return {
      success: true,
      message: `${planLabel} activated for user`
    };

  } catch (error) {
    console.error('Admin approve error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Approval failed: ' + error.message);
  }
});

// Cloud Function: Admin - Set Custom Claims for admin/premium (for admin console)
exports.adminSetCustomClaims = functions.https.onCall(async (data, context) => {
  // Check admin Custom Claim
  if (!context.auth || !context.auth.token.admin === true) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { targetUid, claims } = data;

  if (!targetUid || !claims) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Validate claims - only allow specific fields
    const allowedClaims = ['admin', 'premium', 'premiumPlan', 'fullAccess', 'subscriptionStatus'];
    const sanitizedClaims = {};
    for (const key of allowedClaims) {
      if (claims[key] !== undefined) {
        sanitizedClaims[key] = claims[key];
      }
    }

    if (Object.keys(sanitizedClaims).length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No valid claims provided');
    }

    // Get existing claims and merge
    const userRecord = await auth.getUser(targetUid);
    const existingClaims = userRecord.customClaims || {};
    const mergedClaims = { ...existingClaims, ...sanitizedClaims };

    await auth.setCustomUserClaims(targetUid, mergedClaims);

    // Also update user record in database for consistency
    if (sanitizedClaims.premium !== undefined) {
      await db.ref(`users/${targetUid}`).update({
        subscriptionStatus: sanitizedClaims.premium ? 'active' : 'none',
        plan: sanitizedClaims.premiumPlan || 'free',
        planLabel: sanitizedClaims.premiumPlan === 'premium199' ? 'Premium ₹199' :
                 sanitizedClaims.premiumPlan === 'premium99' ? 'Premium ₹99' : 'Free',
        entitlements: {
          mockTests: sanitizedClaims.premium === true,
          fullAccess: sanitizedClaims.fullAccess === true
        },
        updatedAt: new Date().toISOString()
      });
    }

    // Audit log
    await db.ref('audit').push({
      uid: context.auth.uid,
      ev: 'admin_custom_claims_updated',
      t: new Date().toISOString(),
      d: {
        targetUid: targetUid,
        claimsSet: sanitizedClaims
      }
    });

    return {
      success: true,
      message: 'Custom claims updated successfully',
      claims: mergedClaims
    };

  } catch (error) {
    console.error('Admin set claims error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Failed to set custom claims: ' + error.message);
  }
});

// Cloud Function: Revoke premium access (admin or automated)
exports.revokePremiumAccess = functions.https.onCall(async (data, context) => {
  // Check admin Custom Claim
  if (!context.auth || !context.auth.token.admin === true) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { targetUid, reason } = data;

  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing target UID');
  }

  try {
    // Get existing claims and remove premium
    const userRecord = await auth.getUser(targetUid);
    const existingClaims = userRecord.customClaims || {};

    const updatedClaims = { ...existingClaims };
    updatedClaims.premium = false;
    updatedClaims.premiumPlan = null;
    updatedClaims.fullAccess = false;
    updatedClaims.subscriptionStatus = 'none';

    await auth.setCustomUserClaims(targetUid, updatedClaims);

    // Update user record in database
    await db.ref(`users/${targetUid}`).update({
      subscriptionStatus: 'none',
      plan: 'free',
      planLabel: 'Free',
      entitlements: {
        mockTests: false,
        fullAccess: false
      },
      updatedAt: new Date().toISOString()
    });

    // Audit log
    await db.ref('audit').push({
      uid: context.auth.uid,
      ev: 'admin_premium_revoked',
      t: new Date().toISOString(),
      d: {
        targetUid: targetUid,
        reason: reason || 'Admin revocation'
      }
    });

    return {
      success: true,
      message: 'Premium access revoked successfully'
    };

  } catch (error) {
    console.error('Revoke premium error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Failed to revoke premium access: ' + error.message);
  }
});

// Cloud Function: Get user's custom claims (for client-side verification)
exports.getCustomClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userRecord = await auth.getUser(context.auth.uid);
    return userRecord.customClaims || {};
  } catch (error) {
    console.error('Get custom claims error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get custom claims');
  }
});