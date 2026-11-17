import { sql, values, ids, iemQuery, INSERT_IEM_SQL } from "../_lib/db.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const rows = await sql.query(iemQuery());
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
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

    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
