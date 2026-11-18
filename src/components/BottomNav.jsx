import { NavLink, useLocation } from "react-router-dom";
import {
  IconCatalog,
  IconTuning,
  IconGenre,
  IconTrash,
  IconAbout
} from "./icons.jsx";

const items = [
  { to: "/", label: "Katalog", end: true, Icon: IconCatalog },
  { to: "/tuning", label: "Tuning", Icon: IconTuning },
  { to: "/genre", label: "Genre", Icon: IconGenre },
  { to: "/sampah", label: "Sampah", Icon: IconTrash },
  { to: "/about", label: "About", Icon: IconAbout }
];

export default function BottomNav() {
  const { pathname } = useLocation();
  // Halaman detail/form IEM dan DAC tetap menandai tab Katalog
  const inCatalog = pathname.startsWith("/iem") || pathname.startsWith("/dac");

  return (
    <nav className="bottomnav" aria-label="Navigasi utama">
      {items.map(({ to, label, end, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            "navitem" + (isActive || (to === "/" && inCatalog) ? " active" : "")
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
