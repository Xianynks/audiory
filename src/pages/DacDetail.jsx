import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { dacApi, categoryApi, errorMessage } from "../api.js";
import { jackLabel, volumeLabel, formatPower, lines, hasValue } from "../tier.js";
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
import CommentSection from "../components/CommentSection.jsx";

const tuningApi = categoryApi("tunings");
const genreApi = categoryApi("genres");

export default function DacDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { moderator } = useAuth();
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
      <section className="detail">
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

  // Fitur: kontrol volume, playback control, detachable cable, dan fitur lain
  const featureItems = [
    hasValue(dac.volume_control) ? volumeLabel(dac.volume_control) : "",
    dac.playback_control === true ? "Playback control" : "",
    dac.detachable_cable === true ? "Detachable cable" : "",
    ...lines(dac.features)
  ].filter(Boolean);

  return (
    <div className="detail">
      <Link to="/" className="back">
        &larr; Katalog
      </Link>

      {/* 1. Product header */}
      <section className="panel product-head">
        <ProductHero src={dac.image_url} alt={dac.name} />
        <div className="product-info">
          <h1 className="product-name">{dac.name}</h1>
          <p className="subtitle">{dac.brand}</p>
          <ChipRow
            tunings={tuningList}
            genres={genreList}
            extra={<span className="chip device">DAC/Amp</span>}
          />
        </div>
      </section>

      {/* 2. Deskripsi */}
      <TextPanel title="Deskripsi" text={dac.description} />

      {/* 3. Harga dan kelas */}
      <PricePanel release={dac.release_price} market={dac.market_price} />

      {/* 4. Spesifikasi teknis */}
      <SpecPanel
        title="Spesifikasi teknis"
        rows={[
          ["DAC chip", dac.dac_chip],
          ["Amplifier chip", dac.amp_chip],
          ["Input", dac.input_type],
          ["Output", jackLabel(dac.output_jack)],
          [
            "Daya output 3.5 mm",
            formatPower(dac.power_se, dac.power_impedance)
          ],
          [
            "Daya output 4.4 mm",
            formatPower(dac.power_balanced, dac.power_impedance)
          ]
        ]}
      />

      {/* 5. Fitur */}
      {featureItems.length > 0 && (
        <Panel title="Fitur">
          <ul className="list">
            {featureItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Panel>
      )}

      {/* 6. Impresi suara */}
      <TextPanel title="Impresi suara" text={dac.sound_impression} />

      {/* 7. Kelebihan dan kekurangan */}
      <ProsConsPanel pros={dac.pros} cons={dac.cons} />

      {/* 8. Isi paket */}
      <ListPanel title="Isi paket" text={dac.package_contents} />

      {/* 9. Review lengkap */}
      <TextPanel title="Review lengkap" text={dac.review} />

      {/* Diskusi pengunjung */}
      <CommentSection type="dac" id={id} />

      {moderator && (
        <div className="actions">
          <Link to={`/dac/${id}/edit`} className="btn primary">
            Edit
          </Link>
          <button className="btn danger" onClick={handleDelete}>
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}
