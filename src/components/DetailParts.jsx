import { FALLBACK_IMG } from "../api.js";
import { tierOf, rupiah, lines, hasValue } from "../tier.js";

// Satu bagian informasi dalam bentuk card
export function Panel({ title, children, id }) {
  return (
    <section className="panel" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

// Foto produk dengan rasio tetap 4:3 (berpatokan lebar), seluruh gambar terlihat
export function ProductHero({ src, alt }) {
  return (
    <img
      className="hero"
      src={src || FALLBACK_IMG}
      alt={alt}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = FALLBACK_IMG;
      }}
    />
  );
}

// Badge tuning dan genre
export function ChipRow({ tunings = [], genres = [], extra }) {
  if (!tunings.length && !genres.length && !extra) return null;
  return (
    <div className="chips">
      {extra}
      {tunings.map((t) => (
        <span key={"t" + t.id} className="chip tuning">
          {t.name}
        </span>
      ))}
      {genres.map((g) => (
        <span key={"g" + g.id} className="chip genre">
          {g.name}
        </span>
      ))}
    </div>
  );
}

// Daftar label-nilai. Baris tanpa nilai disembunyikan; seluruh bagian
// disembunyikan jika semua baris kosong. Mengembalikan null bila kosong.
export function SpecPanel({ title, rows }) {
  const shown = rows.filter(([, value]) => hasValue(value));
  if (!shown.length) return null;
  return (
    <Panel title={title}>
      <dl className="spec">
        {shown.map(([label, value]) => (
          <div className="spec-row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

// Harga rilis dan harga pasaran beserta kelasnya
export function PricePanel({ release, market }) {
  if (!hasValue(release) && !hasValue(market)) return null;
  const tile = (label, price) =>
    hasValue(price) && (
      <div className="stat">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{rupiah(price)}</span>
        {tierOf(price) && <span className="badge">{tierOf(price)}</span>}
      </div>
    );
  return (
    <Panel title="Harga dan kelas">
      <div className="stats">
        {tile("Harga rilis", release)}
        {tile("Harga pasaran sekarang", market)}
      </div>
    </Panel>
  );
}

// Daftar poin dari teks satu-item-per-baris
export function ListPanel({ title, text }) {
  const items = lines(text);
  if (!items.length) return null;
  return (
    <Panel title={title}>
      <ul className="list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Panel>
  );
}

// Paragraf (baris baru dipertahankan)
export function TextPanel({ title, text }) {
  if (!hasValue(text)) return null;
  return (
    <Panel title={title}>
      <p className="prewrap">{text}</p>
    </Panel>
  );
}

export function ProsConsPanel({ pros, cons }) {
  const p = lines(pros);
  const c = lines(cons);
  if (!p.length && !c.length) return null;
  return (
    <Panel title="Kelebihan dan kekurangan">
      <div className="proscons">
        {p.length > 0 && (
          <div>
            <h3>Kelebihan</h3>
            <ul className="list pros">
              {p.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
        {c.length > 0 && (
          <div>
            <h3>Kekurangan</h3>
            <ul className="list cons">
              {c.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}
