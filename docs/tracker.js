// SMC Visitor Intelligence Tracker — Cloud + Local
(function(){
var ua=navigator.userAgent;
function getOS(u){if(/Android (\d+[\.\d]*)/.test(u))return'Android '+RegExp.$1;if(/iPhone OS (\d+[_\d]*)/.test(u))return'iOS '+RegExp.$1.replace(/_/g,'.');if(/Windows NT 10/.test(u))return'Windows 10/11';if(/Mac OS X/.test(u))return'macOS';if(/Linux/.test(u))return'Linux';return'Unknown';}
function getBr(u){if(/Edg\/(\d+)/.test(u))return'Edge '+RegExp.$1;if(/OPR\/(\d+)/.test(u))return'Opera '+RegExp.$1;if(/Chrome\/(\d+)/.test(u))return'Chrome '+RegExp.$1;if(/Firefox\/(\d+)/.test(u))return'Firefox '+RegExp.$1;if(/Safari/.test(u)&&!/Chrome/.test(u))return'Safari';return'Other';}
function getDev(u){if(/SM-[A-Z]\d/i.test(u))return'Samsung '+(u.match(/SM-[A-Z]\d{3}[A-Z]?/i)||[''])[0];if(/Redmi/i.test(u))return(u.match(/Redmi[^;)\/]*/i)||['Redmi'])[0].trim();if(/POCO/i.test(u))return(u.match(/POCO[^;)\/]*/i)||['POCO'])[0].trim();if(/Mi \d/i.test(u))return(u.match(/Mi [^;)\/]*/i)||['Xiaomi'])[0].trim();if(/OnePlus/i.test(u))return(u.match(/OnePlus[^;)\/]*/i)||['OnePlus'])[0].trim();if(/RMX\d/i.test(u))return'Realme';if(/vivo/i.test(u))return'Vivo';if(/OPPO|CPH/i.test(u))return'Oppo';if(/iPhone/.test(u))return'iPhone';if(/iPad/.test(u))return'iPad';if(/Pixel/i.test(u))return'Pixel';if(/Macintosh/.test(u))return'Mac';if(/Windows/.test(u))return'PC';return'Unknown';}
var cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
var v={t:new Date().toISOString(),lt:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),dev:getDev(ua),os:getOS(ua),br:getBr(ua),scr:screen.width+'x'+screen.height,mob:/Mobile|Android|iPhone/i.test(ua),cores:navigator.hardwareConcurrency||'?',ram:navigator.deviceMemory||'?',net:cn?(cn.effectiveType||'?'):'?',lang:navigator.language,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,ref:document.referrer||'Direct',pg:location.pathname,touch:'ontouchstart'in window};
if(navigator.getBattery)navigator.getBattery().then(function(b){v.bat=Math.round(b.level*100)+'%'+(b.charging?' C':'');save(v);}).catch(function(){save(v);});else save(v);

function save(v){
    // Save to localStorage (local backup)
    var a=JSON.parse(localStorage.getItem('smc_visitors')||'[]');a.push(v);if(a.length>200)a.splice(0,a.length-200);localStorage.setItem('smc_visitors',JSON.stringify(a));
    // Send to Firebase (cloud — visible from any device)
    sendToCloud('visits',v);
}

var st=Date.now();
window.addEventListener('beforeunload',function(){
    var d=Math.round((Date.now()-st)/1000);
    var a=JSON.parse(localStorage.getItem('smc_visitors')||'[]');
    if(a.length)a[a.length-1].dur=d+'s';
    localStorage.setItem('smc_visitors',JSON.stringify(a));
    // Update cloud with duration
    sendToCloud('visits',{t:v.t,dur:d+'s',pg:v.pg,dev:v.dev,update:true});
});

document.addEventListener('click',function(e){
    var c=e.target.closest('a,button,.k,.opt,.chip');
    if(c){
        var click={t:new Date().toLocaleTimeString('en-IN'),x:c.textContent.trim().substring(0,40),p:location.pathname};
        var k=JSON.parse(localStorage.getItem('smc_clicks')||'[]');
        k.push(click);if(k.length>500)k.splice(0,k.length-500);
        localStorage.setItem('smc_clicks',JSON.stringify(k));
        // Send to cloud
        sendToCloud('clicks',click);
    }
});

// ===== FIREBASE CLOUD SYNC =====
function sendToCloud(collection,data){
    try{
        var fbUrl=window.SMC_FIREBASE_URL;
        if(!fbUrl)return; // Firebase not configured yet
        var url=fbUrl+'/'+collection+'.json';
        fetch(url,{method:'POST',body:JSON.stringify(data),headers:{'Content-Type':'application/json'}}).catch(function(){});
    }catch(e){}
}

})();
