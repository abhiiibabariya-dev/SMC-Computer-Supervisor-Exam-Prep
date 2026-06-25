/* SMC Share widget — a floating button so visitors can spread the site in one tap.
 * WhatsApp is the primary channel for exam aspirants in India (groups), plus Telegram
 * and copy-link. Pure vanilla, self-contained, mobile-first. */
(function(){
    "use strict";
    if(document.getElementById('smcShare'))return;
    var URL='https://abhiiibabariya-dev.github.io/SMC-Computer-Supervisor-Exam-Prep/';
    var MSG='📚 *Free SMC Exam 2026 Prep* — practice tests, MCQs, study material & daily current affairs. Live countdown to the 12 July exam. Start free 👇\n'+URL;

    function el(html){var d=document.createElement('div');d.innerHTML=html;return d.firstElementChild;}

    function mount(){
        var wrap=el(''
        +'<div id="smcShare">'
        +'<style>'
        +'#smcShare{position:fixed;right:16px;bottom:16px;z-index:2147483000;font-family:"Plus Jakarta Sans",system-ui,sans-serif}'
        +'#smcShare .menu{display:flex;flex-direction:column;gap:10px;margin-bottom:12px;opacity:0;transform:translateY(10px) scale(.96);pointer-events:none;transition:all .25s cubic-bezier(.16,1,.3,1)}'
        +'#smcShare.open .menu{opacity:1;transform:none;pointer-events:auto}'
        +'#smcShare .item{display:flex;align-items:center;gap:10px;background:#18181b;border:1px solid rgba(255,255,255,.1);color:#fafafa;border-radius:50px;padding:10px 16px 10px 12px;font-size:.85em;font-weight:600;text-decoration:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35);white-space:nowrap;transition:transform .15s}'
        +'#smcShare .item:hover{transform:translateX(-3px)}'
        +'#smcShare .item .e{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff}'
        +'#smcShare .wa .e{background:#25D366}#smcShare .tg .e{background:#229ED9}#smcShare .cp .e{background:#6366f1}'
        +'#smcShare .fab{width:56px;height:56px;border-radius:50%;border:0;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;font-size:24px;cursor:pointer;box-shadow:0 8px 24px rgba(99,102,241,.5);display:flex;align-items:center;justify-content:center;margin-left:auto;transition:transform .25s}'
        +'#smcShare.open .fab{transform:rotate(135deg)}'
        +'#smcShare .toast{position:fixed;right:16px;bottom:84px;background:#22c55e;color:#062b12;font-weight:700;font-size:.82em;padding:9px 14px;border-radius:10px;opacity:0;transform:translateY(8px);transition:all .25s;pointer-events:none}'
        +'#smcShare .toast.show{opacity:1;transform:none}'
        +'@media(max-width:768px){#smcShare{right:12px;bottom:12px}}'
        +'</style>'
        +'<div class="menu">'
        +'  <a class="item wa" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(MSG)+'"><span class="e">✓</span>Share on WhatsApp</a>'
        +'  <a class="item tg" target="_blank" rel="noopener" href="https://t.me/share/url?url='+encodeURIComponent(URL)+'&text='+encodeURIComponent(MSG)+'"><span class="e">✈</span>Share on Telegram</a>'
        +'  <button class="item cp" type="button" id="smcCopy"><span class="e">⧉</span>Copy link</button>'
        +'</div>'
        +'<button class="fab" id="smcFab" aria-label="Share">↗</button>'
        +'<div class="toast" id="smcToast">Link copied!</div>'
        +'</div>');
        document.body.appendChild(wrap);

        var fab=wrap.querySelector('#smcFab');
        var copy=wrap.querySelector('#smcCopy');
        var toast=wrap.querySelector('#smcToast');
        fab.addEventListener('click',function(){
            // Native share sheet on mobile if available, else toggle the menu.
            if(navigator.share&&/Mobi|Android/i.test(navigator.userAgent)){
                navigator.share({title:'SMC Exam Prep 2026',text:MSG,url:URL}).catch(function(){wrap.classList.toggle('open');});
            }else{wrap.classList.toggle('open');}
        });
        copy.addEventListener('click',function(){
            var done=function(){toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},1600);wrap.classList.remove('open');};
            if(navigator.clipboard){navigator.clipboard.writeText(URL).then(done).catch(done);}
            else{var t=document.createElement('textarea');t.value=URL;document.body.appendChild(t);t.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(t);done();}
        });
        document.addEventListener('click',function(e){if(!wrap.contains(e.target))wrap.classList.remove('open');});
    }

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
    else mount();
})();
