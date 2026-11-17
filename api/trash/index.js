import { sql } from "../_lib/db.js";

// Tabel yang boleh dipulihkan (whitelist, bukan input langsung)
const TABLES = { iems: "IEM", dacs: "DAC", tunings: "Tuning", genres: "Genre" };

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const [iems, dacs, tunings, genres] = await Promise.all([
        sql.query(
          "SELECT id, name, brand, deleted_at FROM iems WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
        ),
        sql.query(
          "SELECT id, name, brand, deleted_at FROM dacs WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
        ),
        sql.query(
          "SELECT id, name, deleted_at FROM tunings WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
        ),
        sql.query(
          "SELECT id, name, deleted_at FROM genres WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
        )
      ]);
      return res.status(200).json({ iems, dacs, tunings, genres });
    }

    if (req.method === "POST") {
      // Pulihkan: body { type: "iems" | "dacs" | "tunings" | "genres", id }
      const { type } = req.body || {};
      const id = Number(req.body?.id);
      const label = TABLES[type];
      if (!label || !Number.isInteger(id)) {
        return res.status(400).json({ message: "Data tidak valid." });
      }
      const rows = await sql.query(
        `UPDATE ${type} SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id`,
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: `${label} tidak ada di sampah.` });
      }
      return res.status(200).json({ message: `${label} dipulihkan.` });
    }

    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({
        message: "Tidak bisa memulihkan: sudah ada data aktif dengan nama yang sama."
      });
    }
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
