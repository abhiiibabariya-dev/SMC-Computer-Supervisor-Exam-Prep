/* SMC Access Gate — requires a name + a valid Indian mobile number before the
 * visitor can use the site. Captures the lead to Firebase (/leads) and writes a
 * security event (/security) so it shows in the daily SOC report.
 *
 * NOTE on "real numbers": this enforces strict FORMAT validation (10 digits,
 * starts 6-9, rejects all-same / sequential / known-fake patterns). That blocks
 * obviously fake input but cannot prove a number is genuinely owned by the user —
 * only an SMS OTP can. OTP (Firebase Phone Auth) can be layered on top later.
 */
(function(){
    "use strict";
    var KEY='smc_user';

    // Already identified? do nothing.
    try{var ex=JSON.parse(localStorage.getItem(KEY)||'null');if(ex&&ex.name&&ex.mobile)return;}catch(e){}

    function fb(){return window.SMC_FIREBASE_URL||'https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app';}
    function post(coll,data){try{var u=fb();if(!u)return;fetch(u+'/'+coll+'.json',{method:'POST',body:JSON.stringify(data),headers:{'Content-Type':'application/json'}}).catch(function(){});}catch(e){}}

    // ---- validation ------------------------------------------------------
    function cleanMobile(raw){
        var d=(raw||'').replace(/\D/g,'');      // digits only
        if(d.length>10&&d.indexOf('91')===0)d=d.slice(2);   // strip +91
        if(d.length===11&&d.charAt(0)==='0')d=d.slice(1);   // strip leading 0
        return d;
    }
    function isFake(d){
        if(/^(\d)\1{9}$/.test(d))return true;                 // 9999999999
        if('0123456789'.indexOf(d)>=0||'9876543210'.indexOf(d)>=0)return true; // straight runs
        var fakes=['1234567890','1111111111','1234512345','9999999999','8888888888','7777777777','6666666666','9000000000','9123456789'];
        return fakes.indexOf(d)>=0;
    }
    function validate(name,raw){
        name=(name||'').trim();
        if(name.length<3)return{ok:false,msg:'Please enter your full name (at least 3 letters).'};
        if(!/[a-zA-Zऀ-ॿ]/.test(name))return{ok:false,msg:'Name should contain letters.'};
        var d=cleanMobile(raw);
        if(d.length!==10)return{ok:false,msg:'Mobile number must be exactly 10 digits.'};
        if(!/^[6-9]/.test(d))return{ok:false,msg:'Indian mobile numbers start with 6, 7, 8 or 9.'};
        if(isFake(d))return{ok:false,msg:'That number looks invalid. Please enter your real number.'};
        return{ok:true,name:name,mobile:d};
    }

    // ---- UI --------------------------------------------------------------
    function build(){
        var wrap=document.createElement('div');
        wrap.id='smcGate';
        wrap.innerHTML=''
        +'<style>'
        +'#smcGate{position:fixed;inset:0;z-index:2147483600;background:rgba(6,6,10,0.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif}'
        +'#smcGate .gc{width:100%;max-width:420px;background:#111113;border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:30px 26px;box-shadow:0 30px 80px rgba(0,0,0,0.6);animation:smcUp .5s cubic-bezier(.16,1,.3,1)}'
        +'@keyframes smcUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}'
        +'#smcGate .ic{width:52px;height:52px;border-radius:14px;background:rgba(99,102,241,.14);display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px}'
        +'#smcGate h2{color:#fafafa;font-size:1.35em;font-weight:800;letter-spacing:-.5px;margin:0 0 6px}'
        +'#smcGate p.s{color:#a1a1aa;font-size:.9em;line-height:1.5;margin:0 0 20px}'
        +'#smcGate label{display:block;color:#d4d4d8;font-size:.8em;font-weight:600;margin:0 0 6px}'
        +'#smcGate input{width:100%;background:#18181b;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:13px 14px;color:#fafafa;font-size:1em;font-family:inherit;outline:none;transition:border-color .2s;margin-bottom:14px}'
        +'#smcGate input:focus{border-color:#6366f1}'
        +'#smcGate .row{display:flex;align-items:stretch;gap:0;margin-bottom:14px}'
        +'#smcGate .cc{display:flex;align-items:center;padding:0 12px;background:#18181b;border:1px solid rgba(255,255,255,.1);border-right:none;border-radius:12px 0 0 12px;color:#a1a1aa;font-size:.95em;white-space:nowrap}'
        +'#smcGate .row input{border-radius:0 12px 12px 0;margin-bottom:0}'
        +'#smcGate .err{color:#f87171;font-size:.82em;min-height:18px;margin:0 0 12px}'
        +'#smcGate button{width:100%;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:0;border-radius:12px;padding:14px;font-size:1em;font-weight:700;font-family:inherit;cursor:pointer;transition:transform .15s,opacity .2s}'
        +'#smcGate button:hover{transform:translateY(-1px)}'
        +'#smcGate button:disabled{opacity:.6;cursor:not-allowed}'
        +'#smcGate .fp{color:#71717a;font-size:.72em;text-align:center;margin:14px 0 0;line-height:1.5}'
        +'</style>'
        +'<div class="gc" role="dialog" aria-modal="true">'
        +'  <div class="ic">🔐</div>'
        +'  <h2>Welcome to SMC Exam Prep</h2>'
        +'  <p class="s">Enter your name &amp; mobile number to unlock free practice tests, study material and daily current affairs for the SMC 2026 exam.</p>'
        +'  <label for="smcName">Full Name</label>'
        +'  <input id="smcName" type="text" autocomplete="name" placeholder="e.g. Rahul Patel" />'
        +'  <label for="smcMob">Mobile Number</label>'
        +'  <div class="row"><span class="cc">🇮🇳 +91</span><input id="smcMob" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="10-digit mobile" /></div>'
        +'  <div class="err" id="smcErr"></div>'
        +'  <button id="smcGo" type="button">Unlock Free Access →</button>'
        +'  <p class="fp">🔒 We only use this to keep the material free &amp; send exam updates. No spam.</p>'
        +'</div>';
        return wrap;
    }

    function mount(){
        if(document.getElementById('smcGate'))return;
        var g=build();
        document.body.appendChild(g);
        document.documentElement.style.overflow='hidden';
        document.body.style.overflow='hidden';

        var name=g.querySelector('#smcName');
        var mob=g.querySelector('#smcMob');
        var err=g.querySelector('#smcErr');
        var go=g.querySelector('#smcGo');

        mob.addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,10);});
        function submit(){
            var r=validate(name.value,mob.value);
            if(!r.ok){err.textContent=r.msg;return;}
            err.textContent='';go.disabled=true;go.textContent='Unlocking…';
            var rec={name:r.name,mobile:r.mobile,t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),pg:location.pathname,ref:document.referrer||'Direct',ua:navigator.userAgent};
            try{localStorage.setItem(KEY,JSON.stringify({name:r.name,mobile:r.mobile,t:rec.t}));}catch(e){}
            post('leads',rec);
            post('security',{time:rec.t,localTime:rec.lt,level:'ok',msg:'New visitor registered: '+r.name+' ('+r.mobile+')',src:'access-gate'});
            // brief beat so the write fires, then reveal the site
            setTimeout(function(){
                document.documentElement.style.overflow='';
                document.body.style.overflow='';
                g.parentNode&&g.parentNode.removeChild(g);
            },350);
        }
        go.addEventListener('click',submit);
        mob.addEventListener('keydown',function(e){if(e.key==='Enter')submit();});
        name.addEventListener('keydown',function(e){if(e.key==='Enter')mob.focus();});
        setTimeout(function(){name.focus();},200);
    }

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
    else mount();
})();
