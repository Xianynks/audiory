import { useCallback, useEffect, useState } from "react";
import { trashApi, errorMessage } from "../api.js";

const SECTIONS = [
  { key: "iems", title: "IEM" },
  { key: "dacs", title: "DAC" },
  { key: "tunings", title: "Tuning" },
  { key: "genres", title: "Genre" }
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

export default function Trash() {
  const [data, setData] = useState({ iems: [], dacs: [], tunings: [], genres: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await trashApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const restore = async (type, item) => {
    setError("");
    setInfo("");
    try {
      await trashApi.restore(type, item.id);
      setInfo(`"${item.name}" berhasil dipulihkan.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const purge = async (type, item) => {
    const extra =
      type === "iems" || type === "dacs"
        ? " Diskusi pada item ini juga ikut terhapus."
        : " Hubungannya dengan IEM/DAC yang ada di sampah juga dilepas.";
    if (
      !window.confirm(
        `Hapus permanen "${item.name}"? Tindakan ini tidak bisa dibatalkan.${extra}`
      )
    )
      return;
    setError("");
    setInfo("");
    try {
      await trashApi.purge(type, item.id);
      setInfo(`"${item.name}" dihapus permanen.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const total = SECTIONS.reduce((n, s) => n + data[s.key].length, 0);

  return (
    <section>
      <h1>Sampah</h1>
      <p className="muted">
        Data yang dihapus disimpan di sini dan bisa dipulihkan. Hapus permanen
        menghilangkannya selamanya.
      </p>

      {error && <div className="alert">{error}</div>}
      {info && <div className="notice">{info}</div>}
      {loading && <p className="muted">Memuat data...</p>}
      {!loading && total === 0 && !error && (
        <p className="muted">Sampah kosong.</p>
      )}

      {SECTIONS.map(
        (s) =>
          data[s.key].length > 0 && (
            <div key={s.key}>
              <h2>{s.title}</h2>
              <ul className="catlist">
                {data[s.key].map((item) => (
                  <li key={item.id}>
                    <span className="catname static">
                      {item.name}
                      {item.brand ? ` · ${item.brand}` : ""}
                      <span className="muted"> (dihapus {formatDate(item.deleted_at)})</span>
                    </span>
                    <span className="row-actions">
                      <button
                        className="btn small primary"
                        onClick={() => restore(s.key, item)}
                      >
                        Pulihkan
                      </button>
                      <button
                        className="btn small danger"
                        onClick={() => purge(s.key, item)}
                      >
                        Hapus permanen
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
      )}
    </section>
  );
}
