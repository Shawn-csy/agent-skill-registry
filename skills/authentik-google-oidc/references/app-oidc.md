# Direct application OIDC reference

Use this reference only when the application or its trusted auth library owns the OIDC callback and application session. If Supabase Auth or Cloudflare Access owns the callback, use `platform-bridges.md` instead.

## Prefer a maintained library

Use the framework's maintained OIDC/OAuth library and configure it from discovery. Do not hand-roll JWT verification, PKCE, or cookie cryptography when a mature implementation exists.

Typical server-side configuration:

```text
AUTHENTIK_ISSUER=https://auth.shawnup.com/application/o/{app_slug}/
AUTHENTIK_CLIENT_ID=...
AUTHENTIK_CLIENT_SECRET=...       # confidential backend only
AUTHENTIK_REDIRECT_URI=https://{app_host}/api/auth/callback/authentik
APP_URL=https://{app_host}
```

Keep the secret server-only. Never use a public/browser environment-variable prefix for it.

## Authorization request

Use Authorization Code with PKCE S256. Generate high-entropy state, nonce, and PKCE verifier. Store transient values in short-lived Secure, HttpOnly, SameSite=Lax cookies or a server-side transaction store.

Request `openid profile email` and send the exact registered callback. Preserve only a validated same-origin relative return path.

## Callback

Require all of the following:

- no OAuth error and a one-time authorization code;
- state matching the transaction;
- the original PKCE verifier and nonce;
- code exchange using the exact callback;
- signature validation through the discovered JWKS;
- exact issuer and expected audience/client ID;
- matching nonce and valid time claims;
- stable `sub` and required claims.

Key the local identity by `(issuer, sub)`. Treat email, name, and avatar as mutable profile attributes.

After validation, create an opaque application session. Store only a hash of the session token server-side and set the raw token in a Secure, HttpOnly, SameSite=Lax cookie. Clear the OIDC transaction cookies.

Do not store access tokens, ID tokens, refresh tokens, or client secrets in `localStorage`, URLs, HTML, analytics, or unredacted logs. A pure SPA should use a vetted OIDC client with PKCE; prefer a backend-for-frontend when available.

## Logout

Delete the local application session first. Invoke Authentik end-session only when single logout is required, and register/test the post-logout return separately. Local logout, Authentik logout, and Google logout are distinct operations.

## Verification

Test fresh login, repeat login, altered/replayed state, nonce mismatch, wrong issuer/audience, invalid signature, expired token, unregistered callback, local session expiry, and logout. Confirm a second Google account can be selected only when that is an explicit requirement.
