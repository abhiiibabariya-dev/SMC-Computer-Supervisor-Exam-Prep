(function(){
'use strict';
if(window.__SMC_QUIZSCORE_AUTH__)return;
window.__SMC_QUIZSCORE_AUTH__=true;
var original=window.fetch.bind(window);
window.fetch=function(input,init){
  try{
    var url=typeof input==='string'?input:(input&&input.url)||'';
    var method=String((init&&init.method)||'GET').toUpperCase();
    if(/\/quizscores\.json(?:\?|$)/i.test(url)&&method==='POST'&&window.firebase&&firebase.auth&&firebase.auth().currentUser){
      var user=firebase.auth().currentUser;
      return user.getIdToken().then(function(token){
        var body=init&&init.body,rec={};
        try{rec=typeof body==='string'?JSON.parse(body):body||{}}catch(e){}
        rec.uid=user.uid;
        var sep=url.indexOf('?')>=0?'&':'?';
        var next=Object.assign({},init,{body:JSON.stringify(rec)});
        next.headers=Object.assign({'Content-Type':'application/json'},init&&init.headers||{});
        return original(url+sep+'auth='+encodeURIComponent(token),next);
      }).catch(function(){return original(input,init);});
    }
  }catch(e){}
  return original(input,init);
};
})();
