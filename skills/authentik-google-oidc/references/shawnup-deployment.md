# Shawnup Authentik deployment

Use these non-secret defaults only for the Authentik instance maintained in `/Users/shanti/Desktop/auth`.

```text
Public host:     https://auth.shawnup.com
Google source:   google
Ready endpoint:  https://auth.shawnup.com/-/health/ready/
Live endpoint:   https://auth.shawnup.com/-/health/live/
Tunnel origin:   http://localhost:9000
Compose path:    /Users/shanti/Desktop/auth/compose.yml
```

The Cloudflare Tunnel terminates public HTTPS and reaches Authentik on Mac port 9000. Do not expose Authentik's database or Redis directly. Do not add port 9443 merely because upstream examples include it.

The Google source is already configured. Adding a service normally requires only a new Authentik application/OIDC provider and the downstream platform/app configuration. Do not rotate or print the shared Google secret during ordinary service onboarding.

Before changing production state:

1. Check `/-/health/ready/`.
2. Inspect the target service and obtain its exact callback.
3. Create a unique provider slug and secret.
4. Store the secret in the downstream service's secret manager/environment.
5. Validate discovery and complete a private-browser login.

Do not grant Authentik admin/superuser access as part of routine onboarding. Preserve the local break-glass administrator.
