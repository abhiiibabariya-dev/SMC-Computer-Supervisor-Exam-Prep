/* SMC Prep subscription + entitlement client.
 * Source of truth: Firebase Realtime Database /users/{uid}.
 * This file never grants premium access from localStorage.
 */
(function(){
  'use strict';
  if(window.__SMC_SUBSCRIPTION__) return;
  window.__SMC_SUBSCRIPTION__=true;

  var cfg=window.SMC_FIREBASE_CONFIG||{};
  var db=(cfg.databaseURL||window.SMC_FIREBASE_URL||'').replace(/\/$/,'');
  var protectedRoutes={
    'mock-test.html':'mockTests'
  };

  function loadScript(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  function firebaseReady(){
    var p=Promise.resolve();
    if(!window.firebase||!firebase.auth)p=p.then(function(){return loadScript('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js');});
    if(!window.firebase||!firebase.apps||!firebase.apps.length)p=p.then(function(){if(!firebase.apps.length)firebase.initializeApp(cfg);});
    return p;
  }
  function getProfile(uid){return fetch(db+'/users/'+encodeURIComponent(uid)+'.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null;});}
  function active(p){
    if(!p||p.subscriptionStatus!=='active') return false;
    if(p.expiresAt===null||p.expiresAt===undefined||p.expiresAt==='') return true;
    var t=Date.parse(p.expiresAt); return Number.isFinite(t)&&t>Date.now();
  }
  function ent(p,name){
    if(!active(p)) return false;
    if(p.entitlements&&p.entitlements[name]===true) return true;
    if(p.plan==='premium99') return true;
    return p.plan==='premium49'&&name==='mockTests';
  }
  function status(p){
    if(!p) return {state:'free',label:'Free',expired:false};
    if(p.subscriptionStatus==='active'&&!active(p)) return {state:'expired',label:'Expired',expired:true};
    if(p.subscriptionStatus==='active') return {state:'active',label:p.planLabel||'Premium',expired:false};
    return {state:p.subscriptionStatus||'free',label:p.planLabel||'Free',expired:false};
  }
  window.SMC_HAS_ENTITLEMENT=function(name){return !!(window.SMC_SUBSCRIPTION&&ent(window.SMC_SUBSCRIPTION,name));};
  window.SMC_GET_SUBSCRIPTION=function(){return window.SMC_SUBSCRIPTION||null;};

  function showGate(message){
    document.documentElement.style.visibility='visible';
    var o=document.createElement('div');o.id='smcEntitlementGate';
    o.innerHTML='<style>#smcEntitlementGate{position:fixed;inset:0;z-index:2147483646;background:#08090b;display:flex;align-items:center;justify-content:center;padding:22px;color:#fff;font-family:system-ui,sans-serif}#smcEntitlementGate .box{max-width:430px;width:100%;background:#111317;border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:28px;text-align:center;box-shadow:0 25px 80px #0008}#smcEntitlementGate h2{margin:8px 0;color:#fff}#smcEntitlementGate p{color:#9ca3af;line-height:1.55;font-size:.85rem}#smcEntitlementGate a{display:inline-block;margin-top:16px;padding:12px 18px;border-radius:12px;background:#86efac;color:#07130b;text-decoration:none;font-weight:800}</style><div class="box"><div style="font-size:42px">🔐</div><h2>Premium access required</h2><p>'+String(message||'Your account does not currently have this entitlement.')+'</p><a href="premium.html">View ₹49 / ₹99 access</a></div>';
    document.body.appendChild(o);
  }

  function run(){
    var file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    var need=protectedRoutes[file];
    if(!need) return;
    document.documentElement.style.visibility='hidden';
    firebaseReady().then(function(){
      var auth=firebase.auth();
      auth.onAuthStateChanged(function(user){
        if(!user){location.replace('login.html');return;}
        getProfile(user.uid).then(function(p){
          window.SMC_SUBSCRIPTION=p||null;
          var st=status(p);
          if(!ent(p,need)){showGate(st.expired?'Your subscription has expired. Please contact the administrator or renew access.':'Your account is signed in, but this premium feature has not been activated yet.');return;}
          document.documentElement.style.visibility='visible';
          window.dispatchEvent(new CustomEvent('smc:subscription-ready',{detail:p}));
        }).catch(function(){showGate('We could not verify your subscription right now. Please try again.');});
      });
    }).catch(function(){showGate('Secure subscription verification is unavailable right now.');});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
