# Deployment guide

This repository hosts the **Coyne AI frontend**: a dark-mode question submission portal that sends advice requests to William.

## Deployment strategy

The preferred deployment path is GitHub Pages. You can publish the built static site from either:

- the `gh-pages` branch, or
- a `docs/` folder on `main`

For this repo, the current recommended path is `gh-pages`.

## Build steps

```bash
npm install
npm run build
```

This generates the production site in `dist/`.

## Formspree / no-backend mode

To avoid a self-hosted backend, use Formspree:

1. Create a new form at `https://formspree.io`.
2. Add a repository secret named `FORMSPREE_ENDPOINT` containing your endpoint URL.
3. The GH Pages build injects `VITE_FORMSPREE_ENDPOINT`, so the app posts directly to Formspree.

For local development, create `.env` with:

```
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/yourformid
```

## Current repo status

- `src/` contains the React frontend.
- `package.json` defines `dev`, `build`, and `preview` scripts.
- The legacy backend files and Docker workflows have been removed from active deployment.

## Pages settings

Make sure GitHub Pages is configured to use:

- Branch: `gh-pages`
- Folder: `/ (root)`

If you want, I can also help you convert this repo to serve from a `docs/` folder on `main` instead.
