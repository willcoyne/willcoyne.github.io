# Deployment guide

This repository contains a Vite + React frontend and a Node.js + MySQL backend. Below are automatic deployment workflows and manual steps.

## GitHub Actions included

- `.github/workflows/pages.yml` — builds the frontend and deploys the `dist` output to GitHub Pages when you push to `main`.
- `.github/workflows/backend.yml` — builds the backend Docker image from `server/` and pushes it to GitHub Container Registry (GHCR) as `willcoyne-server:latest` when you push to `main`.

## Required repository settings and secrets

1. Branch: Ensure your main branch is named `main` (or update the workflows).
2. Secrets / Permissions:
   - For Pages: the workflow uses the built-in `GITHUB_TOKEN` and requires the repository to allow GitHub Actions to create Pages deployments (default for repos you own).
   - For GHCR push: the workflow uses `GITHUB_TOKEN` with `packages: write` permission. If you prefer, create a Personal Access Token stored as `CR_PAT` and modify the workflow to use it.

3. Runtime secrets for the backend container (when you run it): set environment variables securely in your hosting provider or when running `docker run`:

   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `ADMIN_API_KEY` (use a strong random value)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
   - `FRONTEND_ORIGIN` (e.g., `https://<your-pages-domain>`)

## How Pages deployment works

When you push to `main`, the Pages workflow will:

- Install Node, run `npm ci`, and `npm run build`.
- Upload the `dist` folder as an artifact and deploy it to GitHub Pages.

You can configure a custom domain by adding a `CNAME` file at the repository root (already present) and configuring DNS records as described in GitHub Pages docs.

## Using Formspree (no backend)

If you prefer not to run a backend, you can use Formspree to receive form submissions via email.

1. Sign up at https://formspree.io and create a new form. They will provide you with an endpoint URL such as `https://formspree.io/f/yourformid`.
2. In your repository, add a GitHub Actions repository `secret` named `FORMSPREE_ENDPOINT` with that URL.
3. The Pages workflow will inject `VITE_FORMSPREE_ENDPOINT` at build time so the frontend will post directly to Formspree.

Local dev: create a `.env` file in the project root with:

```
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/yourformid
```

The frontend detects `VITE_FORMSPREE_ENDPOINT` and uses it automatically. If the variable is not set, the site falls back to the self-hosted backend at `/api/submit`.

## How to use the backend image

The backend image is published to GHCR at `ghcr.io/<owner>/willcoyne-server:latest`.

Example to run locally with Docker Compose (server and DB): see `server/docker-compose.yml` — copy and set secure passwords before running.

## Notes and next steps

- You still need to provide real SMTP credentials and production DB credentials as described above.
- Consider securing admin UI (don’t embed `ADMIN_API_KEY` in public pages) and using a proper payment verification flow for paid submissions.
