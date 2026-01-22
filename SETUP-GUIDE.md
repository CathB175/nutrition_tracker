# Nutrition Tracker - Setup Guide

## Part 1: GitHub Setup

### Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the "+" button in top right → "New repository"
3. Name it: `nutrition-tracker`
4. Description: `Nutrition database and recipe calculator`
5. Choose **Public** or **Private**
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click "Create repository"

### Step 2: Upload Your Code

You have two options:

#### Option A: Using GitHub Website (Easier)
1. In your new repository, click "uploading an existing file"
2. Drag the entire `nutrition-tracker` folder from your downloads
3. Commit the files

#### Option B: Using Git Command Line (Recommended)
```bash
cd nutrition-tracker
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nutrition-tracker.git
git push -u origin main
```

---

## Part 2: Supabase Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign in and click "New Project"
3. Choose your organization (or create one)
4. Project name: `nutrition-tracker`
5. Database password: **Save this somewhere safe!**
6. Region: Choose closest to you
7. Click "Create new project"
8. Wait 2-3 minutes for project to initialize

### Step 2: Create Database Tables

1. In your Supabase project dashboard, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the **entire contents** of `database-schema.sql`
4. Paste into the SQL editor
5. Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
6. You should see "Success. No rows returned"

### Step 3: Verify Tables Were Created

1. Click **Table Editor** (left sidebar)
2. You should see 3 tables:
   - `foods`
   - `recipes`
   - `recipe_ingredients`
3. Click on `foods` - you should see 3 sample foods already added

### Step 4: Get Your API Credentials

1. Click **Settings** (gear icon, bottom left)
2. Click **API** in the settings menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## Part 3: Local Development Setup

### Step 1: Install Node.js

If you don't have Node.js:
1. Go to https://nodejs.org
2. Download the LTS version
3. Install it

### Step 2: Setup Project

1. Open terminal/command prompt
2. Navigate to the project folder:
   ```bash
   cd nutrition-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor

3. Replace with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 4: Run the App

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

---

## Part 4: Deployment (Optional)

### Deploy to Vercel (Recommended)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your `nutrition-tracker` repository
5. Add environment variables:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click "Deploy"
7. Your app will be live in ~2 minutes!

### Deploy to Netlify

1. Go to https://netlify.com
2. Drag the `dist` folder (after running `npm run build`)
3. Add environment variables in Site Settings
4. Done!

---

## Testing Your Setup

1. **Add a food**: Click "Add Food", fill in details, save
2. **Create a recipe**: Switch to "Recipe Builder", add ingredients
3. **Export data**: Click "Export" to download JSON backup
4. **Refresh page**: Data should persist (from Supabase)

---

## Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env` file has correct credentials
- Verify you copied the **Project URL** and **anon** key (not the service key)
- Make sure `.env` is in the root folder

### "Table not found"
- Go back to Supabase SQL Editor
- Re-run the `database-schema.sql`

### "npm install" fails
- Make sure Node.js is installed: `node --version`
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

---

## Need Help?

- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Create an issue in your GitHub repository

## Next Steps

Once everything works:
1. Customize the styling to your preference
2. Add user authentication (Supabase Auth)
3. Add more nutritional fields if needed
4. Deploy to production!
