const sitePages = [
    "batismo.html",
    "biblia.html",
    "breviario.html",
    "calendariolit.html",
    "comunhao.html",
    "confissao.html",
    "crisma.html",
    "extremauncao.html",
    "igreja.html",
    "index.html",
    "login.html",
    "matrimonio.html",
    "patristica.html",
    "sacramatri.html",
    "sacraordem.html",
    "santidade.html",
    "vocacoes.html"
];

const searchForm = document.getElementById("site-search");
const searchInput = document.getElementById("search");
const resultsList = document.querySelector(".itens");
const searchStatus = document.getElementById("search-status");
let pageIndexPromise;
let searchRevision = 0;

function normalizeText(value) {
    return value
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getPageTitle(document, path, contentRoot) {
    const heading = Array.from(contentRoot.querySelectorAll("h1, h2, h3"))
        .map(element => element.textContent.trim())
        .find(Boolean);
    const title = heading || document.title.trim();
    return title || path.replace(/\.html$/i, "");
}

async function fetchPage(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Falha ao carregar ${path}: HTTP ${response.status}`);
    }

    const html = await response.text();
    const pageDocument = new DOMParser().parseFromString(html, "text/html");
    pageDocument.querySelectorAll("script, style, noscript, header, nav, footer, form").forEach(element => element.remove());

    const contentRoot = pageDocument.querySelector("main") || pageDocument.body;
    const text = contentRoot.textContent.replace(/\s+/g, " ").trim();
    const excerpts = Array.from(contentRoot.querySelectorAll("p, li"))
        .map(element => element.textContent.replace(/\s+/g, " ").trim())
        .filter(Boolean);

    return {
        path,
        title: getPageTitle(pageDocument, path, contentRoot),
        text,
        excerpts,
        normalizedText: normalizeText(`${getPageTitle(pageDocument, path, contentRoot)} ${text}`)
    };
}

function loadPageIndex() {
    if (!pageIndexPromise) {
        pageIndexPromise = Promise.allSettled(sitePages.map(fetchPage)).then(results => {
            const pages = results
                .filter(result => result.status === "fulfilled")
                .map(result => result.value);
            const failures = results.filter(result => result.status === "rejected");

            failures.forEach(result => console.error("Não foi possível incluir uma página na pesquisa.", result.reason));
            if (pages.length === 0) {
                throw new Error("Nenhuma página do site pôde ser carregada para a pesquisa.");
            }

            return { pages, failures: failures.length };
        });
    }

    return pageIndexPromise;
}

function createResult(page, terms) {
    const result = document.createElement("a");
    result.className = "item";
    result.href = page.path;

    const content = document.createElement("div");
    content.className = "item-content";

    const title = document.createElement("p");
    title.className = "item-title";
    title.textContent = page.title;

    const description = document.createElement("p");
    description.className = "item-description";
    const matchingExcerpt = page.excerpts.find(excerpt => {
        const normalizedExcerpt = normalizeText(excerpt);
        return terms.every(term => normalizedExcerpt.includes(term));
    }) || page.excerpts.find(excerpt => {
        const normalizedExcerpt = normalizeText(excerpt);
        return terms.some(term => normalizedExcerpt.includes(term));
    });
    const excerpt = (matchingExcerpt || page.text).trim();
    description.textContent = excerpt.length > 220 ? `${excerpt.slice(0, 217).trim()}...` : excerpt;

    content.append(title, description);
    result.append(content);
    return result;
}

async function updateResults(query) {
    const revision = ++searchRevision;
    const terms = normalizeText(query).split(" ").filter(Boolean);
    resultsList.replaceChildren();

    if (terms.length === 0) {
        resultsList.style.display = "none";
        searchStatus.textContent = "";
        return;
    }

    resultsList.style.display = "flex";
    searchStatus.textContent = "Pesquisando em todas as páginas...";

    try {
        const { pages, failures } = await loadPageIndex();
        if (revision !== searchRevision) {
            return;
        }

        const matches = pages.filter(page =>
            terms.every(term => page.normalizedText.includes(term))
        );

        if (matches.length === 0) {
            const noResults = document.createElement("p");
            noResults.className = "no-results";
            noResults.textContent = "Nenhuma página encontrada para essa busca.";
            resultsList.append(noResults);
        } else {
            matches.forEach(page => resultsList.append(createResult(page, terms)));
        }

        const pageCount = pages.length;
        searchStatus.textContent = `${matches.length} página(s) encontrada(s) entre ${pageCount} pesquisada(s).`;
        if (failures > 0) {
            searchStatus.textContent += ` ${failures} página(s) não puderam ser carregadas.`;
        }
    } catch (error) {
        if (revision !== searchRevision) {
            return;
        }

        console.error("A pesquisa do site não pôde ser concluída.", error);
        searchStatus.textContent = "Não foi possível carregar as páginas. Verifique a conexão e tente novamente.";
    }
}

searchInput.addEventListener("input", () => updateResults(searchInput.value));
searchForm.addEventListener("submit", event => {
    event.preventDefault();
    updateResults(searchInput.value);
});

const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
searchInput.value = initialQuery;
if (initialQuery) {
    updateResults(initialQuery);
}
