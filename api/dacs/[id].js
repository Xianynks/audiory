import { sql, ids } from "../_lib/db.js";
import { dacValues, dacQuery, UPDATE_DAC_SQL } from "../_lib/dacs.js";

export default async function handler(req, res) {
  const id = Number(req.query.id);
  try {
    if (req.method === "GET") {
      const rows = await sql.query(dacQuery("AND d.id = $1"), [id]);
      if (!rows.length) {
        return res.status(404).json({ message: "DAC tidak ditemukan." });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === "PUT") {
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
