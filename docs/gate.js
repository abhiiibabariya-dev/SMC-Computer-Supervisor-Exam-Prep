/* SMC Access Gate — requires a name + a verified Indian mobile number before the
 * visitor can use the site. Captures the lead to Firebase (/leads) and writes a
 * security event (/security) so it shows in the daily SOC report.
 *
 * Verification: if a Firebase web config is available AND Phone sign-in is enabled,
 * the gate sends a real SMS OTP (Firebase Phone Auth, invisible reCAPTCHA) and only
 * unlocks after the code is confirmed (lead marked verified:true). If OTP is not
 * configured or the SMS send fails, it gracefully falls back to strict FORMAT
 * validation so real visitors are never locked out (lead marked verified:false).
 */
(function(){
    "use strict";
    var KEY='smc_user';
    var FB_URL='https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app';
    // Filled once apiKey + appId are known (or supplied via window.SMC_FIREBASE_CONFIG).
    var CONFIG_FALLBACK={apiKey:"",authDomain:"smc-exam-prep-38d22.firebaseapp.com",projectId:"smc-exam-prep-38d22",appId:""};

    try{var ex=JSON.parse(localStorage.getItem(KEY)||'null');if(ex&&ex.name&&ex.mobile)return;}catch(e){}

    function cfg(){var c=window.SMC_FIREBASE_CONFIG||CONFIG_FALLBACK;return (c&&c.apiKey&&c.appId)?c:null;}
    function fb(){return window.SMC_FIREBASE_URL||FB_URL;}
    function post(coll,data){try{var u=fb();if(!u)return;fetch(u+'/'+coll+'.json',{method:'POST',body:JSON.stringify(data),headers:{'Content-Type':'application/json'}}).catch(function(){});}catch(e){}}

    // ---- validation ------------------------------------------------------
    function cleanMobile(raw){
        var d=(raw||'').replace(/\D/g,'');
        if(d.length>10&&d.indexOf('91')===0)d=d.slice(d.length-10);
        if(d.length===11&&d.charAt(0)==='0')d=d.slice(1);
        return d;
    }
    function isFake(d){
        if(/^(\d)\1{9}$/.test(d))return true;
        if('01234567890123456789'.indexOf(d)>=0||'98765432109876543210'.indexOf(d)>=0)return true;
        var fakes=['1234567890','1234512345','9000000000','9123456789','1231231231'];
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

    // ---- Firebase Auth (lazy) -------------------------------------------
    var fbReady=null;
    function loadScript(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    function ensureFirebase(){
        if(fbReady)return fbReady;
        fbReady=loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
            .then(function(){return loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');})
            .then(function(){
                var c=cfg();
                if(!window.firebase||!c)throw new Error('no-config');
                if(!firebase.apps.length)firebase.initializeApp(c);
                return firebase.auth();
            });
        return fbReady;
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
        +'#smcGate .otp{letter-spacing:.4em;text-align:center;font-size:1.3em;font-weight:700}'
        +'#smcGate .err{color:#f87171;font-size:.82em;min-height:18px;margin:0 0 12px}'
        +'#smcGate button{width:100%;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:0;border-radius:12px;padding:14px;font-size:1em;font-weight:700;font-family:inherit;cursor:pointer;transition:transform .15s,opacity .2s}'
        +'#smcGate button:hover{transform:translateY(-1px)}'
        +'#smcGate button:disabled{opacity:.6;cursor:not-allowed}'
        +'#smcGate .lnk{background:none;color:#818cf8;font-size:.82em;font-weight:600;padding:10px 0 0;width:auto;display:block;margin:0 auto}'
        +'#smcGate .lnk:hover{transform:none;text-decoration:underline}'
        +'#smcGate .fp{color:#71717a;font-size:.72em;text-align:center;margin:14px 0 0;line-height:1.5}'
        +'#smcGate .hide{display:none}'
        +'</style>'
        +'<div class="gc" role="dialog" aria-modal="true">'
        +'  <div class="ic">🔐</div>'
        +'  <div id="smcStep1">'
        +'    <h2>Welcome to SMC Exam Prep</h2>'
        +'    <p class="s">Enter your name &amp; mobile number to unlock free practice tests, study material and daily current affairs for the SMC 2026 exam.</p>'
        +'    <label for="smcName">Full Name</label>'
        +'    <input id="smcName" type="text" autocomplete="name" placeholder="e.g. Rahul Patel" />'
        +'    <label for="smcMob">Mobile Number</label>'
        +'    <div class="row"><span class="cc">🇮🇳 +91</span><input id="smcMob" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="10-digit mobile" /></div>'
        +'    <div class="err" id="smcErr"></div>'
        +'    <button id="smcGo" type="button">Continue →</button>'
        +'  </div>'
        +'  <div id="smcStep2" class="hide">'
        +'    <h2>Verify your number</h2>'
        +'    <p class="s">We sent a 6-digit code to <b id="smcTo"></b>. Enter it below to unlock the site.</p>'
        +'    <label for="smcOtp">Enter OTP</label>'
        +'    <input id="smcOtp" class="otp" type="tel" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" />'
        +'    <div class="err" id="smcErr2"></div>'
        +'    <button id="smcVerify" type="button">Verify &amp; Unlock →</button>'
        +'    <button id="smcBack" class="lnk" type="button">← Change number</button>'
        +'  </div>'
        +'  <p class="fp">🔒 We only use this to keep the material free &amp; send exam updates. No spam.</p>'
        +'  <div id="smcRecaptcha"></div>'
        +'</div>';
        return wrap;
    }

    function mount(){
        if(document.getElementById('smcGate'))return;
        var g=build();
        document.body.appendChild(g);
        document.documentElement.style.overflow='hidden';
        document.body.style.overflow='hidden';

        var $=function(id){return g.querySelector(id);};
        var name=$('#smcName'),mob=$('#smcMob'),err=$('#smcErr'),go=$('#smcGo');
        var step1=$('#smcStep1'),step2=$('#smcStep2'),otp=$('#smcOtp'),err2=$('#smcErr2'),verify=$('#smcVerify'),back=$('#smcBack'),toEl=$('#smcTo');
        var current=null, confirmation=null;

        mob.addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,10);});
        otp.addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,6);});

        function finish(verified){
            var r=current;
            var rec={name:r.name,mobile:r.mobile,verified:!!verified,t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),pg:location.pathname,ref:document.referrer||'Direct',ua:navigator.userAgent};
            try{localStorage.setItem(KEY,JSON.stringify({name:r.name,mobile:r.mobile,verified:!!verified,t:rec.t}));}catch(e){}
            post('leads',rec);
            post('security',{time:rec.t,localTime:rec.lt,level:verified?'ok':'warn',msg:'New visitor '+(verified?'(OTP verified)':'(unverified)')+': '+r.name+' ('+r.mobile+')',src:'access-gate'});
            setTimeout(function(){document.documentElement.style.overflow='';document.body.style.overflow='';g.parentNode&&g.parentNode.removeChild(g);},300);
        }

        function startOtp(){
            go.disabled=true;go.textContent='Sending OTP…';
            ensureFirebase().then(function(auth){
                if(!window.__smcVerifier){
                    window.__smcVerifier=new firebase.auth.RecaptchaVerifier('smcRecaptcha',{size:'invisible'},auth);
                }
                return auth.signInWithPhoneNumber('+91'+current.mobile,window.__smcVerifier);
            }).then(function(conf){
                confirmation=conf;
                toEl.textContent='+91 '+current.mobile;
                step1.classList.add('hide');step2.classList.remove('hide');
                go.disabled=false;go.textContent='Continue →';
                setTimeout(function(){otp.focus();},150);
            }).catch(function(e){
                // OTP unavailable (no config / quota / domain not authorised) → graceful fallback.
                console.warn('OTP unavailable, falling back to format-only:',e&&e.message);
                finish(false);
            });
        }

        function onContinue(){
            var r=validate(name.value,mob.value);
            if(!r.ok){err.textContent=r.msg;return;}
            err.textContent='';current=r;
            if(cfg()){startOtp();}else{finish(false);}  // no OTP configured → unlock with format check
        }
        function onVerify(){
            var code=(otp.value||'').trim();
            if(code.length!==6){err2.textContent='Enter the 6-digit code.';return;}
            if(!confirmation){err2.textContent='Please request a new code.';return;}
            err2.textContent='';verify.disabled=true;verify.textContent='Verifying…';
            confirmation.confirm(code).then(function(){finish(true);})
            .catch(function(){verify.disabled=false;verify.textContent='Verify & Unlock →';err2.textContent='Incorrect or expired code. Try again.';});
        }

        go.addEventListener('click',onContinue);
        verify.addEventListener('click',onVerify);
        back.addEventListener('click',function(){step2.classList.add('hide');step1.classList.remove('hide');confirmation=null;name.focus();});
        mob.addEventListener('keydown',function(e){if(e.key==='Enter')onContinue();});
        name.addEventListener('keydown',function(e){if(e.key==='Enter')mob.focus();});
        otp.addEventListener('keydown',function(e){if(e.key==='Enter')onVerify();});
        setTimeout(function(){name.focus();},200);
    }

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
    else mount();
})();
