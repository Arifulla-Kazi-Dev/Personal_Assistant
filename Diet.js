document.addEventListener("DOMContentLoaded", () => {
    const store = window.assistantStore;
    const form = document.getElementById("dietForm");
    const mealList = document.getElementById("mealList");
    const groceryItems = document.getElementById("groceryItems");
    const status = document.getElementById("dietStatus");

    const mealBank = {
        mixed: [
            { name: "Oats with fruit and nuts", calories: 360, items: ["Oats", "Banana", "Mixed nuts"] },
            { name: "Grilled chicken rice bowl", calories: 520, items: ["Chicken", "Rice", "Cucumber", "Yogurt"] },
            { name: "Egg wrap with salad", calories: 410, items: ["Eggs", "Whole wheat wrap", "Lettuce"] },
            { name: "Fish with vegetables", calories: 480, items: ["Fish", "Broccoli", "Sweet potato"] },
            { name: "Curd, fruit, and seed bowl", calories: 300, items: ["Curd", "Apple", "Chia seeds"] }
        ],
        vegetarian: [
            { name: "Paneer vegetable bowl", calories: 500, items: ["Paneer", "Capsicum", "Rice", "Spinach"] },
            { name: "Dal, roti, and salad", calories: 460, items: ["Dal", "Roti", "Tomato", "Cucumber"] },
            { name: "Sprouts chaat", calories: 280, items: ["Sprouts", "Onion", "Lemon", "Coriander"] },
            { name: "Greek yogurt parfait", calories: 330, items: ["Yogurt", "Berries", "Granola"] },
            { name: "Vegetable khichdi", calories: 420, items: ["Rice", "Moong dal", "Carrot", "Beans"] }
        ],
        "high-fiber": [
            { name: "Quinoa chickpea bowl", calories: 470, items: ["Quinoa", "Chickpeas", "Cucumber", "Greens"] },
            { name: "Lentil soup with toast", calories: 390, items: ["Lentils", "Whole grain bread", "Carrot"] },
            { name: "Fruit and seed smoothie", calories: 320, items: ["Milk", "Fruit", "Flax seeds"] },
            { name: "Bean salad wrap", calories: 430, items: ["Beans", "Wrap", "Lettuce", "Corn"] },
            { name: "Millet bowl with vegetables", calories: 450, items: ["Millet", "Mixed vegetables", "Curd"] }
        ]
    };

    function showStatus(message) {
        if (!status) return;
        status.textContent = message;
        window.clearTimeout(showStatus.timer);
        showStatus.timer = window.setTimeout(() => {
            status.textContent = "";
        }, 2400);
    }

    function getSettingsFromForm() {
        return {
            calories: Number(document.getElementById("calories").value),
            meals: Number(document.getElementById("meals").value),
            goal: document.getElementById("dietGoal").value,
            protein: Number(document.getElementById("proteinTarget").value) || "",
            water: document.getElementById("waterTarget").value.trim(),
            preference: document.getElementById("dietPreference").value
        };
    }

    function saveSettings(settings) {
        store.write("dietSettings", settings);
    }

    function loadSettings() {
        const settings = store.read("dietSettings", null);
        if (!settings) {
            mealList.innerHTML = '<p class="empty-state">Enter your plan settings to generate meal ideas.</p>';
            groceryItems.innerHTML = '<p class="empty-state">Your grocery list will appear after generating a plan.</p>';
            updateMetrics({});
            return;
        }

        document.getElementById("calories").value = settings.calories || "";
        document.getElementById("meals").value = settings.meals || "";
        document.getElementById("dietGoal").value = settings.goal || "balanced";
        document.getElementById("proteinTarget").value = settings.protein || "";
        document.getElementById("waterTarget").value = settings.water || "";
        document.getElementById("dietPreference").value = settings.preference || "mixed";

        renderPlan(settings);
    }

    function pickMeal(options, index, mealCalories) {
        const sorted = [...options].sort((a, b) => Math.abs(a.calories - mealCalories) - Math.abs(b.calories - mealCalories));
        return sorted[index % sorted.length];
    }

    function renderPlan(settings) {
        const meals = Math.max(2, Math.min(settings.meals || 3, 6));
        const mealCalories = Math.round((settings.calories || 0) / meals);
        const options = mealBank[settings.preference] || mealBank.mixed;
        const groceries = new Set();
        const proteinText = settings.protein ? `${settings.protein}g protein target` : "Protein target not set";

        mealList.innerHTML = "";

        for (let index = 0; index < meals; index += 1) {
            const meal = pickMeal(options, index, mealCalories);
            meal.items.forEach((item) => groceries.add(item));

            const article = document.createElement("article");
            article.className = "meal-item";
            article.innerHTML = `
                <span class="tag">Meal ${index + 1}</span>
                <h3>${window.escapeHTML(meal.name)}</h3>
                <p class="muted">Target ${mealCalories} kcal. Suggested idea: ${meal.calories} kcal.</p>
            `;
            mealList.appendChild(article);
        }

        groceryItems.innerHTML = `
            <div class="stats-strip">
                <div class="mini-stat"><strong>${settings.calories || "--"}</strong><span>Daily calories</span></div>
                <div class="mini-stat"><strong>${settings.water || "--"}</strong><span>Hydration</span></div>
                <div class="mini-stat"><strong>${proteinText}</strong><span>Protein</span></div>
            </div>
            <ul class="grocery-list">
                ${Array.from(groceries).sort().map((item) => `<li>${window.escapeHTML(item)}</li>`).join("")}
            </ul>
        `;

        updateMetrics(settings);
    }

    function updateMetrics(settings) {
        document.getElementById("dietCaloriesMetric").textContent = settings.calories || "--";
        document.getElementById("dietMealsMetric").textContent = settings.meals || "--";
        document.getElementById("dietWaterMetric").textContent = settings.water || "--";
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const settings = getSettingsFromForm();

        if (!settings.calories || !settings.meals) {
            showStatus("Calories and meals are required.");
            return;
        }

        saveSettings(settings);
        renderPlan(settings);
        showStatus("Diet plan generated and saved.");
    });

    loadSettings();
});
