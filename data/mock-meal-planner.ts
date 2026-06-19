import type { MealPlannerData, Recipe, ShoppingList, WeeklyPlan } from '~/types/meal-planner'

export const recipePhotoMap = {
  recipe_001: 'https://loremflickr.com/800/600/mercimek,corbasi,food?lock=1',
  recipe_002: 'https://loremflickr.com/800/600/ezogelin,corbasi,food?lock=2',
  recipe_003: 'https://loremflickr.com/800/600/tarhana,corbasi,food?lock=3',
  recipe_004: 'https://loremflickr.com/800/600/yayla,corbasi,food?lock=4',
  recipe_005: 'https://loremflickr.com/800/600/kuru,fasulye,food?lock=5',
  recipe_006: 'https://loremflickr.com/800/600/nohut,yemegi,food?lock=6',
  recipe_007: 'https://loremflickr.com/800/600/pirinc,pilavi,food?lock=7',
  recipe_008: 'https://loremflickr.com/800/600/bulgur,pilavi,food?lock=8',
  recipe_009: 'https://loremflickr.com/800/600/tavuk,sote,food?lock=9',
  recipe_010: 'https://loremflickr.com/800/600/patates,yemegi,food?lock=10',
  recipe_011: 'https://loremflickr.com/800/600/karniyarik,food?lock=11',
  recipe_012: 'https://loremflickr.com/800/600/imam,bayildi,food?lock=12',
  recipe_013: 'https://loremflickr.com/800/600/patlican,musakka,food?lock=13',
  recipe_014: 'https://loremflickr.com/800/600/biber,dolmasi,food?lock=14',
  recipe_015: 'https://loremflickr.com/800/600/yaprak,sarma,food?lock=15',
  recipe_016: 'https://loremflickr.com/800/600/menemen,food?lock=16',
  recipe_017: 'https://loremflickr.com/800/600/kofte,food?lock=17',
  recipe_018: 'https://loremflickr.com/800/600/izmir,kofte,food?lock=18',
  recipe_019: 'https://loremflickr.com/800/600/manti,food?lock=19',
  recipe_020: 'https://loremflickr.com/800/600/lahmacun,food?lock=20',
  recipe_021: 'https://loremflickr.com/800/600/borek,food?lock=21',
  recipe_022: 'https://loremflickr.com/800/600/mucver,food?lock=22',
  recipe_023: 'https://loremflickr.com/800/600/taze,fasulye,food?lock=23',
  recipe_024: 'https://loremflickr.com/800/600/turlu,sebze,food?lock=24',
  recipe_025: 'https://loremflickr.com/800/600/mercimek,koftesi,food?lock=25',
  recipe_026: 'https://loremflickr.com/800/600/kisir,food?lock=26',
  recipe_027: 'https://loremflickr.com/800/600/pirasa,food?lock=27',
  recipe_028: 'https://loremflickr.com/800/600/ispanak,yemegi,food?lock=28',
  recipe_029: 'https://loremflickr.com/800/600/kapuska,food?lock=29',
  recipe_030: 'https://loremflickr.com/800/600/tavuklu,pilav,food?lock=30',
  recipe_031: 'https://loremflickr.com/800/600/balik,bugulama,food?lock=31',
  recipe_032: 'https://loremflickr.com/800/600/firinda,tavuk,food?lock=32',
  recipe_033: 'https://loremflickr.com/800/600/tas,kebabi,food?lock=33',
  recipe_034: 'https://loremflickr.com/800/600/hunkar,begendi,food?lock=34',
  recipe_035: 'https://loremflickr.com/800/600/alinazik,food?lock=35',
  recipe_036: 'https://loremflickr.com/800/600/kabak,yemegi,food?lock=36',
  recipe_037: 'https://loremflickr.com/800/600/kiymali,makarna,food?lock=37',
  recipe_038: 'https://loremflickr.com/800/600/firinda,makarna,food?lock=38',
  recipe_039: 'https://loremflickr.com/800/600/tavuk,haslama,food?lock=39',
  recipe_040: 'https://loremflickr.com/800/600/bezelye,yemegi,food?lock=40'
}

export const mockRecipes: Recipe[] = [
  {
    id: 'recipe_001',
    name: 'Mercimek Çorbası',
    description: 'Klasik kırmızı mercimek çorbası',
    photo: recipePhotoMap.recipe_001,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_001_001', name: 'Kırmızı mercimek', amount: 1, unit: 'cup', category: 'legumes', note: 'Yıkanmış' },
      { id: 'ingredient_001_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_001_003', name: 'Havuç', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_001_004', name: 'Patates', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_001_005', name: 'Zeytinyağı', amount: 2, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    tags: ['çorba', 'kolay', 'ekonomik'],
    difficulty: 'easy',
    season: ['winter', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 8,
    lastUsedAt: '2026-06-09T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_002',
    name: 'Ezogelin Çorbası',
    description: 'Mercimek, bulgur ve pirinçle yapılan doyurucu çorba',
    photo: recipePhotoMap.recipe_002,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_002_001', name: 'Kırmızı mercimek', amount: 1, unit: 'cup', category: 'legumes' },
      { id: 'ingredient_002_002', name: 'Bulgur', amount: 2, unit: 'tbsp', category: 'grains' },
      { id: 'ingredient_002_003', name: 'Pirinç', amount: 2, unit: 'tbsp', category: 'grains' },
      { id: 'ingredient_002_004', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_002_005', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_002_006', name: 'Nane', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 35,
    tags: ['çorba', 'bakliyat', 'doyurucu'],
    difficulty: 'easy',
    season: ['winter', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 5,
    lastUsedAt: '2026-06-01T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_003',
    name: 'Tarhana Çorbası',
    description: 'Geleneksel tarhanayla yapılan pratik ve besleyici çorba',
    photo: recipePhotoMap.recipe_003,
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_003_001', name: 'Tarhana', amount: 4, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_003_002', name: 'Tereyağı', amount: 1, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_003_003', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_003_004', name: 'Su', amount: 5, unit: 'cup', category: 'liquids' },
      { id: 'ingredient_003_005', name: 'Nane', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 5,
    cookTimeMinutes: 20,
    tags: ['çorba', 'geleneksel', 'pratik'],
    difficulty: 'easy',
    season: ['winter', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 4,
    lastUsedAt: '2026-05-28T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_004',
    name: 'Yayla Çorbası',
    description: 'Yoğurt, pirinç ve naneyle yapılan hafif çorba',
    photo: recipePhotoMap.recipe_004,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_004_001', name: 'Yoğurt', amount: 1.5, unit: 'cup', category: 'dairy' },
      { id: 'ingredient_004_002', name: 'Pirinç', amount: 0.5, unit: 'cup', category: 'grains' },
      { id: 'ingredient_004_003', name: 'Yumurta', amount: 1, unit: 'piece', category: 'dairy' },
      { id: 'ingredient_004_004', name: 'Un', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_004_005', name: 'Tereyağı', amount: 1, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_004_006', name: 'Kuru nane', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    tags: ['çorba', 'yoğurtlu', 'hafif'],
    difficulty: 'medium',
    season: ['winter', 'spring', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 3,
    lastUsedAt: '2026-05-24T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_005',
    name: 'Kuru Fasulye',
    description: 'Salçalı klasik kuru fasulye yemeği',
    photo: recipePhotoMap.recipe_005,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_005_001', name: 'Kuru fasulye', amount: 2, unit: 'cup', category: 'legumes', note: 'Bir gece önceden ıslatılmış' },
      { id: 'ingredient_005_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_005_003', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_005_004', name: 'Biber salçası', amount: 1, unit: 'tsp', category: 'pantry' },
      { id: 'ingredient_005_005', name: 'Sıvı yağ', amount: 3, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 60,
    tags: ['bakliyat', 'ana yemek', 'ekonomik'],
    difficulty: 'medium',
    season: ['winter', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 9,
    lastUsedAt: '2026-06-03T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_006',
    name: 'Nohut Yemeği',
    description: 'Nohut, soğan ve salçayla yapılan doyurucu bakliyat yemeği',
    photo: recipePhotoMap.recipe_006,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_006_001', name: 'Nohut', amount: 2, unit: 'cup', category: 'legumes', note: 'Haşlanmış' },
      { id: 'ingredient_006_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_006_003', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_006_004', name: 'Zeytinyağı', amount: 3, unit: 'tbsp', category: 'oils' },
      { id: 'ingredient_006_005', name: 'Pul biber', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 40,
    tags: ['bakliyat', 'ana yemek', 'doyurucu'],
    difficulty: 'easy',
    season: ['winter', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 7,
    lastUsedAt: '2026-05-30T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_007',
    name: 'Pirinç Pilavı',
    description: 'Tereyağlı klasik pirinç pilavı',
    photo: recipePhotoMap.recipe_007,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_007_001', name: 'Pirinç', amount: 2, unit: 'cup', category: 'grains', note: 'Yıkanmış' },
      { id: 'ingredient_007_002', name: 'Tereyağı', amount: 2, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_007_003', name: 'Sıvı yağ', amount: 1, unit: 'tbsp', category: 'oils' },
      { id: 'ingredient_007_004', name: 'Su', amount: 3, unit: 'cup', category: 'liquids' },
      { id: 'ingredient_007_005', name: 'Tuz', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    tags: ['pilav', 'yan yemek', 'klasik'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 12,
    lastUsedAt: '2026-06-04T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_008',
    name: 'Bulgur Pilavı',
    description: 'Domatesli ve biberli ev usulü bulgur pilavı',
    photo: recipePhotoMap.recipe_008,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_008_001', name: 'Pilavlık bulgur', amount: 2, unit: 'cup', category: 'grains' },
      { id: 'ingredient_008_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_008_003', name: 'Yeşil biber', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_008_004', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_008_005', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_008_006', name: 'Zeytinyağı', amount: 3, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    tags: ['pilav', 'ekonomik', 'doyurucu'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 8,
    lastUsedAt: '2026-05-29T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_009',
    name: 'Tavuk Sote',
    description: 'Sebzelerle sotelenmiş pratik tavuk yemeği',
    photo: recipePhotoMap.recipe_009,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_009_001', name: 'Tavuk göğsü', amount: 500, unit: 'g', category: 'meat', note: 'Küp doğranmış' },
      { id: 'ingredient_009_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_009_003', name: 'Yeşil biber', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_009_004', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_009_005', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_009_006', name: 'Sıvı yağ', amount: 3, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    tags: ['tavuk', 'ana yemek', 'pratik'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 10,
    lastUsedAt: '2026-06-05T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_010',
    name: 'Etli Patates Yemeği',
    description: 'Kuşbaşı et ve patatesle yapılan salçalı tencere yemeği',
    photo: recipePhotoMap.recipe_010,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_010_001', name: 'Kuşbaşı dana eti', amount: 400, unit: 'g', category: 'meat' },
      { id: 'ingredient_010_002', name: 'Patates', amount: 4, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_010_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_010_004', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_010_005', name: 'Sıvı yağ', amount: 3, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 50,
    tags: ['etli', 'sulu yemek', 'doyurucu'],
    difficulty: 'medium',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'high',
    usageCount: 4,
    lastUsedAt: '2026-05-21T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_011',
    name: 'Karnıyarık',
    description: 'Kıymalı harçla doldurulmuş klasik patlıcan yemeği',
    photo: recipePhotoMap.recipe_011,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_011_001', name: 'Patlıcan', amount: 4, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_011_002', name: 'Kıyma', amount: 300, unit: 'g', category: 'meat' },
      { id: 'ingredient_011_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_011_004', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_011_005', name: 'Yeşil biber', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_011_006', name: 'Maydanoz', amount: 0.25, unit: 'bunch', category: 'vegetables' }
    ],
    prepTimeMinutes: 25,
    cookTimeMinutes: 45,
    tags: ['patlıcan', 'kıymalı', 'ana yemek'],
    difficulty: 'medium',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 6,
    lastUsedAt: '2026-06-02T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_012',
    name: 'İmam Bayıldı',
    description: 'Zeytinyağlı soğanlı patlıcan yemeği',
    photo: recipePhotoMap.recipe_012,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_012_001', name: 'Patlıcan', amount: 4, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_012_002', name: 'Soğan', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_012_003', name: 'Domates', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_012_004', name: 'Sarımsak', amount: 4, unit: 'clove', category: 'vegetables' },
      { id: 'ingredient_012_005', name: 'Zeytinyağı', amount: 0.5, unit: 'cup', category: 'oils' }
    ],
    prepTimeMinutes: 25,
    cookTimeMinutes: 40,
    tags: ['zeytinyağlı', 'patlıcan', 'etsiz'],
    difficulty: 'medium',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 3,
    lastUsedAt: '2026-05-18T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_013',
    name: 'Patlıcan Musakka',
    description: 'Kıymalı ve salçalı patlıcan musakka',
    photo: recipePhotoMap.recipe_013,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_013_001', name: 'Patlıcan', amount: 4, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_013_002', name: 'Kıyma', amount: 300, unit: 'g', category: 'meat' },
      { id: 'ingredient_013_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_013_004', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_013_005', name: 'Biber', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_013_006', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 40,
    tags: ['patlıcan', 'kıymalı', 'ana yemek'],
    difficulty: 'medium',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 4,
    lastUsedAt: '2026-05-26T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_014',
    name: 'Biber Dolması',
    description: 'Pirinçli iç harçla hazırlanan dolmalık biber',
    photo: recipePhotoMap.recipe_014,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_014_001', name: 'Dolmalık biber', amount: 10, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_014_002', name: 'Pirinç', amount: 1.5, unit: 'cup', category: 'grains' },
      { id: 'ingredient_014_003', name: 'Soğan', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_014_004', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_014_005', name: 'Zeytinyağı', amount: 0.5, unit: 'cup', category: 'oils' },
      { id: 'ingredient_014_006', name: 'Nane', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    tags: ['dolma', 'zeytinyağlı', 'klasik'],
    difficulty: 'medium',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 5,
    lastUsedAt: '2026-05-22T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_015',
    name: 'Yaprak Sarma',
    description: 'Pirinçli zeytinyağlı asma yaprağı sarması',
    photo: recipePhotoMap.recipe_015,
    mealTypes: ['lunch', 'dinner'],
    servings: 6,
    ingredients: [
      { id: 'ingredient_015_001', name: 'Asma yaprağı', amount: 500, unit: 'g', category: 'vegetables' },
      { id: 'ingredient_015_002', name: 'Pirinç', amount: 2, unit: 'cup', category: 'grains' },
      { id: 'ingredient_015_003', name: 'Soğan', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_015_004', name: 'Zeytinyağı', amount: 0.75, unit: 'cup', category: 'oils' },
      { id: 'ingredient_015_005', name: 'Kuş üzümü', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_015_006', name: 'Nane', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 45,
    cookTimeMinutes: 50,
    tags: ['sarma', 'zeytinyağlı', 'özel gün'],
    difficulty: 'hard',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 3,
    lastUsedAt: '2026-05-12T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_016',
    name: 'Menemen',
    description: 'Domates, biber ve yumurtayla hazırlanan kahvaltılık',
    photo: recipePhotoMap.recipe_016,
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    servings: 2,
    ingredients: [
      { id: 'ingredient_016_001', name: 'Yumurta', amount: 3, unit: 'piece', category: 'dairy' },
      { id: 'ingredient_016_002', name: 'Domates', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_016_003', name: 'Yeşil biber', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_016_004', name: 'Tereyağı', amount: 1, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_016_005', name: 'Pul biber', amount: 0.5, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    tags: ['kahvaltı', 'pratik', 'yumurtalı'],
    difficulty: 'easy',
    season: ['summer', 'spring', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 9,
    lastUsedAt: '2026-06-01T09:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_017',
    name: 'Anne Köftesi',
    description: 'Baharatlı kıymayla yapılan ev köftesi',
    photo: recipePhotoMap.recipe_017,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_017_001', name: 'Kıyma', amount: 500, unit: 'g', category: 'meat' },
      { id: 'ingredient_017_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables', note: 'Rendelenmiş' },
      { id: 'ingredient_017_003', name: 'Yumurta', amount: 1, unit: 'piece', category: 'dairy' },
      { id: 'ingredient_017_004', name: 'Galeta unu', amount: 0.5, unit: 'cup', category: 'pantry' },
      { id: 'ingredient_017_005', name: 'Maydanoz', amount: 0.25, unit: 'bunch', category: 'vegetables' },
      { id: 'ingredient_017_006', name: 'Kimyon', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 20,
    tags: ['köfte', 'ana yemek', 'çocuk dostu'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 11,
    lastUsedAt: '2026-06-04T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_018',
    name: 'İzmir Köfte',
    description: 'Köfte, patates ve domates sosuyla fırın yemeği',
    photo: recipePhotoMap.recipe_018,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_018_001', name: 'Kıyma', amount: 500, unit: 'g', category: 'meat' },
      { id: 'ingredient_018_002', name: 'Patates', amount: 4, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_018_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_018_004', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_018_005', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_018_006', name: 'Galeta unu', amount: 0.5, unit: 'cup', category: 'pantry' }
    ],
    prepTimeMinutes: 25,
    cookTimeMinutes: 45,
    tags: ['köfte', 'fırın', 'ana yemek'],
    difficulty: 'medium',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 6,
    lastUsedAt: '2026-05-27T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_019',
    name: 'Mantı',
    description: 'Yoğurtlu ve soslu klasik mantı',
    photo: recipePhotoMap.recipe_019,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_019_001', name: 'Hazır mantı', amount: 500, unit: 'g', category: 'grains' },
      { id: 'ingredient_019_002', name: 'Yoğurt', amount: 2, unit: 'cup', category: 'dairy' },
      { id: 'ingredient_019_003', name: 'Sarımsak', amount: 2, unit: 'clove', category: 'vegetables' },
      { id: 'ingredient_019_004', name: 'Tereyağı', amount: 2, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_019_005', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_019_006', name: 'Nane', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    tags: ['mantı', 'yoğurtlu', 'pratik'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 7,
    lastUsedAt: '2026-06-02T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_020',
    name: 'Lahmacun',
    description: 'Kıymalı harçla hazırlanan ince hamurlu lahmacun',
    photo: recipePhotoMap.recipe_020,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_020_001', name: 'Lahmacun hamuru', amount: 8, unit: 'piece', category: 'grains' },
      { id: 'ingredient_020_002', name: 'Kıyma', amount: 300, unit: 'g', category: 'meat' },
      { id: 'ingredient_020_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_020_004', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_020_005', name: 'Yeşil biber', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_020_006', name: 'Maydanoz', amount: 0.5, unit: 'bunch', category: 'vegetables' }
    ],
    prepTimeMinutes: 30,
    cookTimeMinutes: 20,
    tags: ['fırın', 'kıymalı', 'hamur işi'],
    difficulty: 'hard',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 2,
    lastUsedAt: '2026-05-10T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_021',
    name: 'Su Böreği',
    description: 'Peynirli klasik su böreği',
    photo: recipePhotoMap.recipe_021,
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    servings: 8,
    ingredients: [
      { id: 'ingredient_021_001', name: 'Yufka', amount: 6, unit: 'piece', category: 'grains' },
      { id: 'ingredient_021_002', name: 'Beyaz peynir', amount: 400, unit: 'g', category: 'dairy' },
      { id: 'ingredient_021_003', name: 'Yumurta', amount: 3, unit: 'piece', category: 'dairy' },
      { id: 'ingredient_021_004', name: 'Süt', amount: 1, unit: 'cup', category: 'dairy' },
      { id: 'ingredient_021_005', name: 'Tereyağı', amount: 100, unit: 'g', category: 'dairy' },
      { id: 'ingredient_021_006', name: 'Maydanoz', amount: 0.5, unit: 'bunch', category: 'vegetables' }
    ],
    prepTimeMinutes: 35,
    cookTimeMinutes: 40,
    tags: ['börek', 'kahvaltı', 'özel gün'],
    difficulty: 'hard',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 2,
    lastUsedAt: '2026-05-05T10:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_022',
    name: 'Mücver',
    description: 'Kabak, dereotu ve peynirle hazırlanan kızartma',
    photo: recipePhotoMap.recipe_022,
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_022_001', name: 'Kabak', amount: 3, unit: 'piece', category: 'vegetables', note: 'Rendelenmiş' },
      { id: 'ingredient_022_002', name: 'Yumurta', amount: 2, unit: 'piece', category: 'dairy' },
      { id: 'ingredient_022_003', name: 'Un', amount: 4, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_022_004', name: 'Dereotu', amount: 0.5, unit: 'bunch', category: 'vegetables' },
      { id: 'ingredient_022_005', name: 'Beyaz peynir', amount: 100, unit: 'g', category: 'dairy' },
      { id: 'ingredient_022_006', name: 'Sıvı yağ', amount: 0.5, unit: 'cup', category: 'oils', note: 'Kızartmak için' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    tags: ['kabak', 'kızartma', 'pratik'],
    difficulty: 'easy',
    season: ['summer', 'spring'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 5,
    lastUsedAt: '2026-05-31T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_023',
    name: 'Zeytinyağlı Taze Fasulye',
    description: 'Domatesli zeytinyağlı taze fasulye',
    photo: recipePhotoMap.recipe_023,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_023_001', name: 'Taze fasulye', amount: 750, unit: 'g', category: 'vegetables' },
      { id: 'ingredient_023_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_023_003', name: 'Domates', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_023_004', name: 'Zeytinyağı', amount: 0.5, unit: 'cup', category: 'oils' },
      { id: 'ingredient_023_005', name: 'Şeker', amount: 1, unit: 'tsp', category: 'pantry' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 45,
    tags: ['zeytinyağlı', 'sebze', 'hafif'],
    difficulty: 'easy',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 7,
    lastUsedAt: '2026-06-03T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_024',
    name: 'Sebzeli Türlü',
    description: 'Mevsim sebzeleriyle yapılan tencere yemeği',
    photo: recipePhotoMap.recipe_024,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_024_001', name: 'Patlıcan', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_024_002', name: 'Kabak', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_024_003', name: 'Patates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_024_004', name: 'Domates', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_024_005', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_024_006', name: 'Zeytinyağı', amount: 4, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 40,
    tags: ['sebze', 'etsiz', 'tencere'],
    difficulty: 'easy',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 4,
    lastUsedAt: '2026-05-19T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_025',
    name: 'Mercimek Köftesi',
    description: 'Kırmızı mercimek ve ince bulgurla hazırlanan köfte',
    photo: recipePhotoMap.recipe_025,
    mealTypes: ['lunch', 'dinner', 'snack'],
    servings: 6,
    ingredients: [
      { id: 'ingredient_025_001', name: 'Kırmızı mercimek', amount: 1.5, unit: 'cup', category: 'legumes' },
      { id: 'ingredient_025_002', name: 'İnce bulgur', amount: 1, unit: 'cup', category: 'grains' },
      { id: 'ingredient_025_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_025_004', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_025_005', name: 'Biber salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_025_006', name: 'Maydanoz', amount: 0.5, unit: 'bunch', category: 'vegetables' }
    ],
    prepTimeMinutes: 25,
    cookTimeMinutes: 20,
    tags: ['mercimek', 'soğuk', 'ekonomik'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 6,
    lastUsedAt: '2026-05-25T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_026',
    name: 'Kısır',
    description: 'İnce bulgur, yeşillik ve nar ekşisiyle hazırlanan salata',
    photo: recipePhotoMap.recipe_026,
    mealTypes: ['lunch', 'snack'],
    servings: 6,
    ingredients: [
      { id: 'ingredient_026_001', name: 'İnce bulgur', amount: 2, unit: 'cup', category: 'grains' },
      { id: 'ingredient_026_002', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_026_003', name: 'Biber salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_026_004', name: 'Maydanoz', amount: 0.5, unit: 'bunch', category: 'vegetables' },
      { id: 'ingredient_026_005', name: 'Taze soğan', amount: 5, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_026_006', name: 'Nar ekşisi', amount: 3, unit: 'tbsp', category: 'pantry' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    tags: ['bulgur', 'salata', 'pratik'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 6,
    lastUsedAt: '2026-06-01T13:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_027',
    name: 'Zeytinyağlı Pırasa',
    description: 'Havuç ve pirinçle pişen zeytinyağlı pırasa',
    photo: recipePhotoMap.recipe_027,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_027_001', name: 'Pırasa', amount: 1, unit: 'kg', category: 'vegetables' },
      { id: 'ingredient_027_002', name: 'Havuç', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_027_003', name: 'Pirinç', amount: 3, unit: 'tbsp', category: 'grains' },
      { id: 'ingredient_027_004', name: 'Zeytinyağı', amount: 0.5, unit: 'cup', category: 'oils' },
      { id: 'ingredient_027_005', name: 'Limon', amount: 1, unit: 'piece', category: 'fruits' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    tags: ['zeytinyağlı', 'sebze', 'hafif'],
    difficulty: 'easy',
    season: ['winter', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 4,
    lastUsedAt: '2026-05-15T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_028',
    name: 'Ispanak Yemeği',
    description: 'Pirinçli ve yoğurtla servis edilen ıspanak yemeği',
    photo: recipePhotoMap.recipe_028,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_028_001', name: 'Ispanak', amount: 1, unit: 'kg', category: 'vegetables' },
      { id: 'ingredient_028_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_028_003', name: 'Pirinç', amount: 0.25, unit: 'cup', category: 'grains' },
      { id: 'ingredient_028_004', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_028_005', name: 'Zeytinyağı', amount: 3, unit: 'tbsp', category: 'oils' },
      { id: 'ingredient_028_006', name: 'Yoğurt', amount: 1, unit: 'cup', category: 'dairy', note: 'Servis için' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    tags: ['sebze', 'ıspanak', 'hafif'],
    difficulty: 'easy',
    season: ['winter', 'spring'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 5,
    lastUsedAt: '2026-05-20T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_029',
    name: 'Kapuska',
    description: 'Lahana, pirinç ve kıymayla hazırlanan tencere yemeği',
    photo: recipePhotoMap.recipe_029,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_029_001', name: 'Beyaz lahana', amount: 0.5, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_029_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_029_003', name: 'Kıyma', amount: 200, unit: 'g', category: 'meat', note: 'İsteğe bağlı' },
      { id: 'ingredient_029_004', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_029_005', name: 'Pirinç', amount: 0.25, unit: 'cup', category: 'grains' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    tags: ['lahana', 'ekonomik', 'tencere'],
    difficulty: 'easy',
    season: ['winter', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 3,
    lastUsedAt: '2026-05-11T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_030',
    name: 'Tavuklu Nohutlu Pilav',
    description: 'Tavuk ve nohutla zenginleştirilmiş pirinç pilavı',
    photo: recipePhotoMap.recipe_030,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_030_001', name: 'Pirinç', amount: 2, unit: 'cup', category: 'grains' },
      { id: 'ingredient_030_002', name: 'Tavuk göğsü', amount: 300, unit: 'g', category: 'meat' },
      { id: 'ingredient_030_003', name: 'Nohut', amount: 1, unit: 'cup', category: 'legumes', note: 'Haşlanmış' },
      { id: 'ingredient_030_004', name: 'Tereyağı', amount: 2, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_030_005', name: 'Tavuk suyu', amount: 3, unit: 'cup', category: 'liquids' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    tags: ['pilav', 'tavuk', 'doyurucu'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 5,
    lastUsedAt: '2026-05-23T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_031',
    name: 'Balık Buğulama',
    description: 'Sebzelerle pişirilen hafif balık buğulama',
    photo: recipePhotoMap.recipe_031,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_031_001', name: 'Beyaz etli balık', amount: 4, unit: 'piece', category: 'seafood' },
      { id: 'ingredient_031_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_031_003', name: 'Patates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_031_004', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_031_005', name: 'Limon', amount: 1, unit: 'piece', category: 'fruits' },
      { id: 'ingredient_031_006', name: 'Zeytinyağı', amount: 4, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    tags: ['balık', 'hafif', 'fırın'],
    difficulty: 'medium',
    season: ['winter', 'autumn', 'spring'],
    cuisine: 'turkish',
    estimatedCost: 'high',
    usageCount: 2,
    lastUsedAt: '2026-05-14T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_032',
    name: 'Fırında Tavuk Patates',
    description: 'Yoğurtlu marineli tavuk ve patates fırın yemeği',
    photo: recipePhotoMap.recipe_032,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_032_001', name: 'Tavuk but', amount: 6, unit: 'piece', category: 'meat' },
      { id: 'ingredient_032_002', name: 'Patates', amount: 4, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_032_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_032_004', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_032_005', name: 'Yoğurt', amount: 2, unit: 'tbsp', category: 'dairy', note: 'Marine için' },
      { id: 'ingredient_032_006', name: 'Sıvı yağ', amount: 3, unit: 'tbsp', category: 'oils' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 50,
    tags: ['tavuk', 'fırın', 'pratik'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 9,
    lastUsedAt: '2026-06-05T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_033',
    name: 'Tas Kebabı',
    description: 'Kuşbaşı et, havuç ve bezelyeyle yapılan kebap',
    photo: recipePhotoMap.recipe_033,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_033_001', name: 'Kuşbaşı dana eti', amount: 500, unit: 'g', category: 'meat' },
      { id: 'ingredient_033_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_033_003', name: 'Havuç', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_033_004', name: 'Bezelye', amount: 1, unit: 'cup', category: 'vegetables' },
      { id: 'ingredient_033_005', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_033_006', name: 'Tereyağı', amount: 1, unit: 'tbsp', category: 'dairy' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 60,
    tags: ['etli', 'ana yemek', 'klasik'],
    difficulty: 'medium',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'high',
    usageCount: 3,
    lastUsedAt: '2026-05-09T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_034',
    name: 'Hünkar Beğendi',
    description: 'Beğendi üzerinde servis edilen kuşbaşı et yemeği',
    photo: recipePhotoMap.recipe_034,
    mealTypes: ['dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_034_001', name: 'Kuşbaşı dana eti', amount: 500, unit: 'g', category: 'meat' },
      { id: 'ingredient_034_002', name: 'Patlıcan', amount: 4, unit: 'piece', category: 'vegetables', note: 'Közlenmiş' },
      { id: 'ingredient_034_003', name: 'Süt', amount: 1.5, unit: 'cup', category: 'dairy' },
      { id: 'ingredient_034_004', name: 'Un', amount: 2, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_034_005', name: 'Tereyağı', amount: 2, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_034_006', name: 'Kaşar peyniri', amount: 100, unit: 'g', category: 'dairy' }
    ],
    prepTimeMinutes: 30,
    cookTimeMinutes: 60,
    tags: ['etli', 'patlıcan', 'özel gün'],
    difficulty: 'hard',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'high',
    usageCount: 2,
    lastUsedAt: '2026-04-30T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_035',
    name: 'Alinazik',
    description: 'Köz patlıcanlı yoğurt ve kıymayla hazırlanan kebap',
    photo: recipePhotoMap.recipe_035,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_035_001', name: 'Patlıcan', amount: 4, unit: 'piece', category: 'vegetables', note: 'Közlenmiş' },
      { id: 'ingredient_035_002', name: 'Kıyma', amount: 300, unit: 'g', category: 'meat' },
      { id: 'ingredient_035_003', name: 'Süzme yoğurt', amount: 1.5, unit: 'cup', category: 'dairy' },
      { id: 'ingredient_035_004', name: 'Sarımsak', amount: 2, unit: 'clove', category: 'vegetables' },
      { id: 'ingredient_035_005', name: 'Tereyağı', amount: 2, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_035_006', name: 'Pul biber', amount: 1, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 25,
    cookTimeMinutes: 25,
    tags: ['patlıcan', 'yoğurtlu', 'kıymalı'],
    difficulty: 'medium',
    season: ['summer', 'autumn'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 3,
    lastUsedAt: '2026-05-06T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_036',
    name: 'Kabak Yemeği',
    description: 'Pirinçli ve dereotlu hafif kabak yemeği',
    photo: recipePhotoMap.recipe_036,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_036_001', name: 'Kabak', amount: 5, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_036_002', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_036_003', name: 'Domates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_036_004', name: 'Pirinç', amount: 3, unit: 'tbsp', category: 'grains' },
      { id: 'ingredient_036_005', name: 'Zeytinyağı', amount: 4, unit: 'tbsp', category: 'oils' },
      { id: 'ingredient_036_006', name: 'Dereotu', amount: 0.25, unit: 'bunch', category: 'vegetables' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    tags: ['kabak', 'sebze', 'hafif'],
    difficulty: 'easy',
    season: ['summer', 'spring'],
    cuisine: 'turkish',
    estimatedCost: 'low',
    usageCount: 4,
    lastUsedAt: '2026-05-17T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_037',
    name: 'Kıymalı Makarna',
    description: 'Kıymalı salçalı sosla hazırlanan makarna',
    photo: recipePhotoMap.recipe_037,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_037_001', name: 'Makarna', amount: 500, unit: 'g', category: 'grains' },
      { id: 'ingredient_037_002', name: 'Kıyma', amount: 250, unit: 'g', category: 'meat' },
      { id: 'ingredient_037_003', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_037_004', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_037_005', name: 'Sıvı yağ', amount: 3, unit: 'tbsp', category: 'oils' },
      { id: 'ingredient_037_006', name: 'Karabiber', amount: 0.5, unit: 'tsp', category: 'spices' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    tags: ['makarna', 'pratik', 'kıymalı'],
    difficulty: 'easy',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 10,
    lastUsedAt: '2026-06-04T18:00:00.000Z',
    isFavorite: true,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_038',
    name: 'Fırında Makarna',
    description: 'Beşamel ve kaşar peynirli fırın makarna',
    photo: recipePhotoMap.recipe_038,
    mealTypes: ['lunch', 'dinner'],
    servings: 6,
    ingredients: [
      { id: 'ingredient_038_001', name: 'Fırın makarna', amount: 500, unit: 'g', category: 'grains' },
      { id: 'ingredient_038_002', name: 'Süt', amount: 3, unit: 'cup', category: 'dairy' },
      { id: 'ingredient_038_003', name: 'Un', amount: 2, unit: 'tbsp', category: 'pantry' },
      { id: 'ingredient_038_004', name: 'Tereyağı', amount: 2, unit: 'tbsp', category: 'dairy' },
      { id: 'ingredient_038_005', name: 'Kaşar peyniri', amount: 200, unit: 'g', category: 'dairy' },
      { id: 'ingredient_038_006', name: 'Yumurta', amount: 1, unit: 'piece', category: 'dairy' }
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    tags: ['makarna', 'fırın', 'kaşarlı'],
    difficulty: 'medium',
    season: ['all'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 4,
    lastUsedAt: '2026-05-16T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_039',
    name: 'Tavuk Haşlama',
    description: 'Patates ve havuçla pişen tavuk haşlama',
    photo: recipePhotoMap.recipe_039,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_039_001', name: 'Tavuk baget', amount: 6, unit: 'piece', category: 'meat' },
      { id: 'ingredient_039_002', name: 'Patates', amount: 3, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_039_003', name: 'Havuç', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_039_004', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_039_005', name: 'Limon', amount: 1, unit: 'piece', category: 'fruits' }
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 45,
    tags: ['tavuk', 'hafif', 'sulu yemek'],
    difficulty: 'easy',
    season: ['winter', 'autumn', 'spring'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 4,
    lastUsedAt: '2026-05-13T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'recipe_040',
    name: 'Kıymalı Bezelye',
    description: 'Patates ve havuçlu kıymalı bezelye yemeği',
    photo: recipePhotoMap.recipe_040,
    mealTypes: ['lunch', 'dinner'],
    servings: 4,
    ingredients: [
      { id: 'ingredient_040_001', name: 'Bezelye', amount: 500, unit: 'g', category: 'vegetables' },
      { id: 'ingredient_040_002', name: 'Kıyma', amount: 250, unit: 'g', category: 'meat' },
      { id: 'ingredient_040_003', name: 'Patates', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_040_004', name: 'Havuç', amount: 2, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_040_005', name: 'Soğan', amount: 1, unit: 'piece', category: 'vegetables' },
      { id: 'ingredient_040_006', name: 'Domates salçası', amount: 1, unit: 'tbsp', category: 'pantry' }
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    tags: ['bezelye', 'kıymalı', 'sulu yemek'],
    difficulty: 'easy',
    season: ['spring', 'summer', 'winter'],
    cuisine: 'turkish',
    estimatedCost: 'medium',
    usageCount: 5,
    lastUsedAt: '2026-05-26T18:00:00.000Z',
    isFavorite: false,
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  }
]

export const mockWeeklyPlans: WeeklyPlan[] = [
  {
    id: 'weekly_plan_001',
    weekStartDate: '2026-06-08',
    weekEndDate: '2026-06-14',
    days: [
      {
        date: '2026-06-08',
        day: 'monday',
        meals: [
          { id: 'planned_meal_001', mealType: 'breakfast', recipeId: 'recipe_004', servings: 1 },
          { id: 'planned_meal_002', mealType: 'dinner', recipeId: 'recipe_001', servings: 4 }
        ]
      },
      {
        date: '2026-06-09',
        day: 'tuesday',
        meals: [
          { id: 'planned_meal_003', mealType: 'lunch', recipeId: 'recipe_002', servings: 2 },
          { id: 'planned_meal_004', mealType: 'dinner', recipeId: 'recipe_001', servings: 2, note: 'Az porsiyon yapılacak' }
        ]
      },
      {
        date: '2026-06-10',
        day: 'wednesday',
        meals: [
          { id: 'planned_meal_005', mealType: 'dinner', recipeId: 'recipe_003', servings: 3 }
        ]
      },
      {
        date: '2026-06-11',
        day: 'thursday',
        meals: []
      },
      {
        date: '2026-06-12',
        day: 'friday',
        meals: [
          { id: 'planned_meal_006', mealType: 'breakfast', recipeId: 'recipe_004', servings: 2 },
          { id: 'planned_meal_007', mealType: 'dinner', recipeId: 'recipe_005', servings: 2, note: 'Somon taze alınacak' }
        ]
      },
      {
        date: '2026-06-13',
        day: 'saturday',
        meals: [
          { id: 'planned_meal_008', mealType: 'snack', recipeId: 'recipe_004', servings: 1 }
        ]
      },
      {
        date: '2026-06-14',
        day: 'sunday',
        meals: []
      }
    ],
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'weekly_plan_002',
    weekStartDate: '2026-06-15',
    weekEndDate: '2026-06-21',
    days: [
      {
        date: '2026-06-15',
        day: 'monday',
        meals: [
          { id: 'planned_meal_009', mealType: 'breakfast', recipeId: 'recipe_004', servings: 1 },
          { id: 'planned_meal_010', mealType: 'lunch', recipeId: 'recipe_003', servings: 2 }
        ]
      },
      {
        date: '2026-06-16',
        day: 'tuesday',
        meals: [
          { id: 'planned_meal_011', mealType: 'dinner', recipeId: 'recipe_002', servings: 2 }
        ]
      },
      {
        date: '2026-06-17',
        day: 'wednesday',
        meals: [
          { id: 'planned_meal_012', mealType: 'dinner', recipeId: 'recipe_001', servings: 4, note: 'Misafir için fazla yapılacak' }
        ]
      },
      {
        date: '2026-06-18',
        day: 'thursday',
        meals: [
          { id: 'planned_meal_013', mealType: 'snack', recipeId: 'recipe_004', servings: 2 }
        ]
      },
      {
        date: '2026-06-19',
        day: 'friday',
        meals: [
          { id: 'planned_meal_014', mealType: 'dinner', recipeId: 'recipe_005', servings: 2 }
        ]
      },
      {
        date: '2026-06-20',
        day: 'saturday',
        meals: []
      },
      {
        date: '2026-06-21',
        day: 'sunday',
        meals: [
          { id: 'planned_meal_015', mealType: 'lunch', recipeId: 'recipe_003', servings: 3 }
        ]
      }
    ],
    createdAt: '2026-06-07T09:00:00.000Z',
    updatedAt: '2026-06-07T09:00:00.000Z'
  },
  {
    id: 'weekly_plan_003',
    weekStartDate: '2026-06-22',
    weekEndDate: '2026-06-28',
    days: [
      {
        date: '2026-06-22',
        day: 'monday',
        meals: [
          { id: 'planned_meal_016', mealType: 'dinner', recipeId: 'recipe_001', servings: 2 }
        ]
      },
      {
        date: '2026-06-23',
        day: 'tuesday',
        meals: []
      },
      {
        date: '2026-06-24',
        day: 'wednesday',
        meals: [
          { id: 'planned_meal_017', mealType: 'breakfast', recipeId: 'recipe_004', servings: 1 },
          { id: 'planned_meal_018', mealType: 'dinner', recipeId: 'recipe_002', servings: 2 }
        ]
      },
      {
        date: '2026-06-25',
        day: 'thursday',
        meals: []
      },
      {
        date: '2026-06-26',
        day: 'friday',
        meals: [
          { id: 'planned_meal_019', mealType: 'lunch', recipeId: 'recipe_003', servings: 2 }
        ]
      },
      {
        date: '2026-06-27',
        day: 'saturday',
        meals: []
      },
      {
        date: '2026-06-28',
        day: 'sunday',
        meals: []
      }
    ],
    createdAt: '2026-06-08T09:00:00.000Z',
    updatedAt: '2026-06-08T09:00:00.000Z'
  }
]

export const mockShoppingLists: ShoppingList[] = [
  {
    id: 'shopping_list_001',
    weeklyPlanId: 'weekly_plan_001',
    items: [
      {
        id: 'shopping_item_001',
        name: 'Kırmızı mercimek',
        totalAmount: 1.5,
        unit: 'cup',
        category: 'legumes',
        checked: false,
        recipes: [{ recipeId: 'recipe_001', recipeName: 'Mercimek Çorbası', amount: 1.5, unit: 'cup' }]
      },
      {
        id: 'shopping_item_002',
        name: 'Yoğurt',
        totalAmount: 3,
        unit: 'cup',
        category: 'dairy',
        checked: true,
        recipes: [
          { recipeId: 'recipe_004', recipeName: 'Yulaflı Kahvaltı Kasesi', amount: 3, unit: 'cup' },
          { recipeId: 'recipe_002', recipeName: 'Tavuklu Tahıl Kasesi', amount: 4, unit: 'tbsp' }
        ]
      },
      {
        id: 'shopping_item_003',
        name: 'Somon fileto',
        totalAmount: 2,
        unit: 'piece',
        category: 'fish',
        checked: false,
        recipes: [{ recipeId: 'recipe_005', recipeName: 'Fırında Somon ve Patates', amount: 2, unit: 'piece' }],
        note: 'Cuma günü alınacak'
      },
      {
        id: 'shopping_item_004',
        name: 'Makarna',
        totalAmount: 1,
        unit: 'pack',
        category: 'grains',
        checked: false,
        recipes: [{ recipeId: 'recipe_003', recipeName: 'Sebzeli Makarna', amount: 1, unit: 'pack' }]
      }
    ],
    createdAt: '2026-06-06T10:00:00.000Z',
    updatedAt: '2026-06-06T10:00:00.000Z'
  },
  {
    id: 'shopping_list_002',
    weeklyPlanId: 'weekly_plan_002',
    items: [
      {
        id: 'shopping_item_005',
        name: 'Tavuk göğsü',
        totalAmount: 300,
        unit: 'g',
        category: 'chicken',
        checked: false,
        recipes: [{ recipeId: 'recipe_002', recipeName: 'Tavuklu Tahıl Kasesi', amount: 300, unit: 'g' }]
      },
      {
        id: 'shopping_item_006',
        name: 'Muz',
        totalAmount: 3,
        unit: 'piece',
        category: 'fruits',
        checked: false,
        recipes: [{ recipeId: 'recipe_004', recipeName: 'Yulaflı Kahvaltı Kasesi', amount: 3, unit: 'piece' }]
      },
      {
        id: 'shopping_item_007',
        name: 'Patates',
        totalAmount: 4,
        unit: 'piece',
        category: 'vegetables',
        checked: true,
        recipes: [{ recipeId: 'recipe_005', recipeName: 'Fırında Somon ve Patates', amount: 4, unit: 'piece' }]
      }
    ],
    createdAt: '2026-06-07T09:00:00.000Z',
    updatedAt: '2026-06-07T09:00:00.000Z'
  },
  {
    id: 'shopping_list_003',
    weeklyPlanId: 'weekly_plan_003',
    items: [
      {
        id: 'shopping_item_008',
        name: 'Bulgur',
        totalAmount: 1,
        unit: 'cup',
        category: 'grains',
        checked: false,
        recipes: [{ recipeId: 'recipe_002', recipeName: 'Tavuklu Tahıl Kasesi', amount: 1, unit: 'cup' }]
      },
      {
        id: 'shopping_item_009',
        name: 'Domates sosu',
        totalAmount: 1,
        unit: 'cup',
        category: 'sauces',
        checked: false,
        recipes: [{ recipeId: 'recipe_003', recipeName: 'Sebzeli Makarna', amount: 1, unit: 'cup' }]
      }
    ],
    createdAt: '2026-06-08T09:00:00.000Z',
    updatedAt: '2026-06-08T09:00:00.000Z'
  }
]

export const mockMealPlannerData: MealPlannerData = {
  recipes: mockRecipes,
  weeklyPlans: mockWeeklyPlans,
  shoppingLists: mockShoppingLists
}
