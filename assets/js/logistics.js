(function () {
    const { createLanguageController, setCurrentYear } = window.AfwajaSite;
    const siteConfig = window.AfwajaSiteConfig || {};

    const translations = {
        en: {
            nav_back: "Back to Home",
            hero_badge: "Distance-Based Estimate",
            hero_title: "Logistics Cost Calculator",
            hero_desc: "Estimate delivery and return pickup charges before booking via WhatsApp or website checkout.",
            form_badge: "Mini Calculator",
            form_title: "Estimate Your Logistics Charges",
            form_desc: "Enter your pickup and return locations to calculate charges from Afwaja Car Rental Cyberjaya.",
            distance_note_title: "How charges are calculated",
            distance_note_desc: "Delivery and return pickup are charged at RM2.00 per km based on the actual road distance using Google Maps.",
            pickup_location: "Pick-up Location",
            return_location: "Return Location",
            homebase_free: "Afwaja Car Rental (Free)",
            placeholder_location: "Type your location",
            calculate_button: "Calculate Charges",
            calculating_button: "Calculating...",
            back_to_fleet: "Back to Fleet",
            results_badge: "Estimated Summary",
            results_title: "Your Estimated Charges",
            results_desc: "Use this estimate before you continue with WhatsApp booking or direct checkout.",
            result_delivery: "Delivery Charge",
            result_collection: "Return Pickup Charge",
            result_total: "Total Logistics Charge",
            distance_empty: "Enter both locations to calculate your delivery estimate.",
            distance_loading: "Calculating actual road distance from Afwaja Car Rental Cyberjaya...",
            distance_error: "We could not calculate the route charges yet. Please refine both locations.",
            distance_ready: "Delivery: {deliveryDistance} km (RM{deliveryCharge}) | Return pickup: {collectionDistance} km (RM{collectionCharge})",
            tips_title: "Helpful note",
            tips_desc: "For self pickup or self return at Afwaja Car Rental Cyberjaya, that side of the logistics charge stays at RM0.",
            tip_chip_1: "RM2/km",
            tip_chip_2: "Google Maps Route",
            tip_chip_3: "Auto Calculated",
            error_complete_locations: "Please complete both locations before calculating.",
            error_map_config: "Google Maps location services are not configured on this server yet.",
            footer_copy: "All Rights Reserved.",
        },
        ms: {
            nav_back: "Kembali ke Laman Utama",
            hero_badge: "Anggaran Berdasarkan Jarak",
            hero_title: "Kalkulator Kos Logistik",
            hero_desc: "Anggarkan caj delivery dan pickup semula sebelum tempah melalui WhatsApp atau checkout laman web.",
            form_badge: "Kalkulator Mini",
            form_title: "Anggarkan Caj Logistik Anda",
            form_desc: "Masukkan lokasi ambil dan lokasi pulang untuk kira caj dari Afwaja Car Rental Cyberjaya.",
            distance_note_title: "Cara caj dikira",
            distance_note_desc: "Delivery dan pickup semula dicaj pada kadar RM2.00 setiap km berdasarkan jarak jalan sebenar menggunakan Google Maps.",
            pickup_location: "Lokasi Ambil",
            return_location: "Lokasi Pulang",
            homebase_free: "Afwaja Car Rental (Percuma)",
            placeholder_location: "Taip lokasi anda",
            calculate_button: "Kira Caj",
            calculating_button: "Sedang Mengira...",
            back_to_fleet: "Kembali ke Fleet",
            results_badge: "Ringkasan Anggaran",
            results_title: "Anggaran Caj Anda",
            results_desc: "Gunakan anggaran ini sebelum anda teruskan tempahan melalui WhatsApp atau checkout terus.",
            result_delivery: "Caj Delivery",
            result_collection: "Caj Pickup Semula",
            result_total: "Jumlah Caj Logistik",
            distance_empty: "Masukkan kedua-dua lokasi untuk kira anggaran delivery anda.",
            distance_loading: "Sedang mengira jarak jalan sebenar dari Afwaja Car Rental Cyberjaya...",
            distance_error: "Kami belum dapat kira caj laluan. Sila semak semula kedua-dua lokasi.",
            distance_ready: "Delivery: {deliveryDistance} km (RM{deliveryCharge}) | Pickup semula: {collectionDistance} km (RM{collectionCharge})",
            tips_title: "Nota penting",
            tips_desc: "Bagi ambil sendiri atau pulang sendiri di Afwaja Car Rental Cyberjaya, bahagian caj logistik itu kekal RM0.",
            tip_chip_1: "RM2/km",
            tip_chip_2: "Laluan Google Maps",
            tip_chip_3: "Dikira Automatik",
            error_complete_locations: "Sila lengkapkan kedua-dua lokasi sebelum mengira.",
            error_map_config: "Perkhidmatan lokasi Google Maps belum dikonfigurasi pada server ini.",
            footer_copy: "Hak Cipta Terpelihara.",
        },
    };

    const pickupLocationInput = document.getElementById("logistics-pickup-location");
    const returnLocationInput = document.getElementById("logistics-return-location");
    const pickupHomebaseCheckbox = document.getElementById("logistics-pickup-homebase");
    const returnHomebaseCheckbox = document.getElementById("logistics-return-homebase");
    const pickupSuggestions = document.getElementById("logistics-pickup-location-suggestions");
    const returnSuggestions = document.getElementById("logistics-return-location-suggestions");
    const logisticsForm = document.getElementById("logistics-form");
    const logisticsFormError = document.getElementById("logistics-form-error");
    const submitButton = document.getElementById("logistics-submit-button");
    const submitText = document.getElementById("logistics-submit-text");
    const distanceFeedback = document.getElementById("logistics-distance-feedback");
    const resultDelivery = document.getElementById("logistics-result-delivery");
    const resultCollection = document.getElementById("logistics-result-collection");
    const resultTotal = document.getElementById("logistics-result-total");

    const mapConfig = {
        enabled: false,
        homeBaseName: "Afwaja Car Rental Cyberjaya",
        homeBaseAddress: "Afwaja Car Rental Cyberjaya, Cyberjaya, Selangor, Malaysia",
        ratePerKm: 2,
    };
    const deliveryQuote = {
        status: "idle",
        pickupDistanceKm: 0,
        pickupCharge: 0,
        collectionDistanceKm: 0,
        collectionCharge: 0,
        totalCharge: 0,
    };
    const locationSuggestionElements = {
        pickup: pickupSuggestions,
        return: returnSuggestions,
    };
    const locationFieldState = {
        pickup: { input: pickupLocationInput, key: "pickup", debounceId: null },
        return: { input: returnLocationInput, key: "return", debounceId: null },
    };
    let quoteRequestToken = 0;

    const languageController = createLanguageController({
        defaultLanguage: "ms",
        translations,
        desktopToggleId: "lang-toggle",
        onUpdate: () => {
            updateDistanceFeedback();
            updateResultCards();
        },
    });

    function setupLanguageActions() {
        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                languageController.toggleLanguage();
            });
        });
    }

    function getCurrentLanguage() {
        return languageController.getCurrentLanguage();
    }

    function t(key) {
        return translations[getCurrentLanguage()]?.[key] || key;
    }

    function interpolate(template, values) {
        return Object.entries(values).reduce((message, [key, value]) => {
            return message.replaceAll(`{${key}}`, value);
        }, template);
    }

    function escapeAttribute(value) {
        return `${value ?? ""}`
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-MY", {
            style: "currency",
            currency: "MYR",
            minimumFractionDigits: 2,
        }).format(amount);
    }

    function formatDistanceKm(distanceKm) {
        return Number(distanceKm).toFixed(1);
    }

    function formatChargeNumber(amount) {
        return Number(amount).toFixed(2);
    }

    function buildApiUrl(path) {
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const apiBaseUrl = `${siteConfig.apiBaseUrl || ""}`.trim().replace(/\/+$/, "");
        return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
    }

    function setFormError(message = "") {
        if (!logisticsFormError) {
            return;
        }

        logisticsFormError.textContent = message;
        logisticsFormError.classList.toggle("hidden", !message);
    }

    function setLoading(isLoading) {
        if (!submitButton || !submitText) {
            return;
        }

        submitButton.disabled = isLoading;
        submitButton.classList.toggle("opacity-70", isLoading);
        submitButton.classList.toggle("cursor-not-allowed", isLoading);
        submitText.textContent = isLoading ? t("calculating_button") : t("calculate_button");
    }

    function resetDeliveryQuote(status = "idle") {
        deliveryQuote.status = status;
        deliveryQuote.pickupDistanceKm = 0;
        deliveryQuote.pickupCharge = 0;
        deliveryQuote.collectionDistanceKm = 0;
        deliveryQuote.collectionCharge = 0;
        deliveryQuote.totalCharge = 0;
    }

    function updateResultCards() {
        if (resultDelivery) {
            resultDelivery.textContent = deliveryQuote.status === "ready" ? formatCurrency(deliveryQuote.pickupCharge) : "-";
        }

        if (resultCollection) {
            resultCollection.textContent = deliveryQuote.status === "ready" ? formatCurrency(deliveryQuote.collectionCharge) : "-";
        }

        if (resultTotal) {
            resultTotal.textContent = deliveryQuote.status === "ready" ? formatCurrency(deliveryQuote.totalCharge) : "-";
        }
    }

    function updateDistanceFeedback() {
        if (!distanceFeedback) {
            return;
        }

        if (!mapConfig.enabled) {
            distanceFeedback.textContent = t("error_map_config");
            return;
        }

        if (deliveryQuote.status === "loading") {
            distanceFeedback.textContent = t("distance_loading");
            return;
        }

        if (deliveryQuote.status === "ready") {
            distanceFeedback.textContent = interpolate(t("distance_ready"), {
                deliveryDistance: formatDistanceKm(deliveryQuote.pickupDistanceKm),
                deliveryCharge: formatChargeNumber(deliveryQuote.pickupCharge),
                collectionDistance: formatDistanceKm(deliveryQuote.collectionDistanceKm),
                collectionCharge: formatChargeNumber(deliveryQuote.collectionCharge),
            });
            return;
        }

        if (deliveryQuote.status === "error") {
            distanceFeedback.textContent = t("distance_error");
            return;
        }

        distanceFeedback.textContent = t("distance_empty");
    }

    function buildLocationPayload(inputElement) {
        return {
            address: inputElement?.value.trim() || "",
            placeId: inputElement?.dataset.placeId || "",
            isHomeBase: inputElement?.dataset.homeBase === "true",
        };
    }

    function clearLocationSelection(inputElement) {
        if (!inputElement) {
            return;
        }

        inputElement.dataset.placeId = "";
        inputElement.dataset.placeLabel = "";
        inputElement.dataset.homeBase = "";
    }

    function setLocationAsHomeBase(inputElement) {
        if (!inputElement) {
            return;
        }

        inputElement.value = mapConfig.homeBaseName;
        inputElement.dataset.placeId = "";
        inputElement.dataset.placeLabel = mapConfig.homeBaseName;
        inputElement.dataset.homeBase = "true";
    }

    function hideSuggestionList(key) {
        const suggestionElement = locationSuggestionElements[key];
        if (!suggestionElement) {
            return;
        }

        suggestionElement.classList.add("hidden");
        suggestionElement.innerHTML = "";
    }

    function renderSuggestionList(key, suggestions) {
        const suggestionElement = locationSuggestionElements[key];
        if (!suggestionElement) {
            return;
        }

        if (!suggestions.length) {
            hideSuggestionList(key);
            return;
        }

        suggestionElement.innerHTML = suggestions.map((suggestion, index) => `
            <button
                type="button"
                class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${index < suggestions.length - 1 ? "border-b border-slate-100" : ""}"
                data-location-suggestion="${key}"
                data-place-id="${escapeAttribute(suggestion.placeId)}"
                data-label="${escapeAttribute(suggestion.label)}"
            >
                <span class="block text-sm font-semibold text-slate-800">${escapeAttribute(suggestion.mainText)}</span>
                <span class="mt-1 block text-xs text-slate-500">${escapeAttribute(suggestion.secondaryText)}</span>
            </button>
        `).join("");
        suggestionElement.classList.remove("hidden");
    }

    function toggleHomeBaseLocation(key, isChecked) {
        const inputElement = key === "pickup" ? pickupLocationInput : returnLocationInput;

        if (!inputElement) {
            return;
        }

        if (isChecked) {
            setLocationAsHomeBase(inputElement);
            inputElement.readOnly = true;
            inputElement.classList.add("bg-slate-100", "text-slate-500", "cursor-not-allowed");
            hideSuggestionList(key);
        } else {
            inputElement.readOnly = false;
            inputElement.classList.remove("bg-slate-100", "text-slate-500", "cursor-not-allowed");
            inputElement.value = "";
            clearLocationSelection(inputElement);
        }

        resetDeliveryQuote("idle");
        setFormError("");
        updateDistanceFeedback();
        updateResultCards();
    }

    async function fetchMapConfig() {
        try {
            const response = await fetch(buildApiUrl("/api/maps/config"));
            const result = await response.json();

            if (!response.ok || !result.enabled) {
                mapConfig.enabled = false;
                updateDistanceFeedback();
                return;
            }

            mapConfig.enabled = true;
            mapConfig.homeBaseName = result.homeBaseName || mapConfig.homeBaseName;
            mapConfig.homeBaseAddress = result.homeBaseAddress || mapConfig.homeBaseAddress;
            mapConfig.ratePerKm = Number(result.ratePerKm) || mapConfig.ratePerKm;
            updateDistanceFeedback();
        } catch (error) {
            mapConfig.enabled = false;
            updateDistanceFeedback();
        }
    }

    async function fetchLocationSuggestions(key, inputValue) {
        if (!mapConfig.enabled || inputValue.trim().length < 3) {
            hideSuggestionList(key);
            return;
        }

        try {
            const response = await fetch(buildApiUrl("/api/maps/autocomplete"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ input: inputValue.trim() }),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || !Array.isArray(result.suggestions)) {
                hideSuggestionList(key);
                return;
            }

            renderSuggestionList(key, result.suggestions);
        } catch (error) {
            hideSuggestionList(key);
        }
    }

    async function requestDeliveryQuote() {
        const pickupLocation = buildLocationPayload(pickupLocationInput);
        const returnLocation = buildLocationPayload(returnLocationInput);

        if (!mapConfig.enabled) {
            setFormError(t("error_map_config"));
            resetDeliveryQuote("error");
            updateDistanceFeedback();
            updateResultCards();
            return;
        }

        if (!pickupLocation.address || !returnLocation.address) {
            setFormError(t("error_complete_locations"));
            resetDeliveryQuote("idle");
            updateDistanceFeedback();
            updateResultCards();
            return;
        }

        setFormError("");
        setLoading(true);
        const currentToken = ++quoteRequestToken;
        deliveryQuote.status = "loading";
        updateDistanceFeedback();
        updateResultCards();

        try {
            const response = await fetch(buildApiUrl("/api/maps/delivery-quote"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pickupLocation,
                    returnLocation,
                }),
            });
            const result = await response.json().catch(() => ({}));

            if (currentToken !== quoteRequestToken) {
                return;
            }

            if (!response.ok) {
                setFormError(result.error || t("distance_error"));
                resetDeliveryQuote("error");
                updateDistanceFeedback();
                updateResultCards();
                return;
            }

            deliveryQuote.status = "ready";
            deliveryQuote.pickupDistanceKm = Number(result.pickupDistanceKm) || 0;
            deliveryQuote.pickupCharge = Number(result.pickupCharge) || 0;
            deliveryQuote.collectionDistanceKm = Number(result.collectionDistanceKm) || 0;
            deliveryQuote.collectionCharge = Number(result.collectionCharge) || 0;
            deliveryQuote.totalCharge = Number(result.totalCharge) || 0;
            updateDistanceFeedback();
            updateResultCards();
        } catch (error) {
            if (currentToken !== quoteRequestToken) {
                return;
            }

            setFormError(t("distance_error"));
            resetDeliveryQuote("error");
            updateDistanceFeedback();
            updateResultCards();
        } finally {
            setLoading(false);
        }
    }

    function setupLocationAutocomplete() {
        Object.values(locationFieldState).forEach((fieldState) => {
            fieldState.input?.addEventListener("input", () => {
                if (fieldState.input.dataset.homeBase === "true") {
                    return;
                }

                clearLocationSelection(fieldState.input);
                resetDeliveryQuote("idle");
                setFormError("");
                updateDistanceFeedback();
                updateResultCards();

                window.clearTimeout(fieldState.debounceId);
                fieldState.debounceId = window.setTimeout(() => {
                    fetchLocationSuggestions(fieldState.key, fieldState.input.value);
                }, 250);
            });

            fieldState.input?.addEventListener("blur", () => {
                window.setTimeout(() => {
                    hideSuggestionList(fieldState.key);
                }, 150);
            });
        });

        pickupHomebaseCheckbox?.addEventListener("change", (event) => {
            toggleHomeBaseLocation("pickup", event.target.checked);
        });

        returnHomebaseCheckbox?.addEventListener("change", (event) => {
            toggleHomeBaseLocation("return", event.target.checked);
        });

        Object.entries(locationSuggestionElements).forEach(([key, suggestionElement]) => {
            suggestionElement?.addEventListener("click", (event) => {
                const suggestionButton = event.target.closest("[data-location-suggestion]");
                if (!suggestionButton) {
                    return;
                }

                const inputElement = key === "pickup" ? pickupLocationInput : returnLocationInput;
                inputElement.value = suggestionButton.dataset.label || "";
                inputElement.dataset.placeId = suggestionButton.dataset.placeId || "";
                inputElement.dataset.placeLabel = suggestionButton.dataset.label || "";
                inputElement.dataset.homeBase = "";

                if (key === "pickup" && pickupHomebaseCheckbox) {
                    pickupHomebaseCheckbox.checked = false;
                }

                if (key === "return" && returnHomebaseCheckbox) {
                    returnHomebaseCheckbox.checked = false;
                }

                hideSuggestionList(key);
            });
        });
    }

    function setupForm() {
        logisticsForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            requestDeliveryQuote();
        });
    }

    setCurrentYear();
    languageController.updateUI();
    setupLanguageActions();
    setupLocationAutocomplete();
    setupForm();
    fetchMapConfig();
    updateResultCards();
})();
