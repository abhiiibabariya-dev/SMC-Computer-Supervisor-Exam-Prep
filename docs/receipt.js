/* Gujarat Govt Jobs Hub subscription receipt generator + EmailJS delivery.
 * Access remains controlled by Firebase approval. This helper only generates
 * a proof-of-purchase PDF from an already-approved payment record.
 */
(function(){
'use strict';
var SUPPORT_EMAIL='abhibabariya007@gmail.com';
var EMAIL_CONFIG={PUBLIC_KEY:'R9-pkw_CjpX-5Zayl',SERVICE_ID:'service_2lowtl2',TEMPLATE_CUSTOMER:'template_q0m6fjs'};
function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=function(){no(new Error('Failed to load '+src));};document.head.appendChild(s);});}
function money(v){return '₹'+Number(v||0).toLocaleString('en-IN');}
function date(v){if(!v)return 'N/A';var d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):String(v);}
function safeFile(v){return String(v||'receipt').replace(/[^a-z0-9_-]+/gi,'_');}
async function pdf(data){
 if(!window.jspdf)await load('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
 if(!window.jspdf||!window.jspdf.jsPDF)throw Error('Receipt PDF library could not be loaded.');
 var J=window.jspdf.jsPDF,doc=new J({unit:'mm',format:'a4'}),y0=24;
 doc.setFillColor(20,18,35);doc.rect(0,0,210,297,'F');
 doc.setTextColor(255,255,255);doc.setFontSize(20);doc.setFont(undefined,'bold');doc.text('Gujarat Govt Jobs Hub',18,y0);
 doc.setFontSize(11);doc.setFont(undefined,'normal');doc.setTextColor(196,181,253);doc.text('Subscription Payment Receipt',18,y0+8);
 doc.setTextColor(156,163,175);doc.text('Receipt ID: '+(data.receiptId||data.orderId||'N/A'),18,y0+18);
 doc.setDrawColor(70,70,85);doc.line(18,y0+24,192,y0+24);
 var y=y0+40;doc.setTextColor(134,239,172);doc.setFontSize(14);doc.setFont(undefined,'bold');doc.text('PAYMENT VERIFIED',18,y);y+=12;doc.setFontSize(11);doc.setFont(undefined,'normal');
 var rows=[['Customer Name',data.name||'N/A'],['Email',data.email||'N/A'],['Firebase Account ID',data.uid||'N/A'],['Order ID',data.orderId||'N/A'],['Plan',data.planLabel||data.plan||'N/A'],['Amount',money(data.amount)],['Payment Method','UPI'],['UPI Transaction / UTR',data.txnId||'N/A'],['Payment Date',date(data.createdAt||data.approvedAt)],['Approval Date',date(data.approvedAt)],['Subscription Expiry',data.expiresAt?date(data.expiresAt):'Lifetime'],['Entitlement',data.plan==='premium99'||data.planLabel==='Premium ₹99'?'Full Access':'Mock Tests']];
 rows.forEach(function(r){doc.setTextColor(156,163,175);doc.text(r[0],18,y);doc.setTextColor(245,245,245);var lines=doc.splitTextToSize(String(r[1]),112);doc.text(lines,78,y);y+=Math.max(8,lines.length*6);});
 y+=5;doc.setDrawColor(70,70,85);doc.line(18,y,192,y);y+=12;doc.setTextColor(253,230,138);doc.setFontSize(9);doc.text('Keep this receipt and your original UPI transaction confirmation for support.',18,y);y+=8;doc.setTextColor(156,163,175);doc.text('Support: '+SUPPORT_EMAIL,18,y);y+=6;doc.text('This receipt confirms activation recorded by the website administrator.',18,y);
 return {doc:doc,name:safeFile(data.orderId||data.receiptId||'SMC-receipt')+'.pdf'};
}
async function email(data){
 if(!data||!data.email)throw Error('Customer email is missing.');
 if(!window.emailjs)await load('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js');
 if(!window.emailjs||!window.emailjs.send)throw Error('Email service could not be loaded.');
 var r=await pdf(data),pdfData=r.doc.output('datauristring');
 window.emailjs.init({publicKey:EMAIL_CONFIG.PUBLIC_KEY});
 var p={to_email:data.email,name:data.name||'',email:data.email||'',uid:data.uid||'',order_id:data.orderId||'',order:data.orderId||'',plan:data.planLabel||data.plan||'',access:data.plan==='premium99'||data.planLabel==='Premium ₹99'?'Full Access':'Mock Tests',amount:Number(data.amount)||0,txn_id:data.txnId||'',txn:data.txnId||'',created_at:date(data.createdAt||data.approvedAt),approved_at:date(data.approvedAt||data.createdAt),date:date(data.approvedAt||data.createdAt),expires_at:data.expiresAt?date(data.expiresAt):'Lifetime',expiry:data.expiresAt?date(data.expiresAt):'Lifetime',receipt_id:data.receiptId||data.orderId||'',receipt_pdf:pdfData};
 return window.emailjs.send(EMAIL_CONFIG.SERVICE_ID,EMAIL_CONFIG.TEMPLATE_CUSTOMER,p);
}
window.SMCReceipt={generate:pdf,download:async function(data){var r=await pdf(data);r.doc.save(r.name);return r;},email:email,supportEmail:SUPPORT_EMAIL,config:{serviceId:EMAIL_CONFIG.SERVICE_ID,templateId:EMAIL_CONFIG.TEMPLATE_CUSTOMER}};
/* Automatically send one receipt after an approved subscription is detected. */
function autoReceipt(){
 if(!/\/premium\.html$/i.test(location.pathname))return;
 var cfg=window.SMC_FIREBASE_CONFIG||{};
 if(!cfg.apiKey||!cfg.databaseURL)return;
 var wait=window.firebase&&firebase.auth&&firebase.database?Promise.resolve():load('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js').then(function(){return load('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js');}).then(function(){return load('https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js');});
 wait.then(function(){if(!firebase.apps.length)firebase.initializeApp(cfg);var a=firebase.auth(),d=firebase.database();a.onAuthStateChanged(function(u){if(!u)return;d.ref('users/'+u.uid).once('value').then(function(s){var p=s.val()||{};if(p.subscriptionStatus!=='active'||!p.lastPaymentOrder)return;var key='smc_receipt_emailed_'+p.lastPaymentOrder;if(localStorage.getItem(key)==='1')return;return d.ref('payment_requests/'+p.lastPaymentOrder).once('value').then(function(ps){var r=ps.val()||{};if(r.status!=='approved')return;var data={receiptId:r.receiptId||r.orderId||p.lastPaymentOrder,uid:u.uid,email:u.email||p.email||r.email||'',name:r.name||p.name||u.displayName||'',orderId:r.orderId||p.lastPaymentOrder,plan:r.plan||p.plan,planLabel:r.planLabel||p.planLabel,amount:r.amount||0,txnId:r.txnId||p.lastPaymentTxn||'',createdAt:r.createdAt,approvedAt:r.reviewedAt||r.approvedAt||p.approvedAt,expiresAt:r.approvedExpiresAt||p.expiresAt};return email(data).then(function(){try{localStorage.setItem(key,'1');}catch(e){}});});}).catch(function(){});});}).catch(function(){});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',autoReceipt,{once:true});else setTimeout(autoReceipt,1500);
})();
