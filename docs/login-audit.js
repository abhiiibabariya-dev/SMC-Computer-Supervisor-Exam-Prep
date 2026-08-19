/* Login audit wrapper. The login page loads this after its Firebase auth code. */
(function(){'use strict';if(window.__SMC_LOGIN_AUDIT__)return;window.__SMC_LOGIN_AUDIT__=true;
function sid(){try{var k='smc_audit_sid',v=localStorage.getItem(k);if(!v){v='sid-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);localStorage.setItem(k,v);}return v;}catch(e){return'sid-'+Math.random().toString(36).slice(2);}}
function profile(user){return firebase.database().ref('users/'+user.uid).once('value').then(function(s){return s.val()||{};}).catch(function(){return{};});}
function write(user,ev,method){if(!user)return Promise.resolve();return profile(user).then(function(p){var now=new Date(),payload={uid:user.uid,event:'authenticated',ev:ev,page:'/login.html',t:now.toISOString(),lt:now.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),email:user.email||'',name:p.name||user.displayName||'',mobile:p.mobile||'',plan:p.plan||'free',sid:sid(),d:method||'Login'};return firebase.database().ref('auth_audit').push(payload).catch(function(){});});}
function patch(name,ev){var a=firebase.auth();if(typeof a[name]!=='function')return;var original=a[name].bind(a);a[name]=function(){var args=arguments;return original.apply(null,args).then(function(cred){write(cred&&cred.user||a.currentUser,ev,name);return cred;});};}
function run(){try{patch('signInWithEmailAndPassword','login');patch('signInWithPopup','login');patch('createUserWithEmailAndPassword','signup');}catch(e){}}
if(window.firebase&&firebase.auth&&firebase.database)run();else{var timer=setInterval(function(){if(window.firebase&&firebase.auth&&firebase.database){clearInterval(timer);run();}},100);setTimeout(function(){clearInterval(timer);},10000);}
})();
