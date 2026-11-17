import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

// Kolom tabel iems yang diisi dari form (urutan = urutan parameter SQL)
export const COLS = [
  "name",
  "brand",
  "driver",
  "image_url",
  "fr_image_url",
  "description",
  "bass",
  "midrange",
  "treble",
  "technicalities",
  "review",
  "release_price",
  "market_price",
  "package_contents",
  "sensitivity",
  "dac_need"
];

const PRICE_COLS = ["release_price", "market_price"];
export const DAC_OPTIONS = ["tidak_perlu", "disarankan", "wajib"];

// Ubah isi form menjadi array parameter sesuai urutan COLS
export function values(body) {
  return COLS.map((c) => {
    const v = body[c];
    if (PRICE_COLS.includes(c)) {
      if (v === "" || v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
    }
    if (c === "dac_need") return DAC_OPTIONS.includes(v) ? v : "tidak_perlu";
    return v ?? "";
  });
}

export const ids = (a) => (Array.isArray(a) ? a.map(Number) : []);

// SELECT IEM aktif (belum dihapus) beserta ID tuning & genre yang masih aktif.
// `where` berisi syarat tambahan, contoh: "AND i.id = $1"
export const iemQuery = (where = "") => `
  SELECT i.*,
    COALESCE(ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL), '{}') AS tuning_ids,
    COALESCE(ARRAY_AGG(DISTINCT g.id) FILTER (WHERE g.id IS NOT NULL), '{}') AS genre_ids
  FROM iems i
  LEFT JOIN iem_tunings it ON it.iem_id = i.id
  LEFT JOIN tunings t ON t.id = it.tuning_id AND t.deleted_at IS NULL
  LEFT JOIN iem_genres ig ON ig.iem_id = i.id
  LEFT JOIN genres g ON g.id = ig.genre_id AND g.deleted_at IS NULL
  WHERE i.deleted_at IS NULL ${where}
  GROUP BY i.id
  ORDER BY i.id`;

const n = COLS.length;

// Parameter: $1..$n kolom IEM, $n+1 array tuning_ids, $n+2 array genre_ids
export const INSERT_IEM_SQL = `
  WITH new_iem AS (
    INSERT INTO iems (${COLS.join(",")})
    VALUES (${COLS.map((_, i) => `$${i + 1}`).join(",")})
    RETURNING id
  ),
  t AS (
    INSERT INTO iem_tunings (iem_id, tuning_id)
    SELECT new_iem.id, unnest($${n + 1}::int[]) FROM new_iem
  ),
  g AS (
    INSERT INTO iem_genres (iem_id, genre_id)
    SELECT new_iem.id, unnest($${n + 2}::int[]) FROM new_iem
  )
  SELECT id FROM new_iem`;

// Parameter: $1 id, $2..$n+1 kolom IEM
export const UPDATE_IEM_SQL = `
  UPDATE iems SET ${COLS.map((c, i) => `${c} = $${i + 2}`).join(", ")}
  WHERE id = $1 AND deleted_at IS NULL`;
