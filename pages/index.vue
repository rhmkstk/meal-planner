<script setup lang="ts">
import {
  calculatePlannedIngredientAmount,
  INGREDIENT_CATEGORY_LABELS,
  INGREDIENT_UNIT_LABELS,
  MEAL_TYPE_LABELS,
  WEEK_DAY_LABELS
} from '~/types/meal-planner'
import type {
  IngredientCategory,
  IngredientUnit,
  MealType,
  PlannedMeal,
  Recipe,
  WeekDay,
  WeeklyPlan
} from '~/types/meal-planner'

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

type PlanMealListItem = {
  dayDate: string
  dayLabel: string
  meal: PlannedMeal
}

const {
  mealPlannerData: mealPlannerState,
  refreshMealPlannerData,
  saveWeeklyPlan
} = useMealPlanner()
const mealPlannerData = reactive(mealPlannerState.value)
const selectedPlanId = ref<string | null>(null)
const selectedPlanTab = ref<PlanDetailTab>('plan')
const selectedPlanViewMode = ref<'days' | 'list'>('days')
const shoppingCheckedState = reactive<Record<string, boolean>>({})
const isPlanSubmitting = ref(false)
const planSubmitError = ref('')

const mealTypeOptions = Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => ({
  value: value as MealType,
  label
}))

const planDurationOptions = [
  { value: 1 as const, label: '1 Hafta' },
  { value: 2 as const, label: '2 Hafta' }
]

const planEditForm = reactive<WeeklyPlanForm>(createWeeklyPlanForm())

watch(
  mealPlannerState,
  (data) => {
    Object.assign(mealPlannerData, data)
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  refreshMealPlannerData()
})

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

const selectedPlanMealList = computed<PlanMealListItem[]>(() => {
  if (!selectedPlan.value) {
    return []
  }

  return selectedPlan.value.days.flatMap((day) => {
    return day.meals.map((meal) => ({
      dayDate: day.date,
      dayLabel: WEEK_DAY_LABELS[day.day],
      meal
    }))
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

const canSubmitPlanEdit = computed(() => {
  return planEditForm.weekStartDate.length > 0 && planEditForm.weekEndDate.length > 0
})

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

function openCreatePlanPage(): void {
  navigateTo('/plans/new')
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

function addEditPlanMeal(dayIndex: number): void {
  planEditForm.days[dayIndex].meals.push(createPlanMealForm())
}

function removeEditPlanMeal(dayIndex: number, mealIndex: number): void {
  planEditForm.days[dayIndex].meals.splice(mealIndex, 1)
}

async function submitPlanEdit(): Promise<void> {
  planSubmitError.value = ''

  if (!selectedPlan.value || !canSubmitPlanEdit.value) {
    return
  }

  const currentPlan = mealPlannerData.weeklyPlans.find((plan) => plan.id === selectedPlan.value?.id)

  if (!currentPlan) {
    return
  }

  const now = new Date().toISOString()

  isPlanSubmitting.value = true

  try {
    await saveWeeklyPlan({
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
  } catch (error) {
    planSubmitError.value = error instanceof Error ? error.message : 'Plan kaydedilemedi.'
  } finally {
    isPlanSubmitting.value = false
  }
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
            @click="openCreatePlanPage"
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

              <div class="surface-panel p-3 shadow-none">
                <div class="grid gap-2 sm:grid-cols-2">
                  <UButton
                    type="button"
                    block
                    :color="selectedPlanViewMode === 'days' ? 'primary' : 'gray'"
                    :variant="selectedPlanViewMode === 'days' ? 'solid' : 'ghost'"
                    :class="[
                      selectedPlanViewMode === 'days' ? '' : 'bg-transparent'
                    ]"
                    @click="selectedPlanViewMode = 'days'"
                  >
                    Gunler
                  </UButton>
                  <UButton
                    type="button"
                    block
                    :color="selectedPlanViewMode === 'list' ? 'primary' : 'gray'"
                    :variant="selectedPlanViewMode === 'list' ? 'solid' : 'ghost'"
                    :class="[
                      selectedPlanViewMode === 'list' ? '' : 'bg-transparent'
                    ]"
                    @click="selectedPlanViewMode = 'list'"
                  >
                    Liste
                  </UButton>
                </div>
              </div>

              <div
                v-if="selectedPlanViewMode === 'days'"
                class="grid gap-4 xl:grid-cols-2"
              >
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

              <div
                v-else-if="selectedPlanMealList.length > 0"
                class="grid gap-3 md:grid-cols-2"
              >
                <article
                  v-for="item in selectedPlanMealList"
                  :key="item.meal.id"
                  class="rounded-lg border border-mint_leaf-800 bg-mint_leaf-900 p-4 dark:border-mint_leaf-300 dark:bg-mint_leaf-100/60"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0">
                      <div class="flex flex-wrap gap-2">
                        <UBadge
                          color="gray"
                          variant="soft"
                        >
                          {{ item.dayLabel }} - {{ formatShortDate(item.dayDate) }}
                        </UBadge>
                        <UBadge
                          color="primary"
                          variant="subtle"
                        >
                          {{ MEAL_TYPE_LABELS[item.meal.mealType] }}
                        </UBadge>
                      </div>
                      <h4 class="mt-3 text-lg font-semibold text-meal-ink dark:text-white">
                        {{ getRecipeName(item.meal.recipeId) }}
                      </h4>
                      <p
                        v-if="item.meal.note"
                        class="mt-2 text-sm text-meal-muted dark:text-alabaster_grey-800"
                      >
                        {{ item.meal.note }}
                      </p>
                    </div>
                    <span class="shrink-0 rounded-md bg-white px-3 py-1 text-sm font-semibold text-pine_teal-600 dark:bg-carbon_black-200 dark:text-mint_leaf-700">
                      {{ item.meal.servings }} porsiyon
                    </span>
                  </div>

                  <div
                    v-if="getRecipeTags(item.meal).length > 0"
                    class="mt-3 flex flex-wrap gap-2"
                  >
                    <UBadge
                      v-for="tag in getRecipeTags(item.meal)"
                      :key="tag"
                      color="gray"
                      variant="soft"
                      size="xs"
                    >
                      {{ tag }}
                    </UBadge>
                  </div>
                </article>
              </div>

              <p
                v-else
                class="rounded-md border border-dashed border-meal-line px-3 py-4 text-sm text-meal-muted dark:border-carbon_black-300 dark:text-alabaster_grey-700"
              >
                Bu planda henüz yemek yok.
              </p>
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
                      :disabled="!canSubmitPlanEdit || isPlanSubmitting"
                      :loading="isPlanSubmitting"
                    >
                      Planı Kaydet
                    </UButton>
                  </div>
                </div>
              </div>

              <div class="grid gap-4">
                <UAlert
                  v-if="planSubmitError"
                  color="red"
                  variant="soft"
                  title="Plan kaydedilemedi"
                  :description="planSubmitError"
                />

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
