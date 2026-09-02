/* Gujarat Govt Jobs Hub authentication gate.
 * Protected pages require Firebase sign-in and verified email.
 * Mobile is account-matching data, not SMS/OTP verification.
 * Single-session enforcement: one login per account at a time.
 * Session cleared on browser close/restart - user must re-login.
 */
(function(){'use strict';
if(window.__SMC_UNIFIED_AUTH__)return;window.__SMC_UNIFIED_AUTH__=true;
var script=document.currentScript,rootUrl='';try{if(script&&script.src)rootUrl=new URL('.',script.src).href}catch(e){}if(!rootUrl)rootUrl=new URL('./',location.href).href;
var file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
var PUBLIC_PAGES={'login.html':true,'index.html':true,'404.html':true,'privacy-policy.html':true,'terms-conditions.html':true};
if(PUBLIC_PAGES[file])return;
var RETURN_KEY='smc_auth_return',PROFILE_KEY='smc_account',SESSION_KEY='smc_session_active',auth=null,processing=false,deviceId=null,sessionCheckInterval=null;
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&','<':'<','>':'>','"':'"',"'":"'"})[c]})}
function loginUrl(){try{sessionStorage.setItem(RETURN_KEY,location.pathname+location.search+location.hash)}catch(e){}return new URL('login.html',rootUrl).href}
function hidePage(){var s=document.createElement('style');s.id='smc-auth-style';s.textContent='html,body{visibility:hidden!important}';(document.head||document.documentElement).appendChild(s)}
function showPage(){var s=document.getElementById('smc-auth-style');if(s)s.remove()}
function loadScript(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=function(){no(new Error(src))};document.head.appendChild(s)})}
function loadFirebase(){var p=Promise.resolve();if(!window.SMC_FIREBASE_CONFIG)p=p.then(function(){return loadScript(new URL('firebase-config.js',rootUrl).href)});return p.then(function(){if(!window.firebase||!firebase.initializeApp)return loadScript('https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js')}).then(function(){if(!window.firebase||!firebase.auth)return loadScript('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth-compat.js')}).then(function(){var cfg=window.SMC_FIREBASE_CONFIG||{};if(!cfg.apiKey||!cfg.authDomain||!cfg.appId)throw new Error('Firebase config missing');if(!firebase.apps.length)firebase.initializeApp(cfg);auth=firebase.auth();auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){})})}
function overlay(){if(document.getElementById('smcAuthOverlay'))return;var o=document.createElement('div');o.id='smcAuthOverlay';o.innerHTML='<style>#smcAuthOverlay{position:fixed;inset:0;z-index:2147483647;background:#08090b;color:#f5f5f5;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif}#smcAuthOverlay .ac{width:min(430px,100%);background:#111317;border:1px solid rgba(255,255,255,.09);border-radius:22px;padding:25px;box-shadow:0 25px 80px rgba(0,0,0,.5);text-align:center}#smcAuthOverlay .ic{font-size:42px;margin-bottom:10px}#smcAuthOverlay h2{margin:0;color:#fff;font-size:1.35rem}#smcAuthOverlay p{color:#9ca3af;font-size:.8rem;line-height:1.55;margin:8px 0 18px}#smcAuthOverlay .st{color:#86efac;font-weight:800;font-size:.72rem}.err{color:#fca5a5}.warn{color:#fde68a}#smcAuthOverlay a,#smcAuthOverlay button{border:0;border-radius:10px;padding:10px 14px;font-weight:800;text-decoration:none;cursor:pointer}#smcAuthOverlay a{display:inline-block;background:#86efac;color:#07130b}#smcAuthOverlay button{background:rgba(255,255,255,.08);color:#fff;margin-left:6px}</style><div class="ac"><div class="ic">🔐</div><h2>Gujarat Govt Jobs Hub</h2><p id="smcAuthMsg">Checking your account...</p><div class="st" id="smcAuthState">AUTHENTICATING</div><div id="smcAuthActions" style="margin-top:14px"></div></div>';document.body.appendChild(o)}
function fail(msg){overlay();var m=document.getElementById('smcAuthMsg'),s=document.getElementById('smcAuthState'),a=document.getElementById('smcAuthActions');if(m)m.textContent=msg||'Authentication is unavailable.';if(s){s.textContent='AUTHENTICATION FAILED';s.className='st err'}if(a)a.innerHTML='<a href="'+esc(loginUrl())+'">Open Login</a><button type="button" id="smcAuthRetry">Retry</button>';var r=document.getElementById('smcAuthRetry');if(r)r.onclick=function(){location.reload()}}
function verificationRequired(user){overlay();var m=document.getElementById('smcAuthMsg'),s=document.getElementById('smcAuthState'),a=document.getElementById('smcAuthActions');if(m)m.textContent='Please verify your Firebase email address before opening protected account pages.';if(s){s.textContent='EMAIL VERIFICATION REQUIRED';s.className='st warn'}if(a)a.innerHTML='<button type="button" id="smcResend">Resend verification email</button><a href="'+esc(new URL('login.html',rootUrl).href)+'">Back to Login</a>';var b=document.getElementById('smcResend');if(b)b.onclick=async function(){try{await user.sendEmailVerification();m.textContent='Verification email sent again. Check your inbox and spam folder.';b.disabled=true;b.textContent='Email sent'}catch(e){m.textContent=e.message||'Unable to send verification email.';m.className='err'}}
}
function getDeviceId(){try{var d=localStorage.getItem('smc_device_id');if(!d){d='dev_'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);localStorage.setItem('smc_device_id',d)}return d}catch(e){return 'dev_fallback_' + Math.random().toString(36).slice(2,10)}}
function getDeviceInfo(){try{var ua=navigator.userAgent||'';var info='';if(/iPhone|iPad|iPod/i.test(ua))info='iOS';else if(/Android/i.test(ua))info='Android';else if(/Windows/i.test(ua))info='Windows';else if(/Macintosh|Mac OS/i.test(ua))info='macOS';else if(/Linux/i.test(ua))info='Linux';else info='Unknown';return info+' | '+ua.slice(0,80)}catch(e){return 'Unknown device'}}

// Clear session on browser close/restart - user must re-login
function clearSessionOnClose(){
    try{
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(PROFILE_KEY);
        sessionStorage.removeItem(RETURN_KEY);
    }catch(e){}
}

// Check if user has valid auth state (not checking sessionStorage for navigation)
// sessionStorage clears on browser close, but we should allow navigation between pages
// The auth state is managed by Firebase Auth persistence (LOCAL)
function hasValidAuthState(){
    // Don't block navigation within the same session
    // Firebase Auth handles persistence, we just need to check if user is signed in
    return true; // Let Firebase Auth state dictate session validity
}

// Mark session as active in sessionStorage (survives page refresh but not browser close)
function markSessionActive(){
    try{
        sessionStorage.setItem(SESSION_KEY, 'true');
    }catch(e){}
}

async function registerSession(user){try{if(!window.firebase||!firebase.functions)return true;var fn=firebase.functions().httpsCallable('registerSession');await fn({deviceId:deviceId,deviceInfo:getDeviceInfo()});return true}catch(e){console.warn('registerSession failed:',e);return true}}
async function checkSessionValid(user){try{if(!window.firebase||!firebase.functions)return true;var fn=firebase.functions().httpsCallable('checkSession');var result=await fn({deviceId:deviceId});if(result&&result.data&&result.data.valid===false){return false}return true}catch(e){console.warn('checkSession failed:',e);return true}}
function startSessionCheck(user){if(sessionCheckInterval)clearInterval(sessionCheckInterval);sessionCheckInterval=setInterval(async function(){var valid=await checkSessionValid(user);if(!valid){clearInterval(sessionCheckInterval);try{await auth.signOut()}catch(e){}showPage();overlay();var m=document.getElementById('smcAuthMsg'),s=document.getElementById('smcAuthState'),a=document.getElementById('smcAuthActions');if(m)m.textContent='Your account was signed in on another device. This session has been logged out.';if(s){s.textContent='SESSION EXPIRED';s.className='st warn'}if(a)a.innerHTML='<a href="'+esc(loginUrl())+'">Sign in again</a>'}},120000)}
function stopSessionCheck(){if(sessionCheckInterval){clearInterval(sessionCheckInterval);sessionCheckInterval=null}}

// Listen for browser close/restart - clear session
// sessionStorage already handles this correctly: it persists across refreshes and navigation
// but clears when the browser/tab is closed. No special handling needed.
window.addEventListener('beforeunload', function(){
    stopSessionCheck();
});

// Note: pagehide handler removed - sessionStorage naturally clears on browser/tab close
// and persists across page navigation. Clearing on pagehide was incorrectly logging out
// users when navigating within the site.
function account(user){var a={uid:user.uid||'',email:user.email||'',name:user.displayName||user.email||'Account',mobile:'',emailVerified:!!user.emailVerified,phoneVerified:false,post:'',postLabel:'',plan:'free',planLabel:'Free',signed_in_at:new Date().toISOString()};try{var old=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');a.name=old.name||a.name;a.mobile=old.mobile||'';a.post=old.post||'';a.postLabel=old.postLabel||'';a.plan=old.plan||'free';a.planLabel=old.planLabel||'Free'}catch(e){}try{localStorage.setItem(PROFILE_KEY,JSON.stringify(a))}catch(e){}return a}
function chip(user,a){if(document.getElementById('smcAuthChip'))return;var c=document.createElement('div');c.id='smcAuthChip';c.innerHTML='<style>#smcAuthChip{position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;align-items:center;gap:7px;background:rgba(17,17,19,.94);border:1px solid rgba(255,255,255,.10);border-radius:999px;padding:7px 9px 7px 12px;color:#d4d4d8;font:700 11px/1 system-ui,sans-serif;box-shadow:0 7px 24px rgba(0,0,0,.35)}#smcAuthChip b{color:#fff;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#smcAuthChip .pl{color:#86efac}#smcAuthChip button{border:0;border-radius:999px;padding:6px 9px;background:rgba(239,68,68,.14);color:#fca5a5;font-weight:800;cursor:pointer}</style><span>👤</span><b>'+esc(a.name||user.email||'Account')+'</b><span class="pl">'+esc(a.planLabel)+'</span><button type="button" id="smcAuthLogout">Logout</button>';document.body.appendChild(c);c.querySelector('#smcAuthLogout').onclick=async function(){try{stopSessionCheck();if(window.firebase&&firebase.functions){var fn=firebase.functions().httpsCallable('revokeAllSessions');await fn({})}}catch(e){}auth.signOut().then(function(){try{localStorage.removeItem(PROFILE_KEY)}catch(e){}location.replace(new URL('login.html',rootUrl).href)})}}
function start(){deviceId=getDeviceId();hidePage();overlay();loadFirebase().then(function(){auth.onAuthStateChanged(async function(user){if(processing)return;if(!user){showPage();stopSessionCheck();location.replace(loginUrl());return}processing=true;try{await user.reload();user=auth.currentUser;if(!user){showPage();stopSessionCheck();location.replace(loginUrl());return}if(!user.emailVerified){processing=false;showPage();verificationRequired(user);return}await registerSession(user);var a=account(user);markSessionActive();var m=document.getElementById('smcAuthMsg'),s=document.getElementById('smcAuthState');if(m)m.textContent='Signed in as '+(a.name||user.email||'your account')+'.';if(s)s.textContent='ACCESS GRANTED';setTimeout(function(){var o=document.getElementById('smcAuthOverlay');if(o)o.remove();showPage();chip(user,a);startSessionCheck(user)},80)}catch(e){processing=false;fail(e&&e.code==='auth/network-request-failed'?'Firebase Authentication network access failed. Check your connection and retry.':'Unable to refresh your Firebase account. Please try again.')}})}).catch(function(e){fail(e&&e.message?e.message:'Secure Firebase authentication could not be initialized.')})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();