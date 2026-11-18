import { toInt } from "./db.js";

// Kolom tabel dacs yang diisi dari form (urutan = urutan parameter SQL).
// `sound_impression` = Impresi Suara, `review` = Review Lengkap.
export const DAC_COLS = [
  "name",
  "brand",
  "image_url",
  "description",
  "dac_chip",
  "amp_chip",
  "input_type",
  "output_jack",
  "power_se",
  "power_balanced",
  "power_impedance",
  "volume_control",
  "playback_control",
  "detachable_cable",
  "features",
  "sound_impression",
  "pros",
  "cons",
  "review",
  "release_price",
  "market_price",
  "package_contents"
];

const INT_COLS = [
  "power_se",
  "power_balanced",
  "power_impedance",
  "release_price",
  "market_price"
];
const BOOL_COLS = ["playback_control", "detachable_cable"];

export const JACK_OPTIONS = ["3.5mm", "4.4mm", "keduanya"];
export const VOLUME_OPTIONS = ["independent", "system"];

// true/false/kosong -> true/false/null
const toBool = (v) => {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return null;
};

export function dacValues(body) {
  return DAC_COLS.map((c) => {
    const v = body[c];
    if (INT_COLS.includes(c)) return toInt(v);
    if (BOOL_COLS.includes(c)) return toBool(v);
    if (c === "output_jack") return JACK_OPTIONS.includes(v) ? v : "3.5mm";
    if (c === "volume_control") return VOLUME_OPTIONS.includes(v) ? v : null;
    return v ?? "";
  });
}

// SELECT DAC aktif beserta ID tuning & genre yang masih aktif.
// `where` berisi syarat tambahan, contoh: "AND d.id = $1"
export const dacQuery = (where = "") => `
  SELECT d.*,
    COALESCE(ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL), '{}') AS tuning_ids,
    COALESCE(ARRAY_AGG(DISTINCT g.id) FILTER (WHERE g.id IS NOT NULL), '{}') AS genre_ids
  FROM dacs d
  LEFT JOIN dac_tunings dt ON dt.dac_id = d.id
  LEFT JOIN tunings t ON t.id = dt.tuning_id AND t.deleted_at IS NULL
  LEFT JOIN dac_genres dg ON dg.dac_id = d.id
  LEFT JOIN genres g ON g.id = dg.genre_id AND g.deleted_at IS NULL
  WHERE d.deleted_at IS NULL ${where}
  GROUP BY d.id
  ORDER BY d.id`;

const n = DAC_COLS.length;

// Parameter: $1..$n kolom DAC, $n+1 array tuning_ids, $n+2 array genre_ids
export const INSERT_DAC_SQL = `
  WITH new_dac AS (
    INSERT INTO dacs (${DAC_COLS.join(",")})
    VALUES (${DAC_COLS.map((_, i) => `$${i + 1}`).join(",")})
    RETURNING id
  ),
  t AS (
    INSERT INTO dac_tunings (dac_id, tuning_id)
    SELECT new_dac.id, unnest($${n + 1}::int[]) FROM new_dac
  ),
  g AS (
    INSERT INTO dac_genres (dac_id, genre_id)
    SELECT new_dac.id, unnest($${n + 2}::int[]) FROM new_dac
  )
  SELECT id FROM new_dac`;

// Parameter: $1 id, $2..$n+1 kolom DAC
export const UPDATE_DAC_SQL = `
  UPDATE dacs SET ${DAC_COLS.map((c, i) => `${c} = $${i + 2}`).join(", ")}
  WHERE id = $1 AND deleted_at IS NULL`;
