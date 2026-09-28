(() => {
    const login = document.querySelector("#admin-login");
    const dashboard = document.querySelector("#admin-dashboard");
    const loginForm = document.querySelector("#admin-login-form");
    const loginError = document.querySelector("#admin-login-error");
    const form = document.querySelector("#coupon-form");
    const code = document.querySelector("#coupon-code");
    const original = document.querySelector("#preview-original");
    const discount = document.querySelector("#preview-discount");
    const deal = document.querySelector("#preview-deal");
    const table = document.querySelector("#coupon-table-body");
    const formatMoney = (value) => value ? `RM${Number(value).toFixed(2)}` : "—";
    const escapeHtml = (value) => `${value ?? ""}`.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));

    function showDashboard() {
        login.classList.add("hidden");
        dashboard.classList.remove("hidden");
        dashboard.classList.add("grid");
        loadCoupons();
    }

    function renderCoupons(coupons) {
        if (!coupons.length) {
            table.innerHTML = '<tr><td colspan="4" class="px-5 py-12 text-center text-slate-400"><i class="fa-solid fa-ticket mb-3 block text-2xl text-slate-300"></i>Belum ada coupon direkodkan.</td></tr>';
            return;
        }
        table.innerHTML = coupons.map((coupon) => {
            const expired = new Date(coupon.expiresAt).getTime() <= Date.now();
            const status = expired && coupon.status === "active" ? "expired" : coupon.status;
            const tone = status === "used" ? "bg-slate-100 text-slate-600" : status === "reserved" ? "bg-amber-100 text-amber-700" : status === "expired" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700";
            return `<tr class="border-t border-slate-100"><td class="px-5 py-4 sm:px-7"><strong class="font-mono text-afwaja-navy">${escapeHtml(coupon.code)}</strong><small class="mt-1 block text-xs text-slate-400">${escapeHtml(coupon.carName)}</small></td><td class="px-5 py-4"><strong>${escapeHtml(coupon.customerName)}</strong><small class="mt-1 block text-xs text-slate-400">${escapeHtml(coupon.customerPhone)}</small></td><td class="px-5 py-4 font-semibold text-afwaja-teal">${formatMoney(coupon.discountAmount)}</td><td class="px-5 py-4"><span class="rounded-full px-3 py-1 text-xs font-semibold capitalize ${tone}">${status}</span></td></tr>`;
        }).join("");
    }

    async function loadCoupons() {
        const response = await fetch("/api/admin/coupons");
        if (response.status === 401) { login.classList.remove("hidden"); dashboard.classList.add("hidden"); dashboard.classList.remove("grid"); return; }
        const result = await response.json().catch(() => ({}));
        renderCoupons(result.coupons || []);
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        loginError.classList.add("hidden");
        const response = await fetch("/api/admin/coupons/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: document.querySelector("#admin-password").value }) });
        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            loginError.textContent = result.error || "Login failed.";
            loginError.classList.remove("hidden");
            return;
        }
        showDashboard();
    });

    form.addEventListener("input", () => {
        const originalAmount = Number(form.elements.originalPrice.value);
        const discountAmount = Number(form.elements.discountAmount.value);
        if (originalAmount && Number.isFinite(discountAmount)) form.elements.dealPrice.value = Math.max(0, originalAmount - discountAmount).toFixed(2);
        original.textContent = formatMoney(form.elements.originalPrice.value);
        discount.textContent = formatMoney(form.elements.discountAmount.value);
        deal.textContent = formatMoney(form.elements.dealPrice.value);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button[type=submit]");
        button.disabled = true;
        button.textContent = "Creating...";
        try {
            const response = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Could not create coupon.");
            code.textContent = result.coupon.code;
            form.reset();
            original.textContent = discount.textContent = deal.textContent = "—";
            await loadCoupons();
        } catch (error) {
            window.alert(error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-ticket mr-2"></i>Generate coupon';
        }
    });

    loadCoupons();
})();
