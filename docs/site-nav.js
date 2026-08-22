(function(){
  'use strict';
  if (document.getElementById('smc-universal-nav')) return;

  var base = (function(){
    var p = location.pathname;
    var marker = '/SMC-Computer-Supervisor-Exam-Prep/';
    var i = p.indexOf(marker);
    return i >= 0 ? p.slice(0, i + marker.length) : '/SMC-Computer-Supervisor-Exam-Prep/';
  })();

  var links = [
    ['⌂', 'Home', 'index.html'],
    ['💼', 'Live Jobs', 'live-jobs.html'],
    ['📋', 'All Jobs', 'govt-jobs.html'],
    ['🔑', 'Answer Key', 'answer-key.html'],
    ['📝', 'Mock Test', 'mock-test.html'],
    ['⚡', 'Daily Quiz', 'daily-quiz.html'],
    ['🏆', 'Leaderboard', 'leaderboard.html'],
    ['💎', 'Premium', 'premium.html'],
    ['🔐', 'Login', 'login.html']
  ];

  var nav = document.createElement('nav');
  nav.id = 'smc-universal-nav';
  nav.setAttribute('aria-label', 'Main site navigation');
  nav.innerHTML = '<div class="smc-nav-scroll">' + links.map(function(x){
    return '<a href="' + base + x[2] + '" data-page="' + x[2] + '"><span>' + x[0] + '</span><b>' + x[1] + '</b></a>';
  }).join('') + '</div>';

  var style = document.createElement('style');
  style.textContent = '#smc-universal-nav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483000;width:min(980px,calc(100% - 20px));padding:7px;background:rgba(10,10,14,.92);border:1px solid rgba(255,255,255,.1);border-radius:16px;box-shadow:0 14px 50px rgba(0,0,0,.42);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font-family:system-ui,-apple-system,sans-serif}#smc-universal-nav .smc-nav-scroll{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;justify-content:center}#smc-universal-nav .smc-nav-scroll::-webkit-scrollbar{display:none}#smc-universal-nav a{flex:0 0 auto;display:flex;align-items:center;gap:5px;padding:9px 11px;border-radius:11px;color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;white-space:nowrap;transition:background .15s,color .15s,transform .15s}#smc-universal-nav a:hover{background:rgba(255,255,255,.07);color:#fff;transform:translateY(-1px)}#smc-universal-nav a.active{background:rgba(99,102,241,.18);color:#c4b5fd}#smc-universal-nav a span{font-size:14px;line-height:1}#smc-universal-nav a b{font-weight:800}@media(max-width:640px){#smc-universal-nav{bottom:8px;width:calc(100% - 10px);padding:5px;border-radius:14px}#smc-universal-nav .smc-nav-scroll{justify-content:flex-start}#smc-universal-nav a{padding:8px 9px;font-size:10px}#smc-universal-nav a span{font-size:13px}body{padding-bottom:76px!important}}';
  document.head.appendChild(style);
  document.body.appendChild(nav);

  var current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  nav.querySelectorAll('a[data-page]').forEach(function(a){
    if (a.getAttribute('data-page').toLowerCase() === current) a.classList.add('active');
  });
})();
