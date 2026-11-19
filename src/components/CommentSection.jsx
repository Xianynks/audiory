import { useCallback, useEffect, useMemo, useState } from "react";
import { commentApi, errorMessage } from "../api.js";
import { Panel } from "./DetailParts.jsx";
import { ChoiceChips } from "./FormParts.jsx";

const STATUS_OPTIONS = [
  { value: "pemilik", label: "Sudah punya" },
  { value: "calon_pembeli", label: "Calon pembeli" }
];
const statusLabel = (v) => STATUS_OPTIONS.find((o) => o.value === v)?.label;

const BODY_MAX = 1000;
const NAME_MAX = 40;
const STORE_KEY = "audiory:author";

// Nama dan status diingat di browser pengunjung supaya tidak diketik ulang
function loadAuthor() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return {
      name: typeof saved.name === "string" ? saved.name : "",
      status: typeof saved.status === "string" ? saved.status : ""
    };
  } catch {
    return { name: "", status: "" };
  }
}
function saveAuthor(name, status) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ name, status }));
  } catch {
    /* penyimpanan tidak tersedia: abaikan */
  }
}

const formatDate = (d) =>
  new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

// Form komentar (dipakai untuk komentar baru maupun balasan)
function CommentForm({ onSubmit, onCancel, compact = false }) {
  const initial = useMemo(loadAuthor, []);
  const [name, setName] = useState(initial.name);
  const [status, setStatus] = useState(initial.status);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await onSubmit({ author_name: name, author_status: status, body });
      saveAuthor(name, status);
      setBody("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <form className={"comment-form" + (compact ? " compact" : "")} onSubmit={handleSubmit}>
      <div className="comment-meta">
        <label className="field">
          <span>Nama</span>
          <input
            value={name}
            maxLength={NAME_MAX}
            placeholder="Anonim"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <ChoiceChips
          legend="Status Anda (opsional)"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          allowClear
        />
      </div>
      <label className="field">
        <span>{compact ? "Balasan" : "Pendapat atau pertanyaan"}</span>
        <textarea
          rows={compact ? 3 : 4}
          maxLength={BODY_MAX}
          value={body}
          placeholder={
            compact
              ? "Tulis balasan"
              : "Bagikan pengalaman Anda, atau tanyakan sesuatu kepada pemilik dan calon pembeli"
          }
          onChange={(e) => setBody(e.target.value)}
        />
        <small className="hint">
          {body.length}/{BODY_MAX}
        </small>
      </label>
      {error && <p className="field-error">{error}</p>}
      <div className="actions">
        <button className="btn primary" disabled={sending || body.trim().length < 2}>
          {sending ? "Mengirim..." : compact ? "Kirim balasan" : "Kirim"}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}

function CommentItem({ c, reply = false, children }) {
  return (
    <article className={"comment" + (reply ? " is-reply" : "")}>
      <header className="comment-head">
        <strong className="comment-name">{c.author_name}</strong>
        {c.author_status && <span className="badge">{statusLabel(c.author_status)}</span>}
        <time className="caption" dateTime={c.created_at}>
          {formatDate(c.created_at)}
        </time>
      </header>
      <p className="prewrap">{c.body}</p>
      {children}
    </article>
  );
}

// type: "iem" | "dac"; id: ID item
export default function CommentSection({ type, id }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const load = useCallback(async () => {
    try {
      setComments(await commentApi.list(type, id));
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    load();
  }, [load]);

  // Komentar utama terbaru di atas; balasan berurutan dari yang terlama
  const threads = useMemo(
    () =>
      comments
        .filter((c) => c.parent_id === null)
        .reverse()
        .map((c) => ({ ...c, replies: comments.filter((r) => r.parent_id === c.id) })),
    [comments]
  );

  const send = (parentId) => async (data) => {
    await commentApi.create(type, id, { ...data, parent_id: parentId });
    setReplyTo(null);
    await load();
  };

  return (
    <Panel title={`Diskusi pengunjung${comments.length ? ` (${comments.length})` : ""}`}>
      <p className="muted comment-intro">
        Ruang bertukar pendapat bagi calon pembeli dan pemilik. Mohon menjaga
        kesopanan dan tidak membagikan data pribadi.
      </p>

      <CommentForm onSubmit={send(null)} />

      {loading && <p className="muted">Memuat diskusi...</p>}
      {error && <div className="alert">{error}</div>}
      {!loading && !error && threads.length === 0 && (
        <p className="muted">Belum ada diskusi. Jadilah yang pertama berkomentar.</p>
      )}

      <div className="comment-list">
        {threads.map((c) => (
          <CommentItem key={c.id} c={c}>
            {c.replies.length > 0 && (
              <div className="replies">
                {c.replies.map((r) => (
                  <CommentItem key={r.id} c={r} reply />
                ))}
              </div>
            )}
            {replyTo === c.id ? (
              <CommentForm compact onSubmit={send(c.id)} onCancel={() => setReplyTo(null)} />
            ) : (
              <button className="btn small" onClick={() => setReplyTo(c.id)}>
                Balas
              </button>
            )}
          </CommentItem>
        ))}
      </div>
    </Panel>
  );
}
