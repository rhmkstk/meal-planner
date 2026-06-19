create table if not exists public.shopping_item_checks (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (weekly_plan_id, item_key)
);

create index if not exists shopping_item_checks_plan_id_idx
  on public.shopping_item_checks (weekly_plan_id);

alter table public.shopping_item_checks enable row level security;

create policy "Users can read own shopping item checks"
  on public.shopping_item_checks
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own shopping item checks"
  on public.shopping_item_checks
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.weekly_plans
      where weekly_plans.id = shopping_item_checks.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can update own shopping item checks"
  on public.shopping_item_checks
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.weekly_plans
      where weekly_plans.id = shopping_item_checks.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can delete own shopping item checks"
  on public.shopping_item_checks
  for delete
  using (auth.uid() = user_id);
