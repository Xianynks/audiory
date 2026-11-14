import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { iemApi, categoryApi, errorMessage } from "../api.js";

const tuningApi = categoryApi("tunings");
const genreApi = categoryApi("genres");

const EMPTY = {
  name: "",
  brand: "",
  driver: "",
  image_url: "",
  description: "",
  bass: "",
  midrange: "",
  treble: "",
  technicalities: "",
  review: "",
  tuning_ids: [],
  genre_ids: []
};

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
        if (iem) setForm({ ...EMPTY, ...iem });
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
        ? await iemApi.update(id, form)
        : await iemApi.create(form);
      navigate(`/iem/${saved.id ?? id}`);
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

  const area = (key, label) => (
    <label className="field">
      <span>{label}</span>
      <textarea rows={3} value={form[key]} onChange={setField(key)} />
    </label>
  );

  return (
    <section>
      <Link to={isEdit ? `/iem/${id}` : "/"} className="back">
        &larr; Batal
      </Link>
      <h1>{isEdit ? "Edit IEM" : "Tambah IEM"}</h1>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        {field("name", "Nama IEM", { required: true })}
        {field("brand", "Merek", { required: true })}
        {field("driver", "Konfigurasi driver (contoh: 1DD + 2BA)")}
        {field("image_url", "URL gambar", { type: "url", placeholder: "https://..." })}
        {area("description", "Deskripsi")}
        {area("bass", "Bass")}
        {area("midrange", "Midrange")}
        {area("treble", "Treble")}
        {area("technicalities", "Technicalities")}
        {area("review", "Review")}

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
