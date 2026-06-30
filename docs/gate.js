/* SMC Access Gate — requires a name + an Indian mobile, then verifies the visitor
 * with a real OTP over WhatsApp OR Email (visitor's choice) before unlocking the
 * site. Captures the lead to Firebase (/leads) and writes a /security event so it
 * shows in the daily SOC report.
 *
 * Verification is powered by OTPless (free WhatsApp + Email OTP, no card needed):
 *   - WhatsApp OTP → channel "PHONE" (delivered via WhatsApp when enabled in the
 *     OTPless dashboard, auto-fallback to SMS).
 *   - Email OTP    → channel "EMAIL".
 * Set the OTPless App ID in firebase-config.js (window.SMC_OTPLESS_APP_ID). Until
 * it's set — or if the OTP send fails — the gate gracefully falls back to strict
 * FORMAT validation so real visitors are never locked out (lead marked verified:false).
 */
(function(){
    "use strict";
    var KEY='smc_user';
    var FB_URL='https://smc-exam-prep-38d22-default-rtdb.asia-southeast1.firebasedatabase.app';
    // OTPless App ID (PUBLIC client id). Pulled from firebase-config.js if present.
    var OTPLESS_APP_ID=window.SMC_OTPLESS_APP_ID||'';
    // Master switch. Real OTP is attempted only when an App ID is also present;
    // otherwise the gate uses instant name+number format validation.
    var OTP_ENABLED=true;
    function otpOn(){return !!(OTP_ENABLED&&OTPLESS_APP_ID);}

    // Logout / reset: visiting any page with ?logout (or #logout) clears the saved
    // identity and reloads cleanly so the gate shows again.
    try{
        if(/[?&#]logout\b/i.test(location.href)){
            localStorage.removeItem(KEY);
            var clean=location.href.replace(/([?&])logout(=[^&#]*)?/ig,'$1').replace(/[?&#]+$/,'').replace(/#.*$/,'');
            location.replace(clean||location.pathname);return;
        }
    }catch(e){}

    // Already identified → no gate; just show a small "logged in / Logout" chip.
    try{var ex=JSON.parse(localStorage.getItem(KEY)||'null');if(ex&&ex.name&&ex.mobile){showChip(ex);return;}}catch(e){}

    function showChip(u){
        if(document.getElementById('smcChip'))return;
        function go(){
            var c=document.createElement('div');
            c.id='smcChip';
            c.innerHTML=''
            +'<style>'
            +'#smcChip{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:flex;align-items:center;gap:8px;background:rgba(17,17,19,.92);border:1px solid rgba(255,255,255,.1);border-radius:50px;padding:7px 8px 7px 13px;font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:.78em;color:#d4d4d8;box-shadow:0 6px 20px rgba(0,0,0,.35);backdrop-filter:blur(8px)}'
            +'#smcChip b{color:#fafafa;font-weight:700;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
            +'#smcChip .vb{font-size:.85em}'
            +'#smcChip .lo{background:rgba(239,68,68,.15);color:#fca5a5;border:0;border-radius:50px;padding:5px 11px;font-size:.95em;font-weight:700;cursor:pointer;font-family:inherit}'
            +'#smcChip .lo:hover{background:rgba(239,68,68,.28)}'
            +'@media(max-width:768px){#smcChip{left:10px;bottom:10px;font-size:.72em}}'
            +'</style>'
            +'<span>👤</span><b title="'+(u.mobile||'')+'">'+(u.name||'You')+'</b>'
            +(u.verified?'<span class="vb" title="Verified via '+(u.channel||'OTP')+'">✅</span>':'')
            +'<button class="lo" type="button" id="smcLogout">Logout</button>';
            document.body.appendChild(c);
            c.querySelector('#smcLogout').addEventListener('click',function(){
                try{localStorage.removeItem(KEY);}catch(e){}
                location.reload();
            });
        }
        if(document.body)go();else document.addEventListener('DOMContentLoaded',go);
    }

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
    function validEmail(e){return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((e||'').trim());}

    // ---- OTPless SDK (lazy) ---------------------------------------------
    var otplessReady=null, otpless=null, otplessUser=null;
    function ensureOtpless(){
        if(otplessReady)return otplessReady;
        otplessReady=new Promise(function(res,rej){
            if(!OTPLESS_APP_ID){rej(new Error('no-appid'));return;}
            if(window.OTPless){try{otpless=new OTPless(onOtplessCb);res(otpless);}catch(e){rej(e);}return;}
            var s=document.createElement('script');
            s.id='otpless-sdk';
            s.src='https://otpless.com/v2/headless.js';
            s.setAttribute('data-appid',OTPLESS_APP_ID);
            s.onload=function(){
                try{otpless=new OTPless(onOtplessCb);res(otpless);}catch(e){rej(e);}
            };
            s.onerror=function(){rej(new Error('sdk-load-failed'));};
            document.head.appendChild(s);
        });
        return otplessReady;
    }
    function onOtplessCb(userinfo){otplessUser=userinfo;}
    // initiate() failed if the response carries an explicit error marker.
    function initiateFailed(r){
        if(!r)return false; // no body → assume queued OK
        if(r.success===false)return true;
        if(r.errorMessage||r.error)return true;
        if(typeof r.statusCode==='number'&&r.statusCode>=400)return true;
        return false;
    }
    // verify() succeeded only on a positive signal (token / identities / success).
    function verifyOk(r){
        if(otplessUser&&(otplessUser.token||(otplessUser.identities&&otplessUser.identities.length)))return true;
        if(!r)return false;
        if(r.token)return true;
        if(r.identities&&r.identities.length)return true;
        if(r.success===true||r.statusCode===200)return true;
        return false;
    }

    // ---- UI --------------------------------------------------------------
    function build(){
        var wrap=document.createElement('div');
        wrap.id='smcGate';
        wrap.innerHTML=''
        +'<style>'
        +'#smcGate{position:fixed;inset:0;z-index:2147483600;background:rgba(6,6,10,0.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif}'
        +'#smcGate .gc{width:100%;max-width:420px;background:#111113;border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:30px 26px;box-shadow:0 30px 80px rgba(0,0,0,0.6);animation:smcUp .5s cubic-bezier(.16,1,.3,1);max-height:92vh;overflow:auto}'
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
        +'#smcGate button.wa{background:linear-gradient(135deg,#16a34a,#22c55e)}'
        +'#smcGate button.ghost{background:transparent;border:1px solid rgba(255,255,255,.16);color:#e5e7eb}'
        +'#smcGate .div{display:flex;align-items:center;gap:10px;margin:14px 0;color:#52525b;font-size:.78em}'
        +'#smcGate .div::before,#smcGate .div::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.1)}'
        +'#smcGate .lnk{background:none;color:#818cf8;font-size:.82em;font-weight:600;padding:10px 0 0;width:auto;display:block;margin:0 auto}'
        +'#smcGate .lnk:hover{transform:none;text-decoration:underline}'
        +'#smcGate .fp{color:#71717a;font-size:.72em;text-align:center;margin:14px 0 0;line-height:1.5}'
        +'#smcGate .hide{display:none}'
        +'</style>'
        +'<div class="gc" role="dialog" aria-modal="true">'
        +'  <div class="ic">🔐</div>'
        +'  <div id="smcStep1">'
        +'    <h2>Welcome to SMC Exam Prep</h2>'
        +'    <p class="s">Enter your name &amp; mobile to unlock free practice tests, study material &amp; daily current affairs for the SMC 2026 exam.</p>'
        +'    <label for="smcName">Full Name</label>'
        +'    <input id="smcName" type="text" autocomplete="name" placeholder="e.g. Rahul Patel" />'
        +'    <label for="smcMob">Mobile Number</label>'
        +'    <div class="row"><span class="cc">🇮🇳 +91</span><input id="smcMob" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="10-digit mobile" /></div>'
        +'    <div class="err" id="smcErr"></div>'
        +'    <button id="smcGo" class="wa" type="button">📲 Continue with WhatsApp OTP</button>'
        +'    <div class="div" id="smcDiv">or</div>'
        +'    <div id="smcEmailWrap" class="hide">'
        +'      <label for="smcEmail">Email Address</label>'
        +'      <input id="smcEmail" type="email" autocomplete="email" placeholder="you@example.com" />'
        +'    </div>'
        +'    <button id="smcEmailBtn" class="ghost" type="button">✉️ Verify with Email instead</button>'
        +'  </div>'
        +'  <div id="smcStep2" class="hide">'
        +'    <h2>Verify your OTP</h2>'
        +'    <p class="s">We sent a code to <b id="smcTo"></b><span id="smcVia"></span>. Enter it below to unlock the site.</p>'
        +'    <label for="smcOtp">Enter OTP</label>'
        +'    <input id="smcOtp" class="otp" type="tel" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" />'
        +'    <div class="err" id="smcErr2"></div>'
        +'    <button id="smcVerify" type="button">Verify &amp; Unlock →</button>'
        +'    <button id="smcBack" class="lnk" type="button">← Change details</button>'
        +'  </div>'
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

        var $=function(id){return g.querySelector(id);};
        var name=$('#smcName'),mob=$('#smcMob'),err=$('#smcErr'),go=$('#smcGo');
        var emailWrap=$('#smcEmailWrap'),email=$('#smcEmail'),emailBtn=$('#smcEmailBtn'),divEl=$('#smcDiv');
        var step1=$('#smcStep1'),step2=$('#smcStep2'),otp=$('#smcOtp'),err2=$('#smcErr2'),verify=$('#smcVerify'),back=$('#smcBack'),toEl=$('#smcTo'),viaEl=$('#smcVia');
        var current=null;

        // In format-only fallback (no OTPless App ID) there is no OTP to send:
        // simplify the UI to a single instant-unlock button.
        if(!otpOn()){
            go.className='';go.textContent='Continue →';
            divEl.classList.add('hide');emailBtn.classList.add('hide');emailWrap.classList.add('hide');
        }

        mob.addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,10);});
        otp.addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,6);});

        function finish(verified,channel){
            var r=current;
            var rec={name:r.name,mobile:r.mobile,email:r.email||'',verified:!!verified,channel:channel||'none',t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),pg:location.pathname,ref:document.referrer||'Direct',ua:navigator.userAgent};
            try{localStorage.setItem(KEY,JSON.stringify({name:r.name,mobile:r.mobile,email:r.email||'',verified:!!verified,channel:rec.channel,t:rec.t}));}catch(e){}
            post('leads',rec);
            var how=verified?((channel==='email'?'Email':'WhatsApp')+' OTP verified'):'unverified';
            post('security',{time:rec.t,localTime:rec.lt,level:verified?'ok':'warn',msg:'New visitor ('+how+'): '+r.name+' ('+r.mobile+')'+(r.email?' / '+r.email:''),src:'access-gate'});
            setTimeout(function(){document.documentElement.style.overflow='';document.body.style.overflow='';g.parentNode&&g.parentNode.removeChild(g);},300);
        }

        function showOtpStep(target,via){
            current.channel=(via==='Email')?'email':'whatsapp';
            toEl.textContent=target;
            viaEl.textContent=via?(' via '+via):'';
            step1.classList.add('hide');step2.classList.remove('hide');
            err2.textContent='';otp.value='';
            setTimeout(function(){otp.focus();},150);
        }

        function startWhatsapp(){
            go.disabled=true;go.textContent='Sending WhatsApp OTP…';
            ensureOtpless().then(function(s){
                return s.initiate({channel:'PHONE',phone:current.mobile,countryCode:'+91'});
            }).then(function(res){
                if(initiateFailed(res))throw new Error('initiate');
                go.disabled=false;go.textContent='📲 Continue with WhatsApp OTP';
                showOtpStep('+91 '+current.mobile,'WhatsApp');
            }).catch(function(e){
                // OTP unavailable (unconfigured / quota / domain) → never lock out.
                console.warn('WhatsApp OTP unavailable, format-only fallback:',e&&e.message);
                finish(false,'none');
            });
        }

        function startEmail(){
            if(!validEmail(email.value)){err.textContent='Please enter a valid email address.';email.focus();return;}
            current.email=email.value.trim();
            emailBtn.disabled=true;emailBtn.textContent='Sending Email OTP…';
            ensureOtpless().then(function(s){
                return s.initiate({channel:'EMAIL',email:current.email});
            }).then(function(res){
                emailBtn.disabled=false;emailBtn.textContent='✉️ Verify with Email instead';
                if(initiateFailed(res))throw new Error('initiate');
                showOtpStep(current.email,'Email');
            }).catch(function(e){
                emailBtn.disabled=false;emailBtn.textContent='✉️ Verify with Email instead';
                err.textContent='Could not send email OTP. Try WhatsApp, or check the address.';
            });
        }

        function onContinue(){
            var r=validate(name.value,mob.value);
            if(!r.ok){err.textContent=r.msg;return;}
            err.textContent='';current=r;current.email='';
            if(otpOn()){startWhatsapp();}else{finish(false,'none');} // no OTP configured → instant format-checked unlock
        }
        function onEmailBtn(){
            // First press reveals the email field; second press (with a valid email) sends.
            if(emailWrap.classList.contains('hide')){
                var r=validate(name.value,mob.value);
                if(!r.ok){err.textContent=r.msg;return;}
                err.textContent='';current=r;current.email='';
                emailWrap.classList.remove('hide');
                emailBtn.textContent='✉️ Send Email OTP';
                setTimeout(function(){email.focus();},100);
                return;
            }
            startEmail();
        }
        function onVerify(){
            var code=(otp.value||'').trim();
            if(code.length<4){err2.textContent='Enter the OTP code.';return;}
            err2.textContent='';verify.disabled=true;verify.textContent='Verifying…';
            ensureOtpless().then(function(s){
                return (current.channel==='email')
                    ? s.verify({channel:'EMAIL',email:current.email,otp:code})
                    : s.verify({channel:'PHONE',phone:current.mobile,otp:code,countryCode:'+91'});
            }).then(function(res){
                // Give the success callback a tick to populate the token, then judge.
                setTimeout(function(){
                    if(verifyOk(res)){finish(true,current.channel);}
                    else{verify.disabled=false;verify.textContent='Verify & Unlock →';err2.textContent='Incorrect or expired code. Please try again.';}
                },250);
            }).catch(function(){
                verify.disabled=false;verify.textContent='Verify & Unlock →';
                err2.textContent='Verification failed. Please request a new code.';
            });
        }

        go.addEventListener('click',onContinue);
        emailBtn.addEventListener('click',onEmailBtn);
        verify.addEventListener('click',onVerify);
        back.addEventListener('click',function(){step2.classList.add('hide');step1.classList.remove('hide');otplessUser=null;name.focus();});
        mob.addEventListener('keydown',function(e){if(e.key==='Enter')onContinue();});
        name.addEventListener('keydown',function(e){if(e.key==='Enter')mob.focus();});
        email.addEventListener('keydown',function(e){if(e.key==='Enter')onEmailBtn();});
        otp.addEventListener('keydown',function(e){if(e.key==='Enter')onVerify();});
        setTimeout(function(){name.focus();},200);
    }

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
    else mount();
})();
