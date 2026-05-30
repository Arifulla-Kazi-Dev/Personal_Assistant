document.addEventListener("DOMContentLoaded", () => {
    const store = window.assistantStore;
    const exerciseForm = document.getElementById("exercise-form");
    const exerciseLog = document.getElementById("exercise-log");
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");
    const status = document.getElementById("exerciseStatus");
    const goalInput = document.getElementById("weekly-goal");

    let exercises = store.read("exercises", []).map((exercise) => ({
        id: exercise.id || Date.now() + Math.random(),
        name: exercise.name || "Exercise",
        type: exercise.type || "Cardio",
        duration: Number(exercise.duration || 0),
        calories: Number(exercise.calories || 0),
        createdAt: exercise.createdAt || new Date().toISOString()
    }));

    let editingId = null;

    function saveExercises() {
        store.write("exercises", exercises);
    }

    function getGoalMinutes() {
        return Number(goalInput.value || localStorage.getItem("weeklyExerciseGoal") || 300);
    }

    function showStatus(message) {
        if (!status) return;
        status.textContent = message;
        window.clearTimeout(showStatus.timer);
        showStatus.timer = window.setTimeout(() => {
            status.textContent = "";
        }, 2200);
    }

    function updateProgress() {
        const totalMinutes = exercises.reduce((sum, exercise) => sum + Number(exercise.duration || 0), 0);
        const totalCalories = exercises.reduce((sum, exercise) => sum + Number(exercise.calories || 0), 0);
        const goal = getGoalMinutes();
        const percentage = Math.min((totalMinutes / goal) * 100, 100);

        progressFill.style.width = `${percentage || 0}%`;
        progressText.textContent = `${totalMinutes}/${goal} minutes completed`;

        document.getElementById("fitnessMinutesMetric").textContent = String(totalMinutes);
        document.getElementById("fitnessCaloriesMetric").textContent = String(totalCalories);
        document.getElementById("fitnessSessionsMetric").textContent = String(exercises.length);
    }

    function renderExercises() {
        exerciseLog.innerHTML = "";

        if (!exercises.length) {
            exerciseLog.innerHTML = '<li class="empty-state">No exercise logged yet. Add your first session to start tracking progress.</li>';
            updateProgress();
            return;
        }

        exercises
            .slice()
            .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
            .forEach((exercise) => {
                const li = document.createElement("li");
                li.className = "exercise-item";
                li.innerHTML = `
                    <div class="task-main">
                        <strong class="task-title">${window.escapeHTML(exercise.name)}</strong>
                        <span class="task-meta">
                            <span class="tag">${window.escapeHTML(exercise.type)}</span>
                            <span>${exercise.duration} mins</span>
                            <span>${exercise.calories} kcal</span>
                        </span>
                    </div>
                    <div class="item-actions">
                        <button class="icon-button" type="button" data-action="edit" data-id="${exercise.id}" aria-label="Edit exercise">${window.assistantIcon("edit")}</button>
                        <button class="icon-button" type="button" data-action="delete" data-id="${exercise.id}" aria-label="Delete exercise">${window.assistantIcon("trash")}</button>
                    </div>
                `;
                exerciseLog.appendChild(li);
            });

        updateProgress();
    }

    function resetForm() {
        exerciseForm.reset();
        document.getElementById("exercise-type").value = "Cardio";
        goalInput.value = localStorage.getItem("weeklyExerciseGoal") || 300;
        editingId = null;
        exerciseForm.querySelector("button[type='submit']").innerHTML = `${window.assistantIcon("plus")}Add Exercise`;
    }

    exerciseForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const exercise = {
            id: editingId || Date.now(),
            name: document.getElementById("exercise-name").value.trim(),
            type: document.getElementById("exercise-type").value,
            duration: Number(document.getElementById("exercise-duration").value),
            calories: Number(document.getElementById("calories-burned").value),
            createdAt: editingId
                ? exercises.find((item) => item.id === editingId)?.createdAt || new Date().toISOString()
                : new Date().toISOString()
        };

        if (!exercise.name || !exercise.duration || !exercise.calories) {
            showStatus("Exercise name, duration, and calories are required.");
            return;
        }

        localStorage.setItem("weeklyExerciseGoal", String(getGoalMinutes()));

        if (editingId) {
            exercises = exercises.map((item) => item.id === editingId ? exercise : item);
            showStatus("Exercise updated.");
        } else {
            exercises.unshift(exercise);
            showStatus("Exercise added.");
        }

        saveExercises();
        resetForm();
        renderExercises();
    });

    exerciseLog.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "delete") {
            exercises = exercises.filter((exercise) => exercise.id !== id);
            saveExercises();
            showStatus("Exercise deleted.");
            renderExercises();
            return;
        }

        const exercise = exercises.find((item) => item.id === id);
        if (!exercise) return;

        editingId = id;
        document.getElementById("exercise-name").value = exercise.name;
        document.getElementById("exercise-type").value = exercise.type;
        document.getElementById("exercise-duration").value = exercise.duration;
        document.getElementById("calories-burned").value = exercise.calories;
        exerciseForm.querySelector("button[type='submit']").innerHTML = `${window.assistantIcon("save")}Update Exercise`;
        showStatus("Loaded exercise for editing.");
    });

    goalInput.value = localStorage.getItem("weeklyExerciseGoal") || 300;
    goalInput.addEventListener("change", () => {
        localStorage.setItem("weeklyExerciseGoal", String(getGoalMinutes()));
        updateProgress();
    });

    saveExercises();
    renderExercises();
});
