import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

loadDotEnv()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY
const email = process.env.SUPABASE_TEST_EMAIL ?? process.env.E2E_EMAIL
const password = process.env.SUPABASE_TEST_PASSWORD ?? process.env.E2E_PASSWORD

const requiredEnv = [
  ['SUPABASE_URL', supabaseUrl],
  ['SUPABASE_KEY or SUPABASE_PUBLISHABLE_KEY', supabaseKey],
  ['SUPABASE_TEST_EMAIL or E2E_EMAIL', email],
  ['SUPABASE_TEST_PASSWORD or E2E_PASSWORD', password]
]

const missingEnv = requiredEnv.filter(([, value]) => !value).map(([key]) => key)

if (missingEnv.length > 0) {
  fail(`Missing env: ${missingEnv.join(', ')}`)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: class NoopWebSocket {}
  }
})
const runId = randomUUID().slice(0, 8)
const recipeName = `DB Smoke Test Yemek ${runId}`
const planStartDate = getNextMondayDate()
const planEndDate = addDays(planStartDate, 6)
const created = {
  recipeId: null,
  weeklyPlanId: null
}

try {
  logStep('Signing in test user')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  throwIfError(authError, 'Sign in failed')

  const userId = authData.user?.id

  if (!userId) {
    fail('Sign in did not return a user id')
  }

  logStep('Creating recipe')
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
      name: recipeName,
      description: 'DB smoke test recipe',
      meal_types: ['dinner'],
      servings: 2,
      prep_time_minutes: 5,
      cook_time_minutes: 15,
      tags: ['db-smoke-test'],
      difficulty: 'easy',
      season: ['all'],
      cuisine: 'Test',
      estimated_cost: 'low',
      is_favorite: false
    })
    .select()
    .single()
  throwIfError(recipeError, 'Recipe insert failed')
  created.recipeId = recipe.id

  const { error: ingredientError } = await supabase
    .from('recipe_ingredients')
    .insert({
      recipe_id: recipe.id,
      user_id: userId,
      name: 'Test Domates',
      amount: 2,
      unit: 'piece',
      category: 'vegetables',
      note: 'smoke test',
      sort_order: 0
    })
  throwIfError(ingredientError, 'Recipe ingredient insert failed')

  logStep('Listing created recipe')
  const { data: listedRecipes, error: listRecipeError } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .eq('name', recipeName)
  throwIfError(listRecipeError, 'Recipe list failed')
  assert(listedRecipes.length === 1, `Expected 1 listed recipe, got ${listedRecipes.length}`)
  assert(listedRecipes[0].recipe_ingredients.length === 1, 'Expected listed recipe ingredient')

  logStep('Creating weekly plan')
  const { data: weeklyPlan, error: planError } = await supabase
    .from('weekly_plans')
    .insert({
      user_id: userId,
      week_start_date: planStartDate,
      week_end_date: planEndDate
    })
    .select()
    .single()
  throwIfError(planError, 'Weekly plan insert failed')
  created.weeklyPlanId = weeklyPlan.id

  const { data: planDay, error: dayError } = await supabase
    .from('weekly_plan_days')
    .insert({
      weekly_plan_id: weeklyPlan.id,
      user_id: userId,
      date: planStartDate,
      day: 'monday',
      sort_order: 0
    })
    .select()
    .single()
  throwIfError(dayError, 'Weekly plan day insert failed')

  const { error: mealError } = await supabase
    .from('planned_meals')
    .insert({
      weekly_plan_day_id: planDay.id,
      weekly_plan_id: weeklyPlan.id,
      recipe_id: recipe.id,
      user_id: userId,
      meal_type: 'dinner',
      servings: 2,
      note: 'DB smoke test planned meal',
      sort_order: 0
    })
  throwIfError(mealError, 'Planned meal insert failed')

  logStep('Listing created weekly plan')
  const { data: listedPlans, error: listPlanError } = await supabase
    .from('weekly_plans')
    .select('*, weekly_plan_days(*, planned_meals(*))')
    .eq('id', weeklyPlan.id)
  throwIfError(listPlanError, 'Weekly plan list failed')
  assert(listedPlans.length === 1, `Expected 1 listed plan, got ${listedPlans.length}`)
  assert(listedPlans[0].weekly_plan_days.length === 1, 'Expected listed plan day')
  assert(listedPlans[0].weekly_plan_days[0].planned_meals.length === 1, 'Expected listed planned meal')
  assert(
    listedPlans[0].weekly_plan_days[0].planned_meals[0].recipe_id === recipe.id,
    'Expected planned meal to reference created recipe'
  )

  console.log('\nDB smoke test passed')
  console.log(`Recipe: ${recipeName}`)
  console.log(`Plan: ${planStartDate} - ${planEndDate}`)
} catch (error) {
  console.error('\nDB smoke test failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await cleanup()
  await supabase.auth.signOut()
}

async function cleanup() {
  logStep('Cleaning up test records')

  if (created.weeklyPlanId) {
    const { error } = await supabase
      .from('weekly_plans')
      .delete()
      .eq('id', created.weeklyPlanId)

    if (error) {
      console.warn(`Cleanup warning: weekly plan delete failed: ${error.message}`)
    }
  }

  if (created.recipeId) {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', created.recipeId)

    if (error) {
      console.warn(`Cleanup warning: recipe delete failed: ${error.message}`)
    }
  }
}

function loadDotEnv() {
  if (!existsSync('.env')) {
    return
  }

  const lines = readFileSync('.env', 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)

    if (!match) {
      continue
    }

    const [, key, rawValue] = match

    if (process.env[key]) {
      continue
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

function throwIfError(error, message) {
  if (error) {
    throw new Error(`${message}: ${error.message}`)
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

function logStep(message) {
  console.log(`- ${message}`)
}

function getNextMondayDate() {
  const date = new Date()
  const dayIndex = date.getDay()
  const daysUntilMonday = dayIndex === 1 ? 7 : (8 - dayIndex) % 7 || 7
  date.setDate(date.getDate() + daysUntilMonday)
  return toDateInputValue(date)
}

function addDays(date, days) {
  const nextDate = new Date(`${date}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + days)
  return toDateInputValue(nextDate)
}

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}
