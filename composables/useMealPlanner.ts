import type {
  Ingredient,
  IngredientCategory,
  IngredientUnit,
  MealPlannerData,
  MealType,
  PlannedMeal,
  Recipe,
  RecipeDifficulty,
  Season,
  ShoppingList,
  WeeklyPlan,
  WeekDay
} from '~/types/meal-planner'

type RecipeRow = {
  id: string
  name: string
  description: string | null
  photo: string | null
  meal_types: MealType[]
  servings: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  tags: string[] | null
  difficulty: RecipeDifficulty | null
  season: Season[] | null
  cuisine: string | null
  estimated_cost: Recipe['estimatedCost'] | null
  usage_count: number | null
  last_used_at: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
  recipe_ingredients?: IngredientRow[]
}

type IngredientRow = {
  id: string
  name: string
  amount: number | string
  unit: IngredientUnit
  category: IngredientCategory | null
  note: string | null
  sort_order: number | null
}

type WeeklyPlanRow = {
  id: string
  week_start_date: string
  week_end_date: string
  created_at: string
  updated_at: string
  weekly_plan_days?: WeeklyPlanDayRow[]
}

type WeeklyPlanDayRow = {
  id: string
  date: string
  day: WeekDay
  sort_order: number | null
  planned_meals?: PlannedMealRow[]
}

type PlannedMealRow = {
  id: string
  meal_type: MealType
  recipe_id: string
  servings: number
  note: string | null
  sort_order: number | null
}

function mapIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    unit: row.unit,
    category: row.category ?? undefined,
    note: row.note ?? undefined
  }
}

function mapRecipe(row: RecipeRow): Recipe {
  const ingredients = [...(row.recipe_ingredients ?? [])]
    .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
    .map(mapIngredient)

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    photo: row.photo ?? undefined,
    mealTypes: row.meal_types ?? [],
    servings: row.servings,
    ingredients,
    prepTimeMinutes: row.prep_time_minutes ?? 0,
    cookTimeMinutes: row.cook_time_minutes ?? 0,
    tags: row.tags ?? [],
    difficulty: row.difficulty ?? undefined,
    season: row.season ?? ['all'],
    cuisine: row.cuisine ?? undefined,
    estimatedCost: row.estimated_cost ?? undefined,
    usageCount: row.usage_count ?? 0,
    lastUsedAt: row.last_used_at,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapWeeklyPlan(row: WeeklyPlanRow): WeeklyPlan {
  const days = [...(row.weekly_plan_days ?? [])]
    .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
    .map((day) => ({
      date: day.date,
      day: day.day,
      meals: [...(day.planned_meals ?? [])]
        .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
        .map((meal): PlannedMeal => ({
          id: meal.id,
          mealType: meal.meal_type,
          recipeId: meal.recipe_id,
          servings: meal.servings,
          note: meal.note ?? undefined
        }))
    }))

  return {
    id: row.id,
    weekStartDate: row.week_start_date,
    weekEndDate: row.week_end_date,
    days,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function toRecipeRow(recipe: Recipe, userId: string) {
  return {
    user_id: userId,
    name: recipe.name,
    description: recipe.description ?? null,
    photo: recipe.photo ?? null,
    meal_types: recipe.mealTypes,
    servings: recipe.servings,
    prep_time_minutes: recipe.prepTimeMinutes ?? 0,
    cook_time_minutes: recipe.cookTimeMinutes ?? 0,
    tags: recipe.tags ?? [],
    difficulty: recipe.difficulty ?? null,
    season: recipe.season ?? ['all'],
    cuisine: recipe.cuisine ?? null,
    estimated_cost: recipe.estimatedCost ?? null,
    usage_count: recipe.usageCount ?? 0,
    last_used_at: recipe.lastUsedAt ?? null,
    is_favorite: recipe.isFavorite
  }
}

function toIngredientRows(recipe: Recipe, userId: string, recipeId: string) {
  return recipe.ingredients.map((ingredient, index) => ({
    recipe_id: recipeId,
    user_id: userId,
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    category: ingredient.category ?? null,
    note: ingredient.note ?? null,
    sort_order: index
  }))
}

export function useMealPlanner() {
  const { user } = useSupabaseAuth()
  const mealPlannerData = useState<MealPlannerData>('meal-planner-data', () => ({
    recipes: [],
    weeklyPlans: [],
    shoppingLists: [] as ShoppingList[]
  }))
  const loading = useState<boolean>('meal-planner-loading', () => false)

  async function requireUserId(): Promise<string> {
    if (!user.value?.id) {
      throw new Error('Oturum bulunamadi.')
    }

    return user.value.id
  }

  async function fetchRecipes(): Promise<void> {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*)')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    mealPlannerData.value.recipes = ((data ?? []) as RecipeRow[]).map(mapRecipe)
  }

  async function fetchWeeklyPlans(): Promise<void> {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*, weekly_plan_days(*, planned_meals(*))')
      .order('week_start_date', { ascending: true })

    if (error) {
      throw error
    }

    mealPlannerData.value.weeklyPlans = ((data ?? []) as WeeklyPlanRow[]).map(mapWeeklyPlan)
  }

  async function refreshMealPlannerData(): Promise<void> {
    if (!user.value) {
      mealPlannerData.value = {
        recipes: [],
        weeklyPlans: [],
        shoppingLists: []
      }
      return
    }

    loading.value = true

    try {
      await Promise.all([
        fetchRecipes(),
        fetchWeeklyPlans()
      ])
    } finally {
      loading.value = false
    }
  }

  async function saveRecipe(recipe: Recipe): Promise<Recipe> {
    const supabase = useSupabaseClient()
    const userId = await requireUserId()

    if (mealPlannerData.value.recipes.some((item) => item.id === recipe.id)) {
      const { error } = await supabase
        .from('recipes')
        .update(toRecipeRow(recipe, userId))
        .eq('id', recipe.id)

      if (error) {
        throw error
      }

      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipe.id)

      const ingredientRows = toIngredientRows(recipe, userId, recipe.id)

      if (ingredientRows.length > 0) {
        const { error: ingredientError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientRows)

        if (ingredientError) {
          throw ingredientError
        }
      }
    } else {
      const { data, error } = await supabase
        .from('recipes')
        .insert(toRecipeRow(recipe, userId))
        .select()
        .single()

      if (error) {
        throw error
      }

      const recipeId = data.id as string
      const ingredientRows = toIngredientRows(recipe, userId, recipeId)

      if (ingredientRows.length > 0) {
        const { error: ingredientError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientRows)

        if (ingredientError) {
          throw ingredientError
        }
      }

      recipe.id = recipeId
    }

    await refreshMealPlannerData()
    return mealPlannerData.value.recipes.find((item) => item.id === recipe.id) ?? recipe
  }

  async function deleteRecipe(recipeId: string): Promise<void> {
    const supabase = useSupabaseClient()
    await requireUserId()

    const { error: mealError } = await supabase
      .from('planned_meals')
      .delete()
      .eq('recipe_id', recipeId)

    if (mealError) {
      throw mealError
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)

    if (error) {
      throw error
    }

    await refreshMealPlannerData()
  }

  async function saveWeeklyPlan(plan: WeeklyPlan): Promise<WeeklyPlan> {
    const supabase = useSupabaseClient()
    const userId = await requireUserId()
    const existing = mealPlannerData.value.weeklyPlans.some((item) => item.id === plan.id)
    let planId = plan.id
    let createdAt = plan.createdAt

    if (existing) {
      const { error } = await supabase
        .from('weekly_plans')
        .update({
          week_start_date: plan.weekStartDate,
          week_end_date: plan.weekEndDate
        })
        .eq('id', plan.id)

      if (error) {
        throw error
      }

      const { error: deleteDaysError } = await supabase
        .from('weekly_plan_days')
        .delete()
        .eq('weekly_plan_id', plan.id)

      if (deleteDaysError) {
        throw deleteDaysError
      }
    } else {
      const { data, error } = await supabase
        .from('weekly_plans')
        .insert({
          user_id: userId,
          week_start_date: plan.weekStartDate,
          week_end_date: plan.weekEndDate
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      planId = data.id as string
      createdAt = data.created_at as string
    }

    for (const [dayIndex, day] of plan.days.entries()) {
      const { data: dayRow, error: dayError } = await supabase
        .from('weekly_plan_days')
        .insert({
          weekly_plan_id: planId,
          user_id: userId,
          date: day.date,
          day: day.day,
          sort_order: dayIndex
        })
        .select()
        .single()

      if (dayError) {
        throw dayError
      }

      const plannedMeals = day.meals.map((meal, mealIndex) => ({
        weekly_plan_day_id: dayRow.id,
        weekly_plan_id: planId,
        recipe_id: meal.recipeId,
        user_id: userId,
        meal_type: meal.mealType,
        servings: meal.servings,
        note: meal.note ?? null,
        sort_order: mealIndex
      }))

      if (plannedMeals.length > 0) {
        const { error: mealError } = await supabase
          .from('planned_meals')
          .insert(plannedMeals)

        if (mealError) {
          throw mealError
        }
      }
    }

    await refreshMealPlannerData()
    return mealPlannerData.value.weeklyPlans.find((item) => item.id === planId) ?? {
      ...plan,
      id: planId,
      createdAt
    }
  }

  return {
    mealPlannerData,
    loading,
    refreshMealPlannerData,
    saveRecipe,
    deleteRecipe,
    saveWeeklyPlan
  }
}
