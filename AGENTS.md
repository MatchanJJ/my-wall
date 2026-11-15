# Mark's Wall

- Stack: React 19, Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase.
- Keep the 2008 Facebook-style wall and the anonymous posting flow.
- Make small commits using https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13. No coauthor trailers.
- Name branches using https://conventionalbranch.org/ (for example, `feature/my-wall`).
- Run `npm test`, `npm run typecheck`, and `npm run build` before finishing.
- Use only Supabase publishable or legacy anon keys in browser code. Never commit `.env.local` or a service-role key.
- Preserve existing database data. Enable RLS; permit public read and constrained insert only.
