/* Global live Gujarat Government + SMC update/status layer. */
(function(){
  'use strict';
  if(window.__GUJARAT_LIVE_JOBS__) return;
  window.__GUJARAT_LIVE_JOBS__=true;

  const BASE='/SMC-Computer-Supervisor-Exam-Prep/';
  const DATA_URL='https://raw.githubusercontent.com/abhiiibabariya-dev/SMC-Computer-Supervisor-Exam-Prep/master/gujarat-jobs.json';
  const STATUS_URL=BASE+'gujarat-monitor/smc-status.json';
  const OFFICIAL_SMC='https://www.suratmunicipal.gov.in/Information/RecruitmentNews';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isSMC=x=>/suratmunicipal\.gov\.in|surat municipal corporation|\bsmc\b|computer supervisor/i.test((x.url||'')+' '+(x.title||''));
  const rank=x=>isSMC(x)?0:(x.priority||'medium')==='high'?1:2;

  function fmtDate(iso){
    if(!iso) return '';
    const d=new Date(iso+'T00:00:00');
    return isNaN(d)?iso:d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  }

  function eventSummary(status){
    const events=Array.isArray(status?.events)?status.events:[];
    const labels={completed:'COMPLETED',postponed:'POSTPONED',scheduled:'SCHEDULED',cancelled:'CANCELLED'};
    return events.map(e=>({
      text:`${e.title||'SMC recruitment update'}${e.date?' • '+fmtDate(e.date):''}`,
      status:labels[e.status]||String(e.status||'UPDATE').toUpperCase(),
      cadres:Array.isArray(e.cadres)?e.cadres:[],
      url:e.source||OFFICIAL_SMC
    }));
  }

  function replaceStaleRenderedText(status){
    const events=eventSummary(status);
    const pro=events.find(e=>/public relation officer|PRO/i.test(e.cadres.join(' ')));
    const postponed=events.filter(e=>e.status==='POSTPONED');
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length) return;
      const raw=el.textContent||'';
      if(!raw.trim()) return;
      let t=raw;
      if(pro && pro.status==='COMPLETED'){
        t=t.replace(/SMC written exam scheduled for\s*12\s*July\s*2026[^.]*/i,'SMC: PRO written examination was held on 12 July 2026. Other cadres follow their own official SMC notices');
        t=t.replace(/Written Exam:\s*To Be Announced/i,'Written Exam: PRO held 12 July 2026');
        t=t.replace(/Admit Card:\s*Coming Soon/i,'Admit Card: Check official SMC notices');
        t=t.replace(/EXAM ON 12 JULY 2026\s*[—-]\s*Final Revision Time!/i,'PRO EXAM COMPLETED — 12 JULY 2026');
        t=t.replace(/EXAM ON 12 JULY 2026/i,'PRO EXAM COMPLETED — 12 JULY 2026');
        t=t.replace(/A live countdown switches on here the moment SMC announces the date\.\s*Until then[^.]*\./i,'The PRO exam was held on 12 July 2026. Track official answer key, result and selection updates here.');
      }
      if(postponed.length && /26\s*July\s*2026/i.test(t)){
        t=t.replace(/26\s*July\s*2026\s*[—-]?\s*Final Revision Time!/i,'26 July 2026 — EXAM POSTPONED');
      }
      if(t!==raw) el.textContent=t;
    });
  }

  function styles(){
    if(document.getElementById('gj-live-style')) return;
    const s=document.createElement('style');s.id='gj-live-style';
    s.textContent=`#gj-live-updates{max-width:1100px;margin:36px auto 28px;padding:0 18px;position:relative;z-index:20;font-family:inherit}#gj-live-updates .gj-box{background:linear-gradient(135deg,rgba(10,20,16,.97),rgba(10,14,22,.97));border:1px solid rgba(34,197,94,.22);border-radius:18px;padding:18px;box-shadow:0 12px 40px rgba(0,0,0,.25)}#gj-live-updates .gj-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}#gj-live-updates .gj-title{font-size:1rem;font-weight:900;color:#f4f4f5}#gj-live-updates .gj-live{font-size:.68rem;font-weight:800;color:#86efac;white-space:nowrap}#gj-live-updates .gj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:9px}#gj-live-updates .gj-item{display:block;text-decoration:none;color:inherit;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px}.gj-status{font-size:.62rem;font-weight:900;color:#fde68a;margin-top:6px}.gj-cadres{font-size:.64rem;color:#a1a1aa;margin-top:4px}#gj-live-updates .gj-org{font-size:.64rem;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:#a7f3d0;margin-bottom:4px}#gj-live-updates .gj-name{font-size:.8rem;line-height:1.4;font-weight:800;color:#f4f4f5}#gj-live-updates .gj-tag{display:inline-block;margin-top:7px;padding:3px 8px;border-radius:999px;font-size:.58rem;font-weight:800;background:rgba(34,197,94,.1);color:#86efac}#gj-live-updates .gj-footer{margin-top:11px;text-align:right;font-size:.65rem;color:#71717a}@media(max-width:600px){#gj-live-updates{margin:28px 10px 24px;padding:0}#gj-live-updates .gj-box{padding:13px}#gj-live-updates .gj-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }

  function placeRoot(root){
    // Do not insert before the navigation or at document.body.firstChild.
    // Prefer the existing News/Jobs section, otherwise append to main content.
    const anchor=document.querySelector('.news-section, #jobList, main');
    if(anchor && anchor.parentNode){
      if(anchor.classList?.contains('news-section')) anchor.parentNode.insertBefore(root,anchor.nextSibling);
      else if(anchor.id==='jobList') anchor.parentNode.insertBefore(root,anchor.nextSibling);
      else anchor.appendChild(root);
    }else{
      document.body.appendChild(root);
    }
  }

  function renderJobs(data,status){
    if(!data||!Array.isArray(data.items)) return;
    styles();
    const items=data.items.filter(x=>x&&x.url&&x.title).sort((a,b)=>rank(a)-rank(b)).slice(0,40);
    const events=eventSummary(status);
    const eventHtml=events.map(e=>`<a class="gj-item" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer"><div class="gj-org">SMC OFFICIAL STATUS</div><div class="gj-name">${esc(e.text)}</div><div class="gj-status">${esc(e.status)}</div>${e.cadres.length?`<div class="gj-cadres">${esc(e.cadres.join(' • '))}</div>`:''}</a>`).join('');
    const cards=items.map(x=>`<a class="gj-item" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><div class="gj-org">${esc(x.source||'Gujarat Government')}</div><div class="gj-name">${esc(x.title)}</div><span class="gj-tag">${isSMC(x)?'⭐ SMC PRIORITY':'LIVE UPDATE'}</span></a>`).join('');
    let root=document.getElementById('gj-live-updates');
    if(!root){root=document.createElement('section');root.id='gj-live-updates';placeRoot(root)}
    root.innerHTML=`<div class="gj-box"><div class="gj-head"><div class="gj-title">Gujarat Government &amp; SMC Live Jobs / Updates</div><div class="gj-live">● AUTO-UPDATED</div></div>${eventHtml?`<div class="gj-grid">${eventHtml}</div>`:''}<div class="gj-grid" style="margin-top:10px">${cards}</div><div class="gj-footer">${items.length} current live records • Last scan ${esc(status?.updated_at||data?.updated_at||'now')}</div></div>`;
  }

  function start(){
    Promise.all([
      fetch(DATA_URL+'?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),
      fetch(STATUS_URL+'?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
    ]).then(([data,status])=>{replaceStaleRenderedText(status||{});renderJobs(data,status||{})});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
