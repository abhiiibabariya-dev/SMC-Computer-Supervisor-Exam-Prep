/* SMC Enhance — one lightweight, defensive helper loaded site-wide.
 * Never throws, never blocks first paint. Jobs:
 *   1) Quick-nav + help menu — a floating button on EVERY page so a visitor who
 *      landed on (or was routed to) any subject page can jump Home / to Quizzes /
 *      Mock Test / Leaderboard / Exam Info in one tap, plus contact + community.
 *   2) Save-as-PDF        — print stylesheet + button so users/clients can save any
 *                           page as a clean PDF to read & understand offline.
 *   3) Install app (PWA)  — surfaces the "Add to Home Screen" prompt when available.
 *   4) Responsive         — device classes + fluid CSS so it fits every screen.
 *   5) Auto "lite mode"   — strips heavy effects on weak/data-saver devices → smooth.
 */
(function(){
    "use strict";
    var EMAIL='abhiiibabariya@gmail.com';
    var IG='enough_abhie_';
    var IG_URL='https://instagram.com/'+IG;
    // Optional community group (WhatsApp/Telegram). Set window.SMC_COMMUNITY_URL in
    // firebase-config.js to reveal a "Join the group" button; hidden while empty.
    var COMMUNITY=(typeof window!=='undefined'&&window.SMC_COMMUNITY_URL)||'';

    // Quick links shown in the menu (icon, label, page). All pages are siblings, so
    // a plain relative href works from anywhere on the site.
    var NAV=[
        ['🏠','Home','index.html'],
        ['🗓️','10-Day Plan','revision-plan.html'],
        ['📊','My Progress','progress.html'],
        ['✍️','Daily Quiz','daily-quiz.html'],
        ['🧪','Mock Test','mock-test.html'],
        ['🎯','Practice Quiz','quiz.html'],
        ['🏆','Leaderboard','leaderboard.html'],
        ['📅','Exam Info','exam.html'],
        ['💼','Govt Jobs','govt-jobs.html']
    ];

    function ready(fn){ if(document.body)fn(); else document.addEventListener('DOMContentLoaded',fn); }
    function injectStyle(id,css){
        try{ if(document.getElementById(id))return;
            var s=document.createElement('style');s.id=id;s.textContent=css;
            (document.head||document.documentElement).appendChild(s);
        }catch(e){}
    }
    function audit(ev,d){ try{ if(window.smcAudit)window.smcAudit(ev,d); }catch(e){} }

    // ---- 4) Responsive: device class on <html> + fluid safety net ----------
    function deviceClass(){
        try{
            var w=window.innerWidth||screen.width||1024, el=document.documentElement;
            var touch=('ontouchstart'in window)||(navigator.maxTouchPoints>0);
            el.classList.remove('is-mobile','is-tablet','is-desktop','is-portrait','is-landscape');
            el.classList.add(w<640?'is-mobile':(w<=1024?'is-tablet':'is-desktop'));
            el.classList.add((window.innerHeight>=window.innerWidth)?'is-portrait':'is-landscape');
            if(touch)el.classList.add('is-touch');
        }catch(e){}
    }
    injectStyle('smcEnhanceCss',
        'html,body{max-width:100%;overflow-x:hidden}'
        +'img,video,canvas,svg,iframe{max-width:100%;height:auto}'
        +'table{max-width:100%}'
        +'html.is-touch button,html.is-touch a.b,html.is-touch .b,html.is-touch .nav a{min-height:44px}'
        +'#smcChip{bottom:calc(14px + env(safe-area-inset-bottom,0px)) !important}'
        +'#smcMenuFab{bottom:calc(74px + env(safe-area-inset-bottom,0px))}'
        +'@media(max-width:768px){#smcMenuFab{right:12px;bottom:calc(72px + env(safe-area-inset-bottom,0px))}}'
    );
    deviceClass();
    var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(deviceClass,150);},{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(deviceClass,200);});

    // ---- 2) Save-as-PDF: clean print stylesheet ----------------------------
    // Forces a white background + dark text, hides all overlays/decoration, so
    // "Save as PDF" (or Print) produces a readable document, not a dark-mode mess.
    injectStyle('smcPrintCss',
        '@media print{'
        +'#smcMenuFab,#smcMenuPanel,#smcShare,#smcFab,#smcCopy,#smcToast,#smcChip,#smcHelpFab,#smcHelpCard,#smcRoute,#smcPick,'
        +'.nav,.mesh,.aurora,.glow-orbs,#particles,.floaters,.spotlight,.cursor-dot,.cursor-ring,.scroll-progress,.loader-screen,.marquee-wrap,.hero-glow{display:none !important}'
        +'html,body{background:#fff !important}'
        +'body *{color:#111 !important;background-color:transparent !important;box-shadow:none !important;text-shadow:none !important;border-color:#ccc !important}'
        +'a{color:#0645ad !important;text-decoration:underline}'
        +'}'
    );

    // ---- 3) Auto lite mode on weak / constrained devices -------------------
    function isLite(){
        try{
            var cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection||{};
            if(cn.saveData===true)return true;
            if(/(^|\b)(2g|slow-2g|3g)$/i.test(cn.effectiveType||''))return true;
            if(typeof navigator.hardwareConcurrency==='number'&&navigator.hardwareConcurrency<=4)return true;
            if(typeof navigator.deviceMemory==='number'&&navigator.deviceMemory<=4)return true;
            if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return true;
        }catch(e){}
        return false;
    }
    if(isLite()){
        try{document.documentElement.classList.add('smc-lite');}catch(e){}
        injectStyle('smcLiteCss',
            'html.smc-lite .mesh i,html.smc-lite .glow-orb,html.smc-lite .glow-orbs,html.smc-lite #particles,'
            +'html.smc-lite .aurora,html.smc-lite .aurora-beam,html.smc-lite .spotlight,html.smc-lite .floaters,'
            +'html.smc-lite .floater,html.smc-lite .hero-glow,html.smc-lite .cursor-dot,html.smc-lite .cursor-ring'
            +'{display:none !important}'
            +'html.smc-lite *,html.smc-lite *::before,html.smc-lite *::after{'
            +'animation-duration:0.001ms !important;animation-iteration-count:1 !important;'
            +'transition-duration:0.001ms !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important}'
        );
    }

    // ---- PWA install prompt capture ----------------------------------------
    var deferredPrompt=null;
    window.addEventListener('beforeinstallprompt',function(e){
        try{e.preventDefault();deferredPrompt=e;var r=document.getElementById('smcInstallRow');if(r)r.style.display='';}catch(err){}
    });

    // ---- 1) Menu widget (nav + PDF + install + contact + community) --------
    function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    function mountMenu(){
        try{
            if(document.getElementById('smcMenuFab'))return;
            injectStyle('smcMenuCss',
                '#smcMenuFab{position:fixed;right:16px;z-index:2147483000;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:0;border-radius:50px;padding:10px 16px 10px 13px;font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:.82em;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.4);display:flex;align-items:center;gap:7px;transition:transform .2s}'
                +'#smcMenuFab:hover{transform:translateY(-2px)}'
                +'#smcMenuPanel{position:fixed;right:16px;bottom:128px;z-index:2147483001;width:290px;max-width:calc(100vw - 32px);max-height:72vh;overflow:auto;background:#111113;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.55);font-family:"Plus Jakarta Sans",system-ui,sans-serif;opacity:0;transform:translateY(10px);transition:opacity .22s,transform .22s;pointer-events:none}'
                +'#smcMenuPanel.on{opacity:1;transform:none;pointer-events:auto}'
                +'#smcMenuPanel .hh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}'
                +'#smcMenuPanel h4{color:#fafafa;font-size:1.02em;font-weight:800;margin:0}'
                +'#smcMenuPanel .cl{background:none;border:0;color:#a1a1aa;font-size:1.4em;line-height:1;cursor:pointer;padding:0 4px}'
                +'#smcMenuPanel .lbl{color:#71717a;font-size:.68em;font-weight:700;letter-spacing:.6px;text-transform:uppercase;margin:12px 0 6px}'
                +'#smcMenuPanel a.row,#smcMenuPanel button.row{display:flex;width:100%;align-items:center;gap:11px;text-align:left;text-decoration:none;background:#18181b;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:10px 12px;margin-bottom:7px;transition:border-color .2s,background .2s;cursor:pointer;font-family:inherit;font-size:1em}'
                +'#smcMenuPanel a.row:hover,#smcMenuPanel button.row:hover{border-color:rgba(99,102,241,.45);background:rgba(99,102,241,.09)}'
                +'#smcMenuPanel .ic{font-size:1.15em;width:22px;text-align:center}'
                +'#smcMenuPanel .tx{display:flex;flex-direction:column}'
                +'#smcMenuPanel .tx b{color:#fafafa;font-size:.85em;font-weight:700}'
                +'#smcMenuPanel .tx span{color:#71717a;font-size:.72em}'
                +'@media(max-width:768px){#smcMenuPanel{right:12px;bottom:124px}}'
            );
            var fab=document.createElement('button');
            fab.id='smcMenuFab';fab.type='button';fab.setAttribute('aria-label','Menu, navigation & help');
            fab.innerHTML='<span style="font-size:1.05em">☰</span><span>Menu</span>';

            var links='';
            for(var i=0;i<NAV.length;i++){
                links+='<a class="row" href="'+esc(NAV[i][2])+'"><span class="ic">'+NAV[i][0]+'</span><span class="tx"><b>'+esc(NAV[i][1])+'</b></span></a>';
            }
            var panel=document.createElement('div');
            panel.id='smcMenuPanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Menu');
            panel.innerHTML=''
                +'<div class="hh"><h4>Quick menu</h4><button class="cl" type="button" aria-label="Close">&times;</button></div>'
                +'<div class="lbl">Go to</div>'
                +links
                +'<div class="lbl">Tools</div>'
                +'<button class="row" type="button" id="smcRemBtn"><span class="ic">🔔</span><span class="tx"><b>Exam reminders</b><span>Countdown + add to calendar</span></span></button>'
                +'<button class="row" type="button" id="smcInvBtn"><span class="ic">🎁</span><span class="tx"><b>Invite &amp; unlock</b><span>Share to unlock a bonus mock</span></span></button>'
                +'<button class="row" type="button" id="smcPdfBtn"><span class="ic">📄</span><span class="tx"><b>Save this page as PDF</b><span>Read or share offline</span></span></button>'
                +'<button class="row" type="button" id="smcInstallRow" style="display:none"><span class="ic">📲</span><span class="tx"><b>Install app</b><span>Add to home screen</span></span></button>'
                +'<div class="lbl">Questions? Contact Abhi</div>'
                +'<a class="row" href="mailto:'+EMAIL+'?subject=SMC%20Exam%20Prep%20-%20Query"><span class="ic">✉️</span><span class="tx"><b>Email</b><span>'+EMAIL+'</span></span></a>'
                +'<a class="row" href="'+IG_URL+'" target="_blank" rel="noopener"><span class="ic">📸</span><span class="tx"><b>Instagram</b><span>@'+IG+'</span></span></a>'
                +(COMMUNITY?'<a class="row" id="smcCommRow" href="'+esc(COMMUNITY)+'" target="_blank" rel="noopener"><span class="ic">💬</span><span class="tx"><b>Join the study group</b><span>Daily updates &amp; doubts</span></span></a>':'');

            document.body.appendChild(fab);
            document.body.appendChild(panel);
            if(deferredPrompt){var r0=panel.querySelector('#smcInstallRow');if(r0)r0.style.display='';}

            var open=false;
            function setOpen(v){ open=v; panel.classList[v?'add':'remove']('on'); if(v)audit('menu_open','quick menu'); }
            fab.addEventListener('click',function(e){e.stopPropagation();setOpen(!open);});
            panel.querySelector('.cl').addEventListener('click',function(){setOpen(false);});
            panel.addEventListener('click',function(e){e.stopPropagation();});
            document.addEventListener('click',function(){if(open)setOpen(false);});

            // nav + contact audit
            var rows=panel.querySelectorAll('a.row');
            for(var j=0;j<rows.length;j++){rows[j].addEventListener('click',function(){
                var h=this.getAttribute('href')||'';
                if(h.indexOf('mailto')===0)audit('support_contact','email');
                else if(h.indexOf('instagram')>=0)audit('support_contact','instagram');
                else if(COMMUNITY&&h===COMMUNITY)audit('community_open','group');
                else audit('nav_click',h);
            });}
            // Reminders + Invite (from growth.js; guard if not loaded)
            panel.querySelector('#smcRemBtn').addEventListener('click',function(){setOpen(false);if(window.smcReminders)window.smcReminders();else location.href='revision-plan.html';});
            panel.querySelector('#smcInvBtn').addEventListener('click',function(){setOpen(false);if(window.smcInvite)window.smcInvite();});
            // Save as PDF
            panel.querySelector('#smcPdfBtn').addEventListener('click',function(){audit('save_pdf',location.pathname);setOpen(false);setTimeout(function(){try{window.print();}catch(e){}},200);});
            // Install
            var inst=panel.querySelector('#smcInstallRow');
            inst.addEventListener('click',function(){
                audit('install_click','pwa');
                try{ if(deferredPrompt){deferredPrompt.prompt();if(deferredPrompt.userChoice)deferredPrompt.userChoice.then(function(){deferredPrompt=null;inst.style.display='none';});} }catch(e){}
                setOpen(false);
            });
        }catch(e){}
    }
    ready(mountMenu);
})();
