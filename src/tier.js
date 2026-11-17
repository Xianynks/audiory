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

export const DAC_OPTIONS = [
  { value: "tidak_perlu", label: "Tidak perlu" },
  { value: "disarankan", label: "Disarankan" },
  { value: "wajib", label: "Wajib" }
];

export const dacLabel = (value) =>
  DAC_OPTIONS.find((o) => o.value === value)?.label ?? "Tidak perlu";

export const JACK_OPTIONS = [
  { value: "3.5mm", label: "3.5mm" },
  { value: "4.4mm", label: "4.4mm" },
  { value: "keduanya", label: "3.5mm + 4.4mm" }
];

export const jackLabel = (value) =>
  JACK_OPTIONS.find((o) => o.value === value)?.label ?? "-";
