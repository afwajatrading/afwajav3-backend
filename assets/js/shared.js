(function () {
    const LANGUAGE_STORAGE_KEY = "afwaja-language";

    function setCurrentYear(elementId = "year") {
        const yearElement = document.getElementById(elementId);
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    function getStoredLanguage(fallback = "ms") {
        try {
            const storedLanguage = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
            return storedLanguage === "en" || storedLanguage === "ms" ? storedLanguage : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function storeLanguage(language) {
        try {
            window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
        } catch (error) {
            // Ignore storage errors so private browsing never breaks the site.
        }
    }

    function renderLanguageToggle(button, language) {
        if (!button) {
            return;
        }

        button.innerHTML = language === "en"
            ? '<strong>EN</strong> / <span class="text-slate-400">MS</span>'
            : '<span class="text-slate-400">EN</span> / <strong>MS</strong>';
    }

    function updateAllLanguageToggleLabels(language) {
        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            renderLanguageToggle(button, language);
        });
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
        let currentLanguage = getStoredLanguage(defaultLanguage);

        function updateToggleLabels() {
            updateAllLanguageToggleLabels(currentLanguage);
            renderLanguageToggle(desktopToggle, currentLanguage);
            renderLanguageToggle(mobileToggle, currentLanguage);
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
            storeLanguage(currentLanguage);
            updateUI();
        }

        return {
            getCurrentLanguage: () => currentLanguage,
            toggleLanguage,
            updateUI,
        };
    }

    function setupLanguagePreferenceToggle(defaultLanguage = "ms") {
        let currentLanguage = getStoredLanguage(defaultLanguage);

        updateAllLanguageToggleLabels(currentLanguage);

        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                currentLanguage = currentLanguage === "en" ? "ms" : "en";
                storeLanguage(currentLanguage);
                document.documentElement.lang = currentLanguage;
                updateAllLanguageToggleLabels(currentLanguage);
            });
        });
    }

    function setupStaticTextTranslations(entries, defaultLanguage = "ms") {
        const normalizedEntries = entries.filter((entry) => entry?.ms && entry?.en);
        let currentLanguage = getStoredLanguage(defaultLanguage);

        function findEntry(text) {
            return normalizedEntries.find((entry) => entry.ms === text || entry.en === text);
        }

        function applyStaticTranslations() {
            document.documentElement.lang = currentLanguage;
            updateAllLanguageToggleLabels(currentLanguage);

            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            const textNodes = [];

            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            textNodes.forEach((node) => {
                const trimmedText = node.nodeValue.trim();
                const entry = findEntry(trimmedText);

                if (!entry) {
                    return;
                }

                node.nodeValue = node.nodeValue.replace(trimmedText, entry[currentLanguage]);
            });
        }

        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                currentLanguage = currentLanguage === "en" ? "ms" : "en";
                storeLanguage(currentLanguage);
                applyStaticTranslations();
            });
        });

        applyStaticTranslations();
    }

    function setupMobileMenu(toggleId = "mobile-menu-toggle", menuId = "mobile-menu") {
        const toggle = document.getElementById(toggleId);
        const menu = document.getElementById(menuId);

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", () => {
            menu.classList.toggle("hidden");
        });

        menu.querySelectorAll("[data-mobile-nav-link]").forEach((link) => {
            link.addEventListener("click", () => {
                menu.classList.add("hidden");
            });
        });
    }

    window.AfwajaSite = {
        createLanguageController,
        setCurrentYear,
        setupMobileMenu,
        setupLanguagePreferenceToggle,
        setupStaticTextTranslations,
    };
})();
