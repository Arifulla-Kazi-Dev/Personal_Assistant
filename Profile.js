document.addEventListener("DOMContentLoaded", () => {
    const sections = [
        {
            button: "save-basic-info",
            message: "Basic information saved.",
            fields: {
                fullName: "full-name",
                age: "age",
                gender: "gender",
                dob: "dob",
                contactInfo: "contact-info",
                address: "address"
            }
        },
        {
            button: "save-physical-stats",
            message: "Physical stats saved.",
            beforeSave: updateBMI,
            fields: {
                height: "height",
                weight: "weight",
                bmi: "bmi"
            }
        },
        {
            button: "save-hobbies-interests",
            message: "Routine and interests saved.",
            fields: {
                hobbies: "hobbies",
                favoriteFoods: "favorite-foods",
                dailyRoutine: "daily-routine"
            }
        },
        {
            button: "save-professional-details",
            message: "Professional details saved.",
            fields: {
                jobTitle: "job-title",
                company: "company",
                workExperience: "work-experience",
                skills: "skills",
                education: "education"
            }
        },
        {
            button: "save-goals-aspirations",
            message: "Goals saved.",
            fields: {
                shortTermGoals: "short-term-goals",
                longTermGoals: "long-term-goals"
            }
        },
        {
            button: "save-health-fitness",
            message: "Health and fitness details saved.",
            fields: {
                fitnessRoutine: "fitness-routine",
                healthGoals: "health-goals"
            }
        },
        {
            button: "save-social-profiles",
            message: "Social profiles saved.",
            fields: {
                socialLinks: "social-links"
            }
        },
        {
            button: "save-additional-preferences",
            message: "Preferences saved.",
            fields: {
                travelInterests: "travel-interests",
                lifestyleChoices: "lifestyle-choices"
            }
        }
    ];

    function getElement(id) {
        return document.getElementById(id);
    }

    function calculateBMI(height, weight) {
        const heightMeters = Number(height) / 100;
        const weightKg = Number(weight);
        if (!heightMeters || !weightKg) return "";
        return (weightKg / (heightMeters * heightMeters)).toFixed(2);
    }

    function updateBMI() {
        const height = getElement("height").value;
        const weight = getElement("weight").value;
        const bmi = calculateBMI(height, weight);
        getElement("bmi").value = bmi;
        return bmi;
    }

    function showStatus(message) {
        const status = getElement("profile-status");
        if (!status) return;
        status.textContent = message;
        window.clearTimeout(showStatus.timer);
        showStatus.timer = window.setTimeout(() => {
            status.textContent = "";
        }, 2600);
    }

    function saveSection(section) {
        if (section.beforeSave) section.beforeSave();

        Object.entries(section.fields).forEach(([key, id]) => {
            const element = getElement(id);
            if (element) localStorage.setItem(key, element.value.trim());
        });

        renderSnapshot();
        showStatus(section.message);
    }

    function loadSavedData() {
        sections.forEach((section) => {
            Object.entries(section.fields).forEach(([key, id]) => {
                const element = getElement(id);
                if (element) element.value = localStorage.getItem(key) || "";
            });
        });
        updateBMI();
        renderSnapshot();
    }

    function renderSnapshot() {
        const name = localStorage.getItem("fullName") || "Not set";
        const bmi = localStorage.getItem("bmi") || getElement("bmi")?.value || "--";
        const goal = localStorage.getItem("shortTermGoals") || localStorage.getItem("longTermGoals") || "--";

        const nameMetric = getElement("profileNameMetric");
        const bmiMetric = getElement("profileBmiMetric");
        const goalMetric = getElement("profileGoalMetric");

        if (nameMetric) nameMetric.textContent = name.split(" ")[0] || "Not set";
        if (bmiMetric) bmiMetric.textContent = bmi || "--";
        if (goalMetric) goalMetric.textContent = goal === "--" ? "--" : "Active";
    }

    sections.forEach((section) => {
        const button = getElement(section.button);
        if (button) button.addEventListener("click", () => saveSection(section));
    });

    ["height", "weight"].forEach((id) => {
        const element = getElement(id);
        if (element) element.addEventListener("input", updateBMI);
    });

    loadSavedData();
});
