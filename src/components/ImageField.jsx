import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { errorMessage } from "../api.js";

const MAX_MB = 5;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Input gambar: unggah file (disimpan di Vercel Blob) atau tempel URL.
// `value` adalah URL gambar, `onChange` menerima URL baru ("" untuk menghapus).
export default function ImageField({ label, value, onChange, folder = "img" }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya file yang sama bisa dipilih lagi
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setError("Format harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_MB} MB.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blob = await upload(`${folder}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload"
      });
      onChange(blob.url);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="field imgfield">
      <span>{label}</span>
      {value && <img className="imgprev" src={value} alt="Pratinjau gambar" />}
      <div className="imgrow">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tempel URL gambar atau klik Unggah"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={handleFile}
        />
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Mengunggah..." : "Unggah"}
        </button>
        {value && (
          <button type="button" className="btn" onClick={() => onChange("")}>
            Hapus
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
