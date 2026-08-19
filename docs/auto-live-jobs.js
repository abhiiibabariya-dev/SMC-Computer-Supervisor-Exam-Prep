/* SMC Prep Live Jobs Renderer v6
 * No Firebase dependency. Public job data is read from the repository JSON.
 * The page always renders a usable state, even when the monitor JSON is unavailable.
 */
(function(){
  'use strict';
  if(window.__SMC_GLOBAL_LIVE_V6__) return;
  window.__SMC_GLOBAL_LIVE_V6__=true;

  var BASE='/SMC-Computer-Supervisor-Exam-Prep/';
  var DATA_URL=BASE+'gujarat-jobs.json';
  var STATUS_URL=BASE+'gujarat-monitor/smc-status.json';
  var OFFICIAL_SMC='https://www.suratmunicipal.gov.in/Information/RecruitmentNews';
  var path=(location.pathname||'').toLowerCase();
  var full=path.endsWith('/live-jobs.html')||path.endsWith('/govt-jobs.html')||document.body.hasAttribute('data-live-jobs-page');
  var compact=path.endsWith('/index.html')||path.endsWith('/')||path.endsWith('/answer-key.html');

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
  function css(){
    if(document.getElementById('smc-live-v6-style'))return;
    var s=document.createElement('style');s.id='smc-live-v6-style';s.textContent=''
      +'#smc-live-v6{max-width:1080px;margin:18px auto;padding:0 12px;font-family:inherit;position:relative;z-index:10}'
      +'#smc-live-v6 .panel{background:#111317;border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:16px;box-shadow:0 12px 36px rgba(0,0,0,.22)}'
      +'#smc-live-v6 .head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}'
      +'#smc-live-v6 .title{color:#fff;font-size:1rem;font-weight:900}'
      +'#smc-live-v6 .sub{color:#9ca3af;font-size:.7rem;margin-top:4px;line-height:1.5}'
      +'#smc-live-v6 .state{color:#86efac;font-size:.66rem;font-weight:900}'
      +'#smc-live-v6 .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}'
      +'#smc-live-v6 .actions a,#smc-live-v6 .actions button{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:10px;padding:9px 12px;text-decoration:none;font:800 .7rem system-ui,sans-serif;cursor:pointer}'
      +'#smc-live-v6 .primary{background:#86efac;color:#06130a}'
      +'#smc-live-v6 .secondary{background:rgba(255,255,255,.07);color:#fff}'
      +'#smc-live-v6 .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;margin-top:13px}'
      +'#smc-live-v6 .card{display:block;text-decoration:none;color:#fff;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:13px;padding:13px;min-height:105px;transition:transform .15s,border-color .15s}'
      +'#smc-live-v6 .card:hover,#smc-live-v6 .card:focus{transform:translateY(-1px);border-color:rgba(134,239,172,.38);outline:none}'
      +'#smc-live-v6 .org{font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.5px;color:#a7f3d0}'
      +'#smc-live-v6 .name{font-size:.8rem;font-weight:800;line-height:1.45;margin-top:6px}'
      +'#smc-live-v6 .tag{display:inline-block;margin-top:8px;padding:3px 7px;border-radius:999px;background:rgba(134,239,172,.1);color:#86efac;font-size:.56rem;font-weight:900}'
      +'#smc-live-v6 .empty{padding:20px;text-align:center;color:#9ca3af;background:rgba(255,255,255,.025);border:1px dashed rgba(255,255,255,.1);border-radius:13px}'
      +'#smc-live-v6 .error{color:#fca5a5}'
      +'#smc-live-v6 .foot{margin-top:12px;text-align:right;color:#71717a;font-size:.6rem}'
      +'@media(max-width:620px){#smc-live-v6{padding:0 10px}#smc-live-v6 .grid{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }
  function getJson(url){
    return fetch(url+'?v=6&t='+Date.now(),{cache:'no-store',credentials:'same-origin'}).then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status+' '+url);return r.json();
    });
  }
  function useful(x){
    if(!x||!x.title||!x.url)return false;
    var years=String(x.title).match(/\b20\d{2}\b/g)||[];
    return !years.some(function(y){return Number(y)<2026;});
  }
  function smc(x){return /suratmunicipal\.gov\.in|surat municipal corporation|\bsmc\b|computer supervisor/i.test(String(x.url||'')+' '+String(x.title||'')+' '+String(x.source||''));}
  function dateText(v){if(!v)return '';var d=new Date(v);return isNaN(d)?String(v):d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
  function events(status){
    var a=status&&Array.isArray(status.events)?status.events:[];
    return a.map(function(e){return {title:String(e.title||'SMC recruitment update')+(e.date?' • '+dateText(e.date):''),status:String(e.status||'update').toUpperCase(),url:e.source||OFFICIAL_SMC,cadres:Array.isArray(e.cadres)?e.cadres:[]};});
  }
  function root(){
    var r=document.getElementById('smc-live-v6');if(r)return r;
    r=document.createElement('section');r.id='smc-live-v6';
    var slot=document.getElementById('live-jobs-slot');
    if(slot)slot.replaceWith(r);else document.body.appendChild(r);
    return r;
  }
  function render(data,status,error){
    css();
    if(!full&&!compact)return;
    var r=root(),items=(data&&Array.isArray(data.items)?data.items:[]).filter(useful).sort(function(a,b){
      var sa=smc(a)?0:(a.priority==='critical'?1:a.priority==='high'?2:3),sb=smc(b)?0:(b.priority==='critical'?1:b.priority==='high'?2:3);
      return sa-sb||String(b.last_changed_at||'').localeCompare(String(a.last_changed_at||''));
    }).slice(0,60);
    var ev=events(status);
    if(compact){
      var e=ev[0];
      r.innerHTML='<div class="panel"><div class="head"><div><div class="title">🔔 Live Gujarat &amp; SMC Updates</div><div class="sub">Official recruitment and SMC status are refreshed automatically.</div></div><div class="state">● AUTO-UPDATED</div></div>'
        +'<div class="sub" style="margin-top:10px">'+(e?esc(e.title)+' • '+esc(e.status):'No active SMC status event detected right now.')+'</div>'
        +'<div class="actions"><a class="primary" href="'+BASE+'live-jobs.html">View Live Jobs</a><a class="secondary" href="'+BASE+'answer-key.html">Answer Keys &amp; Results</a></div></div>';
      return;
    }
    var eventHtml=ev.map(function(e){return '<a class="card" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer"><div class="org">SMC OFFICIAL STATUS</div><div class="name">'+esc(e.title)+'</div><span class="tag">'+esc(e.status)+'</span>'+(e.cadres.length?'<div class="org" style="margin-top:7px">'+esc(e.cadres.join(' • '))+'</div>':'')+'</a>';}).join('');
    var cardHtml=items.map(function(x){return '<a class="card" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer"><div class="org">'+esc(x.source||'Gujarat Government')+'</div><div class="name">'+esc(x.title)+'</div><span class="tag">'+(smc(x)?'⭐ SMC PRIORITY':'LIVE UPDATE')+'</span></a>';}).join('');
    var msg=error?'<div class="empty"><b class="error">Live data could not be refreshed.</b><br><span>Showing the safe page controls. Tap Retry after checking your connection.</span></div>':(!eventHtml&&!cardHtml?'<div class="empty">No current recruitment records are available right now.</div>':'');
    r.innerHTML='<div class="panel"><div class="head"><div><div class="title">Gujarat Government &amp; SMC Live Jobs / Updates</div><div class="sub">Current recruitment information only. Every result below is a real link and opens the source in a new tab.</div></div><div class="state">● AUTO-UPDATED</div></div>'
      +'<div class="actions"><button class="primary" type="button" id="smc-live-retry">↻ Refresh Live Data</button><a class="secondary" href="'+OFFICIAL_SMC+'" target="_blank" rel="noopener noreferrer">Official SMC Recruitment</a></div>'
      +(eventHtml?'<div class="grid">'+eventHtml+'</div>':'')+(cardHtml?'<div class="grid">'+cardHtml+'</div>':'')+msg
      +'<div class="foot">'+items.length+' current records • '+esc((status&&status.updated_at)||(data&&data.updated_at)||new Date().toISOString())+'</div></div>';
    var b=document.getElementById('smc-live-retry');if(b)b.addEventListener('click',load);
  }
  function load(){
    if(!full&&!compact)return;
    render(null,null,null);
    Promise.all([getJson(DATA_URL),getJson(STATUS_URL)]).then(function(v){render(v[0],v[1],null);}).catch(function(err){console.warn('[SMC Live Jobs]',err);render(null,null,err);});
  }
  function start(){try{load();}catch(e){render(null,null,e);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
