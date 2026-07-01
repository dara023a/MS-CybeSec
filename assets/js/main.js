
(function(){
  const stateKey = 'nexus01-progress-v1';
  const statuses = ['Not Started', 'Learning', 'Completed', 'Need Review'];
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loader = $('.boot-loader');
  if(loader){
    const lines = [
      '[BOOT] NEXUS-01 interface handshake...',
      '[TRACE] verifying mission archive integrity...',
      '[ACCESS] operator profile: RECRUIT // AUTHORIZED LAB ONLY',
      '[RESULT] secure learning mode enabled.'
    ];
    const target = loader.querySelector('.boot-lines');
    let i=0;
    const typeLine = () => {
      if(i < lines.length){
        const div = document.createElement('div');
        div.className='boot-line';
        div.textContent = '>_ ' + lines[i++];
        target && target.appendChild(div);
        setTimeout(typeLine, prefersReduced ? 10 : 260);
      } else {
        setTimeout(()=>loader.classList.add('hide'), prefersReduced ? 10 : 520);
      }
    };
    typeLine();
  }

  const bar = $('.progress-global');
  const side = $('.side-progress i');
  const sideText = $('[data-scroll-percent]');
  const updateScrollProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, h.scrollTop / max * 100)) : 0;
    if(bar) bar.style.width = pct + '%';
    if(side) side.style.width = pct + '%';
    if(sideText) sideText.textContent = Math.round(pct) + '%';
  };
  document.addEventListener('scroll', updateScrollProgress, {passive:true});
  updateScrollProgress();

  const openMenu = () => {
    document.body.classList.add('menu-open');
    $('.mobile-toggle')?.setAttribute('aria-expanded','true');
  };
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    $('.mobile-toggle')?.setAttribute('aria-expanded','false');
  };
  $('.mobile-toggle')?.addEventListener('click',()=> document.body.classList.contains('menu-open') ? closeMenu() : openMenu());
  $('.mobile-overlay')?.addEventListener('click', closeMenu);
  $('.sidebar-close')?.addEventListener('click', closeMenu);
  $$('.nav-list a').forEach(a=>a.addEventListener('click', closeMenu));

  const reveals = $$('.reveal');
  if(prefersReduced || !('IntersectionObserver' in window)){
    reveals.forEach(el=>el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
    }, {threshold:.12});
    reveals.forEach(el=>io.observe(el));
  }

  const palette = $('.command-palette');
  const input = $('#commandInput');
  const commandItems = $$('[data-command-item]');
  let lastFocus = null;
  if(palette && input){
    const open = () => {lastFocus = document.activeElement; palette.classList.add('show'); input.focus(); input.select();};
    const close = () => {palette.classList.remove('show'); if(lastFocus && lastFocus.focus) lastFocus.focus();};
    document.addEventListener('keydown', e=>{
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') {e.preventDefault(); open();}
      if(e.key==='Escape') { closeMenu(); close(); }
    });
    palette.addEventListener('click', e=>{ if(e.target===palette) close(); });
    input.addEventListener('input',()=>{
      const q = input.value.toLowerCase().trim();
      commandItems.forEach(a=>{ a.hidden = q && !a.textContent.toLowerCase().includes(q); });
    });
  }

  document.addEventListener('click', e=>{
    const btn = e.target.closest('.quiz-q');
    if(!btn) return;
    const item = btn.closest('.quiz-item');
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    const label = btn.querySelector('b');
    if(label) label.textContent = open ? 'CLOSE' : 'OPEN';
  });

  function getProgress(){
    try { return JSON.parse(localStorage.getItem(stateKey) || '{}') || {}; }
    catch(e){ return {}; }
  }
  function setProgress(state){ localStorage.setItem(stateKey, JSON.stringify(state)); }
  function syncProgressUI(){
    const state = getProgress();
    $$('[data-status-id]').forEach(sel=>{
      const id = sel.dataset.statusId;
      const status = state[id]?.status || 'Not Started';
      sel.value = statuses.includes(status) ? status : 'Not Started';
    });
    $$('[data-progress-id]').forEach(chk=>{
      const id = chk.dataset.progressId;
      chk.checked = (state[id]?.status || 'Not Started') === 'Completed';
    });
    $$('[data-status-label]').forEach(label=>{
      const id = label.dataset.statusLabel;
      label.textContent = state[id]?.status || 'Not Started';
    });
    $$('[data-mission-nav]').forEach(a=>{
      const id = a.dataset.missionNav;
      a.classList.toggle('is-done', (state[id]?.status || 'Not Started') === 'Completed');
    });
    const completed = Object.values(state).filter(v=>v && v.status === 'Completed').length;
    $$('[data-progress-summary]').forEach(el=>{ el.textContent = `${completed}/20 COMPLETED`; });
  }
  document.addEventListener('change', e=>{
    const statusSelect = e.target.closest('[data-status-id]');
    const check = e.target.closest('[data-progress-id]');
    if(!statusSelect && !check) return;
    const state = getProgress();
    if(statusSelect){
      const id = statusSelect.dataset.statusId;
      state[id] = state[id] || {};
      state[id].status = statusSelect.value;
    }
    if(check){
      const id = check.dataset.progressId;
      state[id] = state[id] || {};
      state[id].status = check.checked ? 'Completed' : 'Learning';
    }
    setProgress(state);
    syncProgressUI();
  });
  window.addEventListener('storage', syncProgressUI);
  syncProgressUI();


  function initLiveTerminalLogs(){
    $$('.live-terminal-log').forEach(log=>{
      const lines = $$('.log-line', log);
      if(prefersReduced){
        lines.forEach(line=>line.classList.add('visible'));
        return;
      }
      lines.forEach((line, index)=>{
        window.setTimeout(()=>line.classList.add('visible'), 160 + index * 220);
      });
    });
  }
  initLiveTerminalLogs();

  $$('[data-filter-input]').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const scope = inp.closest('.section') || document;
      const q = inp.value.toLowerCase().trim();
      $$('[data-filter-card]', scope).forEach(card=>{
        const text = (card.dataset.search || card.textContent || '').toLowerCase();
        card.hidden = q && !text.includes(q);
      });
    });
  });
})();
