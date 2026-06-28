<script setup lang="ts">
import {
  INGREDIENT_UNIT_LABELS,
  MEAL_TYPE_LABELS,
  WEEK_DAY_LABELS,
  calculatePlannedIngredientAmount
} from '~/types/meal-planner'
import type {
  IngredientCategory,
  IngredientUnit,
  PlannedMeal,
  Recipe,
  WeeklyPlan
} from '~/types/meal-planner'

type ShoppingListUiItem = {
  id: string
  name: string
  totalAmount: number
  unit: IngredientUnit
  category?: IngredientCategory
  checked: boolean
}

type PlanMealListItem = {
  dayDate: string
  dayLabel: string
  meal: PlannedMeal
}

const route = useRoute()
const {
  mealPlannerData: mealPlannerState,
  refreshMealPlannerData
} = useMealPlanner()
const mealPlannerData = reactive(mealPlannerState.value)
const activeTab = ref<'plan' | 'shopping'>('plan')
const planViewMode = ref<'days' | 'list'>('days')
const shoppingCheckedState = reactive<Record<string, boolean>>({})
const shoppingSortCheckedState = reactive<Record<string, boolean>>({})
const recentlyUpdatedShoppingItemId = ref<string | null>(null)
let shoppingFeedbackTimer: ReturnType<typeof setTimeout> | null = null
const shoppingMoveTimers = new Map<string, ReturnType<typeof setTimeout>>()

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

onBeforeUnmount(() => {
  if (shoppingFeedbackTimer) {
    clearTimeout(shoppingFeedbackTimer)
  }

  shoppingMoveTimers.forEach((timer) => clearTimeout(timer))
  shoppingMoveTimers.clear()
})

const plan = computed(() => {
  const planId = String(route.params.id)
  const weeklyPlan = mealPlannerData.weeklyPlans.find((item) => item.id === planId)

  if (!weeklyPlan) {
    return null
  }

  const plannedMeals = weeklyPlan.days.flatMap((day) => day.meals)
  return {
    ...weeklyPlan,
    plannedDayCount: weeklyPlan.days.filter((day) => day.meals.length > 0).length,
    plannedMealCount: plannedMeals.length,
    totalServings: plannedMeals.reduce((total, meal) => total + meal.servings, 0)
  }
})

const shoppingItems = computed<ShoppingListUiItem[]>(() => {
  if (!plan.value) {
    return []
  }

  const itemMap = new Map<string, ShoppingListUiItem>()

  plan.value.days.forEach((day) => {
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

          return
        }

        itemMap.set(id, {
          id,
          name: ingredient.name,
          totalAmount: plannedAmount,
          unit: ingredient.unit,
          category,
          checked: shoppingCheckedState[id] ?? false
        })
      })
    })
  })

  return [...itemMap.values()]
    .map((item) => ({
      ...item,
      checked: shoppingCheckedState[item.id] ?? item.checked
    }))
    .sort(sortShoppingItems)
})

const planMealList = computed<PlanMealListItem[]>(() => {
  if (!plan.value) {
    return []
  }

  return plan.value.days.flatMap((day) => {
    return day.meals.map((meal) => ({
      dayDate: day.date,
      dayLabel: WEEK_DAY_LABELS[day.day],
      meal
    }))
  })
})

function getRecipeName(recipeId: string): string {
  return recipesById.value[recipeId]?.name ?? 'Tarif bulunamadı'
}

function getRecipeTags(meal: PlannedMeal): string[] {
  return recipesById.value[meal.recipeId]?.tags?.slice(0, 2) ?? []
}

function formatDateRange(weeklyPlan: WeeklyPlan): string {
  return `${formatShortDate(weeklyPlan.weekStartDate)} - ${formatShortDate(weeklyPlan.weekEndDate)}`
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

function setShoppingItemChecked(itemId: string, checked: boolean): void {
  shoppingCheckedState[itemId] = checked
  recentlyUpdatedShoppingItemId.value = itemId

  const existingMoveTimer = shoppingMoveTimers.get(itemId)

  if (existingMoveTimer) {
    clearTimeout(existingMoveTimer)
  }

  shoppingMoveTimers.set(itemId, setTimeout(() => {
    shoppingSortCheckedState[itemId] = checked
    shoppingMoveTimers.delete(itemId)
  }, 500))

  if (shoppingFeedbackTimer) {
    clearTimeout(shoppingFeedbackTimer)
  }

  shoppingFeedbackTimer = setTimeout(() => {
    recentlyUpdatedShoppingItemId.value = null
    shoppingFeedbackTimer = null
  }, 1300)
}

function sortShoppingItems(first: ShoppingListUiItem, second: ShoppingListUiItem): number {
  const firstSortChecked = shoppingSortCheckedState[first.id] ?? false
  const secondSortChecked = shoppingSortCheckedState[second.id] ?? false

  if (firstSortChecked !== secondSortChecked) {
    return firstSortChecked ? 1 : -1
  }

  return first.name.localeCompare(second.name, 'tr-TR')
}
</script>

<template>
  <main class="app-shell">
    <div class="page-container space-y-6 sm:space-y-8">
      <header class="page-hero">
        <div class="page-hero-copy">
          <div
            v-if="plan"
            class="space-y-3"
          >
            <h1 class="page-title">
              Plan detayları
            </h1>
            <p class="page-description">
              {{ formatDateRange(plan) }} planının yemekleri, porsiyonları ve alışveriş özeti.
            </p>
          </div>
        </div>
      </header>

      <template v-if="plan">
        <section class="stat-grid">
          <div class="stat-tile">
            <p class="stat-label">
              Planlanan gün
            </p>
            <p class="stat-value">
              {{ plan.plannedDayCount }}/{{ plan.days.length }}
            </p>
          </div>
          <div class="stat-tile">
            <p class="stat-label">
              Toplam öğün
            </p>
            <p class="stat-value">
              {{ plan.plannedMealCount }}
            </p>
          </div>
          <div class="stat-tile">
            <p class="stat-label">
              Toplam porsiyon
            </p>
            <p class="stat-value">
              {{ plan.totalServings }}
            </p>
          </div>
          <div class="stat-tile">
            <p class="stat-label">
              Alışveriş kalemi
            </p>
            <p class="stat-value">
              {{ shoppingItems.length }}
            </p>
          </div>
        </section>

        <nav
          class="inline-grid w-full grid-cols-2 rounded-lg border border-meal-line bg-meal-paper p-1 shadow-sm dark:border-carbon_black-300 dark:bg-carbon_black-400 sm:w-auto"
          aria-label="Plan detay sekmeleri"
        >
          <button
            type="button"
            :class="[
              'rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint_leaf-500',
              activeTab === 'plan'
                ? 'bg-mint_leaf-900 text-pine_teal-500 dark:bg-mint_leaf-100 dark:text-mint_leaf-900'
                : 'text-meal-muted hover:bg-alabaster_grey-900 hover:text-meal-ink dark:text-alabaster_grey-700 dark:hover:bg-carbon_black-300 dark:hover:text-white'
            ]"
            @click="activeTab = 'plan'"
          >
            Plan
          </button>
          <button
            type="button"
            :class="[
              'rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint_leaf-500',
              activeTab === 'shopping'
                ? 'bg-mint_leaf-900 text-pine_teal-500 dark:bg-mint_leaf-100 dark:text-mint_leaf-900'
                : 'text-meal-muted hover:bg-alabaster_grey-900 hover:text-meal-ink dark:text-alabaster_grey-700 dark:hover:bg-carbon_black-300 dark:hover:text-white'
            ]"
            @click="activeTab = 'shopping'"
          >
            Alışveriş Listesi
          </button>
        </nav>

        <section
          v-if="activeTab === 'plan'"
          class="grid gap-5"
        >
          <div class="surface-panel p-3">
            <div class="grid grid-cols-2 gap-2">
              <UButton
                type="button"
                block
                :color="planViewMode === 'days' ? 'primary' : 'gray'"
                :variant="planViewMode === 'days' ? 'solid' : 'ghost'"
                :class="[
                  planViewMode === 'days' ? '' : 'bg-transparent'
                ]"
                @click="planViewMode = 'days'"
              >
                Günler
              </UButton>
              <UButton
                type="button"
                block
                :color="planViewMode === 'list' ? 'primary' : 'gray'"
                :variant="planViewMode === 'list' ? 'solid' : 'ghost'"
                :class="[
                  planViewMode === 'list' ? '' : 'bg-transparent'
                ]"
                @click="planViewMode = 'list'"
              >
                Liste
              </UButton>
            </div>
          </div>

          <div
            v-if="planViewMode === 'days'"
            class="grid gap-4 xl:grid-cols-2"
          >
            <article
              v-for="day in plan.days"
              :key="day.date"
              class="surface-panel p-5 shadow-none"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="section-title">
                    {{ WEEK_DAY_LABELS[day.day] }}
                  </p>
                  <h2 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                    {{ formatShortDate(day.date) }}
                  </h2>
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
                      <h3 class="mt-1 text-lg font-semibold text-meal-ink dark:text-white">
                        {{ getRecipeName(meal.recipeId) }}
                      </h3>
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
            v-else-if="planMealList.length > 0"
            class="grid gap-3 md:grid-cols-2"
          >
            <article
              v-for="item in planMealList"
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
                  <h3 class="mt-3 text-lg font-semibold text-meal-ink dark:text-white">
                    {{ getRecipeName(item.meal.recipeId) }}
                  </h3>
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

        <section
          v-else
          class="surface-panel p-5"
        >
          <TransitionGroup
            v-if="shoppingItems.length > 0"
            tag="div"
            name="shopping-item"
            class="grid gap-3 md:grid-cols-2"
          >
            <label
              v-for="item in shoppingItems"
              :key="item.id"
              :class="[
                'relative flex cursor-pointer gap-3 rounded-lg border bg-white p-4 transition duration-500 dark:bg-carbon_black-200',
                item.checked
                  ? 'border-mint_leaf-700 bg-mint_leaf-900/70 text-meal-muted dark:border-mint_leaf-300 dark:bg-mint_leaf-100/20 dark:text-alabaster_grey-700'
                  : 'border-meal-line text-meal-ink hover:border-mint_leaf-700 dark:border-carbon_black-300 dark:text-white dark:hover:border-mint_leaf-300',
                recentlyUpdatedShoppingItemId === item.id
                  ? 'ring-2 ring-mint_leaf-600 ring-offset-2 ring-offset-meal-paper dark:ring-mint_leaf-500 dark:ring-offset-carbon_black-400'
                  : ''
              ]"
            >
              <UCheckbox
                :model-value="item.checked"
                class="mt-1"
                @update:model-value="setShoppingItemChecked(item.id, Boolean($event))"
              />
              <span class="min-w-0 flex-1">
                <span class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <span>
                    <span
                      :class="[
                        'block font-semibold',
                        item.checked ? 'line-through' : ''
                      ]"
                    >
                      {{ item.name }}
                    </span>
                    <span class="mt-1 block text-sm text-meal-muted dark:text-alabaster_grey-700">
                      {{ formatAmount(item.totalAmount) }} {{ INGREDIENT_UNIT_LABELS[item.unit] }}
                    </span>
                  </span>
                </span>
              </span>
            </label>
          </TransitionGroup>

          <div
            v-else
            class="mt-5 rounded-md border border-dashed border-meal-line px-4 py-8 text-center text-sm text-meal-muted dark:border-carbon_black-300 dark:text-alabaster_grey-700"
          >
            Bu plan için alışveriş kalemi bulunamadı.
          </div>
        </section>
      </template>

      <section
        v-else
        class="surface-panel p-5"
      >
        <p class="section-title">
          Plan bulunamadı
        </p>
        <h1 class="mt-1 text-2xl font-semibold text-meal-ink dark:text-white">
          Bu plan mevcut değil.
        </h1>
        <UButton
          to="/"
          class="mt-5"
          color="primary"
        >
          Planlara dön
        </UButton>
      </section>
    </div>
  </main>
</template>
