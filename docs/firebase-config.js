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
  apiKey: "AIzaSyBsK3fKL8bmGZM8OY3g7mtLbAym0V5SIc0",
  authDomain: "smc-exam-prep-38d22.firebaseapp.com",
  databaseURL: "https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smc-exam-prep-38d22",
  storageBucket: "smc-exam-prep-38d22.firebasestorage.app",
  messagingSenderId: "329166929775",
  appId: "1:329166929775:web:44adb9d62e409f739cf29a",
  measurementId: "G-RFDJV7GQ62"
};

// ===== OTPLESS — FREE WhatsApp + Email OTP for the access gate =====
// The access gate verifies visitors with a real OTP delivered over WhatsApp
// (to their mobile) OR Email — powered by OTPless (free tier, no card needed).
//
// ONE-TIME SETUP (~5 min):
//   1. Sign up free at https://otpless.com  → create an App.
//   2. Dashboard → Channels: enable "WhatsApp" and "Email" (both free).
//   3. Add your site domain (abhiiibabariya-dev.github.io) to the allowed origins.
//   4. Copy the "App ID" and paste it below (it is a PUBLIC client id, safe to commit).
//
// While this is empty, the gate falls back to instant name+number FORMAT
// validation (no OTP) so visitors are never locked out.
window.SMC_OTPLESS_APP_ID = "";

// ===== COMMUNITY GROUP (WhatsApp / Telegram) =====
// Paste your group invite link here to show a "Join the study group" button in the
// site menu (great for daily engagement + free growth). Leave empty to hide it.
//   WhatsApp example: https://chat.whatsapp.com/XXXXXXXXXXXXXXX
//   Telegram example: https://t.me/your_channel
window.SMC_COMMUNITY_URL = "https://whatsapp.com/channel/0029Vb8VJOk0wajr7dC5K13a";
