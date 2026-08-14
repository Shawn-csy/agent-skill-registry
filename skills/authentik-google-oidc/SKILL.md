---
name: authentik-google-oidc
description: Configure and troubleshoot a reusable Authentik-as-OIDC-broker login flow backed by Google, including Google account selection, Google-only authentication, PKCE/state/nonce validation, application sessions, and optional per-user Google Drive or Google Sheets OAuth. Use when a project needs Authentik OIDC, Google social login, a custom Authentik login flow, password login disabled, account selection, OAuth callbacks, or user-authorized Google storage access.
---

# Authentik + Google OIDC

## Overview

Use Authentik as the application's OIDC provider and Google as Authentik's upstream identity source. Keep application authentication and user-authorized Google data access as two separate OAuth relationships: the first creates the application session, and the second grants Drive/Sheets permissions after login.

Use placeholders throughout the workflow:

- `{auth_host}`: the Authentik public hostname.
- `{app_host}`: the application's public hostname.
- `{app_slug}`: the Authentik application/provider slug.
- `{google_source_slug}`: the Authentik Google source slug.
- `{app_callback}`: the application's OIDC callback URL.

## Agent compatibility

Keep the workflow vendor-neutral: use the agent's available filesystem, shell, HTTP, browser, and GitHub tools rather than assuming a specific connector. The same Skill is compatible with Codex, Claude Code, Gemini CLI, and custom agent installations.

- Codex: invoke `$authentik-google-oidc` when the task matches, then use available browser or GitHub connectors for interactive administration.
- Claude Code or Gemini CLI: load `SKILL.md` and the relevant reference files directly; use the local shell and the agent's browser/API tools for the same steps.
- Custom targets: provide a project directory, a safe shell, HTTPS access to the configured Authentik/Google endpoints, and a way to inspect browser redirects when account selection or flow loops are involved.

Do not assume that one agent's browser connector, environment variable convention, or secret manager exists in another agent. Keep provider values in the target project's configuration and adapt only the integration layer.

## Workflow

### 1. Inspect the project and choose the client type

Determine whether the application has a backend that can exchange codes and keep cookies/secrets. Prefer an Authorization Code flow with PKCE for both public and confidential clients. Never use the Implicit flow for a new browser application.

Before changing a live Authentik instance, collect the application host, callback URL, Authentik host, desired application slug, allowed users/groups, and whether the app needs Drive/Sheets access. Never ask the user to paste a client secret into source control or chat.

Read the relevant reference before implementation:

- Authentik admin configuration: [references/authentik.md](references/authentik.md)
- Application OIDC implementation: [references/app-oidc.md](references/app-oidc.md)
- Per-user Google Drive/Sheets access: [references/google-data-access.md](references/google-data-access.md)

### 2. Configure Google as Authentik's upstream source

Create a Google OAuth Web client whose callback is exactly:

`https://{auth_host}/source/oauth/callback/{google_source_slug}/`

Create a Google OAuth source in Authentik with the same source slug and its Google client ID/secret. Use the source's Google-specific implementation where available. Request only the identity scopes needed for login (`openid`, `email`, `profile`) unless there is a documented reason to request more.

### 3. Create the Authentik application/provider

Create one OAuth2/OIDC provider and application for the app. Use the app callback exactly as registered, choose the Authorization Code flow with PKCE, and record the client ID, client secret only when the client is confidential, and issuer URL:

`https://{auth_host}/application/o/{app_slug}/`

The discovery document should be:

`https://{auth_host}/application/o/{app_slug}/.well-known/openid-configuration`

Use the provider's configured authentication and authorization flows. Keep invalidation/logout separate from the authentication entry flow.

### 4. Make the login Google-only when requested

Use a dedicated authentication flow for the app. Configure an Identification stage as source-only:

- select the Google source;
- leave user fields empty when the source is the sole entry point;
- do not attach a Password stage or set `password_stage` on Identification;
- remove password enrollment/recovery links if local passwords must not be used;
- end the flow with the required User Login stage.

If a Source stage is used to embed Google inside another flow, do not add a User Login stage to the source's own flow; let the original flow resume. For a pure Google sign-in, a source-only Identification stage or direct source flow is simpler.

Do not claim that the account picker works merely because Authentik shows a Google button. Verify the final browser request to Google contains `prompt=select_account`. If Authentik does not forward that parameter in the chosen flow/version, use a dedicated flow or supported customization that does, and test it in an incognito window.

### 5. Implement the application callback

Implement the protocol in [references/app-oidc.md](references/app-oidc.md). The minimum secure sequence is:

1. Generate state, nonce, and a high-entropy PKCE verifier.
2. Store transient values in Secure, HttpOnly, SameSite=Lax cookies.
3. Redirect to Authentik's discovered authorization endpoint with `openid profile email`, state, nonce, and the S256 code challenge.
4. On callback, require a matching state and one-time code.
5. Exchange the code at the discovered token endpoint, using the secret only on the server when applicable.
6. Validate the ID token signature through the discovered JWKS, issuer, audience, nonce, expiry, and required claims.
7. Upsert the user by stable OIDC `sub`, not by email alone, then issue an opaque application session cookie.
8. Clear transient cookies and accept only a same-origin relative return path.

Do not put Google access tokens, Authentik client secrets, refresh tokens, or raw ID tokens in browser storage, URLs, logs, or database columns without an explicit protection design.

### 6. Add optional Drive/Sheets authorization after login

Treat Drive/Sheets as a second Google OAuth consent flow. Do not reuse the Authentik login token as a Google Drive token. Use the workflow in [references/google-data-access.md](references/google-data-access.md), including a separate state cookie, `access_type=offline`, account selection, server-side token refresh, encrypted refresh-token storage, and per-user selected Sheet/folder IDs.

Gate capture or save features when a user has not selected a storage location. Provide create-new-Sheet and create-new-folder actions only after Drive is connected, and validate selected MIME types server-side.

### 7. Validate end to end

Test each boundary independently:

- Authentik discovery returns the expected issuer, authorization endpoint, token endpoint, and JWKS URI.
- Google redirects to the Authentik source callback, not directly to the app.
- Authentik redirects to the exact app callback with a code and state.
- A second Google account is selectable and the selected identity reaches the app.
- A wrong state, nonce, issuer, audience, or redirect URI is rejected.
- A user cannot reach a password form when Google-only mode is enabled.
- Logout/invalidation returns to a stable entry point and does not redirect in a loop.
- Drive/Sheets consent is separate, refresh tokens survive access-token expiry, and only the selected resources are written.
- The app behaves in mobile browsers and opens an external browser from embedded browsers such as LINE when required.

For symptoms, inspect the browser network trace and Authentik event logs first. A callback URL mismatch, stale Authentik session, missing User Login stage, password stage binding, source slug mismatch, or an invalidation flow that points back to login are more likely than an application rendering bug.

## Non-negotiable security rules

- Use HTTPS for every non-localhost redirect URI.
- Match redirect URIs exactly, including path, trailing slash, scheme, and port.
- Use PKCE S256, state, and nonce; rotate or expire transient cookies quickly.
- Key application users by `(issuer, sub)` or an equivalent stable provider identity.
- Keep Google Drive refresh tokens encrypted with an authenticated cipher and a separately managed key.
- Request the smallest Google scopes that satisfy the feature.
- Redact authorization codes and tokens from logs and error responses.
- Do not disable Authentik's safety controls globally to fix one application's loop; isolate changes to the app's provider/flows.

## References

- [Authentik admin flow and source configuration](references/authentik.md)
- [Application OIDC protocol contract](references/app-oidc.md)
- [Google Drive/Sheets OAuth contract](references/google-data-access.md)

