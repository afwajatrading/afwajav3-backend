(function () {
    const { createLanguageController, setCurrentYear } = window.AfwajaSite;
    const siteConfig = window.AfwajaSiteConfig || {};
    const STATUS_CONFIG = {
        success: {
            cardTone: "border-emerald-200 bg-emerald-50/95",
            iconTone: "bg-emerald-100 text-emerald-600",
            icon: "fa-circle-check",
        },
        pending: {
            cardTone: "border-amber-200 bg-amber-50/95",
            iconTone: "bg-amber-100 text-amber-600",
            icon: "fa-clock",
        },
        failed: {
            cardTone: "border-rose-200 bg-rose-50/95",
            iconTone: "bg-rose-100 text-rose-600",
            icon: "fa-circle-xmark",
        },
        cancelled: {
            cardTone: "border-slate-200 bg-slate-50/95",
            iconTone: "bg-slate-100 text-slate-500",
            icon: "fa-ban",
        },
        unknown: {
            cardTone: "border-cyan-200 bg-cyan-50/95",
            iconTone: "bg-cyan-100 text-cyan-600",
            icon: "fa-circle-info",
        },
    };

    const translations = {
        en: {
            nav_back: "Back to Home",
            hero_badge: "Payment Update",
            hero_title: "Thank You",
            hero_desc: "We are checking your BayarCash payment status now. Please wait a moment.",
            status_label: "Payment Status",
            status_checking: "Checking payment status...",
            status_loading: "We are verifying your latest transaction details with BayarCash.",
            payment_update_title: "Payment Update",
            payment_status_success_title: "Payment Successful",
            payment_status_pending_title: "Payment Pending",
            payment_status_failed_title: "Payment Failed",
            payment_status_cancelled_title: "Payment Cancelled",
            payment_status_unknown_title: "Payment Verification Needed",
            payment_status_success: "Payment successful. Our team will contact you shortly to confirm the booking.",
            payment_status_pending: "Payment is still pending confirmation. We will update your booking once it is approved.",
            payment_status_failed: "Payment was not completed. You can try again whenever you are ready.",
            payment_status_cancelled: "Payment was cancelled before completion.",
            payment_status_unknown: "We received your payment return, but the status could not be verified yet.",
            payment_status_invalid: "We could not verify the BayarCash return checksum. Please contact our team if money has been deducted.",
            order_label: "Order",
            transaction_label: "Transaction",
            try_payment_again: "Try Payment Again",
            back_home: "Back to Home",
            book_another: "Book Another Car",
            footer_copy: "All Rights Reserved.",
        },
        ms: {
            nav_back: "Kembali ke Laman Utama",
            hero_badge: "Kemaskini Bayaran",
            hero_title: "Terima Kasih",
            hero_desc: "Kami sedang menyemak status bayaran BayarCash anda. Sila tunggu sebentar.",
            status_label: "Status Bayaran",
            status_checking: "Sedang menyemak status bayaran...",
            status_loading: "Kami sedang mengesahkan butiran transaksi terkini anda dengan BayarCash.",
            payment_update_title: "Kemaskini Bayaran",
            payment_status_success_title: "Bayaran Berjaya",
            payment_status_pending_title: "Bayaran Sedang Diproses",
            payment_status_failed_title: "Bayaran Gagal",
            payment_status_cancelled_title: "Bayaran Dibatalkan",
            payment_status_unknown_title: "Pengesahan Bayaran Diperlukan",
            payment_status_success: "Bayaran berjaya. Pasukan kami akan hubungi anda sebentar lagi untuk sahkan tempahan.",
            payment_status_pending: "Bayaran masih menunggu pengesahan. Kami akan kemas kini tempahan anda selepas ia diluluskan.",
            payment_status_failed: "Bayaran belum berjaya diselesaikan. Anda boleh cuba semula bila bersedia.",
            payment_status_cancelled: "Bayaran telah dibatalkan sebelum selesai.",
            payment_status_unknown: "Kami menerima pulangan bayaran anda, tetapi statusnya belum dapat disahkan lagi.",
            payment_status_invalid: "Pulangan BayarCash tidak dapat disahkan. Hubungi pasukan kami jika wang telah ditolak.",
            order_label: "No. Tempahan",
            transaction_label: "Transaksi",
            try_payment_again: "Cuba Bayar Semula",
            back_home: "Kembali ke Laman Utama",
            book_another: "Tempah Kereta Lain",
            footer_copy: "Hak Cipta Terpelihara.",
        },
    };

    const statusCard = document.getElementById("payment-status-card");
    const statusIcon = document.getElementById("payment-status-icon");
    const statusTitle = document.getElementById("payment-status-title");
    const statusHeading = document.getElementById("payment-status-heading");
    const statusMessage = document.getElementById("payment-status-message");
    const orderNumber = document.getElementById("payment-order-number");
    const transactionId = document.getElementById("payment-transaction-id");
    const retryButton = document.getElementById("payment-retry-button");
    let currentRenderedState = "unknown";
    let currentRenderedDetails = { verified: false };

    const languageController = createLanguageController({
        defaultLanguage: "ms",
        translations,
        desktopToggleId: "lang-toggle",
        onUpdate: () => {
            renderStatus(currentRenderedState, currentRenderedDetails);
        },
    });
    window.AfwajaToggleThankYouLanguage = () => {
        languageController.toggleLanguage();
    };

    function t(key) {
        return translations[languageController.getCurrentLanguage()]?.[key] || key;
    }

    function buildApiUrl(path) {
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const apiBaseUrl = `${siteConfig.apiBaseUrl || ""}`.trim().replace(/\/+$/, "");
        return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
    }

    function mapPaymentState(statusValue) {
        const normalized = `${statusValue ?? ""}`.toLowerCase();

        if (normalized === "3" || normalized === "success" || normalized === "paid" || normalized === "approved") {
            return "success";
        }

        if (normalized === "1" || normalized === "pending") {
            return "pending";
        }

        if (normalized === "2" || normalized === "failed" || normalized === "unsuccessful") {
            return "failed";
        }

        if (normalized === "4" || normalized === "cancelled" || normalized === "canceled") {
            return "cancelled";
        }

        return "unknown";
    }

    function renderStatus(state, details = {}) {
        currentRenderedState = state;
        currentRenderedDetails = details;
        const config = STATUS_CONFIG[state] || STATUS_CONFIG.unknown;
        const titleKey = details.verified === false ? "payment_status_unknown_title" : `payment_status_${state}_title`;
        const messageKey = details.verified === false ? "payment_status_invalid" : `payment_status_${state}`;
        const descriptionText = details.statusDescription ? ` ${details.statusDescription}` : "";

        if (statusCard) {
            statusCard.className = `mt-10 rounded-3xl border p-6 md:p-8 shadow-lg shadow-slate-900/5 backdrop-blur-md ${config.cardTone}`;
        }

        if (statusIcon) {
            statusIcon.className = `w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0 ${config.iconTone}`;
            statusIcon.innerHTML = `<i class="fas ${config.icon} text-2xl"></i>`;
        }

        if (statusTitle) {
            statusTitle.textContent = t("payment_update_title");
        }

        if (statusHeading) {
            statusHeading.textContent = t(titleKey);
        }

        if (statusMessage) {
            statusMessage.textContent = `${t(messageKey)}${descriptionText}`.trim();
        }

        if (orderNumber) {
            orderNumber.textContent = details.orderNumber || "-";
        }

        if (transactionId) {
            transactionId.textContent = details.transactionId || "-";
        }

        if (retryButton) {
            retryButton.classList.toggle("hidden", !(state === "failed" || state === "cancelled" || state === "unknown"));
        }
    }

    function setupLanguageActions() {
        document.querySelectorAll("[data-language-toggle]").forEach((toggleButton) => {
            toggleButton.addEventListener("click", () => {
                languageController.toggleLanguage();
            });
        });
    }

    async function handlePaymentReturn() {
        const url = new URL(window.location.href);

        if (!url.searchParams.has("checksum") || !url.searchParams.has("transaction_id")) {
            renderStatus("unknown", { verified: false });
            return;
        }

        try {
            const response = await fetch(buildApiUrl(`/api/bayarcash/verify-return?${url.searchParams.toString()}`));
            const result = await response.json();
            const state = mapPaymentState(result.status);

            renderStatus(state, result);
        } catch (error) {
            renderStatus("unknown", { verified: false });
        } finally {
            const cleanUrl = new URL(window.location.href);
            [
                "payment_return",
                "record_type",
                "transaction_id",
                "exchange_reference_number",
                "exchange_transaction_id",
                "order_number",
                "currency",
                "amount",
                "payer_name",
                "payer_email",
                "payer_bank_name",
                "status",
                "status_description",
                "datetime",
                "booking_snapshot",
                "checksum",
            ].forEach((key) => cleanUrl.searchParams.delete(key));
            window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
        }
    }

    setCurrentYear();
    setupLanguageActions();
    languageController.updateUI();
    handlePaymentReturn();
})();
