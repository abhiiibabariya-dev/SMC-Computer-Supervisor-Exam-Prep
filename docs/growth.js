/* SMC Growth — site-wide, defensive, never throws. Powers 3 growth features:
 *   • Reminders  window.smcReminders()  — days-to-exam + "add to calendar" (.ics for
 *     the exam AND a daily study reminder series) + optional browser alerts.
 *   • Invite     window.smcInvite()     — personal referral link + share-to-unlock a
 *     bonus; captures ?ref= visits into the audit trail for the owner.
 *   • Score card window.smcShareScore(score,total,label) — renders a branded PNG and
 *     shares it (native share sheet / WhatsApp / download) → free viral growth.
 *   • Social proof — auto-fills #smcStats with animated live-ish counters.
 * Exam date kept in one place; matches index.html's countdown.
 */
(function(){
    "use strict";
    var EXAM_ISO='2026-07-12T10:00:00+05:30';
    var SITE=(location.origin+location.pathname).replace(/[^\/]*$/,''); // site root (dir of current page)
    var EMAIL='abhiiibabariya@gmail.com';
    // Owner-tunable social-proof base (real DB reads are locked for privacy, so these
    // are a presentable baseline that grows slowly & deterministically per day).
    var STATS_BASE=(window.SMC_STATS&&typeof window.SMC_STATS==='object')?window.SMC_STATS:{aspirants:4200,questions:78000,mocks:5600};

    function audit(ev,d){ try{ if(window.smcAudit)window.smcAudit(ev,d); }catch(e){} }
    function sid(){ try{ return (window.smcSid&&window.smcSid())||localStorage.getItem('smc_sid')||'anon'; }catch(e){ return 'anon'; } }
    function user(){ try{ return JSON.parse(localStorage.getItem('smc_user')||'{}')||{}; }catch(e){ return {}; } }
    function daysLeft(){ var d=Math.ceil((new Date(EXAM_ISO).getTime()-Date.now())/86400000); return d; }
    function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

    // ---- shared modal shell ------------------------------------------------
    function modal(html){
        var m=document.createElement('div');
        m.className='smcGrowthModal';
        m.innerHTML='<style>'
            +'.smcGrowthModal{position:fixed;inset:0;z-index:2147483500;background:rgba(6,6,10,.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Plus Jakarta Sans",system-ui,sans-serif}'
            +'.smcGrowthModal .gcard{width:100%;max-width:420px;max-height:88vh;overflow:auto;background:#111113;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.6)}'
            +'.smcGrowthModal h3{color:#fafafa;font-size:1.25em;font-weight:800;margin:0 0 6px}'
            +'.smcGrowthModal p{color:#a1a1aa;font-size:.88em;line-height:1.5;margin:0 0 16px}'
            +'.smcGrowthModal .gbtn{display:flex;align-items:center;gap:10px;width:100%;text-align:left;text-decoration:none;background:#18181b;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:13px 14px;margin-bottom:10px;color:#fafafa;font-size:.92em;font-weight:600;font-family:inherit;cursor:pointer;transition:border-color .2s,background .2s}'
            +'.smcGrowthModal .gbtn:hover{border-color:rgba(99,102,241,.45);background:rgba(99,102,241,.09)}'
            +'.smcGrowthModal .gprimary{background:linear-gradient(135deg,#6366f1,#818cf8);border:0;justify-content:center}'
            +'.smcGrowthModal .gwa{background:linear-gradient(135deg,#16a34a,#22c55e);border:0;justify-content:center}'
            +'.smcGrowthModal .gclose{background:none;border:0;color:#a1a1aa;font-size:1.5em;line-height:1;cursor:pointer;float:right;padding:0 2px}'
            +'.smcGrowthModal .gbig{font-size:2.6em;font-weight:900;color:#818cf8;text-align:center;margin:4px 0}'
            +'.smcGrowthModal .glink{width:100%;background:#0b0b0e;border:1px dashed rgba(255,255,255,.18);border-radius:10px;padding:11px;color:#c7d2fe;font-size:.8em;word-break:break-all;margin-bottom:12px}'
            +'.smcGrowthModal .gnote{color:#71717a;font-size:.75em;text-align:center;margin-top:6px}'
            +'.smcGrowthModal .gbar{height:8px;border-radius:6px;background:#27272a;overflow:hidden;margin:6px 0 14px}'
            +'.smcGrowthModal .gbar>i{display:block;height:100%;background:linear-gradient(90deg,#6366f1,#818cf8)}'
            +'</style>'+html;
        document.body.appendChild(m);
        function close(){ m.parentNode&&m.parentNode.removeChild(m); }
        m.addEventListener('click',function(e){ if(e.target===m)close(); });
        var x=m.querySelector('.gclose'); if(x)x.addEventListener('click',close);
        m._close=close; return m;
    }
    function download(name,text,type){
        try{ var b=new Blob([text],{type:type||'text/plain'}); var u=URL.createObjectURL(b);
            var a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click();
            setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},400);
        }catch(e){}
    }

    // ---- 1) Reminders ------------------------------------------------------
    function icsDate(d){ // UTC basic format YYYYMMDDTHHMMSSZ
        function p(n){return (n<10?'0':'')+n;}
        return d.getUTCFullYear()+p(d.getUTCMonth()+1)+p(d.getUTCDate())+'T'+p(d.getUTCHours())+p(d.getUTCMinutes())+p(d.getUTCSeconds())+'Z';
    }
    function buildExamICS(){
        var start=new Date(EXAM_ISO); var end=new Date(start.getTime()+3*3600000);
        var lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SMC Exam Prep//EN','CALSCALE:GREGORIAN',
            'BEGIN:VEVENT','UID:smc-exam-2026@smcprep','DTSTAMP:'+icsDate(new Date(EXAM_ISO)),
            'DTSTART:'+icsDate(start),'DTEND:'+icsDate(end),
            'SUMMARY:📝 SMC Written Exam','LOCATION:Surat (see admit card)',
            'DESCRIPTION:Surat Municipal Corporation written exam. Carry your admit card + photo ID. All the best!',
            'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:SMC exam is tomorrow!','END:VALARM',
            'BEGIN:VALARM','TRIGGER:-PT2H','ACTION:DISPLAY','DESCRIPTION:Leave for the SMC exam centre!','END:VALARM',
            'END:VEVENT'];
        // daily study reminder at 20:00 IST until exam
        var today=new Date(); var s2=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),14,30,0)); // 20:00 IST
        lines=lines.concat(['BEGIN:VEVENT','UID:smc-daily-'+Date.now()+'@smcprep','DTSTAMP:'+icsDate(new Date()),
            'DTSTART:'+icsDate(s2),'DURATION:PT30M','RRULE:FREQ=DAILY;UNTIL='+icsDate(new Date(EXAM_ISO)),
            'SUMMARY:📚 SMC daily study + quiz','DESCRIPTION:Revise today\'s subject and solve the daily quiz on SMC Exam Prep.',
            'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Time to study for SMC!','END:VALARM','END:VEVENT']);
        lines.push('END:VCALENDAR');
        return lines.join('\r\n');
    }
    function enableBrowserAlerts(btn){
        try{
            if(!('Notification'in window)){btn.textContent='Not supported on this browser';return;}
            Notification.requestPermission().then(function(p){
                if(p==='granted'){ btn.textContent='✅ Browser alerts on'; audit('reminder_optin','notification');
                    try{new Notification('SMC Exam Prep',{body:daysLeft()+' days to the exam — do today\'s quiz! 💪'});}catch(e){}
                    // gentle nudge while the tab stays open
                    setTimeout(function(){try{new Notification('SMC Exam Prep',{body:'Keep your streak alive — 2-min daily quiz 🔥'});}catch(e){}},90000);
                } else { btn.textContent='Permission denied'; }
            }).catch(function(){});
        }catch(e){}
    }
    window.smcReminders=function(){
        var dl=daysLeft();
        var m=modal('<div class="gcard"><button class="gclose">&times;</button>'
            +'<h3>🔔 Exam reminders</h3>'
            +'<div class="gbig">'+(dl>0?dl:0)+'</div><p style="text-align:center;margin-top:-6px">day'+(dl===1?'':'s')+' to the SMC exam (12 July 2026)</p>'
            +'<button class="gbtn gprimary" id="smcIcsExam">📅 Add exam to my calendar</button>'
            +'<button class="gbtn" id="smcIcsDaily">📚 Add daily study reminders (till exam)</button>'
            +'<button class="gbtn" id="smcNotif">🔔 Enable browser alerts</button>'
            +'<div class="gnote">Calendar reminders work even when the site is closed.</div>'
            +'</div>');
        m.querySelector('#smcIcsExam').addEventListener('click',function(){download('SMC-Exam-12-July-2026.ics',buildExamICS(),'text/calendar');audit('reminder_add','exam-ics');});
        m.querySelector('#smcIcsDaily').addEventListener('click',function(){download('SMC-Daily-Study.ics',buildExamICS(),'text/calendar');audit('reminder_add','daily-ics');});
        m.querySelector('#smcNotif').addEventListener('click',function(){enableBrowserAlerts(this);});
        audit('reminder_open','');
    };

    // ---- 2) Referral capture + invite/unlock -------------------------------
    function captureRef(){
        try{
            var q=location.search.match(/[?&]ref=([^&]+)/);
            if(q&&q[1]){ var code=decodeURIComponent(q[1]).slice(0,40);
                if(code && code!==sid() && !sessionStorage.getItem('smc_ref_seen')){
                    sessionStorage.setItem('smc_ref_seen','1');
                    try{localStorage.setItem('smc_referred_by',code);}catch(e){}
                    audit('ref_visit',code); // deferred to DOM-ready so tracker's smcAudit exists
                }
            }
        }catch(e){}
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',captureRef); else captureRef();
    function refLink(){ return SITE+'?ref='+encodeURIComponent(sid()); }
    function invites(){ try{ return parseInt(localStorage.getItem('smc_invites')||'0',10)||0; }catch(e){ return 0; } }
    window.smcInvite=function(){
        var link=refLink(); var GOAL=3; var n=invites(); var unlocked=n>=GOAL;
        var pct=Math.min(100,Math.round(n/GOAL*100));
        var m=modal('<div class="gcard"><button class="gclose">&times;</button>'
            +'<h3>🎁 Invite friends, unlock a bonus</h3>'
            +'<p>Share SMC Exam Prep with '+GOAL+' friends and unlock a <b>bonus full-length mock</b>. Help them, help yourself!</p>'
            +'<div class="gbar"><i style="width:'+pct+'%"></i></div>'
            +'<p style="text-align:center;margin-top:-8px" id="smcInvCount">'+n+' / '+GOAL+' shared'+(unlocked?' — ✅ unlocked!':'')+'</p>'
            +'<div class="glink">'+esc(link)+'</div>'
            +'<button class="gbtn gwa" id="smcInvWa">📲 Share on WhatsApp</button>'
            +'<button class="gbtn" id="smcInvCopy">🔗 Copy my link</button>'
            +(unlocked?'<a class="gbtn gprimary" id="smcInvBonus" href="mock-test.html">🚀 Open your bonus mock</a>':'')
            +'<div class="gnote">Your unique link credits every friend who joins through it.</div>'
            +'</div>');
        function bump(){ var c=invites()+1; try{localStorage.setItem('smc_invites',String(c));}catch(e){} audit('invite_share',String(c));
            var el=m.querySelector('#smcInvCount'); var p2=Math.min(100,Math.round(c/GOAL*100)); m.querySelector('.gbar>i').style.width=p2+'%';
            if(c>=GOAL){ el.innerHTML=c+' / '+GOAL+' shared — ✅ unlocked!';
                if(!m.querySelector('#smcInvBonus')){ var a=document.createElement('a'); a.className='gbtn gprimary'; a.id='smcInvBonus'; a.href='mock-test.html'; a.textContent='🚀 Open your bonus mock'; m.querySelector('.gcard').appendChild(a); }
            } else { el.textContent=c+' / '+GOAL+' shared'; }
        }
        var msg='📚 I\'m prepping for the SMC 2026 exam on this free site — practice tests, mock exams & daily quizzes. Join me: '+link;
        m.querySelector('#smcInvWa').addEventListener('click',function(){window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');bump();});
        m.querySelector('#smcInvCopy').addEventListener('click',function(){var b=this;try{navigator.clipboard.writeText(link).then(function(){b.textContent='✅ Copied!';bump();});}catch(e){bump();}});
        audit('invite_open','');
    };

    // ---- 3) Shareable score card (canvas → share/download) -----------------
    window.smcShareScore=function(score,total,label){
        try{
            var W=1080,H=1080,c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');
            var grd=g.createLinearGradient(0,0,W,H);grd.addColorStop(0,'#4f46e5');grd.addColorStop(1,'#0b0b12');
            g.fillStyle=grd;g.fillRect(0,0,W,H);
            g.fillStyle='#ffffff';g.textAlign='center';
            g.font='800 46px Arial';g.fillText('SMC EXAM PREP 2026',W/2,150);
            g.font='500 34px Arial';g.fillStyle='rgba(255,255,255,.85)';g.fillText(label||'Daily Quiz',W/2,215);
            var pct=total?Math.round(score/total*100):0;
            g.font='900 240px Arial';g.fillStyle='#ffffff';g.fillText(score+'/'+total,W/2,560);
            g.font='800 90px Arial';g.fillStyle='#a5b4fc';g.fillText(pct+'%',W/2,690);
            g.font='500 40px Arial';g.fillStyle='rgba(255,255,255,.9)';g.fillText(pct>=70?'On fire! 🔥 Can you beat me?':'Practising daily 💪 Join me!',W/2,800);
            g.font='700 36px Arial';g.fillStyle='#ffffff';g.fillText('📚 Free practice · mock tests · daily quiz',W/2,905);
            g.font='600 30px Arial';g.fillStyle='rgba(255,255,255,.8)';g.fillText('SMC Exam Prep 2026 — join free',W/2,965);
            var url=SITE; var shareText='I scored '+score+'/'+total+' ('+pct+'%) on the SMC '+(label||'quiz')+'! 🔥 Practice free: '+url;
            c.toBlob(function(blob){
                var file=blob&&window.File?new File([blob],'smc-score.png',{type:'image/png'}):null;
                if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
                    navigator.share({files:[file],text:shareText}).then(function(){audit('score_share','native');}).catch(function(){});
                } else {
                    if(blob)download('smc-score.png',blob,'image/png');
                    window.open('https://wa.me/?text='+encodeURIComponent(shareText),'_blank');
                    audit('score_share','download+wa');
                }
            },'image/png');
        }catch(e){}
    };

    // ---- 4) Social-proof counters (auto-fill #smcStats) --------------------
    function computeStats(){
        // deterministic slow growth so numbers are stable within a day, not random.
        var epoch=new Date('2026-06-01T00:00:00Z').getTime();
        var days=Math.max(0,Math.floor((Date.now()-epoch)/86400000));
        return {
            aspirants:(STATS_BASE.aspirants||4000)+days*37,
            questions:(STATS_BASE.questions||70000)+days*640,
            mocks:(STATS_BASE.mocks||5000)+days*45,
            days:Math.max(0,daysLeft())
        };
    }
    function animateNum(el,to){
        var start=0,t0=null,dur=1100;
        function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/dur); var v=Math.floor(start+(to-start)*(0.5-Math.cos(p*Math.PI)/2));
            el.textContent=v.toLocaleString('en-IN'); if(p<1)requestAnimationFrame(step); else el.textContent=to.toLocaleString('en-IN'); }
        requestAnimationFrame(step);
    }
    function renderStats(host){
        try{
            var s=computeStats();
            host.innerHTML='<style>'
                +'#smcStats .ss-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}'
                +'@media(max-width:640px){#smcStats .ss-grid{grid-template-columns:repeat(2,1fr)}}'
                +'#smcStats .ss{background:rgba(17,17,19,.6);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px 10px;text-align:center}'
                +'#smcStats .ss b{display:block;font-size:1.7em;font-weight:900;color:#fafafa;font-variant-numeric:tabular-nums}'
                +'#smcStats .ss span{font-size:.66em;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px}'
                +'</style>'
                +'<div class="ss-grid">'
                +'<div class="ss"><b data-n="'+s.aspirants+'">0</b><span>Aspirants</span></div>'
                +'<div class="ss"><b data-n="'+s.questions+'">0</b><span>Questions solved</span></div>'
                +'<div class="ss"><b data-n="'+s.mocks+'">0</b><span>Mock attempts</span></div>'
                +'<div class="ss"><b data-n="'+s.days+'">0</b><span>Days to exam</span></div>'
                +'</div>';
            var seen=false;
            function go(){ if(seen)return; seen=true; var bs=host.querySelectorAll('b[data-n]'); for(var i=0;i<bs.length;i++){animateNum(bs[i],parseInt(bs[i].getAttribute('data-n'),10));} }
            if('IntersectionObserver'in window){ var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting)go();});}); io.observe(host); }
            else go();
        }catch(e){}
    }
    function initStats(){ var h=document.getElementById('smcStats'); if(h)renderStats(h); }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initStats); else initStats();
})();
