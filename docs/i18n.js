/* SMC Exam Prep — lightweight i18n (English / ગુજરાતી / हिंदी).
 * - Translates any element with [data-i18n="key"] (textContent) and
 *   [data-i18n-ph="key"] (placeholder).
 * - Adds a floating language switcher, persists choice in localStorage.
 * - Exposes window.smcLang() and fires a 'smc-lang' event so dynamic pages
 *   (quizzes) can re-render their content in the chosen language.
 */
(function () {
  "use strict";
  var KEY = 'smc_lang';
  var LANGS = ['en', 'gu', 'hi'];
  var LABEL = { en: 'EN', gu: 'ગુ', hi: 'हि' };

  var T = {
    // shared / nav
    home:        { en: 'Home', gu: 'હોમ', hi: 'होम' },
    daily_quiz:  { en: 'Daily Quiz', gu: 'દૈનિક ક્વિઝ', hi: 'दैनिक क्विज़' },
    mock_test:   { en: 'Mock Test', gu: 'મોક ટેસ્ટ', hi: 'मॉक टेस्ट' },
    leaderboard: { en: 'Leaderboard', gu: 'લીડરબોર્ડ', hi: 'लीडरबोर्ड' },
    exam_info:   { en: 'Exam Info', gu: 'પરીક્ષા માહિતી', hi: 'परीक्षा जानकारी' },
    start_free:  { en: 'Start Free', gu: 'મફતમાં શરૂ કરો', hi: 'मुफ़्त शुरू करें' },
    loading:     { en: 'Loading…', gu: 'લોડ થઈ રહ્યું છે…', hi: 'लोड हो रहा है…' },
    retry:       { en: 'Retry', gu: 'ફરી પ્રયાસ કરો', hi: 'पुनः प्रयास करें' },

    // daily quiz
    dq_title:    { en: "Today's 10 MCQs", gu: 'આજના ૧૦ પ્રશ્નો', hi: 'आज के 10 प्रश्न' },
    dq_sub:      { en: 'A fresh quiz every day. Build your streak!', gu: 'દરરોજ નવી ક્વિઝ. તમારી સ્ટ્રીક વધારો!', hi: 'हर दिन नई क्विज़। अपनी स्ट्रीक बढ़ाएँ!' },
    dq_start:    { en: 'Start Daily Quiz', gu: 'દૈનિક ક્વિઝ શરૂ કરો', hi: 'दैनिक क्विज़ शुरू करें' },
    dq_next:     { en: 'Next →', gu: 'આગળ →', hi: 'अगला →' },
    dq_finish:   { en: 'Finish & See Score', gu: 'પૂર્ણ કરો અને સ્કોર જુઓ', hi: 'समाप्त करें और स्कोर देखें' },
    dq_score:    { en: 'Your Score', gu: 'તમારો સ્કોર', hi: 'आपका स्कोर' },
    dq_streak:   { en: 'Day Streak', gu: 'દિવસની સ્ટ્રીક', hi: 'दिन की स्ट्रीक' },
    dq_best:     { en: 'Best Streak', gu: 'શ્રેષ્ઠ સ્ટ્રીક', hi: 'सर्वश्रेष्ठ स्ट्रीक' },
    dq_done:     { en: "You've completed today's quiz!", gu: 'તમે આજની ક્વિઝ પૂર્ણ કરી છે!', hi: 'आपने आज की क्विज़ पूरी कर ली है!' },
    dq_tomorrow: { en: 'Come back tomorrow for 10 new questions.', gu: 'આવતીકાલે ૧૦ નવા પ્રશ્નો માટે પાછા આવો.', hi: 'कल 10 नए प्रश्नों के लिए वापस आएँ।' },
    dq_share:    { en: 'Share my result', gu: 'મારું પરિણામ શેર કરો', hi: 'मेरा परिणाम साझा करें' },
    dq_review:   { en: 'Review answers', gu: 'જવાબો તપાસો', hi: 'उत्तर देखें' },

    // quiz / subjects
    qz_title:    { en: 'Practice Quizzes', gu: 'પ્રેક્ટિસ ક્વિઝ', hi: 'अभ्यास क्विज़' },
    qz_pick:     { en: 'Choose a subject', gu: 'વિષય પસંદ કરો', hi: 'विषय चुनें' },
    qz_start:    { en: 'Start Quiz', gu: 'ક્વિઝ શરૂ કરો', hi: 'क्विज़ शुरू करें' },
    qz_weak:     { en: 'Your weak areas', gu: 'તમારા નબળા વિષયો', hi: 'आपके कमज़ोर विषय' },
    qz_history:  { en: 'Recent attempts', gu: 'તાજેતરના પ્રયાસો', hi: 'हाल के प्रयास' },
    qz_none:     { en: 'No attempts yet — take a quiz to see stats.', gu: 'હજુ કોઈ પ્રયાસ નથી — સ્ટેટ્સ જોવા ક્વિઝ આપો.', hi: 'अभी तक कोई प्रयास नहीं — आँकड़े देखने के लिए क्विज़ दें।' },

    // result / common quiz
    correct:     { en: 'Correct', gu: 'સાચું', hi: 'सही' },
    wrong:       { en: 'Wrong', gu: 'ખોટું', hi: 'गलत' },
    ans:         { en: 'Correct answer', gu: 'સાચો જવાબ', hi: 'सही उत्तर' },
    q_of:        { en: 'Question', gu: 'પ્રશ્ન', hi: 'प्रश्न' },
    of:          { en: 'of', gu: '/', hi: 'का' },
    play_again:  { en: 'Play again', gu: 'ફરી રમો', hi: 'फिर से खेलें' },

    // leaderboard
    lb_title:    { en: 'Leaderboard', gu: 'લીડરબોર્ડ', hi: 'लीडरबोर्ड' },
    lb_sub:      { en: 'Top scorers across all quizzes', gu: 'બધી ક્વિઝના ટોચના સ્કોરર', hi: 'सभी क्विज़ के शीर्ष स्कोरर' },
    lb_rank:     { en: 'Rank', gu: 'ક્રમ', hi: 'रैंक' },
    lb_name:     { en: 'Name', gu: 'નામ', hi: 'नाम' },
    lb_score:    { en: 'Score', gu: 'સ્કોર', hi: 'स्कोर' },
    lb_subj:     { en: 'Subject', gu: 'વિષય', hi: 'विषय' },
    lb_empty:    { en: 'No scores yet. Be the first!', gu: 'હજુ કોઈ સ્કોર નથી. પ્રથમ બનો!', hi: 'अभी तक कोई स्कोर नहीं। पहले बनें!' },

    // subject names
    s_GK:     { en: 'General Knowledge', gu: 'સામાન્ય જ્ઞાન', hi: 'सामान्य ज्ञान' },
    s_GJ:     { en: 'Gujarat & Surat', gu: 'ગુજરાત અને સુરત', hi: 'गुजरात और सूरत' },
    s_REASON: { en: 'Reasoning', gu: 'રીઝનિંગ', hi: 'रीज़निंग' },
    s_QUANT:  { en: 'Quantitative', gu: 'ગણિત', hi: 'गणित' },
    s_ENG:    { en: 'English', gu: 'અંગ્રેજી', hi: 'अंग्रेज़ी' },
    s_COMP:   { en: 'Computer', gu: 'કમ્પ્યુટર', hi: 'कंप्यूटर' }
  };

  function getLang() {
    try { var l = localStorage.getItem(KEY); if (LANGS.indexOf(l) >= 0) return l; } catch (e) {}
    return 'en';
  }
  function setLang(l) {
    if (LANGS.indexOf(l) < 0) l = 'en';
    try { localStorage.setItem(KEY, l); } catch (e) {}
    apply(l);
  }
  // public helpers
  window.smcLang = getLang;
  window.smcT = function (key) { var e = T[key]; return e ? (e[getLang()] || e.en) : key; };

  function apply(l) {
    document.documentElement.setAttribute('lang', l === 'gu' ? 'gu' : l === 'hi' ? 'hi' : 'en');
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute('data-i18n'); var e = T[k];
      if (e) nodes[i].textContent = e[l] || e.en;
    }
    var ph = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < ph.length; j++) {
      var k2 = ph[j].getAttribute('data-i18n-ph'); var e2 = T[k2];
      if (e2) ph[j].setAttribute('placeholder', e2[l] || e2.en);
    }
    // update switcher active state
    var sw = document.getElementById('smcLangSw');
    if (sw) {
      var bs = sw.querySelectorAll('button');
      for (var b = 0; b < bs.length; b++) {
        bs[b].classList.toggle('on', bs[b].getAttribute('data-l') === l);
      }
    }
    try { window.dispatchEvent(new CustomEvent('smc-lang', { detail: { lang: l } })); } catch (e) {}
  }

  function buildSwitcher() {
    if (document.getElementById('smcLangSw')) return;
    var sw = document.createElement('div');
    sw.id = 'smcLangSw';
    var html = '<style>'
      + '#smcLangSw{position:fixed;right:14px;top:14px;z-index:2147483100;display:flex;gap:2px;background:rgba(17,17,19,.9);border:1px solid rgba(255,255,255,.12);border-radius:50px;padding:3px;font-family:"Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35);backdrop-filter:blur(8px)}'
      + '#smcLangSw button{background:none;border:0;color:#a1a1aa;font-size:.78em;font-weight:700;cursor:pointer;padding:6px 10px;border-radius:50px;font-family:inherit;line-height:1}'
      + '#smcLangSw button.on{background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff}'
      + '@media(max-width:768px){#smcLangSw{right:10px;top:10px}}'
      + '</style>';
    for (var i = 0; i < LANGS.length; i++) {
      html += '<button type="button" data-l="' + LANGS[i] + '" title="' + LANGS[i] + '">' + LABEL[LANGS[i]] + '</button>';
    }
    sw.innerHTML = html;
    document.body.appendChild(sw);
    var bs = sw.querySelectorAll('button');
    for (var b = 0; b < bs.length; b++) {
      bs[b].addEventListener('click', function () { setLang(this.getAttribute('data-l')); });
    }
  }

  function init() { buildSwitcher(); apply(getLang()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
