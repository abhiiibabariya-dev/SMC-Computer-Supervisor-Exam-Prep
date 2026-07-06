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

    // Stable per-visitor id (shared with tracker.js via the same localStorage key)
    // so the daily email can stitch login → page views → clicks into one trail.
    function sidG(){try{var s=localStorage.getItem('smc_sid');if(!s){s='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('smc_sid',s);}return s;}catch(e){return'nostorage';}}
    // Pull the geo blob tracker.js has already cached in sessionStorage. Safe on
    // pages where tracker.js hasn't loaded yet — returns {} and events just omit
    // location fields (never blocks the gate flow).
    function geoG(){try{var c=sessionStorage.getItem('smc_geo');if(c)return JSON.parse(c);}catch(e){}return {};}
    function auditG(ev,d,who){try{var g=geoG(),r={t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),sid:sidG(),ev:ev,d:d||'',pg:location.pathname,city:g.city||'',country:g.country||'',isp:g.isp||'',ip:g.ip||'',proxy:!!g.proxy};if(who){r.name=who.name||'';r.mobile=who.mobile||'';}post('audit',r);}catch(e){}}

    // Logout / reset: visiting any page with ?logout (or #logout) clears the saved
    // identity and reloads cleanly so the gate shows again.
    try{
        if(/[?&#]logout\b/i.test(location.href)){
            try{var lu=JSON.parse(localStorage.getItem(KEY)||'null');if(lu&&lu.name)auditG('logout','via ?logout',lu);}catch(e){}
            localStorage.removeItem(KEY);
            var clean=location.href.replace(/([?&])logout(=[^&#]*)?/ig,'$1').replace(/[?&#]+$/,'').replace(/#.*$/,'');
            location.replace(clean||location.pathname);return;
        }
    }catch(e){}

    // Already identified → no gate; just show a small "logged in / Logout" chip.
    // Also log a "session resumed" login once per browser tab-session so the daily
    // email shows returning visitors (not only brand-new sign-ins).
    try{var ex=JSON.parse(localStorage.getItem(KEY)||'null');if(ex&&ex.name&&ex.mobile){
        try{if(!sessionStorage.getItem('smc_sess')){sessionStorage.setItem('smc_sess','1');auditG('login','session resumed'+(ex.postLabel?' · post: '+ex.postLabel:''),{name:ex.name,mobile:ex.mobile});}}catch(e){}
        showChip(ex);return;
    }}catch(e){}

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
            +'#smcChip .cp{background:rgba(99,102,241,.16);color:#a5b4fc;border:0;border-radius:50px;padding:5px 10px;font-size:.9em;font-weight:700;cursor:pointer;font-family:inherit}'
            +'#smcChip .cp:hover{background:rgba(99,102,241,.28)}'
            +'@media(max-width:768px){#smcChip{left:10px;bottom:10px;font-size:.72em}}'
            +'</style>'
            +'<span>👤</span><b title="'+(u.mobile||'')+'">'+(u.name||'You')+'</b>'
            +(u.verified?'<span class="vb" title="Verified via '+(u.channel||'OTP')+'">✅</span>':'')
            +'<button class="cp" type="button" id="smcChangePost" title="Change your post / subject">⇄ Post</button>'
            +'<button class="lo" type="button" id="smcLogout">Logout</button>';
            document.body.appendChild(c);
            c.querySelector('#smcChangePost').addEventListener('click',function(){openPostPicker(u);});
            c.querySelector('#smcLogout').addEventListener('click',function(){
                try{auditG('logout','logout chip',u);}catch(e){}
                try{localStorage.removeItem(KEY);sessionStorage.removeItem('smc_sess');}catch(e){}
                location.reload();
            });
        }
        if(document.body)go();else document.addEventListener('DOMContentLoaded',go);
    }

    // Lightweight "change post" modal for returning users — updates their saved post
    // and takes them straight to that guide. Reuses the same POSTS catalogue.
    function openPostPicker(u){
        if(document.getElementById('smcPick'))return;
        var m=document.createElement('div');
        m.id='smcPick';
        m.innerHTML='<style>'
            +'#smcPick{position:fixed;inset:0;z-index:2147483600;background:rgba(6,6,10,.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Plus Jakarta Sans",system-ui,sans-serif}'
            +'#smcPick .pc{width:100%;max-width:400px;background:#111113;border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:24px}'
            +'#smcPick h3{color:#fafafa;font-size:1.15em;font-weight:800;margin:0 0 4px}'
            +'#smcPick p{color:#a1a1aa;font-size:.85em;margin:0 0 16px}'
            +'#smcPick select{width:100%;background:#18181b;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:13px 14px;color:#fafafa;font-size:1em;font-family:inherit;outline:none;margin-bottom:16px}'
            +'#smcPick select option,#smcPick select optgroup{background:#18181b;color:#fafafa}'
            +'#smcPick .btns{display:flex;gap:10px}'
            +'#smcPick button{flex:1;border:0;border-radius:12px;padding:12px;font-size:.95em;font-weight:700;font-family:inherit;cursor:pointer}'
            +'#smcPick .sv{background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff}'
            +'#smcPick .cx{background:transparent;border:1px solid rgba(255,255,255,.16);color:#e5e7eb}'
            +'</style>'
            +'<div class="pc" role="dialog" aria-modal="true">'
            +'<h3>Change your post</h3><p>Pick the post you\'re preparing for — we\'ll take you to its guide.</p>'
            +'<select id="smcPickSel">'+postOptionsHtml()+'</select>'
            +'<div class="btns"><button class="cx" type="button" id="smcPickCancel">Cancel</button><button class="sv" type="button" id="smcPickSave">Save &amp; open</button></div>'
            +'</div>';
        document.body.appendChild(m);
        var sel=m.querySelector('#smcPickSel');
        try{if(u&&u.post)sel.value=u.post;}catch(e){}
        function closeM(){m.parentNode&&m.parentNode.removeChild(m);}
        m.querySelector('#smcPickCancel').addEventListener('click',closeM);
        m.addEventListener('click',function(e){if(e.target===m)closeM();});
        m.querySelector('#smcPickSave').addEventListener('click',function(){
            var val=sel.value||'',lbl=postLabelFor(val);
            try{var cur=JSON.parse(localStorage.getItem(KEY)||'{}')||{};cur.post=val;cur.postLabel=lbl;localStorage.setItem(KEY,JSON.stringify(cur));}catch(e){}
            try{auditG('switch_post',lbl||'exploring',{name:u&&u.name,mobile:u&&u.mobile});}catch(e){}
            post('security',{time:new Date().toISOString(),localTime:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),level:'ok',msg:'Visitor '+((u&&u.name)||'')+' switched post → '+(lbl||'exploring'),src:'access-gate'});
            closeM();
            if(val){try{location.href=val;}catch(e){}}
        });
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

    // ---- Post / subject catalogue (drives the "which post?" dropdown) ----
    // Each entry: [label, target page]. Grouped so aspirants find their line fast
    // and get routed to the right guide. Keep labels short — full titles live on the pages.
    var POSTS=[
        {g:'Administrative / Clerical',items:[
            ['Computer Supervisor','supervisor.html'],['Clerk','clerk.html'],
            ['Clerk Grade-III (Audit)','clerk-audit.html'],['Library Clerk','library-clerk.html'],
            ['Assessment & Recovery Officer','aro.html'],['Deputy Accountant','dep-accountant.html'],
            ['Assistant Auditor','asst-auditor.html'],['Deputy Auditor','dep-auditor.html'],
            ['Junior Analyst','analyst.html'],['Asst Town Planner','atp.html'],
            ['Deputy Town Planner','dtp.html']
        ]},
        {g:'Engineering & Town Planning',items:[
            ['Asst Engineer (Civil)','ae-civil.html'],['Asst Engineer (Electrical)','ae-electrical.html'],
            ['Asst Engineer (Mechanical)','ae-mechanical.html'],['Deputy Engineer (Civil)','de-civil.html'],
            ['Environment Engineer','env-engineer.html'],['Technical Officer','tech-officer.html'],
            ['Technical Assistant','technical-assistant.html'],['Maintenance Asst (Electrical)','maint-electrical.html'],
            ['Fitter','fitter.html']
        ]},
        {g:'Medical & Health',items:[
            ['Staff Nurse','staff-nurse.html'],['Medical Officer','medical-officer.html'],
            ['Junior Pharmacist','pharmacist.html'],['Lab Technician','lab-tech.html'],
            ['Radiographic Technician','radio-tech.html'],['Radiologist','radiologist.html'],
            ['Dialysis Technician','dialysis-tech.html'],['ECG Technician','ecg-tech.html'],
            ['ECHO / TMT Technician','echo-tmt.html'],['Audiometry Technician','audiometry-tech.html'],
            ['Speech Therapist','speech-therapist.html'],['Tech Asst (Bio Chemist)','ta-biochemist.html']
        ]},
        {g:'Zoo & Aquarium',items:[
            ['Zoo Guide','zoo-guide.html'],['Zoo Keeper','zoo-keeper.html'],['Zoo Sevak','zoo-sevak.html'],
            ['Aquarium Attendant','aquarium-attendant.html'],['Aquarium Inspector','aquarium-inspector.html'],
            ['Curator (Aquarium)','curator-aquarium.html'],['Curator (Education & Research)','curator-edu.html'],
            ['Supervisor (Aquarium)','supervisor-aquarium.html'],['Live Stock Inspector','livestock.html'],
            ['Tech Asst (Shark Pool)','ta-shark.html'],['Marshal','marshal.html']
        ]},
        {g:'Other',items:[
            ['Driver','driver.html']
        ]}
    ];
    function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
    function postOptionsHtml(){
        var h='<option value="">— Not sure yet / just exploring —</option>';
        for(var i=0;i<POSTS.length;i++){
            h+='<optgroup label="'+esc(POSTS[i].g)+'">';
            var it=POSTS[i].items;
            for(var j=0;j<it.length;j++){h+='<option value="'+esc(it[j][1])+'">'+esc(it[j][0])+'</option>';}
            h+='</optgroup>';
        }
        return h;
    }
    // label for a stored page value (for the lead record + audit)
    function postLabelFor(val){
        if(!val)return'';
        for(var i=0;i<POSTS.length;i++){var it=POSTS[i].items;for(var j=0;j<it.length;j++){if(it[j][1]===val)return it[j][0];}}
        return val;
    }
    // Are we on the site landing page (so a post choice should offer to route there)?
    function onHome(){
        var p=location.pathname.replace(/\/+$/,'');
        return p===''||/\/index$/i.test(p)||/\/(SMC-Computer-Supervisor-Exam-Prep)$/i.test(p)||/index\.html$/i.test(location.pathname);
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
        +'#smcGate select{width:100%;background:#18181b;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:13px 14px;color:#fafafa;font-size:1em;font-family:inherit;outline:none;transition:border-color .2s;margin-bottom:14px;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23a1a1aa\' d=\'M6 8 0 0h12z\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px}'
        +'#smcGate select:focus{border-color:#6366f1}'
        +'#smcGate select option,#smcGate select optgroup{background:#18181b;color:#fafafa}'
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
        +'    <label for="smcPost">Which post are you preparing for?</label>'
        +'    <select id="smcPost">'+postOptionsHtml()+'</select>'
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
        var name=$('#smcName'),mob=$('#smcMob'),postSel=$('#smcPost'),err=$('#smcErr'),go=$('#smcGo');
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
            var postVal='',postLbl='';try{postVal=postSel.value||'';postLbl=postLabelFor(postVal);}catch(e){}
            var geo=geoG();
            var rec={name:r.name,mobile:r.mobile,email:r.email||'',post:postVal,postLabel:postLbl,verified:!!verified,channel:channel||'none',sid:sidG(),t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),pg:location.pathname,ref:document.referrer||'Direct',ua:navigator.userAgent,city:geo.city||'',region:geo.region||'',country:geo.country||'',cc:geo.cc||'',isp:geo.isp||'',ip:geo.ip||'',proxy:!!geo.proxy,flags:geo.flags||''};
            try{localStorage.setItem(KEY,JSON.stringify({name:r.name,mobile:r.mobile,email:r.email||'',post:postVal,postLabel:postLbl,verified:!!verified,channel:rec.channel,t:rec.t}));}catch(e){}
            try{sessionStorage.setItem('smc_sess','1');}catch(e){}
            post('leads',rec);
            var how=verified?((channel==='email'?'Email':'WhatsApp')+' OTP verified'):'unverified';
            var whereTxt=geo.city?(' — '+geo.city+(geo.country?(', '+geo.country):'')+(geo.isp?(' ('+geo.isp+')'):'')):'';
            post('security',{time:rec.t,localTime:rec.lt,level:(verified&&!geo.proxy)?'ok':'warn',msg:'New visitor ('+how+'): '+r.name+' ('+r.mobile+')'+(postLbl?' — interested in '+postLbl:'')+(r.email?' / '+r.email:'')+whereTxt+(geo.proxy?' ⚠ PROXY/VPN':''),src:'access-gate',city:geo.city||'',country:geo.country||'',isp:geo.isp||'',ip:geo.ip||'',proxy:!!geo.proxy});
            auditG('login','logged in ('+how+')'+(postLbl?' · post: '+postLbl:'')+(r.email?' / '+r.email:''),{name:r.name,mobile:r.mobile});
            var close=function(){document.documentElement.style.overflow='';document.body.style.overflow='';g.parentNode&&g.parentNode.removeChild(g);};
            // From the landing page, offer to jump straight to the chosen post's guide.
            if(postVal&&onHome()){routeToast(postVal,postLbl,close);}
            else{setTimeout(close,300);}
        }
        // Small non-blocking toast that routes to the chosen guide (auto-nav + tappable).
        function routeToast(url,label,close){
            close();
            var t=document.createElement('div');
            t.id='smcRoute';
            t.innerHTML='<style>#smcRoute{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(12px);z-index:2147483600;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:.9em;font-weight:700;padding:13px 18px;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);cursor:pointer;opacity:0;transition:opacity .3s,transform .3s;max-width:90vw;display:flex;align-items:center;gap:8px}#smcRoute.on{opacity:1;transform:translateX(-50%) translateY(0)}#smcRoute small{opacity:.85;font-weight:500}</style>'
            +'<span>📚</span><span>Opening your <u>'+esc(label)+'</u> guide… <small>tap to go now</small></span>';
            var nav=function(){try{location.href=url;}catch(e){}};
            t.addEventListener('click',nav);
            (document.body||document.documentElement).appendChild(t);
            setTimeout(function(){t.classList.add('on');},30);
            setTimeout(nav,1300);
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

    // ---------- Session idle timeout (5 minutes → auto-logout) ----------
    // Any real user activity (mouse, key, touch, scroll, tab switch back) resets
    // the countdown. After 5 min of ZERO activity the session is auto-terminated:
    // localStorage is cleared, a security event is logged, and the page reloads
    // so the gate screen shows again. The security event surfaces in the daily
    // SOC email so the owner can see which sessions were dropped for inactivity.
    var IDLE_MS=5*60*1000,idleT=null;
    function isLoggedIn(){try{var u=JSON.parse(localStorage.getItem(KEY)||'null');return !!(u&&u.name&&u.mobile);}catch(e){return false;}}
    function armIdle(){
        if(!isLoggedIn())return;
        if(idleT)clearTimeout(idleT);
        idleT=setTimeout(idleLogout,IDLE_MS);
    }
    function idleLogout(){
        var u;try{u=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
        if(!u||!u.name)return;
        try{auditG('auto_logout','idle 5m',u);}catch(e){}
        try{
            var geo=geoG();
            post('security',{time:new Date().toISOString(),localTime:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),level:'ok',msg:'Session auto-terminated (5-min idle): '+u.name+' (+91 '+u.mobile+')',src:'idle-timeout',city:geo.city||'',country:geo.country||'',isp:geo.isp||'',ip:geo.ip||'',proxy:!!geo.proxy});
        }catch(e){}
        try{localStorage.removeItem(KEY);sessionStorage.removeItem('smc_sess');}catch(e){}
        try{location.reload();}catch(e){}
    }
    var idleEvents=['mousemove','keydown','touchstart','scroll','click','wheel','pointerdown'];
    for(var _i=0;_i<idleEvents.length;_i++){document.addEventListener(idleEvents[_i],armIdle,{passive:true,capture:true});}
    document.addEventListener('visibilitychange',function(){if(!document.hidden)armIdle();});
    armIdle();

    // ---------- Proxy / VPN / datacenter block ----------
    // Real students on Surat home wifi never have .proxy===true. Bots, scrapers
    // and attackers running through commercial VPNs or datacenter IPs almost
    // always do — so this is a very high-precision block. We poll the geo cache
    // (populated by tracker.js's ipwho.is lookup) for up to 5 seconds; if the
    // visitor is flagged we log a security event and replace the whole page
    // with a friendly "please disable your VPN" panel. Non-JS clients (curl,
    // headless scrapers with JS disabled) get nothing anyway.
    (function proxyBlock(){
        var tries=0;
        function poll(){
            var g={};try{var c=sessionStorage.getItem('smc_geo');if(c)g=JSON.parse(c);}catch(e){}
            if(!g||!g.country){
                if(++tries<10){setTimeout(poll,500);return;}
                return; // give up — never block a real user just because IP lookup timed out
            }
            if(!g.proxy)return;
            try{post('security',{time:new Date().toISOString(),localTime:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),level:'warn',msg:'BLOCKED proxy/VPN/hosting visitor at '+(g.city||'?')+', '+(g.country||'?')+' — ISP: '+(g.isp||'?')+' — flags: '+(g.flags||'?')+' — IP: '+(g.ip||'?'),src:'proxy-block',city:g.city||'',country:g.country||'',isp:g.isp||'',ip:g.ip||'',proxy:true,flags:g.flags||''});}catch(e){}
            function show(){
                if(document.getElementById('smcBlock'))return;
                var d=document.createElement('div');
                d.id='smcBlock';
                d.innerHTML=''
                +'<style>'
                +'#smcBlock{position:fixed;inset:0;z-index:2147483645;background:#0b0f1a;color:#fafafa;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:"Plus Jakarta Sans",system-ui,sans-serif}'
                +'#smcBlock .bx{max-width:440px;background:#111113;border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:32px 28px}'
                +'#smcBlock .ic{width:64px;height:64px;border-radius:16px;background:rgba(239,68,68,.14);color:#fca5a5;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 18px}'
                +'#smcBlock h1{font-size:1.4em;font-weight:800;margin:0 0 10px;color:#fafafa}'
                +'#smcBlock p{color:#a1a1aa;font-size:.95em;line-height:1.6;margin:0 0 14px}'
                +'#smcBlock .m{font-size:.82em;color:#71717a;background:#0b0f1a;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px 12px;margin-top:12px;text-align:left;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}'
                +'#smcBlock button{margin-top:16px;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:0;border-radius:12px;padding:12px 22px;font-size:.95em;font-weight:700;font-family:inherit;cursor:pointer}'
                +'#smcBlock button:hover{transform:translateY(-1px)}'
                +'</style>'
                +'<div class="bx"><div class="ic">🛡</div>'
                +'<h1>VPN / Proxy Detected</h1>'
                +'<p>This study portal is for real aspirants only. Please turn off your VPN, proxy or hosting connection and reload the page to continue.</p>'
                +'<div class="m">Detected: '+esc(g.city||'?')+', '+esc(g.country||'?')+'<br>Network: '+esc(g.isp||'?')+'<br>Signals: '+esc(g.flags||'?')+'</div>'
                +'<button type="button" id="smcBlockRetry">Reload</button>'
                +'</div>';
                (document.body||document.documentElement).appendChild(d);
                try{document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';}catch(e){}
                try{d.querySelector('#smcBlockRetry').addEventListener('click',function(){location.reload();});}catch(e){}
            }
            if(document.body)show();else document.addEventListener('DOMContentLoaded',show);
        }
        setTimeout(poll,200);
    })();
})();
