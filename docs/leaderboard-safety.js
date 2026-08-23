/*
 * Leaderboard privacy/auth bridge.
 * The legacy /leaderboard path contains participant-private fields such as mobile.
 * All public leaderboard traffic is transparently routed to the sanitized path
 * and authenticated with the current Firebase ID token.
 */
(function(){
  'use strict';
  if (window.__SMC_LEADERBOARD_SAFETY__) return;
  window.__SMC_LEADERBOARD_SAFETY__ = true;

  var nativeFetch = window.fetch && window.fetch.bind(window);
  if (!nativeFetch) return;

  function currentUser(){
    try { return window.firebase && firebase.auth && firebase.auth().currentUser; }
    catch(e){ return null; }
  }

  function withAuth(url, user){
    if (!user || typeof user.getIdToken !== 'function') return Promise.resolve(url);
    return user.getIdToken().then(function(token){
      var sep = url.indexOf('?') >= 0 ? '&' : '?';
      return url + sep + 'auth=' + encodeURIComponent(token);
    });
  }

  window.fetch = function(input, init){
    var originalUrl = typeof input === 'string' ? input : (input && input.url) || '';
    if (!/\/leaderboard\.json(?:\?|$)/i.test(originalUrl)) return nativeFetch(input, init);

    var opts = init ? Object.assign({}, init) : {};
    var method = (opts.method || (input && input.method) || 'GET').toUpperCase();
    var url = originalUrl.replace('/leaderboard.json', '/leaderboard_public.json');
    var user = currentUser();

    function send(finalUrl){
      if (typeof input === 'string') return nativeFetch(finalUrl, opts);
      try { return nativeFetch(new Request(finalUrl, input), opts); }
      catch (e) { return nativeFetch(finalUrl, opts); }
    }

    if (method === 'POST' && opts.body) {
      try {
        var rec = JSON.parse(opts.body);
        delete rec.mobile;
        delete rec.email;
        delete rec.phone;
        delete rec.phoneNumber;
        if (user) rec.uid = user.uid;
        opts.body = JSON.stringify(rec);
      } catch (e) {}
    }

    if (!user) return Promise.reject(new Error('Authentication required for leaderboard access.'));
    return withAuth(url, user).then(send);
  };
})();
