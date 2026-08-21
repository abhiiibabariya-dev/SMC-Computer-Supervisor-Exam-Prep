/* Public leaderboard bridge: never expose participant mobile numbers. */
(function(){
  'use strict';
  if(window.__SMC_LEADERBOARD_SAFETY__) return;
  window.__SMC_LEADERBOARD_SAFETY__=true;
  var nativeFetch=window.fetch.bind(window);
  window.fetch=function(input, init){
    var url=typeof input==='string' ? input : (input&&input.url)||'';
    if(!/\/leaderboard\.json(?:\?|$)/i.test(url)) return nativeFetch(input, init);
    var opts=init ? Object.assign({},init) : {};
    var method=(opts.method || (input&&input.method) || 'GET').toUpperCase();
    url=url.replace('/leaderboard.json','/leaderboard_public.json');
    if(method==='POST' && opts.body){
      try{
        var rec=JSON.parse(opts.body);
        delete rec.mobile;
        if(window.firebase && firebase.auth && firebase.auth().currentUser) rec.uid=firebase.auth().currentUser.uid;
        opts.body=JSON.stringify(rec);
      }catch(e){}
    }
    if(typeof input==='string') return nativeFetch(url,opts);
    try{return nativeFetch(new Request(url,input),opts);}catch(e){return nativeFetch(url,opts);}
  };
})();
