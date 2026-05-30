document.addEventListener("DOMContentLoaded", () => {
    const store = window.assistantStore;
    const todayKey = new Date().toISOString().slice(0, 10);

    const defaultRoutine = [
        { time: "06:30", task: "Morning reset and hydration", category: "Wellness" },
        { time: "08:30", task: "Top-priority work block", category: "Focus" },
        { time: "13:00", task: "Balanced lunch and short walk", category: "Diet" },
        { time: "18:30", task: "Workout or mobility session", category: "Fitness" },
        { time: "21:30", task: "Review tasks and plan tomorrow", category: "Review" }
    ];

    const checklistItems = [
        "Review the day plan",
        "Drink water",
        "Move for 20 minutes",
        "Clear one important task"
    ];

    const getTasks = () => store.read("tasks", []);
    const getExercises = () => store.read("exercises", []);
    const getRoutine = () => {
        const routine = store.read("timetableData", []);
        return routine.length ? routine : defaultRoutine;
    };
    const getReminders = () => store.read("assistantReminders", []);
    const setReminders = (items) => store.write("assistantReminders", items);
    const getNotes = () => store.read("assistantNotes", []);
    const setNotes = (items) => store.write("assistantNotes", items);

    function sortByTime(items) {
        return [...items].sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));
    }

    function sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return String(a.dueDate || "9999-12-31").localeCompare(String(b.dueDate || "9999-12-31"));
        });
    }

    function renderRoutine() {
        const list = document.getElementById("dashboardRoutineList");
        if (!list) return;

        const allRoutine = sortByTime(getRoutine());
        const routine = allRoutine.slice(0, 6);
        list.innerHTML = routine.map((item) => `
            <li class="routine-item">
                <span class="time-pill">${window.escapeHTML(item.time || "Anytime")}</span>
                <div>
                    <strong>${window.escapeHTML(item.task || item.title || "Routine block")}</strong>
                    <div class="item-meta">
                        <span>${window.escapeHTML(item.day || "Today")}</span>
                        <span>${window.escapeHTML(item.category || "Personal")}</span>
                    </div>
                </div>
            </li>
        `).join("");

        const metric = document.getElementById("metricRoutineItems");
        if (metric) metric.textContent = String(allRoutine.length);
    }

    function renderTasks() {
        const list = document.getElementById("dashboardTaskList");
        if (!list) return;

        const tasks = sortTasks(getTasks()).slice(0, 5);
        const pending = getTasks().filter((task) => !task.completed).length;
        const metric = document.getElementById("metricPendingTasks");
        if (metric) metric.textContent = String(pending);

        if (!tasks.length) {
            list.innerHTML = '<li class="empty-state">No tasks yet. Add your first task to start shaping the day.</li>';
            return;
        }

        list.innerHTML = tasks.map((task) => `
            <li class="task-item ${task.completed ? "completed" : ""}">
                <div class="task-main">
                    <span class="task-title">${window.escapeHTML(task.name || "Untitled task")}</span>
                    <span class="task-meta">
                        <span class="priority-pill priority-${window.escapeHTML(task.priority || "medium")}">${window.escapeHTML(task.priority || "medium")}</span>
                        <span>${window.formatDate(task.dueDate)}</span>
                    </span>
                </div>
                <span class="status-pill">${task.completed ? "Done" : "Open"}</span>
            </li>
        `).join("");
    }

    function renderWellness() {
        const stats = document.getElementById("wellnessStats");
        if (!stats) return;

        const exercises = getExercises();
        const totalMinutes = exercises.reduce((sum, item) => sum + Number(item.duration || 0), 0);
        const totalCalories = exercises.reduce((sum, item) => sum + Number(item.calories || 0), 0);
        const diet = store.read("dietSettings", {});
        const bmi = localStorage.getItem("bmi") || "--";

        const metric = document.getElementById("metricFitnessMinutes");
        if (metric) metric.textContent = String(totalMinutes);

        stats.innerHTML = `
            <div class="mini-stat"><strong>${diet.calories || "--"}</strong><span>Daily calories</span></div>
            <div class="mini-stat"><strong>${diet.water || "--"}</strong><span>Water target</span></div>
            <div class="mini-stat"><strong>${totalCalories}</strong><span>Calories burned</span></div>
            <div class="mini-stat"><strong>${bmi}</strong><span>Saved BMI</span></div>
        `;
    }

    function renderChecklist() {
        const wrapper = document.getElementById("dailyChecklist");
        if (!wrapper) return;

        const checked = store.read(`assistantChecklist:${todayKey}`, {});
        wrapper.innerHTML = "";

        checklistItems.forEach((item, index) => {
            const id = `check-${index}`;
            const label = document.createElement("label");
            label.className = "list-item";
            label.setAttribute("for", id);
            label.innerHTML = `
                <span class="item-meta">
                    <input id="${id}" type="checkbox" ${checked[item] ? "checked" : ""}>
                    <strong>${window.escapeHTML(item)}</strong>
                </span>
            `;
            label.querySelector("input").addEventListener("change", (event) => {
                checked[item] = event.target.checked;
                store.write(`assistantChecklist:${todayKey}`, checked);
            });
            wrapper.appendChild(label);
        });
    }

    function renderReminders() {
        const list = document.getElementById("reminderList");
        const metric = document.getElementById("metricReminders");
        if (!list) return;

        const reminders = sortByTime(getReminders());
        const openCount = reminders.filter((item) => !item.done).length;
        if (metric) metric.textContent = String(openCount);

        if (!reminders.length) {
            list.innerHTML = '<li class="empty-state">No reminders yet. Add one for anything time-sensitive.</li>';
            return;
        }

        list.innerHTML = reminders.map((item) => `
            <li class="list-item ${item.done ? "completed" : ""}">
                <div class="task-main">
                    <strong class="task-title">${window.escapeHTML(item.title)}</strong>
                    <span class="task-meta">${window.escapeHTML(item.time || "Anytime")}</span>
                </div>
                <div class="item-actions">
                    <button class="icon-button" type="button" data-reminder-toggle="${item.id}" aria-label="Toggle reminder">${window.assistantIcon("check")}</button>
                    <button class="icon-button" type="button" data-reminder-delete="${item.id}" aria-label="Delete reminder">${window.assistantIcon("trash")}</button>
                </div>
            </li>
        `).join("");
    }

    function renderNotes() {
        const list = document.getElementById("noteList");
        if (!list) return;

        const notes = getNotes();
        if (!notes.length) {
            list.innerHTML = '<li class="empty-state">No notes yet. Keep quick context here while planning.</li>';
            return;
        }

        list.innerHTML = notes.slice(0, 5).map((note) => `
            <li class="note-item">
                <p>${window.escapeHTML(note.text)}</p>
                <div class="item-meta">
                    <span>${new Date(note.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <button class="icon-button" type="button" data-note-delete="${note.id}" aria-label="Delete note">${window.assistantIcon("trash")}</button>
                </div>
            </li>
        `).join("");
    }

    function initFocus() {
        const form = document.getElementById("focusForm");
        const input = document.getElementById("dailyFocus");
        const status = document.getElementById("focusStatus");
        if (!form || !input) return;

        input.value = localStorage.getItem("dailyFocus") || "";
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            localStorage.setItem("dailyFocus", input.value.trim());
            if (status) status.textContent = "Focus saved for today.";
        });
    }

    function initReminderForm() {
        const form = document.getElementById("reminderForm");
        if (!form) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const title = document.getElementById("reminderTitle").value.trim();
            const time = document.getElementById("reminderTime").value;
            if (!title) return;

            setReminders([{ id: Date.now(), title, time, done: false }, ...getReminders()]);
            form.reset();
            renderReminders();
        });

        document.getElementById("reminderList").addEventListener("click", (event) => {
            const toggle = event.target.closest("[data-reminder-toggle]");
            const remove = event.target.closest("[data-reminder-delete]");
            if (!toggle && !remove) return;

            const id = Number((toggle || remove).dataset.reminderToggle || (toggle || remove).dataset.reminderDelete);
            const next = getReminders()
                .map((item) => toggle && item.id === id ? { ...item, done: !item.done } : item)
                .filter((item) => !(remove && item.id === id));

            setReminders(next);
            renderReminders();
        });
    }

    function initNoteForm() {
        const form = document.getElementById("noteForm");
        if (!form) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const textArea = document.getElementById("noteText");
            const text = textArea.value.trim();
            if (!text) return;

            setNotes([{ id: Date.now(), text, createdAt: new Date().toISOString() }, ...getNotes()]);
            textArea.value = "";
            renderNotes();
        });

        document.getElementById("noteList").addEventListener("click", (event) => {
            const remove = event.target.closest("[data-note-delete]");
            if (!remove) return;

            const id = Number(remove.dataset.noteDelete);
            setNotes(getNotes().filter((note) => note.id !== id));
            renderNotes();
        });
    }

    initFocus();
    initReminderForm();
    initNoteForm();
    renderRoutine();
    renderTasks();
    renderWellness();
    renderChecklist();
    renderReminders();
    renderNotes();
});
