export interface AgentDiscoveryDocument {
  type: "agent-skill-registry";
  schemaVersion: 1;
  name: string;
  human: string;
  catalog: string;
  instructions: string;
  skill: string;
  manifest: string;
  retrieval: {
    catalog: string;
    manifest: string;
    instructions: string;
  };
  crud: {
    transport: "git";
    repository: string;
    source: string;
    create: string;
    update: string;
    delete: string;
    branch: string;
    publish: string;
    pullRequest: string;
    merge: string;
  };
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
    retrieval: {
      catalog: "GET /registry.json",
      manifest: "GET /skills/{slug}/manifest.json",
      instructions: "GET /skills/{slug}/SKILL.md",
    },
    crud: {
      transport: "git",
      repository: "https://github.com/Shawn-csy/agent-skill-registry",
      source: "skills/{slug}/",
      create: "Add skills/{slug}/manifest.yaml and skills/{slug}/SKILL.md",
      update: "Edit the source files under skills/{slug}/",
      delete: "Remove the source directory skills/{slug}/",
      branch: "skill/{slug}-<change>",
      publish: "npm test && npm run build && git push -u origin <branch>",
      pullRequest: "Open a pull request from <branch> to main",
      merge: "Merge only after CI passes; Pages deploys main",
    },
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

## Read

- GET /registry.json — list and filter skills by slug, description, tags, or compatibility.
- GET /.well-known/agent-skill-registry.json — read this machine-readable contract.
- GET /skills/{slug}/manifest.json — inspect metadata, permissions, requirements, and files.
- GET /skills/{slug}/SKILL.md — load the instructions only after the skill is relevant.

## Retrieval

1. Fetch /registry.json and filter by slug, description, tags, and compatibility.
2. Read the selected manifest before loading SKILL.md.
3. Check permissions and requires before recommending or using a skill.
4. Load SKILL.md only when the skill is relevant.

## CRUD / write model

The deployed site is static and read-only over HTTP. It has no POST, PATCH, or DELETE endpoint.
Use the Git repository as the write surface:

- Create: add skills/{slug}/manifest.yaml and skills/{slug}/SKILL.md.
- Read: use the HTTP endpoints above, or inspect the source directory.
- Update: edit the source files under skills/{slug}/ and increment the manifest version.
- Delete: remove skills/{slug}/.
- Publish: run npm test, run npm run build, commit on a branch, push the branch, and open a pull request to main.

After the pull request is merged, Cloudflare Pages rebuilds the public catalog from main. Never write to /registry.json directly; it is generated output.

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
      --canvas: #f7f8fa;
      --surface: #ffffff;
      --surface-subtle: #f1f4f8;
      --surface-strong: #e8edf4;
      --ink: #172033;
      --muted: #606b80;
      --faint: #8993a5;
      --line: #dfe4ec;
      --line-strong: #c8d0dc;
      --accent: #2864dc;
      --accent-hover: #1f52bc;
      --accent-soft: #eaf1ff;
      --success: #18794e;
      --success-soft: #e8f6ef;
      --warning: #92600a;
      --warning-soft: #fff4d6;
      --code: #111827;
      --shadow: 0 1px 2px rgba(16, 24, 40, .04), 0 8px 30px rgba(16, 24, 40, .05);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    html[data-theme="dark"] {
      color-scheme: dark;
      --canvas: #0c111b;
      --surface: #121925;
      --surface-subtle: #182131;
      --surface-strong: #202b3d;
      --ink: #edf2f8;
      --muted: #a6b0c1;
      --faint: #78849a;
      --line: #273247;
      --line-strong: #3a475e;
      --accent: #76a6ff;
      --accent-hover: #a4c3ff;
      --accent-soft: #192b4f;
      --success: #77c9a1;
      --success-soft: #17372b;
      --warning: #e4bd68;
      --warning-soft: #3a2e18;
      --code: #080d15;
      --shadow: 0 1px 2px rgba(0, 0, 0, .2), 0 14px 36px rgba(0, 0, 0, .16);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; min-width: 320px; color: var(--ink); background: var(--canvas); font-size: 15px; line-height: 1.5; }
    a { color: inherit; }
    button, input { font: inherit; }
    button { cursor: pointer; }
    button, a, input { -webkit-tap-highlight-color: transparent; }
    :focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 42%, transparent); outline-offset: 2px; }
    .skip-link { position: fixed; top: 10px; left: 10px; z-index: 20; transform: translateY(-160%); padding: 9px 12px; border-radius: 8px; color: #fff; background: var(--accent); }
    .skip-link:focus { transform: translateY(0); }
    .shell { width: min(1040px, calc(100% - 40px)); margin: 0 auto; }
    .site-header { position: sticky; top: 0; z-index: 10; border-bottom: 1px solid color-mix(in srgb, var(--line) 82%, transparent); background: color-mix(in srgb, var(--canvas) 88%, transparent); backdrop-filter: blur(16px); }
    .topbar { display: flex; min-height: 64px; align-items: center; justify-content: space-between; gap: 18px; }
    .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; }
    .brand-mark { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 9px; color: #fff; background: var(--accent); font-size: 13px; font-weight: 850; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .16); }
    .brand-name { font-size: 14px; font-weight: 760; letter-spacing: -.02em; }
    .brand-subtitle { margin-left: 5px; color: var(--faint); font-size: 11px; font-weight: 600; }
    nav { display: flex; align-items: center; gap: 4px; }
    nav a, .icon-button { display: inline-flex; min-height: 36px; align-items: center; padding: 7px 10px; border: 1px solid transparent; border-radius: 8px; color: var(--muted); background: transparent; font-size: 12px; font-weight: 680; text-decoration: none; }
    nav a:hover, .icon-button:hover { border-color: var(--line); color: var(--ink); background: var(--surface); }
    .icon-button { min-width: 38px; justify-content: center; }
    .hero { padding: 76px 0 50px; text-align: center; }
    .eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px; color: var(--accent); font-size: 12px; font-weight: 760; letter-spacing: .04em; }
    .eyebrow::before { width: 7px; height: 7px; border-radius: 999px; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); content: ""; }
    h1 { max-width: 760px; margin: 0 auto; font-size: clamp(40px, 6vw, 64px); line-height: 1.04; letter-spacing: -.055em; }
    .hero-copy { max-width: 620px; margin: 18px auto 0; color: var(--muted); font-size: 17px; line-height: 1.7; }
    .hero-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 18px; margin-top: 25px; color: var(--faint); font-size: 12px; }
    .hero-meta span { display: inline-flex; align-items: center; gap: 6px; }
    .hero-meta span::before { width: 4px; height: 4px; border-radius: 50%; background: var(--line-strong); content: ""; }
    .hero-meta strong { color: var(--ink); font-weight: 750; }
    .quick-start { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: center; margin: 0 0 34px; padding: 14px 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); box-shadow: var(--shadow); }
    .quick-start-label { color: var(--muted); font-size: 12px; font-weight: 700; white-space: nowrap; }
    .command { overflow: hidden; color: var(--ink); font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-overflow: ellipsis; white-space: nowrap; }
    .copy-button, .small-button { display: inline-flex; min-height: 34px; align-items: center; justify-content: center; padding: 7px 10px; border: 1px solid var(--line-strong); border-radius: 8px; color: var(--ink); background: var(--surface); font-size: 11px; font-weight: 720; }
    .copy-button:hover, .small-button:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
    .catalog { scroll-margin-top: 84px; }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
    .section-heading h2 { margin: 0; font-size: 28px; letter-spacing: -.04em; }
    .section-heading p { margin: 5px 0 0; color: var(--muted); font-size: 13px; }
    .text-link { color: var(--muted); font-size: 12px; font-weight: 680; text-decoration: none; }
    .text-link:hover { color: var(--accent); }
    .search-panel { margin-bottom: 14px; padding: 12px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow); }
    .search-wrap { position: relative; display: block; }
    .search-icon { position: absolute; top: 50%; left: 14px; width: 17px; height: 17px; transform: translateY(-50%); color: var(--faint); pointer-events: none; }
    .search { width: 100%; min-height: 46px; padding: 11px 44px 11px 42px; border: 1px solid var(--line); border-radius: 10px; outline: none; color: var(--ink); background: var(--surface-subtle); }
    .search::placeholder { color: var(--faint); }
    .search:focus { border-color: var(--accent); background: var(--surface); box-shadow: 0 0 0 3px var(--accent-soft); }
    .clear-search { position: absolute; top: 50%; right: 8px; width: 32px; height: 32px; transform: translateY(-50%); border: 0; border-radius: 7px; color: var(--muted); background: transparent; }
    .clear-search:hover { color: var(--ink); background: var(--surface-strong); }
    .filter-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
    .filter-label { flex: 0 0 auto; padding-left: 2px; color: var(--faint); font-size: 11px; font-weight: 680; }
    .filter-bar { display: flex; flex-wrap: wrap; gap: 6px; }
    .filter { min-height: 32px; padding: 6px 10px; border: 1px solid transparent; border-radius: 999px; color: var(--muted); background: var(--surface-subtle); font-size: 11px; font-weight: 680; }
    .filter:hover { color: var(--ink); background: var(--surface-strong); }
    .filter.active { border-color: color-mix(in srgb, var(--accent) 35%, transparent); color: var(--accent); background: var(--accent-soft); }
    .filter-count { margin-left: 4px; opacity: .72; font-size: 10px; }
    .results-line { display: flex; justify-content: space-between; gap: 14px; margin: 16px 2px 10px; color: var(--faint); font-size: 11px; }
    .results-line strong { color: var(--muted); font-weight: 700; }
    .skill-list { display: grid; gap: 10px; }
    .skill-card { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 14px; align-items: start; padding: 18px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); box-shadow: 0 1px 2px rgba(16, 24, 40, .025); transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
    .skill-card:hover { border-color: var(--line-strong); box-shadow: var(--shadow); transform: translateY(-1px); }
    .skill-icon { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 11px; color: var(--accent); background: var(--accent-soft); font-size: 16px; font-weight: 820; text-transform: uppercase; }
    .card-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
    .skill-card h3 { margin: 0; font-size: 17px; line-height: 1.3; letter-spacing: -.025em; }
    .version, .trust { display: inline-flex; align-items: center; border-radius: 999px; font-size: 9px; font-weight: 760; white-space: nowrap; }
    .version { padding: 3px 6px; color: var(--muted); background: var(--surface-subtle); }
    .trust { gap: 4px; padding: 3px 7px; color: var(--warning); background: var(--warning-soft); }
    .trust::before { width: 5px; height: 5px; border-radius: 50%; background: currentColor; content: ""; }
    .trust.verified { color: var(--success); background: var(--success-soft); }
    .description { max-width: 720px; margin: 7px 0 10px; color: var(--muted); font-size: 13px; line-height: 1.6; }
    .tag-row, .compat-row { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
    .tag { padding: 3px 7px; border-radius: 6px; color: var(--muted); background: var(--surface-subtle); font-size: 9px; font-weight: 680; }
    .card-meta { display: flex; flex-wrap: wrap; gap: 7px 15px; margin-top: 11px; color: var(--faint); font-size: 10px; }
    .card-meta span { display: inline-flex; align-items: center; gap: 5px; }
    .card-meta strong { color: var(--muted); font-weight: 680; }
    .card-actions { display: grid; min-width: 126px; gap: 7px; }
    .primary-button, .secondary-button { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 730; white-space: nowrap; }
    .primary-button { border: 1px solid var(--accent); color: #fff; background: var(--accent); }
    html[data-theme="dark"] .primary-button { color: #0c111b; }
    .primary-button:hover { border-color: var(--accent-hover); background: var(--accent-hover); }
    .secondary-button { border: 1px solid var(--line-strong); color: var(--ink); background: var(--surface); }
    .secondary-button:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
    .empty { padding: 54px 20px; border: 1px dashed var(--line-strong); border-radius: 14px; color: var(--muted); background: var(--surface); text-align: center; }
    .agent-section { scroll-margin-top: 84px; display: grid; grid-template-columns: minmax(220px, .7fr) minmax(0, 1.3fr); gap: 32px; margin-top: 76px; padding: 30px; border: 1px solid var(--line); border-radius: 16px; background: var(--surface); }
    .agent-section h2 { margin: 0; font-size: 23px; letter-spacing: -.035em; }
    .agent-section p { margin: 8px 0 0; color: var(--muted); font-size: 13px; line-height: 1.65; }
    .endpoint-list { display: grid; gap: 8px; }
    .endpoint { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 10px 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-subtle); }
    .endpoint code { overflow: hidden; color: var(--ink); font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
    footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin: 54px 0 24px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--faint); font-size: 10px; }
    footer a { color: var(--muted); font-weight: 680; text-decoration: none; }
    footer a:hover { color: var(--accent); }
    dialog { width: min(760px, calc(100% - 28px)); max-height: min(820px, calc(100vh - 28px)); padding: 0; border: 1px solid var(--line); border-radius: 16px; color: var(--ink); background: var(--canvas); box-shadow: 0 28px 90px rgba(15, 23, 42, .28); }
    dialog::backdrop { background: rgba(5, 10, 20, .55); backdrop-filter: blur(3px); }
    .dialog-inner { padding: 24px; }
    .dialog-header { display: flex; justify-content: space-between; gap: 20px; }
    .dialog-kicker { color: var(--accent); font-size: 10px; font-weight: 760; letter-spacing: .08em; text-transform: uppercase; }
    .dialog-header h2 { margin: 4px 0 0; font-size: 25px; line-height: 1.2; letter-spacing: -.035em; }
    .close { width: 34px; height: 34px; border: 1px solid var(--line); border-radius: 9px; color: var(--muted); background: var(--surface); font-size: 18px; }
    .close:hover { color: var(--ink); background: var(--surface-strong); }
    .dialog-description { margin: 11px 0 16px; color: var(--muted); font-size: 13px; line-height: 1.65; }
    .install-box { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 11px 11px 11px 13px; border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--line)); border-radius: 10px; background: var(--accent-soft); }
    .install-box code { overflow: hidden; color: var(--ink); font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
    .dialog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin: 18px 0; }
    .dialog-panel { min-width: 0; padding: 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
    .dialog-panel h3 { margin: 0 0 7px; color: var(--faint); font-size: 9px; font-weight: 760; letter-spacing: .08em; text-transform: uppercase; }
    .dialog-panel p { overflow-wrap: anywhere; margin: 0; color: var(--muted); font-size: 11px; line-height: 1.55; }
    .compat { padding: 4px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); background: var(--surface-subtle); font-size: 9px; font-weight: 680; }
    .source-details { margin-top: 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
    .source-details summary { padding: 11px 13px; color: var(--muted); font-size: 11px; font-weight: 720; cursor: pointer; }
    .source-details[open] summary { border-bottom: 1px solid var(--line); }
    .skill-preview { max-height: 270px; overflow: auto; margin: 0; padding: 14px; color: #dbe6f6; background: var(--code); font: 11px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
    .dialog-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    .dialog-actions a { text-decoration: none; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    @media (max-width: 760px) {
      .hero { padding: 58px 0 38px; }
      .quick-start { grid-template-columns: 1fr auto; }
      .quick-start-label { grid-column: 1 / -1; }
      .skill-card { grid-template-columns: 40px minmax(0, 1fr); }
      .skill-icon { width: 40px; height: 40px; }
      .card-actions { grid-column: 2; display: flex; min-width: 0; }
      .card-actions button { flex: 1; }
      .agent-section { grid-template-columns: 1fr; gap: 20px; }
      .dialog-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 520px) {
      .shell { width: min(100% - 24px, 1040px); }
      .site-header .brand-subtitle, nav a[href="#agent"], nav a[href="/registry.json"] { display: none; }
      nav a, .icon-button { padding: 7px 8px; }
      .hero { padding-top: 46px; text-align: left; }
      .hero h1 { font-size: 41px; }
      .hero-copy { font-size: 15px; }
      .hero-meta { justify-content: flex-start; }
      .quick-start { grid-template-columns: minmax(0, 1fr) auto; padding: 12px; }
      .filter-row { align-items: flex-start; flex-direction: column; gap: 7px; }
      .section-heading { align-items: start; }
      .skill-card { grid-template-columns: 1fr; padding: 15px; }
      .skill-icon { display: none; }
      .card-actions { grid-column: 1; }
      .agent-section { margin-top: 54px; padding: 20px; }
      .dialog-inner { padding: 18px; }
      .dialog-grid { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; transition: none !important; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#catalog" data-i18n="skip">Skip to skills</a>
  <header class="site-header">
    <div class="shell topbar">
      <a class="brand" href="/" aria-label="Shawnup Skill Index">
        <span class="brand-mark">S</span>
        <span class="brand-name">Shawnup Skill <span class="brand-subtitle">Index</span></span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#catalog" data-i18n="browse">Skills</a>
        <a href="#agent" data-i18n="forAgents">For agents</a>
        <a href="/registry.json">JSON</a>
        <button class="icon-button" id="language-toggle" type="button" aria-label="Switch language">EN</button>
        <button class="icon-button" id="theme-toggle" type="button" aria-label="Toggle theme">☾</button>
      </nav>
    </div>
  </header>

  <main class="shell">
    <section class="hero" aria-labelledby="hero-title">
      <span class="eyebrow" data-i18n="eyebrow">Reusable agent workflows</span>
      <h1 id="hero-title" data-i18n="heroTitle">Turn repeatable work into a skill.</h1>
      <p class="hero-copy" data-i18n="heroCopy">Find a workflow, review what it can access, and install it into your agent with one command.</p>
      <div class="hero-meta" aria-label="Registry summary">
        <span><strong id="hero-count">—</strong> <span data-i18n="skillCountLabel">skills</span></span>
        <span data-i18n="agentSupport">Codex · Claude Code · Gemini CLI</span>
        <span data-i18n="openFormat">Open, machine-readable format</span>
      </div>
    </section>

    <section class="quick-start" aria-labelledby="quick-start-title">
      <span class="quick-start-label" id="quick-start-title" data-i18n="firstUse">First time? Install the Skill CLI</span>
      <code class="command">npm install -g github:Shawn-csy/agent-skill-registry</code>
      <button class="copy-button" type="button" data-copy="npm install -g github:Shawn-csy/agent-skill-registry" data-i18n="copy">Copy</button>
    </section>

    <section class="catalog" id="catalog" aria-labelledby="catalog-title">
      <div class="section-heading">
        <div><h2 id="catalog-title" data-i18n="skillsTitle">Explore skills</h2><p data-i18n="skillsCopy">Search by task, technology, or supported agent.</p></div>
        <a class="text-link" href="/registry.json" data-i18n="viewJson">View JSON →</a>
      </div>

      <div class="search-panel">
        <label class="search-wrap">
          <span class="sr-only" data-i18n="searchLabel">Search skills</span>
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input class="search" id="search" type="search" data-i18n-placeholder="searchPlaceholder" placeholder="Search skills, tags, or descriptions…" autocomplete="off">
          <button class="clear-search" id="clear-search" type="button" aria-label="Clear search" hidden>×</button>
        </label>
        <div class="filter-row">
          <span class="filter-label" data-i18n="filterLabel">Works with</span>
          <div class="filter-bar" id="compatibility-filters" data-i18n-aria="filterByAgent" aria-label="Filter by agent"></div>
        </div>
      </div>

      <div class="results-line"><strong id="results-count">Loading…</strong><span id="generated-at"></span></div>
      <div class="skill-list" id="skills" aria-live="polite"></div>
      <div class="empty" id="empty" hidden><strong data-i18n="noMatch">No matching skill.</strong><br><span data-i18n="noMatchHint">Try a broader keyword or clear the agent filter.</span></div>
    </section>

    <section class="agent-section" id="agent" aria-labelledby="agent-title">
      <div>
        <h2 id="agent-title" data-i18n="agentTitle">Machine-readable by default</h2>
        <p data-i18n="agentCopy">Agents can discover the catalog, inspect permissions, and load only the skill they need.</p>
      </div>
      <div class="endpoint-list">
        <div class="endpoint"><code>/.well-known/agent-skill-registry.json</code><button class="copy-button" type="button" data-copy="/.well-known/agent-skill-registry.json" data-i18n="copy">Copy</button></div>
        <div class="endpoint"><code>/registry.json</code><button class="copy-button" type="button" data-copy="/registry.json" data-i18n="copy">Copy</button></div>
        <div class="endpoint"><code>/llms.txt</code><button class="copy-button" type="button" data-copy="/llms.txt" data-i18n="copy">Copy</button></div>
      </div>
    </section>
  </main>

  <footer class="shell"><span>Shawnup Skill Index</span><span><a href="/registry.json">registry.json</a> · <a href="/.well-known/agent-skill-registry.json" data-i18n="discovery">discovery</a> · <a href="https://github.com/Shawn-csy/agent-skill-registry">GitHub</a></span></footer>

  <dialog id="skill-dialog" aria-labelledby="dialog-title">
    <div class="dialog-inner">
      <div class="dialog-header"><div><span class="dialog-kicker" data-i18n="details">Skill details</span><h2 id="dialog-title">Skill</h2></div><button class="close" id="close-dialog" type="button" data-i18n-aria="close" aria-label="Close">×</button></div>
      <p class="dialog-description" id="dialog-description"></p>
      <div class="install-box"><code id="dialog-install-command"></code><button class="copy-button" id="dialog-copy-install" type="button" data-i18n="copyCommand">Copy command</button></div>
      <div class="dialog-grid">
        <div class="dialog-panel"><h3 data-i18n="worksWith">Works with</h3><div class="compat-row" id="dialog-compatibility"></div></div>
        <div class="dialog-panel"><h3 data-i18n="access">Access</h3><p id="dialog-permissions"></p></div>
        <div class="dialog-panel"><h3 data-i18n="requires">Requires</h3><p id="dialog-requires"></p></div>
      </div>
      <div class="tag-row" id="dialog-tags"></div>
      <details class="source-details"><summary data-i18n="preview">Preview SKILL.md</summary><pre class="skill-preview" id="dialog-preview">Loading…</pre></details>
      <div class="dialog-actions"><a class="secondary-button" id="dialog-open-manifest" href="/registry.json" data-i18n="manifest">Manifest</a><a class="secondary-button" id="dialog-open-skill" href="/registry.json" data-i18n="skillFile">Open SKILL.md</a><span class="sr-only" id="dialog-files"></span></div>
    </div>
  </dialog>

  <script>
    const translations = {
      en: { skip: 'Skip to skills', eyebrow: 'Reusable agent workflows', heroTitle: 'Turn repeatable work into a skill.', heroCopy: 'Find a workflow, review what it can access, and install it into your agent with one command.', skillCountLabel: 'skills', agentSupport: 'Codex · Claude Code · Gemini CLI', openFormat: 'Open, machine-readable format', browse: 'Skills', forAgents: 'For agents', firstUse: 'First time? Install the Skill CLI', copy: 'Copy', copied: 'Copied', skillsTitle: 'Explore skills', skillsCopy: 'Search by task, technology, or supported agent.', viewJson: 'View JSON →', searchLabel: 'Search skills', searchPlaceholder: 'Search skills, tags, or descriptions…', filterLabel: 'Works with', filterByAgent: 'Filter by agent', all: 'All', noMatch: 'No matching skill.', noMatchHint: 'Try a broader keyword or clear the agent filter.', agentTitle: 'Machine-readable by default', agentCopy: 'Agents can discover the catalog, inspect permissions, and load only the skill they need.', discovery: 'discovery', details: 'Skill details', close: 'Close', copyCommand: 'Copy command', worksWith: 'Works with', access: 'Access', requires: 'Requires', preview: 'Preview SKILL.md', manifest: 'Manifest', skillFile: 'Open SKILL.md', review: 'Unverified', verified: 'Verified', install: 'Copy install', view: 'View details', readFiles: 'read files', writeFiles: 'write files', shell: 'shell', network: 'network', noAccess: 'No elevated access', noRequirements: 'None', results: '{shown} of {total} skills', updated: 'Updated {date}', themeLight: 'Use light theme', themeDark: 'Use dark theme', clearSearch: 'Clear search' },
      zh: { skip: '跳到 skill 列表', eyebrow: '可重用的 Agent 工作流', heroTitle: '把做過的事，變成可重用的 Skill。', heroCopy: '找到工作流、先檢查它需要的權限，再用一行指令安裝到你的 Agent。', skillCountLabel: '個 skills', agentSupport: '支援 Codex · Claude Code · Gemini CLI', openFormat: '開放、機器可讀格式', browse: 'Skills', forAgents: '給 Agent', firstUse: '第一次使用？先安裝 Skill CLI', copy: '複製', copied: '已複製', skillsTitle: '探索 Skills', skillsCopy: '依任務、技術或支援的 Agent 搜尋。', viewJson: '查看 JSON →', searchLabel: '搜尋 skills', searchPlaceholder: '搜尋 skill、標籤或用途…', filterLabel: '支援 Agent', filterByAgent: '依 Agent 篩選', all: '全部', noMatch: '找不到符合的 skill。', noMatchHint: '試試更短的關鍵字，或清除 Agent 篩選。', agentTitle: '預設就是機器可讀', agentCopy: 'Agent 可以探索目錄、先檢查權限，只載入當下需要的 skill。', discovery: '探索資訊', details: 'Skill 詳情', close: '關閉', copyCommand: '複製指令', worksWith: '支援 Agent', access: '需要權限', requires: '執行需求', preview: '預覽 SKILL.md', manifest: 'Manifest', skillFile: '開啟 SKILL.md', review: '未驗證', verified: '已驗證', install: '複製安裝指令', view: '查看詳情', readFiles: '讀檔', writeFiles: '寫檔', shell: 'Shell', network: '網路', noAccess: '未宣告額外權限', noRequirements: '無', results: '顯示 {shown} / {total} 個 skills', updated: '更新於 {date}', themeLight: '切換亮色模式', themeDark: '切換暗色模式', clearSearch: '清除搜尋' }
    };
    const agentLabels = { codex: 'Codex', 'claude-code': 'Claude Code', 'gemini-cli': 'Gemini CLI', custom: 'Custom' };
    const state = { skills: [], term: '', agent: 'all', locale: localStorage.getItem('registry-locale') || (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'), theme: localStorage.getItem('registry-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), active: null, generatedAt: null };
    const search = document.querySelector('#search');
    const clearSearch = document.querySelector('#clear-search');
    const skillsContainer = document.querySelector('#skills');
    const empty = document.querySelector('#empty');
    const resultsCount = document.querySelector('#results-count');
    const dialog = document.querySelector('#skill-dialog');
    const t = key => (translations[state.locale][key] || translations.en[key] || key);
    const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
    const addPills = (parent, values, className, labels) => values.forEach(value => parent.appendChild(make('span', className, labels && labels[value] ? labels[value] : value)));
    const installCommand = skill => 'skill install ' + skill.slug + ' --target codex';
    const permissionSummary = skill => { const values = []; const p = skill.permissions || {}; if (p.filesystem && p.filesystem.read) values.push(t('readFiles')); if (p.filesystem && p.filesystem.write) values.push(t('writeFiles')); if (p.shell) values.push(t('shell')); if (p.network && p.network.length) values.push(t('network')); return values.length ? values.join(' · ') : t('noAccess'); };
    const requiresSummary = skill => { const values = []; const r = skill.requires || {}; if (r.tools && r.tools.length) values.push(r.tools.join(', ')); if (r.skills && r.skills.length) values.push(r.skills.join(', ')); return values.length ? values.join(' · ') : t('noRequirements'); };
    const visibleSkills = () => state.skills.filter(skill => { const haystack = [skill.slug, skill.name, skill.description].concat(skill.tags || [], skill.compatibility || []).join(' ').toLowerCase(); return (!state.term || haystack.includes(state.term)) && (state.agent === 'all' || (skill.compatibility || []).includes(state.agent)); });
    const iconText = skill => (skill.name || skill.slug || 'S').replaceAll('-', ' ').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('');
    const formatDate = value => { if (!value) return ''; try { return new Intl.DateTimeFormat(state.locale === 'zh' ? 'zh-TW' : 'en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value)); } catch { return ''; } };
    const copy = async (value, button) => { try { await navigator.clipboard.writeText(value); if (button) { const original = button.textContent; button.textContent = t('copied'); setTimeout(() => { button.textContent = original; }, 1200); } } catch { window.prompt('Copy this value', value); } };
    const setTheme = () => { document.documentElement.dataset.theme = state.theme; const button = document.querySelector('#theme-toggle'); button.textContent = state.theme === 'dark' ? '☀' : '☾'; button.setAttribute('aria-label', state.theme === 'dark' ? t('themeLight') : t('themeDark')); };
    const renderFilters = () => { const filters = document.querySelector('#compatibility-filters'); filters.replaceChildren(); const agents = ['all'].concat([...new Set(state.skills.flatMap(skill => skill.compatibility || []))]); agents.forEach(agent => { const count = agent === 'all' ? state.skills.length : state.skills.filter(skill => (skill.compatibility || []).includes(agent)).length; const button = make('button', 'filter' + (state.agent === agent ? ' active' : '')); button.type = 'button'; button.appendChild(document.createTextNode(agent === 'all' ? t('all') : (agentLabels[agent] || agent))); button.appendChild(make('span', 'filter-count', String(count))); button.setAttribute('aria-pressed', state.agent === agent ? 'true' : 'false'); button.addEventListener('click', () => { state.agent = agent; renderFilters(); render(); }); filters.appendChild(button); }); };
    const render = () => { const visible = visibleSkills(); skillsContainer.replaceChildren(); resultsCount.textContent = t('results').replace('{shown}', visible.length).replace('{total}', state.skills.length); document.querySelector('#hero-count').textContent = String(state.skills.length); const date = formatDate(state.generatedAt); document.querySelector('#generated-at').textContent = date ? t('updated').replace('{date}', date) : ''; clearSearch.hidden = !state.term; empty.hidden = visible.length > 0; visible.forEach(skill => { const card = make('article', 'skill-card'); card.appendChild(make('div', 'skill-icon', iconText(skill))); const content = make('div', 'card-content'); const titleRow = make('div', 'card-title-row'); titleRow.appendChild(make('h3', '', skill.name)); titleRow.appendChild(make('span', 'version', 'v' + skill.version)); titleRow.appendChild(make('span', 'trust' + (skill.verified ? ' verified' : ''), skill.verified ? t('verified') : t('review'))); content.appendChild(titleRow); content.appendChild(make('p', 'description', skill.description)); const tags = make('div', 'tag-row'); addPills(tags, (skill.tags || []).slice(0, 5), 'tag'); content.appendChild(tags); const meta = make('div', 'card-meta'); const worksWith = make('span'); worksWith.appendChild(make('strong', '', t('worksWith') + ':')); worksWith.appendChild(document.createTextNode((skill.compatibility || []).map(agent => agentLabels[agent] || agent).join(' · '))); meta.appendChild(worksWith); const access = make('span'); access.appendChild(make('strong', '', t('access') + ':')); access.appendChild(document.createTextNode(permissionSummary(skill))); meta.appendChild(access); content.appendChild(meta); card.appendChild(content); const actions = make('div', 'card-actions'); const install = make('button', 'primary-button', t('install')); install.type = 'button'; install.addEventListener('click', () => copy(installCommand(skill), install)); const details = make('button', 'secondary-button', t('view')); details.type = 'button'; details.addEventListener('click', () => openSkill(skill.slug)); actions.appendChild(install); actions.appendChild(details); card.appendChild(actions); skillsContainer.appendChild(card); }); };
    const fillDialog = async skill => { document.querySelector('#dialog-title').textContent = skill.name + ' v' + skill.version; document.querySelector('#dialog-description').textContent = skill.description; const command = installCommand(skill); document.querySelector('#dialog-install-command').textContent = command; document.querySelector('#dialog-copy-install').onclick = () => copy(command, document.querySelector('#dialog-copy-install')); const tags = document.querySelector('#dialog-tags'); tags.replaceChildren(); addPills(tags, skill.tags || [], 'tag'); const compatibility = document.querySelector('#dialog-compatibility'); compatibility.replaceChildren(); addPills(compatibility, skill.compatibility || [], 'compat', agentLabels); document.querySelector('#dialog-permissions').textContent = permissionSummary(skill); document.querySelector('#dialog-requires').textContent = requiresSummary(skill); document.querySelector('#dialog-files').textContent = (skill.files || []).join(' · '); document.querySelector('#dialog-open-manifest').href = skill.manifest; document.querySelector('#dialog-open-skill').href = skill.skill; const preview = document.querySelector('#dialog-preview'); preview.textContent = 'Loading…'; try { const response = await fetch(skill.skill); preview.textContent = response.ok ? (await response.text()).slice(0, 6000) : 'Preview unavailable.'; } catch { preview.textContent = 'Preview unavailable.'; } };
    const openSkill = async slug => { const skill = state.skills.find(candidate => candidate.slug === slug); if (!skill) return; state.active = skill; window.location.hash = 'skill=' + encodeURIComponent(slug); dialog.showModal(); await fillDialog(skill); };
    const applyI18n = () => { document.documentElement.lang = state.locale === 'zh' ? 'zh-Hant' : 'en'; document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); }); document.querySelectorAll('[data-i18n-placeholder]').forEach(node => { node.placeholder = t(node.dataset.i18nPlaceholder); }); document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); }); document.querySelector('#clear-search').setAttribute('aria-label', t('clearSearch')); document.querySelector('#language-toggle').textContent = state.locale === 'zh' ? 'EN' : '中'; document.querySelector('#language-toggle').setAttribute('aria-label', state.locale === 'zh' ? 'Switch to English' : '切換繁體中文'); setTheme(); if (state.skills.length) { renderFilters(); render(); } if (dialog.open && state.active) fillDialog(state.active); };
    document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => copy(button.dataset.copy, button)));
    document.querySelector('#language-toggle').addEventListener('click', () => { state.locale = state.locale === 'zh' ? 'en' : 'zh'; localStorage.setItem('registry-locale', state.locale); applyI18n(); });
    document.querySelector('#theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('registry-theme', state.theme); setTheme(); });
    document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { state.active = null; document.querySelector('.source-details').open = false; if (window.location.hash.startsWith('#skill=')) history.replaceState(null, '', window.location.pathname + window.location.search); });
    search.addEventListener('input', event => { state.term = event.target.value.trim().toLowerCase(); render(); });
    clearSearch.addEventListener('click', () => { search.value = ''; state.term = ''; search.focus(); render(); });
    applyI18n();
    fetch('./registry.json').then(response => response.json()).then(registry => { state.skills = registry.skills || []; state.generatedAt = registry.generatedAt || null; renderFilters(); render(); const hash = window.location.hash.match(/^#skill=(.+)$/); if (hash) openSkill(decodeURIComponent(hash[1])); }).catch(() => { resultsCount.textContent = 'Catalog unavailable'; empty.hidden = false; });
  </script>
</body>
</html>
`;
}
