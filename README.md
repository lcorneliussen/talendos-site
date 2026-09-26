# talendos-site

Static website for Talendos GmbH, built with [Astro](https://astro.build/) and published through GitHub Pages.

## Development

```bash
npm install
npm run dev
```

Run `npm run build` for a production build. The contact page deliberately uses a simple `mailto:` link and needs no backend or secrets.

## Deployment

- Pull requests: formatting, type and build checks
- `main`: automatic deployment to GitHub Pages through GitHub Actions
- current preview: `https://lcorneliussen.github.io/talendos-site/`

For the later custom domain `talendos.com`:

1. Point DNS to GitHub Pages.
2. Set the custom domain in the repository’s Pages settings.
3. Add `public/CNAME` containing `talendos.com`.
4. Set `site` in `astro.config.mjs` to `https://talendos.com` and remove `base`.

## Before launch

- Confirm all company and contact details.
- Review the legal pages against the actual GitHub Pages configuration.
- Inventory any additional WordPress URLs before switching DNS and add redirect pages for them.

## Content source

The company description, contact details and legal identifiers were migrated from the public WordPress site on 26 September 2026. The visual system is a new lightweight interpretation of the existing Talendos blue, cube mark and “Emerging Values” identity; it does not depend on WordPress assets or external fonts.
