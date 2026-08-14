# Personal Agent Skill Registry

A small, Git-native registry with a usable V1 CLI for searching, installing and updating cross-agent Skills.

## Quick start

```bash
npm install
npm run build

node dist/cli.js search cloudflare
node dist/cli.js info cloudflare-deploy --registry generated/registry.json
node dist/cli.js install cloudflare-deploy --registry generated/registry.json --target custom --dir /tmp/my-agent-skills --state-dir /tmp/skill-state
node dist/cli.js list --state-dir /tmp/skill-state
```

The first command uses the public default registry after deployment. Before the domain is live, add `--registry generated/registry.json` to every CLI command or set `SKILL_REGISTRY=generated/registry.json`.

By default the CLI reads the public registry from:

```text
https://skill.shawnup.com/registry.json
```

For local development or tests, override it with `--registry generated/registry.json` or `SKILL_REGISTRY=generated/registry.json`.

Register the CLI locally so the `skill` command is available everywhere in your shell:

```bash
npm install -g .
skill search cloudflare
```

For a real Agent target, use `--target codex`, `--target claude` or `--target gemini`. If more than one Agent is detected, the CLI asks for an explicit target through the command error rather than installing into an unexpected directory.

## Build output

- `generated/registry.json` is a local, self-contained registry artifact.
- `site/` is a static registry browser ready to deploy to Cloudflare Pages.
- `dist/cli.js` is the executable behind the `skill` command.

Cloudflare Pages is connected directly to the GitHub repository and deploys the production `main` branch automatically. Its production build settings are:

```text
Build command: npm run build
Build output directory: site
Root directory: /
```

The Pages project name is `skill-registry`, and the deployed site exposes these paths:

```text
/registry.json
/skills/<slug>/SKILL.md
/skills/<slug>/manifest.json
```

The CLI resolves Skill file URLs relative to `/registry.json`, so the same static artifact works locally and at the public domain.

Manual deployment, if needed:

```bash
npm run deploy:pages
```

The custom domain `skill.shawnup.com` is attached to that Pages project and points to `skill-registry.pages.dev`.

## CLI commands

```bash
skill search <term>
skill info <slug>
skill install <slug> --target codex
skill list
skill outdated
skill update
```

Use `--registry <path-or-url>` to consume a different registry and `--state-dir <path>` to keep install metadata in a project-local location.
