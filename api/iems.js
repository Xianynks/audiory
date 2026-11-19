import { sql, values, ids, iemQuery, INSERT_IEM_SQL, UPDATE_IEM_SQL } from "./_lib/db.js";
import { requireModerator } from "./_lib/auth.js";

// Satu fungsi untuk semua operasi IEM (jumlah fungsi di Vercel Hobby dibatasi):
//   /api/iems          -> GET daftar, POST tambah
//   /api/iems?id=5     -> GET detail, PUT ubah, DELETE pindahkan ke sampah
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
        return res.status(200).json(await sql.query(iemQuery()));
      }
      if (req.method === "POST") {
        if (!requireModerator(req, res)) return;
        const b = req.body || {};
        if (!b.name || !b.brand) {
          return res.status(400).json({ message: "Nama dan merek wajib diisi." });
        }
        const [row] = await sql.query(INSERT_IEM_SQL, [
          ...values(b),
          ids(b.tuning_ids),
          ids(b.genre_ids)
        ]);
        return res.status(201).json({ id: row.id });
      }
      return res.status(405).json({ message: "Method tidak didukung." });
    }

    if (req.method === "GET") {
      const rows = await sql.query(iemQuery("AND i.id = $1"), [id]);
      if (!rows.length) {
        return res.status(404).json({ message: "IEM tidak ditemukan." });
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
        "SELECT 1 FROM iems WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );
      if (!exist.length) {
        return res.status(404).json({ message: "IEM tidak ditemukan." });
      }
      await sql.transaction([
        sql.query(UPDATE_IEM_SQL, [id, ...values(b)]),
        sql.query("DELETE FROM iem_tunings WHERE iem_id = $1", [id]),
        sql.query("DELETE FROM iem_genres WHERE iem_id = $1", [id]),
        sql.query(
          "INSERT INTO iem_tunings (iem_id, tuning_id) SELECT $1, unnest($2::int[])",
          [id, ids(b.tuning_ids)]
        ),
        sql.query(
          "INSERT INTO iem_genres (iem_id, genre_id) SELECT $1, unnest($2::int[])",
          [id, ids(b.genre_ids)]
        )
      ]);
      return res.status(200).json({ id });
    }

    if (req.method === "DELETE") {
      if (!requireModerator(req, res)) return;
      // Soft delete: data tetap ada dan bisa dipulihkan dari menu Sampah
      const rows = await sql.query(
        "UPDATE iems SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id",
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: "IEM tidak ditemukan." });
      }
      return res.status(200).json({ message: "IEM dipindahkan ke sampah." });
    }

    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
