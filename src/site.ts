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
    name: "Shawnup Skill Index",
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
  return `# Shawnup Skill Index

The root page is for humans. Agents should use these machine-readable endpoints.

## Endpoints

- Catalog: /registry.json
- Discovery: /.well-known/agent-skill-registry.json
- Manifest: /skills/{slug}/manifest.json
- Instructions: /skills/{slug}/SKILL.md

## Retrieval

1. Fetch /registry.json and filter by slug, description, tags, and compatibility.
2. Read the selected manifest before loading SKILL.md.
3. Check permissions and requires before recommending or using a skill.
4. Load SKILL.md only when the skill is relevant.

## CLI

    npm install -g github:Shawn-csy/agent-skill-registry
    skill install <slug> --target codex
`;
}

export function renderSite(): string {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A bilingual index of reusable workflows for Codex, Claude Code, and Gemini CLI.">
  <link rel="alternate" type="application/json" href="/registry.json" title="Skill index JSON">
  <link rel="alternate" type="text/plain" href="/llms.txt" title="Agent instructions">
  <title>Shawnup Skill Index</title>
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
      --code: #17223d;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    html[data-theme="dark"] {
      color-scheme: dark;
      --ink: #edf2ff;
      --muted: #9caac2;
      --line: #2c3a54;
      --panel: rgba(24, 36, 61, .88);
      --canvas: #0d1424;
      --accent: #82a0ff;
      --accent-dark: #b9c8ff;
      --accent-soft: #1c2b52;
      --success: #61d7ab;
      --success-soft: #123b32;
      --warning: #f3bf70;
      --warning-soft: #3e2d16;
      --code: #080e1d;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-width: 320px;
      color: var(--ink);
      background: radial-gradient(circle at 12% 0%, rgba(112, 145, 255, .14) 0, transparent 34rem), radial-gradient(circle at 90% 10%, rgba(74, 210, 167, .10) 0, transparent 30rem), var(--canvas);
      transition: background .2s ease, color .2s ease;
    }
    a { color: inherit; }
    button, input { font: inherit; }
    button { cursor: pointer; }
    .shell { width: min(1120px, calc(100% - 36px)); margin: 0 auto; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px 0; }
    .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; }
    .brand-mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; color: #fff; background: var(--ink); font-size: 13px; font-weight: 900; }
    .brand-name { font-size: 14px; font-weight: 850; letter-spacing: -.02em; }
    .brand-subtitle { display: block; margin-top: 2px; color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
    nav { display: flex; align-items: center; gap: 7px; }
    nav a, .icon-button { padding: 8px 10px; border: 1px solid transparent; border-radius: 9px; color: var(--muted); background: transparent; font-size: 12px; font-weight: 800; text-decoration: none; }
    nav a:hover, .icon-button:hover { color: var(--ink); background: var(--panel); border-color: var(--line); }
    .icon-button { min-width: 38px; }
    .hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr); gap: 26px; align-items: center; padding: 72px 0 42px; }
    .eyebrow, .section-label { color: var(--accent-dark); font-size: 11px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
    .eyebrow { display: inline-flex; align-items: center; gap: 8px; }
    .eyebrow::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #35b786; box-shadow: 0 0 0 4px rgba(53, 183, 134, .16); }
    h1 { max-width: 650px; margin: 16px 0 13px; font-size: clamp(44px, 7vw, 76px); line-height: .98; letter-spacing: -.075em; }
    .hero-copy { max-width: 570px; margin: 0; color: var(--muted); font-size: 17px; line-height: 1.6; }
    .hero-actions, .dialog-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
    .button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 11px 14px; border: 1px solid transparent; border-radius: 10px; font-size: 12px; font-weight: 850; text-decoration: none; }
    .button-primary { color: #fff; background: var(--accent); }
    .button-secondary { color: var(--ink); border-color: var(--line); background: var(--panel); }
    .agent-card { padding: 22px; border: 1px solid #30416f; border-radius: 18px; color: #eef3ff; background: #182440; box-shadow: 0 22px 55px rgba(32, 57, 111, .16); }
    .agent-card h2 { margin: 11px 0 8px; font-size: 24px; letter-spacing: -.05em; }
    .agent-card p { margin: 0; color: #afbddb; font-size: 13px; line-height: 1.55; }
    .agent-endpoint { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 17px; padding: 10px 11px; border: 1px solid rgba(176, 195, 255, .2); border-radius: 10px; background: rgba(8, 16, 36, .35); }
    .agent-endpoint code { overflow: hidden; color: #dce6ff; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .copy-button { flex: 0 0 auto; padding: 6px 8px; border: 1px solid rgba(176, 195, 255, .28); border-radius: 7px; color: #eaf0ff; background: transparent; font-size: 10px; font-weight: 850; }
    .copy-button:hover { background: rgba(255, 255, 255, .1); }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 17px; }
    .section-heading h2 { margin: 6px 0 0; font-size: 29px; letter-spacing: -.06em; }
    .controls { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; margin-bottom: 12px; }
    .search-wrap { position: relative; }
    .search-wrap::before { content: "⌕"; position: absolute; top: 10px; left: 13px; color: #8794a9; font-size: 21px; line-height: 1; }
    .search { width: 100%; padding: 12px 13px 12px 39px; border: 1px solid var(--line); border-radius: 10px; outline: none; color: var(--ink); background: var(--panel); }
    .search:focus { border-color: #91a8f7; box-shadow: 0 0 0 4px var(--accent-soft); }
    .filter-bar { display: flex; flex-wrap: wrap; gap: 6px; }
    .filter { padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; color: var(--muted); background: var(--panel); font-size: 11px; font-weight: 850; }
    .filter.active { border-color: #9eb2f7; color: var(--accent-dark); background: var(--accent-soft); }
    .results-line { display: flex; justify-content: space-between; gap: 14px; margin: 11px 0; color: var(--muted); font-size: 11px; font-weight: 750; }
    .skill-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .skill-card { display: flex; min-height: 242px; flex-direction: column; padding: 17px; border: 1px solid var(--line); border-radius: 14px; background: var(--panel); box-shadow: 0 10px 25px rgba(28, 49, 88, .04); }
    .card-top { display: flex; align-items: start; justify-content: space-between; gap: 10px; }
    .skill-card h3 { margin: 0; font-size: 19px; letter-spacing: -.045em; }
    .version { display: block; margin-top: 3px; color: var(--muted); font-size: 10px; font-weight: 800; }
    .trust { padding: 4px 7px; border-radius: 999px; color: var(--warning); background: var(--warning-soft); font-size: 9px; font-weight: 900; white-space: nowrap; }
    .trust.verified { color: var(--success); background: var(--success-soft); }
    .description { min-height: 43px; margin: 11px 0 13px; color: var(--muted); font-size: 13px; line-height: 1.5; }
    .tag-row, .compat-row { display: flex; flex-wrap: wrap; gap: 5px; }
    .tag, .compat { padding: 4px 7px; border-radius: 6px; font-size: 9px; font-weight: 850; }
    .tag { color: var(--muted); background: rgba(127, 145, 175, .14); }
    .compat { color: var(--accent-dark); background: var(--accent-soft); }
    .card-meta { margin-top: 14px; color: var(--muted); font-size: 10px; }
    .meta-label { margin-right: 7px; color: var(--muted); font-weight: 850; }
    .meta-value { color: var(--ink); font-weight: 850; }
    .card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 16px; }
    .install-preview { overflow: hidden; max-width: 70%; padding: 8px 9px; border-radius: 7px; color: var(--muted); background: rgba(127, 145, 175, .12); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
    .details-button { padding: 8px 10px; border: 0; border-radius: 8px; color: #fff; background: var(--ink); font-size: 10px; font-weight: 900; }
    .empty { padding: 36px 18px; border: 1px dashed var(--line); border-radius: 13px; color: var(--muted); text-align: center; }
    footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin: 60px 0 24px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; }
    footer a { color: var(--ink); font-weight: 850; text-decoration: none; }
    dialog { width: min(680px, calc(100% - 26px)); max-height: min(740px, calc(100vh - 26px)); padding: 0; border: 1px solid var(--line); border-radius: 16px; color: var(--ink); background: var(--canvas); box-shadow: 0 30px 90px rgba(15, 31, 64, .25); }
    dialog::backdrop { background: rgba(12, 23, 44, .45); backdrop-filter: blur(4px); }
    .dialog-inner { padding: 21px; }
    .dialog-header { display: flex; justify-content: space-between; gap: 16px; }
    .dialog-header h2 { margin: 5px 0 0; font-size: 26px; letter-spacing: -.06em; }
    .close { width: 30px; height: 30px; border: 0; border-radius: 8px; color: var(--muted); background: var(--panel); font-size: 17px; }
    .dialog-description { margin: 10px 0 16px; color: var(--muted); font-size: 13px; line-height: 1.55; }
    .dialog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin: 17px 0; }
    .dialog-panel { padding: 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }
    .dialog-panel h3 { margin: 0 0 8px; color: var(--muted); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
    .dialog-panel p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.5; }
    .skill-preview { max-height: 230px; overflow: auto; margin: 8px 0 0; padding: 12px; border-radius: 9px; color: #dce7ff; background: var(--code); font: 11px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    @media (max-width: 780px) { .hero { grid-template-columns: 1fr; padding-top: 42px; } .skill-grid { grid-template-columns: 1fr; } .controls { grid-template-columns: 1fr; } }
    @media (max-width: 540px) { .shell { width: min(100% - 26px, 1120px); } nav a[href="#catalog"], nav a[href="#agent"] { display: none; } h1 { font-size: 49px; } .dialog-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="Shawnup Skill Index">
        <span class="brand-mark">S</span>
        <span class="brand-name">Shawnup Skill<span class="brand-subtitle">Index</span></span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#catalog" data-i18n="browse">Browse</a>
        <a href="#agent" data-i18n="forAgents">Agent</a>
        <a href="/registry.json" data-i18n="json">JSON</a>
        <button class="icon-button" id="language-toggle" type="button" aria-label="Switch language">EN</button>
        <button class="icon-button" id="theme-toggle" type="button" aria-label="Toggle theme">☾</button>
      </nav>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div>
          <span class="eyebrow" data-i18n="eyebrow">Shawnup Skill Index</span>
          <h1 id="hero-title" data-i18n="heroTitle">A sharper way to find your next skill.</h1>
          <p class="hero-copy" data-i18n="heroCopy">Reusable workflows for Codex, Claude Code, and Gemini CLI.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#catalog" data-i18n="browseSkills">Browse skills</a>
            <a class="button button-secondary" href="/llms.txt" data-i18n="agentGuide">For agents</a>
          </div>
        </div>
        <aside class="agent-card" id="agent" aria-labelledby="agent-title">
          <span class="eyebrow" data-i18n="forAgents">For agents</span>
          <h2 id="agent-title" data-i18n="agentTitle">Machine-readable first.</h2>
          <p data-i18n="agentCopy">Use JSON and manifests when you need a skill.</p>
          <div class="agent-endpoint"><code>/.well-known/agent-skill-registry.json</code><button class="copy-button" data-copy="/.well-known/agent-skill-registry.json" data-i18n="copy">Copy</button></div>
          <div class="agent-endpoint"><code>/registry.json</code><button class="copy-button" data-copy="/registry.json" data-i18n="copy">Copy</button></div>
        </aside>
      </section>

      <section id="catalog" aria-labelledby="catalog-title">
        <div class="section-heading"><div><span class="section-label" data-i18n="catalog">Skills</span><h2 id="catalog-title" data-i18n="skillsTitle">Skills</h2></div></div>
        <div class="controls">
          <label class="search-wrap"><span class="sr-only" data-i18n="searchLabel">Search skill</span><input class="search" id="search" type="search" data-i18n-placeholder="searchPlaceholder" placeholder="Search skill…" autocomplete="off"></label>
          <div class="filter-bar" id="compatibility-filters" data-i18n-aria="filterByAgent" aria-label="Filter by agent"></div>
        </div>
        <div class="results-line"><span id="results-count">Loading…</span><span data-i18n="selectToInspect">Select a skill to inspect</span></div>
        <div class="skill-grid" id="skills" aria-live="polite"></div>
        <div class="empty" id="empty" hidden data-i18n="noMatch">No skills found.</div>
      </section>
    </main>

    <footer><span>Shawnup Skill Index</span><span><a href="/registry.json">registry.json</a> · <a href="/.well-known/agent-skill-registry.json" data-i18n="discovery">discovery</a> · <a href="https://github.com/Shawn-csy/agent-skill-registry">GitHub</a></span></footer>
  </div>

  <dialog id="skill-dialog" aria-labelledby="dialog-title">
    <div class="dialog-inner">
      <div class="dialog-header"><div><span class="section-label" data-i18n="details">Details</span><h2 id="dialog-title">Skill</h2></div><button class="close" id="close-dialog" data-i18n-aria="close" aria-label="Close">×</button></div>
      <p class="dialog-description" id="dialog-description"></p>
      <div class="tag-row" id="dialog-tags"></div>
      <div class="dialog-grid">
        <div class="dialog-panel"><h3 data-i18n="worksWith">Works with</h3><div class="compat-row" id="dialog-compatibility"></div></div>
        <div class="dialog-panel"><h3 data-i18n="access">Access</h3><p id="dialog-permissions"></p></div>
        <div class="dialog-panel"><h3 data-i18n="requires">Requires</h3><p id="dialog-requires"></p></div>
        <div class="dialog-panel"><h3 data-i18n="files">Files</h3><p id="dialog-files"></p></div>
      </div>
      <div class="dialog-panel"><h3 data-i18n="preview">SKILL.md</h3><pre class="skill-preview" id="dialog-preview">Loading…</pre></div>
      <div class="dialog-actions"><button class="button button-primary" id="dialog-copy-install" data-i18n="copyInstall">Copy install command</button><a class="button button-secondary" id="dialog-open-manifest" href="/registry.json" data-i18n="manifest">Manifest</a><a class="button button-secondary" id="dialog-open-skill" href="/registry.json" data-i18n="skillFile">SKILL.md</a></div>
    </div>
  </dialog>

  <script>
    const translations = {
      en: { eyebrow: 'Shawnup Skill Index', heroTitle: 'A sharper way to find your next skill.', heroCopy: 'Reusable workflows for Codex, Claude Code, and Gemini CLI.', browse: 'Browse', forAgents: 'For agents', json: 'JSON', browseSkills: 'Browse skills', agentGuide: 'For agents', agentTitle: 'Machine-readable first.', agentCopy: 'Use JSON and manifests when you need a skill.', copy: 'Copy', catalog: 'Skills', skillsTitle: 'Skills', searchLabel: 'Search skill', searchPlaceholder: 'Search skill…', selectToInspect: 'Select a skill to inspect', noMatch: 'No skill found.', details: 'Details', worksWith: 'Works with', access: 'Access', requires: 'Requires', files: 'Files', preview: 'SKILL.md', copyInstall: 'Copy install command', manifest: 'Manifest', skillFile: 'SKILL.md', discovery: 'discovery', close: 'Close', filterByAgent: 'Filter by agent', all: 'All', review: 'Review', verified: 'Verified', view: 'View', copied: 'Copied', readFiles: 'read files', writeFiles: 'write files', shell: 'shell', network: 'network', noAccess: 'No elevated access', noRequirements: 'None', results: '{shown} results' },
      zh: { eyebrow: 'Shawnup Skill Index', heroTitle: '找到好用的 skill。', heroCopy: '給 Codex、Claude Code、Gemini CLI 的可重用工作流程。', browse: 'Browse', forAgents: '給 Agent', json: 'JSON', browseSkills: '瀏覽 skill', agentGuide: '給 Agent', agentTitle: 'Agent 直接讀這裡。', agentCopy: '需要 skill 時，直接讀 JSON 和 manifest。', copy: '複製', catalog: 'Skills', skillsTitle: 'Skills', searchLabel: '搜尋 skill', searchPlaceholder: '搜尋 skill、標籤或描述…', selectToInspect: '選取 skill 查看詳情', noMatch: '找不到符合的 skill。', details: '詳情', worksWith: '支援 Agent', access: '權限', requires: '需求', files: '檔案', preview: 'SKILL.md 預覽', copyInstall: '複製安裝命令', manifest: 'Manifest', skillFile: 'SKILL.md', discovery: '探索資訊', close: '關閉', filterByAgent: '依 Agent 篩選', all: '全部', review: '請先檢查', verified: '已驗證', view: '查看', copied: '已複製', readFiles: '讀檔', writeFiles: '寫檔', shell: 'Shell', network: '網路', noAccess: '未宣告額外權限', noRequirements: '無', results: '找到 {shown} 個' }
    };
    const agentLabels = { codex: 'Codex', 'claude-code': 'Claude Code', 'gemini-cli': 'Gemini CLI' };
    const state = { skills: [], term: '', agent: 'all', locale: localStorage.getItem('registry-locale') || (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'), theme: localStorage.getItem('registry-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), active: null };
    const search = document.querySelector('#search');
    const skillsContainer = document.querySelector('#skills');
    const empty = document.querySelector('#empty');
    const resultsCount = document.querySelector('#results-count');
    const dialog = document.querySelector('#skill-dialog');
    const t = key => (translations[state.locale][key] || translations.en[key] || key);
    const setTheme = () => { document.documentElement.dataset.theme = state.theme; document.querySelector('#theme-toggle').textContent = state.theme === 'dark' ? '☀' : '☾'; document.querySelector('#theme-toggle').setAttribute('aria-label', state.theme === 'dark' ? t('themeLight') : t('themeDark')); };
    translations.en.themeLight = 'Use light theme'; translations.en.themeDark = 'Use dark theme'; translations.zh.themeLight = '切換亮色模式'; translations.zh.themeDark = '切換暗色模式';
    const applyI18n = () => { document.documentElement.lang = state.locale === 'zh' ? 'zh-Hant' : 'en'; document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); }); document.querySelectorAll('[data-i18n-placeholder]').forEach(node => { node.placeholder = t(node.dataset.i18nPlaceholder); }); document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); }); document.querySelector('#language-toggle').textContent = state.locale === 'zh' ? 'EN' : '中'; document.querySelector('#language-toggle').setAttribute('aria-label', state.locale === 'zh' ? 'Switch to English' : '切換繁體中文'); setTheme(); if (state.skills.length) { renderFilters(); render(); } if (dialog.open && state.active) fillDialog(state.active); };
    const copy = async (value, button) => { try { await navigator.clipboard.writeText(value); if (button) { const original = button.textContent; button.textContent = t('copied'); setTimeout(() => { button.textContent = original; }, 1200); } } catch { window.prompt('Copy this value', value); } };
    const installCommand = skill => 'skill install ' + skill.slug + ' --target codex';
    const permissionSummary = skill => { const permissions = []; const p = skill.permissions || {}; if (p.filesystem && p.filesystem.read) permissions.push(t('readFiles')); if (p.filesystem && p.filesystem.write) permissions.push(t('writeFiles')); if (p.shell) permissions.push(t('shell')); if (p.network && p.network.length) permissions.push(t('network')); return permissions.length ? permissions.join(' · ') : t('noAccess'); };
    const requiresSummary = skill => { const values = []; const r = skill.requires || {}; if (r.tools && r.tools.length) values.push('tools: ' + r.tools.join(', ')); if (r.skills && r.skills.length) values.push('skills: ' + r.skills.join(', ')); return values.length ? values.join(' · ') : t('noRequirements'); };
    const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
    const addPills = (parent, values, className, labels) => values.forEach(value => parent.appendChild(make('span', className, labels && labels[value] ? labels[value] : value)));
    const visibleSkills = () => state.skills.filter(skill => { const haystack = [skill.slug, skill.name, skill.description].concat(skill.tags || [], skill.compatibility || []).join(' ').toLowerCase(); return (!state.term || haystack.includes(state.term)) && (state.agent === 'all' || (skill.compatibility || []).includes(state.agent)); });
    const renderFilters = () => { const filters = document.querySelector('#compatibility-filters'); filters.replaceChildren(); ['all'].concat([...new Set(state.skills.flatMap(skill => skill.compatibility || []))]).forEach(agent => { const button = make('button', 'filter' + (state.agent === agent ? ' active' : ''), agent === 'all' ? t('all') : (agentLabels[agent] || agent)); button.type = 'button'; button.addEventListener('click', () => { state.agent = agent; renderFilters(); render(); }); filters.appendChild(button); }); };
    const render = () => { const visible = visibleSkills(); skillsContainer.replaceChildren(); resultsCount.textContent = t('results').replace('{shown}', visible.length).replace('{total}', state.skills.length); empty.hidden = visible.length > 0; visible.forEach(skill => { const card = make('article', 'skill-card'); const top = make('div', 'card-top'); const heading = make('div'); heading.appendChild(make('h3', '', skill.name)); heading.appendChild(make('span', 'version', 'v' + skill.version)); top.appendChild(heading); top.appendChild(make('span', 'trust' + (skill.verified ? ' verified' : ''), skill.verified ? t('verified') : t('review'))); card.appendChild(top); card.appendChild(make('p', 'description', skill.description)); const tags = make('div', 'tag-row'); addPills(tags, (skill.tags || []).slice(0, 4), 'tag'); card.appendChild(tags); const compat = make('div', 'compat-row'); addPills(compat, skill.compatibility || [], 'compat', agentLabels); card.appendChild(compat); const meta = make('div', 'card-meta'); meta.appendChild(make('span', 'meta-label', t('access'))); meta.appendChild(make('span', 'meta-value', permissionSummary(skill))); card.appendChild(meta); const bottom = make('div', 'card-bottom'); const command = make('code', 'install-preview', installCommand(skill)); const copyButton = make('button', 'copy-button', t('copy')); copyButton.type = 'button'; copyButton.addEventListener('click', () => copy(installCommand(skill), copyButton)); bottom.appendChild(command); bottom.appendChild(copyButton); const details = make('button', 'details-button', t('view')); details.type = 'button'; details.addEventListener('click', () => openSkill(skill.slug)); bottom.appendChild(details); card.appendChild(bottom); skillsContainer.appendChild(card); }); };
    const fillDialog = async skill => { document.querySelector('#dialog-title').textContent = skill.name + ' v' + skill.version; document.querySelector('#dialog-description').textContent = skill.description; const tags = document.querySelector('#dialog-tags'); tags.replaceChildren(); addPills(tags, skill.tags || [], 'tag'); const compatibility = document.querySelector('#dialog-compatibility'); compatibility.replaceChildren(); addPills(compatibility, skill.compatibility || [], 'compat', agentLabels); document.querySelector('#dialog-permissions').textContent = permissionSummary(skill); document.querySelector('#dialog-requires').textContent = requiresSummary(skill); document.querySelector('#dialog-files').textContent = (skill.files || []).join(' · '); document.querySelector('#dialog-open-manifest').href = skill.manifest; document.querySelector('#dialog-open-skill').href = skill.skill; document.querySelector('#dialog-copy-install').onclick = () => copy(installCommand(skill), document.querySelector('#dialog-copy-install')); const preview = document.querySelector('#dialog-preview'); preview.textContent = 'Loading…'; try { const response = await fetch(skill.skill); preview.textContent = response.ok ? (await response.text()).slice(0, 5000) : 'Preview unavailable.'; } catch { preview.textContent = 'Preview unavailable.'; } };
    const openSkill = async slug => { const skill = state.skills.find(candidate => candidate.slug === slug); if (!skill) return; state.active = skill; window.location.hash = 'skill=' + encodeURIComponent(slug); dialog.showModal(); await fillDialog(skill); };
    document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => copy(button.dataset.copy, button)));
    document.querySelector('#language-toggle').addEventListener('click', () => { state.locale = state.locale === 'zh' ? 'en' : 'zh'; localStorage.setItem('registry-locale', state.locale); applyI18n(); });
    document.querySelector('#theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('registry-theme', state.theme); setTheme(); });
    document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { state.active = null; if (window.location.hash.startsWith('#skill=')) history.replaceState(null, '', window.location.pathname + window.location.search); });
    search.addEventListener('input', event => { state.term = event.target.value.trim().toLowerCase(); render(); });
    applyI18n();
    fetch('./registry.json').then(response => response.json()).then(registry => { state.skills = registry.skills || []; renderFilters(); render(); const hash = window.location.hash.match(/^#skill=(.+)$/); if (hash) openSkill(decodeURIComponent(hash[1])); }).catch(() => { resultsCount.textContent = 'Catalog unavailable'; empty.hidden = false; });
  </script>
</body>
</html>
`;
}
