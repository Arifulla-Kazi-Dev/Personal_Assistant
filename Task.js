document.addEventListener("DOMContentLoaded", () => {
    const store = window.assistantStore;
    const form = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const searchInput = document.getElementById("searchTask");
    const filterSelect = document.getElementById("filterPriority");
    const sortSelect = document.getElementById("sortTasks");
    const status = document.getElementById("taskStatus");

    let tasks = store.read("tasks", []).map((task) => ({
        id: task.id || Date.now() + Math.random(),
        name: task.name || "Untitled task",
        description: task.description || "",
        priority: task.priority || "medium",
        dueDate: task.dueDate || "",
        completed: Boolean(task.completed),
        createdAt: task.createdAt || new Date().toISOString()
    }));

    function saveTasks() {
        store.write("tasks", tasks);
    }

    function showStatus(message) {
        if (!status) return;
        status.textContent = message;
        window.clearTimeout(showStatus.timer);
        showStatus.timer = window.setTimeout(() => {
            status.textContent = "";
        }, 2200);
    }

    function getFilteredTasks() {
        const query = (searchInput.value || "").trim().toLowerCase();
        const filter = filterSelect.value;
        const sort = sortSelect.value;

        const priorityWeight = { high: 0, medium: 1, low: 2 };

        return tasks
            .filter((task) => {
                const matchesQuery = [task.name, task.description, task.priority, task.dueDate]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);

                const matchesFilter =
                    filter === "all" ||
                    task.priority === filter ||
                    (filter === "completed" && task.completed) ||
                    (filter === "pending" && !task.completed);

                return matchesQuery && matchesFilter;
            })
            .sort((a, b) => {
                if (sort === "priority") return priorityWeight[a.priority] - priorityWeight[b.priority];
                if (sort === "created") return String(b.createdAt).localeCompare(String(a.createdAt));
                return String(a.dueDate || "9999-12-31").localeCompare(String(b.dueDate || "9999-12-31"));
            });
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;
        const pending = total - completed;

        document.getElementById("totalTasks").textContent = String(total);
        document.getElementById("completedTasks").textContent = String(completed);
        document.getElementById("pendingTasks").textContent = String(pending);
    }

    function renderTaskList() {
        const visibleTasks = getFilteredTasks();
        taskList.innerHTML = "";

        if (!visibleTasks.length) {
            taskList.innerHTML = '<li class="empty-state">No tasks match this view. Add a task or adjust your filters.</li>';
            updateStats();
            return;
        }

        visibleTasks.forEach((task) => {
            const item = document.createElement("li");
            item.className = `task-item ${task.completed ? "completed" : ""}`;
            item.innerHTML = `
                <div class="task-main">
                    <span class="task-title">${window.escapeHTML(task.name)}</span>
                    <span class="task-meta">
                        <span class="priority-pill priority-${window.escapeHTML(task.priority)}">${window.escapeHTML(task.priority)}</span>
                        <span>${window.formatDate(task.dueDate)}</span>
                    </span>
                    ${task.description ? `<span class="muted">${window.escapeHTML(task.description)}</span>` : ""}
                </div>
                <div class="item-actions">
                    <button class="icon-button" type="button" data-action="toggle" data-id="${task.id}" aria-label="${task.completed ? "Mark task pending" : "Mark task complete"}">${window.assistantIcon("check")}</button>
                    <button class="icon-button" type="button" data-action="delete" data-id="${task.id}" aria-label="Delete task">${window.assistantIcon("trash")}</button>
                </div>
            `;
            taskList.appendChild(item);
        });

        updateStats();
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("taskName").value.trim();
        const description = document.getElementById("taskDescription").value.trim();
        const priority = document.getElementById("taskPriority").value;
        const dueDate = document.getElementById("taskDueDate").value;

        if (!name || !dueDate) {
            showStatus("Task name and due date are required.");
            return;
        }

        tasks.unshift({
            id: Date.now(),
            name,
            description,
            priority,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        });

        saveTasks();
        form.reset();
        document.getElementById("taskPriority").value = "medium";
        showStatus("Task added.");
        renderTaskList();
    });

    taskList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "toggle") {
            tasks = tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
            showStatus("Task updated.");
        }

        if (action === "delete") {
            tasks = tasks.filter((task) => task.id !== id);
            showStatus("Task deleted.");
        }

        saveTasks();
        renderTaskList();
    });

    [searchInput, filterSelect, sortSelect].forEach((element) => {
        element.addEventListener("input", renderTaskList);
        element.addEventListener("change", renderTaskList);
    });

    saveTasks();
    renderTaskList();
});
