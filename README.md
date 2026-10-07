# B-Line Microhub Planner

## Shared-password access

Set `NITRO_PLANNER_PASSWORD` as a private server environment variable in your deployment settings (use a long, unique password). Never use a `VITE_` prefix or commit the password. The planner stays locked if this setting is missing. Redeploy after changing deployment secrets. Local preview also requires this private environment setting and a server restart after changing it.

Deploy with the Nitro server output, not as a static-only site. Use HTTPS in production. Sessions are signed, HttpOnly cookies that expire after 8 hours; changing the password invalidates existing sessions. Sign out clears the browser's session cookie, not its saved workspace.

This is shared-password app access, not individual accounts or encrypted local storage. Browser assets, bundled reference data, and files under `public/` remain public. Use hosting-level access protection if those must also be private. Login attempt throttling is per server instance; use hosting-level rate limiting for distributed deployments.
