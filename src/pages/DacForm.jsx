import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dacApi, categoryApi, errorMessage } from "../api.js";
import { tierOf, JACK_OPTIONS, VOLUME_OPTIONS } from "../tier.js";
import ImageField from "../components/ImageField.jsx";
import {
  FormPanel,
  Field,
  Area,
  ChoiceChips,
  ChipPicker
} from "../components/FormParts.jsx";

const tuningApi = categoryApi("tunings");
const genreApi = categoryApi("genres");

const ADA_TIDAK = [
  { value: true, label: "Ada" },
  { value: false, label: "Tidak ada" }
];

const EMPTY = {
  name: "",
  brand: "",
  image_url: "",
  description: "",
  dac_chip: "",
  amp_chip: "",
  input_type: "",
  output_jack: "3.5mm",
  power_se: "",
  power_balanced: "",
  power_impedance: "",
  volume_control: "",
  playback_control: "",
  detachable_cable: "",
  features: "",
  sound_impression: "",
  pros: "",
  cons: "",
  review: "",
  release_price: "",
  market_price: "",
  package_contents: "",
  tuning_ids: [],
  genre_ids: []
};

// Nilai null dari database diubah jadi "" supaya input tetap terkontrol
const fromServer = (dac) =>
  Object.fromEntries(Object.entries(dac).map(([k, v]) => [k, v ?? ""]));

export default function DacForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [tunings, setTunings] = useState([]);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const jobs = [tuningApi.list(), genreApi.list()];
    if (isEdit) jobs.push(dacApi.get(id));
    Promise.all(jobs)
      .then(([t, g, dac]) => {
        setTunings(t);
        setGenres(g);
        if (dac) setForm({ ...EMPTY, ...fromServer(dac) });
      })
      .catch((err) => setError(errorMessage(err)));
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key) => (value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value]
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = isEdit
        ? await dacApi.update(id, form)
        : await dacApi.create(form);
      navigate(`/dac/${saved.id ?? id}`);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  const num = { type: "number", min: 0, step: 1, inputMode: "numeric" };

  return (
    <div className="detail">
      <Link to={isEdit ? `/dac/${id}` : "/"} className="back">
        &larr; Batal
      </Link>
      <h1 className="page-title">{isEdit ? "Edit DAC/Amp" : "Tambah DAC/Amp"}</h1>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <FormPanel title="Informasi produk">
          <Field label="Nama DAC/Amp" value={form.name} onChange={set("name")} required />
          <Field label="Merek" value={form.brand} onChange={set("brand")} required />
          <ImageField
            label="Gambar DAC/Amp"
            folder="dac"
            value={form.image_url}
            onChange={setValue("image_url")}
          />
          <Area label="Deskripsi" value={form.description} onChange={set("description")} />
        </FormPanel>

        <FormPanel
          title="Harga dan kelas"
          hint="Kelas dihitung otomatis dari harga. Kosongkan jika harga tidak diketahui."
        >
          <Field
            label="Harga rilis (Rp)"
            value={form.release_price}
            onChange={set("release_price")}
            hint={`Kelas saat rilis: ${tierOf(form.release_price) || "-"}`}
            {...num}
          />
          <Field
            label="Harga pasaran sekarang (Rp)"
            value={form.market_price}
            onChange={set("market_price")}
            hint={`Kelas harga pasaran: ${tierOf(form.market_price) || "-"}`}
            {...num}
          />
        </FormPanel>

        <FormPanel title="Spesifikasi teknis">
          <Field
            label="DAC chip"
            hint="Contoh: Dual CS43131"
            value={form.dac_chip}
            onChange={set("dac_chip")}
          />
          <Field
            label="Amplifier chip (opsional)"
            hint="Isi jika informasinya diketahui"
            value={form.amp_chip}
            onChange={set("amp_chip")}
          />
          <Field
            label="Input"
            hint="Contoh: USB-C"
            value={form.input_type}
            onChange={set("input_type")}
          />
          <ChoiceChips
            legend="Jack output"
            options={JACK_OPTIONS}
            value={form.output_jack}
            onChange={setValue("output_jack")}
          />
        </FormPanel>

        <FormPanel
          title="Output power"
          hint="Isi angka dalam mW tanpa satuan. Kosongkan jika tidak diketahui, dan jangan mengisi angka perkiraan tanpa sumber."
        >
          <Field
            label="Power SE / 3.5 mm (mW)"
            value={form.power_se}
            onChange={set("power_se")}
            {...num}
          />
          <Field
            label="Power balanced / 4.4 mm (mW)"
            value={form.power_balanced}
            onChange={set("power_balanced")}
            {...num}
          />
          <Field
            label="Impedansi uji (Ω)"
            hint="Beban saat pengukuran sesuai sumber spesifikasi, contoh: 32. Catat impedansi aslinya bila bukan 32 Ω."
            value={form.power_impedance}
            onChange={set("power_impedance")}
            {...num}
          />
        </FormPanel>

        <FormPanel
          title="Fitur"
          hint="Klik pilihan yang sedang aktif untuk mengosongkannya."
        >
          <ChoiceChips
            legend="Volume control"
            options={VOLUME_OPTIONS}
            value={form.volume_control}
            onChange={setValue("volume_control")}
            allowClear
          />
          <ChoiceChips
            legend="Playback control"
            options={ADA_TIDAK}
            value={form.playback_control}
            onChange={setValue("playback_control")}
            allowClear
          />
          <ChoiceChips
            legend="Detachable cable"
            options={ADA_TIDAK}
            value={form.detachable_cable}
            onChange={setValue("detachable_cable")}
            allowClear
          />
          <Area
            label="Fitur lain"
            hint="Satu fitur per baris"
            placeholder={"Gain switch\nDukungan DSD"}
            value={form.features}
            onChange={set("features")}
          />
        </FormPanel>

        <FormPanel title="Impresi suara" hint="Catatan karakter suara jika tersedia dari pengamatan atau pengujian.">
          <Area
            label="Impresi suara"
            rows={5}
            value={form.sound_impression}
            onChange={set("sound_impression")}
          />
        </FormPanel>

        <FormPanel title="Kelebihan dan kekurangan" hint="Satu poin per baris.">
          <Area label="Kelebihan" value={form.pros} onChange={set("pros")} />
          <Area label="Kekurangan" value={form.cons} onChange={set("cons")} />
        </FormPanel>

        <FormPanel title="Isi paket dan review">
          <Area
            label="Isi paket penjualan"
            hint="Satu item per baris"
            placeholder={"DAC/Amp\nKabel USB-C\nKabel OTG"}
            value={form.package_contents}
            onChange={set("package_contents")}
          />
          <Area
            label="Review lengkap (opsional)"
            rows={5}
            value={form.review}
            onChange={set("review")}
          />
        </FormPanel>

        <FormPanel title="Kategori">
          <ChipPicker
            legend="Tuning"
            kind="tuning"
            items={tunings}
            selected={form.tuning_ids}
            onToggle={toggle("tuning_ids")}
            emptyText="Belum ada tuning. Tambahkan di menu Tuning."
          />
          <ChipPicker
            legend="Genre yang cocok"
            kind="genre"
            items={genres}
            selected={form.genre_ids}
            onToggle={toggle("genre_ids")}
            emptyText="Belum ada genre. Tambahkan di menu Genre."
          />
        </FormPanel>

        <div className="actions">
          <button className="btn primary" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
