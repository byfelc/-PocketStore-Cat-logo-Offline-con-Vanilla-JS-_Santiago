const API_URL = "https://jsonplaceholder.typicode.com/users";
const CATEGORIAS = ["Ropa", "Audio", "Tech", "Hogar", "Juegos"];

const lista = document.getElementById("lista");
const mensaje = document.getElementById("mensaje");
const buscador = document.getElementById("buscador");
const estado = document.getElementById("net-status");

let usuarios = [];
let categoriaActiva = "todo";


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("SW registrado, scope:", reg.scope))
      .catch((err) => console.error("Error al registrar SW:", err));
  });
}


function actualizarEstado() {
  const online = navigator.onLine;
  estado.textContent = online ? "En línea" : "Sin conexión";
  estado.className = `badge ${online ? "online" : "offline"}`;
}
window.addEventListener("online", actualizarEstado);
window.addEventListener("offline", actualizarEstado);
actualizarEstado();


async function cargarUsuarios() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    usuarios = (await res.json()).map((u) => ({
      ...u,
      categoria: CATEGORIAS[u.id % CATEGORIAS.length],
    }));

    aplicarFiltros();
  } catch (err) {
    mensaje.textContent =
      "No hay conexión y aún no hay datos en caché. Abre la app una vez con internet.";
    console.error(err);
  }
}

function render(items) {
  lista.innerHTML = "";
  if (!items.length) return;

  const frag = document.createDocumentFragment();
  items.forEach((u) => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.className = "card-img";
    img.loading = "lazy";
    img.alt = `Imagen de ${u.name}`;
    img.src = `https://picsum.photos/seed/pocketstore${u.id}/400/200`;
    img.onerror = () => img.removeAttribute("src"); // queda el degradado

    const body = document.createElement("div");
    body.className = "card-body";

    const iniciales = u.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = iniciales;

    const info = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.textContent = u.name;
    const p1 = document.createElement("p");
    p1.textContent = u.email;
    const p2 = document.createElement("p");
    p2.textContent = `${u.company.name} · ${u.address.city}`;
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = u.categoria;
    info.append(h2, p1, p2, tag);

    body.append(avatar, info);
    card.append(img, body);
    frag.appendChild(card);
  });
  lista.appendChild(frag);
}


function aplicarFiltros() {
  const q = buscador.value.trim().toLowerCase();

  const filtrados = usuarios.filter(
    (u) =>
      (categoriaActiva === "todo" || u.categoria === categoriaActiva) &&
      (u.name.toLowerCase().includes(q) ||
        u.address.city.toLowerCase().includes(q) ||
        u.company.name.toLowerCase().includes(q))
  );

  mensaje.textContent = filtrados.length
    ? `${filtrados.length} elemento(s)${navigator.onLine ? "" : " (desde caché)"}`
    : "Sin resultados";

  render(filtrados);
}

buscador.addEventListener("input", aplicarFiltros);

document.querySelector(".categorias").addEventListener("click", (e) => {
  const btn = e.target.closest(".cat");
  if (!btn) return;
  document.querySelectorAll(".cat").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  categoriaActiva = btn.dataset.cat;
  aplicarFiltros();
});


cargarUsuarios();