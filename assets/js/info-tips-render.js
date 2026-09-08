(function () {
    const storageKey = "afwaja-language";
    const pageSize = 4;

    function currentLanguage() {
        try {
            return window.localStorage?.getItem(storageKey) === "en" ? "en" : "ms";
        } catch (error) {
            return "ms";
        }
    }

    function text(value) {
        if (!value || typeof value === "string") {
            return value || "";
        }

        return value[currentLanguage()] || value.ms || "";
    }

    function articlePath(article) {
        return `/info-tips/${article.slug}`;
    }

    function setMeta(selector, attribute, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute(attribute, value);
        }
    }

    function setCanonical(url) {
        let canonical = document.querySelector("link[rel='canonical']");
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", url);
    }

    function renderCard(article) {
        return `
            <a href="${articlePath(article)}" class="group rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm hover:-translate-y-1 hover:border-afwaja-teal hover:shadow-xl transition">
                <div class="mb-4 aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 to-slate-100 p-2">
                    <img class="h-full w-full rounded-xl object-contain transition group-hover:scale-105" src="${article.image}" alt="${article.alt}" loading="lazy">
                </div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-afwaja-teal">${text(article.category)}</p>
                <h2 class="mt-3 text-xl font-bold text-afwaja-navy">${text(article.cardTitle)}</h2>
                <p class="mt-2 text-sm text-slate-500">${text(article.excerpt)}</p>
            </a>
        `;
    }

    function renderPagination(activePage, pageCount) {
        const labels = { previous: { ms: "Sebelumnya", en: "Previous" }, next: { ms: "Seterusnya", en: "Next" } };
        const pageHref = (page) => page === 1 ? "/info-tips" : `/info-tips/page/${page}`;
        const pageLinks = Array.from({ length: pageCount }, (_, index) => {
            const page = index + 1;
            const active = page === activePage;
            return `<a href="${pageHref(page)}" class="rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-afwaja-navy text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-afwaja-teal hover:text-afwaja-teal"}">${page}</a>`;
        }).join("");

        return `
            <div class="mt-10 flex flex-wrap items-center justify-between gap-3">
                <a href="${pageHref(Math.max(1, activePage - 1))}" class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-afwaja-teal hover:text-afwaja-teal ${activePage === 1 ? "pointer-events-none opacity-40" : ""}">${text(labels.previous)}</a>
                <div class="flex flex-wrap items-center gap-2">${pageLinks}</div>
                <a href="${pageHref(Math.min(pageCount, activePage + 1))}" class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-afwaja-teal hover:text-afwaja-teal ${activePage === pageCount ? "pointer-events-none opacity-40" : ""}">${text(labels.next)}</a>
            </div>
        `;
    }

    function renderListing() {
        const root = document.getElementById("info-tips-list");
        if (!root) {
            return;
        }

        const articles = window.AfwajaInfoTips || [];
        const pageMatch = window.location.pathname.match(/\/info-tips\/page\/(\d+)/);
        const activePage = pageMatch ? Number.parseInt(pageMatch[1], 10) : (Number.parseInt(root.dataset.page || "1", 10) || 1);
        const pageCount = Math.ceil(articles.length / pageSize);
        const start = (activePage - 1) * pageSize;
        const visibleArticles = articles.slice(start, start + pageSize);
        const rangeText = currentLanguage() === "en"
            ? `Showing articles ${start + 1}-${Math.min(start + pageSize, articles.length)} of ${articles.length}`
            : `Paparan artikel ${start + 1}-${Math.min(start + pageSize, articles.length)} daripada ${articles.length}`;

        root.innerHTML = `
            <div class="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p class="text-xs font-bold uppercase tracking-[0.2em] text-afwaja-teal">Content hub</p>
                    <h2 class="mt-2 text-2xl font-bold text-afwaja-navy">${currentLanguage() === "en" ? "Latest articles" : "Artikel terbaru"}</h2>
                </div>
                <p class="text-sm text-slate-500">${rangeText}</p>
            </div>
            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                ${visibleArticles.map(renderCard).join("")}
            </div>
            ${renderPagination(activePage, pageCount)}
        `;

        const schema = {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Useful Info & Tips Afwaja",
            url: "https://www.afwajarental.my/info-tips",
            publisher: {
                "@type": "AutoRental",
                name: "Afwaja Car Rental",
                url: "https://www.afwajarental.my/",
            },
            blogPost: articles.map((article) => ({
                "@type": "BlogPosting",
                headline: text(article.title),
                url: `https://www.afwajarental.my${articlePath(article)}`,
                inLanguage: currentLanguage() === "en" ? "en-MY" : "ms-MY",
            })),
        };
        const existing = document.getElementById("info-tips-blog-schema");
        const script = existing || document.createElement("script");
        script.id = "info-tips-blog-schema";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema);
        if (!existing) {
            document.head.appendChild(script);
        }
    }

    function renderArticleSchema(article) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: text(article.title),
            image: `https://www.afwajarental.my${article.image}`,
            url: `https://www.afwajarental.my${articlePath(article)}`,
            inLanguage: currentLanguage() === "en" ? "en-MY" : "ms-MY",
            publisher: {
                "@type": "AutoRental",
                name: "Afwaja Car Rental",
                url: "https://www.afwajarental.my/",
            },
        };
        const existing = document.getElementById("info-tips-article-schema");
        const script = existing || document.createElement("script");
        script.id = "info-tips-article-schema";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema);
        if (!existing) {
            document.head.appendChild(script);
        }
    }

    function renderArticle() {
        const root = document.getElementById("info-tips-article");
        if (!root) {
            return;
        }

        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const slug = document.body.dataset.articleSlug || pathParts[pathParts.length - 1];
        const article = (window.AfwajaInfoTips || []).find((entry) => entry.slug === slug);
        if (!article) {
            root.innerHTML = `<section class="py-20"><div class="max-w-4xl mx-auto px-4"><h1 class="text-3xl font-bold text-afwaja-navy">Article not found</h1><a class="mt-6 inline-flex rounded-2xl bg-afwaja-navy px-5 py-3 text-white" href="/info-tips">Back to Info & Tips</a></div></section>`;
            return;
        }

        document.title = `${text(article.title)} | Afwaja Car Rental`;
        const articleUrl = `https://www.afwajarental.my${articlePath(article)}`;
        setCanonical(articleUrl);
        setMeta("meta[name='description']", "content", text(article.excerpt));
        setMeta("meta[property='og:title']", "content", `${text(article.title)} | Afwaja Car Rental`);
        setMeta("meta[property='og:description']", "content", text(article.excerpt));
        setMeta("meta[property='og:image']", "content", `https://www.afwajarental.my${article.image}`);
        setMeta("meta[property='og:url']", "content", articleUrl);
        renderArticleSchema(article);
        root.innerHTML = `
            <section class="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-slate-50 py-16 md:py-20">
                <div class="hero-grid-pattern absolute inset-0 opacity-70"></div>
                <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <a href="/info-tips" class="inline-flex items-center gap-2 text-sm font-semibold text-afwaja-teal hover:text-afwaja-navy">
                        <i class="fas fa-arrow-left"></i>
                        ${currentLanguage() === "en" ? "Back to Useful Info & Tips" : "Kembali ke Useful Info & Tips"}
                    </a>
                    <p class="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-afwaja-teal">${text(article.category)}</p>
                    <h1 class="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-afwaja-navy">${text(article.title)}</h1>
                    <p class="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">${text(article.excerpt)}</p>
                    <div class="mt-8 aspect-video overflow-hidden rounded-[1.5rem] bg-white p-2 shadow-xl md:p-3">
                        <img class="h-full w-full rounded-[1.15rem] object-contain" src="${article.image}" alt="${article.alt}" loading="eager">
                    </div>
                </div>
            </section>
            <section class="py-14 md:py-16 bg-white">
                <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:p-9 shadow-sm">
                    ${article.body.map((block) => block.type === "h3"
                        ? `<h3 class="mt-7 text-xl font-bold text-afwaja-navy">${text(block)}</h3>`
                        : `<p class="mt-4 leading-relaxed">${text(block)}</p>`).join("")}
                    <div class="mt-7 rounded-3xl bg-white p-5 border border-cyan-100">
                        <p class="font-semibold text-afwaja-navy">${currentLanguage() === "en" ? "Related topics:" : "Topik berkaitan:"}</p>
                        <p class="mt-2 text-sm text-slate-500">${text(article.tags)}</p>
                    </div>
                    <div class="mt-7 flex flex-wrap gap-3">
                        ${article.ctas.map((cta, index) => `
                            <a href="${cta.href}" class="inline-flex items-center gap-2 rounded-2xl ${index === 0 ? "bg-afwaja-navy text-white hover:bg-afwaja-teal" : "border border-slate-200 bg-white text-slate-700 hover:border-afwaja-teal hover:text-afwaja-teal"} px-5 py-3 text-sm font-semibold transition">
                                <i class="${cta.icon}"></i>
                                ${text(cta.label)}
                            </a>
                        `).join("")}
                    </div>
                </article>
            </section>
        `;
    }

    function render() {
        renderListing();
        renderArticle();
    }

    document.addEventListener("DOMContentLoaded", () => {
        render();
        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.addEventListener("click", () => window.setTimeout(render, 0));
        });
    });
})();
