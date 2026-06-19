create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_plans_valid_date_range check (week_end_date >= week_start_date)
);

create table if not exists public.weekly_plan_days (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  day text not null check (
    day in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (weekly_plan_id, date)
);

create table if not exists public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_day_id uuid not null references public.weekly_plan_days (id) on delete cascade,
  weekly_plan_id uuid not null references public.weekly_plans (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  servings integer not null default 1 check (servings > 0),
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists weekly_plans_user_id_start_date_idx
  on public.weekly_plans (user_id, week_start_date desc);

create index if not exists weekly_plan_days_plan_id_sort_order_idx
  on public.weekly_plan_days (weekly_plan_id, sort_order);

create index if not exists planned_meals_plan_day_sort_order_idx
  on public.planned_meals (weekly_plan_day_id, sort_order);

alter table public.weekly_plans enable row level security;
alter table public.weekly_plan_days enable row level security;
alter table public.planned_meals enable row level security;

create policy "Users can read own weekly plans"
  on public.weekly_plans
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly plans"
  on public.weekly_plans
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly plans"
  on public.weekly_plans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own weekly plans"
  on public.weekly_plans
  for delete
  using (auth.uid() = user_id);

create policy "Users can read own weekly plan days"
  on public.weekly_plan_days
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly plan days"
  on public.weekly_plan_days
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.weekly_plans
      where weekly_plans.id = weekly_plan_days.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can update own weekly plan days"
  on public.weekly_plan_days
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.weekly_plans
      where weekly_plans.id = weekly_plan_days.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can delete own weekly plan days"
  on public.weekly_plan_days
  for delete
  using (auth.uid() = user_id);

create policy "Users can read own planned meals"
  on public.planned_meals
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own planned meals"
  on public.planned_meals
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.weekly_plan_days
      where weekly_plan_days.id = planned_meals.weekly_plan_day_id
        and weekly_plan_days.weekly_plan_id = planned_meals.weekly_plan_id
        and weekly_plan_days.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.recipes
      where recipes.id = planned_meals.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can update own planned meals"
  on public.planned_meals
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.weekly_plan_days
      where weekly_plan_days.id = planned_meals.weekly_plan_day_id
        and weekly_plan_days.weekly_plan_id = planned_meals.weekly_plan_id
        and weekly_plan_days.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.recipes
      where recipes.id = planned_meals.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can delete own planned meals"
  on public.planned_meals
  for delete
  using (auth.uid() = user_id);
