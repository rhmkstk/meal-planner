<script setup lang="ts">
import {
  MEAL_TYPE_LABELS,
  WEEK_DAY_LABELS
} from '~/types/meal-planner'
import type {
  MealType,
  Recipe,
  WeekDay,
  WeeklyPlan
} from '~/types/meal-planner'

type PlanMealForm = {
  mealType: MealType
  recipeId: string
  servings: number
  note: string
}

type PlanListMealForm = PlanMealForm & {
  dayIndex: string
}

type PlanDayForm = {
  date: string
  day: WeekDay
  meals: PlanMealForm[]
}

type PlanEntryMode = 'days' | 'list'

type WeeklyPlanForm = {
  weekStartDate: string
  weekEndDate: string
  planDurationWeeks: 1 | 2
  entryMode: PlanEntryMode
  days: PlanDayForm[]
  listMeals: PlanListMealForm[]
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

const {
  mealPlannerData: mealPlannerState,
  refreshMealPlannerData,
  saveWeeklyPlan
} = useMealPlanner()
const { user } = useSupabaseAuth()
const mealPlannerData = reactive(mealPlannerState.value)
const weeklyPlanForm = reactive<WeeklyPlanForm>(createWeeklyPlanForm())
const createdWeeklyPlanSummary = ref<CreatedWeeklyPlanSummary | null>(null)
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

const planEntryModeOptions: Array<{ value: PlanEntryMode, label: string }> = [
  { value: 'days', label: 'Günlere Göre' },
  { value: 'list', label: 'Liste' }
]

watch(
  mealPlannerState,
  (data) => {
    Object.assign(mealPlannerData, data)
  },
  { deep: true, immediate: true }
)

onMounted(async () => {
  if (!user.value) {
    navigateTo({
      path: '/login',
      query: {
        redirect: '/plans/new'
      }
    })
    return
  }

  await refreshMealPlannerData()
  resetWeeklyPlanForm()
})

watch(
  () => weeklyPlanForm.weekStartDate,
  (weekStartDate) => {
    if (weekStartDate) {
      setWeeklyPlanDates(weekStartDate)
    }
  }
)

const recipeOptions = computed(() => {
  return mealPlannerData.recipes.map((recipe: Recipe) => ({
    value: recipe.id,
    label: recipe.name
  }))
})

const planDayOptions = computed(() => {
  return [
    { value: '', label: 'Gün seçme' },
    ...weeklyPlanForm.days.map((day, index) => ({
      value: String(index),
      label: `${WEEK_DAY_LABELS[day.day]} - ${formatShortDate(day.date)}`
    }))
  ]
})

const weeklyPlanRangeText = computed(() => {
  if (!weeklyPlanForm.weekStartDate || !weeklyPlanForm.weekEndDate) {
    return 'Tarih aralığı seçiliyor'
  }

  return `${formatShortDate(weeklyPlanForm.weekStartDate)} - ${formatShortDate(weeklyPlanForm.weekEndDate)} planlanıyor`
})

const canSubmitWeeklyPlan = computed(() => {
  return weeklyPlanForm.weekStartDate.length > 0
    && weeklyPlanForm.weekEndDate.length > 0
    && (
      weeklyPlanForm.entryMode === 'list'
        ? weeklyPlanForm.listMeals.some((meal) => meal.recipeId.length > 0)
        : weeklyPlanForm.days.some((day) => day.meals.some((meal) => meal.recipeId.length > 0))
    )
})

function createWeeklyPlanForm(): WeeklyPlanForm {
  const weekStartDate = getDefaultWeekStartDate()

  return {
    weekStartDate,
    weekEndDate: getPlanEndDate(weekStartDate, 1),
    planDurationWeeks: 1,
    entryMode: 'days',
    days: createPlanDays(weekStartDate, 1),
    listMeals: []
  }
}

function resetWeeklyPlanForm(): void {
  Object.assign(weeklyPlanForm, createWeeklyPlanForm())
}

function createPlanMealForm(): PlanMealForm {
  return {
    mealType: 'dinner',
    recipeId: mealPlannerData.recipes[0]?.id ?? '',
    servings: 2,
    note: ''
  }
}

function createPlanListMealForm(dayIndex = ''): PlanListMealForm {
  return {
    ...createPlanMealForm(),
    dayIndex
  }
}

function setPlanEntryMode(entryMode: PlanEntryMode): void {
  if (weeklyPlanForm.entryMode === entryMode) {
    return
  }

  if (entryMode === 'list') {
    weeklyPlanForm.listMeals = weeklyPlanForm.days.flatMap((day, dayIndex) => {
      return day.meals.map((meal) => ({
        ...meal,
        dayIndex: String(dayIndex)
      }))
    })
  } else {
    weeklyPlanForm.days = weeklyPlanForm.days.map((day) => ({
      ...day,
      meals: []
    }))

    weeklyPlanForm.listMeals.forEach((meal) => {
      const dayIndex = getListMealDayIndex(meal.dayIndex, weeklyPlanForm.days.length)
      weeklyPlanForm.days[dayIndex].meals.push({
        mealType: meal.mealType,
        recipeId: meal.recipeId,
        servings: meal.servings,
        note: meal.note
      })
    })
  }

  weeklyPlanForm.entryMode = entryMode
}

function setWeeklyPlanDates(weekStartDate: string): void {
  updatePlanFormRange(weekStartDate, weeklyPlanForm.planDurationWeeks)
}

function setWeeklyPlanDuration(planDurationWeeks: 1 | 2): void {
  updatePlanFormRange(weeklyPlanForm.weekStartDate, planDurationWeeks)
}

function updatePlanFormRange(weekStartDate: string, planDurationWeeks: 1 | 2): void {
  const existingMeals = weeklyPlanForm.days.map((day) => day.meals)
  const nextDays = createPlanDays(weekStartDate, planDurationWeeks)

  weeklyPlanForm.weekStartDate = weekStartDate
  weeklyPlanForm.planDurationWeeks = planDurationWeeks
  weeklyPlanForm.weekEndDate = getPlanEndDate(weekStartDate, planDurationWeeks)
  weeklyPlanForm.days = nextDays.map((day, index) => ({
    ...day,
    meals: existingMeals[index] ?? []
  }))
  weeklyPlanForm.listMeals = weeklyPlanForm.listMeals.map((meal) => ({
    ...meal,
    dayIndex: normalizeListMealDayIndex(meal.dayIndex, nextDays.length)
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

function addPlanMeal(dayIndex: number): void {
  weeklyPlanForm.days[dayIndex].meals.unshift(createPlanMealForm())
}

function removePlanMeal(dayIndex: number, mealIndex: number): void {
  weeklyPlanForm.days[dayIndex].meals.splice(mealIndex, 1)
}

function addPlanListMeal(): void {
  weeklyPlanForm.listMeals.unshift(createPlanListMealForm())
}

function removePlanListMeal(mealIndex: number): void {
  weeklyPlanForm.listMeals.splice(mealIndex, 1)
}

function normalizeListMealDayIndex(dayIndex: string, dayCount: number): string {
  if (!dayIndex) {
    return ''
  }

  const parsedDayIndex = Number(dayIndex)
  return Number.isInteger(parsedDayIndex) && parsedDayIndex >= 0 && parsedDayIndex < dayCount
    ? String(parsedDayIndex)
    : ''
}

function getListMealDayIndex(dayIndex: string, dayCount: number): number {
  const normalizedDayIndex = normalizeListMealDayIndex(dayIndex, dayCount)
  return normalizedDayIndex ? Number(normalizedDayIndex) : 0
}

function createPlanDaysForSubmit(): PlanDayForm[] {
  const planDays = weeklyPlanForm.days.map((day) => ({
    ...day,
    meals: weeklyPlanForm.entryMode === 'list' ? [] : day.meals
  }))

  if (weeklyPlanForm.entryMode !== 'list') {
    return planDays
  }

  weeklyPlanForm.listMeals
    .filter((meal) => meal.recipeId.length > 0)
    .forEach((meal) => {
      const dayIndex = getListMealDayIndex(meal.dayIndex, planDays.length)
      planDays[dayIndex].meals.push({
        mealType: meal.mealType,
        recipeId: meal.recipeId,
        servings: meal.servings,
        note: meal.note
      })
    })

  return planDays
}

async function submitWeeklyPlan(): Promise<void> {
  planSubmitError.value = ''

  if (!canSubmitWeeklyPlan.value) {
    return
  }

  isPlanSubmitting.value = true

  try {
    const now = new Date().toISOString()
    const planId = `weekly_plan_${Date.now()}`
    const planDays = createPlanDaysForSubmit()

    const plan: WeeklyPlan = {
      id: planId,
      weekStartDate: weeklyPlanForm.weekStartDate,
      weekEndDate: weeklyPlanForm.weekEndDate,
      days: planDays.map((day) => ({
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

    const savedPlan = await saveWeeklyPlan(plan)
    createdWeeklyPlanSummary.value = {
      id: savedPlan.id,
      weekStartDate: savedPlan.weekStartDate,
      weekEndDate: savedPlan.weekEndDate,
      totalDayCount: savedPlan.days.length,
      plannedDayCount: savedPlan.days.filter((day) => day.meals.length > 0).length,
      plannedMealCount: savedPlan.days.reduce((total, day) => total + day.meals.length, 0),
      totalServings: savedPlan.days.reduce((total, day) => {
        return total + day.meals.reduce((dayTotal, meal) => dayTotal + meal.servings, 0)
      }, 0)
    }
  } catch (error) {
    planSubmitError.value = error instanceof Error ? error.message : 'Plan kaydedilemedi.'
  } finally {
    isPlanSubmitting.value = false
  }
}

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short'
  }).format(new Date(date))
}
</script>

<template>
  <main class="app-shell">
    <form
      class="min-h-screen bg-meal-cream text-meal-ink dark:bg-carbon_black-200 dark:text-white"
      @submit.prevent="submitWeeklyPlan"
    >
      <header class="sticky top-0 z-20 border-b border-meal-line bg-meal-paper/95 px-4 py-3 backdrop-blur dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:px-6 sm:py-4 lg:px-8">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="section-title">
              Yeni plan
            </p>
            <h1 class="mt-1 truncate text-lg font-semibold text-meal-ink dark:text-white sm:text-2xl">
              {{ createdWeeklyPlanSummary ? 'Plan kaydedildi' : 'Plan oluştur' }}
            </h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-meal-muted dark:text-alabaster_grey-700">
              {{ createdWeeklyPlanSummary ? 'Planın hazır. Özetten kontrol edip detayına geçebilirsin.' : weeklyPlanRangeText }}
            </p>
          </div>

          <div class="action-row">
            <UButton
              block
              type="button"
              color="gray"
              variant="soft"
              to="/"
            >
              Planlara Dön
            </UButton>
            <UButton
              v-if="!createdWeeklyPlanSummary"
              block
              type="submit"
              color="primary"
              :disabled="!canSubmitWeeklyPlan || isPlanSubmitting"
              :loading="isPlanSubmitting"
            >
              Planı Kaydet
            </UButton>
            <UButton
              v-else
              block
              color="primary"
              :to="`/plans/${createdWeeklyPlanSummary.id}`"
            >
              Plana Git
            </UButton>
          </div>
        </div>
      </header>

      <div
        v-if="createdWeeklyPlanSummary"
        class="mx-auto flex w-full max-w-7xl items-start justify-center px-4 py-6 sm:px-6 lg:px-8"
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
                Kayıt tamamlandı
              </p>
              <h2 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                {{ formatShortDate(createdWeeklyPlanSummary.weekStartDate) }} - {{ formatShortDate(createdWeeklyPlanSummary.weekEndDate) }} planı oluşturuldu
              </h2>
              <p class="mt-2 text-sm leading-6 text-meal-muted dark:text-alabaster_grey-700">
                Plan listesine eklendi ve plan görünümünde kullanılmaya hazır.
              </p>
            </div>
          </div>

          <dl class="mt-5 grid grid-cols-3 gap-2 text-center">
            <div class="stat-tile">
              <dt class="stat-label">Gün</dt>
              <dd class="stat-value">{{ createdWeeklyPlanSummary.plannedDayCount }}/{{ createdWeeklyPlanSummary.totalDayCount }}</dd>
            </div>
            <div class="stat-tile">
              <dt class="stat-label">Öğün</dt>
              <dd class="stat-value">{{ createdWeeklyPlanSummary.plannedMealCount }}</dd>
            </div>
            <div class="stat-tile">
              <dt class="stat-label">Porsiyon</dt>
              <dd class="stat-value">{{ createdWeeklyPlanSummary.totalServings }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div
        v-else
        class="mx-auto w-full max-w-7xl px-4 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-6 lg:px-8"
      >
        <section class="space-y-5">
          <UAlert
            v-if="planSubmitError"
            color="red"
            variant="soft"
            title="Plan kaydedilemedi"
            :description="planSubmitError"
          />

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

          <div class="surface-panel p-3">
            <div class="grid grid-cols-2 gap-2">
              <UButton
                v-for="option in planEntryModeOptions"
                :key="option.value"
                type="button"
                block
                :color="weeklyPlanForm.entryMode === option.value ? 'primary' : 'gray'"
                :variant="weeklyPlanForm.entryMode === option.value ? 'solid' : 'ghost'"
                :class="[
                  weeklyPlanForm.entryMode === option.value ? '' : 'bg-transparent'
                ]"
                @click="setPlanEntryMode(option.value)"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>

          <div
            v-if="mealPlannerData.recipes.length === 0"
            class="surface-panel p-5"
          >
            <h2 class="text-lg font-semibold text-meal-ink dark:text-white">
              Önce yemek ekle
            </h2>
            <p class="mt-2 text-sm leading-6 text-meal-muted dark:text-alabaster_grey-700">
              Plan oluşturmak için en az bir kayıtlı yemek gerekiyor.
            </p>
            <UButton
              class="mt-4"
              color="primary"
              to="/foods/new"
            >
              Yemek Ekle
            </UButton>
          </div>

          <div
            v-if="weeklyPlanForm.entryMode === 'days'"
            class="grid gap-4"
          >
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
                  <h2 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                    {{ formatShortDate(day.date) }}
                  </h2>
                </div>

                <UBadge
                  class="shrink-0"
                  :color="day.meals.length > 0 ? 'primary' : 'gray'"
                  variant="subtle"
                >
                  {{ day.meals.length > 0 ? `${day.meals.length} öğün` : 'Boş gün' }}
                </UBadge>
              </div>

              <UButton
                class="mt-4"
                type="button"
                color="primary"
                variant="soft"
                size="sm"
                icon="i-heroicons-plus-20-solid"
                :disabled="mealPlannerData.recipes.length === 0"
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

          <section
            v-else
            class="surface-panel p-5"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="section-title">
                  Günlerden bağımsız liste
                </p>
                <h2 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                  Plan yemekleri
                </h2>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  :color="weeklyPlanForm.listMeals.length > 0 ? 'primary' : 'gray'"
                  variant="subtle"
                >
                  {{ weeklyPlanForm.listMeals.length > 0 ? `${weeklyPlanForm.listMeals.length} öğün` : 'Boş liste' }}
                </UBadge>
                <UButton
                  type="button"
                  color="primary"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-plus-20-solid"
                  :disabled="mealPlannerData.recipes.length === 0"
                  @click="addPlanListMeal"
                >
                  Öğün Ekle
                </UButton>
              </div>
            </div>

            <div
              v-if="weeklyPlanForm.listMeals.length > 0"
              class="mt-4 space-y-3"
            >
              <div
                v-for="(meal, mealIndex) in weeklyPlanForm.listMeals"
                :key="mealIndex"
                class="rounded-lg border border-meal-line bg-white p-4 dark:border-carbon_black-300 dark:bg-carbon_black-200"
              >
                <div class="grid gap-3 lg:grid-cols-[0.8fr_1.25fr_0.75fr_0.7fr] lg:items-end">
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
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Gün</span>
                    <USelect
                      v-model="meal.dayIndex"
                      :options="planDayOptions"
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
                </div>

                <label class="mt-3 block space-y-2">
                  <span class="text-sm font-medium text-meal-ink dark:text-white">Not</span>
                  <UInput
                    v-model="meal.note"
                    placeholder="Örn. Misafir için fazla yapılacak"
                  />
                </label>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <UBadge
                    v-if="meal.dayIndex"
                    color="gray"
                    variant="soft"
                  >
                    {{ planDayOptions.find((option) => option.value === meal.dayIndex)?.label }}
                  </UBadge>
                  <span
                    v-else
                    class="text-xs text-meal-muted dark:text-alabaster_grey-700"
                  >
                    Kayıtta ilk güne eklenecek.
                  </span>

                  <UButton
                    type="button"
                    color="red"
                    variant="soft"
                    icon="i-heroicons-trash-20-solid"
                    @click="removePlanListMeal(mealIndex)"
                  >
                    Sil
                  </UButton>
                </div>
              </div>
            </div>

            <p
              v-else
              class="mt-4 rounded-md border border-dashed border-meal-line px-3 py-4 text-sm text-meal-muted dark:border-carbon_black-300 dark:text-alabaster_grey-700"
            >
              Gün seçmeden yemek eklemek için Öğün Ekle butonunu kullan.
            </p>
          </section>
        </section>

        <div class="sticky bottom-0 z-20 mt-4 border-t border-meal-line bg-meal-paper/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:hidden">
          <UButton
            block
            type="submit"
            color="primary"
            :disabled="!canSubmitWeeklyPlan || isPlanSubmitting"
            :loading="isPlanSubmitting"
          >
            Planı Kaydet
          </UButton>
        </div>
      </div>
    </form>
  </main>
</template>
