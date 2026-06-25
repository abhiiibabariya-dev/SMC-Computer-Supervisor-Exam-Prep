// ===== FIREBASE CONFIG =====
// Replace the URL below with your Firebase Realtime Database URL after setup.
// Instructions: https://console.firebase.google.com
// 1. Create project → 2. Create Realtime Database → 3. Copy URL → 4. Paste below

window.SMC_FIREBASE_URL = 'https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app';
// Example: window.SMC_FIREBASE_URL = 'https://your-project-default-rtdb.firebaseio.com';

// When empty, tracker works in localStorage-only mode (current behavior).
// When set, tracker sends data to Firebase AND localStorage.

// ===== FIREBASE WEB CONFIG (for SMS OTP / Phone Auth in the access gate) =====
// Get these from: Firebase Console → Project Settings (gear) → "Your apps" →
//   pick/create a Web app (</> icon) → copy the firebaseConfig values below.
// These are PUBLIC client keys (safe to commit). Until apiKey + appId are filled
// AND Phone sign-in is enabled with this domain authorised, the gate falls back
// to format-only validation (no OTP) so visitors are never locked out.
window.SMC_FIREBASE_CONFIG = {
  apiKey: "",                                            // <-- paste apiKey
  authDomain: "smc-exam-prep-38d22.firebaseapp.com",
  projectId: "smc-exam-prep-38d22",
  appId: ""                                              // <-- paste appId
};
