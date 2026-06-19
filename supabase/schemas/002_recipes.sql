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

create index if not exists recipes_user_id_created_at_idx
  on public.recipes (user_id, created_at desc);

create index if not exists recipe_ingredients_recipe_id_sort_order_idx
  on public.recipe_ingredients (recipe_id, sort_order);

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;

create policy "Users can read own recipes"
  on public.recipes
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own recipes"
  on public.recipes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recipes"
  on public.recipes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own recipes"
  on public.recipes
  for delete
  using (auth.uid() = user_id);

create policy "Users can read own recipe ingredients"
  on public.recipe_ingredients
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own recipe ingredients"
  on public.recipe_ingredients
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can update own recipe ingredients"
  on public.recipe_ingredients
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

create policy "Users can delete own recipe ingredients"
  on public.recipe_ingredients
  for delete
  using (auth.uid() = user_id);
