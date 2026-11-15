# Setup and deployment

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

This checkout is already connected to the **my-wall** project in **MatchanJJ's Org**, in Singapore. The `posts` table, RLS policies, index, and Realtime publication have already been applied. Do not rerun the schema on that existing project.

Open its [Supabase dashboard](https://supabase.com/dashboard/project/nlqhgdvwwnuueiyobxdf).

For a completely new project instead:

1. Create the project in Supabase.
2. Open **SQL Editor**.
3. Paste the complete contents of `supabase/schema.sql` and run it once. The transaction creates the table, grants, constraints, RLS policies, index, and Realtime publication. It does not drop or overwrite existing tables; if `posts` already exists, inspect it before proceeding.
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

The database assigns every post's UUID, fixed author, and timestamp. Visitors can provide only `body`. All posts are publicly readable. There are no visitor update or delete privileges.

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

Stop the server with Ctrl+C, then run:

```powershell
npm test
npm run typecheck
npm run build
```

For a local production preview:

```powershell
npm run start
```

Public environment variables are included at build time. Rebuild after changing them. On this Windows host, a sandboxed build may fail to create a generated `.next` directory; running the build with the host's normal permissions passed.

## 4. Publish to GitHub

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
- A screenshot of the live wall with a posted message. A local reference screenshot is in `artifacts/screenshots/`; capture the deployed page for the actual submission.
- Optional demo video and reviewer notes.

Suggested reviewer note:

> My Wall uses Next.js, React, Tailwind CSS, shadcn/ui, and Supabase. Anonymous visitors can share messages up to 280 characters. Posts persist after refresh and appear live in other tabs. Public database access permits reading and constrained insertion only.

This project does not submit the job application or application form automatically.
