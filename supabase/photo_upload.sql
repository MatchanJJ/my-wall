begin;

alter table public.posts add column image_path text
  check (image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$');

grant insert (image_path) on public.posts to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wall-photos', 'wall-photos', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']);

create policy "Visitors can upload wall photos"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'wall-photos'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  );

commit;
