import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "db.json");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const writeDb = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

// Field IEM yang diterima dari klien
const IEM_FIELDS = [
  "name",
  "brand",
  "driver",
  "image_url",
  "description",
  "bass",
  "midrange",
  "treble",
  "technicalities",
  "review"
];

function pickIem(body) {
  const out = {};
  IEM_FIELDS.forEach((f) => (out[f] = body[f] ?? ""));
  out.tuning_ids = Array.isArray(body.tuning_ids) ? body.tuning_ids.map(Number) : [];
  out.genre_ids = Array.isArray(body.genre_ids) ? body.genre_ids.map(Number) : [];
  return out;
}

// ---------- IEM ----------
app.get("/iems", (req, res) => res.json(readDb().iems));

app.get("/iems/:id", (req, res) => {
  const iem = readDb().iems.find((i) => i.id === Number(req.params.id));
  if (!iem) return res.status(404).json({ message: "IEM tidak ditemukan." });
  res.json(iem);
});

app.post("/iems", (req, res) => {
  if (!req.body.name || !req.body.brand) {
    return res.status(400).json({ message: "Nama dan merek wajib diisi." });
  }
  const db = readDb();
  const iem = { id: nextId(db.iems), ...pickIem(req.body) };
  db.iems.push(iem);
  writeDb(db);
  res.status(201).json(iem);
});

app.put("/iems/:id", (req, res) => {
  const db = readDb();
  const idx = db.iems.findIndex((i) => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: "IEM tidak ditemukan." });
  db.iems[idx] = { id: db.iems[idx].id, ...pickIem(req.body) };
  writeDb(db);
  res.json(db.iems[idx]);
});

app.delete("/iems/:id", (req, res) => {
  const db = readDb();
  const before = db.iems.length;
  db.iems = db.iems.filter((i) => i.id !== Number(req.params.id));
  if (db.iems.length === before) {
    return res.status(404).json({ message: "IEM tidak ditemukan." });
  }
  writeDb(db);
  res.json({ message: "IEM dihapus." });
});

// ---------- Kategori (tunings & genres) ----------
function categoryRoutes(collection, relKey, label) {
  app.get(`/${collection}`, (req, res) => res.json(readDb()[collection]));

  app.post(`/${collection}`, (req, res) => {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: `Nama ${label} wajib diisi.` });
    const db = readDb();
    if (db[collection].some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ message: `${label} "${name}" sudah ada.` });
    }
    const item = { id: nextId(db[collection]), name };
    db[collection].push(item);
    writeDb(db);
    res.status(201).json(item);
  });

  app.put(`/${collection}/:id`, (req, res) => {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: `Nama ${label} wajib diisi.` });
    const db = readDb();
    const item = db[collection].find((c) => c.id === Number(req.params.id));
    if (!item) return res.status(404).json({ message: `${label} tidak ditemukan.` });
    item.name = name;
    writeDb(db);
    res.json(item);
  });

  app.delete(`/${collection}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const db = readDb();
    if (!db[collection].some((c) => c.id === id)) {
      return res.status(404).json({ message: `${label} tidak ditemukan.` });
    }
    // Cegah data tidak konsisten: tolak jika masih dipakai IEM
    const used = db.iems.filter((i) => (i[relKey] || []).includes(id)).length;
    if (used > 0) {
      return res.status(409).json({
        message: `${label} masih dipakai oleh ${used} IEM. Lepaskan dulu dari IEM tersebut.`
      });
    }
    db[collection] = db[collection].filter((c) => c.id !== id);
    writeDb(db);
    res.json({ message: `${label} dihapus.` });
  });
}

categoryRoutes("tunings", "tuning_ids", "Tuning");
categoryRoutes("genres", "genre_ids", "Genre");

app.listen(PORT, () => console.log(`Audiory API berjalan di http://localhost:${PORT}`));
