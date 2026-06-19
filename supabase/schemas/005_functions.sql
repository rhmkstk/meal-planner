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
