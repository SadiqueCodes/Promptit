-- Run this in Supabase SQL Editor before using the new community module.

create extension if not exists pgcrypto;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  author text not null,
  author_avatar text,
  title text not null,
  description text not null,
  image_url text,
  category text not null default 'general',
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  bookmarked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  parent_comment_id uuid references public.community_comments(id) on delete cascade,
  author text not null,
  author_avatar text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_comments_post_id_idx on public.community_comments (post_id);
create index if not exists community_comments_parent_comment_id_idx on public.community_comments (parent_comment_id);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;

drop policy if exists "community_posts_select" on public.community_posts;
create policy "community_posts_select"
  on public.community_posts
  for select
  using (true);

drop policy if exists "community_posts_insert" on public.community_posts;
create policy "community_posts_insert"
  on public.community_posts
  for insert
  with check (auth.uid() is not null);

drop policy if exists "community_posts_update_authenticated" on public.community_posts;
create policy "community_posts_update_authenticated"
  on public.community_posts
  for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "community_posts_delete_owner" on public.community_posts;
create policy "community_posts_delete_owner"
  on public.community_posts
  for delete
  using (auth.uid() = user_id);

drop policy if exists "community_comments_select" on public.community_comments;
create policy "community_comments_select"
  on public.community_comments
  for select
  using (true);

drop policy if exists "community_comments_insert" on public.community_comments;
create policy "community_comments_insert"
  on public.community_comments
  for insert
  with check (auth.uid() is not null);

drop policy if exists "community_comments_update_owner" on public.community_comments;
create policy "community_comments_update_owner"
  on public.community_comments
  for update
  using (auth.uid() = user_id);
