// Gujarat Govt Jobs Hub Visitor Intelligence Tracker — authenticated cloud writes only.
(function(){
'use strict';
var ua=navigator.userAgent,st=Date.now(),v=null,verifiedIdentity={name:'',mobile:'',uid:''};
function mobile10(v){var d=String(v||'').replace(/\D/g,'');return d.length>10?d.slice(-10):d;}
function loadVerifiedIdentity(){try{if(!window.firebase||!firebase.auth||!firebase.database)return;var user=firebase.auth().currentUser;if(!user)return;var uid=user.uid;firebase.database().ref('users/'+uid).once('value').then(function(s){var p=s.val()||{};verifiedIdentity={name:p.name||user.displayName||'',mobile:mobile10(user.phoneNumber||p.mobile||''),uid:uid};}).catch(function(){});}catch(e){}}
function waitForAuthIdentity(){if(window.firebase&&firebase.auth&&firebase.database){loadVerifiedIdentity();try{firebase.auth().onAuthStateChanged(function(){loadVerifiedIdentity();});}catch(e){}return;}var n=0,t=setInterval(function(){n++;if(window.firebase&&firebase.auth&&firebase.database){clearInterval(t);try{firebase.auth().onAuthStateChanged(function(){loadVerifiedIdentity();});}catch(e){}loadVerifiedIdentity();}if(n>100)clearInterval(t);},100);}
waitForAuthIdentity();

/* ===== LOGIN / SIGNUP TRACKING ===== */
function trackLogin(user, isNewAccount, details){
  try{
    if(!window.firebase||!firebase.auth||!firebase.database) return;
    var u = user || firebase.auth().currentUser;
    if(!u) return;
    var data = {
      t: new Date().toISOString(),
      lt: new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),
      sid: sid(),
      uid: u.uid,
      email: u.email || '',
      name: details && details.name ? details.name : '',
      mobile: details && details.mobile ? mobile10(details.mobile) : '',
      event: isNewAccount ? 'account_created' : 'login',
      pg: location.pathname,
      method: 'email_password',
      isNewAccount: !!isNewAccount
    };
    firebase.database().ref('auth_audit').push(data).catch(function(){});
    if(typeof smcAudit==='function') smcAudit(isNewAccount ? 'account_created' : 'login', 'User ' + (isNewAccount ? 'created account' : 'logged in') + ': ' + (u.email||u.uid));
  }catch(e){console.error('trackLogin error:',e);}
}
function trackLogout(uid){
  try{
    if(!window.firebase||!firebase.auth||!firebase.database) return;
    var data = {
      t: new Date().toISOString(),
      lt: new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),
      sid: sid(),
      uid: uid,
      event: 'logout',
      pg: location.pathname
    };
    firebase.database().ref('auth_audit').push(data).catch(function(){});
    if(typeof smcAudit==='function') smcAudit('logout', 'User logged out: ' + uid);
  }catch(e){console.error('trackLogout error:',e);}
}
window.smcTrackLogin = trackLogin;
window.smcTrackLogout = trackLogout;
function smcGeoCached(){try{var c=sessionStorage.getItem('smc_geo');if(c)return JSON.parse(c);}catch(e){}return {};}
function smcGeo(){if(window.__smcGeoP)return window.__smcGeoP;window.__smcGeoP=new Promise(function(res){var cached=smcGeoCached();if(cached&&cached.country){res(cached);return;}var tm=setTimeout(function(){res({});},2500);try{fetch('https://ipwho.is/',{cache:'force-cache'}).then(function(r){return r.json();}).then(function(j){clearTimeout(tm);if(!j||j.success===false){res({});return;}var ip=j.ip||'';if(ip.indexOf('.')>=0)ip=ip.replace(/\.\d+$/,'.x');else if(ip.indexOf(':')>=0)ip=ip.replace(/:[0-9a-f]+$/i,':xxxx');var sec=j.security||{},flags=[];for(var k in sec)if(sec[k])flags.push(k);var g={ip:ip,city:j.city||'',region:j.region||'',country:j.country||'',cc:j.country_code||'',isp:(j.connection&&(j.connection.isp||j.connection.org))||'',tz:(j.timezone&&j.timezone.id)||'',proxy:!!(sec.proxy||sec.vpn||sec.tor||sec.hosting),flags:flags.join(',')};try{sessionStorage.setItem('smc_geo',JSON.stringify(g));}catch(e){}res(g);}).catch(function(){clearTimeout(tm);res({});});}catch(e){clearTimeout(tm);res({});}});return window.__smcGeoP;}
window.smcGeo=smcGeo;window.smcGeoCached=smcGeoCached;smcGeo();
function getOS(u){if(/Android (\d+[\.\d]*)/.test(u))return'Android '+RegExp.$1;if(/iPhone OS (\d+[_\d]*)/.test(u))return'iOS '+RegExp.$1.replace(/_/g,'.');if(/Windows NT 10/.test(u))return'Windows 10/11';if(/Mac OS X/.test(u))return'macOS';if(/Linux/.test(u))return'Linux';return'Unknown';}
function getBr(u){if(/Edg\/(\d+)/.test(u))return'Edge '+RegExp.$1;if(/OPR\/(\d+)/.test(u))return'Opera '+RegExp.$1;if(/Chrome\/(\d+)/.test(u))return'Chrome '+RegExp.$1;if(/Firefox\/(\d+)/.test(u))return'Firefox '+RegExp.$1;if(/Safari/.test(u)&&!/Chrome/.test(u))return'Safari';return'Other';}
function prettyModel(m){if(!m)return'';m=String(m).trim();if(/^SM-/i.test(m))return'Samsung '+m;if(/^Pixel/i.test(m))return'Google '+m;if(/^(Redmi|POCO|M2|M3|M21|M20|22|23|24|2201|2203|2207|2209|2210|2211|2304|2306|2308|2310|2311|2312)/i.test(m))return'Xiaomi '+m;if(/^(CPH|OPPO)/i.test(m))return'Oppo '+m;if(/^(RMX|RealMe)/i.test(m))return'Realme '+m;if(/^(V20|V21|V22|V23|vivo|I20|I21|I22)/i.test(m))return'Vivo '+m;if(/^(LE|IN|KB|GM|HD|BE|EB|CPH)/i.test(m))return'OnePlus '+m;if(/iPhone/i.test(m))return'iPhone';return m;}
function getDevUA(u){if(/SM-[A-Z0-9]+/i.test(u))return'Samsung '+(u.match(/SM-[A-Z0-9]+/i)||[''])[0];if(/Redmi/i.test(u))return'Xiaomi '+((u.match(/Redmi[^;)\/]*/i)||['Redmi'])[0]).trim();if(/POCO/i.test(u))return'Xiaomi '+((u.match(/POCO[^;)\/]*/i)||['POCO'])[0]).trim();if(/Mi \d/i.test(u))return'Xiaomi '+((u.match(/Mi [^;)\/]*/i)||['Mi'])[0]).trim();if(/OnePlus/i.test(u))return((u.match(/OnePlus[^;)\/]*/i)||['OnePlus'])[0]).trim();if(/RMX\d/i.test(u))return'Realme';if(/vivo/i.test(u))return'Vivo';if(/OPPO|CPH/i.test(u))return'Oppo';if(/Pixel/i.test(u))return'Google Pixel';if(/iPhone/.test(u))return'iPhone';if(/iPad/.test(u))return'iPad';if(/Android/.test(u))return'Android Phone';if(/Windows/.test(u))return'Windows PC';if(/Macintosh|Mac OS/.test(u))return'Mac';if(/Linux/.test(u))return'Linux PC';return'Desktop';}
function resolveDevice(cb){try{var d=navigator.userAgentData;if(d&&typeof d.getHighEntropyValues==='function'){d.getHighEntropyValues(['model','platform']).then(function(h){cb(prettyModel(h&&h.model)||getDevUA(ua));}).catch(function(){cb(getDevUA(ua));});return;}}catch(e){}cb(getDevUA(ua));}
function sid(){try{var s=localStorage.getItem('smc_sid');if(!s){s='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('smc_sid',s);}return s;}catch(e){return'nostorage';}}
function ident(){try{if(verifiedIdentity.uid){return{name:verifiedIdentity.name||'',mobile:verifiedIdentity.mobile||'',uid:verifiedIdentity.uid};}var u=JSON.parse(localStorage.getItem('smc_account')||localStorage.getItem('smc_user')||'null');if(u)return{name:u.name||'',mobile:mobile10(u.mobile||''),uid:u.uid||''};}catch(e){}return{name:'',mobile:'',uid:''};}
function audit(ev,detail){try{var u=ident(),g=smcGeoCached();sendToCloud('audit',{t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),sid:sid(),name:u.name,mobile:u.mobile,ev:ev,d:(detail==null?'':String(detail)).substring(0,120),pg:location.pathname,city:g.city||'',region:g.region||'',country:g.country||'',cc:g.cc||'',isp:g.isp||'',ip:g.ip||'',proxy:!!g.proxy,uid:u.uid||(window.firebase&&firebase.auth&&firebase.auth().currentUser&&firebase.auth().currentUser.uid)||''});}catch(e){}}
window.smcAudit=audit;window.smcSid=sid;
function idle(fn){if(window.requestIdleCallback)requestIdleCallback(fn,{timeout:2000});else setTimeout(fn,1000);}
idle(function collect(){var cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;resolveDevice(function(devName){smcGeo().then(function(g){g=g||{};v={t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),sid:sid(),dev:devName,os:getOS(ua),br:getBr(ua),scr:screen.width+'x'+screen.height,mob:/Mobile|Android|iPhone/i.test(ua),cores:navigator.hardwareConcurrency||'?',ram:navigator.deviceMemory||'?',net:cn?(cn.effectiveType||'?'):'?',lang:navigator.language,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,ref:document.referrer||'Direct',pg:location.pathname,touch:'ontouchstart'in window,city:g.city||'',region:g.region||'',country:g.country||'',cc:g.cc||'',isp:g.isp||'',ip:g.ip||'',proxy:!!g.proxy,flags:g.flags||''};try{var u=ident();if(u.name){v.name=u.name;v.mobile=u.mobile;v.uid=u.uid||'';}}catch(e){}save(v);audit('page_view',document.title||location.pathname);});});});
function save(v){try{var a=JSON.parse(localStorage.getItem('smc_visitors')||'[]');a.push(v);if(a.length>200)a.splice(0,a.length-200);localStorage.setItem('smc_visitors',JSON.stringify(a));}catch(e){}sendToCloud('visits',v);}
window.addEventListener('beforeunload',function(){try{if(!v)return;var d=Math.round((Date.now()-st)/1000),a=JSON.parse(localStorage.getItem('smc_visitors')||'[]');if(a.length)a[a.length-1].dur=d+'s';localStorage.setItem('smc_visitors',JSON.stringify(a));}catch(e){}});
idle(function attachClicks(){var clickTimeout=null,clickQueue=[];document.addEventListener('click',function(e){var c=e.target.closest('a,button,.k,.opt,.chip');if(c){var u=ident(),g=smcGeoCached(),label=(c.textContent||'').trim().substring(0,60)||(c.getAttribute&&(c.getAttribute('aria-label')||c.getAttribute('title'))||c.tagName);clickQueue.push({t:new Date().toLocaleTimeString('en-IN'),ts:new Date().toISOString(),x:label,p:location.pathname,sid:sid(),name:u.name,mobile:u.mobile,uid:u.uid,city:g.city||'',country:g.country||'',isp:g.isp||'',ip:g.ip||''});if(clickTimeout)clearTimeout(clickTimeout);clickTimeout=setTimeout(function(){var k=[];try{k=JSON.parse(localStorage.getItem('smc_clicks')||'[]');}catch(e){}for(var i=0;i<clickQueue.length;i++)k.push(clickQueue[i]);if(k.length>500)k.splice(0,k.length-500);try{localStorage.setItem('smc_clicks',JSON.stringify(k));}catch(e){}for(var j=0;j<clickQueue.length;j++){sendToCloud('clicks',clickQueue[j]);audit('click',clickQueue[j].x);}clickQueue=[];},450);}} ,{passive:true});});
function sendToCloud(collection,data){try{if(!window.firebase||!firebase.auth||!firebase.database)return;var user=firebase.auth().currentUser;if(!user)return;firebase.database().ref(collection).push(Object.assign({},data,{uid:user.uid})).catch(function(){});}catch(e){}}

/* ===== PREMIUM ACCOUNT ACCESS BRIDGE =====
   The old premium flow generated a device-local key and never created the
   Firebase payment request that the admin console approves. This bridge makes
   payment requests account-bound and makes premium access follow the approved
   Firebase entitlement instead of localStorage. */
(function(){
  var page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='premium.html'&&page!=='mock-test.html')return;
  var cfg=window.SMC_FIREBASE_CONFIG||{},fbReady=false,fbAuth=null,fbDb=null,currentUser=null,unsub=null;
  function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=function(){no(new Error(src))};document.head.appendChild(s)})}
  function init(){
    var p=Promise.resolve();
    if(!window.firebase||!firebase.initializeApp)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js')});
    if(!window.firebase||!firebase.auth)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth-compat.js')});
    if(!window.firebase||!firebase.database)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/12.17.1/firebase-database-compat.js')});
    return p.then(function(){if(!cfg.apiKey||!cfg.authDomain||!cfg.appId||!cfg.databaseURL)throw new Error('Firebase configuration missing');if(!firebase.apps.length)firebase.initializeApp(cfg);fbAuth=firebase.auth();fbDb=firebase.database();fbReady=true;return new Promise(function(resolve){var once=false;fbAuth.onAuthStateChanged(function(u){currentUser=u;if(!once){once=true;resolve(u)}});});});
  }
  function activeEnt(p){
    if(!p||p.subscriptionStatus!=='active')return false;
    if(!(p.entitlements&&p.entitlements.mockTests===true))return false;
    if(p.expiresAt){var t=Date.parse(p.expiresAt);if(Number.isFinite(t)&&t<=Date.now())return false;}
    return true;
  }
  function fullEnt(p){
    if(!activeEnt(p))return false;
    return p.entitlements&&p.entitlements.fullAccess===true;
  }
  function premiumUi(){
    var box=document.getElementById('alreadyPremium');
    if(box)box.style.display='block';
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});
    document.querySelectorAll('.premium-lock').forEach(function(e){e.style.display='none'});
    document.querySelectorAll('[data-pbadge]').forEach(function(e){e.textContent='UNLOCKED';e.className='tc-badge free'});
    document.querySelectorAll('.premium-card').forEach(function(e){e.classList.remove('locked')});
  }
  function pendingUi(orderId){
    var r=document.getElementById('keyResult'),v=document.getElementById('verifyPayBtn');
    if(v)v.style.display='none';
    if(r){r.style.display='block';r.innerHTML='<div class="access-key-box"><div style="font-size:3em;margin-bottom:4px">⏳</div><h3 style="color:var(--accent);font-weight:800;font-size:1.3em">Payment submitted</h3><p style="color:var(--txt);font-size:.85em;margin:8px 0">Your payment is waiting for admin approval. You do not need an access key.</p><div style="font-size:.7em;color:var(--dim);margin-bottom:8px">ORDER ID</div><div class="access-key" style="font-size:1em">'+String(orderId).replace(/[&<>"']/g,'')+'</div><p style="color:var(--dim);font-size:.75em;margin-top:10px">Keep this account signed in. Access will activate automatically after approval.</p></div><div class="btn-row" style="margin-top:16px"><a class="btn btn-primary" href="mock-test.html">Go to Mock Tests</a></div>'}
  }
  function overridePremium(){
    if(page!=='premium.html')return;
    var oldGo=window.goStep;
    if(typeof oldGo==='function'){
      window.goStep=function(step){
        if(step===3){
          var n=document.getElementById('userName'),p=document.getElementById('userPhone'),e=document.getElementById('userEmail');
          if(n&&!n.value.trim())n.value=(currentUser&&currentUser.displayName)||'Account Holder';
          if(e&&currentUser)e.value=currentUser.email||'';
          if(p)p.value='';
          for(var i=1;i<=4;i++){var dot=document.getElementById('sd'+i),line=document.getElementById('sl'+(i-1));if(i<step){if(dot)dot.className='step-dot done';if(line)line.className='step-line done'}else if(i===step){if(dot)dot.className='step-dot active';if(line)line.className='step-line done'}else{if(dot)dot.className='step-dot';if(line)line.className='step-line'}}
          document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});var target=document.getElementById('screen3');if(target)target.classList.add('active');if(typeof showPayment==='function')showPayment();if(typeof startSessionTimer==='function')startSessionTimer();window.scrollTo(0,0);return;
        }
        return oldGo(step);
      };
    }
    window.verifyPayment=async function(){
      if(!fbReady||!fbAuth||!fbDb){alert('Secure payment service is still loading. Please try again.');return;}
      var u=fbAuth.currentUser;if(!u){location.replace('login.html');return;}
      var txn=(document.getElementById('txnId')||{}).value.trim(),amount=parseInt((document.getElementById('txnAmount')||{}).value,10),plan=PLANS[selectedPlan];
      if(txn.length<6){alert('Enter the UTR / Transaction ID.');return;}
      if(amount!==plan.price){alert('Enter the exact amount paid: ₹'+plan.price);return;}
      var order=orderNumber||generateOrderId(),now=new Date().toISOString();
      var btn=document.getElementById('finalVerifyBtn');if(btn){btn.disabled=true;btn.textContent='Submitting payment...';}
      try{
        await fbDb.ref('payment_requests/'+order).set({orderId:order,uid:u.uid,email:u.email||'',name:(document.getElementById('userName')||{}).value.trim()||u.displayName||'Account Holder',phone:(document.getElementById('userPhone')||{}).value.trim(),plan:plan.price===99?'premium99':'premium49',planLabel:plan.name,amount:plan.price,txnId:txn,status:'pending',createdAt:now});
        try{localStorage.setItem('smc_last_payment_request',JSON.stringify({orderId:order,plan:plan.name,amount:plan.price,txnId:txn,createdAt:now}));}catch(e){}
        pendingUi(order);
        if(typeof smcAudit==='function')smcAudit('payment_submitted','Payment request '+order+' submitted for '+plan.name);
      }catch(e){console.error(e);alert('Payment request could not be submitted. Please check your signed-in account and try again.');if(btn){btn.disabled=false;btn.textContent='Verify & Get Access Key';}}
    };
    var email=document.getElementById('userEmail');if(email&&currentUser)email.value=currentUser.email||'';
  }
  function watchPremium(u){
    if(!u)return;
    if(unsub){try{unsub()}catch(e){}}
    unsub=fbDb.ref('users/'+u.uid).on('value',function(s){var p=s.val()||{};if(page==='premium.html'&&fullEnt(p))premiumUi();if(page==='mock-test.html'&&activeEnt(p))premiumUi();});
  }
  init().then(function(u){
    if(page==='premium.html'&&!u){location.replace('login.html');return;}
    watchPremium(u);
    if(page==='premium.html')overridePremium();
    if(page==='mock-test.html'){
      window.tryPremiumMock=function(id){if(window.__smcPremiumActive)startMock(id);else location.href='premium.html'};
      window.tryMock3=function(){window.tryPremiumMock(3)};
      fbAuth.onAuthStateChanged(function(user){currentUser=user;watchPremium(user);if(user)fbDb.ref('users/'+user.uid).once('value').then(function(s){window.__smcPremiumActive=activeEnt(s.val()||{});if(window.__smcPremiumActive)premiumUi();});});
    }
  }).catch(function(e){console.error('Premium bridge init failed',e);});
})();
})();
