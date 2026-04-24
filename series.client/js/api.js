const BASE_URL = "https://series-api-pbls.onrender.com";

export async function fetchSeries({ page = 1, limit = 10, q = "", sort = "created_at", order = "desc" } = {}) {
    const params = new URLSearchParams({ page, limit, q, sort, order });
    const res = await fetch(`${BASE_URL}/series?${params}`);
    if (!res.ok) throw new Error("Error al obtener series");
    return res.json();
}

export async function fetchSeriesById(id) {
    const res = await fetch(`${BASE_URL}/series/${id}`);
    if (!res.ok) throw new Error("Serie no encontrada");
    return res.json();
}

export async function createSeries(data) {
    const res = await fetch(`${BASE_URL}/series`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al crear");
    }
    return res.json();
}

export async function updateSeries(id, data) {
    const res = await fetch(`${BASE_URL}/series/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al actualizar");
    return res.json();
}

export async function deleteSeries(id) {
    const res = await fetch(`${BASE_URL}/series/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
}

export async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Error al subir imagen");
    return res.json(); // { image_path: "/uploads/uuid.jpg" }
}

export async function addRating(seriesId, data) {
    const res = await fetch(`${BASE_URL}/series/${seriesId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al guardar rating");
    return res.json();
}

export async function getRatings(seriesId) {
    const res = await fetch(`${BASE_URL}/series/${seriesId}/rating`);
    if (!res.ok) throw new Error("Error al obtener ratings");
    return res.json();
}

export const BACKEND_URL = BASE_URL;