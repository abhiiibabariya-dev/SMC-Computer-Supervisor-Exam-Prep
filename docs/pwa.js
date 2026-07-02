/* SMC Exam Prep — PWA bootstrap: registers the service worker and shows a
 * custom "Install app" chip when the browser offers installation. */
(function () {
  "use strict";
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (e) {
        console.warn('SW registration failed:', e && e.message);
      });
    });
  }

  // Already installed / running standalone → no install UI.
  var standalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (standalone) return;

  var deferred = null;
  var DISMISS_KEY = 'smc_pwa_dismissed';

  function showChip() {
    if (document.getElementById('smcInstall')) return;
    try { if (localStorage.getItem(DISMISS_KEY)) return; } catch (e) {}
    var bar = document.createElement('div');
    bar.id = 'smcInstall';
    bar.innerHTML = ''
      + '<style>'
      + '#smcInstall{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:2147483200;display:flex;align-items:center;gap:11px;background:rgba(17,17,19,.96);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:11px 12px 11px 14px;font-family:"Plus Jakarta Sans",system-ui,sans-serif;color:#e5e7eb;box-shadow:0 12px 40px rgba(0,0,0,.5);backdrop-filter:blur(10px);box-sizing:border-box;width:max-content;max-width:min(400px,94vw)}'
      + '#smcInstall img{width:34px;height:34px;border-radius:9px;flex-shrink:0}'
      + '#smcInstall .tx{font-size:.8em;line-height:1.35;flex:1;min-width:0}'
      + '#smcInstall .tx b{color:#fafafa;display:block;font-size:1.05em}'
      + '#smcInstall .ins{background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:0;border-radius:10px;padding:9px 15px;font-size:.85em;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0}'
      + '#smcInstall .x{background:none;border:0;color:#71717a;font-size:1.3em;cursor:pointer;line-height:1;padding:0 4px;flex-shrink:0}'
      + '</style>'
      + '<img src="icon-192.png" alt="SMC">'
      + '<div class="tx"><b>Install the app</b><span>Study offline · opens faster</span></div>'
      + '<button class="ins" id="smcInstallBtn">Install</button>'
      + '<button class="x" id="smcInstallX" aria-label="Dismiss">×</button>';
    (document.body || document.documentElement).appendChild(bar);
    document.getElementById('smcInstallBtn').addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.finally(function () {
        deferred = null;
        bar.remove();
      });
    });
    document.getElementById('smcInstallX').addEventListener('click', function () {
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
      bar.remove();
    });
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (document.body) showChip();
    else document.addEventListener('DOMContentLoaded', showChip);
  });

  window.addEventListener('appinstalled', function () {
    var b = document.getElementById('smcInstall');
    if (b) b.remove();
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
  });
})();
