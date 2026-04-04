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
let favoritos = JSON.parse(localStorage.getItem('rulo_favs')) || [];

function moneyARS(n){
  return new Intl.NumberFormat("es-AR").format(n);
}

function waLink(perfume){
  const precioTexto = perfume.stock === false ? "Sin stock" : `$${moneyARS(perfume.precio)}`;
  const msg = `Hola! Vi en la web el *${perfume.nombre}* (${perfume.ml}ml) por ${precioTexto}. ¿Lo tenés disponible?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ===== TOAST DE CONFIRMACIÓN =====
function showToast(nombre, agregado) {
  // Remover toast anterior si existe
  const old = document.getElementById("cartToast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "cartToast";
  toast.innerHTML = agregado
    ? `<span>✅</span> <strong>${nombre}</strong> agregado al pedido`
    : `<span>🗑️</span> <strong>${nombre}</strong> quitado del pedido`;
  document.body.appendChild(toast);

  // Forzar reflow para que la transición arranque
  toast.offsetHeight;
  toast.classList.add("toast--visible");

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

function toggleFav(id, event) {
    if(event) event.stopPropagation();
    const index = favoritos.indexOf(id);
    const agregado = index === -1;

    if (!agregado) { favoritos.splice(index, 1); }
    else { favoritos.push(id); }

    localStorage.setItem('rulo_favs', JSON.stringify(favoritos));

    // Buscar nombre del producto para el toast
    const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
    const p = todos.find(x => x.id === id);
    if (p) showToast(p.nombre, agregado);

    updateFavUI();
    applyFilters();
}

// updateFavUI unificada más abajo (ver función única)

function sendAllFavs() {
  const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
  const seleccionados = todos.filter(p => favoritos.includes(p.id));
  
  let listaItems = "";
  seleccionados.forEach(p => {
    listaItems += `- ${p.nombre} (${p.ml}ml)\n`;
  });

  const mensaje = `Hola Rulo! Me interesan estos productos de tu catálogo:\n\n${listaItems}\n¿Los tenés disponibles?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

function openModalById(id) {
    const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
    const p = todos.find(x => x.id === id);
    if (p) openModal(p);
}

function cardTemplate(p){
  const placeholder = imgSrc("img/placeholder.webp");
  const isFav = favoritos.includes(p.id);
  const outOfStock = p.stock === false;

  return `
    <article class="card ${outOfStock ? 'out-of-stock' : ''}" onclick="openModalById(${p.id})">
      <div class="thumb">
        ${outOfStock ? '<div class="badge-out">Agotado</div>' : ''}
        <img src="${imgSrc(p.imagen)}" alt="${p.nombre}" onerror="this.onerror=null; this.src='${placeholder}'">
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
            ${outOfStock ? "Sin stock" : "$" + moneyARS(p.precio)}
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

          <a class="btn btn--wa" href="${waLink(p)}" target="_blank" rel="noopener"
             onclick="event.stopPropagation();">
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
        <div class="thumb"><img src="${c.imagen}" alt="${c.nombre}" onerror="this.onerror=null;this.src='img/placeholder.webp'"></div>
        <h2>${c.nombre}</h2>
      </a>
    </article>`;
}

function renderCategories(lista){
  const container = document.querySelector(".home-categories");
  if (container) container.innerHTML = lista.map(categoryTemplate).join("");
}

function renderPerfumes(list){
  grid.innerHTML = list.map(cardTemplate).join("");
  empty.classList.toggle("hidden", list.length !== 0);
}

function renderDecants(list){
  if (decantsGrid) decantsGrid.innerHTML = list.filter(p => p.activo !== false).map(cardTemplate).join("");
}

function renderPromos(list){
  const section = document.getElementById("promos");
  const activos = list.filter(p => p.activo !== false);
  if (section) section.style.display = activos.length === 0 ? "none" : "";
  if (promosGrid) promosGrid.innerHTML = activos.map(cardTemplate).join("");
}

function renderDesodorantes(list){
  if (desodorantsGrid) desodorantsGrid.innerHTML = list.filter(p => p.activo !== false).map(cardTemplate).join("");
}

// MODAL
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalBadges = document.getElementById("modalBadges");
const modalDesc = document.getElementById("modalDesc");
const modalWa = document.getElementById("modalWa");

function openModal(p){
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
  modalImg.src = imgSrc(p.imagen);
  modalTitle.textContent = p.nombre;
  modalPrice.textContent = p.stock === false ? "Sin stock" : `$${moneyARS(p.precio)}`;
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

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function applyFilters(){
  const q = (search?.value || "").toLowerCase();
  const f = (filter?.value || "all");

  const matchesQuery = (p) =>
    (p.nombre || "").toLowerCase().includes(q) ||
    (p.marca || "").toLowerCase().includes(q);

  const matchesGender = (p) =>
    !["hombre","mujer","unisex"].includes(f) || (p.genero || "").toLowerCase() === f;

  const sortFn = f === "asc" ? (a,b) => a.precio - b.precio
               : f === "desc" ? (a,b) => b.precio - a.precio
               : null;

  // Perfumes (con filtro de género y orden)
  let listP = perfumes.filter(p => p.activo !== false && matchesQuery(p) && matchesGender(p));
  if (sortFn) listP.sort(sortFn);
  renderPerfumes(listP);

  // Decants, promos y desodorantes: solo filtro de texto (sin género ni precio)
  const listD = decants.filter(p => p.activo !== false && matchesQuery(p));
  const listPr = promos.filter(p => p.activo !== false && matchesQuery(p));
  const listDe = desodorantes.filter(p => p.activo !== false && matchesQuery(p));

  if (decantsGrid) {
    decantsGrid.innerHTML = listD.map(cardTemplate).join("");
    const sec = document.getElementById("decants");
    if (sec) sec.style.display = listD.length === 0 && q ? "none" : "";
  }

  const promosSec = document.getElementById("promos");
  if (promosGrid) {
    promosGrid.innerHTML = listPr.map(cardTemplate).join("");
    if (promosSec) promosSec.style.display = listPr.length === 0 ? "none" : "";
  }

  if (desodorantsGrid) {
    desodorantsGrid.innerHTML = listDe.map(cardTemplate).join("");
    const sec = document.getElementById("desodorantes");
    if (sec) sec.style.display = listDe.length === 0 && q ? "none" : "";
  }

  // Mensaje vacío global si no hay nada en ninguna sección
  const totalResultados = listP.length + listD.length + listPr.length + listDe.length;
  empty.classList.toggle("hidden", totalResultados !== 0 || !q);
}

async function init(){
  try {
    const resP = await fetch("data/perfumes.json"); perfumes = await resP.json();
    try { const resS = await fetch("data/secciones.json"); if(resS.ok) renderCategories(await resS.json()); } catch(e){}
    try { const resD = await fetch("data/decants.json"); if(resD.ok) { decants = await resD.json(); renderDecants(decants); } } catch(e){}
    try { const resPr = await fetch("data/promos.json"); if(resPr.ok) { promos = await resPr.json(); renderPromos(promos); } } catch(e){}
    try { const resDe = await fetch("data/desodorantes.json"); if(resDe.ok) { desodorantes = await resDe.json(); renderDesodorantes(desodorantes); } } catch(e){}
    applyFilters();
  } catch (error) { console.error(error); }
}

// --- ACTIVAR MENÚ DE CATEGORÍAS (HEADER) ---
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle("is-open");
  });

  // Cerrar el menú si clickean un link
  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
    });
  });
}

// Cerrar menú si clickean fuera
document.addEventListener("click", (e) => {
  if (mobileMenu && !mobileMenu.contains(e.target) && e.target !== menuToggle) {
    mobileMenu.classList.remove("is-open");
  }
});

// --- VINCULAR BUSCADOR Y FILTROS ---
if (search) search.addEventListener("input", applyFilters);
if (filter) filter.addEventListener("change", applyFilters);


// ===== BOTÓN VOLVER ARRIBA (Versión Directa) =====
const topBtn = document.getElementById("topBtn");

if (topBtn) {
  // Forzamos que empiece oculto por JS
  topBtn.style.display = "none";

  window.addEventListener("scroll", () => {
    // Si bajamos más de 300px, lo mostramos
    if (window.scrollY > 300) {
      topBtn.style.display = "flex"; // "flex" para que el contenido (↑) se centre
    } else {
      topBtn.style.display = "none";
    }
  });

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Abrir y cerrar el carrito
function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return; // Seguridad por si no cargó el HTML
  
  drawer.classList.toggle("is-open");
  
  // Si lo abrimos, dibujamos los items
  if (drawer.classList.contains("is-open")) {
    renderCartItems();
  }
}

// Dibujar los productos dentro del carrito lateral
function renderCartItems() {
  const container = document.getElementById("cartItems");
  const totalSumEl = document.getElementById("cartTotalSum");
  if (!container) return;

  const todos = [...perfumes, ...decants, ...promos, ...desodorantes];
  const seleccionados = todos.filter(p => favoritos.includes(p.id));
  
  let total = 0;
  
  if (seleccionados.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">Tu lista está vacía...</p>';
    if(totalSumEl) totalSumEl.innerText = "$0";
    return;
  }

  container.innerHTML = seleccionados.map(p => {
    total += Number(p.precio) || 0;
    return `
      <div class="cart-item" style="display:flex; gap:10px; margin-bottom:15px; align-items:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:12px;">
        <img src="${imgSrc(p.imagen)}" style="width:50px; height:50px; object-fit:contain; background:#fff; border-radius:8px;">
        <div style="flex:1;">
          <div style="font-weight:bold; font-size:13px;">${p.nombre}</div>
          <div style="color:var(--gold); font-weight:bold;">$${moneyARS(p.precio)}</div>
        </div>
        <button onclick="toggleFav(${p.id}, event)" style="background:none; border:none; color:#ff4444; font-size:18px; cursor:pointer;">✕</button>
      </div>
    `;
  }).join("");
      
  if(totalSumEl) totalSumEl.innerText = `$${moneyARS(total)}`;
}

// Actualizamos el updateFavUI para que use el nuevo botón
function updateFavUI() {
    const countEl = document.getElementById('favCount');
    const floatBtn = document.getElementById('favButton');
    
    if(countEl) countEl.innerText = favoritos.length;
    
    // Si hay algo en la lista, mostramos el botón flotante
    if(floatBtn) {
      floatBtn.style.display = favoritos.length > 0 ? 'flex' : 'none';
    }
    
    // Si el carrito está abierto, lo refrescamos
    const drawer = document.getElementById("cartDrawer");
    if (drawer && drawer.classList.contains("is-open")) {
      renderCartItems();
    }
}

init();
updateFavUI();