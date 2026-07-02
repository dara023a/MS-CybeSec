
(function(){
  const stateKey = 'nexus01-progress-v1';
  const statuses = ['Not Started', 'Learning', 'Completed', 'Need Review'];
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loader = $('.boot-loader');
  if(loader){
    const lines = [
      '[BOOT] booting NEXUS-01 Linux desktop shell...',
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
      const archiveTitle = $('.archive-title', topbar);
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
  /  \\   NEXUS
 / /\\ \\  LINUX
/_/  \\_\\ DESKTOP</pre>
          <div class="fetch-lines">
            <div><b>OS</b><span>NEXUS-01 SOC 2089</span></div>
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
     |o_o |   NEXUS-01
     |:_/ |   Linux Desktop
    //   \\ \\  SOC 2089
   (|     | )
  /'\\_   _/\\
  \\___)=(___/</pre>
            <div class="fetch-lines">
              <div><b>Operator</b><span>RECRUIT</span></div>
              <div><b>Host</b><span>nexus01.local</span></div>
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
          <div class="command-mini" style="margin-top:12px"><b>root@nexus</b>:~$ scroll-sync --status
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
  syncProgressUI();
  updateSimulatedSystemMonitor();
  setInterval(updateSimulatedSystemMonitor, 1800);

})();
