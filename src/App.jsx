import { Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import Catalog from "./pages/Catalog.jsx";
import IemDetail from "./pages/IemDetail.jsx";
import IemForm from "./pages/IemForm.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import Trash from "./pages/Trash.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">Audiory</span>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/iem/baru" element={<IemForm />} />
          <Route path="/iem/:id" element={<IemDetail />} />
          <Route path="/iem/:id/edit" element={<IemForm />} />
          <Route
            path="/tuning"
            element={<CategoryPage type="tunings" title="Tuning" />}
          />
          <Route
            path="/genre"
            element={<CategoryPage type="genres" title="Genre" />}
          />
          <Route path="/sampah" element={<Trash />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
