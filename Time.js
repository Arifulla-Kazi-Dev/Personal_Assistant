document.addEventListener("DOMContentLoaded", () => {
    const store = window.assistantStore;
    const timetableForm = document.getElementById("timetableForm");
    const timetableList = document.getElementById("timetableList");
    const weekOverview = document.getElementById("weekOverview");
    const status = document.getElementById("routineStatus");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let editingId = null;
    let timetableData = store.read("timetableData", []).map((item) => ({
        id: item.id || Date.now() + Math.random(),
        task: item.task || item.title || "Routine block",
        time: item.time || "",
        day: item.day || "Everyday",
        category: item.category || "Routine",
        createdAt: item.createdAt || new Date().toISOString()
    }));

    function saveTimetable() {
        store.write("timetableData", timetableData);
    }

    function showStatus(message) {
        if (!status) return;
        status.textContent = message;
        window.clearTimeout(showStatus.timer);
        showStatus.timer = window.setTimeout(() => {
            status.textContent = "";
        }, 2200);
    }

    function dayOrder(day) {
        if (day === "Everyday") return -1;
        return days.indexOf(day);
    }

    function renderWeekOverview() {
        weekOverview.innerHTML = "";
        days.forEach((day) => {
            const count = timetableData.filter((item) => item.day === day || item.day === "Everyday").length;
            const chip = document.createElement("div");
            chip.className = "day-chip";
            chip.innerHTML = `<strong>${day.slice(0, 3)}</strong><span>${count} block${count === 1 ? "" : "s"}</span>`;
            weekOverview.appendChild(chip);
        });
    }

    function renderTimetable() {
        timetableList.innerHTML = "";

        if (!timetableData.length) {
            timetableList.innerHTML = '<li class="empty-state">No routine blocks yet. Add a morning, focus, meal, or fitness block to begin.</li>';
            renderWeekOverview();
            return;
        }

        timetableData
            .slice()
            .sort((a, b) => dayOrder(a.day) - dayOrder(b.day) || String(a.time).localeCompare(String(b.time)))
            .forEach((item) => {
                const li = document.createElement("li");
                li.className = "routine-item";
                li.innerHTML = `
                    <span class="time-pill">${window.escapeHTML(item.time || "Anytime")}</span>
                    <div>
                        <strong>${window.escapeHTML(item.task)}</strong>
                        <div class="item-meta">
                            <span>${window.escapeHTML(item.day)}</span>
                            <span class="tag">${window.escapeHTML(item.category)}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="icon-button" type="button" data-action="edit" data-id="${item.id}" aria-label="Edit routine">${window.assistantIcon("edit")}</button>
                        <button class="icon-button" type="button" data-action="delete" data-id="${item.id}" aria-label="Delete routine">${window.assistantIcon("trash")}</button>
                    </div>
                `;
                timetableList.appendChild(li);
            });

        renderWeekOverview();
    }

    function resetForm() {
        timetableForm.reset();
        document.getElementById("day").value = "Everyday";
        document.getElementById("category").value = "Focus";
        editingId = null;
        timetableForm.querySelector("button[type='submit']").innerHTML = `${window.assistantIcon("plus")}Add Block`;
    }

    timetableForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const item = {
            id: editingId || Date.now(),
            task: document.getElementById("task").value.trim(),
            time: document.getElementById("time").value,
            day: document.getElementById("day").value,
            category: document.getElementById("category").value,
            createdAt: editingId
                ? timetableData.find((block) => block.id === editingId)?.createdAt || new Date().toISOString()
                : new Date().toISOString()
        };

        if (!item.task || !item.time) {
            showStatus("Task and time are required.");
            return;
        }

        if (editingId) {
            timetableData = timetableData.map((block) => block.id === editingId ? item : block);
            showStatus("Routine block updated.");
        } else {
            timetableData.push(item);
            showStatus("Routine block added.");
        }

        saveTimetable();
        resetForm();
        renderTimetable();
    });

    timetableList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "delete") {
            timetableData = timetableData.filter((item) => item.id !== id);
            saveTimetable();
            showStatus("Routine block deleted.");
            renderTimetable();
            return;
        }

        const item = timetableData.find((block) => block.id === id);
        if (!item) return;

        editingId = id;
        document.getElementById("task").value = item.task;
        document.getElementById("time").value = item.time;
        document.getElementById("day").value = item.day;
        document.getElementById("category").value = item.category;
        timetableForm.querySelector("button[type='submit']").innerHTML = `${window.assistantIcon("save")}Update Block`;
        showStatus("Loaded routine block for editing.");
    });

    saveTimetable();
    resetForm();
    renderTimetable();
});
