NEXUS-01 Cyber Security Engineer Bootcamp — Multi-page Build

Generated structure:
- index.html
- assets/css/style.css
- assets/js/main.js
- missions/mission-01.html ... missions/mission-20.html
- bonus.html
- glossary.html
- tools.html
- references.html
- portfolio.html
- progress.html

Run locally:
  python3 -m http.server 8000
  open http://localhost:8000

Progress tracker:
- localStorage key: nexus01-progress-v1
- format: {"mission-01":{"status":"Completed"}}

Design source:
- Based on the NEXUS-01 Cyber Security Archive visual system: boot loader, sticky topbar/sidebar, command palette, scroll progress, reveal animation, clip-path cards, terminal blocks, roadmap/ref-list/footer language.

Content source:
- 20 missions, bonus archive, glossary, tools, references, and portfolio tasks migrated from DATA in the single-page dashboard script.

Palette update:
- Adjusted to a Cyberpunk 2077 official-site inspired palette.
- Main accent: #FCEE0A cyberpunk yellow.
- Secondary accent: #00F0FF neon cyan.
- Alert/danger accent: #FF003C red.
- Base surfaces remain dark asphalt/black to preserve the original NEXUS dashboard structure.


SOC 2089 UI Enhancement Layer:
- Threat ticker fixed di bawah topbar pada semua halaman.
- Packet-flow background pada hero.
- Live terminal log, radar scanner, SIEM alert feed, mission status HUD, attack-vs-defense diagram.
- Progress HUD memakai localStorage key nexus01-progress-v1 dan sinkron dengan progress tracker.
- Semua animasi menghormati prefers-reduced-motion.
- Global cyberpunk scrollbar ditambahkan di assets/css/style.css.


UPDATE — DEEP STUDY + VALIDATED REFERENCES
- Setiap mission kini memiliki section O // Expanded Study Module.
- Section M // References diperbarui menjadi 4 kategori: Website/Artikel Teknis, Jurnal Akademik/Paper Publik, Rekomendasi Buku, dan Video Pembelajaran.
- Link eksternal memakai target="_blank" dan rel="noopener noreferrer".
- Buku dicantumkan sebagai judul bila tidak ada URL resmi tunggal yang stabil.
- Konten legal/safety boundary tetap dipertahankan.


TEXTBOOK REVISION:
- Section O di setiap mission sekarang berisi bab materi langsung, bukan outline belajar.
- Format memakai heading, paragraf penjelas, blockquote, command lab aman, dan istilah untuk glossary.
- Command yang dicantumkan dibatasi untuk localhost, lab legal, CTF, atau sistem milik sendiri/berizin.


--- REVISION NOTE: MINIMALIST LINUX DESKTOP MODE ---
This revised build keeps the original NEXUS-01 content and UX features, including boot loader, scroll-sync progress bar, command palette, mission progress, filters, live terminal logs, and background packet animation.

Visual changes implemented:
- Minimalist Linux desktop / OS simulator interface.
- Solid dark panels for better long-form readability.
- Top desktop bar with workspace tabs and real-time English date/time.
- Sidebar redesigned as file-manager mission directory.
- Added fastfetch-style system identity panels.
- Added browser-safe simulated btop/system monitor.
- Added operator notes and threat feed desktop windows.
- Rebalanced palette from heavy yellow cyberpunk into dark Linux workstation cyan/green accents.
