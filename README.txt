DAZIK-01 Cyber Security Engineer Bootcamp

Multi-page static learning archive for a 20-mission Cyber Security Engineer bootcamp. The project is built as a dark terminal dashboard with sharp HUD borders, command-palette navigation, mission progress tracking, searchable databases, glossary filters, references, tools, portfolio tasks, and legal lab boundaries.

Main pages:
- index.html: archive dashboard and mission map.
- missions/mission-01.html ... missions/mission-20.html: mission lessons, labs, references, and textbook sections.
- bonus.html: bonus modules.
- glossary.html: alphabetically sorted glossary with A-Z navigation, mission filter chips, live search counter, and empty state.
- tools.html: searchable legal tools database.
- references.html: searchable reference database with official/public sources.
- portfolio.html: portfolio output builder.
- progress.html: local progress tracker with JSON export/import.

Run locally:
  python -m http.server 8000
  open http://localhost:8000

Progress tracker:
- Current localStorage key: dazik01-progress-v1
- Export creates a JSON backup with app, version, timestamp, storageKey, and progress payload.
- Import validates mission IDs and allowed statuses before restoring.

Design system:
- Theme: minimalist Linux desktop simulator.
- Background: #06090f
- Card: #0e141d
- Border: #273548
- Primary accent: #93c5fd
- Secondary/status accent: #a7f3d0
- Cyan accent: #67e8f9
- Body type: JetBrains Mono.
- Heading/display type: Orbitron.
- Border language: sharp HUD cut corners with border-radius: 0 for UI surfaces and controls.

Motion and accessibility:
- Boot loader typewriter, scroll progress, reveal-on-scroll, live terminal log, radar sweep, packet-flow lines, threat ticker marquee, simulated system monitor, and existing HUD motion remain active.
- prefers-reduced-motion is respected globally for non-essential motion.
- Reveal content is progressive enhancement: content remains visible even if JavaScript fails.
- Each page includes a no-JS fallback for the loader and reveal sections.

SEO and identity:
- Brand updated from NEXUS-01 to DAZIK-01.
- Terminal-style favicon and apple touch icon use the >_ visual mark.
- All pages include meta descriptions and Open Graph title, description, image, and type tags.
- OG preview image: assets/img/dazik-og-image.svg
- Icon: assets/img/dazik-terminal-icon.svg

Safety boundary:
- All offensive security content is scoped to CTF, localhost, private labs, systems owned by the learner, or environments with explicit written authorization.
