import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dacApi, categoryApi, errorMessage } from "../api.js";
import { tierOf, JACK_OPTIONS } from "../tier.js";
import ImageField from "../components/ImageField.jsx";

const tuningApi = categoryApi("tunings");
const genreApi = categoryApi("genres");

const EMPTY = {
  name: "",
  brand: "",
  image_url: "",
  fr_image_url: "",
  description: "",
  dac_chip: "",
  output_jack: "3.5mm",
  power: "",
  features: "",
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

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const toggle = (key, value) => {
    const current = form[key];
    setForm({
      ...form,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    });
  };

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

  const field = (key, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input value={form[key]} onChange={setField(key)} {...props} />
    </label>
  );

  const area = (key, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <textarea rows={3} value={form[key]} onChange={setField(key)} {...props} />
    </label>
  );

  return (
    <section>
      <Link to={isEdit ? `/dac/${id}` : "/"} className="back">
        &larr; Batal
      </Link>
      <h1>{isEdit ? "Edit DAC" : "Tambah DAC"}</h1>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        {field("name", "Nama DAC", { required: true })}
        {field("brand", "Merek", { required: true })}
        <ImageField
          label="Gambar DAC"
          folder="dac"
          value={form.image_url}
          onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
        />
        <ImageField
          label="Gambar Frequency Response"
          folder="dac-fr"
          value={form.fr_image_url}
          onChange={(url) => setForm((f) => ({ ...f, fr_image_url: url }))}
        />
        {area("description", "Deskripsi")}
        {field("dac_chip", "Chip DAC yang digunakan (contoh: ESS ES9038Q2M)")}

        <fieldset>
          <legend>Jack output</legend>
          <div className="chips">
            {JACK_OPTIONS.map((o) => (
              <button
                type="button"
                key={o.value}
                className={
                  "chip jack pick" + (form.output_jack === o.value ? " on" : "")
                }
                aria-pressed={form.output_jack === o.value}
                onClick={() => setForm({ ...form, output_jack: o.value })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        {field("power", "Power (contoh: 200mW @ 32Ω)")}
        {area("features", "Fitur (satu fitur per baris)", {
          placeholder: "Gain switch\nTombol volume\nDukungan DSD"
        })}
        {area("review", "Impresi suara", { rows: 5 })}

        <fieldset>
          <legend>Harga dan kelas</legend>
          {field("release_price", "Harga rilis (Rp)", {
            type: "number",
            min: 0,
            step: 1,
            inputMode: "numeric"
          })}
          <p className="muted hint">
            Kelas saat rilis: <strong>{tierOf(form.release_price) || "-"}</strong>
          </p>
          {field("market_price", "Harga pasaran sekarang (Rp)", {
            type: "number",
            min: 0,
            step: 1,
            inputMode: "numeric"
          })}
          <p className="muted hint">
            Kelas harga pasaran: <strong>{tierOf(form.market_price) || "-"}</strong>
          </p>
        </fieldset>

        {area("package_contents", "Isi paket penjualan (satu item per baris)", {
          placeholder: "DAC\nKabel USB-C\nKabel OTG"
        })}

        <fieldset>
          <legend>Tuning</legend>
          {tunings.length === 0 && (
            <p className="muted">Belum ada tuning. Tambahkan di menu Tuning.</p>
          )}
          <div className="chips">
            {tunings.map((t) => (
              <button
                type="button"
                key={t.id}
                className={
                  "chip tuning pick" + (form.tuning_ids.includes(t.id) ? " on" : "")
                }
                onClick={() => toggle("tuning_ids", t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Genre yang cocok</legend>
          {genres.length === 0 && (
            <p className="muted">Belum ada genre. Tambahkan di menu Genre.</p>
          )}
          <div className="chips">
            {genres.map((g) => (
              <button
                type="button"
                key={g.id}
                className={
                  "chip genre pick" + (form.genre_ids.includes(g.id) ? " on" : "")
                }
                onClick={() => toggle("genre_ids", g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </fieldset>

        <button className="btn primary" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </section>
  );
}
