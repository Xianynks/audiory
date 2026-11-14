import { useCallback, useEffect, useState } from "react";
import IemCard from "../components/IemCard.jsx";
import { categoryApi, iemApi, errorMessage } from "../api.js";

export default function CategoryPage({ type, title }) {
  const api = categoryApi(type);
  // field relasi pada IEM: tunings -> tuning_ids, genres -> genre_ids
  const relKey = type === "tunings" ? "tuning_ids" : "genre_ids";

  const [categories, setCategories] = useState([]);
  const [iems, setIems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, i] = await Promise.all([categoryApi(type).list(), iemApi.list()]);
      setCategories(c);
      setIems(i);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [type]);

  useEffect(() => {
    setSelected(null);
    setEditingId(null);
    setName("");
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    try {
      if (editingId) await api.update(editingId, { name: name.trim() });
      else await api.create({ name: name.trim() });
      setName("");
      setEditingId(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Hapus kategori "${cat.name}"?`)) return;
    setError("");
    try {
      await api.remove(cat.id);
      if (selected === cat.id) setSelected(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const countOf = (catId) =>
    iems.filter((i) => (i[relKey] || []).includes(catId)).length;

  const shown =
    selected == null
      ? []
      : iems.filter((i) => (i[relKey] || []).includes(selected));

  return (
    <section>
      <h1>{title}</h1>

      {error && <div className="alert">{error}</div>}

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={editingId ? `Ubah nama ${title}` : `Nama ${title} baru`}
        />
        <button className="btn primary">{editingId ? "Simpan" : "Tambah"}</button>
        {editingId && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
          >
            Batal
          </button>
        )}
      </form>

      <ul className="catlist">
        {categories.map((c) => (
          <li key={c.id} className={selected === c.id ? "sel" : ""}>
            <button className="catname" onClick={() => setSelected(c.id)}>
              {c.name} <span className="muted">({countOf(c.id)})</span>
            </button>
            <button
              className="btn small"
              onClick={() => {
                setEditingId(c.id);
                setName(c.name);
              }}
            >
              Ubah
            </button>
            <button className="btn small danger" onClick={() => handleDelete(c)}>
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {categories.length === 0 && <p className="muted">Belum ada kategori.</p>}

      {selected != null && (
        <>
          <h2>IEM dengan {title.toLowerCase()} ini</h2>
          {shown.length === 0 && <p className="muted">Belum ada IEM di kategori ini.</p>}
          <div className="grid">
            {shown.map((iem) => (
              <IemCard
                key={iem.id}
                iem={iem}
                tunings={type === "tunings" ? categories : []}
                genres={type === "genres" ? categories : []}
              />
            ))}
          </div>
        </>
      )}
      {selected == null && categories.length > 0 && (
        <p className="muted">Pilih salah satu kategori untuk melihat daftar IEM.</p>
      )}
    </section>
  );
}
