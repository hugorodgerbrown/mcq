# DSC1 Question Bank

A revision app for the Deer Stalking Certificate (Level 1) written question bank — 283 questions in topic decks, with Multiple-Choice and Flashcard modes.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the `localhost` URL it prints.

To preview the production build locally:

```bash
npm run build
npm run preview
```

## Deploy to Render

This is a static site (Vite build → static files). Two ways to deploy:

### A. Blueprint (recommended — config is in `render.yaml`)

1. Push this folder to a GitHub/GitLab repo.
2. In the Render dashboard: **New → Blueprint**, connect the repo.
3. Render reads `render.yaml` and configures everything. Click **Apply**.

### B. Manual static-site setup

1. Push this folder to a GitHub/GitLab repo.
2. Render dashboard: **New → Static Site**, connect the repo.
3. Set:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add a rewrite rule so the SPA doesn't 404 on refresh:
   - **Redirects/Rewrites** tab → Source `/*`, Destination `/index.html`, Action **Rewrite**.
5. **Create Static Site.**

Either way, Render auto-deploys on every push to the connected branch. Free tier is fine for this — it's served over Render's global CDN.

## Notes

- No backend, no database, no environment variables. All 283 questions are bundled into the JS.
- Progress/score is in-memory only (resets on reload). If you ever want scores to persist, that would need `localStorage` (works fine once hosted — it's only disabled inside Claude Artifacts).
