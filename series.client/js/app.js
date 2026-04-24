import { fetchSeries, createSeries, updateSeries, deleteSeries, uploadImage } from "./api.js";
import { exportCSV, exportXLSX } from "./export.js";

let currentPage = 1;
let currentSearch = "";
let currentSort = "created_at";
let currentOrder = "desc";
let allSeriesCache = [];

async function loadSeries() {
    const { data, total_count, total_pages } = await fetchSeries({
        page: currentPage,
        q: currentSearch,
        sort: currentSort,
        order: currentOrder
    });
    allSeriesCache = data;
    renderCards(data);
    renderPagination(total_pages);
}

function renderCards(series) {
    const grid = document.getElementById("series-grid");
    grid.innerHTML = series.map(s => `
        <div class="card" data-id="${s.id}">
            <img src="${s.image_path ? 'https://series-api-pbls.onrender.com' + s.image_path : 'https://placehold.co/300x450?text=Sin+imagen'}" alt="${s.title}">
            <div class="card-info">
                <span class="badge badge-${s.status}">${s.status}</span>
                <h3><a href="detail.html?id=${s.id}">${s.title}</a></h3>
                <p>${s.genre || ""} ${s.year ? "· " + s.year : ""}</p>
                <div class="card-actions">
                    <button onclick="openEditModal(${s.id})">Editar</button>
                    <button class="danger" onclick="handleDelete(${s.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join("");
}

function renderPagination(totalPages) {
    const el = document.getElementById("pagination");
    el.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "active" : "";
        btn.onclick = () => { currentPage = i; loadSeries(); };
        el.appendChild(btn);
    }
}

// Búsqueda
document.getElementById("search-input").addEventListener("input", e => {
    currentSearch = e.target.value;
    currentPage = 1;
    loadSeries();
});

// Ordenamiento
document.getElementById("sort-select").addEventListener("change", e => {
    [currentSort, currentOrder] = e.target.value.split("-");
    loadSeries();
});

// Exports
document.getElementById("btn-csv").addEventListener("click", () => exportCSV(allSeriesCache));
document.getElementById("btn-xlsx").addEventListener("click", () => exportXLSX(allSeriesCache));

// Crear / Editar
const modal = document.getElementById("modal");
document.getElementById("btn-new").addEventListener("click", () => openModal());

window.openEditModal = async (id) => {
    const s = allSeriesCache.find(x => x.id === id);
    openModal(s);
};

function openModal(series = null) {
    document.getElementById("modal-title").textContent = series ? "Editar serie" : "Nueva serie";
    document.getElementById("form-id").value = series?.id || "";
    document.getElementById("form-title").value = series?.title || "";
    document.getElementById("form-genre").value = series?.genre || "";
    document.getElementById("form-status").value = series?.status || "pendiente";
    document.getElementById("form-year").value = series?.year || "";
    document.getElementById("form-synopsis").value = series?.synopsis || "";
    modal.classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => modal.classList.add("hidden"));

document.getElementById("series-form").addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("form-id").value;
    const imageFile = document.getElementById("form-image").files[0];

    let image_path = null;
    if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image_path = uploaded.image_path;
    }

    const payload = {
        title: document.getElementById("form-title").value,
        genre: document.getElementById("form-genre").value,
        status: document.getElementById("form-status").value,
        year: parseInt(document.getElementById("form-year").value) || null,
        synopsis: document.getElementById("form-synopsis").value,
        ...(image_path && { image_path })
    };

    if (id) {
        await updateSeries(id, payload);
    } else {
        await createSeries(payload);
    }
    modal.classList.add("hidden");
    loadSeries();
});

window.handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta serie?")) return;
    await deleteSeries(id);
    loadSeries();
};

loadSeries();