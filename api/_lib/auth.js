import crypto from "node:crypto";

// Login moderator tanpa tabel pengguna: akun moderator diatur lewat environment
// variable di Vercel.
//
//   MOD_USERNAME       nama pengguna moderator
//   MOD_PASSWORD_HASH  hash password, dibuat dengan scripts/buat-hash-password.mjs
//   SESSION_SECRET     kunci acak (minimal 32 karakter) untuk menandatangani sesi
//
// Sesi disimpan di cookie HttpOnly bertanda tangan (HMAC), jadi tidak bisa
// dibaca atau dipalsukan oleh JavaScript di halaman.

export const COOKIE_NAME = "audiory_session";
export const SESSION_HOURS = 12;

export function authConfigured() {
  return Boolean(
    process.env.MOD_USERNAME &&
      process.env.MOD_PASSWORD_HASH &&
      process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET.length >= 32
  );
}

const hmac = (payload) =>
  crypto.createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest("base64url");

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();

// Perbandingan waktu-konstan untuk dua teks
export const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

// Format hash: scrypt:<salt hex>:<hash hex>
export function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored || "").split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  if (!expected.length) return false;
  const actual = crypto.scryptSync(String(password), Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

export function createToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600 * 1000 })
  ).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

function parseCookies(header) {
  const out = {};
  String(header || "")
    .split(";")
    .forEach((part) => {
      const i = part.indexOf("=");
      if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
    });
  return out;
}

// Kembalikan { username } jika cookie sesi valid dan belum kedaluwarsa, selain itu null
export function getSession(req) {
  try {
    if (!authConfigured()) return null;
    const token = parseCookies(req.headers?.cookie)[COOKIE_NAME];
    if (!token) return null;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const a = Buffer.from(sig);
    const b = Buffer.from(hmac(payload));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return { username: String(data.u || "") };
  } catch {
    return null;
  }
}

// Dipakai di setiap endpoint yang mengubah data. Mengembalikan true jika
// moderator; jika bukan, langsung membalas 401 dan mengembalikan false.
export function requireModerator(req, res) {
  if (getSession(req)) return true;
  res.status(401).json({ message: "Aksi ini hanya untuk moderator. Silakan login." });
  return false;
}

const isHttps = (req) => String(req.headers?.["x-forwarded-proto"] || "").includes("https");

export function setSessionCookie(req, res, token) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}` +
      (isHttps(req) ? "; Secure" : "")
  );
}

export function clearSessionCookie(req, res) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` +
      (isHttps(req) ? "; Secure" : "")
  );
}

// Hash IP untuk pembatasan kecepatan; IP asli tidak disimpan.
export function ipHash(req) {
  const ip =
    String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  return crypto
    .createHash("sha256")
    .update(ip + (process.env.COMMENT_SALT || "audiory"))
    .digest("hex")
    .slice(0, 32);
}
