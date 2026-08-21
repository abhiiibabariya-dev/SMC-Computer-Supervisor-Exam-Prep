/* SMC subscription receipt generator and email helper.
 * PDF is generated locally in the customer's browser from the verified Firebase payment record.
 * No payment credentials are stored in the PDF.
 */
(function(){
'use strict';
var SUPPORT_EMAIL='abhibabariya007@gmail.com';
var EMAIL_CONFIG={PUBLIC_KEY:'PASTE_PUBLIC_KEY_HERE',SERVICE_ID:'PASTE_SERVICE_ID_HERE',TEMPLATE_CUSTOMER:'PASTE_CUSTOMER_TEMPLATE_ID_HERE'};
function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
function readyEmail(){return window.emailjs&&EMAIL_CONFIG.PUBLIC_KEY.indexOf('PASTE_')!==0&&EMAIL_CONFIG.SERVICE_ID.indexOf('PASTE_')!==0&&EMAIL_CONFIG.TEMPLATE_CUSTOMER.indexOf('PASTE_')!==0;}
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
 var y=y0+40;doc.setTextColor(134,239,172);doc.setFontSize(14);doc.setFont(undefined,'bold');doc.text('PAYMENT VERIFIED',18,y);
 y+=12;doc.setFontSize(11);doc.setFont(undefined,'normal');
 var rows=[['Customer Name',data.name||'N/A'],['Email',data.email||'N/A'],['Firebase Account ID',data.uid||'N/A'],['Order ID',data.orderId||'N/A'],['Plan',data.planLabel||data.plan||'N/A'],['Amount',money(data.amount)],['Payment Method','UPI'],['UPI Transaction / UTR',data.txnId||'N/A'],['Payment Date',date(data.createdAt||data.approvedAt)],['Approval Date',date(data.approvedAt)],['Subscription Expiry',data.expiresAt?date(data.expiresAt):'Lifetime'],['Entitlement',data.plan==='premium99'||data.planLabel==='Premium ₹99'?'Full Access':'Mock Tests']];
 rows.forEach(function(r){doc.setTextColor(156,163,175);doc.text(r[0],18,y);doc.setTextColor(245,245,245);var val=String(r[1]);var lines=doc.splitTextToSize(val,112);doc.text(lines,78,y);y+=Math.max(8,lines.length*6);});
 y+=5;doc.setDrawColor(70,70,85);doc.line(18,y,192,y);y+=12;doc.setTextColor(253,230,138);doc.setFontSize(9);doc.text('Keep this receipt and your original UPI transaction confirmation for support.',18,y);y+=8;doc.setTextColor(156,163,175);doc.text('Support: '+SUPPORT_EMAIL,18,y);y+=6;doc.text('This receipt confirms activation recorded by the website administrator.',18,y);
 return {doc:doc,name:safeFile(data.orderId||data.receiptId||'SMC-receipt')+'.pdf'};
}
window.SMCReceipt={
 generate:pdf,
 download:async function(data){var r=await pdf(data);r.doc.save(r.name);return r;},
 email:async function(data){
  if(!readyEmail())throw Error('Email receipt is not configured yet. Add the EmailJS public key, service ID and customer template ID in receipt.js.');
  if(!data.email)throw Error('Customer email is missing.');
  if(!window.emailjs)await load('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js');
  window.emailjs.init({publicKey:EMAIL_CONFIG.PUBLIC_KEY});
  var p={to_email:data.email,name:data.name||'',order:data.orderId||'',plan:data.planLabel||data.plan||'',amount:money(data.amount),txn:data.txnId||'',date:date(data.approvedAt||data.createdAt),uid:data.uid||'',expiry:data.expiresAt?date(data.expiresAt):'Lifetime',receipt_id:data.receiptId||data.orderId||''};
  return window.emailjs.send(EMAIL_CONFIG.SERVICE_ID,EMAIL_CONFIG.TEMPLATE_CUSTOMER,p);
 },
 supportEmail:SUPPORT_EMAIL
};
})();
