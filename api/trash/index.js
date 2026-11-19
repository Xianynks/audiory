import { sql } from "../_lib/db.js";
import { requireModerator } from "../_lib/auth.js";

// Tabel yang boleh dipulihkan / dihapus permanen (whitelist, bukan input langsung)
const TABLES = {
  iems: "IEM",
  dacs: "DAC",
  tunings: "Tuning",
  genres: "Genre",
  comments: "Komentar"
};

// Tabel penghubung milik tiap kategori. Saat kategori dihapus permanen,
// hubungannya dengan IEM/DAC (yang masih ada di sampah) ikut dilepas.
const LINKS = {
  tunings: [
    { table: "iem_tunings", col: "tuning_id" },
    { table: "dac_tunings", col: "tuning_id" }
  ],
  genres: [
    { table: "iem_genres", col: "genre_id" },
    { table: "dac_genres", col: "genre_id" }
  ]
};

export default async function handler(req, res) {
  // Seluruh isi sampah hanya untuk moderator
  if (!requireModerator(req, res)) return;
  try {
    if (req.method === "GET") {
      const [iems, dacs, tunings, genres, comments] = await Promise.all([
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
        ),
        sql.query(
          `SELECT c.id, c.author_name, c.body, c.parent_id, c.deleted_at,
                  CASE WHEN c.iem_id IS NOT NULL THEN 'IEM' ELSE 'DAC' END AS target_label,
                  COALESCE(i.name, d.name) AS target_name
             FROM comments c
             LEFT JOIN iems i ON i.id = c.iem_id
             LEFT JOIN dacs d ON d.id = c.dac_id
            WHERE c.deleted_at IS NOT NULL
            ORDER BY c.deleted_at DESC`
        )
      ]);
      // Komentar ditampilkan dengan format yang sama seperti item lain (name + brand)
      const commentItems = comments.map((c) => ({
        id: c.id,
        name: `${c.author_name}: ${String(c.body).replace(/\s+/g, " ").slice(0, 70)}`,
        brand: `${c.parent_id ? "Balasan" : "Komentar"} pada ${c.target_label} ${c.target_name}`,
        deleted_at: c.deleted_at
      }));
      return res.status(200).json({ iems, dacs, tunings, genres, comments: commentItems });
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

    if (req.method === "DELETE") {
      // Hapus permanen: /api/trash?type=iems&id=1
      // Hanya data yang sudah ada di sampah yang boleh dihapus permanen.
      const { type } = req.query;
      const id = Number(req.query.id);
      const label = TABLES[type];
      if (!label || !Number.isInteger(id)) {
        return res.status(400).json({ message: "Data tidak valid." });
      }

      if (type === "comments") {
        // Balasan pada komentar ini ikut terhapus (ON DELETE CASCADE)
        const rows = await sql.query(
          "DELETE FROM comments WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id",
          [id]
        );
        if (!rows.length) {
          return res.status(404).json({ message: "Komentar tidak ada di sampah." });
        }
        return res.status(200).json({ message: "Komentar dihapus permanen." });
      }

      if (type === "iems" || type === "dacs") {
        // Relasi tuning/genre dan komentar ikut terhapus otomatis (ON DELETE CASCADE)
        const rows = await sql.query(
          `DELETE FROM ${type} WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id`,
          [id]
        );
        if (!rows.length) {
          return res.status(404).json({ message: `${label} tidak ada di sampah.` });
        }
        return res.status(200).json({ message: `${label} dihapus permanen.` });
      }

      // Tuning / Genre: lepas dulu hubungannya, baru hapus barisnya
      const exist = await sql.query(
        `SELECT 1 FROM ${type} WHERE id = $1 AND deleted_at IS NOT NULL`,
        [id]
      );
      if (!exist.length) {
        return res.status(404).json({ message: `${label} tidak ada di sampah.` });
      }
      await sql.transaction([
        ...LINKS[type].map((l) =>
          sql.query(`DELETE FROM ${l.table} WHERE ${l.col} = $1`, [id])
        ),
        sql.query(`DELETE FROM ${type} WHERE id = $1 AND deleted_at IS NOT NULL`, [id])
      ]);
      return res.status(200).json({ message: `${label} dihapus permanen.` });
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
