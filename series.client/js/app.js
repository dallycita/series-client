import { fetchSeries, createSeries, updateSeries, deleteSeries, uploadImage, BACKEND_URL } from "./api.js";
import { exportCSV, exportXLSX } from "./export.js";

let currentPage = 1;
let currentSearch = "";
let currentSort = "created_at";
let currentOrder = "desc";
let currentStatus = "";
let allSeriesCache = [];

function resolveImage(path) {
    if (!path) return 'https://placehold.co/300x450/111113/52505f?text=—';
    if (path.startsWith("http")) return path;
    return BACKEND_URL + path;
}

async function loadSeries() {
    const params = { page: currentPage, q: currentSearch, sort: currentSort, order: currentOrder };
    const { data, total_pages } = await fetchSeries(params);
    const filtered = currentStatus ? data.filter(s => s.status === currentStatus) : data;
    allSeriesCache = data;
    renderCards(filtered);
    renderPagination(total_pages);
}

function renderCards(series) {
    const grid = document.getElementById("series-grid");
    if (!series.length) {
        grid.innerHTML = `<p style="padding:2rem;color:var(--text3);font-size:13px">Sin resultados.</p>`;
        return;
    }
    grid.innerHTML = series.map(s => `
        <div class="card" data-id="${s.id}">
            <div class="card-thumb">
                <img src="${resolveImage(s.image_path)}" alt="${s.title}">
                <div class="card-overlay">
                    <div class="card-overlay-actions">
                        <button onclick="openEditModal(${s.id})">Editar</button>
                        <button class="danger" onclick="handleDelete(${s.id})">Eliminar</button>
                    </div>
                </div>
            </div>
            <div class="card-info">
                <span class="badge badge-${s.status}">${s.status}</span>
                <h3><a href="detail.html?id=${s.id}">${s.title}</a></h3>
                <p>${s.genre || ""}${s.year ? (s.genre ? " · " : "") + s.year : ""}</p>
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

document.getElementById("search-input").addEventListener("input", e => {
    currentSearch = e.target.value;
    currentPage = 1;
    loadSeries();
});

document.getElementById("sort-select").addEventListener("change", e => {
    [currentSort, currentOrder] = e.target.value.split("-");
    loadSeries();
});

const exportBtn = document.getElementById("btn-export");
const exportMenu = document.getElementById("export-menu");
exportBtn.addEventListener("click", e => {
    e.stopPropagation();
    exportMenu.classList.toggle("open");
});
document.addEventListener("click", () => exportMenu.classList.remove("open"));

document.getElementById("btn-csv").addEventListener("click", () => { exportCSV(allSeriesCache); exportMenu.classList.remove("open"); });
document.getElementById("btn-xlsx").addEventListener("click", () => { exportXLSX(allSeriesCache); exportMenu.classList.remove("open"); });

const filterPanel = document.getElementById("filter-panel");
document.getElementById("btn-filter").addEventListener("click", e => {
    e.stopPropagation();
    filterPanel.classList.toggle("open");
});

document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
        document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentStatus = chip.dataset.status;
        currentPage = 1;
        loadSeries();
    });
});

document.getElementById("form-image").addEventListener("change", e => {
    const file = e.target.files[0];
    document.getElementById("file-label-text").textContent = file ? file.name : "Subir imagen (JPG, PNG, WebP · máx 1 MB)";
});

const modal = document.getElementById("modal");
document.getElementById("btn-new").addEventListener("click", () => openModal());

window.openEditModal = (id) => {
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
    document.getElementById("form-image").dataset.currentPath = series?.image_path || "";
    document.getElementById("form-image").value = "";
    document.getElementById("file-label-text").textContent = series?.image_path
        ? "Imagen actual — click para cambiar"
        : "Subir imagen (JPG, PNG, WebP · máx 1 MB)";
    modal.classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => modal.classList.add("hidden"));
document.getElementById("modal").addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });

document.getElementById("series-form").addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("form-id").value;
    const imageInput = document.getElementById("form-image");
    const imageFile = imageInput.files[0];

    let image_path = null;
    if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image_path = uploaded.image_path;
    } else if (id) {
        image_path = imageInput.dataset.currentPath || null;
    }

    const payload = {
        title: document.getElementById("form-title").value,
        genre: document.getElementById("form-genre").value,
        status: document.getElementById("form-status").value,
        year: parseInt(document.getElementById("form-year").value) || null,
        synopsis: document.getElementById("form-synopsis").value,
        image_path
    };

    if (id) { await updateSeries(id, payload); }
    else { await createSeries(payload); }
    modal.classList.add("hidden");
    loadSeries();
});

window.handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta serie?")) return;
    await deleteSeries(id);
    loadSeries();
};

loadSeries();