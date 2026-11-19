import { sql } from "./db.js";
import { requireModerator } from "./auth.js";

// Tabel penghubung kategori ke IEM dan DAC (nilai tetap, bukan input pengguna)
const REL = {
  tunings: [
    { link: "iem_tunings", col: "tuning_id", fk: "iem_id", owner: "iems" },
    { link: "dac_tunings", col: "tuning_id", fk: "dac_id", owner: "dacs" }
  ],
  genres: [
    { link: "iem_genres", col: "genre_id", fk: "iem_id", owner: "iems" },
    { link: "dac_genres", col: "genre_id", fk: "dac_id", owner: "dacs" }
  ]
};

const fail = (res, e, label) => {
  if (e.code === "23505") {
    return res.status(409).json({ message: `${label} dengan nama itu sudah ada.` });
  }
  console.error(e);
  return res.status(500).json({ message: "Terjadi kesalahan pada server." });
};

// Jumlah IEM dan DAC aktif (belum di sampah) yang memakai kategori ini
async function usageCount(table, id) {
  const counts = await Promise.all(
    REL[table].map(async (r) => {
      const [{ n }] = await sql.query(
        `SELECT COUNT(*)::int AS n
           FROM ${r.link} x
           JOIN ${r.owner} o ON o.id = x.${r.fk}
          WHERE x.${r.col} = $1 AND o.deleted_at IS NULL`,
        [id]
      );
      return n;
    })
  );
  return counts.reduce((a, b) => a + b, 0);
}

// Satu fungsi per jenis kategori (table: "tunings" atau "genres"):
//   /api/tunings        -> GET daftar, POST tambah
//   /api/tunings?id=3   -> PUT ubah nama, DELETE pindahkan ke sampah
// GET terbuka untuk semua pengunjung; POST/PUT/DELETE hanya untuk moderator.
export const categoryHandler = (table, label) => async (req, res) => {
  try {
    const hasId = req.query.id !== undefined;
    const id = Number(req.query.id);
    if (hasId && !Number.isInteger(id)) {
      return res.status(400).json({ message: "ID tidak valid." });
    }

    if (!hasId) {
      if (req.method === "GET") {
        const rows = await sql.query(
          `SELECT id, name FROM ${table} WHERE deleted_at IS NULL ORDER BY id`
        );
        return res.status(200).json(rows);
      }
      if (req.method === "POST") {
        if (!requireModerator(req, res)) return;
        const name = (req.body?.name || "").trim();
        if (!name) {
          return res.status(400).json({ message: `Nama ${label} wajib diisi.` });
        }
        const [row] = await sql.query(
          `INSERT INTO ${table} (name) VALUES ($1) RETURNING id, name`,
          [name]
        );
        return res.status(201).json(row);
      }
      return res.status(405).json({ message: "Method tidak didukung." });
    }

    if (req.method === "PUT") {
      if (!requireModerator(req, res)) return;
      const name = (req.body?.name || "").trim();
      if (!name) {
        return res.status(400).json({ message: `Nama ${label} wajib diisi.` });
      }
      const rows = await sql.query(
        `UPDATE ${table} SET name = $2 WHERE id = $1 AND deleted_at IS NULL RETURNING id, name`,
        [id, name]
      );
      if (!rows.length) {
        return res.status(404).json({ message: `${label} tidak ditemukan.` });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === "DELETE") {
      if (!requireModerator(req, res)) return;
      const n = await usageCount(table, id);
      if (n > 0) {
        return res.status(409).json({
          message: `${label} masih dipakai oleh ${n} IEM/DAC. Lepaskan dulu dari item tersebut.`
        });
      }
      // Soft delete
      const rows = await sql.query(
        `UPDATE ${table} SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: `${label} tidak ditemukan.` });
      }
      return res.status(200).json({ message: `${label} dipindahkan ke sampah.` });
    }

    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    fail(res, e, label);
  }
};
