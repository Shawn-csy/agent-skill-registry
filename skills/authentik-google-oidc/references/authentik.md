# Authentik administration reference

Use this reference when creating or repairing the Authentik side of the brokered login.

## Google Cloud OAuth client

In Google Cloud, configure the OAuth consent screen and create a Web application client. Add this exact authorized redirect URI:

`https://{auth_host}/source/oauth/callback/{google_source_slug}/`

The source slug in Authentik must match the last path segment. Keep this client dedicated to Authentik's upstream login source. Do not use the application's OIDC callback here.

Use `openid`, `email`, and `profile` for the identity source. Add more scopes only when an Authentik source mapping or policy needs them.

## Google OAuth source

In Authentik Admin, open Directory ??Federation and Social login ??New Source and select Google OAuth Source. Set:

- Name: a user-facing label such as `Google`.
- Slug: `{google_source_slug}`.
- Consumer Key: the Google client ID.
- Consumer Secret: the Google client secret.
- Additional scopes: only the minimum identity scopes required.

Choose authentication and enrollment flows appropriate to the application. If usernames must be derived automatically, use a documented property mapping or enrollment policy; do not make every user invent a second application-specific name merely to complete Google sign-in.

## Application and OIDC provider

Create the application and OAuth2/OIDC provider together when possible. Configure:

- Application slug: `{app_slug}`.
- Redirect URI: `{app_callback}` with exact matching.
- Client type: public when the app cannot protect a secret; confidential when a backend can protect it.
- Authorization code flow with PKCE.
- Authentication flow: the app's dedicated Google-only flow.
- Authorization flow: the provider authorization flow, with only the policies the app requires.
- Invalidation flow: a logout/invalidation flow that terminates the provider session without redirecting back into the same login entry point.

The issuer and discovery URL are:

```text
Issuer:    https://{auth_host}/application/o/{app_slug}/
Discovery: https://{auth_host}/application/o/{app_slug}/.well-known/openid-configuration
```

The app should consume discovery instead of hard-coding endpoint paths. The standard Authentik provider endpoints include authorization, token, userinfo, revoke, and JWKS endpoints under `/application/o/`.

## Google-only authentication flow

Create a dedicated Authentication flow instead of modifying Authentik's global default flow. A minimal source-only flow is:

1. Identification stage with no user fields.
2. Google source selected in the Identification stage.
3. No password stage and no passwordless/recovery/enrollment links unless explicitly required.
4. Any required policy or MFA stage.
5. User Login stage at the end.

When only one source is selected and no user fields are present, Authentik can redirect directly to that source. The exact behavior depends on the flow and Authentik version, so verify it with a private browser session.

Do not add a User Login stage to the Google source's own flow when embedding it via a Source stage. The parent flow must resume after the source returns.

If local password sign-in must be impossible for ordinary users, inspect all of these locations:

- Identification stage `password_stage` setting.
- Separately bound Password stage.
- Enrollment and recovery flow links.
- Other sources enabled on the application flow.
- Application bindings that expose a different default flow.

Do not delete administrators' recovery access without an out-of-band admin recovery plan.

## Account selection and stale sessions

The account chooser is a Google behavior. Verify the request reaching `accounts.google.com` includes:

`prompt=select_account`

Passing `prompt=select_account` only to the app's Authentik authorize URL may not be sufficient if the selected Authentik flow does not forward it. Use a dedicated flow or supported customization that preserves the parameter, then verify in browser network logs.

If a stale upstream provider session prevents account selection, use a bounded invalidation step before starting authentication. The invalidation route must have a clear terminal redirect. Guard the normal login path so it does not invalidate and restart itself forever; a `skip_logout`/one-shot state flag is one possible pattern.

Do not solve a loop by blindly clearing every cookie or repeatedly redirecting between the app, Authentik, and Google. Inspect the `Location` chain and the flow event log to find which endpoint points back to the entry point.

## Official references

- [Google Cloud OAuth with Authentik](https://docs.goauthentik.io/users-sources/sources/social-logins/google/cloud/)
- [Authentik OAuth2 provider](https://docs.goauthentik.io/add-secure-apps/providers/oauth2/)
- [Create an OAuth2 provider](https://docs.goauthentik.io/add-secure-apps/providers/oauth2/create-oauth2-provider)
- [Identification stage](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/identification/)
- [Source stage](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/source/)

