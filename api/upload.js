import { handleUpload } from "@vercel/blob/client";

// Membuat token upload sekali pakai. File dikirim langsung dari browser ke
// Vercel Blob, jadi tidak terkena batas ukuran body 4,5 MB milik Vercel Functions.
//
// Catatan: aplikasi ini belum punya login, sehingga siapa pun yang tahu alamat
// endpoint ini bisa mengunggah gambar. Batas jenis dan ukuran file di bawah
// membatasi penyalahgunaan.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method tidak didukung." });
  }
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
