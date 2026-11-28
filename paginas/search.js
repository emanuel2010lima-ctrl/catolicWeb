const sitePages = [
    "batismo.html", "biblia.html", "breviario.html", "calendariolit.html",
    "comunhao.html", "confissao.html", "crisma.html", "extremauncao.html",
    "igreja.html", "index.html", "matrimonio.html", "patristica.html",
    "sacramatri.html", "sacraordem.html", "santidade.html", "vocacoes.html",
    "perfil.html", "rotina.html"
];

const searchForm = document.getElementById("site-search");
const searchInput = document.getElementById("search");
const resultsList = document.querySelector(".itens");
const searchStatus = document.getElementById("search-status");
let pageIndexPromise;
let searchRevision = 0;

function normalizeText(value) {
    return value.toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getPageTitle(pageDocument, path, contentRoot) {
    const heading = Array.from(contentRoot.querySelectorAll("h1, h2, h3"))
        .map(element => element.textContent.trim())
        .find(Boolean);
    return heading || pageDocument.title.trim() || path.replace(/\.html$/i, "");
}

function getSearchableBlocks(contentRoot) {
    return Array.from(contentRoot.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, dt, dd"))
        .filter(element => element.textContent.trim() && !element.closest("header, nav, footer, form"));
}

async function fetchPage(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Falha ao carregar ${path}: HTTP ${response.status}`);
    const pageDocument = new DOMParser().parseFromString(await response.text(), "text/html");
    pageDocument.querySelectorAll("script, style, noscript, header, nav, footer, form").forEach(element => element.remove());
    const contentRoot = pageDocument.querySelector("main") || pageDocument.body;
    const title = getPageTitle(pageDocument, path, contentRoot);
    const searchableElements = getSearchableBlocks(contentRoot);
    const blocks = searchableElements.map((element, index) => {
        const text = element.textContent.replace(/\s+/g, " ").trim();
        return {
            text,
            normalizedText: normalizeText(text),
            index,
            referenceId: element.closest("blockquote")?.id || (element.tagName === "BLOCKQUOTE" ? element.id : "")
        };
    });
    return { path, title, blocks };
}

function loadPageIndex() {
    if (!pageIndexPromise) {
        pageIndexPromise = Promise.allSettled(sitePages.map(fetchPage)).then(results => {
            const pages = results.filter(result => result.status === "fulfilled").map(result => result.value);
            const failures = results.filter(result => result.status === "rejected");
            failures.forEach(result => console.error("Não foi possível incluir uma página na pesquisa.", result.reason));
            if (!pages.length) throw new Error("Nenhuma página do site pôde ser carregada para a pesquisa.");
            return { pages, failures: failures.length };
        });
    }
    return pageIndexPromise;
}

function findMatchingBlocks(page, terms) {
    return page.blocks
        .map(block => ({ ...block, score: terms.filter(term => block.normalizedText.includes(term)).length }))
        .filter(block => block.score > 0)
        .sort((a, b) => b.score - a.score);
}

function createResult(page, block) {
    const result = document.createElement("a");
    result.className = "item";
    const targetUrl = new URL(page.path, window.location.href);
    if (block.referenceId) {
        targetUrl.searchParams.delete("texto");
        targetUrl.hash = block.referenceId;
    } else {
        targetUrl.searchParams.set("texto", block.text);
    }
    result.href = targetUrl.href;
    result.setAttribute("aria-label", `Ir para o trecho encontrado em ${page.title}`);
    const content = document.createElement("span");
    content.className = "item-content";
    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = page.title;
    const description = document.createElement("span");
    description.className = "item-description";
    description.textContent = block.text.length > 220 ? `${block.text.slice(0, 217).trim()}...` : block.text;
    const action = document.createElement("span");
    action.className = "item-action";
    action.textContent = "Abrir texto completo  ›";
    content.append(title, description, action);
    result.append(content);
    return result;
}

async function updateResults(query) {
    const revision = ++searchRevision;
    const terms = normalizeText(query).split(" ").filter(Boolean);
    resultsList.replaceChildren();
    if (!terms.length) {
        resultsList.style.display = "none";
        searchStatus.textContent = "";
        return;
    }
    resultsList.style.display = "flex";
    searchStatus.textContent = "Pesquisando em todas as páginas...";
    try {
        const { pages, failures } = await loadPageIndex();
        if (revision !== searchRevision) return;
        const occurrences = pages.flatMap(page => findMatchingBlocks(page, terms).map(block => ({ page, block })));
        if (!occurrences.length) {
            const noResults = document.createElement("p");
            noResults.className = "no-results";
            noResults.textContent = "Nenhum trecho encontrado para essa busca.";
            resultsList.append(noResults);
        } else {
            occurrences.forEach(({ page, block }) => resultsList.append(createResult(page, block)));
        }
        searchStatus.textContent = `${occurrences.length} trecho(s) encontrado(s) em ${pages.length} página(s) pesquisada(s).`;
        if (failures) searchStatus.textContent += ` ${failures} página(s) não puderam ser carregadas.`;
    } catch (error) {
        if (revision !== searchRevision) return;
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
if (initialQuery) updateResults(initialQuery);
