import { sql } from "../_lib/db.js";
import { requireModerator, ipHash } from "../_lib/auth.js";

// Komentar menempel pada IEM atau DAC (nilai tetap, bukan input langsung)
const TARGET = {
  iem: { col: "iem_id", table: "iems", label: "IEM" },
  dac: { col: "dac_id", table: "dacs", label: "DAC" }
};
const STATUSES = ["pemilik", "calon_pembeli"];

const NAME_MAX = 40;
const BODY_MIN = 2;
const BODY_MAX = 1000;
const RATE_MAX = 5; // jumlah komentar maksimal ...
const RATE_WINDOW_MIN = 5; // ... dalam jangka waktu ini (menit) per pengunjung

const COLUMNS = "c.id, c.parent_id, c.author_name, c.author_status, c.body, c.created_at";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // /api/comments?type=iem&id=5
      const t = TARGET[req.query.type];
      const id = Number(req.query.id);
      if (!t || !Number.isInteger(id)) {
        return res.status(400).json({ message: "Data tidak valid." });
      }
      const rows = await sql.query(
        `SELECT ${COLUMNS} FROM comments c
          WHERE c.${t.col} = $1 AND c.deleted_at IS NULL
            AND (c.parent_id IS NULL OR EXISTS (
                  SELECT 1 FROM comments p WHERE p.id = c.parent_id AND p.deleted_at IS NULL))
          ORDER BY c.created_at ASC, c.id ASC LIMIT 500`,
        [id]
      );
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const b = req.body || {};
      const t = TARGET[b.type];
      const id = Number(b.id);
      if (!t || !Number.isInteger(id)) {
        return res.status(400).json({ message: "Data tidak valid." });
      }

      const name = String(b.author_name || "").trim().slice(0, NAME_MAX) || "Anonim";
      const text = String(b.body || "").trim();
      const status = STATUSES.includes(b.author_status) ? b.author_status : null;
      if (text.length < BODY_MIN || text.length > BODY_MAX) {
        return res.status(400).json({
          message: `Komentar harus berisi ${BODY_MIN}–${BODY_MAX} karakter.`
        });
      }

      // IEM/DAC harus ada dan belum dihapus
      const item = await sql.query(
        `SELECT 1 FROM ${t.table} WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (!item.length) {
        return res.status(404).json({ message: `${t.label} tidak ditemukan.` });
      }

      // Balasan: hanya satu tingkat dan harus pada komentar di item yang sama
      let parentId = null;
      if (b.parent_id !== undefined && b.parent_id !== null && b.parent_id !== "") {
        parentId = Number(b.parent_id);
        const parent = Number.isInteger(parentId)
          ? await sql.query(
              `SELECT parent_id FROM comments WHERE id = $1 AND ${t.col} = $2 AND deleted_at IS NULL`,
              [parentId, id]
            )
          : [];
        if (!parent.length) {
          return res.status(404).json({ message: "Komentar yang dibalas tidak ditemukan." });
        }
        if (parent[0].parent_id !== null) {
          return res.status(400).json({ message: "Balasan hanya bisa satu tingkat." });
        }
      }

      // Batasi kecepatan kirim per pengunjung
      const hash = ipHash(req);
      const [{ n }] = await sql.query(
        `SELECT COUNT(*)::int AS n FROM comments
          WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL '${RATE_WINDOW_MIN} minutes'`,
        [hash]
      );
      if (n >= RATE_MAX) {
        return res.status(429).json({
          message: "Terlalu banyak komentar dalam waktu singkat. Coba lagi beberapa menit lagi."
        });
      }

      const [row] = await sql.query(
        `INSERT INTO comments (${t.col}, parent_id, author_name, author_status, body, ip_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, parent_id, author_name, author_status, body, created_at`,
        [id, parentId, name, status, text, hash]
      );
      return res.status(201).json(row);
    }

    if (req.method === "DELETE") {
      // /api/comments?id=12  (hanya moderator) -> pindahkan ke sampah
      if (!requireModerator(req, res)) return;
      const id = Number(req.query.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID tidak valid." });
      }
      const rows = await sql.query(
        "UPDATE comments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id",
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: "Komentar tidak ditemukan." });
      }
      return res.status(200).json({ message: "Komentar dipindahkan ke sampah." });
    }

    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
