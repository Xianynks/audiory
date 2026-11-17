import { useState } from "react";
import { Link } from "react-router-dom";
import IemCard from "../components/IemCard.jsx";
import DacCard from "../components/DacCard.jsx";
import useCatalog from "../useCatalog.js";

export default function Catalog() {
  const { iems, dacs, tunings, genres, loading, error, reload } = useCatalog();
  const [q, setQ] = useState("");

  const match = (x) =>
    `${x.name} ${x.brand}`.toLowerCase().includes(q.toLowerCase());
  const iemList = iems.filter(match);
  const dacList = dacs.filter(match);

  return (
    <section>
      <div className="page-head">
        <h1>Katalog IEM</h1>
        <div className="head-actions">
          <Link to="/dac/baru" className="btn primary">
            Tambah DAC
          </Link>
          <Link to="/iem/baru" className="btn primary">
            Tambah IEM
          </Link>
        </div>
      </div>

      <input
        className="search"
        type="search"
        placeholder="Cari nama atau merek"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading && <p className="muted">Memuat data...</p>}
      {error && (
        <div className="alert">
          <p>{error}</p>
          <button className="btn" onClick={reload}>
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && iemList.length === 0 && (
        <p className="muted">Belum ada IEM. Tambahkan IEM pertama Anda.</p>
      )}
      <div className="grid">
        {iemList.map((iem) => (
          <IemCard key={iem.id} iem={iem} tunings={tunings} genres={genres} />
        ))}
      </div>

      <div className="page-head section-gap">
        <h1>Katalog DAC</h1>
      </div>

      {!loading && !error && dacList.length === 0 && (
        <p className="muted">Belum ada DAC.</p>
      )}
      <div className="grid">
        {dacList.map((dac) => (
          <DacCard key={dac.id} dac={dac} tunings={tunings} genres={genres} />
        ))}
      </div>
    </section>
  );
}
