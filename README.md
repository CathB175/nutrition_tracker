# Nutrition Tracker

A comprehensive nutrition database and recipe calculator built with React and Supabase.

## Features

- 📊 **Food Database**: Store and manage nutritional information for individual foods
- 🍳 **Recipe Builder**: Create recipes from foods and automatically calculate nutrition
- 🔍 **Search & Sort**: Find foods and recipes quickly with search and sorting
- ✏️ **Full CRUD**: Add, edit, and delete foods and recipes
- 💾 **Import/Export**: Backup and restore your entire database as JSON
- 📱 **Responsive**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Styling**: Inline styles with custom design system

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd nutrition-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key

3. In the Supabase dashboard, go to **SQL Editor** and run the following SQL to create your tables:

```sql
-- See database-schema.sql file for complete schema
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

The production files will be in the `dist` folder.

## Database Schema

### Tables

- **foods**: Individual food items with nutritional information
- **recipes**: Recipes with calculated nutrition
- **recipe_ingredients**: Junction table linking recipes to foods with quantities

See `database-schema.sql` for the complete schema.

## Usage

### Adding Foods

1. Click "Add Food" button
2. Enter food name, serving size, and nutritional values
3. Click "Save Food"

### Creating Recipes

1. Switch to "Recipe Builder" tab
2. Click "New Recipe"
3. Add recipe name, description, and servings
4. Search and add ingredients with quantities
5. Nutrition is calculated automatically
6. Click "Save Recipe"

### Import/Export

- **Export**: Click the "Export" button to download your entire database as JSON
- **Import**: Click "Import" and select a JSON file to restore data

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT
