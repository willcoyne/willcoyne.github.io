willcoyne.us
============

- `/` is a walkable 3D room (React Three Fiber). WASD to walk, mouse to look, click the walls to open the
  resume, projects, and links. Touch devices get drag-to-look and a joystick. Source: `src/room/`.
- `/classic/` is the previous terminal-style page, kept as a backup. Browsers without WebGL are sent there.
- `/coyne-ai/` is Coyne AI (below).

To add a project or change a link, edit `src/room/content.js`; the walls and the in-room menu both read from it.
The resume on the wall is rendered from `public/William-Coyne-Resume.pdf`, so replacing that file updates it.

Coyne AI
========

Coyne AI is a dark-mode advice portal where visitors can ask a living AI for help with problems, plans, or creative ideas. The site is built as a static React frontend that sends submissions to William for personal response.

How it works
------------

- Visitors enter their name, email, and question.
- They can choose free advice or paid priority handling.
- The form is submitted from the frontend and delivered using the configured email/form provider.

Key features
------------

- Futuristic dark theme with a polished, modern interface.
- Simple question submission workflow.
- Priority option for faster review.
- No server required if Formspree is used.

Local development
-----------------

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the console.

Production build
----------------

```bash
npm run build
```

This generates the static site in `dist/`.

Deployment
----------

This repo uses GitHub Pages for hosting. The preferred flow is to publish the built static output from the `gh-pages` branch or from a `docs/` folder on `main`.

Formspree support
-----------------

If `VITE_FORMSPREE_ENDPOINT` is set at build time, the app will post form data directly to that endpoint. This avoids the need for a backend server.

Repository contents
-------------------

- `src/` — React application source files.
- `public/` / `index.html` — static HTML shell.
- `package.json` — frontend dependencies and scripts.
- `vite.config.js` — Vite configuration.

Removed backend files
---------------------

The older backend/server implementation and related Docker workflows have been removed to keep this repo frontend-only.
