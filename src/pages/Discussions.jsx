import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { commentApi, errorMessage } from "../api.js";

const PAGE_SIZE = 30;

const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

// Daftar komentar/balasan terbaru. Tiap baris menampilkan siapa yang berkomentar
// dan pada item mana, dengan tombol menuju komentar tersebut.
export function DiscussionList({ items }) {
  return (
    <ul className="catlist">
      {items.map((c) => (
        <li key={c.id}>
          <span className="catname static">
            {c.author_name}: {c.snippet}
            <span className="muted">
              {" "}
              · {c.parent_id ? "Balasan" : "Komentar"} pada {c.target_type === "dac" ? "DAC" : "IEM"}{" "}
              {c.target_name}
            </span>
            <span className="muted"> ({formatDate(c.created_at)})</span>
          </span>
          <span className="row-actions">
            <Link
              className="btn small primary"
              to={`/${c.target_type}/${c.target_id}#komentar-${c.id}`}
            >
              Lihat Komentar
            </Link>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Discussions() {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await commentApi.recent(limit);
      setItems(data.items);
      setHasMore(data.hasMore);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <h1>Diskusi terbaru</h1>
      <p className="muted intro">
        Komentar dan balasan terbaru dari pengunjung di semua IEM dan DAC.
      </p>

      {loading && <p className="muted">Memuat diskusi...</p>}
      {error && (
        <div className="alert">
          <p>{error}</p>
          <button className="btn" onClick={load}>
            Coba lagi
          </button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="muted">Belum ada diskusi.</p>
      )}

      <DiscussionList items={items} />

      {hasMore && (
        <div className="actions">
          <button className="btn" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
            Tampilkan lebih banyak
          </button>
        </div>
      )}
    </section>
  );
}
