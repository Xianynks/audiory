// Membuat hash password moderator dan kunci sesi untuk environment variable Vercel.
//
// Cara pakai (jalankan di komputer Anda, bukan di server):
//   node scripts/buat-hash-password.mjs "password-yang-kuat"
//
// Salin dua baris hasilnya ke Vercel > Settings > Environment Variables
// (centang Sensitive). Tambahkan juga MOD_USERNAME berisi nama pengguna pilihan Anda.
import crypto from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Pemakaian: node scripts/buat-hash-password.mjs "password-minimal-8-karakter"');
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);

console.log(`MOD_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString("hex")}`);
