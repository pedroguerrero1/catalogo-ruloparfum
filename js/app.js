const WHATSAPP_NUMBER = "5493535669706";

function imgSrc(path){
  const clean = (path || "").replace(/^\/+/, "");
  return new URL(clean, document.baseURI).toString();
}

const grid = document.getElementById("grid");
const decantsGrid = document.getElementById("decantsGrid");
const promosGrid = document.getElementById("promosGrid");
const desodorantsGrid = document.getElementById("desodorantsGrid");

const search = document.getElementById("search");
const filter = document.getElementById("filter");
const empty = document.getElementById("empty");

let perfumes = [];
let decants = [];
let promos = [];
let desodorantes = [];

function moneyARS(n){
  return new Intl.NumberFormat("es-AR").format(n);
}

function waLink(perfume){
  const precioTexto = perfume.stock === false ? "Sin stock" : `$${moneyARS(perfume.precio)}`;

  const msg =
`Hola!
Vi en la web el *${perfume.nombre}* (${perfume.ml}ml - ${perfume.tipo}) por ${precioTexto}.
¿Lo tenés disponible?`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function cardTemplate(p){
  const placeholder = imgSrc("img/placeholder.webp");

  return `
    <article class="card">
      <div class="thumb">
        <img src="${imgSrc(p.imagen)}"
             alt="${p.nombre}"
             onerror="this.onerror=null; this.src='${placeholder}'">
      </div>

      <div class="content">
        <div class="card__info">
          <div class="row">
            <div>
              <div class="name">${p.nombre}</div>
              <div class="meta">
                <span class="badge">${p.marca || "-"}</span>
                <span class="badge">${p.genero || "-"}</span>
                <span class="badge">${p.tipo || "-"}</span>
                <span class="badge">${p.ml || "-"}ml</span>
              </div>
            </div>
          </div>

          <div class="price">
            ${p.stock === false ? "Sin stock" : "$" + moneyARS(p.precio)}
          </div>
        </div>

        <div class="card__actions">
          <button class="btn" data-open="${p.id}" style="background: rgba(212,162,76,.12); border: 1px solid rgba(212,162,76,.30); color: var(--text);">
            Ver detalle
          </button>

          <a class="btn btn--wa" href="${waLink(p)}" target="_blank" rel="noopener">
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

function categoryTemplate(c){
  return `
    <article class="category-card">
      <a href="${c.link}">
        <div class="thumb">
          <img src="${c.imagen}" alt="${c.nombre}">
        </div>
        <h2>${c.nombre}</h2>
      </a>
    </article>
  `;
}

const categorias = [
  {
    nombre: "Perfumes",
    imagen: "img/categorias/perfumes.webp",
    link: "#perfumes"
  },
  {
    nombre: "Decants",
    imagen: "img/categorias/decants.webp",
    link: "#decants"
  },
  {
    nombre: "Promos",
    imagen: "img/categorias/promos.webp",
    link: "#promos"
  },
  {
    nombre: "Desodorantes",
    imagen: "img/categorias/desodorantes.webp",
    link: "#desodorantes"
  }
];


function renderCategories(categorias){
  const container = document.querySelector(".home-categories");
  container.innerHTML = categorias.map(categoryTemplate).join("");
}

renderCategories(categorias);

function renderPerfumes(list){
  grid.innerHTML = list.map(cardTemplate).join("");
  empty.classList.toggle("hidden", list.length !== 0);
}

function renderDecants(list){
  if (!decantsGrid) return;
  decantsGrid.innerHTML = list
    .filter(p => p.activo !== false)
    .map(cardTemplate)
    .join("");
}

function renderPromos(list){
  if (!promosGrid) return;
  promosGrid.innerHTML = list
    .filter(p => p.activo !== false)
    .map(cardTemplate)
    .join("");
}

function renderDesodorantes(list){
  if (!desodorantsGrid) return;
  desodorantsGrid.innerHTML = list
    .filter(p => p.activo !== false)
    .map(cardTemplate)
    .join("");
}

function render(list){
  renderPerfumes(list);
}

// ===== MODAL =====
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");

const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalBadges = document.getElementById("modalBadges");
const modalDesc = document.getElementById("modalDesc");
const modalDur = document.getElementById("modalDur");
const modalEstela = document.getElementById("modalEstela");
const modalWa = document.getElementById("modalWa");

function openModal(p){
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const PLACEHOLDER = imgSrc("img/placeholder.webp");

  modalImg.onerror = null;
  modalImg.src = imgSrc(p.imagen);
  modalImg.alt = p.nombre;

  modalImg.onerror = function(){
    this.onerror = null;
    this.src = PLACEHOLDER;
  };

  modalTitle.textContent = p.nombre;
  modalPrice.textContent = p.stock === false ? "Sin stock" : `$${moneyARS(p.precio)}`;

  modalBadges.innerHTML = `
    <span class="badge">${p.marca || "-"}</span>
    <span class="badge">${p.genero || "-"}</span>
    <span class="badge">${p.tipo || "-"}</span>
    <span class="badge">${p.ml || "-"}ml</span>
  `;

  modalDesc.textContent = p.descripcion || "Consultá disponibilidad y envíos por WhatsApp.";

  document.getElementById("notas-salida").textContent = p.notas_salida || "-";
  document.getElementById("notas-corazon").textContent = p.notas_corazon || "-";
  document.getElementById("notas-fondo").textContent = p.notas_fondo || "-";

  modalDur.textContent = p.duracion || "-";
  modalEstela.textContent = p.estela || "-";

  modalWa.href = waLink(p);
}

function closeModal(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  if (e.target && (e.target.id === "modalClose" || e.target.closest("#modalClose"))) {
    closeModal();
    return;
  }

  const isBackdrop = e.target && e.target.classList && e.target.classList.contains("modal__backdrop");
  if (isBackdrop) {
    closeModal();
    return;
  }

  const btn = e.target.closest("[data-open]");
  if (!btn) return;

  const id = Number(btn.dataset.open);
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
  const p = todos.find(x => x.id === id);

  if (p) openModal(p);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

function applyFilters(){
  const q = (search?.value || "").trim().toLowerCase();
  const f = (filter?.value || "all");

  let list = (perfumes || []).filter(p => {
    if (p.activo === false) return false;

    const nombre = (p.nombre || "").toLowerCase();
    const marca = (p.marca || "").toLowerCase();

    return nombre.includes(q) || marca.includes(q);
  });

  if (f === "hombre" || f === "mujer" || f === "unisex") {
    list = list.filter(p => (p.genero || "").toLowerCase() === f);
  }

  if (f === "asc" || f === "desc") {
    list.sort((a, b) => {
      const pa = Number(String(a.precio).replace(/\D/g, "")) || 0;
      const pb = Number(String(b.precio).replace(/\D/g, "")) || 0;
      return f === "asc" ? pa - pb : pb - pa;
    });
  }

  render(list);
}

async function init(){
  document.getElementById("year").textContent = new Date().getFullYear();

  try {
    const resPerfumes = await fetch("data/perfumes.json");
    if (!resPerfumes.ok) throw new Error("No se pudo cargar perfumes.json");
    perfumes = await resPerfumes.json();

    try {
      const resDecants = await fetch("data/decants.json");
      if (resDecants.ok) decants = await resDecants.json();
    } catch (e) {
      console.log("decants.json no cargó");
    }

    try {
      const resPromos = await fetch("data/promos.json");
      if (resPromos.ok) promos = await resPromos.json();
    } catch (e) {
      console.log("promos.json no cargó");
    }

    try {
      const resDesodorantes = await fetch("data/desodorantes.json");
      if (resDesodorantes.ok) desodorantes = await resDesodorantes.json();
    } catch (e) {
      console.log("desodorantes.json no cargó");
    }

    renderPerfumes(perfumes.filter(p => p.activo !== false));
    renderDecants(decants);
    renderPromos(promos);
    renderDesodorantes(desodorantes);

    if (search) search.addEventListener("input", applyFilters);
    if (filter) filter.addEventListener("change", applyFilters);

    applyFilters();
  } catch (error) {
    console.error("Error cargando catálogo:", error);
    empty.classList.remove("hidden");
    empty.innerHTML = "<p>No se pudo cargar el catálogo.</p>";
  }
}

init();

if (typeof closeModal === "function") closeModal();

// ===== BOTÓN IR ARRIBA =====
document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("topBtn");
  if (!boton) return;

  let scroller = document.scrollingElement || document.documentElement;

  function getScrollTop(el) {
    if (el === document || el === document.documentElement || el === document.body) {
      return (document.scrollingElement || document.documentElement).scrollTop;
    }
    return el.scrollTop;
  }

  function scrollToTop(el) {
    if (el === document || el === document.documentElement || el === document.body) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  document.addEventListener(
    "scroll",
    (e) => {
      scroller = e.target;
      const top = getScrollTop(scroller);
      boton.style.display = top > 300 ? "block" : "none";
    },
    true
  );

  boton.addEventListener("click", () => {
    scrollToTop(scroller);
  });
});

// ===== MENÚ MOBILE =====
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
    });
  });
}