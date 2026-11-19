import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, RequireModerator, useAuth } from "./auth.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Catalog from "./pages/Catalog.jsx";
import IemDetail from "./pages/IemDetail.jsx";
import IemForm from "./pages/IemForm.jsx";
import DacDetail from "./pages/DacDetail.jsx";
import DacForm from "./pages/DacForm.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import Trash from "./pages/Trash.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";

function Header() {
  const { moderator, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="topbar">
      <span className="logo">Audiory</span>
      {!loading && (
        <span className="topbar-actions">
          {moderator ? (
            <>
              <span className="mod-badge">Moderator</span>
              <button className="link-btn" onClick={handleLogout}>
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="link-btn">
              Masuk moderator
            </Link>
          )}
        </span>
      )}
    </header>
  );
}

// Form tambah/edit dan Sampah dibungkus RequireModerator.
// (Pemeriksaan sebenarnya tetap dilakukan server pada setiap permintaan.)
const mod = (page) => <RequireModerator>{page}</RequireModerator>;

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="content">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/iem/baru" element={mod(<IemForm />)} />
            <Route path="/iem/:id" element={<IemDetail />} />
            <Route path="/iem/:id/edit" element={mod(<IemForm />)} />
            <Route path="/dac/baru" element={mod(<DacForm />)} />
            <Route path="/dac/:id" element={<DacDetail />} />
            <Route path="/dac/:id/edit" element={mod(<DacForm />)} />
            <Route path="/tuning" element={<CategoryPage type="tunings" title="Tuning" />} />
            <Route path="/genre" element={<CategoryPage type="genres" title="Genre" />} />
            <Route path="/sampah" element={mod(<Trash />)} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
