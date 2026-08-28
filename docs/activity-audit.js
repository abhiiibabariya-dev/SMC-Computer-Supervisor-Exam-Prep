/* Gujarat Govt Jobs Hub authenticated activity audit. */
(function(){'use strict';if(window.__SMC_ACTIVITY_AUDIT__)return;window.__SMC_ACTIVITY_AUDIT__=true;
function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function boot(){
  var p=Promise.resolve();
  if(!window.SMC_FIREBASE_CONFIG)p=p.then(function(){return load('firebase-config.js');});
  if(!window.firebase||!firebase.initializeApp)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js');});
  if(!window.firebase||!firebase.auth)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth-compat.js');});
  if(!window.firebase||!firebase.database)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/12.17.1/firebase-database-compat.js');});
  return p.then(function(){var cfg=window.SMC_FIREBASE_CONFIG||{};if(!cfg.apiKey||!cfg.authDomain||!cfg.appId||!cfg.databaseURL)throw new Error('Firebase config missing');if(!firebase.apps.length)firebase.initializeApp(cfg);});
}
function sid(){try{var k='smc_audit_sid',v=localStorage.getItem(k);if(!v){v='sid-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);localStorage.setItem(k,v);}return v;}catch(e){return'sid-'+Math.random().toString(36).slice(2);}}
function send(user,ev,detail){if(!user)return;var now=new Date(),payload={uid:user.uid,event:'authenticated',ev:ev,page:location.pathname,t:now.toISOString(),lt:now.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),sid:sid(),d:String(detail||'').substring(0,120)};try{firebase.database().ref('audit').push(payload).catch(function(){});}catch(e){}}
boot().then(function(){var cachedUser=null;firebase.auth().onAuthStateChanged(function(user){cachedUser=user;if(!user)return;send(user,'page_view','Opened '+location.pathname);});document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('#smcAuthLogout'):null;if(!b||!cachedUser)return;send(cachedUser,'logout','User clicked Logout');});}).catch(function(){});
})();
