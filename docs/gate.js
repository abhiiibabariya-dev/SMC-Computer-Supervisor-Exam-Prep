/* SMC Prep Unified Authentication Gate
 * Every normal HTML page requires a Firebase-authenticated account.
 * Authentication is enforced before page content is made visible.
 */
(function(){
  'use strict';
  if(window.__SMC_UNIFIED_AUTH__) return;
  window.__SMC_UNIFIED_AUTH__=true;

  var script=document.currentScript;
  var rootUrl='';
  try{
    if(script && script.src) rootUrl=new URL('.',script.src).href;
  }catch(e){}
  if(!rootUrl) rootUrl=new URL('./',location.href).href;

  var path=location.pathname||'';
  var file=(path.split('/').pop()||'index.html').toLowerCase();
  if(file==='login.html') return;

  var RETURN_KEY='smc_auth_return', PROFILE_KEY='smc_account';
  var cfg=null, auth=null;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
  function loginUrl(){
    try{sessionStorage.setItem(RETURN_KEY,location.pathname+location.search+location.hash);}catch(e){}
    return new URL('login.html',rootUrl).href;
  }
  function hidePage(){
    var s=document.createElement('style');
    s.id='smc-auth-style';
    s.textContent='html,body{visibility:hidden!important}';
    (document.head||document.documentElement).appendChild(s);
  }
  function showPage(){var s=document.getElementById('smc-auth-style');if(s)s.remove();}
  hidePage();

  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;s.onload=resolve;s.onerror=function(){reject(new Error(src));};
      document.head.appendChild(s);
    });
  }
  function loadFirebase(){
    var p=Promise.resolve();
    if(!window.SMC_FIREBASE_CONFIG){
      p=p.then(function(){return loadScript(new URL('firebase-config.js',rootUrl).href);});
    }
    p=p.then(function(){
      cfg=window.SMC_FIREBASE_CONFIG||{};
      if(!window.firebase||!firebase.initializeApp)
        return loadScript('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
    }).then(function(){
      if(!window.firebase||!firebase.auth)
        return loadScript('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js');
    }).then(function(){
      cfg=window.SMC_FIREBASE_CONFIG||{};
      if(!cfg.apiKey||!cfg.authDomain||!cfg.appId) throw new Error('Firebase config missing');
      if(!firebase.apps.length) firebase.initializeApp(cfg);
      auth=firebase.auth();
    });
    return p;
  }
  function overlay(){
    if(document.getElementById('smcAuthOverlay'))return;
    var o=document.createElement('div');o.id='smcAuthOverlay';
    o.innerHTML='<style>#smcAuthOverlay{position:fixed;inset:0;z-index:2147483647;background:radial-gradient(circle at 20% 10%,rgba(99,102,241,.20),transparent 34%),#08090b;color:#f5f5f5;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Plus Jakarta Sans",system-ui,sans-serif}#smcAuthOverlay .ac{width:min(420px,100%);background:#111317;border:1px solid rgba(255,255,255,.09);border-radius:22px;padding:25px;box-shadow:0 25px 80px rgba(0,0,0,.5);text-align:center}#smcAuthOverlay .ic{font-size:42px;margin-bottom:10px}#smcAuthOverlay h2{margin:0;color:#fff;font-size:1.35rem}#smcAuthOverlay p{color:#9ca3af;font-size:.8rem;line-height:1.55;margin:8px 0 18px}#smcAuthOverlay .st{color:#86efac;font-weight:800;font-size:.72rem}#smcAuthOverlay .err{color:#fca5a5}</style><div class="ac"><div class="ic">🔐</div><h2>SMC Prep Account</h2><p id="smcAuthMsg">Checking your secure account session...</p><div class="st" id="smcAuthState">AUTHENTICATING</div></div>';
    document.body.appendChild(o);
  }
  function fail(msg){
    overlay();
    var m=document.getElementById('smcAuthMsg'),s=document.getElementById('smcAuthState');
    if(m)m.textContent=msg||'Authentication unavailable.';
    if(s){s.textContent='LOGIN REQUIRED';s.className='err';}
    setTimeout(function(){location.replace(loginUrl());},900);
  }
  function dbUrl(){return (cfg&&cfg.databaseURL)||window.SMC_FIREBASE_URL||'';}
  function profile(user){
    var url=dbUrl();if(!url)return Promise.resolve(null);
    return fetch(url+'/users/'+encodeURIComponent(user.uid)+'.json',{cache:'no-store'})
      .then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});
  }
  function account(user,p){
    p=p||{};var plan=p.plan||'free';
    var a={uid:user.uid||'',email:user.email||'',name:p.name||user.displayName||'',mobile:p.mobile||'',post:p.post||'',postLabel:p.postLabel||'',plan:plan,planLabel:p.planLabel||(plan==='premium99'?'Premium ₹99':plan==='premium49'?'Premium ₹49':'Free'),signed_in_at:new Date().toISOString()};
    try{localStorage.setItem(PROFILE_KEY,JSON.stringify(a));}catch(e){}
    return a;
  }
  function audit(user,a){
    var url=dbUrl();if(!url)return;
    try{fetch(url+'/auth_audit.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:user.uid,event:'authenticated',page:location.pathname,t:new Date().toISOString(),email:user.email||'',plan:a.plan||'free'})}).catch(function(){});}catch(e){}
  }
  function chip(user,a){
    if(document.getElementById('smcAuthChip'))return;
    var c=document.createElement('div');c.id='smcAuthChip';
    c.innerHTML='<style>#smcAuthChip{position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;align-items:center;gap:7px;background:rgba(17,17,19,.94);border:1px solid rgba(255,255,255,.10);border-radius:999px;padding:7px 9px 7px 12px;color:#d4d4d8;font:700 11px/1 system-ui,sans-serif;box-shadow:0 7px 24px rgba(0,0,0,.35)}#smcAuthChip b{color:#fff;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#smcAuthChip .pl{color:#86efac}#smcAuthChip button{border:0;border-radius:999px;padding:6px 9px;background:rgba(239,68,68,.14);color:#fca5a5;font-weight:800;cursor:pointer}</style><span>👤</span><b>'+esc(a.name||user.email||'Account')+'</b><span class="pl">'+esc(a.planLabel)+'</span><button type="button" id="smcAuthLogout">Logout</button>';
    document.body.appendChild(c);
    c.querySelector('#smcAuthLogout').onclick=function(){
      auth.signOut().then(function(){try{localStorage.removeItem(PROFILE_KEY);}catch(e){}location.replace(loginUrl());});
    };
  }
  function start(){
    overlay();
    loadFirebase().then(function(){
      auth.onAuthStateChanged(function(user){
        if(!user){showPage();location.replace(loginUrl());return;}
        profile(user).then(function(p){
          var a=account(user,p);audit(user,a);
          var m=document.getElementById('smcAuthMsg'),s=document.getElementById('smcAuthState');
          if(m)m.textContent='Signed in as '+(a.name||user.email||'your account')+'.';
          if(s)s.textContent='ACCESS GRANTED';
          setTimeout(function(){
            var o=document.getElementById('smcAuthOverlay');if(o)o.remove();
            showPage();chip(user,a);
          },120);
        });
      });
    }).catch(function(){fail('Secure authentication is unavailable right now. Please sign in again.');});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
