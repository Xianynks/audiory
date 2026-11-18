import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { iemApi, categoryApi, errorMessage } from "../api.js";
import { dacLabel, dacNote, hasValue } from "../tier.js";
import {
  Panel,
  ProductHero,
  ChipRow,
  SpecPanel,
  PricePanel,
  ListPanel,
  TextPanel,
  ProsConsPanel
} from "../components/DetailParts.jsx";

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
    if (
      !window.confirm(
        `Pindahkan "${iem.name}" ke sampah? Data bisa dipulihkan dari menu Sampah.`
      )
    )
      return;
    try {
      await iemApi.remove(id);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (error) {
    return (
      <section className="detail">
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

  // Rekomendasi DAC/amp hanya ditampilkan jika memang disarankan
  const dacRow =
    iem.dac_need && iem.dac_need !== "tidak_perlu" ? (
      <>
        <strong>{dacLabel(iem.dac_need)}</strong>
        <span className="note">{dacNote(iem.dac_need)}</span>
      </>
    ) : (
      ""
    );

  const soundAspects = [
    ["Bass", iem.bass],
    ["Midrange", iem.midrange],
    ["Treble", iem.treble],
    ["Technicalities", iem.technicalities]
  ].filter(([, text]) => hasValue(text));

  return (
    <div className="detail">
      <Link to="/" className="back">
        &larr; Katalog
      </Link>

      {/* 1. Product header */}
      <section className="panel product-head">
        <ProductHero src={iem.image_url} alt={iem.name} />
        <div className="product-info">
          <h1 className="product-name">{iem.name}</h1>
          <p className="subtitle">
            {iem.brand}
            {hasValue(iem.driver) && ` · ${iem.driver}`}
          </p>
          <ChipRow tunings={tuningList} genres={genreList} />
        </div>
      </section>

      {/* 2. Deskripsi */}
      <TextPanel title="Deskripsi" text={iem.description} />

      {/* 3. Harga dan kelas */}
      <PricePanel release={iem.release_price} market={iem.market_price} />

      {/* 4. Spesifikasi teknis */}
      <SpecPanel
        title="Spesifikasi teknis"
        rows={[
          ["Konfigurasi driver", iem.driver],
          [
            "Impedance",
            hasValue(iem.impedance)
              ? `${Number(iem.impedance).toLocaleString("id-ID")} Ω`
              : ""
          ],
          ["Sensitivity", iem.sensitivity],
          ["Connector", iem.connector],
          [
            "Frequency response",
            hasValue(iem.fr_image_url) ? "Grafik tersedia di bawah" : ""
          ],
          ["Rekomendasi DAC/amp", dacRow]
        ]}
      />

      {/* 5. Karakteristik suara */}
      {soundAspects.length > 0 && (
        <Panel title="Karakteristik suara">
          <div className="aspects">
            {soundAspects.map(([label, text]) => (
              <div key={label}>
                <h3>{label}</h3>
                <p className="prewrap">{text}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* 6. Kelebihan dan kekurangan */}
      <ProsConsPanel pros={iem.pros} cons={iem.cons} />

      {/* 7. Frequency response graph */}
      {hasValue(iem.fr_image_url) && (
        <Panel title="Grafik frequency response">
          <a href={iem.fr_image_url} target="_blank" rel="noreferrer">
            <img
              className="fr"
              src={iem.fr_image_url}
              alt={`Grafik frequency response ${iem.name}`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </a>
          <p className="caption">Ketuk gambar untuk melihat ukuran penuh.</p>
        </Panel>
      )}

      {/* 8. Isi paket */}
      <ListPanel title="Isi paket" text={iem.package_contents} />

      {/* 9. Review lengkap */}
      <TextPanel title="Review lengkap" text={iem.review} />

      <div className="actions">
        <Link to={`/iem/${id}/edit`} className="btn primary">
          Edit
        </Link>
        <button className="btn danger" onClick={handleDelete}>
          Hapus
        </button>
      </div>
    </div>
  );
}
