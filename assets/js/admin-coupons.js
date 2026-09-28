(() => {
    const form = document.querySelector("#coupon-form");
    const code = document.querySelector("#coupon-code");
    const original = document.querySelector("#preview-original");
    const deal = document.querySelector("#preview-deal");
    const formatMoney = (value) => value ? `RM${Number(value).toFixed(2)}` : "—";

    form.addEventListener("input", () => {
        original.textContent = formatMoney(form.elements.originalPrice.value);
        deal.textContent = formatMoney(form.elements.dealPrice.value);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
        code.textContent = `WS-DEAL-${suffix}`;
    });
})();
