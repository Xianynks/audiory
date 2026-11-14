import { useState } from "react";
import { Link } from "react-router-dom";
import IemCard from "../components/IemCard.jsx";
import useCatalog from "../useCatalog.js";

export default function Catalog() {
  const { iems, tunings, genres, loading, error, reload } = useCatalog();
  const [q, setQ] = useState("");

  const filtered = iems.filter((i) =>
    `${i.name} ${i.brand}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <section>
      <div className="page-head">
        <h1>Katalog IEM</h1>
        <Link to="/iem/baru" className="btn primary">
          Tambah IEM
        </Link>
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
      {!loading && !error && filtered.length === 0 && (
        <p className="muted">Belum ada IEM. Tambahkan IEM pertama Anda.</p>
      )}

      <div className="grid">
        {filtered.map((iem) => (
          <IemCard key={iem.id} iem={iem} tunings={tunings} genres={genres} />
        ))}
      </div>
    </section>
  );
}
