<script setup lang="ts">
import {
  calculatePlannedIngredientAmount,
  ESTIMATED_COST_LABELS,
  INGREDIENT_CATEGORY_LABELS,
  INGREDIENT_UNIT_LABELS,
  MEAL_TYPE_LABELS,
  RECIPE_DIFFICULTY_LABELS,
  SEASON_LABELS,
  WEEK_DAY_LABELS
} from '~/types/meal-planner'
import { mockMealPlannerData } from '~/data/mock-meal-planner'
import type {
  EstimatedCost,
  IngredientCategory,
  IngredientUnit,
  MealType,
  PlannedMeal,
  Recipe,
  RecipeDifficulty,
  Season,
  WeekDay,
  WeeklyPlan
} from '~/types/meal-planner'

type RecipeIngredientForm = {
  name: string
  amount: number
  unit: IngredientUnit
  category: IngredientCategory | ''
  note: string
}

type RecipeForm = {
  name: string
  description: string
  photo: string
  mealTypes: MealType[]
  servings: number
  ingredients: RecipeIngredientForm[]
  prepTimeMinutes: number
  cookTimeMinutes: number
  tags: string
  difficulty: RecipeDifficulty
  season: Season[]
  cuisine: string
  estimatedCost: EstimatedCost
  isFavorite: boolean
}

type PlanMealForm = {
  id?: string
  mealType: MealType
  recipeId: string
  servings: number
  note: string
}

type PlanDayForm = {
  date: string
  day: WeekDay
  meals: PlanMealForm[]
}

type WeeklyPlanForm = {
  weekStartDate: string
  weekEndDate: string
  planDurationWeeks: 1 | 2
  days: PlanDayForm[]
}

type CreatedWeeklyPlanSummary = {
  id: string
  weekStartDate: string
  weekEndDate: string
  totalDayCount: number
  plannedDayCount: number
  plannedMealCount: number
  totalServings: number
}

type PlanDetailTab = 'plan' | 'shopping' | 'edit'

type ShoppingListUiItem = {
  id: string
  name: string
  totalAmount: number
  unit: IngredientUnit
  category?: IngredientCategory
  recipes: string[]
  checked: boolean
}

const mealPlannerData = reactive(mockMealPlannerData)
const route = useRoute()
const router = useRouter()
const isAddRecipeOpen = ref(false)
const isCreatePlanOpen = ref(false)
const createdWeeklyPlanSummary = ref<CreatedWeeklyPlanSummary | null>(null)
const selectedPlanId = ref<string | null>(null)
const selectedPlanTab = ref<PlanDetailTab>('plan')
const shoppingCheckedState = reactive<Record<string, boolean>>({})

const mealTypeOptions = Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => ({
  value: value as MealType,
  label
}))

const unitOptions = Object.entries(INGREDIENT_UNIT_LABELS).map(([value, label]) => ({
  value: value as IngredientUnit,
  label
}))

const categoryOptions = Object.entries(INGREDIENT_CATEGORY_LABELS).map(([value, label]) => ({
  value: value as IngredientCategory,
  label
}))

const difficultyOptions = Object.entries(RECIPE_DIFFICULTY_LABELS).map(([value, label]) => ({
  value: value as RecipeDifficulty,
  label
}))

const costOptions = Object.entries(ESTIMATED_COST_LABELS).map(([value, label]) => ({
  value: value as EstimatedCost,
  label
}))

const seasonOptions = Object.entries(SEASON_LABELS).map(([value, label]) => ({
  value: value as Season,
  label
}))

const planDurationOptions = [
  { value: 1 as const, label: '1 Hafta' },
  { value: 2 as const, label: '2 Hafta' }
]

const recipeForm = reactive<RecipeForm>(createRecipeForm())
const weeklyPlanForm = reactive<WeeklyPlanForm>(createWeeklyPlanForm())
const planEditForm = reactive<WeeklyPlanForm>(createWeeklyPlanForm())

const recipesById = computed<Record<string, Recipe>>(() => {
  return mealPlannerData.recipes.reduce<Record<string, Recipe>>((recipes, recipe) => {
    recipes[recipe.id] = recipe
    return recipes
  }, {})
})

const weeklyPlans = computed(() => {
  return mealPlannerData.weeklyPlans.map((plan) => {
    const plannedMeals = plan.days.flatMap((day) => day.meals)
    const shoppingList = mealPlannerData.shoppingLists.find((list) => list.weeklyPlanId === plan.id)

    return {
      ...plan,
      plannedDayCount: plan.days.filter((day) => day.meals.length > 0).length,
      plannedMealCount: plannedMeals.length,
      totalServings: plannedMeals.reduce((total, meal) => total + meal.servings, 0),
      shoppingItemCount: shoppingList?.items.length ?? 0
    }
  })
})

const selectedPlan = computed(() => {
  return weeklyPlans.value.find((plan) => plan.id === selectedPlanId.value) ?? null
})

const selectedPlanShoppingItems = computed<ShoppingListUiItem[]>(() => {
  if (!selectedPlan.value) {
    return []
  }

  const itemMap = new Map<string, Omit<ShoppingListUiItem, 'checked'>>()

  selectedPlan.value.days.forEach((day) => {
    day.meals.forEach((meal) => {
      const recipe = recipesById.value[meal.recipeId]

      if (!recipe) {
        return
      }

      recipe.ingredients.forEach((ingredient) => {
        const category = ingredient.category
        const id = [
          ingredient.name.toLocaleLowerCase('tr-TR'),
          ingredient.unit,
          category ?? 'other'
        ].join('__')
        const plannedAmount = calculatePlannedIngredientAmount({
          ingredientAmount: ingredient.amount,
          recipeServings: recipe.servings,
          plannedServings: meal.servings
        })
        const existingItem = itemMap.get(id)

        if (existingItem) {
          existingItem.totalAmount += plannedAmount

          if (!existingItem.recipes.includes(recipe.name)) {
            existingItem.recipes.push(recipe.name)
          }

          return
        }

        itemMap.set(id, {
          id,
          name: ingredient.name,
          totalAmount: plannedAmount,
          unit: ingredient.unit,
          category,
          recipes: [recipe.name]
        })
      })
    })
  })

  return [...itemMap.values()]
    .map((item) => ({
      ...item,
      checked: shoppingCheckedState[item.id] ?? false
    }))
    .sort((first, second) => {
      if (first.checked !== second.checked) {
        return first.checked ? 1 : -1
      }

      return first.name.localeCompare(second.name, 'tr-TR')
    })
})

const selectedPlanCheckedShoppingCount = computed(() => {
  return selectedPlanShoppingItems.value.filter((item) => item.checked).length
})

const recipeOptions = computed(() => {
  return mealPlannerData.recipes.map((recipe) => ({
    value: recipe.id,
    label: recipe.name
  }))
})

const weeklyPlanMealCount = computed(() => {
  return weeklyPlanForm.days.reduce((total, day) => total + day.meals.length, 0)
})
const weeklyPlanRangeText = computed(() => {
  if (!weeklyPlanForm.weekStartDate || !weeklyPlanForm.weekEndDate) {
    return 'Tarih araligi seciliyor'
  }

  return `${formatShortDate(weeklyPlanForm.weekStartDate)} - ${formatShortDate(weeklyPlanForm.weekEndDate)} planlaniyor`
})
const canSubmitRecipe = computed(() => {
  return recipeForm.name.trim().length > 0 && recipeForm.mealTypes.length > 0
})
const canSubmitWeeklyPlan = computed(() => {
  return weeklyPlanForm.weekStartDate.length > 0
    && weeklyPlanForm.weekEndDate.length > 0
    && weeklyPlanForm.days.some((day) => day.meals.some((meal) => meal.recipeId.length > 0))
})
const canSubmitPlanEdit = computed(() => {
  return planEditForm.weekStartDate.length > 0 && planEditForm.weekEndDate.length > 0
})

watch(
  () => weeklyPlanForm.weekStartDate,
  (weekStartDate) => {
    if (weekStartDate) {
      setWeeklyPlanDates(weekStartDate)
    }
  }
)

watch(
  () => route.query.createPlan,
  (createPlan) => {
    if (createPlan !== '1' && createPlan !== 'true') {
      return
    }

    openCreatePlanModal()

    const query = { ...route.query }
    delete query.createPlan
    router.replace({ query })
  },
  { immediate: true }
)

watch(isCreatePlanOpen, (isOpen) => {
  if (!isOpen) {
    createdWeeklyPlanSummary.value = null
    resetWeeklyPlanForm()
  }
})

function createRecipeForm(): RecipeForm {
  return {
    name: '',
    description: '',
    photo: '',
    mealTypes: ['dinner'],
    servings: 2,
    ingredients: [createIngredientForm()],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    tags: '',
    difficulty: 'easy',
    season: ['all'],
    cuisine: '',
    estimatedCost: 'medium',
    isFavorite: false
  }
}

function createIngredientForm(): RecipeIngredientForm {
  return {
    name: '',
    amount: 1,
    unit: 'piece',
    category: '',
    note: ''
  }
}

function createWeeklyPlanForm(): WeeklyPlanForm {
  const weekStartDate = getDefaultWeekStartDate()

  return {
    weekStartDate,
    weekEndDate: getPlanEndDate(weekStartDate, 1),
    planDurationWeeks: 1,
    days: createPlanDays(weekStartDate, 1)
  }
}

function createPlanMealForm(): PlanMealForm {
  return {
    mealType: 'dinner',
    recipeId: mealPlannerData.recipes[0]?.id ?? '',
    servings: 2,
    note: ''
  }
}

function openAddRecipeModal(): void {
  resetRecipeForm()
  isAddRecipeOpen.value = true
}

function openCreatePlanModal(): void {
  resetWeeklyPlanForm()
  createdWeeklyPlanSummary.value = null
  isCreatePlanOpen.value = true
}

function closeCreatePlanModal(): void {
  isCreatePlanOpen.value = false
}

function openPlanDetails(planId: string): void {
  navigateTo(`/plans/${planId}`)
}

function openPlanEdit(planId: string): void {
  selectedPlanId.value = planId
  resetPlanEditForm()
  selectedPlanTab.value = 'edit'
}

function closePlanDetails(): void {
  selectedPlanId.value = null
}

function setPlanDetailTab(tab: PlanDetailTab): void {
  if (tab === 'edit') {
    resetPlanEditForm()
  }

  selectedPlanTab.value = tab
}

function resetRecipeForm(): void {
  Object.assign(recipeForm, createRecipeForm())
}

function resetWeeklyPlanForm(): void {
  Object.assign(weeklyPlanForm, createWeeklyPlanForm())
}

function resetPlanEditForm(): void {
  const plan = mealPlannerData.weeklyPlans.find((item) => item.id === selectedPlanId.value)

  if (!plan) {
    return
  }

  Object.assign(planEditForm, clonePlanToForm(plan))
}

function clonePlanToForm(plan: WeeklyPlan): WeeklyPlanForm {
  return {
    weekStartDate: plan.weekStartDate,
    weekEndDate: plan.weekEndDate,
    planDurationWeeks: getPlanDurationWeeks(plan),
    days: plan.days.map((day) => ({
      date: day.date,
      day: day.day,
      meals: day.meals.map((meal) => ({
        id: meal.id,
        mealType: meal.mealType,
        recipeId: meal.recipeId,
        servings: meal.servings,
        note: meal.note ?? ''
      }))
    }))
  }
}

function setWeeklyPlanDates(weekStartDate: string): void {
  updatePlanFormRange(weeklyPlanForm, weekStartDate, weeklyPlanForm.planDurationWeeks)
}

function setWeeklyPlanDuration(planDurationWeeks: 1 | 2): void {
  updatePlanFormRange(weeklyPlanForm, weeklyPlanForm.weekStartDate, planDurationWeeks)
}

function setPlanEditDates(weekStartDate: string): void {
  updatePlanFormRange(planEditForm, weekStartDate, planEditForm.planDurationWeeks)
}

function setPlanEditDuration(planDurationWeeks: 1 | 2): void {
  updatePlanFormRange(planEditForm, planEditForm.weekStartDate, planDurationWeeks)
}

function updatePlanFormRange(form: WeeklyPlanForm, weekStartDate: string, planDurationWeeks: 1 | 2): void {
  const existingMeals = form.days.map((day) => day.meals)

  form.weekStartDate = weekStartDate
  form.planDurationWeeks = planDurationWeeks
  form.weekEndDate = getPlanEndDate(weekStartDate, planDurationWeeks)
  form.days = createPlanDays(weekStartDate, planDurationWeeks).map((day, index) => ({
    ...day,
    meals: existingMeals[index] ?? []
  }))
}

function createPlanDays(weekStartDate: string, planDurationWeeks: 1 | 2): PlanDayForm[] {
  const weekDays: WeekDay[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ]

  return Array.from({ length: planDurationWeeks * 7 }, (_, index) => ({
    date: addDays(weekStartDate, index),
    day: weekDays[index % weekDays.length],
    meals: []
  }))
}

function getPlanEndDate(weekStartDate: string, planDurationWeeks: 1 | 2): string {
  return addDays(weekStartDate, planDurationWeeks * 7 - 1)
}

function getPlanDurationWeeks(plan: Pick<WeeklyPlan, 'days'>): 1 | 2 {
  return plan.days.length > 7 ? 2 : 1
}

function getDefaultWeekStartDate(): string {
  const latestPlan = mealPlannerData.weeklyPlans.at(-1)

  if (latestPlan) {
    return addDays(latestPlan.weekEndDate, 1)
  }

  return toDateInputValue(new Date())
}

function addDays(date: string, days: number): string {
  const nextDate = new Date(`${date}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + days)
  return toDateInputValue(nextDate)
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function setRecipeSeasons(seasons: Season[]): void {
  if (seasons.length === 0 || seasons.at(-1) === 'all') {
    recipeForm.season = ['all']
    return
  }

  recipeForm.season = seasons.filter((season) => season !== 'all')
}

function addIngredient(): void {
  recipeForm.ingredients.push(createIngredientForm())
}

function removeIngredient(index: number): void {
  if (recipeForm.ingredients.length === 1) {
    recipeForm.ingredients = [createIngredientForm()]
    return
  }

  recipeForm.ingredients.splice(index, 1)
}

function addPlanMeal(dayIndex: number): void {
  weeklyPlanForm.days[dayIndex].meals.push(createPlanMealForm())
}

function removePlanMeal(dayIndex: number, mealIndex: number): void {
  weeklyPlanForm.days[dayIndex].meals.splice(mealIndex, 1)
}

function addEditPlanMeal(dayIndex: number): void {
  planEditForm.days[dayIndex].meals.push(createPlanMealForm())
}

function removeEditPlanMeal(dayIndex: number, mealIndex: number): void {
  planEditForm.days[dayIndex].meals.splice(mealIndex, 1)
}

function submitRecipe(): void {
  if (!canSubmitRecipe.value) {
    return
  }

  const now = new Date().toISOString()
  const ingredients = recipeForm.ingredients
    .filter((ingredient) => ingredient.name.trim().length > 0)
    .map((ingredient, index) => ({
      id: `ingredient_${Date.now()}_${index + 1}`,
      name: ingredient.name.trim(),
      amount: Number(ingredient.amount) || 1,
      unit: ingredient.unit,
      category: ingredient.category || undefined,
      note: ingredient.note.trim() || undefined
    }))

  const recipe: Recipe = {
    id: `recipe_${Date.now()}`,
    name: recipeForm.name.trim(),
    description: recipeForm.description.trim() || undefined,
    photo: recipeForm.photo.trim() || undefined,
    mealTypes: [...recipeForm.mealTypes],
    servings: Number(recipeForm.servings) || 1,
    ingredients,
    prepTimeMinutes: Number(recipeForm.prepTimeMinutes) || 0,
    cookTimeMinutes: Number(recipeForm.cookTimeMinutes) || 0,
    tags: recipeForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    difficulty: recipeForm.difficulty,
    season: [...recipeForm.season],
    cuisine: recipeForm.cuisine.trim() || undefined,
    estimatedCost: recipeForm.estimatedCost,
    usageCount: 0,
    lastUsedAt: null,
    isFavorite: recipeForm.isFavorite,
    createdAt: now,
    updatedAt: now
  }

  mealPlannerData.recipes.push(recipe)
  isAddRecipeOpen.value = false
  resetRecipeForm()
}

function submitWeeklyPlan(): void {
  if (!canSubmitWeeklyPlan.value) {
    return
  }

  const now = new Date().toISOString()
  const planId = `weekly_plan_${Date.now()}`

  const plan: WeeklyPlan = {
    id: planId,
    weekStartDate: weeklyPlanForm.weekStartDate,
    weekEndDate: weeklyPlanForm.weekEndDate,
    days: weeklyPlanForm.days.map((day) => ({
      date: day.date,
      day: day.day,
      meals: day.meals
        .filter((meal) => meal.recipeId.length > 0)
        .map((meal, index) => ({
          id: `planned_meal_${Date.now()}_${day.day}_${index + 1}`,
          mealType: meal.mealType,
          recipeId: meal.recipeId,
          servings: Number(meal.servings) || 1,
          note: meal.note.trim() || undefined
        }))
    })),
    createdAt: now,
    updatedAt: now
  }

  mealPlannerData.weeklyPlans.push(plan)
  createdWeeklyPlanSummary.value = {
    id: plan.id,
    weekStartDate: plan.weekStartDate,
    weekEndDate: plan.weekEndDate,
    totalDayCount: plan.days.length,
    plannedDayCount: plan.days.filter((day) => day.meals.length > 0).length,
    plannedMealCount: plan.days.reduce((total, day) => total + day.meals.length, 0),
    totalServings: plan.days.reduce((total, day) => {
      return total + day.meals.reduce((dayTotal, meal) => dayTotal + meal.servings, 0)
    }, 0)
  }
}

function submitPlanEdit(): void {
  if (!selectedPlan.value || !canSubmitPlanEdit.value) {
    return
  }

  const planIndex = mealPlannerData.weeklyPlans.findIndex((plan) => plan.id === selectedPlan.value?.id)

  if (planIndex < 0) {
    return
  }

  const currentPlan = mealPlannerData.weeklyPlans[planIndex]
  const now = new Date().toISOString()

  mealPlannerData.weeklyPlans.splice(planIndex, 1, {
    id: currentPlan.id,
    weekStartDate: planEditForm.weekStartDate,
    weekEndDate: planEditForm.weekEndDate,
    days: planEditForm.days.map((day) => ({
      date: day.date,
      day: day.day,
      meals: day.meals
        .filter((meal) => meal.recipeId.length > 0)
        .map((meal, index) => ({
          id: meal.id ?? `planned_meal_${Date.now()}_${day.day}_${index + 1}`,
          mealType: meal.mealType,
          recipeId: meal.recipeId,
          servings: Number(meal.servings) || 1,
          note: meal.note.trim() || undefined
        }))
    })),
    createdAt: currentPlan.createdAt,
    updatedAt: now
  })

  selectedPlanTab.value = 'plan'
}

function getRecipeName(recipeId: string): string {
  return recipesById.value[recipeId]?.name ?? 'Tarif bulunamadı'
}

function getRecipeTags(meal: PlannedMeal): string[] {
  return recipesById.value[meal.recipeId]?.tags?.slice(0, 2) ?? []
}

function formatDateRange(plan: WeeklyPlan): string {
  return `${formatShortDate(plan.weekStartDate)} - ${formatShortDate(plan.weekEndDate)}`
}

function getWeeklyPlanTitle(plan: WeeklyPlan): string {
  const currentWeekStart = getWeekStartDate(new Date())
  const nextWeekStart = addDays(currentWeekStart, 7)
  const durationWeeks = getPlanDurationWeeks(plan)
  const suffix = durationWeeks === 2 ? ' 2 haftalık plan' : ''

  if (plan.weekStartDate === currentWeekStart) {
    return `Bu hafta${suffix}`
  }

  if (plan.weekStartDate === nextWeekStart) {
    return `Gelecek hafta${suffix}`
  }

  return durationWeeks === 2
    ? `${formatShortDate(plan.weekStartDate)} 2 haftalık plan`
    : `${formatShortDate(plan.weekStartDate)} haftası`
}

function getWeekStartDate(date: Date): string {
  const weekStart = new Date(date)
  const dayIndex = weekStart.getDay()
  const daysSinceMonday = dayIndex === 0 ? 6 : dayIndex - 1
  weekStart.setDate(weekStart.getDate() - daysSinceMonday)
  return toDateInputValue(weekStart)
}

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short'
  }).format(new Date(date))
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 2
  }).format(amount)
}
</script>

<template>
  <main class="app-shell">
    <div class="page-container space-y-6 sm:space-y-8">
      <header class="page-hero">
        <div class="page-hero-copy">
          <div class="max-w-3xl space-y-3">
            <h1 class="page-title">
              Planlar
            </h1>
            <p class="page-description">
              1 veya 2 haftalık yemek planlarını, porsiyonları ve alışveriş hazırlığını tek ekranda takip et.
            </p>
          </div>
        </div>

        <div class="action-row">
          <UButton
            block
            color="primary"
            @click="openCreatePlanModal"
          >
            Plan Yap
          </UButton>
        </div>
      </header>

      <section class="grid gap-5">
        <div class="space-y-5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="section-title">
                Plan listesi
              </p>
              <h2 class="mt-1 text-2xl font-semibold text-meal-ink dark:text-white">
                Kayıtlı planlar
              </h2>
            </div>
            <p class="text-sm text-meal-muted dark:text-alabaster_grey-700">
              {{ weeklyPlans.length }} plan listeleniyor
            </p>
          </div>

          <div class="grid gap-5 xl:grid-cols-2">
            <UCard
              v-for="plan in weeklyPlans"
              :key="plan.id"
              class="plan-card"
              role="button"
              tabindex="0"
              @click="openPlanDetails(plan.id)"
              @keydown.enter.prevent="openPlanDetails(plan.id)"
              @keydown.space.prevent="openPlanDetails(plan.id)"
            >
              <template #header>
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-xl font-semibold text-meal-ink dark:text-white">
                      {{ getWeeklyPlanTitle(plan) }}
                    </h3>
                    <p class="mt-1 text-sm text-meal-muted dark:text-alabaster_grey-700">
                      {{ formatDateRange(plan) }}
                    </p>
                  </div>
                  <UBadge color="primary" variant="subtle">
                    {{ plan.plannedMealCount }} öğün
                  </UBadge>
                </div>
              </template>

              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-meal-muted dark:text-alabaster_grey-700">
                  <span class="font-medium text-meal-ink dark:text-white">
                    {{ plan.plannedDayCount }}/{{ plan.days.length }} gün planlandı
                  </span>
                  <span>
                    {{ plan.totalServings }} porsiyon
                  </span>
                  <span>
                    {{ plan.shoppingItemCount }} alışveriş kalemi
                  </span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="day in plan.days.filter((item) => item.meals.length > 0).slice(0, 4)"
                    :key="day.date"
                    color="gray"
                    variant="soft"
                  >
                    {{ WEEK_DAY_LABELS[day.day] }}: {{ day.meals.length }} öğün
                  </UBadge>
                  <UBadge
                    v-if="plan.plannedDayCount > 4"
                    color="gray"
                    variant="outline"
                  >
                    +{{ plan.plannedDayCount - 4 }} gün
                  </UBadge>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </section>
    </div>

    <UModal
      :model-value="Boolean(selectedPlan)"
      fullscreen
      @update:model-value="(value) => !value && closePlanDetails()"
    >
      <div
        v-if="selectedPlan"
        class="flex min-h-screen flex-col bg-meal-cream text-meal-ink dark:bg-carbon_black-200 dark:text-white"
      >
        <header class="border-b border-meal-line bg-meal-paper/95 px-4 py-4 dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:px-6 lg:px-8">
          <div class="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="section-title">
                Plan detayları
              </p>
              <h2 class="mt-1 text-2xl font-semibold text-meal-ink dark:text-white">
                {{ formatShortDate(selectedPlan.weekStartDate) }} planı
              </h2>
              <p class="mt-1 text-sm text-meal-muted dark:text-alabaster_grey-700">
                {{ formatDateRange(selectedPlan) }}
              </p>
            </div>

            <div class="action-row">
              <UButton
                block
                color="gray"
                variant="soft"
                @click="closePlanDetails"
              >
                Kapat
              </UButton>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto">
          <div class="modal-toolbar">
            <div class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-2 rounded-lg border border-meal-line bg-meal-paper p-1 dark:border-carbon_black-300 dark:bg-carbon_black-400 sm:grid-cols-3">
              <UButton
                type="button"
                block
                :color="selectedPlanTab === 'plan' ? 'primary' : 'gray'"
                :variant="selectedPlanTab === 'plan' ? 'solid' : 'ghost'"
                :class="[
                  selectedPlanTab === 'plan' ? '' : 'bg-transparent'
                ]"
                @click="setPlanDetailTab('plan')"
              >
                Plan Detayı
              </UButton>
              <UButton
                type="button"
                block
                :color="selectedPlanTab === 'shopping' ? 'primary' : 'gray'"
                :variant="selectedPlanTab === 'shopping' ? 'solid' : 'ghost'"
                :class="[
                  selectedPlanTab === 'shopping' ? '' : 'bg-transparent'
                ]"
                @click="setPlanDetailTab('shopping')"
              >
                Alışveriş Listesi
              </UButton>
              <UButton
                type="button"
                block
                :color="selectedPlanTab === 'edit' ? 'primary' : 'gray'"
                :variant="selectedPlanTab === 'edit' ? 'solid' : 'ghost'"
                :class="[
                  selectedPlanTab === 'edit' ? '' : 'bg-transparent'
                ]"
                @click="setPlanDetailTab('edit')"
              >
                Planı Düzenle
              </UButton>
            </div>
          </div>

          <div
            v-if="selectedPlanTab === 'plan'"
            class="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8"
          >
            <section class="space-y-5">
              <div class="stat-grid">
                <div class="stat-tile">
                  <p class="stat-label">
                    Planlanan gün
                    </p>
                    <p class="stat-value">
                    {{ selectedPlan.plannedDayCount }}/{{ selectedPlan.days.length }}
                  </p>
                </div>
                <div class="stat-tile">
                  <p class="stat-label">
                    Toplam öğün
                  </p>
                  <p class="stat-value">
                    {{ selectedPlan.plannedMealCount }}
                  </p>
                </div>
                <div class="stat-tile">
                  <p class="stat-label">
                    Toplam porsiyon
                  </p>
                  <p class="stat-value">
                    {{ selectedPlan.totalServings }}
                  </p>
                </div>
                <div class="stat-tile">
                  <p class="stat-label">
                    Alışveriş kalemi
                  </p>
                  <p class="stat-value">
                    {{ selectedPlan.shoppingItemCount }}
                  </p>
                </div>
              </div>

              <div class="grid gap-4 xl:grid-cols-2">
                <article
                  v-for="day in selectedPlan.days"
                  :key="day.date"
                  class="surface-panel p-5 shadow-none"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="section-title">
                        {{ WEEK_DAY_LABELS[day.day] }}
                      </p>
                      <h3 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                        {{ formatShortDate(day.date) }}
                      </h3>
                    </div>
                    <UBadge
                      :color="day.meals.length > 0 ? 'primary' : 'gray'"
                      variant="subtle"
                    >
                      {{ day.meals.length > 0 ? `${day.meals.length} öğün` : 'Boş' }}
                    </UBadge>
                  </div>

                  <div
                    v-if="day.meals.length > 0"
                    class="mt-4 space-y-3"
                  >
                    <div
                      v-for="meal in day.meals"
                      :key="meal.id"
                      class="rounded-lg border border-mint_leaf-800 bg-mint_leaf-900 p-4 dark:border-mint_leaf-300 dark:bg-mint_leaf-100/60"
                    >
                      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p class="text-xs font-semibold uppercase tracking-wide text-pine_teal-600 dark:text-mint_leaf-700">
                            {{ MEAL_TYPE_LABELS[meal.mealType] }}
                          </p>
                          <h4 class="mt-1 text-lg font-semibold text-meal-ink dark:text-white">
                            {{ getRecipeName(meal.recipeId) }}
                          </h4>
                          <p
                            v-if="meal.note"
                            class="mt-2 text-sm text-meal-muted dark:text-alabaster_grey-800"
                          >
                            {{ meal.note }}
                          </p>
                        </div>
                        <span class="shrink-0 rounded-md bg-white px-3 py-1 text-sm font-semibold text-pine_teal-600 dark:bg-carbon_black-200 dark:text-mint_leaf-700">
                          {{ meal.servings }} porsiyon
                        </span>
                      </div>

                      <div
                        v-if="getRecipeTags(meal).length > 0"
                        class="mt-3 flex flex-wrap gap-2"
                      >
                        <UBadge
                          v-for="tag in getRecipeTags(meal)"
                          :key="tag"
                          color="gray"
                          variant="soft"
                          size="xs"
                        >
                          {{ tag }}
                        </UBadge>
                      </div>
                    </div>
                  </div>

                  <p
                    v-else
                    class="mt-4 rounded-md border border-dashed border-meal-line px-3 py-4 text-sm text-meal-muted dark:border-carbon_black-300 dark:text-alabaster_grey-700"
                  >
                    Bu güne henüz yemek eklenmedi.
                  </p>
                </article>
              </div>
            </section>

            <aside class="space-y-5">
              <div class="surface-panel p-5">
                <p class="section-title">
                  Hafta akışı
                </p>
                <div class="mt-4 space-y-3">
                  <div
                    v-for="day in selectedPlan.days"
                    :key="day.date"
                    class="flex items-center justify-between gap-3 rounded-lg border border-meal-line bg-white p-3 dark:border-carbon_black-300 dark:bg-carbon_black-200"
                  >
                    <div>
                      <p class="font-semibold text-meal-ink dark:text-white">
                        {{ WEEK_DAY_LABELS[day.day] }}
                      </p>
                      <p class="mt-1 text-xs text-meal-muted dark:text-alabaster_grey-700">
                        {{ formatShortDate(day.date) }}
                      </p>
                    </div>
                    <UBadge
                      :color="day.meals.length > 0 ? 'primary' : 'gray'"
                      variant="subtle"
                    >
                      {{ day.meals.length }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <div class="surface-panel p-5">
                <p class="section-title">
                  Kullanılan yemekler
                </p>
                <div class="mt-4 space-y-3">
                  <div
                    v-for="meal in selectedPlan.days.flatMap((day) => day.meals)"
                    :key="meal.id"
                    class="rounded-lg border border-meal-line bg-white p-3 dark:border-carbon_black-300 dark:bg-carbon_black-200"
                  >
                    <p class="font-semibold text-meal-ink dark:text-white">
                      {{ getRecipeName(meal.recipeId) }}
                    </p>
                    <p class="mt-1 text-xs text-meal-muted dark:text-alabaster_grey-700">
                      {{ MEAL_TYPE_LABELS[meal.mealType] }} · {{ meal.servings }} porsiyon
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div
            v-else-if="selectedPlanTab === 'shopping'"
            class="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8"
          >
            <section class="space-y-5">
              <div class="surface-panel p-5">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="section-title">
                      Alışveriş listesi
                    </p>
                    <h3 class="mt-1 text-2xl font-semibold text-meal-ink dark:text-white">
                      Bu planın malzemeleri
                    </h3>
                    <p class="mt-1 text-sm text-meal-muted dark:text-alabaster_grey-700">
                      Planlanan yemeklerin porsiyonlarına göre hesaplandı.
                    </p>
                  </div>
                  <UBadge color="primary" variant="subtle">
                    {{ selectedPlanShoppingItems.length }} kalem
                  </UBadge>
                </div>
              </div>

              <TransitionGroup
                name="shopping-list"
                tag="div"
                class="space-y-3"
              >
                <label
                  v-for="item in selectedPlanShoppingItems"
                  :key="item.id"
                  :class="[
                    'shopping-list-item flex cursor-pointer items-start gap-4 rounded-lg border bg-white p-4 shadow-sm transition dark:bg-carbon_black-200',
                    item.checked
                      ? 'border-stone-200 opacity-70 dark:border-carbon_black-300'
                      : 'border-meal-line dark:border-carbon_black-300'
                  ]"
                >
                  <UCheckbox
                    :model-value="item.checked"
                    class="mt-1"
                    @update:model-value="(value) => { shoppingCheckedState[item.id] = Boolean(value) }"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          :class="[
                            'font-semibold text-meal-ink transition dark:text-white',
                            item.checked ? 'line-through decoration-2 text-meal-muted dark:text-alabaster_grey-600' : ''
                          ]"
                        >
                          {{ item.name }}
                        </p>
                        <p
                          :class="[
                            'mt-1 text-sm text-meal-muted transition dark:text-alabaster_grey-700',
                            item.checked ? 'line-through decoration-1' : ''
                          ]"
                        >
                          {{ formatAmount(item.totalAmount) }} {{ INGREDIENT_UNIT_LABELS[item.unit] }}
                        </p>
                      </div>
                      <UBadge
                        v-if="item.category"
                        :color="item.checked ? 'gray' : 'primary'"
                        variant="subtle"
                      >
                        {{ INGREDIENT_CATEGORY_LABELS[item.category] }}
                      </UBadge>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <UBadge
                        v-for="recipeName in item.recipes"
                        :key="recipeName"
                        color="gray"
                        variant="soft"
                        size="xs"
                      >
                        {{ recipeName }}
                      </UBadge>
                    </div>
                  </div>
                </label>
              </TransitionGroup>
            </section>

            <aside class="space-y-5">
              <div class="surface-panel p-5">
                <p class="section-title">
                  Liste özeti
                </p>
                <dl class="mt-4 space-y-3">
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-sm text-meal-muted dark:text-alabaster_grey-700">
                      Toplam kalem
                    </dt>
                    <dd class="font-semibold text-meal-ink dark:text-white">
                      {{ selectedPlanShoppingItems.length }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-sm text-meal-muted dark:text-alabaster_grey-700">
                      Alındı
                    </dt>
                    <dd class="font-semibold text-meal-ink dark:text-white">
                      {{ selectedPlanCheckedShoppingCount }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-sm text-meal-muted dark:text-alabaster_grey-700">
                      Kalan
                    </dt>
                    <dd class="font-semibold text-meal-ink dark:text-white">
                      {{ selectedPlanShoppingItems.length - selectedPlanCheckedShoppingCount }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div class="rounded-lg border border-mint_leaf-800 bg-mint_leaf-900 p-5 text-sm text-pine_teal-500 dark:border-mint_leaf-300 dark:bg-mint_leaf-100/60 dark:text-mint_leaf-900">
                <p class="font-semibold">
                  İşaretlenenler alta iner
                </p>
                <p class="mt-2 leading-6">
                  Checkbox ile alınan malzemeler çizilir ve animasyonlu olarak listenin altına taşınır.
                </p>
              </div>
            </aside>
          </div>

          <form
            v-else
            class="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8"
            @submit.prevent="submitPlanEdit"
          >
            <section class="space-y-5">
              <div class="surface-panel p-5">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div class="grid flex-1 gap-4 lg:grid-cols-[1fr_1fr_auto]">
                    <label class="space-y-2">
                      <span class="text-sm font-medium text-meal-ink dark:text-white">Hafta başlangıcı</span>
                      <UInput
                        v-model="planEditForm.weekStartDate"
                        type="date"
                        @change="setPlanEditDates(planEditForm.weekStartDate)"
                      />
                    </label>

                    <label class="space-y-2">
                      <span class="text-sm font-medium text-meal-ink dark:text-white">Hafta bitişi</span>
                      <UInput
                        v-model="planEditForm.weekEndDate"
                        type="date"
                        disabled
                      />
                    </label>

                    <div class="space-y-2">
                      <span class="text-sm font-medium text-meal-ink dark:text-white">Plan süresi</span>
                      <div class="grid grid-cols-2 gap-2">
                        <UButton
                          v-for="option in planDurationOptions"
                          :key="option.value"
                          type="button"
                          block
                          :color="planEditForm.planDurationWeeks === option.value ? 'primary' : 'gray'"
                          :variant="planEditForm.planDurationWeeks === option.value ? 'solid' : 'soft'"
                          @click="setPlanEditDuration(option.value)"
                        >
                          {{ option.label }}
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <div class="action-row">
                    <UButton
                      block
                      type="button"
                      color="gray"
                      variant="soft"
                      @click="resetPlanEditForm"
                    >
                      Sıfırla
                    </UButton>
                    <UButton
                      block
                      type="submit"
                      color="primary"
                      :disabled="!canSubmitPlanEdit"
                    >
                      Planı Kaydet
                    </UButton>
                  </div>
                </div>
              </div>

              <div class="grid gap-4">
                <article
                  v-for="(day, dayIndex) in planEditForm.days"
                  :key="day.date"
                  class="surface-panel p-5 shadow-none"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="section-title">
                        {{ WEEK_DAY_LABELS[day.day] }}
                      </p>
                      <h3 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                        {{ formatShortDate(day.date) }}
                      </h3>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge
                        :color="day.meals.length > 0 ? 'primary' : 'gray'"
                        variant="subtle"
                      >
                        {{ day.meals.length > 0 ? `${day.meals.length} öğün` : 'Boş gün' }}
                      </UBadge>
                      <UButton
                        type="button"
                        color="gray"
                        variant="soft"
                        size="sm"
                        @click="addEditPlanMeal(dayIndex)"
                      >
                        Öğün Ekle
                      </UButton>
                    </div>
                  </div>

                  <div
                    v-if="day.meals.length > 0"
                    class="mt-4 space-y-3"
                  >
                    <div
                      v-for="(meal, mealIndex) in day.meals"
                      :key="meal.id ?? mealIndex"
                      class="rounded-lg border border-meal-line bg-white p-4 dark:border-carbon_black-300 dark:bg-carbon_black-200"
                    >
                      <div class="grid gap-3 lg:grid-cols-[0.9fr_1.4fr_0.7fr_auto] lg:items-end">
                        <label class="space-y-2">
                          <span class="text-sm font-medium text-meal-ink dark:text-white">Öğün</span>
                          <USelect
                            v-model="meal.mealType"
                            :options="mealTypeOptions"
                            option-attribute="label"
                            value-attribute="value"
                          />
                        </label>

                        <label class="space-y-2">
                          <span class="text-sm font-medium text-meal-ink dark:text-white">Yemek</span>
                          <USelect
                            v-model="meal.recipeId"
                            :options="recipeOptions"
                            option-attribute="label"
                            value-attribute="value"
                          />
                        </label>

                        <label class="space-y-2">
                          <span class="text-sm font-medium text-meal-ink dark:text-white">Porsiyon</span>
                          <UInput
                            v-model.number="meal.servings"
                            type="number"
                            min="1"
                          />
                        </label>

                        <UButton
                          type="button"
                          color="red"
                          variant="soft"
                          @click="removeEditPlanMeal(dayIndex, mealIndex)"
                        >
                          Sil
                        </UButton>
                      </div>

                      <label class="mt-3 block space-y-2">
                        <span class="text-sm font-medium text-meal-ink dark:text-white">Not</span>
                        <UInput
                          v-model="meal.note"
                          placeholder="Örn. Misafir için fazla yapılacak"
                        />
                      </label>
                    </div>
                  </div>

                  <p
                    v-else
                    class="mt-4 rounded-md border border-dashed border-meal-line px-3 py-4 text-sm text-meal-muted dark:border-carbon_black-300 dark:text-alabaster_grey-700"
                  >
                    Bu güne öğün eklemek için Öğün Ekle butonunu kullan.
                  </p>
                </article>
              </div>
            </section>

            <aside class="space-y-5">
              <div class="surface-panel p-5">
                <p class="section-title">
                  Düzenleme özeti
                </p>
                <dl class="mt-4 space-y-3">
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-sm text-meal-muted dark:text-alabaster_grey-700">
                      Planlanan gün
                    </dt>
                    <dd class="font-semibold text-meal-ink dark:text-white">
                      {{ planEditForm.days.filter((day) => day.meals.length > 0).length }}/{{ planEditForm.days.length }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-sm text-meal-muted dark:text-alabaster_grey-700">
                      Toplam öğün
                    </dt>
                    <dd class="font-semibold text-meal-ink dark:text-white">
                      {{ planEditForm.days.reduce((total, day) => total + day.meals.length, 0) }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-sm text-meal-muted dark:text-alabaster_grey-700">
                      Toplam porsiyon
                    </dt>
                    <dd class="font-semibold text-meal-ink dark:text-white">
                      {{ planEditForm.days.reduce((total, day) => total + day.meals.reduce((dayTotal, meal) => dayTotal + Number(meal.servings || 0), 0), 0) }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div class="rounded-lg border border-amber-100 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <p class="font-semibold">
                  Kaydetmeden önce
                </p>
                <p class="mt-2 leading-6">
                  Bu sekmedeki değişiklikler Planı Kaydet butonuna basınca mevcut planın üzerine yazılır.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </UModal>

    <UModal
      v-model="isAddRecipeOpen"
      fullscreen
    >
      <form
        class="flex min-h-screen flex-col bg-meal-cream text-meal-ink dark:bg-carbon_black-200 dark:text-white"
        @submit.prevent="submitRecipe"
      >
        <header class="border-b border-meal-line bg-meal-paper/95 px-4 py-4 dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:px-6 lg:px-8">
          <div class="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="section-title">
                  Yeni yemek
                </p>
                <h2 class="mt-1 truncate text-2xl font-semibold text-meal-ink dark:text-white">
                  Yemek ekle
                </h2>
              </div>
              <UButton
                class="shrink-0"
                type="button"
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                aria-label="Yemek eklemeyi kapat"
                @click="isAddRecipeOpen = false"
              />
            </div>

            <div class="action-row">
              <UButton
                block
                type="submit"
                color="primary"
                :disabled="!canSubmitRecipe"
              >
                Yemeği Kaydet
              </UButton>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto">
          <div class="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <section class="space-y-5">
              <div class="surface-panel p-5">
                <p class="section-title">
                  Temel bilgiler
                </p>
                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                  <label class="space-y-2 sm:col-span-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Yemek adı</span>
                    <UInput
                      v-model="recipeForm.name"
                      placeholder="Örn. Zeytinyağlı taze fasulye"
                    />
                  </label>

                  <label class="space-y-2 sm:col-span-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Açıklama</span>
                    <UTextarea
                      v-model="recipeForm.description"
                      :rows="3"
                      placeholder="Kısa tarif açıklaması"
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Porsiyon</span>
                    <UInput
                      v-model.number="recipeForm.servings"
                      type="number"
                      min="1"
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Mutfak</span>
                    <UInput
                      v-model="recipeForm.cuisine"
                      placeholder="Örn. Türk mutfağı"
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Hazırlık süresi</span>
                    <UInput
                      v-model.number="recipeForm.prepTimeMinutes"
                      type="number"
                      min="0"
                    >
                      <template #trailing>
                        <span class="text-xs text-meal-muted dark:text-alabaster_grey-700">dk</span>
                      </template>
                    </UInput>
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Pişirme süresi</span>
                    <UInput
                      v-model.number="recipeForm.cookTimeMinutes"
                      type="number"
                      min="0"
                    >
                      <template #trailing>
                        <span class="text-xs text-meal-muted dark:text-alabaster_grey-700">dk</span>
                      </template>
                    </UInput>
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Zorluk</span>
                    <USelect
                      v-model="recipeForm.difficulty"
                      :options="difficultyOptions"
                      option-attribute="label"
                      value-attribute="value"
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Tahmini maliyet</span>
                    <USelect
                      v-model="recipeForm.estimatedCost"
                      :options="costOptions"
                      option-attribute="label"
                      value-attribute="value"
                    />
                  </label>

                  <label class="space-y-2 sm:col-span-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Etiketler</span>
                    <UInput
                      v-model="recipeForm.tags"
                      placeholder="pratik, vejetaryen, aile"
                    />
                  </label>
                </div>
              </div>

              <div class="surface-panel p-5">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="section-title">
                      Malzemeler
                    </p>
                    <h3 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                      Tarif malzemeleri
                    </h3>
                  </div>
                  <UButton
                    type="button"
                    color="gray"
                    variant="soft"
                    size="sm"
                    @click="addIngredient"
                  >
                    Malzeme Ekle
                  </UButton>
                </div>

                <div class="mt-4 space-y-3">
                  <div
                    v-for="(ingredient, index) in recipeForm.ingredients"
                    :key="index"
                    class="rounded-lg border border-meal-line bg-white p-4 dark:border-carbon_black-300 dark:bg-carbon_black-200"
                  >
                    <div class="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.8fr_1fr_auto] md:items-end">
                      <label class="space-y-2">
                        <span class="text-sm font-medium text-meal-ink dark:text-white">Malzeme</span>
                        <UInput
                          v-model="ingredient.name"
                          placeholder="Örn. Domates"
                        />
                      </label>

                      <label class="space-y-2">
                        <span class="text-sm font-medium text-meal-ink dark:text-white">Miktar</span>
                        <UInput
                          v-model.number="ingredient.amount"
                          type="number"
                          min="0"
                          step="0.5"
                        />
                      </label>

                      <label class="space-y-2">
                        <span class="text-sm font-medium text-meal-ink dark:text-white">Birim</span>
                        <USelect
                          v-model="ingredient.unit"
                          :options="unitOptions"
                          option-attribute="label"
                          value-attribute="value"
                        />
                      </label>

                      <label class="space-y-2">
                        <span class="text-sm font-medium text-meal-ink dark:text-white">Kategori</span>
                        <USelect
                          v-model="ingredient.category"
                          :options="[{ value: '', label: 'Seçiniz' }, ...categoryOptions]"
                          option-attribute="label"
                          value-attribute="value"
                        />
                      </label>

                      <UButton
                        type="button"
                        color="red"
                        variant="soft"
                        @click="removeIngredient(index)"
                      >
                        Sil
                      </UButton>
                    </div>

                    <label class="mt-3 block space-y-2">
                      <span class="text-sm font-medium text-meal-ink dark:text-white">Not</span>
                      <UInput
                        v-model="ingredient.note"
                        placeholder="Opsiyonel malzeme notu"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <aside class="space-y-5">
              <div class="surface-panel p-5">
                <label class="space-y-2">
                  <span class="section-title">Öğün tipi</span>
                  <USelectMenu
                    v-model="recipeForm.mealTypes"
                    :options="mealTypeOptions"
                    multiple
                    option-attribute="label"
                    value-attribute="value"
                    placeholder="Öğün tipi seç"
                  />
                </label>
              </div>

              <div class="surface-panel p-5">
                <label class="space-y-2">
                  <span class="section-title">Sezon</span>
                  <USelectMenu
                    :model-value="recipeForm.season"
                    :options="seasonOptions"
                    multiple
                    option-attribute="label"
                    value-attribute="value"
                    placeholder="Sezon seç"
                    @update:model-value="(value) => setRecipeSeasons(value as Season[])"
                  />
                </label>
              </div>

              <div class="surface-panel p-5">
                <p class="section-title">
                  Ek bilgiler
                </p>
                <div class="mt-4 space-y-4">
                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Fotoğraf URL</span>
                    <UInput
                      v-model="recipeForm.photo"
                      placeholder="https://..."
                    />
                  </label>

                  <div class="flex items-center justify-between rounded-lg border border-meal-line bg-white p-3 text-sm text-meal-ink dark:border-carbon_black-300 dark:bg-carbon_black-200 dark:text-white">
                    <span>Favori yemek olarak işaretle</span>
                    <UCheckbox v-model="recipeForm.isFavorite" />
                  </div>

                  <div class="rounded-lg border border-meal-line bg-white p-4 dark:border-carbon_black-300 dark:bg-carbon_black-200">
                    <p class="text-sm font-semibold text-meal-ink dark:text-white">
                      Kaydedilecek özet
                    </p>
                    <dl class="mt-3 space-y-2 text-sm">
                      <div class="flex items-center justify-between gap-3">
                        <dt class="text-meal-muted dark:text-alabaster_grey-700">Öğün tipi</dt>
                        <dd class="font-semibold">{{ recipeForm.mealTypes.length }}</dd>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <dt class="text-meal-muted dark:text-alabaster_grey-700">Malzeme</dt>
                        <dd class="font-semibold">{{ recipeForm.ingredients.filter((item) => item.name.trim()).length }}</dd>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <dt class="text-meal-muted dark:text-alabaster_grey-700">Süre</dt>
                        <dd class="font-semibold">{{ recipeForm.prepTimeMinutes + recipeForm.cookTimeMinutes }} dk</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </form>
    </UModal>

    <UModal
      v-model="isCreatePlanOpen"
      fullscreen
    >
      <form
        class="flex min-h-screen flex-col bg-meal-cream text-meal-ink dark:bg-carbon_black-200 dark:text-white"
        @submit.prevent="submitWeeklyPlan"
      >
        <header class="sticky top-0 z-20 border-b border-meal-line bg-meal-paper/95 px-4 py-3 backdrop-blur dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:px-6 sm:py-4 lg:px-8">
          <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 pr-11 sm:gap-4 sm:pr-14">
            <div class="flex items-center justify-between gap-4 sm:items-start">
              <div class="min-w-0">
                <p class="section-title">
                  Yeni plan
                </p>
                <h2 class="mt-1 truncate text-lg font-semibold text-meal-ink dark:text-white sm:text-2xl">
                  {{ createdWeeklyPlanSummary ? 'Plan kaydedildi' : 'Plan oluştur' }}
                </h2>
                <p class="mt-2 hidden max-w-2xl text-sm leading-6 text-meal-muted dark:text-alabaster_grey-700 sm:block">
                  {{ createdWeeklyPlanSummary ? 'Planın hazır. Özetten kontrol edip modalı kapatabilirsin.' : '1 veya 2 haftalık aralığı seç, günlere öğün ekle ve planı kaydet.' }}
                </p>
              </div>

              <UButton
                class="absolute right-4 top-4 sm:right-6 lg:right-8"
                type="button"
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                aria-label="Plan oluşturmayı kapat"
                @click="closeCreatePlanModal"
              />
            </div>

            <div
              v-if="!createdWeeklyPlanSummary"
              class="hidden sm:grid sm:self-end"
            >
              <UButton
                block
                type="submit"
                color="primary"
                :disabled="!canSubmitWeeklyPlan"
              >
                Planı Kaydet
              </UButton>
            </div>
          </div>
        </header>

        <div
          v-if="createdWeeklyPlanSummary"
          class="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
        >
          <section class="surface-panel w-full max-w-xl p-5 sm:p-6">
            <div class="flex items-start gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-mint_leaf-900 text-pine_teal-500 dark:bg-mint_leaf-100 dark:text-mint_leaf-900">
                <UIcon
                  name="i-heroicons-check-20-solid"
                  class="size-5"
                />
              </div>
              <div>
                <p class="section-title">
                  Kayit tamamlandi
                </p>
                <h3 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                  {{ formatShortDate(createdWeeklyPlanSummary.weekStartDate) }} - {{ formatShortDate(createdWeeklyPlanSummary.weekEndDate) }} planı oluşturuldu
                </h3>
                <p class="mt-2 text-sm leading-6 text-meal-muted dark:text-alabaster_grey-700">
                  Plan listesine eklendi ve plan görünümünde kullanılmaya hazır.
                </p>
              </div>
            </div>

            <dl class="mt-5 grid grid-cols-3 gap-2 text-center">
              <div class="stat-tile">
                <dt class="stat-label">Gun</dt>
                <dd class="stat-value">{{ createdWeeklyPlanSummary.plannedDayCount }}/{{ createdWeeklyPlanSummary.totalDayCount }}</dd>
              </div>
              <div class="stat-tile">
                <dt class="stat-label">Ogun</dt>
                <dd class="stat-value">{{ createdWeeklyPlanSummary.plannedMealCount }}</dd>
              </div>
              <div class="stat-tile">
                <dt class="stat-label">Porsiyon</dt>
                <dd class="stat-value">{{ createdWeeklyPlanSummary.totalServings }}</dd>
              </div>
            </dl>

            <UButton
              block
              class="mt-5"
              type="button"
              color="primary"
              @click="closeCreatePlanModal"
            >
              Modalı Kapat
            </UButton>
          </section>
        </div>

        <div
          v-else
          class="flex-1 overflow-y-auto"
        >
          <div class="mx-auto w-full max-w-7xl px-4 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-6 lg:px-8">
            <section class="space-y-5">

              <div class="surface-panel p-5">
                <div class="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Hafta başlangıcı</span>
                    <UInput
                      v-model="weeklyPlanForm.weekStartDate"
                      type="date"
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Hafta bitişi</span>
                    <UInput
                      v-model="weeklyPlanForm.weekEndDate"
                      type="date"
                      disabled
                    />
                  </label>

                  <div class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Plan süresi</span>
                    <div class="grid grid-cols-2 gap-2">
                      <UButton
                        v-for="option in planDurationOptions"
                        :key="option.value"
                        type="button"
                        block
                        :color="weeklyPlanForm.planDurationWeeks === option.value ? 'primary' : 'gray'"
                        :variant="weeklyPlanForm.planDurationWeeks === option.value ? 'solid' : 'soft'"
                        @click="setWeeklyPlanDuration(option.value)"
                      >
                        {{ option.label }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid gap-4">
                <article
                  v-for="(day, dayIndex) in weeklyPlanForm.days"
                  :key="day.date"
                  class="surface-panel p-5 shadow-none"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="section-title">
                        {{ WEEK_DAY_LABELS[day.day] }}
                      </p>
                      <h3 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                        {{ formatShortDate(day.date) }}
                      </h3>
                    </div>

                    <UBadge
                      class="shrink-0"
                      :color="day.meals.length > 0 ? 'primary' : 'gray'"
                      variant="subtle"
                    >
                      {{ day.meals.length > 0 ? `${day.meals.length} ogun` : 'Bos gun' }}
                    </UBadge>
                  </div>

                  <UButton
                    class="mt-4"
                    type="button"
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-heroicons-plus-20-solid"
                    @click="addPlanMeal(dayIndex)"
                  >
                    Öğün Ekle
                  </UButton>

                  <div
                    v-if="day.meals.length > 0"
                    class="mt-4 space-y-3"
                  >
                    <div
                      v-for="(meal, mealIndex) in day.meals"
                      :key="mealIndex"
                      class="rounded-lg border border-meal-line bg-white p-4 dark:border-carbon_black-300 dark:bg-carbon_black-200"
                    >
                      <div class="grid gap-3 lg:grid-cols-[0.9fr_1.4fr_0.7fr] lg:items-end">
                        <label class="space-y-2">
                          <span class="text-sm font-medium text-meal-ink dark:text-white">Öğün</span>
                          <USelect
                            v-model="meal.mealType"
                            :options="mealTypeOptions"
                            option-attribute="label"
                            value-attribute="value"
                          />
                        </label>

                        <label class="space-y-2">
                          <span class="text-sm font-medium text-meal-ink dark:text-white">Yemek</span>
                          <USelectMenu
                            v-model="meal.recipeId"
                            :options="recipeOptions"
                            option-attribute="label"
                            value-attribute="value"
                            searchable
                            searchable-placeholder="Yemek ara..."
                            placeholder="Yemek seç"
                          />
                        </label>

                        <label class="space-y-2">
                          <span class="text-sm font-medium text-meal-ink dark:text-white">Porsiyon</span>
                          <UInput
                            v-model.number="meal.servings"
                            type="number"
                            min="1"
                          />
                        </label>
                      </div>

                      <label class="mt-3 block space-y-2">
                        <span class="text-sm font-medium text-meal-ink dark:text-white">Not</span>
                        <UInput
                          v-model="meal.note"
                          placeholder="Örn. Misafir için fazla yapılacak"
                        />
                      </label>

                      <UButton
                        class="mt-3"
                        type="button"
                        color="red"
                        variant="soft"
                        icon="i-heroicons-trash-20-solid"
                        @click="removePlanMeal(dayIndex, mealIndex)"
                      >
                        Sil
                      </UButton>
                    </div>
                  </div>

                  <p
                    v-else
                    class="mt-4 rounded-md border border-dashed border-meal-line px-3 py-4 text-sm text-meal-muted dark:border-carbon_black-300 dark:text-alabaster_grey-700"
                  >
                    Bu güne öğün eklemek için Öğün Ekle butonunu kullan.
                  </p>
                </article>
              </div>
            </section>
          </div>

          <div
            v-if="!createdWeeklyPlanSummary"
            class="sticky bottom-0 z-20 border-t border-meal-line bg-meal-paper/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:hidden"
          >
            <UButton
              block
              type="submit"
              color="primary"
              :disabled="!canSubmitWeeklyPlan"
            >
              Planı Kaydet
            </UButton>
          </div>
        </div>
      </form>
    </UModal>
  </main>
</template>

<style scoped>
.shopping-list-move,
.shopping-list-enter-active,
.shopping-list-leave-active {
  transition:
    transform 220ms ease,
    opacity 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;
}

.shopping-list-enter-from,
.shopping-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.shopping-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
