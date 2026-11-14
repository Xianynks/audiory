import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { iemApi, categoryApi, errorMessage, FALLBACK_IMG } from "../api.js";

const tuningApi = categoryApi("tunings");
const genreApi = categoryApi("genres");

export default function IemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [iem, setIem] = useState(null);
  const [tunings, setTunings] = useState([]);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([iemApi.get(id), tuningApi.list(), genreApi.list()])
      .then(([i, t, g]) => {
        setIem(i);
        setTunings(t);
        setGenres(g);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Hapus "${iem.name}"?`)) return;
    try {
      await iemApi.remove(id);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (error) {
    return (
      <section>
        <div className="alert">{error}</div>
        <Link to="/" className="btn">
          Kembali ke katalog
        </Link>
      </section>
    );
  }
  if (!iem) return <p className="muted">Memuat data...</p>;

  const tuningList = tunings.filter((t) => (iem.tuning_ids || []).includes(t.id));
  const genreList = genres.filter((g) => (iem.genre_ids || []).includes(g.id));

  return (
    <section className="detail">
      <Link to="/" className="back">
        &larr; Katalog
      </Link>

      <img
        className="hero"
        src={iem.image_url || FALLBACK_IMG}
        alt={iem.name}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMG;
        }}
      />

      <h1>{iem.name}</h1>
      <p className="muted">
        {iem.brand} · {iem.driver}
      </p>

      <div className="chips">
        {tuningList.map((t) => (
          <span key={t.id} className="chip tuning">
            {t.name}
          </span>
        ))}
        {genreList.map((g) => (
          <span key={g.id} className="chip genre">
            {g.name}
          </span>
        ))}
      </div>

      <p>{iem.description}</p>

      <h2>Karakteristik suara</h2>
      <dl>
        <dt>Bass</dt>
        <dd>{iem.bass || "-"}</dd>
        <dt>Midrange</dt>
        <dd>{iem.midrange || "-"}</dd>
        <dt>Treble</dt>
        <dd>{iem.treble || "-"}</dd>
        <dt>Technicalities</dt>
        <dd>{iem.technicalities || "-"}</dd>
      </dl>

      <h2>Review</h2>
      <p>{iem.review || "Belum ada review."}</p>

      <div className="actions">
        <Link to={`/iem/${id}/edit`} className="btn primary">
          Edit
        </Link>
        <button className="btn danger" onClick={handleDelete}>
          Hapus
        </button>
      </div>
    </section>
  );
}
