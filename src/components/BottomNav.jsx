import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Katalog", end: true },
  { to: "/tuning", label: "Tuning" },
  { to: "/genre", label: "Genre" },
  { to: "/about", label: "About" }
];

export default function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="Navigasi utama">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) => "navitem" + (isActive ? " active" : "")}
        >
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
