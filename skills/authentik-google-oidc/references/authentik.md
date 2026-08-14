# Authentik administration reference

Use this reference when creating or repairing the Authentik side of the brokered login.

## Existing upstream Google source

The Shawnup instance already has Google source `google`. Its Google Cloud Web OAuth callback is:

`https://auth.shawnup.com/source/oauth/callback/google/`

Do not create or rotate this shared client during ordinary service onboarding. When troubleshooting it, open **Directory > Federation and Social login** and verify that source `google` requests only the identity scopes needed for login.

Attach the source to the Identification stage used by the login flow. Promoting a source does not by itself guarantee that every authentication flow presents it. When the login page only asks for email, inspect the selected Identification stage and its source list.

Do not recreate or edit this shared Google client when adding an ordinary downstream service. The downstream callback belongs on its Authentik OAuth2/OIDC provider, not in Google Cloud.

## Per-service application/provider

Prefer **Applications > Applications > New Provider**, which creates the application/provider pair together. Configure:

- one unique slug and provider per service/environment;
- the exact downstream callback URI;
- confidential client for a trusted backend/platform and public client only when no secret can be protected;
- Authorization Code with PKCE;
- a signing key/certificate for asymmetrically signed JWTs and a usable JWKS;
- `openid`, `profile`, and `email` scope mappings;
- per-provider issuer mode;
- only required custom claims.

Default endpoints:

```text
Authorization: https://auth.shawnup.com/application/o/authorize/
Token:         https://auth.shawnup.com/application/o/token/
User info:     https://auth.shawnup.com/application/o/userinfo/
Issuer:        https://auth.shawnup.com/application/o/{app_slug}/
JWKS:          https://auth.shawnup.com/application/o/{app_slug}/jwks/
Discovery:     https://auth.shawnup.com/application/o/{app_slug}/.well-known/openid-configuration
End session:   https://auth.shawnup.com/application/o/{app_slug}/end-session/
```

Consume discovery whenever the downstream supports it. Authentik's authorization/token/userinfo endpoints are global, while issuer, JWKS, discovery, and end-session URLs contain the application slug.

Do not leave Redirect URIs empty to let Authentik learn the first launch URL. Prefer exact entries. If regex is unavoidable, anchor it and escape dots.

## Authentication flow choices

Reuse the normal authentication flow when its Google option and fallback behavior are acceptable. Create a dedicated app flow only when the app needs different behavior such as Google-only login or MFA.

For Google-only login:

1. Bind an Identification stage with the Google source selected.
2. Leave user fields empty if Google is the only entry point.
3. Do not bind a Password stage or password recovery/enrollment links.
4. End the parent authentication flow with the required User Login stage.

When embedding the source through a Source stage, do not add User Login to the source's own flow; let the parent flow resume. Verify behavior in a private browser because an existing Authentik or Google session can hide the source picker.

Keep a separate local administrator recovery path. Do not remove all local login options globally merely to make one app Google-only.

## Users and authorization

Google-source users do not need a local password. External users can authenticate to applications but cannot use the Authentik user dashboard; internal users can. Superuser access is unrelated to OIDC sign-in and must be granted only on explicit request.

Use application bindings/policies for access control. Decide explicitly whether all eligible users may access the app or only selected groups/users. Map groups or custom roles only when the downstream actually enforces them.

Since Authentik 2025.10, the built-in email scope can report `email_verified: false`. If a downstream refuses the login, verify the real upstream assurance and create a deliberate custom mapping rather than blindly asserting every email is verified.

## Account selection and sessions

Google controls the account chooser. Verify the request reaching Google contains `prompt=select_account` when account selection is a requirement. Passing the parameter to Authentik does not guarantee the chosen Authentik version/flow forwards it upstream.

Diagnose loops by recording the `Location` chain and Authentik events. Avoid repeatedly clearing every cookie or routing invalidation back into the same login entry point.

## Official references

- [Authentik OAuth2/OIDC provider](https://docs.goauthentik.io/add-secure-apps/providers/oauth2/)
- [Create an OAuth2 provider](https://docs.goauthentik.io/add-secure-apps/providers/oauth2/create-oauth2-provider)
- [Google identity provider](https://docs.goauthentik.io/users-sources/sources/social-logins/google/)
- [Identification stage](https://docs.goauthentik.io/add-secure-apps/flows-stages/stages/identification/)
