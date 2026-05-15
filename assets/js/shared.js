(function () {
    function setCurrentYear(elementId = "year") {
        const yearElement = document.getElementById(elementId);
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    function createLanguageController(options) {
        const {
            defaultLanguage,
            translations,
            desktopToggleId = "lang-toggle",
            mobileToggleId = null,
            htmlKeys = [],
            onUpdate = null,
        } = options;

        const htmlKeySet = new Set(htmlKeys);
        const desktopToggle = document.getElementById(desktopToggleId);
        const mobileToggle = mobileToggleId ? document.getElementById(mobileToggleId) : null;
        let currentLanguage = defaultLanguage;

        function updateToggleLabels() {
            if (desktopToggle) {
                if (currentLanguage === "en") {
                    desktopToggle.innerHTML = '<strong>EN</strong> / <span class="text-slate-400">MS</span>';
                } else {
                    desktopToggle.innerHTML = '<span class="text-slate-400">EN</span> / <strong>MS</strong>';
                }
            }

            if (mobileToggle) {
                mobileToggle.textContent = currentLanguage === "en" ? "EN" : "MS";
            }
        }

        function applyTranslations() {
            document.documentElement.lang = currentLanguage;

            document.querySelectorAll("[data-i18n]").forEach((element) => {
                const key = element.getAttribute("data-i18n");
                const translation = translations[currentLanguage]?.[key];

                if (translation === undefined) {
                    return;
                }

                if (htmlKeySet.has(key)) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            });

            document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
                const key = element.getAttribute("data-i18n-placeholder");
                const translation = translations[currentLanguage]?.[key];

                if (translation === undefined) {
                    return;
                }

                element.setAttribute("placeholder", translation);
            });
        }

        function updateUI() {
            updateToggleLabels();

            if (typeof onUpdate === "function") {
                onUpdate(currentLanguage);
            }

            applyTranslations();
        }

        function toggleLanguage() {
            currentLanguage = currentLanguage === "en" ? "ms" : "en";
            updateUI();
        }

        return {
            getCurrentLanguage: () => currentLanguage,
            toggleLanguage,
            updateUI,
        };
    }

    window.AfwajaSite = {
        createLanguageController,
        setCurrentYear,
    };
})();
