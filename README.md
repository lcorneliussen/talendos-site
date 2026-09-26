# talendos-site

Static website for Talendos GmbH, built with [Astro](https://astro.build/) for deployment to Cloudflare Pages. The only dynamic route is the contact endpoint in `functions/api/contact.ts`.

## Development

```bash
npm install
npm run dev
```

To run the generated site together with the Cloudflare Pages Function:

```bash
npm run build
cp .env.example .dev.vars
npm run preview
```

The example environment uses Cloudflare’s published Turnstile test keys. End-to-end email delivery still requires a configured Cloudflare Email Service binding.

## Cloudflare Pages

- Production branch: `main`
- Build command: `npm run build`
- Build output: `dist`
- Node.js: current LTS release

### One-time setup

1. Connect this repository to a Cloudflare Pages project.
2. Add `talendos.com` as the custom domain when the migration is ready.
3. Create a Turnstile widget for the production and preview hostnames.
4. Set `PUBLIC_TURNSTILE_SITE_KEY` as a build variable.
5. Set `TURNSTILE_SECRET_KEY` as an encrypted Function secret.
6. Onboard Cloudflare Email Service for `talendos.com` and verify `info@talendos.com` as the destination.
7. Confirm the `EMAIL` send binding from `wrangler.jsonc`.

`CONTACT_TO` and `CONTACT_FROM` default to `info@talendos.com` and `website@talendos.com`.

## Before launch

- Confirm all company and contact details.
- Obtain legal review of the site notice and privacy policy.
- Verify the final Cloudflare data-processing configuration against the privacy policy.
- Test Turnstile and one real email delivery in a Cloudflare preview deployment.
- Inventory any additional WordPress URLs before switching DNS and add redirects for them.

## Content source

The company description, contact details and legal identifiers were migrated from the public WordPress site on 26 September 2026. The visual system is a new lightweight interpretation of the existing Talendos blue, cube mark and “Emerging Values” identity; it does not depend on WordPress assets or external fonts.
