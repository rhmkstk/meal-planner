create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  photo text,
  meal_types text[] not null default '{}',
  servings integer not null default 1 check (servings > 0),
  prep_time_minutes integer not null default 0 check (prep_time_minutes >= 0),
  cook_time_minutes integer not null default 0 check (cook_time_minutes >= 0),
  tags text[] not null default '{}',
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  season text[] not null default '{all}',
  cuisine text,
  estimated_cost text check (estimated_cost in ('low', 'medium', 'high')),
  usage_count integer not null default 0 check (usage_count >= 0),
  last_used_at timestamptz,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipes_meal_types_allowed check (
    meal_types <@ array['breakfast', 'lunch', 'dinner', 'snack']::text[]
  ),
  constraint recipes_season_allowed check (
    season <@ array['spring', 'summer', 'autumn', 'winter', 'all']::text[]
  )
);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 3) not null default 1 check (amount > 0),
  unit text not null check (
    unit in ('g', 'kg', 'ml', 'l', 'piece', 'cup', 'tbsp', 'tsp', 'pack', 'can', 'bunch', 'slice')
  ),
  category text check (
    category in (
      'vegetables', 'fruits', 'meat', 'chicken', 'fish', 'dairy', 'legumes', 'grains',
      'spices', 'oils', 'sauces', 'bakery', 'frozen', 'canned', 'drinks', 'other'
    )
  ),
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.shopping_item_checks (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (weekly_plan_id, item_key)
);

create index if not exists recipes_user_id_created_at_idx
  on public.recipes (user_id, created_at desc);

create index if not exists recipe_ingredients_recipe_id_sort_order_idx
  on public.recipe_ingredients (recipe_id, sort_order);

create index if not exists weekly_plans_user_id_start_date_idx
  on public.weekly_plans (user_id, week_start_date desc);

create index if not exists weekly_plan_days_plan_id_sort_order_idx
  on public.weekly_plan_days (weekly_plan_id, sort_order);

create index if not exists planned_meals_plan_day_sort_order_idx
  on public.planned_meals (weekly_plan_day_id, sort_order);

create index if not exists shopping_item_checks_plan_id_idx
  on public.shopping_item_checks (weekly_plan_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create or replace trigger recipe_ingredients_set_updated_at
  before update on public.recipe_ingredients
  for each row execute function public.set_updated_at();

create or replace trigger weekly_plans_set_updated_at
  before update on public.weekly_plans
  for each row execute function public.set_updated_at();

create or replace trigger weekly_plan_days_set_updated_at
  before update on public.weekly_plan_days
  for each row execute function public.set_updated_at();

create or replace trigger planned_meals_set_updated_at
  before update on public.planned_meals
  for each row execute function public.set_updated_at();

create or replace trigger shopping_item_checks_set_updated_at
  before update on public.shopping_item_checks
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.weekly_plan_days enable row level security;
alter table public.planned_meals enable row level security;
alter table public.shopping_item_checks enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own recipes"
  on public.recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recipes"
  on public.recipes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

create policy "Users can read own recipe ingredients"
  on public.recipe_ingredients for select
  using (auth.uid() = user_id);

create policy "Users can insert own recipe ingredients"
  on public.recipe_ingredients for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can update own recipe ingredients"
  on public.recipe_ingredients for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can delete own recipe ingredients"
  on public.recipe_ingredients for delete
  using (auth.uid() = user_id);

create policy "Users can read own weekly plans"
  on public.weekly_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly plans"
  on public.weekly_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly plans"
  on public.weekly_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own weekly plans"
  on public.weekly_plans for delete
  using (auth.uid() = user_id);

create policy "Users can read own weekly plan days"
  on public.weekly_plan_days for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly plan days"
  on public.weekly_plan_days for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = weekly_plan_days.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can update own weekly plan days"
  on public.weekly_plan_days for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = weekly_plan_days.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can delete own weekly plan days"
  on public.weekly_plan_days for delete
  using (auth.uid() = user_id);

create policy "Users can read own planned meals"
  on public.planned_meals for select
  using (auth.uid() = user_id);

create policy "Users can insert own planned meals"
  on public.planned_meals for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.weekly_plan_days
      where weekly_plan_days.id = planned_meals.weekly_plan_day_id
        and weekly_plan_days.weekly_plan_id = planned_meals.weekly_plan_id
        and weekly_plan_days.user_id = auth.uid()
    )
    and exists (
      select 1 from public.recipes
      where recipes.id = planned_meals.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can update own planned meals"
  on public.planned_meals for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.weekly_plan_days
      where weekly_plan_days.id = planned_meals.weekly_plan_day_id
        and weekly_plan_days.weekly_plan_id = planned_meals.weekly_plan_id
        and weekly_plan_days.user_id = auth.uid()
    )
    and exists (
      select 1 from public.recipes
      where recipes.id = planned_meals.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can delete own planned meals"
  on public.planned_meals for delete
  using (auth.uid() = user_id);

create policy "Users can read own shopping item checks"
  on public.shopping_item_checks for select
  using (auth.uid() = user_id);

create policy "Users can insert own shopping item checks"
  on public.shopping_item_checks for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = shopping_item_checks.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can update own shopping item checks"
  on public.shopping_item_checks for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = shopping_item_checks.weekly_plan_id
        and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can delete own shopping item checks"
  on public.shopping_item_checks for delete
  using (auth.uid() = user_id);
