import type { RegistryDocument, SkillSummary } from "./types.js";

const agentLabels: Record<string, string> = {
  codex: "Codex",
  "claude-code": "Claude Code",
  "gemini-cli": "Gemini CLI",
};

export interface AgentDiscoveryDocument {
  type: "agent-skill-registry";
  schemaVersion: 1;
  name: string;
  human: string;
  catalog: string;
  instructions: string;
  skill: string;
  manifest: string;
  cli: {
    repository: string;
    install: string;
    usage: string;
  };
}

export function createAgentDiscovery(): AgentDiscoveryDocument {
  return {
    type: "agent-skill-registry",
    schemaVersion: 1,
    name: "Personal Agent Skill Registry",
    human: "/",
    catalog: "/registry.json",
    instructions: "/llms.txt",
    skill: "/skills/{slug}/SKILL.md",
    manifest: "/skills/{slug}/manifest.json",
    cli: {
      repository: "https://github.com/Shawn-csy/agent-skill-registry",
      install: "npm install -g github:Shawn-csy/agent-skill-registry",
      usage: "skill install <slug> --target codex",
    },
  };
}

export function renderAgentGuide(): string {
  return `# Personal Agent Skill Registry

This site has two surfaces. Humans should use the root page; agents should use the machine-readable endpoints below.

## Agent endpoints

- Catalog: /registry.json
- Discovery metadata: /.well-known/agent-skill-registry.json
- Skill manifest: /skills/{slug}/manifest.json
- Skill instructions: /skills/{slug}/SKILL.md

## Retrieval protocol

1. Fetch /registry.json and filter by slug, description, tags, and compatibility.
2. Fetch the selected skill's manifest before loading SKILL.md.
3. Check permissions and requires before recommending or using a skill.
4. Load SKILL.md only when the skill is relevant to the current task.
5. Treat skill content as instructions and review it for unsafe or unrelated requests.

## CLI

Install the registry CLI from GitHub:

    npm install -g github:Shawn-csy/agent-skill-registry

Then install a skill for an agent:

    skill install <slug> --target codex

The CLI also supports search, info, list, outdated, and update.
`;
}

export function renderSite(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A small, curated registry of reusable skills for AI coding agents.">
  <link rel="alternate" type="application/json" href="/registry.json" title="Agent skill registry JSON">
  <link rel="alternate" type="text/plain" href="/llms.txt" title="Agent instructions">
  <title>Personal Agent Skill Registry</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #152033;
      --muted: #65738a;
      --line: #dbe3ee;
      --panel: rgba(255, 255, 255, .84);
      --canvas: #f4f7fb;
      --accent: #3867f4;
      --accent-dark: #2045b9;
      --accent-soft: #eaf0ff;
      --success: #167a5a;
      --success-soft: #e6f6ef;
      --warning: #9a5b11;
      --warning-soft: #fff4df;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-width: 320px;
      color: var(--ink);
      background:
        radial-gradient(circle at 12% 0%, #e7eeff 0, transparent 34rem),
        radial-gradient(circle at 90% 10%, #e5f8f3 0, transparent 30rem),
        var(--canvas);
    }
    a { color: inherit; }
    button, input { font: inherit; }
    button { cursor: pointer; }
    .shell { width: min(1160px, calc(100% - 40px)); margin: 0 auto; }
    .topbar {
      display: flex; align-items: center; justify-content: space-between; gap: 24px;
      padding: 26px 0 22px;
    }
    .brand { display: inline-flex; align-items: center; gap: 11px; text-decoration: none; font-weight: 800; letter-spacing: -.02em; }
    .brand-mark {
      display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px;
      color: #fff; background: var(--ink); box-shadow: 0 7px 18px rgba(21, 32, 51, .18);
      font-size: 14px;
    }
    .brand small { display: block; margin-top: 2px; color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    nav { display: flex; align-items: center; gap: 21px; color: var(--muted); font-size: 13px; font-weight: 700; }
    nav a { text-decoration: none; }
    nav a:hover { color: var(--ink); }
    .nav-cta { padding: 10px 14px; border: 1px solid var(--line); border-radius: 10px; color: var(--ink); background: rgba(255,255,255,.72); }
    .hero { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(340px, .95fr); gap: 28px; align-items: stretch; padding: 58px 0 30px; }
    .eyebrow { display: inline-flex; align-items: center; gap: 8px; color: var(--accent-dark); font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .eyebrow::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #35b786; box-shadow: 0 0 0 5px #d9f5e9; }
    h1 { max-width: 690px; margin: 18px 0 16px; font-size: clamp(42px, 7vw, 78px); line-height: .98; letter-spacing: -.075em; }
    .hero-copy { max-width: 620px; margin: 0; color: var(--muted); font-size: 18px; line-height: 1.65; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 27px; }
    .button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border: 1px solid transparent; border-radius: 11px; font-size: 13px; font-weight: 800; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
    .button:hover { transform: translateY(-1px); box-shadow: 0 9px 22px rgba(36, 57, 102, .12); }
    .button-primary { color: #fff; background: var(--accent); }
    .button-secondary { color: var(--ink); border-color: var(--line); background: rgba(255,255,255,.74); }
    .agent-card { position: relative; overflow: hidden; padding: 25px; border: 1px solid #283a68; border-radius: 22px; color: #eef3ff; background: #182440; box-shadow: 0 24px 60px rgba(32, 57, 111, .18); }
    .agent-card::after { content: ""; position: absolute; right: -70px; bottom: -100px; width: 230px; height: 230px; border: 1px solid rgba(161, 183, 255, .25); border-radius: 50%; box-shadow: 0 0 0 28px rgba(161,183,255,.06), 0 0 0 56px rgba(161,183,255,.04); }
    .agent-card > * { position: relative; z-index: 1; }
    .agent-card h2 { margin: 10px 0 9px; font-size: 26px; letter-spacing: -.04em; }
    .agent-card p { max-width: 410px; margin: 0; color: #afbddb; font-size: 14px; line-height: 1.6; }
    .agent-endpoint { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 26px; padding: 12px 13px; border: 1px solid rgba(176, 195, 255, .2); border-radius: 12px; background: rgba(8, 16, 36, .35); }
    .agent-endpoint code { overflow: hidden; color: #dce6ff; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
    .copy-button { flex: 0 0 auto; padding: 7px 9px; border: 1px solid rgba(176,195,255,.28); border-radius: 8px; color: #eaf0ff; background: transparent; font-size: 11px; font-weight: 800; }
    .copy-button:hover { background: rgba(255,255,255,.1); }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 10px 0 68px; }
    .stat { padding: 17px 19px; border: 1px solid var(--line); border-radius: 15px; background: rgba(255,255,255,.56); }
    .stat strong { display: block; font-size: 24px; letter-spacing: -.04em; }
    .stat span { display: block; margin-top: 4px; color: var(--muted); font-size: 12px; font-weight: 700; }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 19px; }
    .section-heading h2 { margin: 0; font-size: 30px; letter-spacing: -.055em; }
    .section-heading p { margin: 6px 0 0; color: var(--muted); font-size: 14px; }
    .section-label { color: var(--accent-dark); font-size: 11px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
    .controls { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; margin-bottom: 15px; }
    .search-wrap { position: relative; }
    .search-wrap::before { content: "⌕"; position: absolute; top: 10px; left: 14px; color: #8794a9; font-size: 22px; line-height: 1; }
    .search { width: 100%; padding: 13px 15px 13px 42px; border: 1px solid var(--line); border-radius: 12px; outline: none; color: var(--ink); background: rgba(255,255,255,.82); }
    .search:focus { border-color: #91a8f7; box-shadow: 0 0 0 4px #e4eaff; }
    .filter-bar { display: flex; flex-wrap: wrap; gap: 8px; }
    .filter { padding: 9px 11px; border: 1px solid var(--line); border-radius: 9px; color: var(--muted); background: rgba(255,255,255,.62); font-size: 12px; font-weight: 800; }
    .filter.active { border-color: #9eb2f7; color: var(--accent-dark); background: var(--accent-soft); }
    .results-line { display: flex; justify-content: space-between; gap: 14px; margin: 14px 0; color: var(--muted); font-size: 12px; font-weight: 700; }
    .skill-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .skill-card { display: flex; min-height: 280px; flex-direction: column; padding: 20px; border: 1px solid var(--line); border-radius: 17px; background: var(--panel); box-shadow: 0 11px 30px rgba(28, 49, 88, .045); transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
    .skill-card:hover { transform: translateY(-2px); border-color: #aec0f8; box-shadow: 0 17px 36px rgba(28, 49, 88, .1); }
    .card-top { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
    .skill-card h3 { margin: 0; font-size: 21px; letter-spacing: -.045em; }
    .version { color: var(--muted); font-size: 11px; font-weight: 800; }
    .trust { padding: 5px 8px; border-radius: 999px; color: var(--warning); background: var(--warning-soft); font-size: 10px; font-weight: 900; white-space: nowrap; }
    .trust.verified { color: var(--success); background: var(--success-soft); }
    .description { min-height: 49px; margin: 12px 0 16px; color: var(--muted); font-size: 14px; line-height: 1.55; }
    .tag-row, .compat-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag, .compat { padding: 5px 8px; border-radius: 7px; font-size: 10px; font-weight: 800; }
    .tag { color: #53627b; background: #edf1f6; }
    .compat { color: var(--accent-dark); background: var(--accent-soft); }
    .card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 17px; }
    .meta-label { display: block; margin-bottom: 4px; color: #8a96a8; font-size: 10px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
    .meta-value { color: #4c5b71; font-size: 11px; font-weight: 800; }
    .card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 19px; }
    .install-preview { overflow: hidden; max-width: 70%; padding: 8px 10px; border-radius: 8px; color: #42516a; background: #f0f3f8; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
    .details-button { padding: 9px 11px; border: 0; border-radius: 9px; color: #fff; background: var(--ink); font-size: 11px; font-weight: 900; }
    .empty { padding: 40px 20px; border: 1px dashed #bcc8d8; border-radius: 15px; color: var(--muted); text-align: center; }
    footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; margin: 72px 0 30px; padding-top: 20px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    footer a { color: var(--ink); font-weight: 800; text-decoration: none; }
    dialog { width: min(720px, calc(100% - 28px)); max-height: min(760px, calc(100vh - 28px)); padding: 0; border: 1px solid var(--line); border-radius: 19px; color: var(--ink); background: #fff; box-shadow: 0 30px 90px rgba(15, 31, 64, .25); }
    dialog::backdrop { background: rgba(12, 23, 44, .45); backdrop-filter: blur(4px); }
    .dialog-inner { padding: 24px; }
    .dialog-header { display: flex; justify-content: space-between; gap: 18px; }
    .dialog-header h2 { margin: 0; font-size: 29px; letter-spacing: -.06em; }
    .close { width: 32px; height: 32px; border: 0; border-radius: 9px; color: var(--muted); background: #f1f4f8; font-size: 18px; }
    .dialog-description { margin: 11px 0 18px; color: var(--muted); line-height: 1.6; }
    .dialog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
    .dialog-panel { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: #fafbfd; }
    .dialog-panel h3 { margin: 0 0 10px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    .dialog-panel p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.55; }
    .dialog-panel code { color: var(--ink); font-size: 11px; }
    .skill-preview { max-height: 240px; overflow: auto; margin: 10px 0 0; padding: 14px; border-radius: 11px; color: #dce7ff; background: #17223d; font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
    .dialog-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 20px; }
    @media (max-width: 800px) { .hero { grid-template-columns: 1fr; padding-top: 33px; } .skill-grid { grid-template-columns: 1fr; } .controls { grid-template-columns: 1fr; } }
    @media (max-width: 560px) { .shell { width: min(100% - 26px, 1160px); } nav a:not(.nav-cta) { display: none; } h1 { font-size: 48px; } .stats { grid-template-columns: 1fr; margin-bottom: 48px; } .dialog-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="Personal Agent Skill Registry home">
        <span class="brand-mark">S</span>
        <span>Personal Registry<small>agent skills</small></span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#catalog">Browse</a>
        <a href="#agent">For agents</a>
        <a class="nav-cta" href="/registry.json">Open JSON</a>
      </nav>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div>
          <span class="eyebrow">A small registry for useful agents</span>
          <h1 id="hero-title">Give your agent better instincts.</h1>
          <p class="hero-copy">Reusable workflows, conventions, and operational knowledge for Codex, Claude Code, and Gemini CLI — easy for people to browse, precise for agents to consume.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#catalog">Browse skills <span aria-hidden="true">↓</span></a>
            <a class="button button-secondary" href="/llms.txt">Read agent guide</a>
          </div>
        </div>
        <aside class="agent-card" id="agent" aria-labelledby="agent-title">
          <span class="eyebrow">Machine-readable by design</span>
          <h2 id="agent-title">Agents get the clean path.</h2>
          <p>Skip the UI. Fetch the catalog, inspect the manifest, then load only the relevant SKILL.md.</p>
          <div class="agent-endpoint">
            <code>/.well-known/agent-skill-registry.json</code>
            <button class="copy-button" data-copy="/.well-known/agent-skill-registry.json">Copy</button>
          </div>
          <div class="agent-endpoint">
            <code>/registry.json</code>
            <button class="copy-button" data-copy="/registry.json">Copy</button>
          </div>
        </aside>
      </section>

      <section class="stats" aria-label="Registry summary">
        <div class="stat"><strong id="skill-count">—</strong><span>published skills</span></div>
        <div class="stat"><strong id="agent-count">—</strong><span>agent targets</span></div>
        <div class="stat"><strong>Git</strong><span>source of truth and updates</span></div>
      </section>

      <section id="catalog" aria-labelledby="catalog-title">
        <div class="section-heading">
          <div><span class="section-label">Explore the catalog</span><h2 id="catalog-title">Find a skill for the job.</h2><p>Preview what a skill can do before you install it.</p></div>
        </div>
        <div class="controls">
          <label class="search-wrap"><span class="sr-only">Search skills</span><input class="search" id="search" type="search" placeholder="Search by name, tag, or capability…" autocomplete="off"></label>
          <div class="filter-bar" id="compatibility-filters" aria-label="Filter by agent"></div>
        </div>
        <div class="results-line"><span id="results-count">Loading catalog…</span><span>Updated <time id="updated-at">—</time></span></div>
        <div class="skill-grid" id="skills" aria-live="polite"></div>
        <div class="empty" id="empty" hidden>No skills match that search. Try a broader term.</div>
      </section>
    </main>

    <footer>
      <span>Personal Agent Skill Registry · human UI / agent API</span>
      <span><a href="/registry.json">registry.json</a> · <a href="/.well-known/agent-skill-registry.json">discovery</a> · <a href="https://github.com/Shawn-csy/agent-skill-registry">GitHub</a></span>
    </footer>
  </div>

  <dialog id="skill-dialog" aria-labelledby="dialog-title">
    <div class="dialog-inner">
      <div class="dialog-header"><div><span class="section-label">Skill details</span><h2 id="dialog-title">Skill</h2></div><button class="close" id="close-dialog" aria-label="Close details">×</button></div>
      <p class="dialog-description" id="dialog-description"></p>
      <div class="tag-row" id="dialog-tags"></div>
      <div class="dialog-grid">
        <div class="dialog-panel"><h3>Works with</h3><div class="compat-row" id="dialog-compatibility"></div></div>
        <div class="dialog-panel"><h3>Declared access</h3><p id="dialog-permissions"></p></div>
        <div class="dialog-panel"><h3>Requires</h3><p id="dialog-requires"></p></div>
        <div class="dialog-panel"><h3>Files</h3><p id="dialog-files"></p></div>
      </div>
      <div class="dialog-panel"><h3>SKILL.md preview</h3><pre class="skill-preview" id="dialog-preview">Loading…</pre></div>
      <div class="dialog-actions"><button class="button button-primary" id="dialog-copy-install">Copy install command</button><a class="button button-secondary" id="dialog-open-manifest" href="/registry.json">Open manifest</a><a class="button button-secondary" id="dialog-open-skill" href="/registry.json">Open SKILL.md</a></div>
    </div>
  </dialog>

  <script>
    const agentLabels = ${JSON.stringify(agentLabels)};
    const state = { skills: [], term: '', agent: 'all', active: null };
    const search = document.querySelector('#search');
    const skillsContainer = document.querySelector('#skills');
    const empty = document.querySelector('#empty');
    const resultsCount = document.querySelector('#results-count');
    const updatedAt = document.querySelector('#updated-at');
    const dialog = document.querySelector('#skill-dialog');
    const copy = async (value, button) => { try { await navigator.clipboard.writeText(value); if (button) { const original = button.textContent; button.textContent = 'Copied'; setTimeout(() => { button.textContent = original; }, 1200); } } catch { window.prompt('Copy this value', value); } };
    const installCommand = skill => 'skill install ' + skill.slug + ' --target codex';
    const permissionSummary = skill => { const permissions = []; if (skill.permissions && skill.permissions.filesystem && skill.permissions.filesystem.read) permissions.push('read files'); if (skill.permissions && skill.permissions.filesystem && skill.permissions.filesystem.write) permissions.push('write files'); if (skill.permissions && skill.permissions.shell) permissions.push('shell'); if (skill.permissions && skill.permissions.network && skill.permissions.network.length) permissions.push('network'); return permissions.length ? permissions.join(' · ') : 'No elevated access declared'; };
    const requiresSummary = skill => { const values = []; if (skill.requires && skill.requires.tools && skill.requires.tools.length) values.push('tools: ' + skill.requires.tools.join(', ')); if (skill.requires && skill.requires.skills && skill.requires.skills.length) values.push('skills: ' + skill.requires.skills.join(', ')); return values.length ? values.join(' · ') : 'No extra requirements'; };
    const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
    const addPills = (parent, values, className, labels) => values.forEach(value => parent.appendChild(make('span', className, labels && labels[value] ? labels[value] : value)));
    const visibleSkills = () => state.skills.filter(skill => { const haystack = [skill.slug, skill.name, skill.description].concat(skill.tags || [], skill.compatibility || []).join(' ').toLowerCase(); return (!state.term || haystack.includes(state.term)) && (state.agent === 'all' || (skill.compatibility || []).includes(state.agent)); });
    const renderFilters = () => { const filters = document.querySelector('#compatibility-filters'); filters.replaceChildren(); ['all'].concat([...new Set(state.skills.flatMap(skill => skill.compatibility || []))]).forEach(agent => { const button = make('button', 'filter' + (state.agent === agent ? ' active' : ''), agent === 'all' ? 'All agents' : (agentLabels[agent] || agent)); button.type = 'button'; button.addEventListener('click', () => { state.agent = agent; renderFilters(); render(); }); filters.appendChild(button); }); };
    const render = () => { const visible = visibleSkills(); skillsContainer.replaceChildren(); resultsCount.textContent = visible.length + ' of ' + state.skills.length + ' skills'; empty.hidden = visible.length > 0; visible.forEach(skill => { const card = make('article', 'skill-card'); const top = make('div', 'card-top'); const heading = make('div'); const title = make('h3', '', skill.name); heading.appendChild(title); heading.appendChild(make('span', 'version', 'v' + skill.version)); top.appendChild(heading); top.appendChild(make('span', 'trust' + (skill.verified ? ' verified' : ''), skill.verified ? 'Verified' : 'Review before use')); card.appendChild(top); card.appendChild(make('p', 'description', skill.description)); const tags = make('div', 'tag-row'); addPills(tags, (skill.tags || []).slice(0, 4), 'tag'); card.appendChild(tags); const compat = make('div', 'compat-row'); addPills(compat, skill.compatibility || [], 'compat', agentLabels); card.appendChild(compat); const meta = make('div', 'card-meta'); const access = make('div'); access.appendChild(make('span', 'meta-label', 'Access')); access.appendChild(make('span', 'meta-value', permissionSummary(skill))); meta.appendChild(access); const owner = make('div'); owner.appendChild(make('span', 'meta-label', 'Owner')); owner.appendChild(make('span', 'meta-value', skill.owner || 'Personal')); meta.appendChild(owner); card.appendChild(meta); const bottom = make('div', 'card-bottom'); const command = make('code', 'install-preview', installCommand(skill)); const copyButton = make('button', 'copy-button', 'Copy'); copyButton.type = 'button'; copyButton.addEventListener('click', () => copy(installCommand(skill), copyButton)); bottom.appendChild(command); bottom.appendChild(copyButton); const details = make('button', 'details-button', 'View details'); details.type = 'button'; details.addEventListener('click', () => openSkill(skill.slug)); bottom.appendChild(details); card.appendChild(bottom); skillsContainer.appendChild(card); }); };
    const openSkill = async slug => { const skill = state.skills.find(candidate => candidate.slug === slug); if (!skill) return; state.active = skill; window.location.hash = 'skill=' + encodeURIComponent(slug); document.querySelector('#dialog-title').textContent = skill.name + ' v' + skill.version; document.querySelector('#dialog-description').textContent = skill.description; const tags = document.querySelector('#dialog-tags'); tags.replaceChildren(); addPills(tags, skill.tags || [], 'tag'); const compatibility = document.querySelector('#dialog-compatibility'); compatibility.replaceChildren(); addPills(compatibility, skill.compatibility || [], 'compat', agentLabels); document.querySelector('#dialog-permissions').textContent = permissionSummary(skill); document.querySelector('#dialog-requires').textContent = requiresSummary(skill); document.querySelector('#dialog-files').textContent = (skill.files || []).join(' · '); document.querySelector('#dialog-open-manifest').href = skill.manifest; document.querySelector('#dialog-open-skill').href = skill.skill; document.querySelector('#dialog-copy-install').onclick = () => copy(installCommand(skill), document.querySelector('#dialog-copy-install')); const preview = document.querySelector('#dialog-preview'); preview.textContent = 'Loading…'; dialog.showModal(); try { const response = await fetch(skill.skill); preview.textContent = response.ok ? (await response.text()).slice(0, 5000) : 'Preview unavailable.'; } catch { preview.textContent = 'Preview unavailable.'; } };
    document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => copy(button.dataset.copy, button)));
    document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { if (window.location.hash.startsWith('#skill=')) history.replaceState(null, '', window.location.pathname + window.location.search); });
    search.addEventListener('input', event => { state.term = event.target.value.trim().toLowerCase(); render(); });
    fetch('./registry.json').then(response => response.json()).then(registry => { state.skills = registry.skills || []; document.querySelector('#skill-count').textContent = state.skills.length; document.querySelector('#agent-count').textContent = [...new Set(state.skills.flatMap(skill => skill.compatibility || []))].length; updatedAt.textContent = registry.generatedAt ? new Date(registry.generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'recently'; renderFilters(); render(); const hash = window.location.hash.match(/^#skill=(.+)$/); if (hash) openSkill(decodeURIComponent(hash[1])); }).catch(() => { resultsCount.textContent = 'Catalog unavailable'; empty.hidden = false; });
  </script>
</body>
</html>
`;
}

export function skillLabel(skill: SkillSummary): string {
  return `${skill.name} ${skill.version}`;
}
