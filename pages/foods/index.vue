<script setup lang="ts">
import {
  ESTIMATED_COST_LABELS,
  INGREDIENT_CATEGORY_LABELS,
  INGREDIENT_UNIT_LABELS,
  MEAL_TYPE_LABELS,
  RECIPE_DIFFICULTY_LABELS,
  SEASON_LABELS
} from '~/types/meal-planner'
import type {
  EstimatedCost,
  IngredientCategory,
  IngredientUnit,
  MealType,
  Recipe,
  RecipeDifficulty,
  Season
} from '~/types/meal-planner'

type RecipeIngredientForm = {
  name: string
  amount: number
  unit: IngredientUnit
  category: IngredientCategory | ''
  note: string
}

type RecipeForm = {
  id: string | null
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

const {
  mealPlannerData: mealPlannerState,
  refreshMealPlannerData,
  saveRecipe,
  deleteRecipe: deleteRecipeFromDb
} = useMealPlanner()
const { user } = useSupabaseAuth()
const mealPlannerData = reactive(mealPlannerState.value)
const searchQuery = ref('')
const selectedMealType = ref<MealType | 'all'>('all')
const selectedTag = ref('all')
const isRecipeModalOpen = ref(false)
const isRecipeDetailModalOpen = ref(false)
const selectedRecipeId = ref<string | null>(null)
const isRecipeSubmitting = ref(false)
const recipeSubmitError = ref('')

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

const recipeForm = reactive<RecipeForm>(createRecipeForm())

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

const allTags = computed(() => {
  const tags = mealPlannerData.recipes.flatMap((recipe) => recipe.tags ?? [])
  return [...new Set(tags)].sort((first, second) => first.localeCompare(second, 'tr-TR'))
})

const filteredRecipes = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('tr-TR')

  return mealPlannerData.recipes.filter((recipe) => {
    const matchesSearch = query.length === 0
      || recipe.name.toLocaleLowerCase('tr-TR').includes(query)

    const matchesMealType = selectedMealType.value === 'all'
      || recipe.mealTypes.includes(selectedMealType.value)

    const matchesTag = selectedTag.value === 'all'
      || recipe.tags?.includes(selectedTag.value)

    return matchesSearch && matchesMealType && matchesTag
  })
})

const favoriteCount = computed(() => {
  return mealPlannerData.recipes.filter((recipe) => recipe.isFavorite).length
})

const selectedRecipe = computed(() => {
  if (!selectedRecipeId.value) {
    return null
  }

  return mealPlannerData.recipes.find((recipe) => recipe.id === selectedRecipeId.value) ?? null
})

const canSubmitRecipe = computed(() => {
  return recipeForm.name.trim().length > 0 && recipeForm.mealTypes.length > 0
})

function createRecipeForm(recipe?: Recipe): RecipeForm {
  return {
    id: recipe?.id ?? null,
    name: recipe?.name ?? '',
    description: recipe?.description ?? '',
    photo: recipe?.photo ?? '',
    mealTypes: recipe ? [...recipe.mealTypes] : ['dinner'],
    servings: recipe?.servings ?? 2,
    ingredients: recipe?.ingredients.length
      ? recipe.ingredients.map((ingredient) => ({
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          category: ingredient.category ?? '',
          note: ingredient.note ?? ''
        }))
      : [createIngredientForm()],
    prepTimeMinutes: recipe?.prepTimeMinutes ?? 10,
    cookTimeMinutes: recipe?.cookTimeMinutes ?? 20,
    tags: recipe?.tags?.join(', ') ?? '',
    difficulty: recipe?.difficulty ?? 'easy',
    season: recipe?.season ? [...recipe.season] : ['all'],
    cuisine: recipe?.cuisine ?? '',
    estimatedCost: recipe?.estimatedCost ?? 'medium',
    isFavorite: recipe?.isFavorite ?? false
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

function openNewRecipePage(): void {
  if (!user.value) {
    navigateTo({
      path: '/login',
      query: {
        redirect: '/foods/new'
      }
    })
    return
  }

  navigateTo('/foods/new')
}

function openEditRecipeModal(recipe: Recipe): void {
  recipeSubmitError.value = ''
  Object.assign(recipeForm, createRecipeForm(recipe))
  isRecipeDetailModalOpen.value = false
  isRecipeModalOpen.value = true
}

function openRecipeDetailModal(recipe: Recipe): void {
  selectedRecipeId.value = recipe.id
  isRecipeDetailModalOpen.value = true
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

async function submitRecipe(): Promise<void> {
  recipeSubmitError.value = ''

  if (!canSubmitRecipe.value) {
    return
  }

  isRecipeSubmitting.value = true

  try {
    const now = new Date().toISOString()
    const recipe = buildRecipeFromForm(now)
    await saveRecipe(recipe)

    isRecipeModalOpen.value = false
  } catch (error) {
    recipeSubmitError.value = error instanceof Error ? error.message : 'Yemek kaydedilemedi.'
  } finally {
    isRecipeSubmitting.value = false
  }
}

function buildRecipeFromForm(now: string): Recipe {
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

  return {
    id: recipeForm.id ?? `recipe_${Date.now()}`,
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
}

async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    await deleteRecipeFromDb(recipeId)
  } catch (error) {
    recipeSubmitError.value = error instanceof Error ? error.message : 'Yemek silinemedi.'
    return
  }

  if (selectedRecipeId.value === recipeId) {
    selectedRecipeId.value = null
    isRecipeDetailModalOpen.value = false
  }
}

function resetFilters(): void {
  searchQuery.value = ''
  selectedMealType.value = 'all'
  selectedTag.value = 'all'
}

function getRecipeDuration(recipe: Recipe): number {
  return (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)
}

function formatIngredientAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : String(amount).replace('.', ',')
}
</script>

<template>
  <main class="app-shell">
    <div class="page-container space-y-6 sm:space-y-8">
      <header class="page-hero">
        <div class="page-hero-copy">
          <div class="space-y-3">
            <h1 class="page-title">
              Yemekler
            </h1>
            <p class="page-description">
              Kayıtlı yemekleri ara, öğün tipine veya etikete göre filtrele; gerektiğinde düzenle ya da listeden kaldır.
            </p>
          </div>
        </div>

        <div class="action-row">
          <UButton
            block
            color="primary"
            @click="openNewRecipePage"
          >
            Yeni Yemek Ekle
          </UButton>
        </div>
      </header>

      <section class="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <aside class="surface-panel h-fit p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="section-title">
                Filtreler
              </p>
              <h2 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                Yemek bul
              </h2>
            </div>
            <UButton
              color="gray"
              variant="soft"
              size="sm"
              @click="resetFilters"
            >
              Temizle
            </UButton>
          </div>

          <div class="mt-5 space-y-5">
            <label class="space-y-2">
              <span class="text-sm font-medium text-meal-ink dark:text-white">İsme göre ara</span>
              <UInput
                v-model="searchQuery"
                placeholder="Örn. mercimek"
              />
            </label>

            <div class="space-y-2">
              <span class="text-sm font-medium text-meal-ink dark:text-white">Öğün tipi</span>
              <div class="flex flex-wrap gap-2">
                <UButton
                  type="button"
                  :color="selectedMealType === 'all' ? 'primary' : 'gray'"
                  :variant="selectedMealType === 'all' ? 'solid' : 'soft'"
                  size="sm"
                  @click="selectedMealType = 'all'"
                >
                  Tümü
                </UButton>
                <UButton
                  v-for="option in mealTypeOptions"
                  :key="option.value"
                  type="button"
                  :color="selectedMealType === option.value ? 'primary' : 'gray'"
                  :variant="selectedMealType === option.value ? 'solid' : 'soft'"
                  size="sm"
                  @click="selectedMealType = option.value"
                >
                  {{ option.label }}
                </UButton>
              </div>
            </div>

            <label class="space-y-2">
              <span class="text-sm font-medium text-meal-ink dark:text-white">Etiket</span>
              <USelect
                v-model="selectedTag"
                :options="[{ value: 'all', label: 'Tüm etiketler' }, ...allTags.map((tag) => ({ value: tag, label: tag }))]"
                option-attribute="label"
                value-attribute="value"
              />
            </label>
          </div>

          <dl class="mt-6 border-t border-meal-line pt-5 text-sm dark:border-carbon_black-300">
            <div class="flex items-center justify-between gap-4">
              <dt class="text-meal-muted dark:text-alabaster_grey-700">Toplam yemek</dt>
              <dd class="font-semibold text-meal-ink dark:text-white">{{ mealPlannerData.recipes.length }}</dd>
            </div>
            <div class="mt-3 flex items-center justify-between gap-4">
              <dt class="text-meal-muted dark:text-alabaster_grey-700">Favori</dt>
              <dd class="font-semibold text-meal-ink dark:text-white">{{ favoriteCount }}</dd>
            </div>
            <div class="mt-3 flex items-center justify-between gap-4">
              <dt class="text-meal-muted dark:text-alabaster_grey-700">Gösterilen</dt>
              <dd class="font-semibold text-meal-ink dark:text-white">{{ filteredRecipes.length }}</dd>
            </div>
          </dl>
        </aside>

        <section class="space-y-5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="section-title">
                Yemek listesi
              </p>
              <h2 class="mt-1 text-2xl font-semibold text-meal-ink dark:text-white">
                Kayıtlı yemekler
              </h2>
            </div>
            <p class="text-sm text-meal-muted dark:text-alabaster_grey-700">
              {{ filteredRecipes.length }} yemek listeleniyor
            </p>
          </div>

          <div
            v-if="filteredRecipes.length > 0"
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            <button
              v-for="recipe in filteredRecipes"
              :key="recipe.id"
              type="button"
              class="group overflow-hidden rounded-lg border border-meal-line bg-meal-paper text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-mint_leaf-700 hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-mint_leaf-500 dark:border-carbon_black-300 dark:bg-carbon_black-400 dark:hover:border-mint_leaf-400"
              @click="openRecipeDetailModal(recipe)"
            >
              <div class="aspect-square overflow-hidden bg-linen-700 dark:bg-carbon_black-300">
                <img
                  v-if="recipe.photo"
                  :src="recipe.photo"
                  :alt="recipe.name"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                >
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center bg-linen-600 text-sm font-semibold text-pine_teal-500 dark:bg-carbon_black-300 dark:text-mint_leaf-800"
                >
                  Fotoğraf yok
                </div>
              </div>

              <div class="p-3">
                <h3 class="line-clamp-2 text-sm font-semibold leading-5 text-meal-ink dark:text-white sm:text-base">
                  {{ recipe.name }}
                </h3>
              </div>
            </button>
          </div>

          <div
            v-else
            class="surface-panel px-5 py-10 text-center"
          >
            <h3 class="text-xl font-semibold text-meal-ink dark:text-white">
              Sonuç bulunamadı
            </h3>
            <p class="mt-2 text-sm text-meal-muted dark:text-alabaster_grey-700">
              Arama veya filtreleri değiştirerek tekrar dene.
            </p>
          </div>
        </section>
      </section>
    </div>

    <UModal
      v-model="isRecipeModalOpen"
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
                  Yemek düzenle
                </p>
                <h2 class="mt-1 truncate text-2xl font-semibold text-meal-ink dark:text-white">
                  {{ recipeForm.name }}
                </h2>
              </div>
              <UButton
                class="shrink-0"
                type="button"
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                aria-label="Yemek modalını kapat"
                @click="isRecipeModalOpen = false"
              />
            </div>

            <div class="action-row">
              <UButton
                block
                type="submit"
                color="primary"
                :disabled="!canSubmitRecipe || isRecipeSubmitting"
                :loading="isRecipeSubmitting"
              >
                Değişiklikleri Kaydet
              </UButton>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto">
          <div class="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <section class="space-y-5">
              <UAlert
                v-if="recipeSubmitError"
                color="red"
                variant="soft"
                title="Yemek kaydedilemedi"
                :description="recipeSubmitError"
              />

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
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-medium text-meal-ink dark:text-white">Pişirme süresi</span>
                    <UInput
                      v-model.number="recipeForm.cookTimeMinutes"
                      type="number"
                      min="0"
                    />
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
                </div>
              </div>
            </aside>
          </div>
        </div>
      </form>
    </UModal>

    <UModal
      v-model="isRecipeDetailModalOpen"
      :ui="{
        container: 'flex min-h-full items-end justify-center text-center',
        padding: 'p-0 sm:p-4',
        margin: 'sm:my-0',
        width: 'w-full sm:max-w-xl',
        rounded: 'rounded-t-[2rem] sm:rounded-[2rem]',
        background: 'bg-meal-paper dark:bg-carbon_black-400',
        overlay: {
          background: 'bg-carbon_black-500/50 dark:bg-carbon_black-100/70'
        },
        transition: {
          enter: 'ease-out duration-300',
          enterFrom: 'opacity-0 translate-y-8',
          enterTo: 'opacity-100 translate-y-0',
          leave: 'ease-in duration-200',
          leaveFrom: 'opacity-100 translate-y-0',
          leaveTo: 'opacity-0 translate-y-8'
        }
      }"
    >
      <article
        v-if="selectedRecipe"
        class="max-h-[92vh] overflow-y-auto text-meal-ink dark:text-white"
      >
        <div class="sticky top-0 z-10 bg-meal-paper/95 px-5 pb-3 pt-4 backdrop-blur dark:bg-carbon_black-400/95">
          <div class="mx-auto h-1.5 w-16 rounded-full bg-ash_grey-500 dark:bg-carbon_black-700" />
          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="section-title">
              Yemek detayı
            </p>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              aria-label="Detayı kapat"
              @click="isRecipeDetailModalOpen = false"
            />
          </div>
        </div>

        <div class="bg-alabaster_grey-900 dark:bg-carbon_black-300">
          <div class="mx-auto aspect-[4/3] max-h-[27rem] w-full overflow-hidden">
            <img
              v-if="selectedRecipe.photo"
              :src="selectedRecipe.photo"
              :alt="selectedRecipe.name"
              class="h-full w-full object-cover"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-sm font-semibold text-pine_teal-500 dark:text-mint_leaf-800"
            >
              Fotoğraf yok
            </div>
          </div>
        </div>

        <div class="space-y-6 px-5 py-5 sm:px-6">
          <section class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="mealType in selectedRecipe.mealTypes"
                :key="mealType"
                color="primary"
                variant="subtle"
              >
                {{ MEAL_TYPE_LABELS[mealType] }}
              </UBadge>
              <UBadge
                v-if="selectedRecipe.isFavorite"
                color="amber"
                variant="soft"
              >
                Favori
              </UBadge>
            </div>

            <div>
              <h2 class="text-3xl font-semibold leading-tight text-meal-ink dark:text-white">
                {{ selectedRecipe.name }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-meal-muted dark:text-alabaster_grey-700">
                {{ selectedRecipe.description || 'Açıklama eklenmedi.' }}
              </p>
            </div>
          </section>

          <section class="grid grid-cols-4 border-y border-meal-line py-4 text-center dark:border-carbon_black-300">
            <div>
              <p class="text-lg font-semibold text-meal-ink dark:text-white">{{ selectedRecipe.servings }}</p>
              <p class="mt-1 text-xs text-meal-muted dark:text-alabaster_grey-700">porsiyon</p>
            </div>
            <div>
              <p class="text-lg font-semibold text-meal-ink dark:text-white">{{ getRecipeDuration(selectedRecipe) }}</p>
              <p class="mt-1 text-xs text-meal-muted dark:text-alabaster_grey-700">dakika</p>
            </div>
            <div>
              <p class="text-lg font-semibold text-meal-ink dark:text-white">{{ selectedRecipe.ingredients.length }}</p>
              <p class="mt-1 text-xs text-meal-muted dark:text-alabaster_grey-700">malzeme</p>
            </div>
            <div>
              <p class="text-lg font-semibold text-meal-ink dark:text-white">{{ selectedRecipe.usageCount }}</p>
              <p class="mt-1 text-xs text-meal-muted dark:text-alabaster_grey-700">kullanım</p>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-base font-semibold text-meal-ink dark:text-white">
              Malzemeler
            </h3>
            <ul class="space-y-2 text-sm leading-6 text-meal-muted dark:text-alabaster_grey-700">
              <li
                v-for="ingredient in selectedRecipe.ingredients"
                :key="ingredient.id"
                class="flex gap-3 rounded-md bg-linen-800 px-3 py-2 dark:bg-carbon_black-300"
              >
                <span class="font-semibold text-meal-ink dark:text-white">
                  {{ formatIngredientAmount(ingredient.amount) }} {{ INGREDIENT_UNIT_LABELS[ingredient.unit] }}
                </span>
                <span>
                  {{ ingredient.name }}<template v-if="ingredient.note">, {{ ingredient.note }}</template>
                </span>
              </li>
            </ul>
          </section>

          <section class="space-y-3">
            <h3 class="text-base font-semibold text-meal-ink dark:text-white">
              Ek bilgiler
            </h3>
            <div class="grid gap-2 text-sm sm:grid-cols-2">
              <div class="rounded-md border border-meal-line px-3 py-2 dark:border-carbon_black-300">
                <p class="text-meal-muted dark:text-alabaster_grey-700">Zorluk</p>
                <p class="mt-1 font-semibold text-meal-ink dark:text-white">
                  {{ selectedRecipe.difficulty ? RECIPE_DIFFICULTY_LABELS[selectedRecipe.difficulty] : 'Belirtilmedi' }}
                </p>
              </div>
              <div class="rounded-md border border-meal-line px-3 py-2 dark:border-carbon_black-300">
                <p class="text-meal-muted dark:text-alabaster_grey-700">Tahmini maliyet</p>
                <p class="mt-1 font-semibold text-meal-ink dark:text-white">
                  {{ selectedRecipe.estimatedCost ? ESTIMATED_COST_LABELS[selectedRecipe.estimatedCost] : 'Belirtilmedi' }}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in selectedRecipe.tags"
                :key="tag"
                color="gray"
                variant="soft"
              >
                {{ tag }}
              </UBadge>
            </div>
          </section>

          <div class="sticky bottom-0 -mx-5 grid grid-cols-2 gap-3 border-t border-meal-line bg-meal-paper/95 px-5 py-4 backdrop-blur dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:-mx-6 sm:px-6">
            <UButton
              block
              color="gray"
              variant="soft"
              @click="openEditRecipeModal(selectedRecipe)"
            >
              Düzenle
            </UButton>
            <UButton
              block
              color="red"
              variant="soft"
              @click="deleteRecipe(selectedRecipe.id)"
            >
              Sil
            </UButton>
          </div>
        </div>
      </article>
    </UModal>
  </main>
</template>
