begin;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Wall Visitor' check (author_name = 'Wall Visitor'),
  body text not null check (
    char_length(body) between 1 and 280
    and body ~ '[^[:space:]]'
  ),
  created_at timestamptz not null default now()
);

create index posts_feed_idx on public.posts (created_at desc, id desc);

alter table public.posts enable row level security;

revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
-- Visitors supply only the message; the database owns identity and time.
grant insert (body) on public.posts to anon, authenticated;

create policy "Anyone can read the wall"
  on public.posts for select to anon, authenticated using (true);

create policy "Anyone can share a message"
  on public.posts for insert to anon, authenticated
  with check (author_name = 'Wall Visitor');

alter publication supabase_realtime add table public.posts;

commit;
