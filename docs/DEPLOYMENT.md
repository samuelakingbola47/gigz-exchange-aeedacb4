# Gigz Exchange — Deployment Outside Lovable

The app is a standard TanStack Start (Vite + React 19) project. The backend is a hosted PostgreSQL + Auth project, reachable over HTTPS from anywhere, so you can host the frontend wherever you like while keeping the existing backend configuration.

## 1. Get the code

```bash
git clone <your-github-repo>
cd gigz-exchange
bun install    # or npm install
```

## 2. Configure environment

Create `.env` locally / set the same names in your host's dashboard. See `docs/ENVIRONMENT_VARIABLES.md`.

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_PROJECT_ID=...
```

These point at the **existing** backend, so all data, users and policies come along unchanged.

## 3. Run and build

```bash
bun run dev      # http://localhost:8080
bun run build    # production build
bun run preview  # verify the production build locally
```

Always test the production build before shipping: dev runs on Node, production runs on an edge/worker runtime with stricter constraints.

## 4. Hosting targets

- **Cloudflare Workers/Pages** — the template's default target. Deploy the build output with Wrangler; keep `nodejs_compat` on. Do not add `ssr.external` in `vite.config.ts`; everything must be bundled.
- **Netlify / Vercel** — supported through their TanStack Start / Nitro presets. Set the env vars in the project settings.
- **Node server / container** — run the Nitro Node output behind a reverse proxy with TLS.

Constraints that carry over to any host: no `child_process`, `sharp`, `canvas`, or native-addon packages in server code; prefer fetch-based, edge-compatible libraries.

## 5. Backend configuration

If you keep the current backend, nothing to do. If you migrate to your own Supabase project:

1. Create the project, then apply `supabase/migrations/*.sql` in filename order (`supabase db push` or psql). This recreates tables, enums, grants, RLS policies, triggers and the RPCs.
2. Regenerate `src/integrations/supabase/types.ts` from the new project.
3. Auth settings to match: email/password enabled, **email confirmation on**, auto-confirm off, anonymous sign-ups off, Google provider configured if used.
4. Set **Site URL** and **Redirect URLs** to your production origin plus `/reset-password`, otherwise password reset and OTP links break.
5. Optionally seed `services` and `countries`.

## 6. Domain, email and post-deploy checks

- Point your custom domain at the host and enforce HTTPS.
- Verify a sending domain before enabling branded OTP/transactional email.
- Smoke test in production: register → 6-digit OTP → dashboard → wallet shows ₦0 → demo purchase → cancel/refund → logout; then confirm a non-admin is redirected away from `/admin`.
- Watch server logs on first traffic; check the database linter after any schema change.
