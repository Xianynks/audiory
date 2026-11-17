import { sql, values, ids, iemQuery, UPDATE_IEM_SQL } from "../_lib/db.js";

export default async function handler(req, res) {
  const id = Number(req.query.id);
  try {
    if (req.method === "GET") {
      const rows = await sql.query(iemQuery("AND i.id = $1"), [id]);
      if (!rows.length) {
        return res.status(404).json({ message: "IEM tidak ditemukan." });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === "PUT") {
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
      // Soft delete: hanya menandai, data tetap ada dan bisa dipulihkan
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
