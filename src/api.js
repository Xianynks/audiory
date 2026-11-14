import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000"
});

const unwrap = (res) => res.data;

export const iemApi = {
  list: () => api.get("/iems").then(unwrap),
  get: (id) => api.get(`/iems/${id}`).then(unwrap),
  create: (data) => api.post("/iems", data).then(unwrap),
  update: (id, data) => api.put(`/iems/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/iems/${id}`).then(unwrap)
};

// type: "tunings" atau "genres"
export const categoryApi = (type) => ({
  list: () => api.get(`/${type}`).then(unwrap),
  create: (data) => api.post(`/${type}`, data).then(unwrap),
  update: (id, data) => api.put(`/${type}/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/${type}/${id}`).then(unwrap)
});

export const errorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Terjadi kesalahan.";

// Gambar cadangan jika image_url kosong atau gagal dimuat
export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='#DDE2EE'/><circle cx='200' cy='150' r='54' fill='none' stroke='#2F3FB8' stroke-width='12'/><circle cx='200' cy='150' r='20' fill='#F2B544'/></svg>`
  );
