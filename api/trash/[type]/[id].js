import { sql } from "../../_lib/db.js";

// Daftar tabel yang boleh dipulihkan (whitelist, bukan input langsung)
const TABLES = { iems: "IEM", tunings: "Tuning", genres: "Genre" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method tidak didukung." });
  }
  const { type } = req.query;
  const id = Number(req.query.id);
  const label = TABLES[type];
  if (!label) {
    return res.status(400).json({ message: "Jenis data tidak dikenal." });
  }
  try {
    const rows = await sql.query(
      `UPDATE ${type} SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: `${label} tidak ada di sampah.` });
    }
    res.status(200).json({ message: `${label} dipulihkan.` });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({
        message: `Tidak bisa memulihkan: sudah ada ${label} aktif dengan nama yang sama.`
      });
    }
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
