let ingredients = [];
let currentRecipes = [];
let favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

const API_KEY = "dafddec1456040cbad2d05d9397ebeaf";
const BASE_URL = "https://api.spoonacular.com/recipes";

document.addEventListener("DOMContentLoaded", function () {
  updateIngredientsDisplay();
  updateSearchButton();
});

function addIngredient(event) {
  event.preventDefault();
  const input = document.getElementById("ingredientInput");
  const ingredient = input.value.trim().toLowerCase();

  if (ingredient && !ingredients.includes(ingredient)) {
    ingredients.push(ingredient);
    input.value = "";
    updateIngredientsDisplay();
    updateSearchButton();
  }
}

function updateIngredientsDisplay() {
  const container = document.getElementById("ingredientsDisplay");
  container.innerHTML = "";

  ingredients.forEach((ingredient) => {
    const tag = document.createElement("div");
    tag.className = "ingredient-tag";
    tag.innerHTML = `
                    ${ingredient}
                    <button class="remove-ingredient" onclick="removeIngredient('${ingredient}')">×</button>
                `;
    container.appendChild(tag);
  });
}

function removeIngredient(ingredient) {
  ingredients = ingredients.filter((item) => item !== ingredient);
  updateIngredientsDisplay();
  updateSearchButton();
}

function updateSearchButton() {
  const button = document.getElementById("searchRecipesBtn");
  button.disabled = ingredients.length === 0;
}

async function searchRecipes() {
  if (ingredients.length === 0) return;

  const container = document.getElementById("recipesContainer");
  container.innerHTML =
    '<div class="loading"><div class="spinner"></div><p>Finding delicious recipes...</p></div>';

  try {
    const ingredientsString = ingredients.join(",");
    const filters = getFilters();

    let url = `${BASE_URL}/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredientsString}&number=12&ranking=1&ignorePantry=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }

    const recipes = await response.json();

    if (recipes.length === 0) {
      container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-sad-tear"></i>
                            <h3>No recipes found</h3>
                            <p>Try different ingredients or remove some filters.</p>
                        </div>
                    `;
      return;
    }

    const detailedRecipes = await getDetailedRecipes(recipes);
    currentRecipes = detailedRecipes;
    displayRecipes(detailedRecipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    container.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Oops! Something went wrong</h3>
                        <p>Please check your internet connection and try again.</p>
                        <p><small>Note: Make sure you have a valid Spoonacular API key.</small></p>
                    </div>
                `;
  }
}

async function getDetailedRecipes(recipes) {
  const detailedRecipes = [];

  for (const recipe of recipes.slice(0, 8)) {
    try {
      const response = await fetch(
        `${BASE_URL}/${recipe.id}/information?apiKey=${API_KEY}`
      );
      if (response.ok) {
        const detailedRecipe = await response.json();
        detailedRecipes.push({
          ...recipe,
          ...detailedRecipe,
        });
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      detailedRecipes.push(recipe);
    }
  }

  return detailedRecipes;
}

function displayRecipes(recipes) {
  const container = document.getElementById("recipesContainer");
  const resultsCount = document.getElementById("resultsCount");

  resultsCount.textContent = `${recipes.length} recipes found`;

  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "recipe-grid";

  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function createRecipeCard(recipe) {
  const isFavorite = favorites.some((fav) => fav.id === recipe.id);

  const card = document.createElement("div");
  card.className = "recipe-card";
  card.innerHTML = `
                <img src="${recipe.image || "/api/placeholder/300/200"}" alt="${
    recipe.title
  }" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${
                          recipe.readyInMinutes || "N/A"
                        } min</span>
                        <span><i class="fas fa-users"></i> ${
                          recipe.servings || "N/A"
                        } servings</span>
                    </div>
                    <div class="recipe-actions">
                        <button class="action-btn save-btn ${
                          isFavorite ? "saved" : ""
                        }" onclick="toggleFavorite(${recipe.id})">
                            <i class="fas fa-heart"></i>
                            ${isFavorite ? "Saved" : "Save"}
                        </button>
                        <button class="action-btn share-btn" onclick="shareRecipe(${
                          recipe.id
                        })">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                    </div>
                </div>
            `;

  card.addEventListener("click", (e) => {
    if (!e.target.closest(".recipe-actions")) {
      showRecipeDetail(recipe);
    }
  });

  return card;
}

function showRecipeDetail(recipe) {
  const modal = document.getElementById("recipeModal");
  const content = document.getElementById("recipeDetailContent");

  const isFavorite = favorites.some((fav) => fav.id === recipe.id);

  content.innerHTML = `
                <img src="${recipe.image || "/api/placeholder/800/300"}" alt="${
    recipe.title
  }" class="recipe-detail-image">
                <h1 class="recipe-detail-title">${recipe.title}</h1>
                
                <div class="recipe-detail-meta">
                    <div class="meta-item">
                        <div class="meta-value">${
                          recipe.readyInMinutes || "N/A"
                        }</div>
                        <div class="meta-label">Minutes</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${
                          recipe.servings || "N/A"
                        }</div>
                        <div class="meta-label">Servings</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${
                          recipe.healthScore || "N/A"
                        }</div>
                        <div class="meta-label">Health Score</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">$${
                          recipe.pricePerServing
                            ? (recipe.pricePerServing / 100).toFixed(2)
                            : "N/A"
                        }</div>
                        <div class="meta-label">Per Serving</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                    <button class="btn ${
                      isFavorite ? "btn-primary" : "btn-secondary"
                    }" onclick="toggleFavorite(${recipe.id})">
                        <i class="fas fa-heart"></i>
                        ${
                          isFavorite
                            ? "Remove from Favorites"
                            : "Add to Favorites"
                        }
                    </button>
                    <button class="btn btn-secondary" onclick="shareRecipe(${
                      recipe.id
                    })">
                        <i class="fas fa-share"></i>
                        Share Recipe
                    </button>
                </div>
                
                ${
                  recipe.summary
                    ? `
                    <div class="recipe-section">
                        <h3>Summary</h3>
                        <div>${recipe.summary}</div>
                    </div>
                `
                    : ""
                }
                
                ${
                  recipe.extendedIngredients
                    ? `
                    <div class="recipe-section">
                        <h3>Ingredients</h3>
                        <ul class="ingredients-list">
                            ${recipe.extendedIngredients
                              .map(
                                (ingredient) =>
                                  `<li><i class="fas fa-check"></i> ${ingredient.original}</li>`
                              )
                              .join("")}
                        </ul>
                    </div>
                `
                    : ""
                }
                
                ${
                  recipe.analyzedInstructions && recipe.analyzedInstructions[0]
                    ? `
                    <div class="recipe-section">
                        <h3>Instructions</h3>
                        <ol class="instructions-list">
                            ${recipe.analyzedInstructions[0].steps
                              .map((step) => `<li>${step.step}</li>`)
                              .join("")}
                        </ol>
                    </div>
                `
                    : ""
                }
            `;

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("recipeModal").style.display = "none";
}

function toggleFavorite(recipeId) {
  const recipe = currentRecipes.find((r) => r.id === recipeId);
  if (!recipe) return;

  const existingIndex = favorites.findIndex((fav) => fav.id === recipeId);

  if (existingIndex > -1) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.push({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
    });
  }

  localStorage.setItem("favoriteRecipes", JSON.stringify(favorites));

  const saveButtons = document.querySelectorAll(".save-btn");
  saveButtons.forEach((btn) => {
    if (btn.onclick.toString().includes(recipeId)) {
      const isFavorite = favorites.some((fav) => fav.id === recipeId);
      btn.className = `action-btn save-btn ${isFavorite ? "saved" : ""}`;
      btn.innerHTML = `<i class="fas fa-heart"></i> ${
        isFavorite ? "Saved" : "Save"
      }`;
    }
  });

  const modal = document.getElementById("recipeModal");
  if (modal.style.display === "block") {
    showRecipeDetail(recipe);
  }
}

function shareRecipe(recipeId) {
  const recipe = currentRecipes.find((r) => r.id === recipeId);
  if (!recipe) return;

  const shareData = {
    title: recipe.title,
    text: `Check out this delicious recipe: ${recipe.title}`,
    url: `https://spoonacular.com/recipes/${recipe.title
      .replace(/\s+/g, "-")
      .toLowerCase()}-${recipe.id}`,
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    const url = shareData.url;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Recipe link copied to clipboard!");
      })
      .catch(() => {
        alert(`Share this recipe: ${url}`);
      });
  }
}

function showFavorites() {
  if (favorites.length === 0) {
    const container = document.getElementById("recipesContainer");
    container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>No favorite recipes yet</h3>
                        <p>Start saving recipes you love to see them here!</p>
                    </div>
                `;
    document.getElementById("resultsCount").textContent = "";
    return;
  }

  currentRecipes = favorites;
  displayRecipes(favorites);
}

async function generateRandomRecipe() {
  const container = document.getElementById("recipesContainer");
  container.innerHTML =
    '<div class="loading"><div class="spinner"></div><p>Finding a random recipe for you...</p></div>';

  try {
    const ingredientsString =
      ingredients.length > 0 ? ingredients.join(",") : "";
    let url = `${BASE_URL}/random?apiKey=${API_KEY}&number=1`;

    if (ingredientsString) {
      url += `&include-ingredients=${ingredientsString}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch random recipe");
    }

    const data = await response.json();
    const recipes = data.recipes;

    if (recipes && recipes.length > 0) {
      currentRecipes = recipes;
      displayRecipes(recipes);
    } else {
      container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-sad-tear"></i>
                            <h3>No random recipe found</h3>
                            <p>Please try again later.</p>
                        </div>
                    `;
    }
  } catch (error) {
    console.error("Error fetching random recipe:", error);
    container.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Oops! Something went wrong</h3>
                        <p>Please check your internet connection and try again.</p>
                    </div>
                `;
  }
}

function getFilters() {
  return {
    mealType: document.getElementById("mealType").value,
    diet: document.getElementById("diet").value,
    intolerances: Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((cb) => cb.value),
  };
}

function applyFilters() {
  if (currentRecipes.length > 0) {
    searchRecipes();
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("recipeModal");
  if (event.target === modal) {
    closeModal();
  }
};

document
  .getElementById("ingredientInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addIngredient(e);
    }
  });
