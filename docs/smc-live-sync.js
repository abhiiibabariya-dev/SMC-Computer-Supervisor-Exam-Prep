/* SMC Live Sync
 * Site-wide safety net for time-sensitive recruitment/exam messaging.
 * Loaded on every HTML page by the GitHub Actions synchronizer.
 */
(function(){
  'use strict';
  var APP_CLOSE = new Date('2026-04-15T23:00:00+05:30');
  var EXAM_DATE = new Date('2026-07-12T10:00:00+05:30');
  var now = new Date();

  function replaceText(root){
    var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    var nodes=[], n;
    while((n=walker.nextNode())) nodes.push(n);
    nodes.forEach(function(node){
      var s=node.nodeValue;
      var original=s;
      s=s.replace(/🔥\s*EXAM ON 12 JULY 2026\s*[—-]\s*Final Revision Time! Tap for the Exam-Day Guide/gi,
        '✅ EXAM COMPLETED — 12 JULY 2026 | Answer Key & Result Updates');
      s=s.replace(/SMC written exam scheduled for <b>12 July 2026<\/b>[^.]*\./gi,
        'SMC written exam was held on <b>12 July 2026</b>. Official answer-key and result updates are now the focus.');
      s=s.replace(/📅\s*EXAM DATE OUT\s*[—-]\s*Written Exam on 12 July 2026! Call Letter Coming Soon/gi,
        '✅ EXAM COMPLETED — Written Exam held on 12 July 2026');
      s=s.replace(/Call Letter Coming Soon/gi,'Call Letter Phase Closed');
      s=s.replace(/Exam Date, Admit Card\s*[—-]\s*Not Yet Announced/gi,
        'Exam Completed — 12 July 2026');
      s=s.replace(/<b[^>]*>Coming Soon<\/b>/gi,'<b>Phase Closed</b>');
      s=s.replace(/<b[^>]*>To Be Announced<\/b>/gi,'<b>Completed — 12 July 2026</b>');
      s=s.replace(/NOW\s*[—-]\s*Exam Prep/gi,'NOW — Post-Exam Updates');
      s=s.replace(/YOU ARE HERE — Final revision phase\. Practice mock tests &amp; daily MCQs\. Exam is close!/gi,
        'YOU ARE HERE — Post-exam phase. Track answer keys, objections, results and merit-list updates.');
      s=s.replace(/Before 12 July 2026/gi,'Before 12 July 2026 — completed');
      if(s!==original) node.nodeValue=s;
    });
  }

  function updateExamCard(){
    var grid=document.getElementById('countdown');
    if(!grid || now < EXAM_DATE) return;
    grid.innerHTML = '<div style="width:100%;display:flex;flex-direction:column;gap:10px;padding:18px 20px;background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.25);border-radius:14px">'
      +'<div style="font-size:.95em;color:#d4d4d8"><span style="color:#34d399;font-weight:700">✓</span> &nbsp;<b>Applications:</b> Closed on 15 April 2026</div>'
      +'<div style="font-size:.95em;color:#d4d4d8"><span style="color:#34d399;font-weight:700">✓</span> &nbsp;<b>Written Exam:</b> Completed on 12 July 2026</div>'
      +'<div style="font-size:.95em;color:#d4d4d8"><span style="color:#fbbf24">●</span> &nbsp;<b>Current Phase:</b> Answer Key / Result / Merit Updates</div>'
      +'<div style="font-size:.8em;color:#a1a1aa;margin-top:4px;line-height:1.5">The countdown has ended because the examination date has passed. This section now tracks post-exam updates instead of showing obsolete pre-exam messaging.</div>'
      +'</div>';
    var status=document.getElementById('cd-status');
    if(status){status.textContent='Post-Exam Updates';status.style.color='#34d399';}
    var label=document.getElementById('cd-label');
    if(label) label.innerHTML='<i style="background:#34d399"></i>Exam Status';
  }

  function run(){
    try{
      replaceText(document.body);
      updateExamCard();
      var stamp=document.querySelector('.last-updated');
      if(stamp && /Last updated:/i.test(stamp.textContent)){
        var d=new Date();
        var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
        stamp.textContent=stamp.textContent.replace(/Last updated:\s*[^·]+/i,
          'Last updated: '+d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear());
      }
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
  else run();
})();
