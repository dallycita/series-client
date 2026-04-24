import { fetchSeriesById, addRating, getRatings } from "./api.js";

const params = new URLSearchParams(window.location.search);
const seriesId = params.get("id");

const BACKEND_URL = "https://series-api-xxxx.onrender.com"; // cambia por tu URL real

async function loadDetail() {
    if (!seriesId) {
        document.getElementById("detail-content").innerHTML = "<p>ID no válido.</p>";
        return;
    }

    const s = await fetchSeriesById(seriesId);

    document.title = `${s.title} — Series Tracker`;

    document.getElementById("detail-content").innerHTML = `
        <div class="detail-hero">
            <img
                src="${s.image_path ? BACKEND_URL + s.image_path : 'https://placehold.co/220x330?text=Sin+imagen'}"
                alt="${s.title}"
            >
            <div class="detail-info">
                <span class="badge badge-${s.status}">${s.status}</span>
                <h2>${s.title}</h2>
                <p>${s.genre || "Sin género"} ${s.year ? "· " + s.year : ""}</p>
                <p class="synopsis">${s.synopsis || "Sin sinopsis."}</p>
                <div class="detail-actions">
                    <a href="index.html" class="back-link">← Volver</a>
                </div>
            </div>
        </div>

        <div class="ratings-section">
            <h3>Reseñas</h3>
            <div class="rating-form">
                <input type="number" id="rating-score" placeholder="Score (0-10)" min="0" max="10" step="0.1">
                <textarea id="rating-review" placeholder="Comentario (opcional)"></textarea>
                <button id="btn-submit-rating">Publicar</button>
            </div>
            <div id="ratings-list">
                <p style="color: var(--text-muted); font-size: 0.85rem;">Cargando reseñas...</p>
            </div>
        </div>
    `;

    document.getElementById("btn-submit-rating").addEventListener("click", submitRating);
    loadRatings();
}

async function loadRatings() {
    const ratings = await getRatings(seriesId);
    const container = document.getElementById("ratings-list");

    if (!ratings.length) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Sin reseñas aún. ¡Sé el primero!</p>`;
        return;
    }

    container.innerHTML = ratings.map(r => `
        <div class="rating-card">
            <span class="score">⭐ ${r.score} / 10</span>
            ${r.review ? `<p class="review">${r.review}</p>` : ""}
            <p class="date">${new Date(r.rated_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
    `).join("");
}

async function submitRating() {
    const score = parseFloat(document.getElementById("rating-score").value);
    const review = document.getElementById("rating-review").value.trim();

    if (isNaN(score) || score < 0 || score > 10) {
        alert("El score debe ser un número entre 0 y 10");
        return;
    }

    await addRating(seriesId, { score, review });
    document.getElementById("rating-score").value = "";
    document.getElementById("rating-review").value = "";
    loadRatings();
}

loadDetail();