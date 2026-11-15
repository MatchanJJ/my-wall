# Verification

Checked on November 15, 2026, using Node.js 24 and the live `my-wall` Supabase project.

## Automated checks

`npm test` passes five focused tests covering:

- Blank/whitespace-only messages and 280/281-character boundaries, including emoji.
- Duplicate INSERT events and fetch/Realtime races.
- Stable timestamp ties and timezone offsets.
- PostgreSQL microsecond ordering within the same millisecond.
- Preserving older messages when the feed grows beyond 50.

`npm run typecheck` and `npm run build` pass. The build uses webpack because Turbopack's CSS worker failed on this Windows host.

`npm run test:database` passed against Supabase using two independent clients and the publishable key:

- Public insert and SELECT succeed.
- A second client receives the INSERT through Realtime.
- The saved message is readable through a fresh query.
- Empty, whitespace-only, null, and over-280-character messages are rejected by the database.
- Visitor overrides of author, UUID, and timestamp are denied.
- Visitor UPDATE and DELETE are denied and the original message remains unchanged.

The first Realtime attempt immediately after project creation timed out. After confirming the publication, policies, and active replication slot, the next full run passed. Both diagnostic posts were removed by exact ID after testing.

A separate SQL transaction verified that 280 emoji are accepted and 281 are rejected as the `anon` role, then rolled back its test data. Supabase's security advisor reported no findings for the project.

## Browser checks on the local production build

- Empty feed and connected state render correctly.
- Empty and whitespace-only input cannot be shared.
- 281 characters show a validation error and disable Share.
- 280 emoji keep Share enabled.
- Sharing shows a pending state, then confirmation; the input clears.
- The post appears once in the posting tab and in a second tab without refresh.
- The post survives a page refresh.
- The 1280px desktop layout was inspected and captured with a saved post.
- The browser console contained no warnings or errors.
- The Impeccable mechanical detector returned no findings for the wall component and stylesheet.

## Remaining checks

- The browser viewport override did not change the reported 1280px viewport, so the mobile layout has not been visually verified. Check it in a real 390px browser or phone before submission.
- A failed network request, the reconnect flow, and the actual Load older button with more than 50 database rows were not exercised in the browser. The implementation preserves drafts on failed writes, merges reconnect snapshots, and increases the fetch window for older posts.
- Repeat the browser acceptance checks on the Vercel production deployment before submitting.

## Rerun the database check

```powershell
npm run test:database
```

This creates one visible diagnostic post and prints its ID. An administrator may remove that exact row in the Supabase SQL Editor; public clients intentionally cannot delete posts. Run the check against a development project when possible.

The wall deliberately allows anonymous public insertion. It has length and privilege constraints, but no application rate limiting or moderation. Add those before use beyond this challenge.
