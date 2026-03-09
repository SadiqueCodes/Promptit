-- Run once in Supabase SQL editor
-- Stores prompt enhancement history per user for cross-device sync

create table if not exists public.prompt_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_prompt text not null,
  enhanced_prompt text not null,
  created_at timestamptz not null default now()
);

create index if not exists prompt_history_user_created_idx
  on public.prompt_history (user_id, created_at desc);

alter table public.prompt_history enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prompt_history'
      and policyname = 'Users can read own prompt history'
  ) then
    create policy "Users can read own prompt history"
      on public.prompt_history
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prompt_history'
      and policyname = 'Users can insert own prompt history'
  ) then
    create policy "Users can insert own prompt history"
      on public.prompt_history
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prompt_history'
      and policyname = 'Users can delete own prompt history'
  ) then
    create policy "Users can delete own prompt history"
      on public.prompt_history
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;
