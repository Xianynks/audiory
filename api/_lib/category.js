import { sql } from "./db.js";

// Tabel penghubung tiap kategori (nilai tetap, bukan input pengguna)
const REL = {
  tunings: { table: "iem_tunings", col: "tuning_id" },
  genres: { table: "iem_genres", col: "genre_id" }
};

const fail = (res, e, label) => {
  if (e.code === "23505") {
    return res.status(409).json({ message: `${label} dengan nama itu sudah ada.` });
  }
  console.error(e);
  return res.status(500).json({ message: "Terjadi kesalahan pada server." });
};

// table: "tunings" atau "genres"
export const listHandler = (table, label) => async (req, res) => {
  try {
    if (req.method === "GET") {
      const rows = await sql.query(
        `SELECT id, name FROM ${table} WHERE deleted_at IS NULL ORDER BY id`
      );
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
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
    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    fail(res, e, label);
  }
};

export const itemHandler = (table, label) => async (req, res) => {
  const id = Number(req.query.id);
  const rel = REL[table];
  try {
    if (req.method === "PUT") {
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
      // Tolak jika masih dipakai IEM yang aktif (belum di sampah)
      const [{ n }] = await sql.query(
        `SELECT COUNT(*)::int AS n
           FROM ${rel.table} r
           JOIN iems i ON i.id = r.iem_id
          WHERE r.${rel.col} = $1 AND i.deleted_at IS NULL`,
        [id]
      );
      if (n > 0) {
        return res.status(409).json({
          message: `${label} masih dipakai oleh ${n} IEM. Lepaskan dulu dari IEM tersebut.`
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
