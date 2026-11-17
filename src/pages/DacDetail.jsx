import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dacApi, categoryApi, errorMessage, FALLBACK_IMG } from "../api.js";
import { tierOf, rupiah, jackLabel } from "../tier.js";

const tuningApi = categoryApi("tunings");
const genreApi = categoryApi("genres");

const lines = (text) =>
  (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export default function DacDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dac, setDac] = useState(null);
  const [tunings, setTunings] = useState([]);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([dacApi.get(id), tuningApi.list(), genreApi.list()])
      .then(([d, t, g]) => {
        setDac(d);
        setTunings(t);
        setGenres(g);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Pindahkan "${dac.name}" ke sampah? Data bisa dipulihkan dari menu Sampah.`
      )
    )
      return;
    try {
      await dacApi.remove(id);
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
  if (!dac) return <p className="muted">Memuat data...</p>;

  const tuningList = tunings.filter((t) => (dac.tuning_ids || []).includes(t.id));
  const genreList = genres.filter((g) => (dac.genre_ids || []).includes(g.id));
  const releaseTier = tierOf(dac.release_price);
  const marketTier = tierOf(dac.market_price);
  const featureItems = lines(dac.features);
  const packageItems = lines(dac.package_contents);

  return (
    <section className="detail">
      <Link to="/" className="back">
        &larr; Katalog
      </Link>

      <img
        className="hero"
        src={dac.image_url || FALLBACK_IMG}
        alt={dac.name}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMG;
        }}
      />

      <h1>{dac.name}</h1>
      <p className="muted">{dac.brand}</p>

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

      <p>{dac.description}</p>

      <h2>Harga dan kelas</h2>
      <dl>
        <dt>Harga rilis</dt>
        <dd>
          {rupiah(dac.release_price)}
          {releaseTier && <span className="badge">{releaseTier}</span>}
        </dd>
        <dt>Harga pasaran sekarang</dt>
        <dd>
          {rupiah(dac.market_price)}
          {marketTier && <span className="badge">{marketTier}</span>}
        </dd>
      </dl>

      <h2>Spesifikasi</h2>
      <dl>
        <dt>Chip DAC</dt>
        <dd>{dac.dac_chip || "-"}</dd>
        <dt>Jack output</dt>
        <dd>{jackLabel(dac.output_jack)}</dd>
        <dt>Power</dt>
        <dd>{dac.power || "-"}</dd>
      </dl>

      <h2>Fitur</h2>
      {featureItems.length > 0 ? (
        <ul className="plain">
          {featureItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">Belum ada data fitur.</p>
      )}

      <h2>Frequency Response</h2>
      {dac.fr_image_url ? (
        <a href={dac.fr_image_url} target="_blank" rel="noreferrer">
          <img
            className="fr"
            src={dac.fr_image_url}
            alt={`Grafik frequency response ${dac.name}`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </a>
      ) : (
        <p className="muted">Belum ada grafik frequency response.</p>
      )}

      <h2>Isi paket</h2>
      {packageItems.length > 0 ? (
        <ul className="plain">
          {packageItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">Belum ada data isi paket.</p>
      )}

      <h2>Impresi suara</h2>
      <p className="prewrap">{dac.review || "Belum ada impresi suara."}</p>

      <div className="actions">
        <Link to={`/dac/${id}/edit`} className="btn primary">
          Edit
        </Link>
        <button className="btn danger" onClick={handleDelete}>
          Hapus
        </button>
      </div>
    </section>
  );
}
