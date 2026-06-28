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

const { saveRecipe } = useMealPlanner()
const { user } = useSupabaseAuth()
const recipeForm = reactive<RecipeForm>(createRecipeForm())
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

const canSubmitRecipe = computed(() => {
  return recipeForm.name.trim().length > 0 && recipeForm.mealTypes.length > 0
})

onMounted(() => {
  if (!user.value) {
    navigateTo({
      path: '/login',
      query: {
        redirect: '/foods/new'
      }
    })
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
    const recipe: Recipe = {
      id: `recipe_${Date.now()}`,
      name: recipeForm.name.trim(),
      description: recipeForm.description.trim() || undefined,
      photo: recipeForm.photo.trim() || undefined,
      mealTypes: [...recipeForm.mealTypes],
      servings: Number(recipeForm.servings) || 1,
      ingredients: recipeForm.ingredients
        .filter((ingredient) => ingredient.name.trim().length > 0)
        .map((ingredient, index) => ({
          id: `ingredient_${Date.now()}_${index + 1}`,
          name: ingredient.name.trim(),
          amount: Number(ingredient.amount) || 1,
          unit: ingredient.unit,
          category: ingredient.category || undefined,
          note: ingredient.note.trim() || undefined
        })),
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

    await saveRecipe(recipe)
    navigateTo('/foods')
  } catch (error) {
    recipeSubmitError.value = error instanceof Error ? error.message : 'Yemek kaydedilemedi.'
  } finally {
    isRecipeSubmitting.value = false
  }
}
</script>

<template>
  <main class="app-shell">
    <form
      class="min-h-screen bg-meal-cream text-meal-ink dark:bg-carbon_black-200 dark:text-white"
      @submit.prevent="submitRecipe"
    >
      <header class="sticky top-0 z-20 border-b border-meal-line bg-meal-paper/95 px-4 py-4 backdrop-blur dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:px-6 lg:px-8">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="section-title">
              Yeni yemek
            </p>
            <h1 class="mt-1 truncate text-2xl font-semibold text-meal-ink dark:text-white">
              Yemek ekle
            </h1>
          </div>

          <div class="action-row">
            <UButton
              block
              type="button"
              color="gray"
              variant="soft"
              to="/foods"
            >
              Geri Don
            </UButton>
            <UButton
              block
              type="submit"
              color="primary"
              :disabled="!canSubmitRecipe || isRecipeSubmitting"
              :loading="isRecipeSubmitting"
            >
              Yemeği Kaydet
            </UButton>
          </div>
        </div>
      </header>

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
                <h2 class="mt-1 text-xl font-semibold text-meal-ink dark:text-white">
                  Tarif malzemeleri
                </h2>
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
    </form>
  </main>
</template>
