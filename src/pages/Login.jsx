import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { errorMessage } from "../api.js";
import { Field } from "../components/FormParts.jsx";

export default function Login() {
  const { moderator, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Sudah login: tidak perlu mengisi form lagi
  useEffect(() => {
    if (!loading && moderator) navigate(from, { replace: true });
  }, [loading, moderator, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setPassword("");
      setSending(false);
    }
  };

  return (
    <div className="detail narrow">
      <h1 className="page-title">Login moderator</h1>
      <p className="muted">
        Login hanya diperlukan untuk mengelola katalog. Pengunjung tetap bisa
        melihat katalog dan ikut berdiskusi tanpa akun.
      </p>

      <form onSubmit={handleSubmit} className="panel form-panel">
        {error && <div className="alert">{error}</div>}
        <div className="form-grid">
          <Field
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="actions">
          <button className="btn primary" disabled={sending || !username || !password}>
            {sending ? "Memeriksa..." : "Masuk"}
          </button>
          <Link to="/" className="btn">
            Kembali
          </Link>
        </div>
      </form>
    </div>
  );
}
