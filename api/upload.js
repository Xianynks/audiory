import { handleUpload } from "@vercel/blob/client";
import { requireModerator } from "./_lib/auth.js";

// Membuat token upload sekali pakai. File dikirim langsung dari browser ke
// Vercel Blob, jadi tidak terkena batas ukuran body 4,5 MB milik Vercel Functions.
//
// Hanya moderator yang login yang bisa mengunggah. Batas jenis dan ukuran file
// di bawah menambah lapisan pengaman.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method tidak didukung." });
  }
  // Hanya moderator yang boleh mengunggah gambar
  if (!requireModerator(req, res)) return;
  try {
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: 5 * 1024 * 1024,
        addRandomSuffix: true
      })
    });
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Gagal menyiapkan unggahan gambar." });
  }
}
