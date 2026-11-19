import { sql } from "./_lib/db.js";
import {
  authConfigured,
  getSession,
  verifyPassword,
  safeEqual,
  createToken,
  setSessionCookie,
  clearSessionCookie,
  ipHash
} from "./_lib/auth.js";

const MAX_FAILS = 5; // percobaan gagal maksimal ...
const WINDOW_MIN = 15; // ... dalam jangka waktu ini (menit) per pengunjung

export default async function handler(req, res) {
  // Status login tidak boleh disimpan di cache
  res.setHeader("Cache-Control", "no-store");
  try {
    // Cek siapa yang sedang login
    if (req.method === "GET") {
      const s = getSession(req);
      return res.status(200).json({ moderator: Boolean(s), username: s?.username || "" });
    }

    // Logout
    if (req.method === "DELETE") {
      clearSessionCookie(req, res);
      return res.status(200).json({ message: "Berhasil keluar." });
    }

    // Login
    if (req.method === "POST") {
      if (!authConfigured()) {
        return res.status(500).json({
          message: "Login moderator belum dikonfigurasi di server (environment variable)."
        });
      }
      const hash = ipHash(req);

      const [{ n }] = await sql.query(
        `SELECT COUNT(*)::int AS n FROM login_attempts
          WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL '${WINDOW_MIN} minutes'`,
        [hash]
      );
      if (n >= MAX_FAILS) {
        return res.status(429).json({
          message: `Terlalu banyak percobaan gagal. Coba lagi dalam ${WINDOW_MIN} menit.`
        });
      }

      const { username = "", password = "" } = req.body || {};
      // Keduanya selalu dihitung agar waktu respons tidak membocorkan mana yang salah
      const userOk = safeEqual(username, process.env.MOD_USERNAME);
      const passOk = verifyPassword(password, process.env.MOD_PASSWORD_HASH);

      if (!(userOk && passOk)) {
        await sql.query("INSERT INTO login_attempts (ip_hash) VALUES ($1)", [hash]);
        await sql.query(
          "DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '1 day'"
        );
        return res.status(401).json({ message: "Username atau password salah." });
      }

      setSessionCookie(req, res, createToken(process.env.MOD_USERNAME));
      return res.status(200).json({ moderator: true, username: process.env.MOD_USERNAME });
    }

    res.status(405).json({ message: "Method tidak didukung." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
