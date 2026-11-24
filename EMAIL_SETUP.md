# Resend quote email setup

The quote form sends submissions through the Vercel server-side endpoint at
`/api/quote`. Resend sends the email; quote requests are delivered to the
address configured in `QUOTE_REQUEST_TO`.

## Vercel environment variables

In the Vercel project, open **Settings → Environment Variables** and add:

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | An API key created in the Resend dashboard |
| `RESEND_FROM_EMAIL` | `Serenity Lawn Care <ron@serenitylawncare.org>` |
| `QUOTE_REQUEST_TO` | `ron@serenitylawncare.org` |

Add these variables to each environment where you want the form to work
(Production, and optionally Preview/Development), then redeploy.

## Verify the sending domain

Add `serenitylawncare.org` to Resend and publish the DNS records Resend provides.
Wait for the domain to show as verified before sending from it. Keep the
existing Google Workspace MX records so incoming mail continues working. If
Resend requires an SPF record, update the existing SPF record rather than
creating a second one.

Create a Resend API key and enter it directly in Vercel's encrypted environment
variable settings. Do not put the key in source code, commit it, or send it in
chat.

After redeployment, submit a test quote and confirm it arrives at
`ron@serenitylawncare.org`. Replies to a request with an email address will be
addressed to the customer. Once Resend delivery is confirmed, remove the old
`GOOGLE_WORKSPACE_EMAIL` and `GOOGLE_WORKSPACE_APP_PASSWORD` variables from
Vercel; Google Workspace can remain the receiving mailbox.
