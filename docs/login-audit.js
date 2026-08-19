/* Login audit wrapper. The login page loads this after its Firebase auth code. */
(function(){'use strict';
if(window.__SMC_LOGIN_AUDIT__)return;window.__SMC_LOGIN_AUDIT__=true;
function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function dbUrl(){return (window.SMC_FIREBASE_CONFIG&&window.SMC_FIREBASE_CONFIG.databaseURL)||window.SMC_FIREBASE_URL||'';}
function sid(){try{var k='smc_audit_sid',v=localStorage.getItem(k);if(!v){v='sid-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);localStorage.setItem(k,v);}return v;}catch(e){return 'sid-'+Math.random().toString(36).slice(2);}}
function profile(user){var base=dbUrl();if(!base)return Promise.resolve({});return fetch(base+'/users/'+encodeURIComponent(user.uid)+'.json',{cache:'no-store'}).then(function(r){return r.ok?r.json()||{}:{};}).catch(function(){return {};});}
function write(user,ev,method){if(!user)return Promise.resolve();var base=dbUrl();if(!base)return Promise.resolve();return Promise.resolve(user.getIdToken()).then(function(token){return profile(user).then(function(p){var now=new Date(),payload={uid:user.uid,event:'authenticated',ev:ev,page:'/login.html',t:now.toISOString(),lt:now.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),email:user.email||'',name:p.name||user.displayName||'',mobile:p.mobile||'',plan:p.plan||'free',sid:sid(),d:method||'Login'};return fetch(base+'/audit.json?auth='+encodeURIComponent(token),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true,cache:'no-store'}).catch(function(){});});});}
function patch(name,ev){var a=firebase.auth();if(typeof a[name]!=='function')return;var original=a[name].bind(a);a[name]=function(){var args=arguments;return original.apply(null,args).then(function(cred){write(cred&&cred.user||a.currentUser,ev,name);return cred;});};}
function run(){try{patch('signInWithEmailAndPassword','login');patch('signInWithPopup','login');patch('createUserWithEmailAndPassword','login');}catch(e){}}
if(window.firebase&&firebase.auth)run();else{var timer=setInterval(function(){if(window.firebase&&firebase.auth){clearInterval(timer);run();}},100);setTimeout(function(){clearInterval(timer);},10000);}
})();
