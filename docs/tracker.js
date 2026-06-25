// SMC Visitor Intelligence Tracker — Cloud + Local (deferred for mobile perf)
(function(){
var ua=navigator.userAgent;
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

// Defer all tracker work until the browser is idle — never block first paint on slow phones.
function idle(fn){
    if(window.requestIdleCallback)requestIdleCallback(fn,{timeout:2000});
    else setTimeout(fn,1000);
}

idle(function collect(){
    var cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    resolveDevice(function(devName){
        v={t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),dev:devName,os:getOS(ua),br:getBr(ua),scr:screen.width+'x'+screen.height,mob:/Mobile|Android|iPhone/i.test(ua),cores:navigator.hardwareConcurrency||'?',ram:navigator.deviceMemory||'?',net:cn?(cn.effectiveType||'?'):'?',lang:navigator.language,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,ref:document.referrer||'Direct',pg:location.pathname,touch:'ontouchstart'in window};
        // Attach the identified visitor (name/mobile) captured by the access gate, if present.
        try{var u=JSON.parse(localStorage.getItem('smc_user')||'null');if(u&&u.name){v.name=u.name;v.mobile=u.mobile;}}catch(e){}
        if(navigator.getBattery)navigator.getBattery().then(function(b){v.bat=Math.round(b.level*100)+'%'+(b.charging?' C':'');save(v);}).catch(function(){save(v);});else save(v);
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
            var click={t:new Date().toLocaleTimeString('en-IN'),x:c.textContent.trim().substring(0,40),p:location.pathname};
            clickQueue.push(click);
            if(clickTimeout)clearTimeout(clickTimeout);
            clickTimeout=setTimeout(function(){
                var k=JSON.parse(localStorage.getItem('smc_clicks')||'[]');
                for(var i=0;i<clickQueue.length;i++)k.push(clickQueue[i]);
                if(k.length>500)k.splice(0,k.length-500);
                localStorage.setItem('smc_clicks',JSON.stringify(k));
                if(clickQueue.length>0)sendToCloud('clicks',clickQueue[clickQueue.length-1]);
                clickQueue=[];
            },500);
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
