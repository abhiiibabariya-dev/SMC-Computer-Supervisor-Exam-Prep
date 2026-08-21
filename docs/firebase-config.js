// ===== FIREBASE CONFIG =====
// Replace the URL below with your Firebase Realtime Database URL after setup.
// Instructions: https://console.firebase.google.com
window.SMC_FIREBASE_URL = 'https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app';

// Public landing page must never be intercepted by the protected-page auth gate.
try{var __smcFile=(location.pathname.split('/').pop()||'index.html').toLowerCase();if(__smcFile==='index.html')window.__SMC_UNIFIED_AUTH__=true;}catch(e){}

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

// ===== OTPLESS =====
window.SMC_OTPLESS_APP_ID = "";

// ===== COMMUNITY GROUP =====
window.SMC_COMMUNITY_URL = "https://whatsapp.com/channel/0029Vb8VJOk0wajr7dC5K13a";

// Premium flow is loaded after the legacy premium page scripts so it can replace
// the old client-side access-key behavior with the Firebase pending -> approval flow.
(function(){
  try{
    var f=(location.pathname.split('/').pop()||'').toLowerCase();
    if(f==='premium.html'){
      var s=document.createElement('script');
      s.src='premium-flow.js?v=20260821-1';
      s.defer=false;
      document.head.appendChild(s);
    }
  }catch(e){}
})();
