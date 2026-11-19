import { sql, ids } from "./_lib/db.js";
import { dacValues, dacQuery, INSERT_DAC_SQL, UPDATE_DAC_SQL } from "./_lib/dacs.js";
import { requireModerator } from "./_lib/auth.js";

// Satu fungsi untuk semua operasi DAC (jumlah fungsi di Vercel Hobby dibatasi):
//   /api/dacs          -> GET daftar, POST tambah
//   /api/dacs?id=5     -> GET detail, PUT ubah, DELETE pindahkan ke sampah
// GET terbuka untuk semua pengunjung; POST/PUT/DELETE hanya untuk moderator.
export default async function handler(req, res) {
  try {
    const hasId = req.query.id !== undefined;
    const id = Number(req.query.id);
    if (hasId && !Number.isInteger(id)) {
      return res.status(400).json({ message: "ID tidak valid." });
    }

    if (!hasId) {
      if (req.method === "GET") {
        return res.status(200).json(await sql.query(dacQuery()));
      }
      if (req.method === "POST") {
        if (!requireModerator(req, res)) return;
        const b = req.body || {};
        if (!b.name || !b.brand) {
          return res.status(400).json({ message: "Nama dan merek wajib diisi." });
        }
        const [row] = await sql.query(INSERT_DAC_SQL, [
          ...dacValues(b),
          ids(b.tuning_ids),
          ids(b.genre_ids)
        ]);
        return res.status(201).json({ id: row.id });
      }
      return res.status(405).json({ message: "Method tidak didukung." });
    }

    if (req.method === "GET") {
      const rows = await sql.query(dacQuery("AND d.id = $1"), [id]);
      if (!rows.length) {
        return res.status(404).json({ message: "DAC tidak ditemukan." });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === "PUT") {
      if (!requireModerator(req, res)) return;
      const b = req.body || {};
      if (!b.name || !b.brand) {
        return res.status(400).json({ message: "Nama dan merek wajib diisi." });
      }
      const exist = await sql.query(
        "SELECT 1 FROM dacs WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );
      if (!exist.length) {
        return res.status(404).json({ message: "DAC tidak ditemukan." });
      }
      await sql.transaction([
        sql.query(UPDATE_DAC_SQL, [id, ...dacValues(b)]),
        sql.query("DELETE FROM dac_tunings WHERE dac_id = $1", [id]),
        sql.query("DELETE FROM dac_genres WHERE dac_id = $1", [id]),
        sql.query(
          "INSERT INTO dac_tunings (dac_id, tuning_id) SELECT $1, unnest($2::int[])",
          [id, ids(b.tuning_ids)]
        ),
        sql.query(
          "INSERT INTO dac_genres (dac_id, genre_id) SELECT $1, unnest($2::int[])",
          [id, ids(b.genre_ids)]
        )
      ]);
      return res.status(200).json({ id });
    }

    if (req.method === "DELETE") {
      if (!requireModerator(req, res)) return;
      // Soft delete: data tetap ada dan bisa dipulihkan dari menu Sampah
      const rows = await sql.query(
        "UPDATE dacs SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id",
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: "DAC tidak ditemukan." });
      }
      return res.status(200).json({ message: "DAC dipindahkan ke sampah." });
    }

    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
