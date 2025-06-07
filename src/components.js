export const header = `<header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-utensils"></i>
                    Recipe Finder
                </div>
                <div class="nav-buttons">
                    <button class="btn btn-secondary" onclick="showFavorites()">
                        <i class="fas fa-heart"></i>
                        Favorites
                    </button>
                    <button class="btn btn-primary" onclick="generateRandomRecipe()">
                        <i class="fas fa-random"></i>
                        Random Recipe
                    </button>
                </div>
            </div>
        </div>
    </header>`;

const filterSidebar = `<aside>
<h3>
Filters
</h3>
<div class="filter-group"></div>
<div class="filter-group"></div>
<div class="filter-group"></div>
</aside>`;
