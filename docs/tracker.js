// SMC Visitor Intelligence Tracker — Cloud + Local (deferred for mobile perf)
(function(){
var ua=navigator.userAgent;

// ---- IP geolocation (free plan) ---------------------------------------
// Uses ipwho.is — no API key, 10k requests/month free, HTTPS.
// Response includes .security.{proxy,vpn,tor,hosting} which is gold for
// spotting bot/scraper traffic (attackers often come from datacenter IPs).
// Cached in sessionStorage so we only hit the API once per browser tab.
// Publicly exposed as window.smcGeo() → Promise<geo>. Callers that need
// a sync read (clicks, audit) use window.smcGeoCached() which returns {}
// until the first fetch resolves (usually within ~300 ms of pageload).
function smcGeoCached(){
    try{var c=sessionStorage.getItem('smc_geo');if(c)return JSON.parse(c);}catch(e){}
    return {};
}
function smcGeo(){
    if(window.__smcGeoP)return window.__smcGeoP;
    window.__smcGeoP=new Promise(function(res){
        var cached=smcGeoCached();
        if(cached&&cached.country){res(cached);return;}
        // Never let a slow IP lookup delay tracking by more than 2.5 s.
        var tm=setTimeout(function(){res({});},2500);
        try{
            fetch('https://ipwho.is/',{cache:'force-cache'}).then(function(r){return r.json();}).then(function(j){
                clearTimeout(tm);
                if(!j||j.success===false){res({});return;}
                // Truncate the last IPv4 octet (or last IPv6 group) — keeps enough
                // signal to spot repeat attackers without storing the exact IP.
                var ip=(j.ip||'');
                if(ip.indexOf('.')>=0)ip=ip.replace(/\.\d+$/,'.x');
                else if(ip.indexOf(':')>=0)ip=ip.replace(/:[0-9a-f]+$/i,':xxxx');
                var sec=j.security||{};
                var flags=[];for(var k in sec){if(sec[k])flags.push(k);}
                var g={
                    ip:ip,
                    city:j.city||'',
                    region:j.region||'',
                    country:j.country||'',
                    cc:j.country_code||'',
                    isp:(j.connection&&(j.connection.isp||j.connection.org))||'',
                    tz:(j.timezone&&j.timezone.id)||'',
                    proxy:!!(sec.proxy||sec.vpn||sec.tor||sec.hosting),
                    flags:flags.join(',')
                };
                try{sessionStorage.setItem('smc_geo',JSON.stringify(g));}catch(e){}
                res(g);
            }).catch(function(){clearTimeout(tm);res({});});
        }catch(e){clearTimeout(tm);res({});}
    });
    return window.__smcGeoP;
}
window.smcGeo=smcGeo;
window.smcGeoCached=smcGeoCached;
// Kick the fetch off ASAP so cache is warm by the time clicks/audit fire.
smcGeo();

function getOS(u){if(/Android (\d+[\.\d]*)/.test(u))return'Android '+RegExp.$1;if(/iPhone OS (\d+[_\d]*)/.test(u))return'iOS '+RegExp.$1.replace(/_/g,'.');if(/Windows NT 10/.test(u))return'Windows 10/11';if(/Mac OS X/.test(u))return'macOS';if(/Linux/.test(u))return'Linux';return'Unknown';}
function getBr(u){if(/Edg\/(\d+)/.test(u))return'Edge '+RegExp.$1;if(/OPR\/(\d+)/.test(u))return'Opera '+RegExp.$1;if(/Chrome\/(\d+)/.test(u))return'Chrome '+RegExp.$1;if(/Firefox\/(\d+)/.test(u))return'Firefox '+RegExp.$1;if(/Safari/.test(u)&&!/Chrome/.test(u))return'Safari';return'Other';}

// Map a raw model code to a friendlier brand-prefixed name where we recognise it.
function prettyModel(m){
    if(!m)return'';
    m=String(m).trim();
    if(/^SM-/i.test(m))return'Samsung '+m;
    if(/^Pixel/i.test(m))return'Google '+m;
    if(/^(Redmi|POCO|M2|M3|M21|M20|22|23|24|2201|2203|2207|2209|2210|2211|2304|2306|2308|2310|2311|2312)/i.test(m))return'Xiaomi '+m;
    if(/^(CPH|OPPO)/i.test(m))return'Oppo '+m;
    if(/^(RMX|RealMe)/i.test(m))return'Realme '+m;
    if(/^(V20|V21|V22|V23|vivo|I20|I21|I22)/i.test(m))return'Vivo '+m;
    if(/^(LE|IN|KB|GM|HD|BE|EB|CPH)/i.test(m))return'OnePlus '+m;
    if(/iPhone/i.test(m))return'iPhone';
    return m; // still a real model string — far better than "Unknown"
}

// Legacy UA parse — used when Client Hints is unavailable. NEVER returns "Unknown":
// if no model is exposed we fall back to a real human label by platform.
function getDevUA(u){
    if(/SM-[A-Z0-9]+/i.test(u))return'Samsung '+(u.match(/SM-[A-Z0-9]+/i)||[''])[0];
    if(/Redmi/i.test(u))return'Xiaomi '+((u.match(/Redmi[^;)\/]*/i)||['Redmi'])[0]).trim();
    if(/POCO/i.test(u))return'Xiaomi '+((u.match(/POCO[^;)\/]*/i)||['POCO'])[0]).trim();
    if(/Mi \d/i.test(u))return'Xiaomi '+((u.match(/Mi [^;)\/]*/i)||['Mi'])[0]).trim();
    if(/OnePlus/i.test(u))return((u.match(/OnePlus[^;)\/]*/i)||['OnePlus'])[0]).trim();
    if(/RMX\d/i.test(u))return'Realme';
    if(/vivo/i.test(u))return'Vivo';
    if(/OPPO|CPH/i.test(u))return'Oppo';
    if(/Pixel/i.test(u))return'Google Pixel';
    if(/iPhone/.test(u))return'iPhone';
    if(/iPad/.test(u))return'iPad';
    if(/Android/.test(u))return'Android Phone';
    if(/Windows/.test(u))return'Windows PC';
    if(/Macintosh|Mac OS/.test(u))return'Mac';
    if(/Linux/.test(u))return'Linux PC';
    return'Desktop';
}

// Resolve the device via the User-Agent Client Hints API (the only way modern
// Chrome/Android exposes the real model — the UA string no longer carries it).
// Falls back to UA parsing. Always calls back with a real, non-"Unknown" label.
function resolveDevice(cb){
    try{
        var d=navigator.userAgentData;
        if(d&&typeof d.getHighEntropyValues==='function'){
            d.getHighEntropyValues(['model','platform']).then(function(h){
                var m=prettyModel(h&&h.model);
                cb(m||getDevUA(ua));
            }).catch(function(){cb(getDevUA(ua));});
            return;
        }
    }catch(e){}
    cb(getDevUA(ua));
}

var v=null;
var st=Date.now();

// ---- Audit identity: a stable per-visitor id + the logged-in name/mobile ----
// smc_sid persists across visits so the daily email can stitch a single person's
// whole journey together (page views + every click + login/logout).
function sid(){try{var s=localStorage.getItem('smc_sid');if(!s){s='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);localStorage.setItem('smc_sid',s);}return s;}catch(e){return'nostorage';}}
function ident(){try{var u=JSON.parse(localStorage.getItem('smc_user')||'null');if(u&&u.name)return{name:u.name,mobile:u.mobile||''};}catch(e){}return{name:'',mobile:''};}

// Unified audit trail — one typed, identity-stamped event per action, all pushed
// to /audit. Exposed as window.smcAudit(ev, detail) so gate.js / quiz / share can
// log their own events (login, logout, quiz_answer, share, …).
function audit(ev,detail){
    try{
        var u=ident(),g=smcGeoCached();
        sendToCloud('audit',{
            t:new Date().toISOString(),
            lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),
            sid:sid(),name:u.name,mobile:u.mobile,
            ev:ev,d:(detail==null?'':String(detail)).substring(0,120),pg:location.pathname,
            city:g.city||'',region:g.region||'',country:g.country||'',cc:g.cc||'',
            isp:g.isp||'',ip:g.ip||'',proxy:!!g.proxy
        });
    }catch(e){}
}
window.smcAudit=audit;
window.smcSid=sid;

// Defer all tracker work until the browser is idle — never block first paint on slow phones.
function idle(fn){
    if(window.requestIdleCallback)requestIdleCallback(fn,{timeout:2000});
    else setTimeout(fn,1000);
}

idle(function collect(){
    var cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    resolveDevice(function(devName){
        // Wait for geo (up to 2.5 s) so the visit record carries the real location.
        smcGeo().then(function(g){
            g=g||{};
            v={t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),sid:sid(),dev:devName,os:getOS(ua),br:getBr(ua),scr:screen.width+'x'+screen.height,mob:/Mobile|Android|iPhone/i.test(ua),cores:navigator.hardwareConcurrency||'?',ram:navigator.deviceMemory||'?',net:cn?(cn.effectiveType||'?'):'?',lang:navigator.language,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,ref:document.referrer||'Direct',pg:location.pathname,touch:'ontouchstart'in window,
                city:g.city||'',region:g.region||'',country:g.country||'',cc:g.cc||'',isp:g.isp||'',ip:g.ip||'',proxy:!!g.proxy,flags:g.flags||''};
            // Attach the identified visitor (name/mobile) captured by the access gate, if present.
            try{var u=JSON.parse(localStorage.getItem('smc_user')||'null');if(u&&u.name){v.name=u.name;v.mobile=u.mobile;}}catch(e){}
            if(navigator.getBattery)navigator.getBattery().then(function(b){v.bat=Math.round(b.level*100)+'%'+(b.charging?' C':'');save(v);}).catch(function(){save(v);});else save(v);
            // Unified audit trail: one page_view event per load (title = what page they opened).
            audit('page_view',document.title||location.pathname);
        });
    });
});

function save(v){
    var a=JSON.parse(localStorage.getItem('smc_visitors')||'[]');a.push(v);if(a.length>200)a.splice(0,a.length-200);localStorage.setItem('smc_visitors',JSON.stringify(a));
    sendToCloud('visits',v);
}

// Use sendBeacon on unload — non-blocking + survives page transition. fetch() in beforeunload
// often gets cancelled and can stall navigation on slow networks.
window.addEventListener('beforeunload',function(){
    if(!v)return;
    var d=Math.round((Date.now()-st)/1000);
    var a=JSON.parse(localStorage.getItem('smc_visitors')||'[]');
    if(a.length)a[a.length-1].dur=d+'s';
    localStorage.setItem('smc_visitors',JSON.stringify(a));
    try{
        var fbUrl=window.SMC_FIREBASE_URL;
        if(!fbUrl)return;
        var payload=JSON.stringify({t:v.t,dur:d+'s',pg:v.pg,dev:v.dev,update:true});
        if(navigator.sendBeacon){
            navigator.sendBeacon(fbUrl+'/visits.json',new Blob([payload],{type:'application/json'}));
        }
    }catch(e){}
});

// Debounced click tracking — also idled so the listener attaches without blocking paint
idle(function attachClicks(){
    var clickTimeout=null;
    var clickQueue=[];
    document.addEventListener('click',function(e){
        var c=e.target.closest('a,button,.k,.opt,.chip');
        if(c){
            var u=ident(),g=smcGeoCached();
            var label=(c.textContent||'').trim().substring(0,60)||(c.getAttribute&&(c.getAttribute('aria-label')||c.getAttribute('title'))||c.tagName);
            var click={t:new Date().toLocaleTimeString('en-IN'),ts:new Date().toISOString(),x:label,p:location.pathname,sid:sid(),name:u.name,mobile:u.mobile,city:g.city||'',country:g.country||'',isp:g.isp||'',ip:g.ip||''};
            clickQueue.push(click);
            if(clickTimeout)clearTimeout(clickTimeout);
            clickTimeout=setTimeout(function(){
                var k=JSON.parse(localStorage.getItem('smc_clicks')||'[]');
                for(var i=0;i<clickQueue.length;i++)k.push(clickQueue[i]);
                if(k.length>500)k.splice(0,k.length-500);
                localStorage.setItem('smc_clicks',JSON.stringify(k));
                // Send EVERY click to the cloud (a full log, not a sample) + mirror
                // each into the unified audit trail so per-user journeys are complete.
                for(var j=0;j<clickQueue.length;j++){sendToCloud('clicks',clickQueue[j]);audit('click',clickQueue[j].x);}
                clickQueue=[];
            },450);
        }
    },{passive:true});
});

function sendToCloud(collection,data){
    try{
        var fbUrl=window.SMC_FIREBASE_URL;
        if(!fbUrl)return;
        fetch(fbUrl+'/'+collection+'.json',{method:'POST',body:JSON.stringify(data),headers:{'Content-Type':'application/json'}}).catch(function(){});
    }catch(e){}
}

})();
