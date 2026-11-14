import { Link } from "react-router-dom";
import { FALLBACK_IMG } from "../api.js";

export default function IemCard({ iem, tunings = [], genres = [] }) {
  const tuningNames = tunings
    .filter((t) => (iem.tuning_ids || []).includes(t.id))
    .map((t) => t.name);
  const genreNames = genres
    .filter((g) => (iem.genre_ids || []).includes(g.id))
    .map((g) => g.name);

  return (
    <Link to={`/iem/${iem.id}`} className="card">
      <img
        src={iem.image_url || FALLBACK_IMG}
        alt={iem.name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMG;
        }}
      />
      <div className="card-body">
        <h3>{iem.name}</h3>
        <p className="muted">
          {iem.brand} · {iem.driver}
        </p>
        <div className="chips">
          {tuningNames.map((n) => (
            <span key={"t" + n} className="chip tuning">
              {n}
            </span>
          ))}
          {genreNames.map((n) => (
            <span key={"g" + n} className="chip genre">
              {n}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
