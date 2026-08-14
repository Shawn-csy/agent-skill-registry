# Per-user Google Drive and Sheets access

Use this reference when a logged-in user should choose a Google Sheet and Drive folder for application data. This is a second OAuth flow, separate from Authentik login.

## Google Cloud setup

Create a Web OAuth client for the application data integration. Register:

`https://{app_host}/api/integrations/google-drive/callback`

Enable only the APIs required by the product, commonly Google Drive API, Google Sheets API, and Google Picker API. Keep the client secret on the server.

Prefer the narrowest feasible scope, for example:

```text
openid email https://www.googleapis.com/auth/drive.file
```

Add broader Sheets or Drive scopes only when the product cannot work with user-selected files. Explain the consent purpose in the UI.

## Connect route

Require an existing application session before starting this flow. Generate a separate high-entropy state value, store it in a short-lived Secure, HttpOnly, SameSite=Lax cookie, and redirect to Google's OAuth endpoint with:

```text
response_type=code
access_type=offline
include_granted_scopes=true
prompt=consent select_account
state={state}
```

Include the exact client ID, callback URI, and scopes. `prompt=consent` helps obtain a refresh token on the first connection; do not assume Google returns a refresh token on every reconnect.

## Callback and token storage

On callback:

1. Require the logged-in application user.
2. Validate state, code, and provider error.
3. Exchange the code server-side.
4. If no new refresh token is returned, retain the existing valid refresh token only after verifying that this is an intentional reconnect.
5. Fetch the Google account email for display and audit purposes.
6. Encrypt the refresh token with an authenticated cipher such as AES-256-GCM using a separately managed key.
7. Store the encrypted token, scopes, Google email, user ID, and timestamps in a per-user record.
8. Clear the state cookie and redirect to a safe settings page.

Never return a refresh token to the browser. Access tokens should be short-lived and used only by server routes. Refresh them just before Drive/Sheets work and handle revocation by asking the user to reconnect.

## Resource selection

Use Google Picker or a server-side resource picker. Return only non-secret public configuration to the browser, such as Picker developer key, project number/app ID, and a short-lived access token if the chosen Picker integration requires it.

When the user selects a resource, send its ID to the server and verify it using the refreshed access token:

- Sheet: `application/vnd.google-apps.spreadsheet`.
- Folder: `application/vnd.google-apps.folder`.

Persist the selected resource ID, display name, and URL per user. Do not trust a client-supplied name or MIME type as authorization.

Provide server actions for creating an empty Sheet and a Drive folder. Set the created resource as the user's selection only after the Google API confirms creation.

## Save path

When saving application data:

1. Require an application session.
2. Load the user's encrypted Drive settings.
3. Refresh the Google access token server-side.
4. Upload media to the selected folder, if configured.
5. Append structured values to the selected Sheet, if configured.
6. Save a local/database record regardless of optional Google sync failure when product requirements allow it.
7. Return user-readable status and omit provider internals from the response.

If no Sheet or folder is selected, show a clear setup prompt before capture/save. If one destination is missing, tell the user exactly which destination was skipped.

## Disconnect and recovery

When disconnecting, revoke the stored Google credential when possible, delete the per-user connection and selected resource IDs, and clear cached access tokens. Preserve local application data unless the user explicitly requests deletion.

Test expired access tokens, revoked consent, a missing refresh token, deleted Sheet/folder, insufficient scope, and a user with multiple Google accounts.

## Official references

- [Google OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Drive API files](https://developers.google.com/drive/api/reference/rest/v3/files)
- [Google Sheets API values append](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append)

