// meal-planner.types.ts

export type ID = string;
export type ISODateString = string; // Example: "2026-06-08"
export type ISODateTimeString = string; // Example: "2026-06-06T10:00:00.000Z"

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type IngredientUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'piece'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'pack'
  | 'can'
  | 'bunch'
  | 'slice';

export type IngredientCategory =
  | 'vegetables'
  | 'fruits'
  | 'meat'
  | 'chicken'
  | 'fish'
  | 'dairy'
  | 'legumes'
  | 'grains'
  | 'spices'
  | 'oils'
  | 'sauces'
  | 'bakery'
  | 'frozen'
  | 'canned'
  | 'drinks'
  | 'other';

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export type EstimatedCost = 'low' | 'medium' | 'high';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export interface Ingredient {
  id: ID;
  name: string;
  amount: number;
  unit: IngredientUnit;
  category?: IngredientCategory;
  note?: string;
}

export interface Recipe {
  id: ID;

  name: string;
  description?: string;
  photo?: string;

  /**
   * Example:
   * ["lunch", "dinner"]
   */
  mealTypes: MealType[];

  /**
   * Recipe base serving count.
   * Example: This recipe is originally for 4 people.
   */
  servings: number;

  ingredients: Ingredient[];

  prepTimeMinutes?: number;
  cookTimeMinutes?: number;

  tags?: string[];

  difficulty?: RecipeDifficulty;
  season?: Season[];
  cuisine?: string;
  estimatedCost?: EstimatedCost;

  /**
   * How many times this recipe was added to weekly plans.
   */
  usageCount: number;

  /**
   * Last time this recipe was used in a weekly plan.
   */
  lastUsedAt?: ISODateTimeString | null;

  isFavorite: boolean;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface PlannedMeal {
  id: ID;

  /**
   * breakfast, lunch, dinner, snack
   */
  mealType: MealType;

  /**
   * Reference to Recipe.id
   */
  recipeId: ID;

  /**
   * Planned serving count for this specific meal.
   * Example:
   * Recipe is for 4 people, but this week it is planned for 2 people.
   */
  servings: number;

  note?: string;
}

export interface WeeklyPlanDay {
  date: ISODateString;
  day: WeekDay;
  meals: PlannedMeal[];
}

export interface WeeklyPlan {
  id: ID;

  weekStartDate: ISODateString;
  weekEndDate: ISODateString;

  days: WeeklyPlanDay[];

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ShoppingListRecipeReference {
  recipeId: ID;
  recipeName: string;
  amount: number;
  unit: IngredientUnit;
}

export interface ShoppingListItem {
  id: ID;

  name: string;

  /**
   * Total calculated amount from all recipes in the weekly plan.
   */
  totalAmount: number;

  unit: IngredientUnit;
  category?: IngredientCategory;

  checked: boolean;

  /**
   * Shows which recipes caused this ingredient to appear in the shopping list.
   */
  recipes: ShoppingListRecipeReference[];

  note?: string;
}

export interface ShoppingList {
  id: ID;

  weeklyPlanId: ID;

  items: ShoppingListItem[];

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface MealPlannerData {
  recipes: Recipe[];
  weeklyPlans: WeeklyPlan[];
  shoppingLists: ShoppingList[];
}

/**
 * Labels
 */

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle Yemeği',
  dinner: 'Akşam Yemeği',
  snack: 'Ara Öğün',
};

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

export const INGREDIENT_UNIT_LABELS: Record<IngredientUnit, string> = {
  g: 'gram',
  kg: 'kilogram',
  ml: 'mililitre',
  l: 'litre',
  piece: 'adet',
  cup: 'su bardağı',
  tbsp: 'yemek kaşığı',
  tsp: 'çay kaşığı',
  pack: 'paket',
  can: 'konserve',
  bunch: 'demet',
  slice: 'dilim',
};

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  vegetables: 'Sebzeler',
  fruits: 'Meyveler',
  meat: 'Et',
  chicken: 'Tavuk',
  fish: 'Balık',
  dairy: 'Süt Ürünleri',
  legumes: 'Bakliyat',
  grains: 'Tahıllar',
  spices: 'Baharatlar',
  oils: 'Yağlar',
  sauces: 'Soslar',
  bakery: 'Fırın',
  frozen: 'Donuk Ürünler',
  canned: 'Konserve',
  drinks: 'İçecekler',
  other: 'Diğer',
};

export const RECIPE_DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

export const ESTIMATED_COST_LABELS: Record<EstimatedCost, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'İlkbahar',
  summer: 'Yaz',
  autumn: 'Sonbahar',
  winter: 'Kış',
  all: 'Tüm yıl',
};

/**
 * Helper
 *
 * Recipe 4 kişilik ama haftalık plana 2 kişilik eklenirse,
 * ingredient amount otomatik olarak yarıya düşer.
 */
export function calculatePlannedIngredientAmount(params: {
  ingredientAmount: number;
  recipeServings: number;
  plannedServings: number;
}): number {
  const { ingredientAmount, recipeServings, plannedServings } = params;

  if (recipeServings <= 0) {
    return ingredientAmount;
  }

  return ingredientAmount * (plannedServings / recipeServings);
}
