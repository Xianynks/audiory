import { sql, values, ids, IEM_SELECT } from "../_lib/db.js";

export default async function handler(req, res) {
  const id = Number(req.query.id);
  try {
    if (req.method === "GET") {
      const rows = await sql.query(`${IEM_SELECT} WHERE i.id = $1 GROUP BY i.id`, [id]);
      if (!rows.length) return res.status(404).json({ message: "IEM tidak ditemukan." });
      return res.status(200).json(rows[0]);
    }
    if (req.method === "PUT") {
      const b = req.body || {};
      if (!b.name || !b.brand)
        return res.status(400).json({ message: "Nama dan merek wajib diisi." });
      await sql.transaction([
        sql.query(
          `UPDATE iems SET name=$2,brand=$3,driver=$4,image_url=$5,description=$6,
             bass=$7,midrange=$8,treble=$9,technicalities=$10,review=$11 WHERE id=$1`,
          [id, ...values(b)]
        ),
        sql.query(`DELETE FROM iem_tunings WHERE iem_id=$1`, [id]),
        sql.query(`DELETE FROM iem_genres WHERE iem_id=$1`, [id]),
        sql.query(`INSERT INTO iem_tunings (iem_id,tuning_id) SELECT $1, unnest($2::int[])`, [id, ids(b.tuning_ids)]),
        sql.query(`INSERT INTO iem_genres (iem_id,genre_id) SELECT $1, unnest($2::int[])`, [id, ids(b.genre_ids)])
      ]);
      return res.status(200).json({ id });
    }
    if (req.method === "DELETE") {
      await sql.query(`DELETE FROM iems WHERE id=$1`, [id]);
      return res.status(200).json({ message: "IEM dihapus." });
    }
    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}