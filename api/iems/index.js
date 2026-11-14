import { sql, values, ids, IEM_SELECT } from "../_lib/db.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const rows = await sql.query(`${IEM_SELECT} GROUP BY i.id ORDER BY i.id`);
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.name || !b.brand)
        return res.status(400).json({ message: "Nama dan merek wajib diisi." });
      const [row] = await sql.query(
        `WITH n AS (
           INSERT INTO iems (name,brand,driver,image_url,description,bass,midrange,treble,technicalities,review)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id),
         t AS (INSERT INTO iem_tunings (iem_id,tuning_id) SELECT n.id, unnest($11::int[]) FROM n),
         g AS (INSERT INTO iem_genres (iem_id,genre_id) SELECT n.id, unnest($12::int[]) FROM n)
         SELECT id FROM n`,
        [...values(b), ids(b.tuning_ids), ids(b.genre_ids)]
      );
      return res.status(201).json({ id: row.id });
    }
    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}