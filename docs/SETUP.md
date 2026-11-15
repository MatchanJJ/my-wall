# Setup and deployment

## Published project

- Production app: https://my-wall-navy.vercel.app
- Public repository: https://github.com/MatchanJJ/my-wall
- Vercel project: `my-wall` in `matchans-projects`, connected to this repository with production branch `main`.
- Framework: Next.js. Runtime: Node.js 24.x. Public Supabase variables are configured for Production, Preview, and Development.
- Posting, refresh persistence, and two-tab Realtime delivery passed on the public production URL.
- Production screenshots: `artifacts/screenshots/my-wall-live-desktop.jpg` and `artifacts/screenshots/my-wall-live-narrow.jpg`.
- Photo uploads are deployed and verified; the current photo screenshot is `artifacts/screenshots/my-wall-photos-live.jpg`.
- The site is personalized as **Mark's Wall**, using Mark's supplied portrait. The current branding screenshot is `artifacts/screenshots/marks-wall-live.jpg`.

Publishing is complete. The setup steps below explain local use and how to reproduce the deployment; do not recreate the existing resources.

## 1. Open the project

In Codex, open this folder:

```text
C:\Users\Mark\Documents\ChatGPT\Next.js Developer Application
```

Install Node.js 24 if needed. In its terminal, run:

```powershell
npm ci
```

## 2. Connect Supabase

This checkout is already connected to the **my-wall** project in **MatchanJJ's Org**, in Singapore. The `posts` table, RLS policies, index, Realtime publication, and `wall-photos` Storage bucket have already been applied. Do not rerun the SQL files on that existing project.

Open its [Supabase dashboard](https://supabase.com/dashboard/project/nlqhgdvwwnuueiyobxdf).

For a completely new project instead:

1. Create the project in Supabase.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql` once, then run `supabase/photo_upload.sql` once. The first transaction creates the table, grants, constraints, RLS policies, index, and Realtime publication. The second adds the nullable photo reference and a public photo bucket with a 5 MB size limit, JPEG/PNG/WebP MIME restrictions, and insert-only visitor access. Neither script drops or overwrites existing tables; inspect any pre-existing `posts` table or `wall-photos` bucket before proceeding.
4. In the project's Connect dialog or API settings, copy its project URL and **publishable key**.
5. Copy `.env.example` to `.env.local` and replace both placeholders:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Only these public browser values are needed. The app also accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` for a legacy project. Never use a secret key, database password, or `service_role` key in a `NEXT_PUBLIC_` variable.

`.env.local` is ignored by Git. Verify it stays ignored:

```powershell
git check-ignore .env.local
```

The database assigns every post's UUID, fixed author, and timestamp. Visitors can provide `body` and an optional constrained `image_path`. All posts and attached photos are public. There are no visitor update or delete privileges, including in Storage.

## 3. Run and check the wall

```powershell
npm run dev
```

Open http://127.0.0.1:3000.

1. Wait for **Live updates on**.
2. Write a short message and press **Share**.
3. Confirm it appears once, at the top, and the input clears.
4. Refresh. The message should still be there.
5. Open the same page in a second tab. Share in the first tab and watch the second update without refreshing.
6. Try an empty message and more than 280 characters. **Share** should stay disabled.
7. Choose a JPEG, PNG, or WebP photo up to 5 MB. Check its preview, remove it, and choose it again. Add a message and Share. Confirm the photo loads in the second tab and remains after refresh.
8. Try a non-image or corrupt image. The composer should show an error. Storage enforces size and MIME restrictions even when the browser is bypassed.

Stop the server with Ctrl+C, then run:

```powershell
npm test
npm run typecheck
npm run build
```

After the screenshot test photo post exists, `npm run test:photos` verifies public retrieval and Storage restrictions using that exact fixture. See `docs/TESTING.md` for its setup.

For a local production preview:

```powershell
npm run start
```

Public environment variables are included at build time. Rebuild after changing them. On this Windows host, a sandboxed build may fail to create a generated `.next` directory; running the build with the host's normal permissions passed.

## 4. Publish to GitHub

The repository above is already public, with `main` as its default branch and `feature/my-wall` preserving the work history. Use the following only when publishing a separate repository.

Keep the small conventional commits already created. Do not commit `.env.local`, `.next`, or `node_modules`.

Create a public GitHub repository for this project, then add its actual URL as `origin`. Publish `main` as the production branch and preserve `feature/my-wall` for the work history. If `main` does not exist yet in this new repository, create it at the completed feature head:

```powershell
git branch main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
git push -u origin feature/my-wall
```

Skip `git branch main` or `git remote add origin` when they already exist; inspect `git branch` and `git remote -v` first. Set the repository's default branch to `main`.

Future work belongs on purpose-named branches, for example `feature/photo-upload` or `fix/post-order`. Commit examples: `feat(wall): add photo uploads`, `fix(wall): preserve draft after a failed share`. Do not add coauthor trailers.

## 5. Deploy on Vercel

The production deployment above is already connected to GitHub. Pushes to `main` trigger production builds. The checked-in `vercel.json` selects Next.js, and `.vercelignore` excludes local environment files and build caches.

1. Sign into Vercel and choose **Add New → Project**.
2. Import the public repository. Select **Next.js**, repository root, and production branch `main`.
3. Use Node.js **24.x**. Keep `npm run build` as the build command; the package scripts already select webpack.
4. Add both environment variables from `.env.local` to **Production** and **Preview**. Use the project's publishable key, not a service-role key.
5. Deploy, then open the stable production domain, normally `https://YOUR-PROJECT.vercel.app`.
6. Repeat the posting, refresh, and two-tab checks on that public domain. Check it in a private window to ensure a reviewer can open it without a Vercel account.
7. Check at 390px and 1280px widths. Ensure long words wrap, the Share button is reachable, and there is no horizontal scrolling.

If the deployed app says it is offline, verify the two production environment variables, then redeploy. Changing environment variables does not change an already built deployment. If Realtime is paused, confirm `posts` is enabled in Supabase's Realtime publication and that the public SELECT policy exists.

Official reference: [Vercel deployments](https://vercel.com/docs/deployments).

## 6. Submit Test 2 yourself

At https://apply.capm.us, choose **2) Wall**. Provide:

- The public Vercel **production** URL.
- The public GitHub repository URL.
- A screenshot of the live wall with a posted message. `artifacts/screenshots/my-wall-photos-live.jpg` shows the deployed photo feature; the earlier `my-wall-live-desktop.jpg` and `my-wall-live-narrow.jpg` capture the original wall.
- Optional demo video and reviewer notes.

Suggested reviewer note:

> Mark's Wall uses Next.js, React, Tailwind CSS, shadcn/ui, and Supabase. Anonymous visitors can share messages up to 280 characters. Posts persist after refresh and appear live in other tabs. Public database access permits reading and constrained insertion only.

This project does not submit the job application or application form automatically.
