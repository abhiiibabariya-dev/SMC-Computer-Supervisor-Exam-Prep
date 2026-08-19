/* Replace the legacy client-side "auto approve" flow with a real payment request.
 * A successful submit creates /payment_requests/{orderId}. It does NOT grant access.
 * Admin approval changes /users/{uid}.plan and entitlements.
 */
(function(){
'use strict';
var cfg=window.SMC_FIREBASE_CONFIG||{},db=(cfg.databaseURL||window.SMC_FIREBASE_URL||'').replace(/\/$/,'');
function ready(){return !!(window.firebase&&firebase.auth&&firebase.apps&&firebase.apps.length&&db);}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
window.unlockVIP=function(){try{localStorage.removeItem('smc_vip');localStorage.removeItem('smc_premium_key');}catch(e){}alert('VIP codes are disabled. All paid access is now controlled by Firebase subscription approval.');return false;};
function submitRequest(){
 if(!ready()){alert('Secure payment system is not ready. Please reload and try again.');return;}
 var user=firebase.auth().currentUser;if(!user){location.replace('login.html');return;}
 var plan=window.PLANS&&window.PLANS[window.selectedPlan||0];
 var name=(document.getElementById('userName')||{}).value||user.displayName||'';
 var phone=(document.getElementById('userPhone')||{}).value||'';
 var email=(document.getElementById('userEmail')||{}).value||user.email||'';
 var txn=(document.getElementById('txnId')||{}).value||'';
 var amount=parseInt((document.getElementById('txnAmount')||{}).value||'0',10);
 if(!plan){alert('Please select a plan.');return;}
 if(name.trim().length<2){alert('Enter your full name.');return;}
 if(!/^\d{10}$/.test(phone.trim())){alert('Enter a valid 10-digit mobile number.');return;}
 if(txn.trim().length<6){alert('Enter the UPI transaction/UTR number.');return;}
 if(amount!==plan.price){alert('Entered amount must match ₹'+plan.price+'.');return;}
 var order=window.orderNumber||('SMC-'+Date.now().toString(36).toUpperCase());
 var payload={orderId:order,uid:user.uid,email:user.email||email,name:name.trim(),phone:phone.trim(),plan:window.selectedPlan===1?'premium49':'premium99',planLabel:window.selectedPlan===1?'Premium ₹49':'Premium ₹99',amount:plan.price,txnId:txn.trim(),status:'pending',createdAt:new Date().toISOString(),source:'website'};
 var btn=document.getElementById('finalVerifyBtn');if(btn){btn.disabled=true;btn.textContent='Submitting…';}
 fetch(db+'/payment_requests/'+encodeURIComponent(order)+'.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
 .then(function(r){if(!r.ok)throw Error('Payment request could not be submitted');return r.json();})
 .then(function(){
   try{localStorage.removeItem('smc_premium_key');localStorage.removeItem('smc_premium_plan');localStorage.removeItem('smc_device_bind');localStorage.removeItem('smc_vip');}catch(e){}
   var key=document.getElementById('accessKey');if(key)key.textContent='PENDING ADMIN APPROVAL';
   var kr=document.getElementById('keyResult');if(kr){kr.style.display='block';kr.querySelectorAll('p').forEach(function(p){if(/key|activated/i.test(p.textContent))p.textContent='Payment submitted successfully. Access will be activated only after admin verification.';});}
   var vb=document.getElementById('verifyPayBtn');if(vb)vb.style.display='none';
   if(window.sessionTimeout)clearInterval(window.sessionTimeout);
   alert('Payment submitted. Your ₹'+plan.price+' subscription will activate after payment verification.');
 })
 .catch(function(e){if(btn){btn.disabled=false;btn.textContent='Submit Payment for Verification';}alert(e.message||'Unable to submit payment request.');});
}
window.verifyPayment=submitRequest;
})();
