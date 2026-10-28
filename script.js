"use strict";

const cities = [
  ["Abadia dos Dourados", "MG"], ["Abaeté dos Mendes", "MG"], ["Água Comprida", "MG"],
  ["Alexandrita", "MG"], ["Aparecida de Minas", "MG"], ["Araguari", "MG"],
  ["Araporã", "MG"], ["Arapuá", "MG"], ["Araxá", "MG"], ["Arinos", "MG"],
  ["Bonfinópolis de Minas", "MG"], ["Brasilândia de Minas", "MG"], ["Buritis", "MG"],
  ["Cabeceira Grande", "MG"], ["Cachoeira Dourada", "MG"], ["Campina Verde", "MG"],
  ["Campo Florido", "MG"], ["Campos Altos", "MG"], ["Canápolis", "MG"], ["Capinópolis", "MG"],
  ["Carmo do Paranaíba", "MG"], ["Carneirinho", "MG"], ["Cascalho Rico", "MG"], ["Catalão", "GO"],
  ["Centralina", "MG"], ["Chaveslândia", "MG"], ["Comendador Gomes", "MG"],
  ["Conceição das Alagoas", "MG"], ["Conquista", "MG"], ["Coromandel", "MG"],
  ["Cruzeiro da Fortaleza", "MG"], ["Delta", "MG"], ["Dom Bosco", "MG"],
  ["Douradoquara", "MG"], ["Estrela do Sul", "MG"], ["Formoso", "MG"], ["Frutal", "MG"],
  ["Grupiara", "MG"], ["Guarda-Mor", "MG"], ["Guimarânia", "MG"], ["Gurinhatã", "MG"],
  ["Ibiá", "MG"], ["Indianópolis", "MG"], ["Ipiaçu", "MG"], ["Iraí de Minas", "MG"],
  ["Itapagipe", "MG"], ["Ituiutaba", "MG"], ["Itumbiara", "GO"], ["Iturama", "MG"],
  ["João Pinheiro", "MG"], ["Lagamar", "MG"], ["Lagoa Formosa", "MG"], ["Lagoa Grande", "MG"],
  ["Limeira do Oeste", "MG"], ["Luizlândia do Oeste", "MG"], ["Matutina", "MG"],
  ["Monte Alegre de Minas", "MG"], ["Monte Carmelo", "MG"], ["Natalândia", "MG"],
  ["Nova Ponte", "MG"], ["Patos de Minas", "MG"], ["Patrocínio", "MG"], ["Pedrinópolis", "MG"],
  ["Perdizes", "MG"], ["Pirajuba", "MG"], ["Planura", "MG"], ["Ponte Firme", "MG"],
  ["Prata", "MG"], ["Pratinha", "MG"], ["Presidente Olegário", "MG"], ["Riachinho", "MG"],
  ["Rio Paranaíba", "MG"], ["Romaria", "MG"], ["Sacramento", "MG"], ["Santa Juliana", "MG"],
  ["Santa Rosa da Serra", "MG"], ["Santa Vitória", "MG"], ["São Francisco de Sales", "MG"],
  ["São Gonçalo do Abaeté", "MG"], ["São Gotardo", "MG"], ["São Sebastião do Pontal", "MG"],
  ["Serra do Salitre", "MG"], ["Tapira", "MG"], ["Tapuirama", "MG"], ["Tiros", "MG"],
  ["Tupaciguara", "MG"], ["Uberaba", "MG"], ["Uberlândia", "MG"], ["Unaí", "MG"],
  ["União de Minas", "MG"], ["Uruana de Minas", "MG"], ["Urucuia", "MG"],
  ["Varjão de Minas", "MG"], ["Vazante", "MG"], ["Veríssimo", "MG"]
].map(([name, state]) => ({ name, state }));

const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const citySearch = document.querySelector("#city-search");
const cityList = document.querySelector("#city-list");
const cityCount = document.querySelector("#city-count");
const loadMore = document.querySelector("#load-more");
const filters = document.querySelectorAll(".filter");
let selectedState = "all";
let visibleCount = 12;

function renderCities() {
  const query = normalize(citySearch.value);
  const matches = cities.filter((city) =>
    (selectedState === "all" || city.state === selectedState) &&
    normalize(`${city.name} ${city.state}`).includes(query)
  );
  const fragment = document.createDocumentFragment();
  for (const city of matches.slice(0, visibleCount)) {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const state = document.createElement("span");
    name.textContent = city.name;
    state.textContent = city.state;
    state.className = "city-state";
    item.append(name, state);
    fragment.append(item);
  }
  cityList.replaceChildren(fragment);
  cityCount.textContent = `${matches.length} ${matches.length === 1 ? "localidade" : "localidades"}`;
  document.querySelector("#city-empty").hidden = matches.length > 0;
  loadMore.hidden = visibleCount >= matches.length;
}

citySearch.addEventListener("input", () => {
  visibleCount = 12;
  renderCities();
});
filters.forEach((button) => button.addEventListener("click", () => {
  selectedState = button.dataset.state;
  visibleCount = 12;
  filters.forEach((filter) => {
    const active = filter === button;
    filter.classList.toggle("active", active);
    filter.setAttribute("aria-pressed", String(active));
  });
  renderCities();
}));
loadMore.addEventListener("click", () => {
  const previousCount = cityList.children.length;
  visibleCount += 12;
  renderCities();
  cityList.children[previousCount]?.scrollIntoView({ block: "nearest", behavior: "auto" });
  if (loadMore.hidden) {
    const lastItem = cityList.lastElementChild;
    if (lastItem) {
      lastItem.tabIndex = -1;
      lastItem.focus({ preventScroll: true });
    }
  }
});
document.querySelector("#download-cities").addEventListener("click", () => {
  const csv = "\uFEFFLocalidade;UF\r\n" + cities.map((city) => `${city.name};${city.state}`).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "agiliza-cargas-cobertura.csv";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
renderCities();

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
function closeMenu() {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav.classList.contains("open")) {
    closeMenu();
    menuToggle.focus();
  }
});
matchMedia("(min-width: 851px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const bases = {
  guarulhos: {
    badge: "EXPANSÃO ESTRATÉGICA", code: "GRU / SP", title: "Um novo ponto de partida.",
    description: "Nossa base em Cumbica aproxima a Agiliza dos principais hubs logísticos do eixo paulista, ampliando as possibilidades de conexão com parceiros e mercados regionais.",
    features: ["Conexão com o eixo paulista", "Apoio à integração da operação", "Novos negócios e parcerias estratégicas"],
    address: "Av. Papa João Paulo, 1", location: "Cumbica · Guarulhos · São Paulo",
    map: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Av. Papa João Paulo, 1, Cumbica, Guarulhos, SP")
  },
  uberlandia: {
    badge: "PRESENÇA REGIONAL", code: "UDI / MG", title: "Nossa origem. Sua conexão regional.",
    description: "Uberlândia permanece como referência regional da Agiliza. O conhecimento das praças e a proximidade com os parceiros apoiam a rede de atendimento em Minas Gerais e Goiás.",
    features: ["Referência regional consolidada", "Cobertura em Minas Gerais e Goiás", "Suporte operacional integrado à base de Guarulhos"],
    address: "Uberlândia · Minas Gerais", location: "Consulte nossa equipe para o endereço e orientações de acesso.",
    map: null
  }
};
document.querySelectorAll(".base-option").forEach((button) => button.addEventListener("click", () => {
  const base = bases[button.dataset.base];
  document.querySelectorAll(".base-option").forEach((option) => {
    const active = option === button;
    option.classList.toggle("active", active);
    option.setAttribute("aria-pressed", String(active));
  });
  const fields = { badge: "#base-badge", code: "#base-code", title: "#base-title", description: "#base-description", address: "#base-address-title", location: "#base-address-subtitle" };
  Object.entries(fields).forEach(([key, selector]) => {
    document.querySelector(selector).textContent = base[key];
  });
  const features = base.features.map((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    return item;
  });
  document.querySelector("#base-features").replaceChildren(...features);
  const mapLink = document.querySelector("#base-map");
  mapLink.hidden = !base.map;
  if (base.map) mapLink.href = base.map;
  else mapLink.removeAttribute("href");
}));

const solutions = {
  regional: {
    title: "Transporte regional",
    description: "Conhecimento de cada praça e proximidade com sua operação. A rede da Agiliza conecta localidades de Minas Gerais e Goiás a novas oportunidades de negócio.",
    features: ["Atendimento regional em MG e GO", "Uberlândia como referência da rede", "Consulta de cobertura por localidade"],
    interest: "Transporte regional"
  },
  distribuicao: {
    title: "Distribuição e capilaridade",
    description: "Uma rede abrangente para apoiar os fluxos de distribuição da sua empresa, com conhecimento regional e atendimento personalizado.",
    features: ["95 localidades identificadas no material institucional", "Presença no interior de Minas Gerais", "Conexões com Catalão e Itumbiara, em Goiás"],
    interest: "Distribuição e capilaridade"
  },
  integracao: {
    title: "Integração entre bases",
    description: "Dois pontos estratégicos, uma visão integrada. A nova base em Guarulhos se soma à referência regional de Uberlândia e aproxima a operação do eixo paulista.",
    features: ["Guarulhos: conexão com o eixo paulista", "Uberlândia: referência para a rede em MG e GO", "Integração operacional e comercial"],
    interest: "Integração entre bases"
  },
  parcerias: {
    title: "Parcerias e novos negócios",
    description: "Crescer é conectar possibilidades. A expansão da Agiliza cria espaço para desenvolver novas relações comerciais e avaliar novos fluxos logísticos com parceiros.",
    features: ["Atendimento próximo e personalizado", "Desenvolvimento de oportunidades em conjunto", "Conexões entre parceiros e mercados regionais"],
    interest: "Parceria comercial"
  }
};
const solutionDialog = document.querySelector("#solution-dialog");
let currentInterest = "";
document.querySelectorAll(".solution-more").forEach((button) => button.addEventListener("click", () => {
  const solution = solutions[button.dataset.solution];
  currentInterest = solution.interest;
  document.querySelector("#solution-title").textContent = solution.title;
  document.querySelector("#solution-description").textContent = solution.description;
  document.querySelector("#solution-features").replaceChildren(...solution.features.map((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    return item;
  }));
  solutionDialog.showModal();
  document.body.classList.add("dialog-open");
}));
document.querySelector(".dialog-close").addEventListener("click", () => solutionDialog.close());
solutionDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    solutionDialog.close();
  }
});
solutionDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
solutionDialog.addEventListener("click", (event) => {
  if (event.target === solutionDialog) {
    const rect = solutionDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) solutionDialog.close();
  }
});
document.querySelector("#solution-contact").addEventListener("click", () => {
  document.querySelector("#interest").value = currentInterest;
  invalidateQuote();
  solutionDialog.close();
});

const quoteForm = document.querySelector("#quote-form");
const quoteResult = document.querySelector("#quote-result");
const quoteLink = document.querySelector("#quote-link");
function invalidateQuote() {
  quoteResult.hidden = true;
  quoteLink.removeAttribute("href");
}
quoteForm.addEventListener("input", invalidateQuote);
quoteForm.addEventListener("change", invalidateQuote);
const nameField = document.querySelector("#name");
nameField.addEventListener("input", () => nameField.setCustomValidity(""));
quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!nameField.value.trim()) {
    nameField.setCustomValidity("Informe seu nome para preparar a solicitação.");
    nameField.reportValidity();
    return;
  }
  const data = new FormData(quoteForm);
  const value = (key) => String(data.get(key) || "").trim();
  const lines = [
    "Olá, equipe Agiliza Cargas!",
    `Meu nome é ${value("name")}.`,
    value("company") ? `Empresa: ${value("company")}` : "",
    `Assunto: ${value("interest")}`,
    value("origin") ? `Origem: ${value("origin")}` : "",
    value("destination") ? `Destino: ${value("destination")}` : "",
    value("message") ? `Detalhes: ${value("message")}` : "",
    "Gostaria de conversar sobre essa necessidade."
  ].filter(Boolean);
  quoteLink.href = `https://wa.me/5534992143750?text=${encodeURIComponent(lines.join("\n"))}`;
  quoteResult.hidden = false;
  quoteLink.focus({ preventScroll: true });
  quoteResult.scrollIntoView({ block: "nearest", behavior: "auto" });
});
document.querySelector("#year").textContent = String(new Date().getFullYear());

if ("IntersectionObserver" in window) {
  const links = [...mainNav.querySelectorAll('a[href^="#"]')];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
  links.forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) observer.observe(section);
  });
}
