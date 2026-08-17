import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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

const WHATSAPP_NUMBER = "5493535669706";

// Mínimos por sección
const MINIMOS = {
  perfumes:     6,  // solo perfumes
  decants:      10,
  desodorantes: 5,
  bodysplash:   5,
  mixto:        5   // cuando hay mix de secciones
};

const urlCache = {};

async function getImgUrl(path) {
  if (!path) return 'img/placeholder.webp';
  if (path.startsWith('http')) return path;
  if (urlCache[path]) return urlCache[path];
  try {
    const clean = path.replace(/^\/+/, '');
    const url = await Promise.race([
      getDownloadURL(ref(storage, clean)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
    ]);
    urlCache[path] = url;
    return url;
  } catch(e) { return path.replace(/^\/+/, ''); }
}

async function cargarColeccion(nombre) {
  try {
    const q = query(collection(db, nombre), orderBy("id"));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ ...d.data(), _seccion: nombre }))
      .filter(p => p.id && p.id !== 'temp' && p.activo !== false && p.precio_mayorista);
  } catch(e) {
    console.warn(`No se pudo cargar ${nombre}:`, e);
    return [];
  }
}

function moneyARS(n) {
  return new Intl.NumberFormat("es-AR").format(n);
}

function capitalize(str) {
  if (!str) return "-";
  return str.split(",").map(s => {
    const t = s.trim();
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }).join(", ");
}

function waLink(p) {
  const msg = `Hola! Vi en el catálogo mayorista el *${p.nombre}* (${p.ml}ml) por $${moneyARS(p.precio_mayorista)}. ¿Lo tenés disponible?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const grid            = document.getElementById("grid");
const decantsGrid     = document.getElementById("decantsGrid");
const promosGrid      = document.getElementById("promosGrid");
const desodorantsGrid = document.getElementById("desodorantsGrid");
const bodysplashGrid  = document.getElementById("bodysplashGrid");
const search          = document.getElementById("search");
const filter          = document.getElementById("filter");
const empty           = document.getElementById("empty");

let perfumes     = [];
let decants      = [];
let promos       = [];
let desodorantes = [];
let bodysplash   = [];

// carrito: { id -> { cant, seccion } }
let carrito = JSON.parse(localStorage.getItem('rulo_may_carrito')) || {};

function guardarCarrito() {
  localStorage.setItem('rulo_may_carrito', JSON.stringify(carrito));
}

function totalUnidades() {
  return Object.values(carrito).reduce((a, b) => a + (b.cant || b), 0);
}

function calcularMinimo() {
  // Detectar qué secciones tiene el carrito
  const secciones = new Set(Object.values(carrito).map(v => v.seccion || 'perfumes'));

  if (secciones.size > 1) return MINIMOS.mixto;
  const seccion = [...secciones][0];
  return MINIMOS[seccion] || MINIMOS.mixto;
}

function getMensajeMinimo() {
  const total   = totalUnidades();
  const minimo  = calcularMinimo();
  const faltan  = minimo - total;
  const secciones = new Set(Object.values(carrito).map(v => v.seccion || 'perfumes'));

  if (secciones.size === 1) {
    const sec = [...secciones][0];
    const nombre = sec === 'perfumes' ? 'perfumes' : sec === 'decants' ? 'decants' : sec === 'desodorantes' ? 'desodorantes' : 'productos';
    if (faltan > 0) return { ok: false, msg: `⚠️ Mínimo ${minimo} ${nombre} (te faltan ${faltan})` };
    return { ok: true, msg: `✅ ${total} unidades — listo para enviar` };
  }

  if (faltan > 0) return { ok: false, msg: `⚠️ Mínimo ${minimo} unidades en total (te faltan ${faltan})` };
  return { ok: true, msg: `✅ ${total} unidades — listo para enviar` };
}

// ===== TOAST =====
function showToast(msg) {
  const old = document.getElementById("cartToast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.id = "cartToast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  toast.offsetHeight;
  toast.classList.add("toast--visible");
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

// ===== CARRITO =====
window.agregarAlCarrito = function(id, seccion, event) {
  if(event) event.stopPropagation();
  if (!carrito[id]) carrito[id] = { cant: 1, seccion };
  else carrito[id].cant++;
  guardarCarrito();
  updateFavUI();
  actualizarCardCarrito(id);
  showToast(`✅ Agregado (${carrito[id].cant} u.)`);
}

window.cambiarCantidad = function(id, delta, event) {
  if(event) event.stopPropagation();
  if (!carrito[id]) return;
  const nueva = carrito[id].cant + delta;
  if (nueva <= 0) {
    delete carrito[id];
    showToast('🗑️ Quitado del pedido');
  } else {
    carrito[id].cant = nueva;
  }
  guardarCarrito();
  updateFavUI();
  actualizarCardCarrito(id);
  const drawer = document.getElementById("cartDrawer");
  if (drawer && drawer.classList.contains("is-open")) renderCartItems();
}

window.quitarDelCarrito = function(id, event) {
  if(event) event.stopPropagation();
  delete carrito[id];
  guardarCarrito();
  updateFavUI();
  actualizarCardCarrito(id);
  renderCartItems();
  showToast('🗑️ Quitado del pedido');
}

function actualizarCardCarrito(id) {
  const item   = carrito[id];
  const cant   = item ? item.cant : 0;
  const btnAdd = document.getElementById(`btn-add-${id}`);
  const wrapper= document.getElementById(`cant-wrapper-${id}`);
  const cantEl = document.getElementById(`cant-${id}`);
  if (btnAdd)  btnAdd.style.display  = cant > 0 ? 'none' : 'flex';
  if (wrapper) wrapper.style.display = cant > 0 ? 'flex' : 'none';
  if (cantEl)  cantEl.textContent    = cant;
}

window.sendAllFavs = function() {
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes, ...bodysplash];
  const { ok, msg } = getMensajeMinimo();

  if (!ok) { showToast(msg); return; }

  let listaItems = "";
  for (const [id, item] of Object.entries(carrito)) {
    const p = todos.find(x => x.id === Number(id));
    if (!p) continue;
    const cant = item.cant || item;
    listaItems += `- ${p.nombre} (${p.ml}ml) x${cant} — $${moneyARS(p.precio_mayorista * cant)}\n`;
  }

  const total = totalUnidades();
  const mensaje = `Hola Rulo! Te hago el siguiente pedido mayorista:\n\n${listaItems}\nTotal: ${total} unidades\n¿Los tenés disponibles?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

window.openModalById = function(id) {
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes, ...bodysplash];
  const p = todos.find(x => x.id === id);
  if (p) openModal(p);
}

// ===== CARD TEMPLATE =====
function cardTemplate(p) {
  const placeholder = 'img/placeholder.webp';
  const outOfStock  = p.stock === false;
  const item        = carrito[p.id];
  const cant        = item ? item.cant : 0;

  return `
    <article class="card ${outOfStock ? 'out-of-stock' : ''}" onclick="openModalById(${p.id})" data-img="${p.imagen || ''}">
      <div class="thumb">
        ${outOfStock ? '<div class="badge-out">Agotado</div>' : ''}
        <img src="${placeholder}" alt="${p.nombre}" class="lazy-img" onerror="this.onerror=null; this.src='${placeholder}'">
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
            ${outOfStock ? "Sin stock" : `<span class="price-actual">$${moneyARS(p.precio_mayorista)}</span>`}
          </div>
        </div>
        <div class="card__actions">
          ${outOfStock ? '' : `
            <button id="btn-add-${p.id}" class="btn btn-add"
                    onclick="agregarAlCarrito(${p.id}, '${p._seccion || 'perfumes'}', event); event.stopPropagation();"
                    style="background:rgba(212,162,76,.12);border:1px solid rgba(212,162,76,.30);color:var(--text);display:${cant > 0 ? 'none' : 'flex'};">
              ➕ Añadir al pedido
            </button>
            <div id="cant-wrapper-${p.id}" onclick="event.stopPropagation()"
                 style="display:${cant > 0 ? 'flex' : 'none'};align-items:center;gap:8px;background:rgba(37,211,102,.12);border:1px solid rgba(37,211,102,.3);border-radius:12px;padding:8px 12px;justify-content:center;">
              <button onclick="cambiarCantidad(${p.id}, -1, event)" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;line-height:1;padding:0 4px;">−</button>
              <span id="cant-${p.id}" style="font-weight:700;font-size:16px;min-width:24px;text-align:center;">${cant}</span>
              <button onclick="cambiarCantidad(${p.id}, 1, event)" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;line-height:1;padding:0 4px;">+</button>
            </div>
          `}
          <a class="btn btn--wa" href="${waLink(p)}" target="_blank" rel="noopener" onclick="event.stopPropagation();">
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </article>`;
}

function cargarImagenesLazy(container) {
  container.querySelectorAll('.lazy-img').forEach(async img => {
    const article = img.closest('[data-img]');
    if (!article) return;
    const url = await getImgUrl(article.dataset.img);
    if (url) img.src = url;
  });
}

// ===== CATEGORÍAS =====
const CATEGORY_CONFIG = {
  perfumes:     { clase: 'cat-perfumes',     num: '01' },
  decants:      { clase: 'cat-decants',      num: '02' },
  promos:       { clase: 'cat-promos',       num: '03' },
  desodorantes: { clase: 'cat-desodorantes', num: '04' },
  bodysplash:   { clase: 'cat-bodysplash',   num: '05' },
};

async function renderCategories() {
  const container = document.getElementById('mayoristaCategorias');
  if (!container) return;
  try {
    const res = await fetch("data/secciones.json");
    if (!res.ok) return;
    const lista = await res.json();
    container.innerHTML = lista.map(c => {
      const key    = (c.link || '').replace('#', '').toLowerCase();
      const config = CATEGORY_CONFIG[key] || { clase: 'cat-perfumes', num: '01' };
      const isDecants = key === 'decants';

      if (isDecants) {
        return `
          <article class="category-card ${config.clase}" style="position:relative;">
            <div data-num="${config.num}" onclick="toggleDecantMenu(event)" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:20px 22px;">
              <div class="cat-left">
                <div class="cat-bar"></div>
                <h2>${c.nombre}</h2>
              </div>
              <span class="cat-arrow" id="decantArrow">›</span>
            </div>
            <div id="decantMenu" style="display:none;border-top:1px solid rgba(200,146,46,.2);padding:8px 22px 12px;">
              <button onclick="cerrarModalMl('5')" style="display:block;width:100%;text-align:left;background:none;border:none;color:var(--text);padding:10px 0;font-size:14px;cursor:pointer;font-family:inherit;border-bottom:1px solid rgba(255,255,255,.05);">→ 5ml</button>
              <button onclick="cerrarModalMl('10')" style="display:block;width:100%;text-align:left;background:none;border:none;color:var(--text);padding:10px 0;font-size:14px;cursor:pointer;font-family:inherit;">→ 10ml</button>
            </div>
          </article>`;
      }

      return `
        <article class="category-card ${config.clase}">
          <a href="${c.link}" data-num="${config.num}">
            <div class="cat-left">
              <div class="cat-bar"></div>
              <h2>${c.nombre}</h2>
            </div>
            <span class="cat-arrow">›</span>
          </a>
        </article>`;
    }).join('');
  } catch(e) {}
}

window.toggleDecantMenu = function(e) {
  e.preventDefault();
  const menu  = document.getElementById('decantMenu');
  const arrow = document.getElementById('decantArrow');
  const open  = menu.style.display === 'none';
  menu.style.display = open ? 'block' : 'none';
  arrow.textContent  = open ? '⌄' : '›';
}

window.cerrarModalMl = function(ml) {
  const menu  = document.getElementById('decantMenu');
  const arrow = document.getElementById('decantArrow');
  if (menu)  menu.style.display = 'none';
  if (arrow) arrow.textContent  = '›';

  const filtered = decants.filter(p => String(p.ml) === ml);
  renderDecants(filtered, decantsGrid);
  setTimeout(() => {
    const sec = document.getElementById('decants');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ===== RENDERS =====
function renderPerfumes(list) {
  if (list.length === 0) { grid.innerHTML = ''; return; }

  const disenadores = list.filter(p => p.linea === 'disenador');
  const arabes      = list.filter(p => p.linea !== 'disenador');

  function agruparPorMarca(lista) {
    const grupos = {};
    lista.forEach(p => {
      const marca = p.marca || 'Otros';
      if (!grupos[marca]) grupos[marca] = [];
      grupos[marca].push(p);
    });
    // Ordenar alfabéticamente dentro de cada marca
    Object.values(grupos).forEach(arr => arr.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es')));
    return grupos;
  }

  let html = '';
  if (disenadores.length > 0) {
    const grupos = agruparPorMarca(disenadores);
    html += `<div class="linea-titulo">✨ Perfumes de Diseñador / Nicho</div>`;
    for (const [marca, prods] of Object.entries(grupos)) {
      html += `<div class="marca-titulo">${marca}</div>`;
      html += `<div class="marca-grid">${prods.map(cardTemplate).join('')}</div>`;
    }
  }
  if (arabes.length > 0) {
    const grupos = agruparPorMarca(arabes);
    if (disenadores.length > 0) html += `<div class="linea-titulo">🌙 Perfumes Árabes</div>`;
    for (const [marca, prods] of Object.entries(grupos)) {
      html += `<div class="marca-titulo">${marca}</div>`;
      html += `<div class="marca-grid">${prods.map(cardTemplate).join('')}</div>`;
    }
  }
  grid.innerHTML = html;
  cargarImagenesLazy(grid);
}

function renderDecants(list, gridEl) {
  if (!gridEl) return;
  const sec = document.getElementById('decants');
  if (list.length === 0) { if (sec) sec.style.display = 'none'; return; }
  if (sec) sec.style.display = '';

  const grupos = {};
  list.forEach(p => {
    const ml = p.ml ? `${p.ml}ml` : 'Otros';
    if (!grupos[ml]) grupos[ml] = [];
    grupos[ml].push(p);
  });

  const gruposOrdenados = Object.entries(grupos).sort((a, b) => {
    return (parseInt(a[0]) || 0) - (parseInt(b[0]) || 0);
  });

  let html = '';
  for (const [ml, prods] of gruposOrdenados) {
    html += `<div class="marca-titulo">${ml}</div>`;
    html += `<div class="marca-grid">${prods.map(cardTemplate).join('')}</div>`;
  }
  gridEl.innerHTML = html;
  cargarImagenesLazy(gridEl);
}

function renderSeccion(list, gridEl, seccionId) {
  if (!gridEl) return;
  const sec = document.getElementById(seccionId);
  if (list.length === 0) { if (sec) sec.style.display = 'none'; return; }
  if (sec) sec.style.display = '';
  gridEl.innerHTML = list.map(cardTemplate).join('');
  cargarImagenesLazy(gridEl);
}

// ===== MODAL =====
const modal       = document.getElementById("modal");
const modalImg    = document.getElementById("modalImg");
const modalTitle  = document.getElementById("modalTitle");
const modalPrice  = document.getElementById("modalPrice");
const modalBadges = document.getElementById("modalBadges");
const modalDesc   = document.getElementById("modalDesc");
const modalWa     = document.getElementById("modalWa");

function openModal(p) {
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
  modalImg.src = 'img/placeholder.webp';
  getImgUrl(p.imagen).then(url => { if (url) modalImg.src = url; });
  modalTitle.textContent = p.nombre;
  modalPrice.innerHTML   = p.stock === false ? "Sin stock" : `<span class="price-actual">$${moneyARS(p.precio_mayorista)}</span>`;
  modalBadges.innerHTML  = `<span class="badge">${p.marca || "-"}</span><span class="badge">${p.genero || "-"}</span><span class="badge">${p.ml || "-"}ml</span>`;
  modalDesc.textContent  = p.descripcion || "Consultá disponibilidad por WhatsApp.";
  document.getElementById("notas-salida").textContent  = capitalize(p.notas_salida);
  document.getElementById("notas-corazon").textContent = capitalize(p.notas_corazon);
  document.getElementById("notas-fondo").textContent   = capitalize(p.notas_fondo);
  modalWa.href = waLink(p);
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  if (e.target.id === "modalClose" || e.target.closest("#modalClose") || e.target.classList.contains("modal__backdrop")) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ===== FILTROS =====
function applyFilters() {
  const q = (search?.value || "").toLowerCase();
  const f = (filter?.value || "all");
  const matchesQuery  = (p) => (p.nombre || "").toLowerCase().includes(q) || (p.marca || "").toLowerCase().includes(q);
  const matchesGender = (p) => !["hombre","mujer","unisex"].includes(f) || (p.genero || "").toLowerCase() === f;
  const sortFn = f === "asc"  ? (a,b) => a.precio_mayorista - b.precio_mayorista
               : f === "desc" ? (a,b) => b.precio_mayorista - a.precio_mayorista : null;

  let listP = perfumes.filter(p => matchesQuery(p) && matchesGender(p));
  if (sortFn) listP.sort(sortFn);
  else listP.sort((a,b) => b.precio_mayorista - a.precio_mayorista);
  renderPerfumes(listP);

  renderDecants(decants.filter(matchesQuery),     decantsGrid);
  renderSeccion(promos.filter(matchesQuery),       promosGrid,      'promos');
  renderSeccion(desodorantes.filter(matchesQuery), desodorantsGrid, 'desodorantes');
  renderSeccion(bodysplash.filter(matchesQuery),   bodysplashGrid,  'bodysplash');

  const total = listP.length + decants.filter(matchesQuery).length + promos.filter(matchesQuery).length + desodorantes.filter(matchesQuery).length + bodysplash.filter(matchesQuery).length;
  empty.classList.toggle("hidden", total !== 0 || !q);
}

// ===== MENÚ =====
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

// ===== BOTÓN ARRIBA =====
const topBtn = document.getElementById("topBtn");
if (topBtn) {
  topBtn.style.display = "none";
  window.addEventListener("scroll", () => { topBtn.style.display = window.scrollY > 300 ? "flex" : "none"; });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ===== CARRITO DRAWER =====
window.toggleCart = function() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  drawer.classList.toggle("is-open");
  if (drawer.classList.contains("is-open")) renderCartItems();
}

function renderCartItems() {
  const container  = document.getElementById("cartItems");
  const totalSumEl = document.getElementById("cartTotalSum");
  const btnEnviar  = document.getElementById("btnEnviarPedido");
  const avisoMin   = document.getElementById("avisoMinimo");
  if (!container) return;

  const todos = [...perfumes, ...decants, ...promos, ...desodorantes, ...bodysplash];
  const ids   = Object.keys(carrito).filter(id => (carrito[id].cant || carrito[id]) > 0);

  if (ids.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">Tu pedido está vacío...</p>';
    if(totalSumEl) totalSumEl.innerText = "$0";
    if(btnEnviar) { btnEnviar.disabled = true; btnEnviar.style.opacity = '.5'; }
    if(avisoMin)  avisoMin.style.display = 'none';
    return;
  }

  let totalPesos = 0;
  let totalUnids = 0;

  container.innerHTML = ids.map(id => {
    const p = todos.find(x => x.id === Number(id));
    if (!p) return '';
    const cant     = carrito[id].cant || carrito[id];
    const subtotal = p.precio_mayorista * cant;
    totalPesos += subtotal;
    totalUnids += cant;
    return `
      <div class="cart-item" style="flex-direction:column;align-items:flex-start;gap:8px;padding:12px;">
        <div style="display:flex;gap:10px;align-items:center;width:100%;">
          <img src="img/placeholder.webp" data-img="${p.imagen || ''}" class="lazy-img"
               onerror="this.src='img/placeholder.webp'"
               style="width:44px;height:44px;object-fit:contain;background:white;border-radius:8px;flex-shrink:0;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.nombre}</div>
            <div style="color:var(--gold);font-size:12px;">$${moneyARS(p.precio_mayorista)} c/u</div>
          </div>
          <button onclick="quitarDelCarrito(${p.id}, event)"
                  style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:8px;color:#ef4444;font-size:14px;cursor:pointer;padding:4px 8px;flex-shrink:0;">✕</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;width:100%;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border-radius:10px;padding:6px 12px;">
            <button onclick="cambiarCantidad(${p.id}, -1, event);renderCartItems();"
                    style="background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0 2px;">−</button>
            <span style="font-weight:700;min-width:24px;text-align:center;font-size:15px;">${cant}</span>
            <button onclick="cambiarCantidad(${p.id}, 1, event);renderCartItems();"
                    style="background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0 2px;">+</button>
          </div>
          <div style="color:var(--gold);font-weight:700;font-size:14px;">$${moneyARS(subtotal)}</div>
        </div>
      </div>`;
  }).join('');

  cargarImagenesLazy(container);
  if(totalSumEl) totalSumEl.innerText = `$${moneyARS(totalPesos)}`;

  const { ok, msg } = getMensajeMinimo();
  if (avisoMin) {
    avisoMin.textContent  = msg;
    avisoMin.style.color  = ok ? 'var(--green)' : '#ef4444';
    avisoMin.style.display = 'block';
  }
  if (btnEnviar) {
    btnEnviar.disabled     = !ok;
    btnEnviar.style.opacity = ok ? '1' : '.5';
  }
}

function updateFavUI() {
  const countEl  = document.getElementById('favCount');
  const floatBtn = document.getElementById('favButton');
  const total    = totalUnidades();
  if(countEl)  countEl.innerText = total;
  if(floatBtn) floatBtn.style.display = total > 0 ? 'flex' : 'none';
  const drawer = document.getElementById("cartDrawer");
  if (drawer && drawer.classList.contains("is-open")) renderCartItems();
}

// ===== INIT =====
async function init() {
  if (grid) grid.innerHTML = `<div style="color:var(--muted);padding:20px;grid-column:1/-1">Cargando productos...</div>`;

  const [p, d, pr, de, bs] = await Promise.all([
    cargarColeccion('perfumes'),
    cargarColeccion('decants'),
    cargarColeccion('promos'),
    cargarColeccion('desodorantes'),
    cargarColeccion('bodysplash')
  ]);

  perfumes     = p;
  decants      = d;
  promos       = pr;
  desodorantes = de;
  bodysplash   = bs;

  renderCategories();
  applyFilters();
  updateFavUI();
}

init();