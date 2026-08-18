/* Global live Gujarat Government + SMC update/status layer. */
(function(){
  'use strict';
  if (window.__GUJARAT_LIVE_JOBS__) return;
  window.__GUJARAT_LIVE_JOBS__ = true;

  const BASE='/SMC-Computer-Supervisor-Exam-Prep/';
  const DATA_URL='https://raw.githubusercontent.com/abhiiibabariya-dev/SMC-Computer-Supervisor-Exam-Prep/master/gujarat-jobs.json';
  const STATUS_URL=BASE+'gujarat-monitor/smc-status.json';
  const MAX_ITEMS=60;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isSMC=x=>/smc|surat municipal|suratmunicipal/i.test((x.source||'')+' '+(x.title||'')+' '+(x.url||''));
  const rank=x=>isSMC(x)?0:(x.priority||'medium')==='high'?1:2;

  function fmtDate(iso){
    if(!iso) return '';
    const d=new Date(iso+'T00:00:00');
    return d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  }

  function updateExamStatus(status){
    if(!status) return;
    const exam=fmtDate(status.exam_date)||'the announced exam date';
    const completed=!!status.exam_completed;
    const answer=!!status.answer_key_available;

    // Replace stale date/status wording everywhere in the rendered page.
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length>0) return;
      const raw=el.textContent||'';
      if(!raw.trim()) return;
      let t=raw;
      if(completed){
        t=t.replace(/🔥\s*EXAM ON\s+12\s+JULY\s+2026[^\n]*/i,'✅ EXAM COMPLETED — 12 JULY 2026 | Track Answer Key & Result Updates');
        t=t.replace(/SMC written exam scheduled for\s+12\s+July\s+2026[^.]*\./i,'SMC written examination was held on 12 July 2026.');
        t=t.replace(/Call letter download opens soon[^·]*[·•]?/i,'Exam completed. ');
        t=t.replace(/📅\s*EXAM DATE OUT[^\n]*/i,'✅ EXAM COMPLETED — Written Exam held on 12 July 2026');
        t=t.replace(/EXAM\s*12\s*JUL/i,'EXAM COMPLETED');
        t=t.replace(/CALL LETTER SOON/i,answer?'ANSWER KEY AVAILABLE':'EXAM COMPLETED');
        t=t.replace(/Admit Card:\s*Coming Soon/i,'Admit Card: Exam completed');
        t=t.replace(/Written Exam:\s*To Be Announced/i,'Written Exam: Held 12 July 2026');
        t=t.replace(/A live countdown switches on here the moment SMC announces the date\.\s*Until then[^.]*\./i,'The exam date has passed. Track official answer key, result and merit-list updates here.');
        t=t.replace(/NOW\s*[—-]\s*Exam Prep/i,'NOW — Answer Key & Result Tracking');
        t=t.replace(/Before\s+12\s+July\s+2026/i,'Exam completed — 12 July 2026');
        t=t.replace(/📝\s*WRITTEN EXAMINATION[^\n]*/i,'✅ WRITTEN EXAMINATION COMPLETED — 12 July 2026');
        t=t.replace(/Final revision time is NOW!/i,'Exam completed. Now track answer key, result and merit updates.');
        t=t.replace(/Call letter download opens soon at suratmunicipal\.gov\.in/i,'Official answer key and result updates are available through SMC Recruitment');
      }
      if(t!==raw) el.textContent=t;
    });

    // Target the common Exam Status card even if its labels are split across elements.
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length>0) return;
      const t=(el.textContent||'').trim();
      if(/Applications Closed/i.test(t) && /15 April 2026/i.test(t)){
        const card=el.closest('section,article,.card,.container,div');
        if(card && completed){
          const text=card.textContent||'';
          if(/Coming Soon|To Be Announced/i.test(text)){
            card.querySelectorAll('*').forEach(n=>{
              if(n.children.length===0){
                n.textContent=n.textContent.replace(/Coming Soon/gi,'Exam completed').replace(/To Be Announced/gi,'Held 12 July 2026');
              }
            });
          }
        }
      }
    });
  }

  function hideStaleJobNews(){
    document.querySelectorAll('[id],[class]').forEach(el=>{
      if(el.closest('nav,header,footer')) return;
      const key=((el.id||'')+' '+(typeof el.className==='string'?el.className:'')).toLowerCase();
      if(/\b(latest[-_ ]?(news|updates)|job[-_ ]?updates|recruitment[-_ ]?updates|govt[-_ ]?updates)\b/.test(key)) el.style.display='none';
    });
  }

  function styles(){
    if(document.getElementById('gj-live-style')) return;
    const s=document.createElement('style'); s.id='gj-live-style';
    s.textContent=`
      #gj-live-updates{max-width:1100px;margin:92px auto 24px;padding:0 18px;position:relative;z-index:20;font-family:inherit}
      #gj-live-updates .gj-box{background:linear-gradient(135deg,rgba(10,20,16,.97),rgba(10,14,22,.97));border:1px solid rgba(34,197,94,.22);border-radius:18px;padding:18px;box-shadow:0 12px 40px rgba(0,0,0,.25)}
      #gj-live-updates .gj-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}
      #gj-live-updates .gj-title{font-size:1rem;font-weight:900;color:#f4f4f5}
      #gj-live-updates .gj-live{font-size:.68rem;font-weight:800;color:#86efac;white-space:nowrap}
      #gj-live-updates .gj-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:9px}
      #gj-live-updates .gj-item{display:block;text-decoration:none;color:inherit;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;transition:.2s}
      #gj-live-updates .gj-item:hover{transform:translateY(-2px);border-color:rgba(34,197,94,.35)}
      #gj-live-updates .gj-org{font-size:.64rem;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:#a7f3d0;margin-bottom:4px}
      #gj-live-updates .gj-name{font-size:.8rem;line-height:1.4;font-weight:800;color:#f4f4f5}
      #gj-live-updates .gj-tag{display:inline-block;margin-top:7px;padding:3px 8px;border-radius:999px;font-size:.58rem;font-weight:800;background:rgba(34,197,94,.1);color:#86efac}
      #gj-live-updates .gj-footer{margin-top:11px;text-align:right;font-size:.65rem;color:#71717a}
      @media(max-width:600px){#gj-live-updates{margin-top:82px;padding:0 10px}#gj-live-updates .gj-box{padding:13px}#gj-live-updates .gj-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function render(data){
    if(!data || !Array.isArray(data.items)) return;
    styles();
    hideStaleJobNews();
    const items=data.items.filter(x=>x&&x.url&&x.title).sort((a,b)=>rank(a)-rank(b));
    const top=items.slice(0,MAX_ITEMS);
    const cards=top.map(x=>`<a class="gj-item" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><div class="gj-org">${esc(x.source||'Gujarat Government')}</div><div class="gj-name">${esc(x.title)}</div><span class="gj-tag">${isSMC(x)?'⭐ SMC PRIORITY':'LIVE UPDATE'}</span></a>`).join('');
    let root=document.getElementById('gj-live-updates');
    if(!root){ root=document.createElement('section'); root.id='gj-live-updates'; document.body.insertBefore(root,document.body.firstChild); }
    root.innerHTML=`<div class="gj-box"><div class="gj-head"><div class="gj-title">Gujarat Government &amp; SMC Live Jobs / Updates</div><div class="gj-live">● AUTO-UPDATED</div></div><div class="gj-grid">${cards}</div><div class="gj-footer">${top.length} live records shown • Data updated ${esc(data.updated_at||'latest scan')}</div></div>`;

    const list=document.getElementById('jobList');
    if(list){
      const html=top.map(x=>`<a class="job-card" href="${esc(x.url)}" target="_blank" rel="noopener"><div class="job-top"><div><div class="job-org">${esc(x.source||'Gujarat Government')}</div><div class="job-title">${esc(x.title)}</div></div><div class="job-arrow">→</div></div><div class="job-meta"><span class="job-tag ${isSMC(x)?'tag-live':'tag-posts'}">${isSMC(x)?'⭐ SMC PRIORITY':'LIVE UPDATE'}</span><span class="job-tag tag-qual">${esc((x.priority||'medium').toUpperCase())}</span></div><div class="job-desc">Official source: ${esc(x.source||'Gujarat Government')}</div><span class="job-link">Open Official Source →</span></a>`).join('');
      list.innerHTML=html;
    }
  }

  function start(){
    Promise.all([
      fetch(DATA_URL+'?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),
      fetch(STATUS_URL+'?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
    ]).then(([data,status])=>{
      updateExamStatus(status);
      if(data) render(data);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
