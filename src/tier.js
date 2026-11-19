// Batas harga kelas IEM (Rupiah). Ubah angka di sini kalau ingin
// menyesuaikan pembagian kelas; seluruh aplikasi otomatis mengikuti.
export const TIERS = [
  { max: 500000, name: "Budget" },
  { max: 1500000, name: "Entry-level" },
  { max: 5000000, name: "Mid-range" },
  { max: 15000000, name: "High-end" },
  { max: Infinity, name: "Flagship" }
];

// Kembalikan nama kelas, atau null jika harga kosong/tidak valid
export function tierOf(price) {
  if (price === null || price === undefined || price === "") return null;
  const p = Number(price);
  if (!Number.isFinite(p) || p < 0) return null;
  return TIERS.find((t) => p < t.max).name;
}

export const rupiah = (n) =>
  n === null || n === undefined || n === ""
    ? "-"
    : "Rp " + Number(n).toLocaleString("id-ID");

// Kebutuhan DAC/amp pada IEM disajikan sebagai catatan rekomendasi, bukan klaim wajib.
export const DAC_OPTIONS = [
  { value: "tidak_perlu", label: "Tidak perlu" },
  { value: "disarankan", label: "Disarankan" },
  { value: "wajib", label: "Sangat disarankan" }
];

export const dacLabel = (value) =>
  DAC_OPTIONS.find((o) => o.value === value)?.label ?? "Tidak perlu";

export const dacNote = (value) =>
  ({
    tidak_perlu: "Bisa dipakai langsung dari perangkat tanpa DAC/amp tambahan.",
    disarankan: "Hasil lebih baik dengan DAC/amp tambahan.",
    wajib: "Sangat disarankan memakai DAC/amp tambahan agar performanya optimal."
  })[value] ?? "";

export const JACK_OPTIONS = [
  { value: "3.5mm", label: "3.5mm" },
  { value: "4.4mm", label: "4.4mm" },
  { value: "keduanya", label: "3.5mm + 4.4mm" }
];

export const jackLabel = (value) =>
  JACK_OPTIONS.find((o) => o.value === value)?.label ?? "-";

export const VOLUME_OPTIONS = [
  { value: "independent", label: "Independent volume control" },
  { value: "system", label: "System volume" }
];

export const volumeLabel = (value) =>
  VOLUME_OPTIONS.find((o) => o.value === value)?.label ?? "";

// Daya output: angka mW dan impedansi uji terpisah, contoh "100 mW @ 32 Ω"
export function formatPower(mw, ohm) {
  if (mw === null || mw === undefined || mw === "") return "";
  const base = `${Number(mw).toLocaleString("id-ID")} mW`;
  return ohm === null || ohm === undefined || ohm === ""
    ? base
    : `${base} @ ${Number(ohm).toLocaleString("id-ID")} Ω`;
}

// Teks multibaris -> daftar baris tidak kosong
export const lines = (text) =>
  (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== "";

// Pilihan connector kabel IEM
export const CONNECTOR_OPTIONS = [
  { value: "2-Pin 0.78 mm", label: "2-Pin 0.78 mm" },
  { value: "QDC Type-C", label: "QDC Type-C" },
  { value: "QDC Type-B", label: "QDC Type-B" },
  { value: "MMCX", label: "MMCX" }
];
