
(function(){
  const stateKey = 'dazik01-progress-v1';
  const statuses = ['Not Started', 'Learning', 'Completed', 'Need Review'];
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loader = $('.boot-loader');
  if(loader){
    const lines = [
      '[BOOT] booting DAZIK-01 Linux desktop shell...',
      '[KERNEL] loading minimalist workstation interface...',
      '[WM] mounting mission directory and scroll-sync daemon...',
      '[ACCESS] operator profile: RECRUIT // AUTHORIZED LAB ONLY',
      '[RESULT] desktop training mode enabled.'
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
    reveals.forEach(el=>{
      el.classList.remove('reveal-pending');
      el.classList.add('visible');
    });
  } else {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          e.target.classList.remove('reveal-pending');
          io.unobserve(e.target);
        }
      });
    }, {threshold:.12});
    reveals.forEach(el=>{
      el.classList.add('reveal-pending');
      io.observe(el);
    });
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
    try {
      return JSON.parse(localStorage.getItem(stateKey) || '{}') || {};
    }
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

  function exportProgress(){
    const payload = {
      app:'DAZIK-01 Cyber Security Engineer Bootcamp',
      version:1,
      exportedAt:new Date().toISOString(),
      storageKey:stateKey,
      progress:getProgress()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dazik01-progress-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importProgress(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const incoming = parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : parsed;
        const clean = {};
        Object.entries(incoming).forEach(([id,value])=>{
          if(!/^mission-\d{2}$/.test(id) || !value || typeof value !== 'object') return;
          const status = statuses.includes(value.status) ? value.status : 'Not Started';
          clean[id] = {...value, status};
        });
        setProgress(clean);
        syncProgressUI();
        const msg = $('[data-progress-import-status]');
        if(msg) msg.textContent = `Import berhasil: ${Object.keys(clean).length} mission dipulihkan.`;
      } catch(e) {
        const msg = $('[data-progress-import-status]');
        if(msg) msg.textContent = 'Import gagal: file JSON tidak valid.';
      }
    };
    reader.readAsText(file);
  }


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

  function ensureSearchMeta(scope){
    if(!scope) return [];
    if(document.body.dataset.page === 'references'){
      $$('.ref-list a', scope).forEach(item=>{
        item.dataset.filterCard = item.dataset.filterCard || '';
        item.dataset.search = item.dataset.search || item.textContent.replace(/\s+/g, ' ').trim();
      });
    }
    const items = $$('[data-filter-card]', scope);
    items.forEach(item=>{
      item.dataset.search = item.dataset.search || item.textContent.replace(/\s+/g, ' ').trim();
      if(document.body.dataset.page === 'glossary'){
        item.dataset.term = item.dataset.term || ($('h3', item)?.textContent || '').trim();
        item.dataset.letter = (item.dataset.term[0] || '#').toUpperCase();
        item.dataset.missions = item.dataset.missions || $$('.badge', item).map(b=>b.textContent.trim()).join(' ');
      }
    });
    return items;
  }

  function updateSourceGroups(scope){
    $$('.source-card', scope).forEach(card=>{
      const children = $$('[data-filter-card]', card);
      card.hidden = children.length > 0 && children.every(child=>child.hidden);
    });
  }

  function ensureCounter(scope, input, total){
    let counter = $('[data-filter-count]', scope);
    if(!counter){
      counter = document.createElement('div');
      counter.className = 'filter-count status-micro';
      counter.dataset.filterCount = '';
      const panel = input.closest('.search-panel');
      if(panel) panel.appendChild(counter);
    }
    const sectionCode = $('.section-code', scope);
    if(sectionCode && !$('[data-progress-summary]', sectionCode)) sectionCode.dataset.liveFilterCode = '';
    counter.textContent = `${total} hasil ditemukan`;
  }

  function ensureEmptyState(scope){
    let empty = $('[data-empty-state]', scope);
    if(!empty){
      empty = document.createElement('div');
      empty.className = 'empty-state status-micro';
      empty.dataset.emptyState = '';
      empty.hidden = true;
      empty.textContent = '0 hasil ditemukan. Coba kata kunci lain atau reset filter.';
      const grid = $('[data-filter-grid]', scope) || $('.card-grid,.progress-table-wrap', scope) || scope;
      grid.insertAdjacentElement('afterend', empty);
    }
    return empty;
  }

  function activeGlossaryMission(scope){
    const active = $('[data-mission-filter].active', scope);
    return active ? active.dataset.missionFilter : 'all';
  }

  function applyFilter(scope){
    const input = $('[data-filter-input]', scope);
    const items = ensureSearchMeta(scope);
    if(!input || !items.length) return;
    const q = input.value.toLowerCase().trim();
    const mission = document.body.dataset.page === 'glossary' ? activeGlossaryMission(scope) : 'all';
    let visible = 0;
    items.forEach(item=>{
      const text = (item.dataset.search || item.textContent || '').toLowerCase();
      const missionText = (item.dataset.missions || item.textContent || '').toLowerCase();
      const queryMatch = !q || text.includes(q);
      const missionMatch = mission === 'all' || missionText.includes(mission.toLowerCase());
      const show = queryMatch && missionMatch;
      item.hidden = !show;
      if(show) visible += 1;
    });
    updateSourceGroups(scope);
    const empty = ensureEmptyState(scope);
    empty.hidden = visible !== 0;
    const total = items.length;
    const label = q || mission !== 'all' ? `${visible}/${total} hasil ditemukan` : `${total} hasil ditemukan`;
    const counter = $('[data-filter-count]', scope);
    if(counter) counter.textContent = label;
    const sectionCode = $('[data-live-filter-code]', scope);
    if(sectionCode) sectionCode.textContent = label.toUpperCase();
  }

  function initGlobalFilters(){
    $$('[data-filter-input]').forEach(inp=>{
      const scope = inp.closest('.section') || document;
      const items = ensureSearchMeta(scope);
      ensureCounter(scope, inp, items.length);
      ensureEmptyState(scope);
      inp.addEventListener('input',()=>applyFilter(scope));
      applyFilter(scope);
    });
  }

  function initGlossaryEnhancements(){
    if(document.body.dataset.page !== 'glossary') return;
    const section = $('#database');
    const grid = $('.card-grid', section);
    const searchPanel = $('.search-panel', section);
    if(!section || !grid || !searchPanel) return;
    grid.dataset.filterGrid = '';
    const cards = $$('.card[data-filter-card]', grid).sort((a,b)=>{
      const at = ($('h3', a)?.textContent || '').trim();
      const bt = ($('h3', b)?.textContent || '').trim();
      return at.localeCompare(bt, 'id', {sensitivity:'base'});
    });
    cards.forEach(card=>grid.appendChild(card));
    ensureSearchMeta(section);

    const missions = new Set();
    cards.forEach(card=>{
      const text = card.dataset.missions || '';
      text.match(/Mission\s+\d+/g)?.forEach(m=>missions.add(m));
    });
    if(!$('[data-glossary-az]', section)){
      const nav = document.createElement('nav');
      nav.className = 'az-nav';
      nav.dataset.glossaryAz = '';
      nav.setAttribute('aria-label','Navigasi alfabet glossary');
      const letters = new Set(cards.map(card=>card.dataset.letter).filter(letter=>/^[A-Z]$/.test(letter)));
      nav.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter=>{
        const disabled = letters.has(letter) ? '' : ' aria-disabled="true" tabindex="-1"';
        return `<a href="#glossary-${letter}" data-az-jump="${letter}"${disabled}>${letter}</a>`;
      }).join('');
      searchPanel.insertAdjacentElement('beforebegin', nav);
      nav.addEventListener('click', e=>{
        const link = e.target.closest('[data-az-jump]');
        if(!link || link.getAttribute('aria-disabled') === 'true') return;
        e.preventDefault();
        const target = cards.find(card=>!card.hidden && card.dataset.letter === link.dataset.azJump) || cards.find(card=>card.dataset.letter === link.dataset.azJump);
        target?.scrollIntoView({behavior:prefersReduced ? 'auto' : 'smooth', block:'start'});
      });
    }
    if(!$('[data-mission-filters]', section)){
      const chips = document.createElement('div');
      chips.className = 'filter-chips';
      chips.dataset.missionFilters = '';
      chips.innerHTML = `<button class="active" type="button" data-mission-filter="all">All Mission</button>` +
        Array.from(missions).sort((a,b)=>parseInt(a.match(/\d+/)[0],10)-parseInt(b.match(/\d+/)[0],10))
          .map(m=>`<button type="button" data-mission-filter="${m}">${m}</button>`).join('');
      searchPanel.insertAdjacentElement('afterend', chips);
      chips.addEventListener('click', e=>{
        const btn = e.target.closest('[data-mission-filter]');
        if(!btn) return;
        $$('[data-mission-filter]', chips).forEach(chip=>chip.classList.toggle('active', chip === btn));
        applyFilter(section);
      });
    }
    cards.forEach(card=>{
      const letter = card.dataset.letter;
      if(letter && !$(`#glossary-${letter}`, grid)){
        card.id = `glossary-${letter}`;
      }
    });
  }

  function initReferencesSearchPanel(){
    if(document.body.dataset.page !== 'references') return;
    const section = $('#database');
    if(!section || $('[data-filter-input]', section)) return;
    const note = $('.section-note', section);
    const panel = document.createElement('div');
    panel.className = 'search-panel';
    panel.innerHTML = '<input aria-label="Search references" data-filter-input placeholder="search reference: OWASP, NIST, Wireshark, Android, AI..."/>';
    (note || $('.section-title', section)).insertAdjacentElement('afterend', panel);
  }

  function initProgressPortability(){
    const exportBtn = $('[data-progress-export]');
    const importInput = $('[data-progress-import]');
    exportBtn?.addEventListener('click', exportProgress);
    importInput?.addEventListener('change', e=>{
      importProgress(e.target.files && e.target.files[0]);
      e.target.value = '';
    });
  }

  /* Linux desktop simulator layer: top workspaces, English clock, fastfetch,
     simulated system monitor, notes, and threat feed. Browser-safe values only. */
  function getAssetPrefix(){
    return location.pathname.includes('/missions/') ? '../' : '';
  }
  function getCurrentMission(){
    const match = location.pathname.match(/mission-(\d+)\.html/i);
    return match ? `MISSION-${match[1].padStart(2,'0')}` : 'ROOT';
  }
  function initLinuxDesktopShell(){
    document.body.classList.add('linux-desktop-mode');
    const prefix = getAssetPrefix();
    const topbar = $('.topbar');
    if(topbar && !$('.desktop-workspaces', topbar)){
      const archiveTitle = $('.archive-title', topbar);
      if(archiveTitle){
        const pageTitle = (document.title.split('|')[0] || 'DAZIK-01').trim();
        archiveTitle.textContent = pageTitle.toUpperCase();
        archiveTitle.setAttribute('title', pageTitle);
      }
      const workspaces = document.createElement('nav');
      workspaces.className = 'desktop-workspaces';
      workspaces.setAttribute('aria-label','Desktop workspaces');
      workspaces.innerHTML = `
        <a class="workspace-tab" data-workspace="missions" href="${prefix}index.html"><b>1</b> Missions</a>
        <a class="workspace-tab" data-workspace="tools" href="${prefix}tools.html"><b>2</b> Tools</a>
        <a class="workspace-tab" data-workspace="progress" href="${prefix}progress.html"><b>3</b> Progress</a>
        <a class="workspace-tab" data-workspace="intel" href="${prefix}references.html"><b>4</b> Intel</a>`;
      const path = location.pathname.toLowerCase();
      let active = 'missions';
      if(path.includes('/tools')) active = 'tools';
      else if(path.includes('/progress')) active = 'progress';
      else if(path.includes('/references') || path.includes('/glossary') || path.includes('/bonus') || path.includes('/portfolio')) active = 'intel';
      $$('.workspace-tab', workspaces).forEach(tab=>tab.classList.toggle('active', tab.dataset.workspace === active));
      topbar.insertBefore(workspaces, archiveTitle || topbar.children[1] || null);
    }
    if(topbar && !$('.desktop-clock', topbar)){
      const clock = document.createElement('div');
      clock.className = 'desktop-clock';
      clock.setAttribute('aria-live','polite');
      clock.innerHTML = '<small>LOCAL</small><span data-desktop-clock>Loading time...</span>';
      topbar.appendChild(clock);
    }
    updateDesktopClock();
    setInterval(updateDesktopClock, 1000);

    const sidebar = $('.sidebar');
    if(sidebar && !$('.linux-fastfetch', sidebar)){
      const fast = document.createElement('div');
      fast.className = 'linux-fastfetch side-panel';
      fast.innerHTML = `
        <strong>FASTFETCH</strong>
        <div class="fastfetch-grid" style="margin-top:10px">
          <pre class="ascii-logo">   /\\
  /  \\   DAZIK
 / /\\ \\  LINUX
/_/  \\_\\ DESKTOP</pre>
          <div class="fetch-lines">
            <div><b>OS</b><span>DAZIK-01 SOC 2089</span></div>
            <div><b>Kernel</b><span>secure-learning</span></div>
            <div><b>Shell</b><span>zsh / web-sim</span></div>
            <div><b>WM</b><span>Mission Tiles</span></div>
            <div><b>Mode</b><span>Authorized Lab</span></div>
          </div>
        </div>`;
      const firstPanel = $('.side-panel', sidebar);
      if(firstPanel && firstPanel.parentNode) firstPanel.insertAdjacentElement('afterend', fast);
      else sidebar.prepend(fast);
    }
  }

  function updateDesktopClock(){
    const el = $('[data-desktop-clock]');
    if(!el) return;
    const now = new Date();
    const date = new Intl.DateTimeFormat('en-US', {
      weekday:'long', year:'numeric', month:'long', day:'numeric'
    }).format(now);
    const time = new Intl.DateTimeFormat('en-US', {
      hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
    }).format(now);
    el.textContent = `${date} — ${time}`;
  }

  function initDesktopControlCenter(){
    const container = $('.container');
    if(!container || $('.desktop-control-center', container)) return;
    const prefix = getAssetPrefix();
    const current = getCurrentMission();
    const hero = $('.hero', container);
    const control = document.createElement('section');
    control.className = 'desktop-control-center reveal visible';
    control.setAttribute('aria-label','Linux desktop control center');
    control.innerHTML = `
      <article class="linux-window">
        <div class="linux-window-title"><span>fastfetch</span><small>${current}</small></div>
        <div class="linux-window-body">
          <div class="fastfetch-grid">
            <pre class="ascii-logo">      .--.
     |o_o |   DAZIK-01
     |:_/ |   Linux Desktop
    //   \\ \\  SOC 2089
   (|     | )
  /'\\_   _/\\
  \\___)=(___/</pre>
            <div class="fetch-lines">
              <div><b>Operator</b><span>RECRUIT</span></div>
              <div><b>Host</b><span>dazik01.local</span></div>
              <div><b>Page</b><span>${document.title.replace(/</g,'&lt;')}</span></div>
              <div><b>Mission</b><span>${current}</span></div>
              <div><b>Stack</b><span>HTML / CSS / JS</span></div>
              <div><b>Theme</b><span>Minimal Linux Desktop</span></div>
            </div>
          </div>
          <div class="progress-mini"><span data-progress-summary>0/20 COMPLETED</span><a href="${prefix}progress.html">Open progress tracker →</a></div>
        </div>
      </article>
      <article class="linux-window">
        <div class="linux-window-title"><span>btop // system monitor</span><small>simulated browser-safe telemetry</small></div>
        <div class="linux-window-body">
          <div class="sys-bars" data-system-monitor>
            <div class="sys-row"><b>CPU</b><div class="sys-track"><i data-sys-bar="cpu"></i></div><span data-sys-value="cpu">--%</span></div>
            <div class="sys-row"><b>RAM</b><div class="sys-track"><i data-sys-bar="ram"></i></div><span data-sys-value="ram">--%</span></div>
            <div class="sys-row"><b>DISK</b><div class="sys-track"><i data-sys-bar="disk"></i></div><span data-sys-value="disk">--%</span></div>
            <div class="sys-row"><b>NET</b><div class="sys-track"><i data-sys-bar="net"></i></div><span data-sys-value="net">--%</span></div>
          </div>
          <div class="command-mini" style="margin-top:12px"><b>root@dazik</b>:~$ scroll-sync --status
<span class="dim">active · progress bar linked to document scroll</span></div>
        </div>
      </article>
      <article class="linux-window">
        <div class="linux-window-title"><span>operator notes</span><small>lab mode</small></div>
        <div class="linux-window-body">
          <div class="operator-notes">
            <div class="note-line"><b>01</b><span>Keep every exercise inside legal labs, CTFs, or owned systems.</span></div>
            <div class="note-line"><b>02</b><span>Use Ctrl/⌘ + K to open the command palette.</span></div>
            <div class="note-line"><b>03</b><span>Mission cards behave like a file explorer directory.</span></div>
          </div>
          <div class="threat-mini-feed" style="margin-top:12px">
            <div class="mini-feed-row"><code>INFO</code><span>Training database synchronized.</span></div>
            <div class="mini-feed-row"><code>NOTE</code><span>UX features preserved: boot loader, scroll sync, command palette.</span></div>
          </div>
        </div>
      </article>`;
    if(hero) hero.insertAdjacentElement('afterend', control);
    else container.prepend(control);
  }

  function updateSimulatedSystemMonitor(){
    const t = Date.now() / 1000;
    const values = {
      cpu: Math.round(18 + 16 * Math.abs(Math.sin(t / 4.2))),
      ram: Math.round(42 + 9 * Math.abs(Math.cos(t / 6.1))),
      disk: 68,
      net: Math.round(8 + 26 * Math.abs(Math.sin(t / 2.8)))
    };
    Object.entries(values).forEach(([key,val])=>{
      $$(`[data-sys-bar="${key}"]`).forEach(bar=>bar.style.width = val + '%');
      $$(`[data-sys-value="${key}"]`).forEach(el=>el.textContent = val + '%');
    });
  }

  initLinuxDesktopShell();
  initDesktopControlCenter();
  initReferencesSearchPanel();
  initGlossaryEnhancements();
  initGlobalFilters();
  initProgressPortability();
  syncProgressUI();
  updateSimulatedSystemMonitor();
  setInterval(updateSimulatedSystemMonitor, 1800);

})();
