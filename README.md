# Nutrition Tracker

Personal nutrition database and recipe calculator. Track food items and build recipes with automatic nutrition calculations.

## Stack
- Plain HTML/JS — no build step needed
- Supabase for database and authentication
- Supabase project: `hebuaabantmnfdxxkaif`

## Features
- Foods database — add, edit, search and delete food items with full nutrition info
- Recipe builder — combine foods into recipes with per-serving nutrition calculations
- Export / Import — backup and restore your data as JSON
- Login protected — requires email/password authentication

## Tables
| Table | Description |
|---|---|
| `foods` | Food items with nutrition data per serving |
| `nutrition_recipes` | Recipes with calculated nutrition totals |
| `recipe_ingredients` | Links recipes to foods with quantities |

## Deploy
Edit `index.html` directly, push to GitHub — GitHub Pages serves it automatically. No build step required.

## Auth
Single user via Supabase email/password auth. RLS enabled on all tables — only authenticated sessions can read or write data.

## Notes
- The `recipes` table in this Supabase project belongs to a separate repository — do not use it here
- Recipe nutrition totals are calculated from ingredients and stored on save
- Session persists across page refreshes via Supabase localStorage
