import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

const unwrap = (res) => res.data;

// Jika sesi moderator habis (401 dari endpoint selain login), beri tahu AuthProvider
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = String(err?.config?.url || "");
    if (err?.response?.status === 401 && !url.startsWith("/auth")) {
      window.dispatchEvent(new Event("audiory:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export const iemApi = {
  list: () => api.get("/iems").then(unwrap),
  get: (id) => api.get("/iems", { params: { id } }).then(unwrap),
  create: (data) => api.post("/iems", data).then(unwrap),
  update: (id, data) => api.put("/iems", data, { params: { id } }).then(unwrap),
  remove: (id) => api.delete("/iems", { params: { id } }).then(unwrap)
};

// type: "tunings" atau "genres"
export const categoryApi = (type) => ({
  list: () => api.get(`/${type}`).then(unwrap),
  create: (data) => api.post(`/${type}`, data).then(unwrap),
  update: (id, data) => api.put(`/${type}`, data, { params: { id } }).then(unwrap),
  remove: (id) => api.delete(`/${type}`, { params: { id } }).then(unwrap)
});

export const dacApi = {
  list: () => api.get("/dacs").then(unwrap),
  get: (id) => api.get("/dacs", { params: { id } }).then(unwrap),
  create: (data) => api.post("/dacs", data).then(unwrap),
  update: (id, data) => api.put("/dacs", data, { params: { id } }).then(unwrap),
  remove: (id) => api.delete("/dacs", { params: { id } }).then(unwrap)
};

export const trashApi = {
  list: () => api.get("/trash").then(unwrap),
  // type: "iems" | "dacs" | "tunings" | "genres" | "comments"
  restore: (type, id) => api.post("/trash", { type, id }).then(unwrap),
  // hapus permanen, hanya untuk data yang sudah ada di sampah
  purge: (type, id) => api.delete("/trash", { params: { type, id } }).then(unwrap)
};

// type: "iem" | "dac"
export const commentApi = {
  list: (type, id) => api.get("/comments", { params: { type, id } }).then(unwrap),
  // komentar terbaru dari semua item -> { items, hasMore }
  recent: (limit) => api.get("/comments", { params: { recent: 1, limit } }).then(unwrap),
  create: (type, id, data) => api.post("/comments", { type, id, ...data }).then(unwrap),
  // hanya moderator: pindahkan komentar/balasan ke sampah
  remove: (id) => api.delete("/comments", { params: { id } }).then(unwrap)
};

// Login moderator (sesi disimpan server dalam cookie HttpOnly)
export const authApi = {
  me: () => api.get("/auth").then(unwrap),
  login: (username, password) => api.post("/auth", { username, password }).then(unwrap),
  logout: () => api.delete("/auth").then(unwrap)
};

export const errorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Terjadi kesalahan.";

// Gambar cadangan jika image_url kosong atau gagal dimuat
export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='#DDE2EE'/><circle cx='200' cy='150' r='54' fill='none' stroke='#2F3FB8' stroke-width='12'/><circle cx='200' cy='150' r='20' fill='#F2B544'/></svg>`
  );
