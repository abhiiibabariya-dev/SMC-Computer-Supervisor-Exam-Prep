/* Firebase-backed subscription and payment-request flow.
 * IMPORTANT: this file is injected LAST on premium.html so it overrides the legacy
 * client-side verifyPayment implementation. It never grants premium access itself.
 */
(function(){
'use strict';
var cfg=window.SMC_FIREBASE_CONFIG||{}, db=(cfg.databaseURL||window.SMC_FIREBASE_URL||'').replace(/\/$/,'');
function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function boot(){var p=Promise.resolve();if(!window.firebase||!firebase.database)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js');});if(!window.firebase||!firebase.auth)p=p.then(function(){return load('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js');});return p.then(function(){if(!firebase.apps.length)firebase.initializeApp(cfg);});}
window.unlockVIP=function(){alert('VIP codes are disabled. Paid access is controlled by Firebase administrator approval.');return false;};
function selected(){var cards=document.querySelectorAll('.plan'),idx=0;cards.forEach(function(c,i){if(c.classList.contains('selected'))idx=i;});return idx===1?{price:49,plan:'premium49',label:'Premium ₹49'}:{price:99,plan:'premium99',label:'Premium ₹99'};}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
function getProfile(uid){return firebase.database().ref('users/'+encodeURIComponent(uid)).once('value').then(function(s){return s.val()||null;});}
function active(p){if(!p||p.subscriptionStatus!=='active')return false;if(p.expiresAt===null||p.expiresAt===undefined||p.expiresAt==='')return true;var t=Date.parse(p.expiresAt);return Number.isFinite(t)&&t>Date.now();}
function planLabel(p){return p&&p.planLabel||(p&&p.plan==='premium99'?'Premium ₹99':p&&p.plan==='premium49'?'Premium ₹49':'Free');}
function ensurePanel(){var id='smcPurchaseStatusPanel';var old=document.getElementById(id);if(old)return old;var el=document.createElement('div');el.id=id;el.style.cssText='margin:18px 0;padding:18px;border-radius:16px;background:#12121c;border:1px solid rgba(255,255,255,.1);color:#ddd;font:14px/1.6 system-ui,sans-serif';var main=document.querySelector('.main')||document.body;main.insertBefore(el,main.firstChild);return el;}
function renderGuide(p){
 var panel=ensurePanel();
 if(!p){panel.innerHTML='<b style="color:#fff">🔐 Login required for secure subscription</b><div style="margin-top:6px">Sign in before purchasing. Your payment request will be linked to your Firebase account.</div>';return;}
 var label=planLabel(p), exp=p.expiresAt?new Date(p.expiresAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Lifetime';
 if(active(p)){
   panel.innerHTML='<div style="font-size:18px;font-weight:800;color:#86efac">✅ '+esc(label)+' is active</div><div style="margin-top:6px">Expiry: <b>'+esc(exp)+'</b></div><ol style="margin:10px 0 0 20px;padding:0"><li>Stay signed in with this account.</li><li>Open <a href="mock-test.html" style="color:#a78bfa">Mock Tests</a> or the premium material available to your plan.</li><li>Your entitlement is checked against Firebase whenever premium access is opened.</li><li>If the subscription expires, premium access stops automatically.</li></ol>';
   return;
 }
 if(p.subscriptionStatus==='pending'){
   panel.innerHTML='<div style="font-size:18px;font-weight:800;color:#fde68a">⏳ Payment verification pending</div><div style="margin-top:6px">Your payment request has been submitted. Access is <b>not activated</b> until the administrator verifies the UPI transaction.</div><ol style="margin:10px 0 0 20px;padding:0"><li>Keep your UPI transaction/UTR details.</li><li>Do not submit the payment again unless the administrator asks.</li><li>Refresh this page after approval.</li><li>Once approved, your account will automatically show the active plan and expiry.</li></ol>';
   return;
 }
 if(p.subscriptionStatus==='rejected'){
   panel.innerHTML='<div style="font-size:18px;font-weight:800;color:#fca5a5">❌ Payment request rejected</div><div style="margin-top:6px">Please contact support with your UTR/order details before making another payment.</div>';return;
 }
 panel.innerHTML='<div style="font-size:18px;font-weight:800;color:#fff">🛒 How premium purchase works</div><ol style="margin:10px 0 0 20px;padding:0"><li>Select ₹49 Mock Tests or ₹99 Full Access.</li><li>Pay the exact amount through the displayed UPI QR/UPI ID.</li><li>Enter your UTR/Transaction ID.</li><li>Your request becomes <b>Pending</b>.</li><li>An administrator verifies the payment externally.</li><li>After approval, Firebase activates your entitlement.</li><li>Refresh or reopen the premium page to see your active access.</li></ol><div style="margin-top:10px;color:#9ca3af">No browser-generated VIP key is accepted anymore.</div>';
}
function submitRequest(){
 return boot().then(function(){
  var user=firebase.auth().currentUser;if(!user){location.replace('login.html');return;}
  return getProfile(user.uid).then(function(profile){if(active(profile)){renderGuide(profile);alert('Your '+planLabel(profile)+' subscription is already active.');return;}
   var plan=selected();var name=((document.getElementById('userName')||{}).value||user.displayName||'').trim();var phone=((document.getElementById('userPhone')||{}).value||'').replace(/\D/g,'');var email=((document.getElementById('userEmail')||{}).value||user.email||'').trim();var txn=((document.getElementById('txnId')||{}).value||'').trim();var amount=parseInt((document.getElementById('txnAmount')||{}).value||'0',10);
   if(name.length<2)return alert('Enter your full name.');if(!/^\d{10}$/.test(phone))return alert('Enter a valid 10-digit mobile number.');if(txn.length<6)return alert('Enter the UPI transaction/UTR number.');if(amount!==plan.price)return alert('Entered amount must match ₹'+plan.price+'.');
   var order='SMC-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,7).toUpperCase();
   var payload={orderId:order,uid:user.uid,email:user.email||email,name:name,phone:phone,plan:plan.plan,planLabel:plan.label,amount:plan.price,txnId:txn,status:'pending',createdAt:new Date().toISOString(),source:'website'};
   var btn=document.getElementById('finalVerifyBtn');if(btn){btn.disabled=true;btn.textContent='Submitting…';}
   return firebase.database().ref('payment_requests/'+order).set(payload).then(function(){
     var key=document.getElementById('accessKey');if(key)key.textContent='PENDING ADMIN APPROVAL';
     var kr=document.getElementById('keyResult');if(kr)kr.style.display='block';
     var vb=document.getElementById('verifyPayBtn');if(vb)vb.style.display='none';
     renderGuide({subscriptionStatus:'pending',plan:plan.plan,planLabel:plan.label});
     alert('Payment submitted. Your '+plan.label+' will activate after admin verification.');
   });
  });
 }).catch(function(e){var b=document.getElementById('finalVerifyBtn');if(b){b.disabled=false;b.textContent='Submit Payment for Verification';}alert(e.message||'Unable to submit payment request.');});
}
window.verifyPayment=submitRequest;
function watchUser(){boot().then(function(){var auth=firebase.auth();auth.onAuthStateChanged(function(user){if(!user){renderGuide(null);return;}getProfile(user.uid).then(function(p){renderGuide(p);}).catch(function(){renderGuide(null);});});});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchUser,{once:true});else watchUser();
})();
