import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyDBxkSDdPDlE_7mekIvl_GKzgC_GXzCcuw",
  authDomain: "ruloparfum.firebaseapp.com",
  projectId: "ruloparfum",
  storageBucket: "ruloparfum.firebasestorage.app",
  messagingSenderId: "167849199505",
  appId: "1:167849199505:web:d5822af67e5f2024aa3c30"
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const storage = getStorage(app);

// Cache de URLs para no pedir la misma imagen dos veces
const urlCache = {};

async function getImgUrl(path) {
  if (!path) return 'img/placeholder.webp';
  // Si ya es una URL completa (http/https), usarla directamente
  if (path.startsWith('http')) return path;
  // Si está en cache, devolverla
  if (urlCache[path]) return urlCache[path];
  try {
    const clean = path.replace(/^\/+/, '');
    const url = await getDownloadURL(ref(storage, clean));
    urlCache[path] = url;
    return url;
  } catch(e) {
    // Si no está en Storage, intentar cargar localmente como fallback
    return path.replace(/^\/+/, '');
  }
}

async function cargarColeccion(nombre) {
  try {
    const q = query(collection(db, nombre), orderBy("id"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data()).filter(p => p.id && p.id !== 'temp');
  } catch(e) {
    console.warn(`No se pudo cargar ${nombre}:`, e);
    return [];
  }
}

async function cargarColeccion(nombre) {
  try {
    const q = query(collection(db, nombre), orderBy("id"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data()).filter(p => p.id && p.id !== 'temp');
  } catch(e) {
    console.warn(`No se pudo cargar ${nombre}:`, e);
    return [];
  }
}

const WHATSAPP_NUMBER = "5493535669706";

const grid            = document.getElementById("grid");
const decantsGrid     = document.getElementById("decantsGrid");
const promosGrid      = document.getElementById("promosGrid");
const desodorantsGrid = document.getElementById("desodorantsGrid");
const search          = document.getElementById("search");
const filter          = document.getElementById("filter");
const empty           = document.getElementById("empty");

let perfumes     = [];
let decants      = [];
let promos       = [];
let desodorantes = [];
let favoritos    = JSON.parse(localStorage.getItem('rulo_favs')) || [];

function moneyARS(n){
  return new Intl.NumberFormat("es-AR").format(n);
}

function waLink(perfume){
  const precioTexto = perfume.stock === false ? "Sin stock" : `$${moneyARS(perfume.precio)}`;
  const msg = `Hola! Vi en la web el *${perfume.nombre}* (${perfume.ml}ml) por ${precioTexto}. ¿Lo tenés disponible?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function showToast(nombre, agregado) {
  const old = document.getElementById("cartToast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.id = "cartToast";
  toast.innerHTML = agregado
    ? `<span>✅</span> <strong>${nombre}</strong> agregado al pedido`
    : `<span>🗑️</span> <strong>${nombre}</strong> quitado del pedido`;
  document.body.appendChild(toast);
  toast.offsetHeight;
  toast.classList.add("toast--visible");
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

window.toggleFav = function(id, event) {
  if(event) event.stopPropagation();
  const index = favoritos.indexOf(id);
  const agregado = index === -1;
  if (!agregado) { favoritos.splice(index, 1); }
  else { favoritos.push(id); }
  localStorage.setItem('rulo_favs', JSON.stringify(favoritos));
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
  const p = todos.find(x => x.id === id);
  if (p) showToast(p.nombre, agregado);
  updateFavUI();
  applyFilters();
}

window.sendAllFavs = function() {
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
  const seleccionados = todos.filter(p => favoritos.includes(p.id));
  let listaItems = "";
  seleccionados.forEach(p => { listaItems += `- ${p.nombre} (${p.ml}ml)\n`; });
  const mensaje = `Hola Rulo! Me interesan estos productos de tu catálogo:\n\n${listaItems}\n¿Los tenés disponibles?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

window.openModalById = function(id) {
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
  const p = todos.find(x => x.id === id);
  if (p) openModal(p);
}

async function cardTemplate(p){
  const placeholder = 'img/placeholder.webp';
  const isFav = favoritos.includes(p.id);
  const outOfStock = p.stock === false;
  const imgUrl = await getImgUrl(p.imagen);

  return `
    <article class="card ${outOfStock ? 'out-of-stock' : ''}" onclick="openModalById(${p.id})">
      <div class="thumb">
        ${outOfStock ? '<div class="badge-out">Agotado</div>' : ''}
        <img src="${imgUrl}" alt="${p.nombre}" onerror="this.onerror=null; this.src='${placeholder}'">
      </div>
      <div class="content">
        <div class="card__info">
          <div class="name">${p.nombre}</div>
          <div class="meta">
            <span class="badge">${p.marca || "-"}</span>
            <span class="badge">${p.genero || "-"}</span>
            <span class="badge">${p.ml || "-"}ml</span>
          </div>
          <div class="price">
            ${outOfStock ? "Sin stock" : `
              ${p.precio_descuento ? `<span class="price-original">$${moneyARS(p.precio)}</span>` : ''}
              <span class="price-actual">$${moneyARS(p.precio_descuento || p.precio)}</span>
              ${p.precio_descuento ? `<span class="price-badge">-${Math.round((1 - p.precio_descuento / p.precio) * 100)}%</span>` : ''}
            `}
          </div>
        </div>
        <div class="card__actions">
          <button class="btn btn-add ${isFav ? 'active' : ''}"
                  onclick="toggleFav(${p.id}, event); event.stopPropagation();"
                  style="background:${isFav ? '#25d366' : 'rgba(212,162,76,.12)'};
                         border:1px solid ${isFav ? '#25d366' : 'rgba(212,162,76,.30)'};
                         color:${isFav ? 'white' : 'var(--text)'};
                         display: ${outOfStock ? 'none' : 'flex'};">
            ${isFav ? '🛒 Quitar de la lista' : '➕ Añadir al carrito'}
          </button>
          <a class="btn btn--wa" href="${waLink(p)}" target="_blank" rel="noopener" onclick="event.stopPropagation();">
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </article>`;
}

async function categoryTemplate(c){
  const imgUrl = await getImgUrl(c.imagen);
  return `
    <article class="category-card">
      <a href="${c.link}">
        <div class="thumb"><img src="${imgUrl}" alt="${c.nombre}" onerror="this.onerror=null;this.src='img/placeholder.webp'"></div>
        <h2>${c.nombre}</h2>
      </a>
    </article>`;
}

async function renderCategories(lista){
  const container = document.querySelector(".home-categories");
  if (container) {
    const cards = await Promise.all(lista.map(categoryTemplate));
    container.innerHTML = cards.join("");
  }
}

async function renderPerfumes(list){
  const cards = await Promise.all(list.map(cardTemplate));
  grid.innerHTML = cards.join("");
  empty.classList.toggle("hidden", list.length !== 0);
}

async function renderDecants(list){
  if (decantsGrid) {
    const cards = await Promise.all(list.filter(p => p.activo !== false).map(cardTemplate));
    decantsGrid.innerHTML = cards.join("");
  }
}

async function renderPromos(list){
  const section = document.getElementById("promos");
  const activos = list.filter(p => p.activo !== false);
  if (section) section.style.display = activos.length === 0 ? "none" : "";
  if (promosGrid) {
    const cards = await Promise.all(activos.map(cardTemplate));
    promosGrid.innerHTML = cards.join("");
  }
}

async function renderDesodorantes(list){
  if (desodorantsGrid) {
    const cards = await Promise.all(list.filter(p => p.activo !== false).map(cardTemplate));
    desodorantsGrid.innerHTML = cards.join("");
  }
}

const modal       = document.getElementById("modal");
const modalImg    = document.getElementById("modalImg");
const modalTitle  = document.getElementById("modalTitle");
const modalPrice  = document.getElementById("modalPrice");
const modalBadges = document.getElementById("modalBadges");
const modalDesc   = document.getElementById("modalDesc");
const modalWa     = document.getElementById("modalWa");

async function openModal(p){
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
  modalImg.src = await getImgUrl(p.imagen);
  modalTitle.textContent = p.nombre;
  if (p.stock === false) {
    modalPrice.innerHTML = "Sin stock";
  } else if (p.precio_descuento) {
    modalPrice.innerHTML = `
      <span class="price-original">$${moneyARS(p.precio)}</span>
      <span class="price-actual">$${moneyARS(p.precio_descuento)}</span>
      <span class="price-badge">-${Math.round((1 - p.precio_descuento / p.precio) * 100)}%</span>
    `;
  } else {
    modalPrice.innerHTML = `<span class="price-actual">$${moneyARS(p.precio)}</span>`;
  }
  modalBadges.innerHTML = `<span class="badge">${p.marca || "-"}</span><span class="badge">${p.genero || "-"}</span><span class="badge">${p.ml || "-"}ml</span>`;
  modalDesc.textContent = p.descripcion || "Consultá disponibilidad por WhatsApp.";
  document.getElementById("notas-salida").textContent = p.notas_salida || "-";
  document.getElementById("notas-corazon").textContent = p.notas_corazon || "-";
  document.getElementById("notas-fondo").textContent = p.notas_fondo || "-";
  modalWa.href = waLink(p);
}

function closeModal(){
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "modalClose" || e.target.closest("#modalClose") || e.target.classList.contains("modal__backdrop")) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

async function applyFilters(){
  const q = (search?.value || "").toLowerCase();
  const f = (filter?.value || "all");
  const matchesQuery  = (p) => (p.nombre || "").toLowerCase().includes(q) || (p.marca || "").toLowerCase().includes(q);
  const matchesGender = (p) => !["hombre","mujer","unisex"].includes(f) || (p.genero || "").toLowerCase() === f;
  const sortFn = f === "asc" ? (a,b) => a.precio - b.precio : f === "desc" ? (a,b) => b.precio - a.precio : null;

  let listP = perfumes.filter(p => p.activo !== false && matchesQuery(p) && matchesGender(p));
  if (sortFn) listP.sort(sortFn);
  await renderPerfumes(listP);

  const listD  = decants.filter(p => p.activo !== false && matchesQuery(p));
  const listPr = promos.filter(p => p.activo !== false && matchesQuery(p));
  const listDe = desodorantes.filter(p => p.activo !== false && matchesQuery(p));

  if (decantsGrid) {
    const cards = await Promise.all(listD.map(cardTemplate));
    decantsGrid.innerHTML = cards.join("");
    const sec = document.getElementById("decants");
    if (sec) sec.style.display = listD.length === 0 && q ? "none" : "";
  }
  const promosSec = document.getElementById("promos");
  if (promosGrid) {
    const cards = await Promise.all(listPr.map(cardTemplate));
    promosGrid.innerHTML = cards.join("");
    if (promosSec) promosSec.style.display = listPr.length === 0 ? "none" : "";
  }
  if (desodorantsGrid) {
    const cards = await Promise.all(listDe.map(cardTemplate));
    desodorantsGrid.innerHTML = cards.join("");
    const sec = document.getElementById("desodorantes");
    if (sec) sec.style.display = listDe.length === 0 && q ? "none" : "";
  }

  const totalResultados = listP.length + listD.length + listPr.length + listDe.length;
  empty.classList.toggle("hidden", totalResultados !== 0 || !q);
}

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", (e) => { e.stopPropagation(); mobileMenu.classList.toggle("is-open"); });
  mobileMenu.querySelectorAll("a").forEach(link => { link.addEventListener("click", () => mobileMenu.classList.remove("is-open")); });
}
document.addEventListener("click", (e) => {
  if (mobileMenu && !mobileMenu.contains(e.target) && e.target !== menuToggle) mobileMenu.classList.remove("is-open");
});

if (search) search.addEventListener("input", applyFilters);
if (filter)  filter.addEventListener("change", applyFilters);

const topBtn = document.getElementById("topBtn");
if (topBtn) {
  topBtn.style.display = "none";
  window.addEventListener("scroll", () => { topBtn.style.display = window.scrollY > 300 ? "flex" : "none"; });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

window.toggleCart = function() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  drawer.classList.toggle("is-open");
  if (drawer.classList.contains("is-open")) renderCartItems();
}

async function renderCartItems() {
  const container  = document.getElementById("cartItems");
  const totalSumEl = document.getElementById("cartTotalSum");
  if (!container) return;
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
  const seleccionados = todos.filter(p => favoritos.includes(p.id));
  let total = 0;
  if (seleccionados.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">Tu lista está vacía...</p>';
    if(totalSumEl) totalSumEl.innerText = "$0";
    return;
  }
  const items = await Promise.all(seleccionados.map(async p => {
    total += Number(p.precio) || 0;
    const imgUrl = await getImgUrl(p.imagen);
    return `
      <div class="cart-item">
        <img src="${imgUrl}" onerror="this.src='img/placeholder.webp'">
        <div class="cart-item-info">
          <div>${p.nombre}</div>
          <div class="price">$${moneyARS(p.precio)}</div>
        </div>
        <button onclick="toggleFav(${p.id}, event)" style="background:none;border:none;color:#ff4444;font-size:18px;cursor:pointer;">✕</button>
      </div>`;
  }));
  container.innerHTML = items.join("");
  if(totalSumEl) totalSumEl.innerText = `$${moneyARS(total)}`;
}

function updateFavUI() {
  const countEl  = document.getElementById('favCount');
  const floatBtn = document.getElementById('favButton');
  if(countEl)  countEl.innerText = favoritos.length;
  if(floatBtn) floatBtn.style.display = favoritos.length > 0 ? 'flex' : 'none';
  const drawer = document.getElementById("cartDrawer");
  if (drawer && drawer.classList.contains("is-open")) renderCartItems();
}

async function init(){
  if (grid) grid.innerHTML = `<div style="color:var(--muted);padding:20px;grid-column:1/-1">Cargando productos...</div>`;

  [perfumes, decants, promos, desodorantes] = await Promise.all([
    cargarColeccion('perfumes'),
    cargarColeccion('decants'),
    cargarColeccion('promos'),
    cargarColeccion('desodorantes')
  ]);

  try {
    const resS = await fetch("data/secciones.json");
    if (resS.ok) renderCategories(await resS.json());
  } catch(e) {}

  renderDecants(decants);
  renderPromos(promos);
  renderDesodorantes(desodorantes);
  applyFilters();
  updateFavUI();
}

init();