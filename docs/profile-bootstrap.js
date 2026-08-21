/* Authenticated profile bootstrap.
 * This script deliberately does NOT create a database record on login.
 * Profile creation is handled by profile-setup.html after email verification,
 * so the login page never attempts to write subscription/entitlement fields.
 */
(function(){'use strict';
function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
var cfg=window.SMC_FIREBASE_CONFIG||{};
var p=Promise.resolve();
if(!window.firebase||!firebase.database)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js');});
p.then(function(){
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  firebase.auth().onAuthStateChanged(function(user){
    if(!user)return;
    // Read-only existence check. The verified profile page owns all profile writes.
    firebase.database().ref('users/'+user.uid).once('value').catch(function(){});
  });
}).catch(function(){});
})();
