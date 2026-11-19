import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "./api.js";

// Status login moderator untuk seluruh aplikasi.
// Penting: menyembunyikan tombol di tampilan hanya untuk kenyamanan.
// Yang benar-benar melindungi data adalah pemeriksaan sesi di server (api/).

const AuthContext = createContext({
  moderator: false,
  username: "",
  loading: true,
  login: async () => {},
  logout: async () => {}
});

const LOGGED_OUT = { moderator: false, username: "", loading: false };

export function AuthProvider({ children }) {
  const [state, setState] = useState({ moderator: false, username: "", loading: true });

  // Cek sesi saat aplikasi dibuka
  useEffect(() => {
    authApi
      .me()
      .then((r) =>
        setState({ moderator: Boolean(r.moderator), username: r.username || "", loading: false })
      )
      .catch(() => setState(LOGGED_OUT));
  }, []);

  // Sesi habis di tengah pemakaian: kembalikan tampilan ke mode pengunjung
  useEffect(() => {
    const onExpired = () => setState(LOGGED_OUT);
    window.addEventListener("audiory:unauthorized", onExpired);
    return () => window.removeEventListener("audiory:unauthorized", onExpired);
  }, []);

  const login = useCallback(async (username, password) => {
    const r = await authApi.login(username, password);
    setState({ moderator: true, username: r.username || username, loading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState(LOGGED_OUT);
    }
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Membungkus halaman yang khusus moderator (form tambah/edit dan Sampah)
export function RequireModerator({ children }) {
  const { moderator, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) return <p className="muted">Memuat...</p>;
  if (!moderator) {
    return (
      <div className="detail">
        <section className="panel">
          <h2>Khusus moderator</h2>
          <p>Halaman ini hanya bisa dibuka oleh moderator.</p>
          <Link to="/login" state={{ from: pathname }} className="btn primary">
            Login moderator
          </Link>
        </section>
      </div>
    );
  }
  return children;
}
