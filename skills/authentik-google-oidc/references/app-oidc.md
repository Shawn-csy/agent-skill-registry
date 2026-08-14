# Application OIDC implementation reference

Use this reference when implementing the application-side login against Authentik.

## Configuration contract

Use environment variables or the framework's secret manager. A portable configuration looks like:

```text
AUTHENTIK_ISSUER=https://{auth_host}/application/o/{app_slug}/
AUTHENTIK_CLIENT_ID=...
AUTHENTIK_CLIENT_SECRET=...       # confidential backend only
AUTHENTIK_REDIRECT_URI=https://{app_host}/api/auth/callback
NEXT_PUBLIC_SITE_URL=https://{app_host}
```

Keep client secrets server-only. Never prefix them with a public-client environment variable convention.

## Login route

The login route should:

1. Fetch and cache the issuer's OIDC discovery document for a short period.
2. Generate an unpredictable state, nonce, and PKCE verifier.
3. Encode only a validated same-origin relative return path in state, or store it server-side.
4. Set short-lived Secure, HttpOnly, SameSite=Lax cookies for state, nonce, and verifier.
5. Redirect to the discovered authorization endpoint with:

```text
client_id={client_id}
response_type=code
redirect_uri={exact_callback}
scope=openid profile email
state={state}
nonce={nonce}
code_challenge={base64url(sha256(verifier))}
code_challenge_method=S256
```

If the application needs the Google account picker, first make sure the Authentik flow forwards `prompt=select_account` to Google. Do not assume a parameter added at the wrong hop will reach the upstream provider.

## Callback route

Reject the callback unless all of these are true:

- `code` is present and no OAuth error was returned.
- The state equals the one in the transient cookie.
- The verifier and nonce are present and still within their short lifetime.
- The code exchange uses the exact registered redirect URI.
- The ID token signature validates against the discovered JWKS.
- `iss` equals the configured issuer.
- `aud` contains the configured client ID.
- `nonce` equals the generated nonce.
- `exp` and other time claims are valid.
- `sub` and a usable email claim are present.

Exchange the code at the discovered token endpoint. For a confidential client, authenticate the server-side request with the client secret. For a public client, send the client ID and rely on PKCE. Do not expose token exchange errors containing codes or tokens to the browser.

## User and session model

Use a stable key such as `(issuer, sub)` for the local user record. Email can change and must not be the sole identity key. Store display name, email, and avatar as profile attributes that can be refreshed on login.

After validation:

1. Upsert the local user.
2. Create a random opaque session token.
3. Store only a hash of that token server-side, with user ID and expiry.
4. Set the raw token in a Secure, HttpOnly, SameSite=Lax cookie.
5. Clear state, nonce, and verifier cookies.
6. Redirect to a validated local return path.

Use an explicit logout route that deletes the local session and expires the session cookie. If using Authentik end-session, provide a safe post-logout return URI and test it separately from login.

## Common framework mapping

For a server-rendered app, keep all OAuth code in server routes/actions and protect pages/API routes by resolving the session cookie. For a SPA, use a vetted OIDC client library and avoid hand-rolling token storage; if a backend exists, prefer the backend-for-frontend pattern.

Do not put ID tokens or access tokens in `localStorage`, query parameters, HTML, analytics payloads, or error telemetry. Do not accept a `return_to` value that starts with `//`, an absolute URL, or a different origin.

## Minimal verification tests

Test these cases before release:

- Fresh login succeeds.
- A second Google account can be chosen.
- Refreshing an authenticated page reuses the session without restarting OIDC.
- Missing, altered, or replayed state is rejected.
- Altered nonce, wrong issuer, wrong audience, expired token, and invalid signature are rejected.
- An unregistered callback URI fails safely.
- Logout expires the app session.
- Login failure does not leave a reusable code or transient cookie behind.

