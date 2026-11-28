(() => {
    const params = new URLSearchParams(window.location.search);
    const targetText = params.get("texto");
    const targetIndex = Number(params.get("trecho"));
    if (!targetText && (!Number.isInteger(targetIndex) || targetIndex < 0)) return;

    const normalize = value => value.toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const navigateToMatch = () => {
        const contentRoot = document.querySelector("main") || document.body;
        const blocks = Array.from(contentRoot.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, dt, dd"))
            .filter(element => element.textContent.trim() && !element.closest("header, nav, footer, form"));
        const normalizedTarget = targetText ? normalize(targetText) : "";
        const target = (normalizedTarget && blocks.find(element => normalize(element.textContent) === normalizedTarget))
            || (normalizedTarget && blocks.find(element => normalize(element.textContent).includes(normalizedTarget)))
            || blocks[targetIndex];
        if (!target) return;

        const style = document.createElement("style");
        style.textContent = ".search-target-highlight { outline: 3px solid #d4af37; background: rgba(212, 175, 55, .22); transition: background .3s ease; }";
        document.head.append(style);
        target.classList.add("search-target-highlight");
        target.tabIndex = -1;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.focus({ preventScroll: true });
        window.setTimeout(() => target.classList.remove("search-target-highlight"), 5000);
    };

    if (document.readyState === "complete") {
        window.setTimeout(navigateToMatch, 100);
    } else {
        window.addEventListener("load", () => window.setTimeout(navigateToMatch, 100), { once: true });
    }
})();
