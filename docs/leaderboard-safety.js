/*
 * Leaderboard privacy bridge.
 * The legacy /leaderboard path contains participant-private fields such as mobile.
 * Public leaderboard traffic is transparently routed to the sanitized path.
 */
(function(){
  'use strict';
  if (window.__SMC_LEADERBOARD_SAFETY__) return;
  window.__SMC_LEADERBOARD_SAFETY__ = true;

  var nativeFetch = window.fetch && window.fetch.bind(window);
  if (!nativeFetch) return;

  window.fetch = function(input, init){
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (!/\/leaderboard\.json(?:\?|$)/i.test(url)) return nativeFetch(input, init);

    var opts = init ? Object.assign({}, init) : {};
    var method = (opts.method || (input && input.method) || 'GET').toUpperCase();
    url = url.replace('/leaderboard.json', '/leaderboard_public.json');

    if (method === 'POST' && opts.body) {
      try {
        var rec = JSON.parse(opts.body);
        delete rec.mobile;
        delete rec.email;
        delete rec.phone;
        delete rec.phoneNumber;
        var user = window.firebase && firebase.auth && firebase.auth().currentUser;
        if (user) rec.uid = user.uid;
        opts.body = JSON.stringify(rec);
      } catch (e) {}
    }

    if (typeof input === 'string') return nativeFetch(url, opts);
    try { return nativeFetch(new Request(url, input), opts); }
    catch (e) { return nativeFetch(url, opts); }
  };
})();
