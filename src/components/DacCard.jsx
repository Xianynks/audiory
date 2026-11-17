import { Link } from "react-router-dom";
import { FALLBACK_IMG } from "../api.js";
import { jackLabel } from "../tier.js";

export default function DacCard({ dac, tunings = [], genres = [] }) {
  const tuningNames = tunings
    .filter((t) => (dac.tuning_ids || []).includes(t.id))
    .map((t) => t.name);
  const genreNames = genres
    .filter((g) => (dac.genre_ids || []).includes(g.id))
    .map((g) => g.name);

  return (
    <Link to={`/dac/${dac.id}`} className="card">
      <img
        src={dac.image_url || FALLBACK_IMG}
        alt={dac.name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMG;
        }}
      />
      <div className="card-body">
        <h3>{dac.name}</h3>
        <p className="muted">
          {dac.brand} · {jackLabel(dac.output_jack)}
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
