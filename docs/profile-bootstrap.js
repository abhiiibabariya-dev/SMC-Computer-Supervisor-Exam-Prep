/* Creates a free profile using the authenticated Firebase SDK.
 * It never overwrites subscription/entitlement fields.
 */
(function(){'use strict';
function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
var cfg=window.SMC_FIREBASE_CONFIG||{};
var p=Promise.resolve();if(!window.firebase||!firebase.database)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js');});
p.then(function(){if(!firebase.apps.length)firebase.initializeApp(cfg);firebase.auth().onAuthStateChanged(function(user){if(!user)return;var name=(document.getElementById('name')||{}).value||user.displayName||'';var mobile=((document.getElementById('mobile')||{}).value||'').replace(/\D/g,'');var post=(document.getElementById('post')||{}).value||'';var ref=firebase.database().ref('users/'+user.uid);ref.once('value').then(function(s){if(s.exists())return;return ref.set({uid:user.uid,email:user.email||'',name:name.trim(),mobile:mobile,post:post,plan:'free',planLabel:'Free',subscriptionStatus:'none',expiresAt:null,entitlements:{mockTests:false,fullAccess:false},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});}).catch(function(){});});}).catch(function(){});
})();
