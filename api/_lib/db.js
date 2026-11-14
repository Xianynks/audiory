import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

export const FIELDS = ["name","brand","driver","image_url","description",
  "bass","midrange","treble","technicalities","review"];

export const values = (b) => FIELDS.map((f) => b[f] ?? "");
export const ids = (a) => (Array.isArray(a) ? a.map(Number) : []);

export const IEM_SELECT = `
  SELECT i.*,
    COALESCE(ARRAY_AGG(DISTINCT it.tuning_id) FILTER (WHERE it.tuning_id IS NOT NULL), '{}') AS tuning_ids,
    COALESCE(ARRAY_AGG(DISTINCT ig.genre_id) FILTER (WHERE ig.genre_id IS NOT NULL), '{}') AS genre_ids
  FROM iems i
  LEFT JOIN iem_tunings it ON it.iem_id = i.id
  LEFT JOIN iem_genres ig ON ig.iem_id = i.id`;