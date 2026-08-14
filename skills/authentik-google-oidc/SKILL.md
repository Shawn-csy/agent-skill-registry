---
name: authentik-google-oidc
description: Connect, configure, or troubleshoot a service against the existing Google-backed Authentik instance at auth.shawnup.com. Use when adding a Shawnup service to centralized login, choosing direct app OIDC, Supabase Auth custom OIDC, Cloudflare Access generic OIDC, or an auth proxy, registering callbacks, preserving app sessions or Supabase RLS, creating a per-service client, or validating discovery, health, claims, and logout.
---

# Connect a service to auth.shawnup.com

Onboard a service to the existing Authentik identity broker at `https://auth.shawnup.com`. Google source `google` is already configured. Do not rebuild Authentik or create another Google OAuth client during ordinary onboarding. Create a separate Authentik application/provider pair for every downstream service.

## Placeholders

- `{app_host}`: public application host.
- `{app_slug}`: unique lowercase Authentik application slug.
- `{app_callback}`: exact callback supplied by the downstream OIDC client.

## Workflow

### 1. Inspect before changing anything

Identify the target project's framework, current session owner, public host, existing authentication library, callback route, authorization model, and deployment environment. Inspect local configuration and official product documentation; do not guess a platform-generated callback.

Read [references/shawnup-deployment.md](references/shawnup-deployment.md) first and confirm the shared instance is ready before making changes.

Select one topology:

1. **Direct application OIDC**: a backend or trusted auth library exchanges the code and owns the application session. Read [references/app-oidc.md](references/app-oidc.md).
2. **Supabase Auth bridge**: Supabase Auth consumes Authentik as a custom OIDC provider and continues issuing Supabase sessions/JWTs for RLS. Read [references/platform-bridges.md](references/platform-bridges.md).
3. **Cloudflare Access bridge**: Cloudflare Access consumes Authentik as a generic OIDC IdP and gates the application at the edge. This does not create an application or Supabase session. Read [references/platform-bridges.md](references/platform-bridges.md).
4. **No native OIDC support**: prefer Authentik's Proxy Provider/outpost or Cloudflare Access. Do not add a hand-written OAuth callback merely to protect a simple internal service.

If the target already uses Supabase Auth, preserve it unless the user explicitly wants an auth migration. If the target needs both edge protection and an in-app identity, treat those as separate layers and document the double-login/session behavior.

### 2. Collect the integration contract

Resolve these values before creating the provider:

- exact callback URI, including scheme, port, path, and trailing slash;
- client type: confidential when a server can protect a secret, public otherwise;
- scopes, normally `openid profile email`;
- allowed users/groups and required role/group claims;
- logout behavior and post-logout destination;
- local development callbacks, listed explicitly rather than with a broad regex.

Use one client/provider per service and environment. Never share a client secret across unrelated services. Never put a client secret in a browser bundle, public environment variable, chat transcript, commit, or log.

### 3. Verify the shared Google source

Do not create another Google OAuth client for each downstream service. The existing Google callback terminates at Authentik:

`https://auth.shawnup.com/source/oauth/callback/google/`

Verify that the Google source exists, is enabled/promoted as intended, and is attached to the Identification stage used by the selected authentication flow. If the Authentik page only asks for email and shows no Google option, fix the Identification stage/source attachment before touching the downstream app.

Read [references/authentik.md](references/authentik.md) before changing shared sources, flows, users, or groups. Shared-flow or Google-source changes are troubleshooting actions, not normal service onboarding.

### 4. Create the per-service Authentik provider

In **Applications > Applications**, create the application and OAuth2/OIDC provider together.

Configure:

- application/provider slug: `{app_slug}`;
- redirect URI: `{app_callback}` with strict matching;
- client type appropriate to the selected topology;
- authorization code flow with PKCE;
- signing key/certificate so downstream clients can validate JWTs through JWKS;
- scopes `openid`, `profile`, and `email`, plus only required custom mappings;
- per-provider issuer mode, unless an existing integration explicitly requires global issuer mode;
- authentication, authorization, and invalidation flows with distinct purposes.

The default per-provider URLs are:

```text
Issuer:    https://auth.shawnup.com/application/o/{app_slug}/
Discovery: https://auth.shawnup.com/application/o/{app_slug}/.well-known/openid-configuration
```

Do not leave the redirect URI empty for first-launch learning. Do not use a wildcard/regex redirect unless the exact finite callback list is impractical and the regex is narrowly anchored.

### 5. Apply authorization deliberately

Treat authentication and authorization separately. Authentik application bindings/policies decide who may use the client; downstream app roles decide what authenticated users may do.

- Bind groups/users or policies when access is restricted.
- Map only the claims the downstream service consumes.
- Do not make a federated user an Authentik administrator merely so they can sign in to an app.
- Keep a tested local break-glass administrator; Google-backed users commonly have no local Authentik password.
- Keep ordinary app users external unless they need the Authentik user dashboard; internal/superuser status is not required for OIDC login.

### 6. Configure the downstream client

Pass the issuer, client ID, and server-only client secret to the selected integration layer. Use discovery instead of hard-coding authorization, token, userinfo, or JWKS paths. Key local identities by `(issuer, sub)`, not email alone.

For application-managed sessions, follow [references/app-oidc.md](references/app-oidc.md). For Supabase Auth or Cloudflare Access, follow [references/platform-bridges.md](references/platform-bridges.md). Treat optional Google Drive/Sheets access as a second OAuth grant and read [references/google-data-access.md](references/google-data-access.md).

### 7. Validate without exposing secrets

Run the bundled read-only check:

```bash
python3 scripts/check_oidc.py \
  --issuer "https://auth.shawnup.com/application/o/{app_slug}/" \
  --health-url "https://auth.shawnup.com/-/health/ready/"
```

Then test in a private browser session:

1. Start at the downstream service, not the Authentik dashboard.
2. Confirm the redirect chain is service/platform -> Authentik -> Google -> Authentik -> exact service/platform callback.
3. Confirm the final service session exists and the expected user/claims are present.
4. Confirm a disallowed user is denied by policy.
5. Confirm state, nonce, issuer, audience, expiry, signature, and callback mismatch failures are rejected.
6. Test logout separately from login and ensure there is no redirect loop.

For failures, inspect the browser `Location` chain and Authentik event logs first. Common causes are callback mismatch, wrong issuer mode, missing signing key, Google source not attached to Identification, stale Authentik/Google sessions, incorrect client type, or an invalidation flow that restarts login.

## Completion report

Return a redacted integration contract containing the topology, app/provider slug, issuer, discovery URL, callback URI, scopes, authorization policy, health result, and end-to-end test result. State where the secret was stored without printing it. List any manual console step that remains.

## Security rules

- Use HTTPS for every non-localhost callback.
- Use Authorization Code with PKCE, state, and nonce.
- Keep redirect URI matching exact and callback return paths same-origin.
- Keep client secrets, codes, raw tokens, and refresh tokens out of logs and browser storage.
- Use a signing key and validate tokens through the discovered JWKS.
- Request minimal scopes and keep Google data authorization separate from login.
- Isolate app-specific fixes; do not weaken global Authentik safety controls.
