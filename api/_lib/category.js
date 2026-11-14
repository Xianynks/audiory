import { sql } from "./db.js";

const fail = (res, e, label) => {
  if (e.code === "23503")
    return res.status(409).json({ message: `${label} masih dipakai oleh IEM. Lepaskan dulu dari IEM tersebut.` });
  if (e.code === "23505")
    return res.status(409).json({ message: `${label} sudah ada.` });
  console.error(e);
  return res.status(500).json({ message: "Terjadi kesalahan pada server." });
};

// table: "tunings" atau "genres" (nilai tetap, bukan input pengguna)
export const listHandler = (table, label) => async (req, res) => {
  try {
    if (req.method === "GET")
      return res.status(200).json(await sql.query(`SELECT * FROM ${table} ORDER BY id`));
    if (req.method === "POST") {
      const name = (req.body?.name || "").trim();
      if (!name) return res.status(400).json({ message: `Nama ${label} wajib diisi.` });
      const [row] = await sql.query(`INSERT INTO ${table} (name) VALUES ($1) RETURNING *`, [name]);
      return res.status(201).json(row);
    }
    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) { fail(res, e, label); }
};

export const itemHandler = (table, label) => async (req, res) => {
  const id = Number(req.query.id);
  try {
    if (req.method === "PUT") {
      const name = (req.body?.name || "").trim();
      if (!name) return res.status(400).json({ message: `Nama ${label} wajib diisi.` });
      const rows = await sql.query(`UPDATE ${table} SET name=$2 WHERE id=$1 RETURNING *`, [id, name]);
      if (!rows.length) return res.status(404).json({ message: `${label} tidak ditemukan.` });
      return res.status(200).json(rows[0]);
    }
    if (req.method === "DELETE") {
      await sql.query(`DELETE FROM ${table} WHERE id=$1`, [id]);
      return res.status(200).json({ message: `${label} dihapus.` });
    }
    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) { fail(res, e, label); }
};