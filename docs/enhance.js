/* SMC Enhance — one lightweight, defensive helper loaded site-wide.
 * Three jobs, none of which may ever throw or block first paint:
 *   1) Support widget  — a floating "Help" button → contact card (Email + Instagram).
 *   2) Responsive       — tags <html> with the device class + injects cross-cutting
 *                         fluid rules so every page fits phone / tablet / laptop.
 *   3) Auto "lite mode" — on weak / data-saver devices, strips the heaviest visual
 *                         effects so the page stays smooth and never janks/crashes.
 * No libraries, no build step. Mirrors the self-injecting IIFE style of share.js.
 */
(function(){
    "use strict";
    var EMAIL='abhiiibabariya@gmail.com';
    var IG='enough_abhie_';
    var IG_URL='https://instagram.com/'+IG;

    function ready(fn){
        if(document.body)fn();
        else document.addEventListener('DOMContentLoaded',fn);
    }
    function injectStyle(id,css){
        try{
            if(document.getElementById(id))return;
            var s=document.createElement('style');s.id=id;s.textContent=css;
            (document.head||document.documentElement).appendChild(s);
        }catch(e){}
    }

    // ---- 2) Responsive: device class on <html> + fluid safety net ----------
    function deviceClass(){
        try{
            var w=window.innerWidth||screen.width||1024;
            var el=document.documentElement;
            var touch=('ontouchstart'in window)||(navigator.maxTouchPoints>0);
            el.classList.remove('is-mobile','is-tablet','is-desktop','is-portrait','is-landscape');
            el.classList.add(w<640?'is-mobile':(w<=1024?'is-tablet':'is-desktop'));
            el.classList.add((window.innerHeight>=window.innerWidth)?'is-portrait':'is-landscape');
            if(touch)el.classList.add('is-touch');
        }catch(e){}
    }
    // Cross-cutting rules that help EVERY page fit any screen without editing each one.
    injectStyle('smcEnhanceCss',
        'html,body{max-width:100%;overflow-x:hidden}'
        +'img,video,canvas,svg,iframe{max-width:100%;height:auto}'
        +'table{max-width:100%}'
        // Comfortable tap targets on touch devices (accessibility + fewer mis-taps).
        +'html.is-touch button,html.is-touch a.b,html.is-touch .b,html.is-touch .nav a{min-height:44px}'
        // Respect iOS notch / home-indicator safe areas for the fixed corner widgets.
        +'#smcChip{bottom:calc(14px + env(safe-area-inset-bottom,0px)) !important}'
        +'#smcHelpFab{bottom:calc(74px + env(safe-area-inset-bottom,0px))}'
        +'@media(max-width:768px){#smcHelpFab{right:12px;bottom:calc(72px + env(safe-area-inset-bottom,0px))}}'
    );
    deviceClass();
    var rt;
    window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(deviceClass,150);},{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(deviceClass,200);});

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
        // Kill the expensive infinite/GPU effects; freeze remaining animations to their
        // final frame (same proven approach the pages use for prefers-reduced-motion,
        // so one-shot fade-ins still end fully visible — nothing disappears).
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

    // ---- 1) Support / contact widget --------------------------------------
    function mountSupport(){
        try{
            if(document.getElementById('smcHelpFab'))return;
            var css=''
            +'#smcHelpFab{position:fixed;right:16px;z-index:2147483000;background:#111113;color:#fafafa;border:1px solid rgba(255,255,255,.12);border-radius:50px;padding:9px 15px 9px 12px;font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:.82em;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35);display:flex;align-items:center;gap:7px;transition:transform .2s,background .2s}'
            +'#smcHelpFab:hover{transform:translateY(-2px);background:#18181b}'
            +'#smcHelpCard{position:fixed;right:16px;bottom:124px;z-index:2147483001;width:290px;max-width:calc(100vw - 32px);background:#111113;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.55);font-family:"Plus Jakarta Sans",system-ui,sans-serif;opacity:0;transform:translateY(10px);transition:opacity .25s,transform .25s;pointer-events:none}'
            +'#smcHelpCard.on{opacity:1;transform:none;pointer-events:auto}'
            +'#smcHelpCard .hh{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}'
            +'#smcHelpCard h4{color:#fafafa;font-size:1.05em;font-weight:800;margin:0}'
            +'#smcHelpCard .cl{background:none;border:0;color:#a1a1aa;font-size:1.3em;line-height:1;cursor:pointer;padding:0 4px}'
            +'#smcHelpCard p{color:#a1a1aa;font-size:.82em;line-height:1.5;margin:0 0 14px}'
            +'#smcHelpCard a.opt{display:flex;align-items:center;gap:11px;text-decoration:none;background:#18181b;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:11px 13px;margin-bottom:9px;transition:border-color .2s,background .2s}'
            +'#smcHelpCard a.opt:hover{border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.08)}'
            +'#smcHelpCard a.opt .ei{font-size:1.25em;width:24px;text-align:center}'
            +'#smcHelpCard a.opt .et{display:flex;flex-direction:column}'
            +'#smcHelpCard a.opt .et b{color:#fafafa;font-size:.86em;font-weight:700}'
            +'#smcHelpCard a.opt .et span{color:#71717a;font-size:.74em}'
            +'@media(max-width:768px){#smcHelpCard{right:12px;bottom:120px}}';
            var fab=document.createElement('button');
            fab.id='smcHelpFab';fab.type='button';fab.setAttribute('aria-label','Get help or contact us');
            fab.innerHTML='<span style="font-size:1.05em">💬</span><span>Help</span>';

            var card=document.createElement('div');
            card.id='smcHelpCard';card.setAttribute('role','dialog');card.setAttribute('aria-label','Contact & support');
            card.innerHTML='<div class="hh"><h4>Need help? 💬</h4><button class="cl" type="button" aria-label="Close">&times;</button></div>'
                +'<p>Any question about the SMC exam or this site? Reach out — I\'m happy to help you out.</p>'
                +'<a class="opt" href="mailto:'+EMAIL+'?subject=SMC%20Exam%20Prep%20-%20Query"><span class="ei">✉️</span><span class="et"><b>Email me</b><span>'+EMAIL+'</span></span></a>'
                +'<a class="opt" href="'+IG_URL+'" target="_blank" rel="noopener"><span class="ei">📸</span><span class="et"><b>Instagram</b><span>@'+IG+'</span></span></a>';

            injectStyle('smcHelpCss',css);
            document.body.appendChild(fab);
            document.body.appendChild(card);

            var open=false;
            function setOpen(v){
                open=v;
                if(v){card.classList.add('on');}else{card.classList.remove('on');}
                if(v){try{if(window.smcAudit)window.smcAudit('support_open','help widget');}catch(e){}}
            }
            fab.addEventListener('click',function(e){e.stopPropagation();setOpen(!open);});
            card.querySelector('.cl').addEventListener('click',function(){setOpen(false);});
            card.addEventListener('click',function(e){e.stopPropagation();});
            document.addEventListener('click',function(){if(open)setOpen(false);});
            // Log an intent when a visitor actually taps a contact channel.
            var opts=card.querySelectorAll('a.opt');
            for(var i=0;i<opts.length;i++){opts[i].addEventListener('click',function(){try{if(window.smcAudit)window.smcAudit('support_contact',this.href.indexOf('mailto')===0?'email':'instagram');}catch(e){}});}
        }catch(e){}
    }
    ready(mountSupport);
})();
