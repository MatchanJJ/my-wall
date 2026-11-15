# My Wall

## Purpose
Test 2 of the Junior React / Next.js Developer Application: a public, anonymous message wall. Visitors share short messages and see one another's updates immediately.

## Platform and stack
Responsive web. React 19, Next.js App Router, TypeScript, Supabase, Tailwind CSS, shadcn/ui. Deployment target: Vercel.

## Required behavior
- Share messages of 1–280 characters; reject whitespace-only messages.
- Persist messages in Supabase and show newest first after refresh.
- Subscribe to new posts with Supabase Realtime.
- No account needed; use the fixed author Wall Visitor.
- Start with 50 messages and let visitors load older messages.

## Visual direction
The supplied brief pins both the visual world (2008 Facebook-style Wall) and the surface (input, Share button, chronological feed). Preserve that direction: blue masthead, compact Arial typography, square avatars, pale blue borders and a profile/sidebar beside the wall. This is a functional web app, not a marketing page.

## Boundaries
No authentication, uploads, likes, comments, editing, deletion, or private messages. All messages are public. Anonymous posting is appropriate for this challenge; moderation and abuse controls would be needed for wider public use.

## Sources
- https://tremendous-tiger-a4a.notion.site/Test-2-My-Wall-React-App-22300bbdfc3b804491bbf6d7f2481cd8
- https://tremendous-tiger-a4a.notion.site/Step-by-Step-Facebook-Wall-Challenge-Test-2-22300bbdfc3b80c3886cd8b22779ed09
