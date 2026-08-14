# Platform bridge reference

Use this reference when a platform, rather than the application itself, is the OIDC relying party.

## Supabase Auth custom OIDC

Choose this topology when the app already relies on Supabase Auth sessions, `auth.users`, JWTs, or Row Level Security:

```text
App -> Supabase Auth -> Authentik -> Google
```

Supabase Auth remains the session issuer. Authentik proves the identity; it does not replace the Supabase JWT or RLS model.

1. In Supabase Dashboard, open **Authentication > Sign In / Providers > Custom Providers** and create an auto-discovery OIDC provider.
2. Copy the read-only Callback URL shown by Supabase. Do not construct it from memory; custom domains can change it.
3. Create a confidential Authentik provider whose Redirect URI is exactly that Supabase callback.
4. In Supabase, configure:
   - identifier such as `custom:authentik`;
   - issuer `https://auth.shawnup.com/application/o/{app_slug}/`;
   - Authentik client ID and client secret;
   - scopes `openid`, `profile`, and `email`;
   - PKCE enabled.
5. Start login with the normal Supabase client:

```ts
await supabase.auth.signInWithOAuth({
  provider: "custom:authentik",
  options: { redirectTo: `${location.origin}/auth/callback` },
});
```

The browser first returns to Supabase's provider callback, then to the app's allowed `redirectTo`. Register both at their proper layer. Do not put the Authentik client secret in frontend code or use the Authentik callback directly as `redirectTo`.

After login, verify a Supabase session exists and RLS sees the expected `auth.uid()`. Decide how account linking should behave if the same email previously used Supabase's built-in Google provider; do not assume identical email automatically means identical identity.

Official reference: [Supabase Custom OAuth/OIDC Providers](https://supabase.com/docs/guides/auth/custom-oauth-providers)

## Cloudflare Access generic OIDC

Choose this topology when Cloudflare Access should gate an HTTP application at the edge:

```text
Browser -> Cloudflare Access -> Authentik -> Google -> protected origin
```

1. Find the Access team name in Cloudflare Zero Trust.
2. Create a confidential Authentik provider with this exact callback:

```text
https://{team_name}.cloudflareaccess.com/cdn-cgi/access/callback
```

3. In **Zero Trust > Integrations > Identity providers**, add a generic OpenID Connect IdP using values from Authentik discovery:
   - Client ID and secret from the per-service Authentik provider;
   - Auth URL = discovery `authorization_endpoint`;
   - Token URL = discovery `token_endpoint`;
   - Certificate URL = discovery `jwks_uri`;
   - scopes `openid`, `email`, and `profile`;
   - PKCE enabled when supported by the selected setup.
4. Create or update the Access application and attach an explicit Allow policy. Access applications deny by default until a policy allows the user.

Cloudflare Access authenticates access to the origin; it does not automatically create a session inside the application and does not replace Supabase Auth/RLS. If the app needs user identity, validate the Cloudflare Access JWT at the origin or retain the app's own auth layer.

Official reference: [Cloudflare Access generic OIDC](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/generic-oidc/)

## Auth proxy fallback

For a service with no OIDC support, choose Authentik Proxy Provider/outpost or Cloudflare Access instead of writing an ad hoc OAuth callback. Verify WebSocket, API, and machine-client behavior before placing a proxy in front of the whole hostname.
