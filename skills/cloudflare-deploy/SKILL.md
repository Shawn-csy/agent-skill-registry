# Cloudflare Deploy

Use this skill when planning, implementing or troubleshooting deployments to Cloudflare Pages, Workers or related services.

## Workflow

1. Confirm the deployment target and production branch.
2. Inspect the current build command and environment variables.
3. Make the smallest safe configuration change.
4. Verify the preview or deployment logs before declaring success.

## Safety

- Do not expose API tokens in source files or logs.
- Prefer a preview deployment before changing production routing.
- Record Cloudflare-specific assumptions in the project documentation.
