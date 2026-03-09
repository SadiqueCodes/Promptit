-- Run once in Supabase SQL editor
-- Normal DB storage for per-user transformation usage

create table if not exists public.user_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  transformation_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_usage enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_usage'
      and policyname = 'Users can read own usage'
  ) then
    create policy "Users can read own usage"
      on public.user_usage
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_usage'
      and policyname = 'Users can insert own usage'
  ) then
    create policy "Users can insert own usage"
      on public.user_usage
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_usage'
      and policyname = 'Users can update own usage'
  ) then
    create policy "Users can update own usage"
      on public.user_usage
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.increment_user_usage(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.user_usage (user_id, transformation_count, updated_at)
  values (p_user_id, 1, now())
  on conflict (user_id)
  do update
    set transformation_count = public.user_usage.transformation_count + 1,
        updated_at = now()
  returning transformation_count into v_count;

  return v_count;
end;
$$;

grant execute on function public.increment_user_usage(uuid) to anon, authenticated, service_role;
