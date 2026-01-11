-- Nutrition Tracker Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create foods table
CREATE TABLE foods (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    serving_size DECIMAL(10, 2) NOT NULL,
    serving_unit TEXT NOT NULL,
    calories DECIMAL(10, 2) DEFAULT 0,
    protein DECIMAL(10, 2) DEFAULT 0,
    carbohydrates DECIMAL(10, 2) DEFAULT 0,
    fat DECIMAL(10, 2) DEFAULT 0,
    fiber DECIMAL(10, 2) DEFAULT 0,
    sugar DECIMAL(10, 2) DEFAULT 0,
    sodium DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    total_servings INTEGER NOT NULL DEFAULT 1,
    calories DECIMAL(10, 2) DEFAULT 0,
    protein DECIMAL(10, 2) DEFAULT 0,
    carbohydrates DECIMAL(10, 2) DEFAULT 0,
    fat DECIMAL(10, 2) DEFAULT 0,
    fiber DECIMAL(10, 2) DEFAULT 0,
    sugar DECIMAL(10, 2) DEFAULT 0,
    sodium DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_ingredients junction table
CREATE TABLE recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    food_id BIGINT NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_food_id ON recipe_ingredients(food_id);

-- Enable Row Level Security (RLS)
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (you can modify these for authentication)
-- For now, allowing anyone to read/write for simplicity

-- Foods policies
CREATE POLICY "Allow all access to foods" ON foods
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Recipes policies
CREATE POLICY "Allow all access to recipes" ON recipes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Recipe ingredients policies
CREATE POLICY "Allow all access to recipe_ingredients" ON recipe_ingredients
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Add some sample data
INSERT INTO foods (name, serving_size, serving_unit, calories, protein, carbohydrates, fat, fiber, sugar, sodium) VALUES
    ('Chicken Breast', 100, 'g', 165, 31, 0, 3.6, 0, 0, 74),
    ('Brown Rice', 100, 'g', 112, 2.6, 24, 0.9, 1.8, 0.4, 5),
    ('Broccoli', 100, 'g', 34, 2.8, 7, 0.4, 2.6, 1.7, 33);

-- Success message
SELECT 'Database schema created successfully!' as message;
