import React, { useState, useEffect } from 'react';
import { Camera, Plus, X, ChefHat, Apple, Calculator, Edit2, Trash2, Download, Upload } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function NutritionTracker() {
  const [activeTab, setActiveTab] = useState('foods');
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newFood, setNewFood] = useState({
    name: '', serving_size: '', serving_unit: 'g',
    calories: '', protein: '', carbohydrates: '', fat: '',
    fiber: '', sugar: '', sodium: ''
  });

  const [newRecipe, setNewRecipe] = useState({
    name: '', description: '', total_servings: 1, ingredients: []
  });

  const [selectedFood, setSelectedFood] = useState(null);
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [foodSortBy, setFoodSortBy] = useState('name'); // 'name' or 'calories'
  const [recipeSortBy, setRecipeSortBy] = useState('name'); // 'name' or 'calories'
  
  // Load data from Supabase on mount
  useEffect(() => {
    loadFoods();
    loadRecipes();
  }, []);

  const loadFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error('Error loading foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            quantity,
            unit,
            food:foods (*)
          )
        `)
        .order('name');
      
      if (error) throw error;
      
      // Transform the data to match our component structure
      const transformedRecipes = (data || []).map(recipe => ({
        ...recipe,
        ingredients: recipe.recipe_ingredients.map(ri => ({
          food: ri.food,
          quantity: ri.quantity,
          unit: ri.unit
        }))
      }));
      
      setRecipes(transformedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };
  
  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIngredientsForRecipe = foods.filter(food =>
    food.name.toLowerCase().includes(ingredientSearchQuery.toLowerCase())
  );

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(recipeSearchQuery.toLowerCase())
  );

  // Sort foods
  const sortedFoods = [...filteredFoods].sort((a, b) => {
    if (foodSortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (foodSortBy === 'calories') {
      return b.calories - a.calories;
    }
    return 0;
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (recipeSortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (recipeSortBy === 'calories') {
      const aCalPerServing = (a.calories || 0) / a.total_servings;
      const bCalPerServing = (b.calories || 0) / b.total_servings;
      return bCalPerServing - aCalPerServing;
    }
    return 0;
  });

  const addFood = async () => {
    if (!newFood.name || !newFood.name.trim()) {
      console.error('Food name is required');
      return;
    }
    
    const servingSize = parseFloat(newFood.serving_size);
    if (!servingSize || servingSize <= 0) {
      console.error('Serving size must be greater than 0');
      return;
    }
    
    const food = {
      name: newFood.name.trim(),
      serving_size: servingSize,
      serving_unit: newFood.serving_unit,
      calories: Math.max(0, parseFloat(newFood.calories) || 0),
      protein: Math.max(0, parseFloat(newFood.protein) || 0),
      carbohydrates: Math.max(0, parseFloat(newFood.carbohydrates) || 0),
      fat: Math.max(0, parseFloat(newFood.fat) || 0),
      fiber: Math.max(0, parseFloat(newFood.fiber) || 0),
      sugar: Math.max(0, parseFloat(newFood.sugar) || 0),
      sodium: Math.max(0, parseFloat(newFood.sodium) || 0),
    };
    
    try {
      const { data, error } = await supabase
        .from('foods')
        .insert([food])
        .select();
      
      if (error) throw error;
      
      setFoods([...foods, data[0]]);
      setNewFood({
        name: '', serving_size: '', serving_unit: 'g',
        calories: '', protein: '', carbohydrates: '', fat: '',
        fiber: '', sugar: '', sodium: ''
      });
      setShowFoodForm(false);
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const deleteFood = async (foodId) => {
    try {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', foodId);
      
      if (error) throw error;
      
      setFoods(foods.filter(f => f.id !== foodId));
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  const startEditFood = (food) => {
    setEditingFood(food);
    setNewFood({
      name: food.name,
      serving_size: food.serving_size.toString(),
      serving_unit: food.serving_unit,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbohydrates: food.carbohydrates.toString(),
      fat: food.fat.toString(),
      fiber: food.fiber.toString(),
      sugar: food.sugar.toString(),
      sodium: food.sodium.toString()
    });
    setShowFoodForm(true);
  };

  const saveEditedFood = async () => {
    if (!newFood.name || !newFood.name.trim() || !editingFood) {
      console.error('Food name is required');
      return;
    }
    
    const servingSize = parseFloat(newFood.serving_size);
    if (!servingSize || servingSize <= 0) {
      console.error('Serving size must be greater than 0');
      return;
    }
    
    const updatedFood = {
      name: newFood.name.trim(),
      serving_size: servingSize,
      serving_unit: newFood.serving_unit,
      calories: Math.max(0, parseFloat(newFood.calories) || 0),
      protein: Math.max(0, parseFloat(newFood.protein) || 0),
      carbohydrates: Math.max(0, parseFloat(newFood.carbohydrates) || 0),
      fat: Math.max(0, parseFloat(newFood.fat) || 0),
      fiber: Math.max(0, parseFloat(newFood.fiber) || 0),
      sugar: Math.max(0, parseFloat(newFood.sugar) || 0),
      sodium: Math.max(0, parseFloat(newFood.sodium) || 0),
    };
    
    try {
      const { data, error } = await supabase
        .from('foods')
        .update(updatedFood)
        .eq('id', editingFood.id)
        .select();
      
      if (error) throw error;
      
      setFoods(foods.map(f => f.id === editingFood.id ? data[0] : f));
      setNewFood({
        name: '', serving_size: '', serving_unit: 'g',
        calories: '', protein: '', carbohydrates: '', fat: '',
        fiber: '', sugar: '', sodium: ''
      });
      setShowFoodForm(false);
      setEditingFood(null);
    } catch (error) {
      console.error('Error updating food:', error);
    }
  };

  const cancelEditFood = () => {
    setEditingFood(null);
    setNewFood({
      name: '', serving_size: '', serving_unit: 'g',
      calories: '', protein: '', carbohydrates: '', fat: '',
      fiber: '', sugar: '', sodium: ''
    });
    setShowFoodForm(false);
  };

  const addIngredientToRecipe = () => {
    if (!selectedFood || !ingredientQuantity) return;
    
    const ingredient = {
      food: selectedFood,
      quantity: parseFloat(ingredientQuantity),
      unit: selectedFood.serving_unit
    };
    
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, ingredient]
    });
    setSelectedFood(null);
    setIngredientQuantity('');
    setIngredientSearchQuery('');
  };

  const removeIngredient = (index) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients
    });
  };

  const calculateRecipeNutrition = (recipe) => {
    const totals = {
      calories: 0, protein: 0, carbohydrates: 0, fat: 0,
      fiber: 0, sugar: 0, sodium: 0
    };

    recipe.ingredients.forEach(ingredient => {
      const ratio = ingredient.quantity / ingredient.food.serving_size;
      totals.calories += ingredient.food.calories * ratio;
      totals.protein += ingredient.food.protein * ratio;
      totals.carbohydrates += ingredient.food.carbohydrates * ratio;
      totals.fat += ingredient.food.fat * ratio;
      totals.fiber += ingredient.food.fiber * ratio;
      totals.sugar += ingredient.food.sugar * ratio;
      totals.sodium += ingredient.food.sodium * ratio;
    });

    return Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [key, Math.round(value * 10) / 10])
    );
  };

  const saveRecipe = async () => {
    if (!newRecipe.name || !newRecipe.name.trim()) {
      console.error('Recipe name is required');
      return;
    }
    
    if (newRecipe.ingredients.length === 0) {
      console.error('Recipe must have at least one ingredient');
      return;
    }
    
    if (newRecipe.total_servings <= 0) {
      console.error('Total servings must be greater than 0');
      return;
    }
    
    const nutrition = calculateRecipeNutrition(newRecipe);
    
    const recipe = {
      name: newRecipe.name.trim(),
      description: newRecipe.description.trim(),
      total_servings: newRecipe.total_servings,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbohydrates: nutrition.carbohydrates,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      sugar: nutrition.sugar,
      sodium: nutrition.sodium
    };
    
    try {
      // Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([recipe])
        .select();
      
      if (recipeError) throw recipeError;
      
      const recipeId = recipeData[0].id;
      
      // Insert recipe ingredients
      const ingredients = newRecipe.ingredients.map(ing => ({
        recipe_id: recipeId,
        food_id: ing.food.id,
        quantity: ing.quantity,
        unit: ing.unit
      }));
      
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients);
      
      if (ingredientsError) throw ingredientsError;
      
      // Reload recipes to get the full data with joins
      await loadRecipes();
      
      setNewRecipe({
        name: '', description: '', total_servings: 1, ingredients: []
      });
      setShowRecipeForm(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);
      
      if (error) throw error;
      
      setRecipes(recipes.filter(r => r.id !== recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const startEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({
      name: recipe.name,
      description: recipe.description,
      total_servings: recipe.total_servings,
      ingredients: [...recipe.ingredients]
    });
    setShowRecipeForm(true);
  };

  const saveEditedRecipe = async () => {
    if (!newRecipe.name || !newRecipe.name.trim() || !editingRecipe) {
      console.error('Recipe name is required');
      return;
    }
    
    if (newRecipe.ingredients.length === 0) {
      console.error('Recipe must have at least one ingredient');
      return;
    }
    
    if (newRecipe.total_servings <= 0) {
      console.error('Total servings must be greater than 0');
      return;
    }
    
    const nutrition = calculateRecipeNutrition(newRecipe);
    
    const updatedRecipe = {
      name: newRecipe.name.trim(),
      description: newRecipe.description.trim(),
      total_servings: newRecipe.total_servings,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbohydrates: nutrition.carbohydrates,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      sugar: nutrition.sugar,
      sodium: nutrition.sodium
    };
    
    try {
      // Update recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .update(updatedRecipe)
        .eq('id', editingRecipe.id);
      
      if (recipeError) throw recipeError;
      
      // Delete old ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', editingRecipe.id);
      
      if (deleteError) throw deleteError;
      
      // Insert new ingredients
      const ingredients = newRecipe.ingredients.map(ing => ({
        recipe_id: editingRecipe.id,
        food_id: ing.food.id,
        quantity: ing.quantity,
        unit: ing.unit
      }));
      
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients);
      
      if (ingredientsError) throw ingredientsError;
      
      // Reload recipes
      await loadRecipes();
      
      setNewRecipe({
        name: '', description: '', total_servings: 1, ingredients: []
      });
      setShowRecipeForm(false);
      setEditingRecipe(null);
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  const cancelEditRecipe = () => {
    setEditingRecipe(null);
    setNewRecipe({
      name: '', description: '', total_servings: 1, ingredients: []
    });
    setShowRecipeForm(false);
  };

  const exportData = () => {
    const data = {
      foods,
      recipes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrition-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.foods || !data.recipes) {
          console.error('Invalid file format');
          return;
        }

        // Replace all data
        setFoods(data.foods);
        setRecipes(data.recipes);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      fontFamily: "'Courier New', monospace",
      color: '#f0f0f0',
      padding: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(100, 255, 100, 0.25) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255, 180, 50, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          marginBottom: '60px',
          borderBottom: '3px solid #00ff88',
          paddingBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{
                fontSize: '72px',
                fontWeight: 'bold',
                margin: '0',
                letterSpacing: '-3px',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #00ff88 0%, #66ff99 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1'
              }}>
                NUTRITION
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#999',
                marginTop: '15px',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                Database & Recipe Calculator
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={exportData}
                style={{
                  padding: '12px 20px',
                  background: '#00ff88',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Courier New', monospace",
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#33ffaa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#00ff88';
                }}
              >
                <Download size={16} />
                Export
              </button>
              
              <label style={{
                padding: '12px 20px',
                background: '#ffaa00',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Courier New', monospace",
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ffcc33';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ffaa00';
              }}
              >
                <Upload size={16} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  style={{ display: 'none' }}
                />
              </label>
              
              <div style={{
                padding: '12px 20px',
                background: '#3d4a5c',
                color: '#999',
                fontSize: '11px',
                fontFamily: "'Courier New', monospace",
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                {foods.length} Foods | {recipes.length} Recipes
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '50px',
          border: '2px solid #3d4a5c',
          background: '#252b3b',
          overflow: 'hidden'
        }}>
          {[
            { id: 'foods', label: 'Foods Database', icon: Apple },
            { id: 'recipes', label: 'Recipe Builder', icon: ChefHat }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '20px 30px',
                  background: activeTab === tab.id ? '#00ff88' : 'transparent',
                  color: activeTab === tab.id ? '#000' : '#999',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontFamily: "'Courier New', monospace",
                  borderRight: '1px solid #3d4a5c'
                }}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              gap: '20px'
            }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                margin: 0,
                letterSpacing: '-1px',
                textTransform: 'uppercase',
                flexShrink: 0
              }}>
                Food Items
              </h2>
              <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '600px' }}>
                <input
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '15px 20px',
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    color: '#f0f0f0',
                    fontSize: '14px',
                    fontFamily: "'Courier New', monospace",
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                  onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                />
                <select
                  value={foodSortBy}
                  onChange={(e) => setFoodSortBy(e.target.value)}
                  style={{
                    padding: '15px',
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    color: '#f0f0f0',
                    fontSize: '12px',
                    fontFamily: "'Courier New', monospace",
                    outline: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}
                >
                  <option value="name">Sort: A-Z</option>
                  <option value="calories">Sort: Calories</option>
                </select>
              </div>
              <button
                onClick={() => setShowFoodForm(!showFoodForm)}
                style={{
                  padding: '15px 30px',
                  background: showFoodForm ? '#ff5252' : '#00ff88',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Courier New', monospace",
                  flexShrink: 0
                }}
              >
                {showFoodForm ? <X size={18} /> : <Plus size={18} />}
                {showFoodForm ? 'Cancel' : 'Add Food'}
              </button>
            </div>

            {showFoodForm && (
              <div style={{
                background: '#2a3346',
                border: '2px solid #00ff88',
                padding: '30px',
                marginBottom: '40px',
                animation: 'slideDown 0.3s ease'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  marginBottom: '25px',
                  color: '#00ff88',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {editingFood ? 'Edit Food Item' : 'New Food Item'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      color: '#00ff88',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 'bold'
                    }}>
                      Food Name
                    </label>
                    <input
                      placeholder="Food Name"
                      value={newFood.name}
                      onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '15px',
                        background: '#252b3b',
                        border: '2px solid #3d4a5c',
                        color: '#f0f0f0',
                        fontSize: '14px',
                        fontFamily: "'Courier New', monospace",
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                      onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      color: '#00ff88',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 'bold'
                    }}>
                      Serving Size
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        placeholder="100"
                        type="number"
                        value={newFood.serving_size}
                        onChange={(e) => setNewFood({ ...newFood, serving_size: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '15px',
                          background: '#252b3b',
                          border: '2px solid #3d4a5c',
                          color: '#f0f0f0',
                          fontSize: '14px',
                          fontFamily: "'Courier New', monospace",
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                        onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                      />
                      <select
                        value={newFood.serving_unit}
                        onChange={(e) => setNewFood({ ...newFood, serving_unit: e.target.value })}
                        style={{
                          padding: '15px',
                          background: '#252b3b',
                          border: '2px solid #3d4a5c',
                          color: '#f0f0f0',
                          fontSize: '14px',
                          fontFamily: "'Courier New', monospace",
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option>g</option>
                        <option>ml</option>
                        <option>oz</option>
                        <option>lb</option>
                        <option>cup</option>
                        <option>tbsp</option>
                        <option>tsp</option>
                        <option>item</option>
                        <option>slice</option>
                        <option>piece</option>
                      </select>
                    </div>
                  </div>
                  {['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium'].map(field => (
                    <div key={field}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        color: '#00ff88',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 'bold'
                      }}>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        placeholder="0"
                        type="number"
                        step="0.1"
                        value={newFood[field]}
                        onChange={(e) => setNewFood({ ...newFood, [field]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '15px',
                          background: '#252b3b',
                          border: '2px solid #3d4a5c',
                          color: '#f0f0f0',
                          fontSize: '14px',
                          fontFamily: "'Courier New', monospace",
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                        onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                  <button
                    onClick={editingFood ? saveEditedFood : addFood}
                    style={{
                      flex: 1,
                      padding: '15px 40px',
                      background: '#00ff88',
                      color: '#000',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontFamily: "'Courier New', monospace"
                    }}
                  >
                    {editingFood ? 'Update Food' : 'Save Food'}
                  </button>
                  {editingFood && (
                    <button
                      onClick={cancelEditFood}
                      style={{
                        flex: 1,
                        padding: '15px 40px',
                        background: '#3d4a5c',
                        color: '#f0f0f0',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontFamily: "'Courier New', monospace"
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {searchQuery.trim() === '' ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#666',
                fontSize: '18px'
              }}>
                <Apple size={56} style={{ marginBottom: '25px', opacity: 0.5 }} />
                <p style={{ fontSize: '24px', marginBottom: '10px', color: '#999' }}>
                  {foods.length} food{foods.length !== 1 ? 's' : ''} in database
                </p>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  Use the search bar above to find foods
                </p>
              </div>
            ) : filteredFoods.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#666',
                fontSize: '18px'
              }}>
                <Apple size={56} style={{ marginBottom: '25px', opacity: 0.5 }} />
                <p style={{ fontSize: '20px', marginBottom: '10px', color: '#999' }}>
                  No foods found matching "{searchQuery}"
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Try a different search term
                </p>
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Showing {sortedFoods.length} result{sortedFoods.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {sortedFoods.map(food => (
                    <div
                      key={food.id}
                      style={{
                        background: '#2a3346',
                        border: '2px solid #3d4a5c',
                        padding: '25px',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00ff88';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#3d4a5c';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            margin: '0 0 8px 0',
                            color: '#00ff88',
                            textTransform: 'uppercase'
                          }}>
                            {food.name}
                          </h3>
                          <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                            Per {food.serving_size}{food.serving_unit}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{
                            background: '#00ff88',
                            color: '#000',
                            padding: '8px 16px',
                            fontWeight: 'bold',
                            fontSize: '18px'
                          }}>
                            {food.calories} CAL
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startEditFood(food);
                            }}
                            type="button"
                            style={{
                              padding: '8px 12px',
                              background: '#ffaa00',
                              color: '#000',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              fontFamily: "'Courier New', monospace"
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteFood(food.id);
                            }}
                            type="button"
                            style={{
                              padding: '8px 12px',
                              background: '#ff5252',
                              color: '#000',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              fontFamily: "'Courier New', monospace"
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #3d4a5c'
                      }}>
                        {[
                          { label: 'Protein', value: food.protein, unit: 'g' },
                          { label: 'Carbs', value: food.carbohydrates, unit: 'g' },
                          { label: 'Fat', value: food.fat, unit: 'g' },
                          { label: 'Fiber', value: food.fiber, unit: 'g' },
                          { label: 'Sugar', value: food.sugar, unit: 'g' },
                          { label: 'Sodium', value: food.sodium, unit: 'mg' }
                        ].map(nutrient => (
                          <div key={nutrient.label}>
                            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {nutrient.label}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0f0f0', marginTop: '4px' }}>
                              {nutrient.value}{nutrient.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              gap: '20px'
            }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                margin: 0,
                letterSpacing: '-1px',
                textTransform: 'uppercase',
                flexShrink: 0
              }}>
                Recipes
              </h2>
              <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '600px' }}>
                <input
                  placeholder="Search recipes..."
                  value={recipeSearchQuery}
                  onChange={(e) => setRecipeSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '15px 20px',
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    color: '#f0f0f0',
                    fontSize: '14px',
                    fontFamily: "'Courier New', monospace",
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffaa00'}
                  onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                />
                <select
                  value={recipeSortBy}
                  onChange={(e) => setRecipeSortBy(e.target.value)}
                  style={{
                    padding: '15px',
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    color: '#f0f0f0',
                    fontSize: '12px',
                    fontFamily: "'Courier New', monospace",
                    outline: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}
                >
                  <option value="name">Sort: A-Z</option>
                  <option value="calories">Sort: Calories</option>
                </select>
              </div>
              <button
                onClick={() => {
                  if (showRecipeForm && editingRecipe) {
                    cancelEditRecipe();
                  } else {
                    setShowRecipeForm(!showRecipeForm);
                  }
                }}
                style={{
                  padding: '15px 30px',
                  background: showRecipeForm ? '#ff5252' : '#ffaa00',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Courier New', monospace",
                  flexShrink: 0
                }}
              >
                {showRecipeForm ? <X size={18} /> : <Plus size={18} />}
                {showRecipeForm ? 'Cancel' : 'New Recipe'}
              </button>
            </div>

            {showRecipeForm && (
              <div style={{
                background: '#2a3346',
                border: '2px solid #ffaa00',
                padding: '30px',
                marginBottom: '40px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  marginBottom: '25px',
                  color: '#ffaa00',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
                </h3>
                
                <input
                  placeholder="Recipe Name"
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    color: '#f0f0f0',
                    fontSize: '14px',
                    fontFamily: "'Courier New', monospace",
                    marginBottom: '15px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffaa00'}
                  onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                />

                <textarea
                  placeholder="Description (optional)"
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    color: '#f0f0f0',
                    fontSize: '14px',
                    fontFamily: "'Courier New', monospace",
                    marginBottom: '15px',
                    minHeight: '80px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffaa00'}
                  onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                />

                <input
                  placeholder="Total Servings"
                  type="number"
                  value={newRecipe.total_servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, total_servings: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    color: '#f0f0f0',
                    fontSize: '14px',
                    fontFamily: "'Courier New', monospace",
                    marginBottom: '25px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ffaa00'}
                  onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                />

                <h4 style={{
                  fontSize: '18px',
                  marginBottom: '15px',
                  color: '#ffaa00',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Add Ingredients
                </h4>

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        placeholder="Search for food..."
                        value={ingredientSearchQuery}
                        onChange={(e) => {
                          setIngredientSearchQuery(e.target.value);
                          setShowIngredientDropdown(true);
                          setSelectedFood(null);
                        }}
                        onFocus={() => setShowIngredientDropdown(true)}
                        style={{
                          width: '100%',
                          padding: '15px',
                          background: '#252b3b',
                          border: '2px solid #3d4a5c',
                          color: '#f0f0f0',
                          fontSize: '14px',
                          fontFamily: "'Courier New', monospace",
                          outline: 'none',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocusCapture={(e) => e.target.style.borderColor = '#ffaa00'}
                        onBlur={(e) => {
                          setTimeout(() => setShowIngredientDropdown(false), 200);
                          e.target.style.borderColor = '#3d4a5c';
                        }}
                      />
                      
                      {showIngredientDropdown && ingredientSearchQuery && filteredIngredientsForRecipe.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: '#252b3b',
                          border: '2px solid #ffaa00',
                          borderTop: 'none',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          zIndex: 1000
                        }}>
                          {filteredIngredientsForRecipe.map(food => (
                            <div
                              key={food.id}
                              onClick={() => {
                                setSelectedFood(food);
                                setIngredientSearchQuery(food.name);
                                setShowIngredientDropdown(false);
                              }}
                              style={{
                                padding: '15px',
                                borderBottom: '1px solid #3d4a5c',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#2a3346'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                marginBottom: '8px'
                              }}>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  color: '#ffaa00'
                                }}>
                                  {food.name}
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#00ff88',
                                  fontWeight: 'bold'
                                }}>
                                  {food.calories} cal
                                </div>
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#999',
                                marginBottom: '8px'
                              }}>
                                Per {food.serving_size}{food.serving_unit}
                              </div>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                fontSize: '11px',
                                color: '#666'
                              }}>
                                <span>P: {food.protein}g</span>
                                <span>C: {food.carbohydrates}g</span>
                                <span>F: {food.fat}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      placeholder="Quantity"
                      type="number"
                      step="0.1"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                      style={{
                        width: '150px',
                        padding: '15px',
                        background: '#252b3b',
                        border: '2px solid #3d4a5c',
                        color: '#f0f0f0',
                        fontSize: '14px',
                        fontFamily: "'Courier New', monospace",
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ffaa00'}
                      onBlur={(e) => e.target.style.borderColor = '#3d4a5c'}
                    />

                    <button
                      onClick={addIngredientToRecipe}
                      disabled={!selectedFood || !ingredientQuantity}
                      style={{
                        padding: '15px 25px',
                        background: (!selectedFood || !ingredientQuantity) ? '#3d4a5c' : '#ffaa00',
                        color: (!selectedFood || !ingredientQuantity) ? '#666' : '#000',
                        border: 'none',
                        cursor: (!selectedFood || !ingredientQuantity) ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fontFamily: "'Courier New', monospace"
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {selectedFood && (
                    <div style={{
                      marginTop: '10px',
                      padding: '12px',
                      background: '#2a3346',
                      border: '1px solid #ffaa00',
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      Selected: <strong style={{ color: '#ffaa00' }}>{selectedFood.name}</strong> 
                      {' '}({selectedFood.serving_size}{selectedFood.serving_unit} = {selectedFood.calories} cal)
                    </div>
                  )}
                </div>

                {newRecipe.ingredients.length > 0 && (
                  <div style={{
                    background: '#252b3b',
                    border: '2px solid #3d4a5c',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <h5 style={{
                      fontSize: '14px',
                      marginBottom: '15px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Ingredients ({newRecipe.ingredients.length})
                    </h5>
                    {newRecipe.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: index < newRecipe.ingredients.length - 1 ? '1px solid #3d4a5c' : 'none'
                        }}
                      >
                        <span style={{ color: '#f0f0f0' }}>
                          {ingredient.food.name} - {ingredient.quantity}{ingredient.unit}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeIngredient(index);
                          }}
                          type="button"
                          style={{
                            padding: '5px 10px',
                            background: '#ff5252',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            fontFamily: "'Courier New', monospace"
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={editingRecipe ? saveEditedRecipe : saveRecipe}
                  disabled={!newRecipe.name || newRecipe.ingredients.length === 0}
                  style={{
                    width: '100%',
                    padding: '15px 40px',
                    background: (!newRecipe.name || newRecipe.ingredients.length === 0) ? '#3d4a5c' : '#ffaa00',
                    color: (!newRecipe.name || newRecipe.ingredients.length === 0) ? '#666' : '#000',
                    border: 'none',
                    cursor: (!newRecipe.name || newRecipe.ingredients.length === 0) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: "'Courier New', monospace",
                    marginBottom: editingRecipe ? '10px' : '0'
                  }}
                >
                  {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
                </button>
                {editingRecipe && (
                  <button
                    onClick={cancelEditRecipe}
                    style={{
                      width: '100%',
                      padding: '15px 40px',
                      background: '#3d4a5c',
                      color: '#f0f0f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontFamily: "'Courier New', monospace"
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            )}

            {recipes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                fontSize: '18px'
              }}>
                <ChefHat size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <p>No recipes yet. Create your first recipe!</p>
              </div>
            ) : recipeSearchQuery.trim() === '' ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#666',
                fontSize: '18px'
              }}>
                <ChefHat size={56} style={{ marginBottom: '25px', opacity: 0.5 }} />
                <p style={{ fontSize: '24px', marginBottom: '10px', color: '#999' }}>
                  {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
                </p>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  Use the search bar above to find recipes
                </p>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#666',
                fontSize: '18px'
              }}>
                <ChefHat size={56} style={{ marginBottom: '25px', opacity: 0.5 }} />
                <p style={{ fontSize: '20px', marginBottom: '10px', color: '#999' }}>
                  No recipes found matching "{recipeSearchQuery}"
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Try a different search term
                </p>
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Showing {sortedRecipes.length} result{sortedRecipes.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display: 'grid', gap: '25px' }}>
                  {sortedRecipes.map(recipe => {
                    const nutrition = {
                      calories: recipe.calories || 0,
                      protein: recipe.protein || 0,
                      carbohydrates: recipe.carbohydrates || 0,
                      fat: recipe.fat || 0,
                      fiber: recipe.fiber || 0,
                      sugar: recipe.sugar || 0,
                      sodium: recipe.sodium || 0
                    };
                    
                    const perServing = Object.fromEntries(
                      Object.entries(nutrition).map(([key, value]) => 
                        [key, Math.round((value / recipe.total_servings) * 10) / 10]
                      )
                    );

                    return (
                      <div
                        key={recipe.id}
                        style={{
                          background: '#2a3346',
                          border: '2px solid #3d4a5c',
                          padding: '30px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#ffaa00';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#3d4a5c';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px' }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '28px',
                              fontWeight: 'bold',
                              margin: '0 0 10px 0',
                              color: '#ffaa00',
                              textTransform: 'uppercase'
                            }}>
                              {recipe.name}
                            </h3>
                            {recipe.description && (
                              <p style={{ margin: '0 0 10px 0', color: '#999', fontSize: '14px' }}>
                                {recipe.description}
                              </p>
                            )}
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                              Makes {recipe.total_servings} serving{recipe.total_servings > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                startEditRecipe(recipe);
                              }}
                              type="button"
                              style={{
                                padding: '10px 15px',
                                background: '#ffaa00',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                fontFamily: "'Courier New', monospace"
                              }}
                            >
                              <Edit2 size={14} />
                              EDIT
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteRecipe(recipe.id);
                              }}
                              type="button"
                              style={{
                                padding: '10px 15px',
                                background: '#ff5252',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                fontFamily: "'Courier New', monospace"
                              }}
                            >
                              <Trash2 size={14} />
                              DELETE
                            </button>
                          </div>
                        </div>

                        <div style={{
                          background: '#252b3b',
                          border: '2px solid #ffaa00',
                          padding: '20px',
                          marginBottom: '20px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                          }}>
                            <h4 style={{
                              fontSize: '14px',
                              margin: 0,
                              color: '#ffaa00',
                              textTransform: 'uppercase',
                              letterSpacing: '1px'
                            }}>
                              <Calculator size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                              Nutrition Per Serving
                            </h4>
                            <div style={{
                              background: '#ffaa00',
                              color: '#000',
                              padding: '6px 14px',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              {perServing.calories} CAL
                            </div>
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '15px'
                          }}>
                            {[
                              { label: 'Protein', value: perServing.protein, unit: 'g' },
                              { label: 'Carbs', value: perServing.carbohydrates, unit: 'g' },
                              { label: 'Fat', value: perServing.fat, unit: 'g' },
                              { label: 'Fiber', value: perServing.fiber, unit: 'g' },
                              { label: 'Sugar', value: perServing.sugar, unit: 'g' },
                              { label: 'Sodium', value: perServing.sodium, unit: 'mg' }
                            ].map(nutrient => (
                              <div key={nutrient.label}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                  {nutrient.label}
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0f0f0', marginTop: '4px' }}>
                                  {nutrient.value}{nutrient.unit}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            marginBottom: '12px',
                            color: '#999',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            Ingredients
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {recipe.ingredients.map((ingredient, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: '10px 15px',
                                  background: '#252b3b',
                                  border: '1px solid #3d4a5c',
                                  color: '#f0f0f0',
                                  fontSize: '14px'
                                }}
                              >
                                • {ingredient.quantity}{ingredient.unit} {ingredient.food.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
