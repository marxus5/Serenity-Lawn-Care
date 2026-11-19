# Google Workspace quote email setup

The quote form sends submissions through the Vercel server-side endpoint at
`/api/quote`. The Workspace password is never included in the website files.

## Vercel environment variables

In the Vercel project, open **Settings → Environment Variables** and add:

| Name | Value |
| --- | --- |
| `GOOGLE_WORKSPACE_EMAIL` | `ron@serenitylawncare.org` |
| `GOOGLE_WORKSPACE_APP_PASSWORD` | An app password created for that Workspace account |
| `QUOTE_REQUEST_TO` | `ron@serenitylawncare.org` |

Add these variables to each environment where you want the form to work
(Production, and optionally Preview/Development), then redeploy.

## Create the app password

Sign in to the Google Workspace account, enable 2-Step Verification if it is
not already enabled, and create an app password for this site. App passwords
may be unavailable if your Workspace administrator disables them or the account
uses security keys or other restricted sign-in policies. Do not put the app
password in source code, commit it, or send it in chat; enter it only in
Vercel's encrypted environment-variable settings.

The endpoint connects to Google's SMTP server at `smtp.gmail.com` using TLS on
port 465. After redeployment, submit a test quote and confirm it arrives at
`ron@serenitylawncare.org`. Replies to a request with an email address will be
addressed to the customer.
