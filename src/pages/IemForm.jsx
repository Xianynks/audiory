import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { iemApi, categoryApi, errorMessage } from "../api.js";
import { tierOf, DAC_OPTIONS, CONNECTOR_OPTIONS } from "../tier.js";
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

const EMPTY = {
  name: "",
  brand: "",
  driver: "",
  image_url: "",
  fr_image_url: "",
  description: "",
  bass: "",
  midrange: "",
  treble: "",
  technicalities: "",
  review: "",
  release_price: "",
  market_price: "",
  package_contents: "",
  sensitivity: "",
  impedance: "",
  connector: "",
  pros: "",
  cons: "",
  dac_need: "tidak_perlu",
  tuning_ids: [],
  genre_ids: []
};

// Nilai null dari database diubah jadi "" supaya input tetap terkontrol
const fromServer = (iem) =>
  Object.fromEntries(Object.entries(iem).map(([k, v]) => [k, v ?? ""]));

export default function IemForm() {
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
    if (isEdit) jobs.push(iemApi.get(id));
    Promise.all(jobs)
      .then(([t, g, iem]) => {
        setTunings(t);
        setGenres(g);
        if (iem) setForm({ ...EMPTY, ...fromServer(iem) });
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
        ? await iemApi.update(id, form)
        : await iemApi.create(form);
      navigate(`/iem/${saved.id ?? id}`);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  const num = { type: "number", min: 0, step: 1, inputMode: "numeric" };
  // Data lama yang diketik bebas dan tidak cocok dengan salah satu pilihan
  const legacyConnector =
    form.connector !== "" && !CONNECTOR_OPTIONS.some((o) => o.value === form.connector);

  return (
    <div className="detail">
      <Link to={isEdit ? `/iem/${id}` : "/"} className="back">
        &larr; Batal
      </Link>
      <h1 className="page-title">{isEdit ? "Edit IEM" : "Tambah IEM"}</h1>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <FormPanel title="Informasi produk">
          <Field label="Nama IEM" value={form.name} onChange={set("name")} required />
          <Field label="Merek" value={form.brand} onChange={set("brand")} required />
          <Field
            label="Konfigurasi driver"
            hint="Contoh: 1DD + 2BA"
            value={form.driver}
            onChange={set("driver")}
          />
          <ImageField
            label="Gambar IEM"
            folder="iem"
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
            label="Impedance (Ω)"
            value={form.impedance}
            onChange={set("impedance")}
            {...num}
          />
          <Field
            label="Sensitivity"
            hint="Tulis angka dan satuan, contoh: 102 dB/mW"
            value={form.sensitivity}
            onChange={set("sensitivity")}
          />
          <ChoiceChips
            legend="Connector"
            options={CONNECTOR_OPTIONS}
            value={form.connector}
            onChange={setValue("connector")}
            allowClear
            hint={
              legacyConnector
                ? `Nilai lama "${form.connector}" tidak ada di pilihan. Pilih salah satu opsi untuk menggantinya.`
                : "Opsional. Klik pilihan yang sedang aktif untuk mengosongkannya."
            }
          />
          <ChoiceChips
            legend="Rekomendasi DAC/amp"
            options={DAC_OPTIONS}
            value={form.dac_need}
            onChange={setValue("dac_need")}
            hint="Berupa catatan rekomendasi. Pilihan “Tidak perlu” tidak ditampilkan di halaman detail."
          />
          <ImageField
            label="Gambar Frequency Response (opsional)"
            folder="iem-fr"
            value={form.fr_image_url}
            onChange={setValue("fr_image_url")}
          />
        </FormPanel>

        <FormPanel
          title="Karakteristik suara"
          hint="Isi aspek yang relevan saja; yang kosong tidak akan ditampilkan."
        >
          <Area
            label="Bass"
            hint="Kuantitas, sub-bass, mid-bass, tekstur, punch, kontrol"
            value={form.bass}
            onChange={set("bass")}
          />
          <Area
            label="Midrange"
            hint="Ketebalan dan posisi vokal, timbre, detail"
            value={form.midrange}
            onChange={set("midrange")}
          />
          <Area
            label="Treble"
            hint="Kecerahan, ekstensi, energi, karakter cymbal"
            value={form.treble}
            onChange={set("treble")}
          />
          <Area
            label="Technicalities"
            hint="Detail retrieval, imaging, instrument separation, soundstage"
            value={form.technicalities}
            onChange={set("technicalities")}
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
            placeholder={"Earphone\nKabel\nEartips\nCarrying case"}
            value={form.package_contents}
            onChange={set("package_contents")}
          />
          <Area
            label="Review lengkap"
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
