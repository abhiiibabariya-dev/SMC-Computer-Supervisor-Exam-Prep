/* Real payment request flow. Never grants premium access client-side. */
(function(){
'use strict';
var cfg=window.SMC_FIREBASE_CONFIG||{},db=(cfg.databaseURL||window.SMC_FIREBASE_URL||'').replace(/\/$/,'');
function ready(){return !!(window.firebase&&firebase.auth&&firebase.apps&&firebase.apps.length&&db);}
window.unlockVIP=function(){try{localStorage.removeItem('smc_vip');localStorage.removeItem('smc_premium_key');}catch(e){}alert('VIP codes are disabled. Paid access is controlled by Firebase approval.');return false;};
function selected(){var cards=document.querySelectorAll('.plan');var idx=0;cards.forEach(function(c,i){if(c.classList.contains('selected'))idx=i;});return idx===1?{price:49,plan:'premium49',label:'Premium ₹49'}:{price:99,plan:'premium99',label:'Premium ₹99'};}
function submitRequest(){
 if(!ready()){alert('Secure payment system is not ready. Please reload and try again.');return;}
 var user=firebase.auth().currentUser;if(!user){location.replace('login.html');return;}
 var plan=selected();
 var name=((document.getElementById('userName')||{}).value||user.displayName||'').trim();
 var phone=((document.getElementById('userPhone')||{}).value||'').replace(/\D/g,'');
 var email=((document.getElementById('userEmail')||{}).value||user.email||'').trim();
 var txn=((document.getElementById('txnId')||{}).value||'').trim();
 var amount=parseInt((document.getElementById('txnAmount')||{}).value||'0',10);
 if(name.length<2){alert('Enter your full name.');return;}
 if(!/^\d{10}$/.test(phone)){alert('Enter a valid 10-digit mobile number.');return;}
 if(txn.length<6){alert('Enter the UPI transaction/UTR number.');return;}
 if(amount!==plan.price){alert('Entered amount must match ₹'+plan.price+'.');return;}
 var order='SMC-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,7).toUpperCase();
 var payload={orderId:order,uid:user.uid,email:user.email||email,name,phone,plan:plan.plan,planLabel:plan.label,amount:plan.price,txnId:txn,status:'pending',createdAt:new Date().toISOString(),source:'website'};
 var btn=document.getElementById('finalVerifyBtn');if(btn){btn.disabled=true;btn.textContent='Submitting…';}
 fetch(db+'/payment_requests/'+encodeURIComponent(order)+'.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
 .then(function(r){if(!r.ok)throw Error('Payment request could not be submitted');return r.json();})
 .then(function(){
   try{localStorage.removeItem('smc_premium_key');localStorage.removeItem('smc_premium_plan');localStorage.removeItem('smc_device_bind');localStorage.removeItem('smc_vip');}catch(e){}
   var key=document.getElementById('accessKey');if(key)key.textContent='PENDING APPROVAL';
   var kr=document.getElementById('keyResult');if(kr)kr.style.display='block';
   var vb=document.getElementById('verifyPayBtn');if(vb)vb.style.display='none';
   alert('Payment submitted. ₹'+plan.price+' access will activate only after admin verifies the UPI transaction.');
 })
 .catch(function(e){if(btn){btn.disabled=false;btn.textContent='Submit Payment for Verification';}alert(e.message||'Unable to submit payment request.');});
}
window.verifyPayment=submitRequest;
})();
