# Supabase Setup

This project keeps database schema changes in code.

## Files

- `schemas/`: declarative schema source split by domain.
- `migrations/`: versioned SQL applied by Supabase deploys.

## Dashboard checklist

1. In Supabase Auth settings, enable the sign-in providers you want to use first.
2. Add local and production URLs to Auth URL configuration:
   - Site URL: production app URL when available.
   - Redirect URLs: `http://localhost:3000/**` for local development.
3. Keep Row Level Security enabled on all app tables.
4. Do not expose the service role key in Nuxt. The app only needs the publishable key.

## Local env

Fill `.env` with values from Supabase project settings:

```env
SUPABASE_URL=
SUPABASE_KEY=
```
