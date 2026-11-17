import { sql } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method tidak didukung." });
  }
  try {
    const [iems, tunings, genres] = await Promise.all([
      sql.query(
        "SELECT id, name, brand, deleted_at FROM iems WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
      ),
      sql.query(
        "SELECT id, name, deleted_at FROM tunings WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
      ),
      sql.query(
        "SELECT id, name, deleted_at FROM genres WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
      )
    ]);
    res.status(200).json({ iems, tunings, genres });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
