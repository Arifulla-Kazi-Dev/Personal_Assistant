(function () {
    const iconPaths = {
        assistant: '<path d="M12 3v3"/><path d="M7 8h10a3 3 0 0 1 3 3v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5a3 3 0 0 1 3-3Z"/><path d="M9 13h.01"/><path d="M15 13h.01"/><path d="M9 17h6"/>',
        dashboard: '<path d="M3 13h8V3H3v10Z"/><path d="M13 21h8V11h-8v10Z"/><path d="M13 3v6h8V3h-8Z"/><path d="M3 21h8v-6H3v6Z"/>',
        user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
        calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/>',
        salad: '<path d="M7 12h10"/><path d="M5 12a7 7 0 0 0 14 0H5Z"/><path d="M8 9c0-2 2-4 4-4s4 2 4 4"/><path d="M12 5V3"/>',
        dumbbell: '<path d="M6 7v10"/><path d="M18 7v10"/><path d="M3 10v4"/><path d="M21 10v4"/><path d="M6 12h12"/>',
        tasks: '<path d="m9 11 2 2 4-4"/><path d="M20 6 9 17l-5-5"/><path d="M4 19h16"/>',
        menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
        close: '<path d="m18 6-12 12"/><path d="m6 6 12 12"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
        moon: '<path d="M20.5 14.5A8.6 8.6 0 0 1 9.5 3.5 8.6 8.6 0 1 0 20.5 14.5Z"/>',
        plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
        trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6"/><path d="M14 11v6"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
        note: '<path d="M4 4h16v16H4z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        water: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
        spark: '<path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3Z"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
        save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>'
    };

    window.assistantIcon = function assistantIcon(name, className = "icon") {
        const path = iconPaths[name] || iconPaths.spark;
        return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
    };

    window.assistantStore = {
        read(key, fallback) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : fallback;
            } catch (error) {
                return fallback;
            }
        },
        write(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };

    window.formatDate = function formatDate(value) {
        if (!value) return "No date";
        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    };

    window.escapeHTML = function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    function applyTheme(theme) {
        const nextTheme = theme === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem("assistantTheme", nextTheme);

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            const label = nextTheme === "dark" ? "Light" : "Dark";
            button.setAttribute("aria-label", `Switch to ${label.toLowerCase()} theme`);
            button.innerHTML = `${window.assistantIcon(nextTheme === "dark" ? "sun" : "moon")}<span>${label}</span>`;
        });
    }

    function initTheme() {
        const saved = localStorage.getItem("assistantTheme");
        const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        applyTheme(saved || preferred);

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                const current = document.documentElement.dataset.theme;
                applyTheme(current === "dark" ? "light" : "dark");
            });
        });
    }

    function initNav() {
        const navToggle = document.querySelector("[data-nav-toggle]");
        const navMenu = document.getElementById("primary-menu");
        const current = (window.location.pathname.split("/").pop() || "Index.html").toLowerCase();
        const normalizedCurrent = current === "personal.html" ? "index.html" : current;

        document.querySelectorAll(".nav-link").forEach((link) => {
            const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
            if (href === normalizedCurrent) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });

        if (!navToggle || !navMenu) return;

        navToggle.innerHTML = window.assistantIcon("menu");
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.innerHTML = window.assistantIcon(isOpen ? "close" : "menu");
        });

        navMenu.addEventListener("click", (event) => {
            const link = event.target.closest("a");
            if (!link) return;
            navMenu.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.innerHTML = window.assistantIcon("menu");
        });
    }

    function initInlineIcons() {
        document.querySelectorAll("[data-icon]").forEach((element) => {
            if (element.querySelector("svg")) return;
            const iconName = element.getAttribute("data-icon");
            const iconClass = element.getAttribute("data-icon-class") || "icon";
            element.insertAdjacentHTML("afterbegin", window.assistantIcon(iconName, iconClass));
        });
    }

    function initClock() {
        const clock = document.querySelector("[data-clock]");
        const date = document.querySelector("[data-current-date]");
        if (!clock && !date) return;

        const render = () => {
            const now = new Date();
            if (clock) {
                clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
            if (date) {
                date.textContent = now.toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                });
            }
        };

        render();
        setInterval(render, 30000);
    }

    document.addEventListener("DOMContentLoaded", () => {
        initInlineIcons();
        initTheme();
        initNav();
        initClock();
    });
})();
