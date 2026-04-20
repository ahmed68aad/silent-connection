import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CircleDot,
  Home,
  LayoutDashboard,
  Link2,
  UserRound,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useTheme } from "../state/ThemeContext";
import UserAvatar from "./UserAvatar";

export default function AppShell({
  children,
  title,
  subtitle,
  aside,
  eyebrow = "Silent Connection",
  showHeader = true,
  showFooter = true,
}) {
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState("");

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const target = document.querySelector(location.hash);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location]);

  useEffect(() => {
    const closeDropdown = () => setOpenDropdown("");

    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div className="app-shell">
      <nav className="app-navbar">
        <Link to="/feed" className="navbar-brand">
          <span className="navbar-logo">
            <img src="/app-logo.png" alt="" />
          </span>
          <strong>Silent Connection</strong>
        </Link>

        <div className="navbar-links">
          <NavLink
            to="/feed"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            aria-label="Home"
            title="Home"
          >
            <Home size={18} strokeWidth={2.3} />
            <span className="nav-link-label">Home</span>
          </NavLink>
          <NavLink
            to="/circles"
            className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            aria-label="Circles"
            title="Circles"
          >
            <CircleDot size={18} strokeWidth={2.3} />
            <span className="nav-link-label">Circles</span>
          </NavLink>

          <div className="navbar-dropdown" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={`icon-nav-button ${openDropdown === "dashboard" ? "active" : ""}`}
              aria-label="Dashboard menu"
              title="Dashboard menu"
              onClick={() =>
                setOpenDropdown((current) => (current === "dashboard" ? "" : "dashboard"))
              }
            >
              <LayoutDashboard size={19} strokeWidth={2.35} />
            </button>
            <div
              className={`dropdown-menu dropdown-menu-right ${
                openDropdown === "dashboard" ? "is-open" : ""
              }`}
            >
              <Link to="/dashboard#account" onClick={() => setOpenDropdown("")}>
                <UserRound size={16} strokeWidth={2.25} />
                Account details
              </Link>
              <Link to="/dashboard#connection" onClick={() => setOpenDropdown("")}>
                <Link2 size={16} strokeWidth={2.25} />
                Partner connection
              </Link>
              <Link to="/dashboard#circle-controls" onClick={() => setOpenDropdown("")}>
                <CircleDot size={16} strokeWidth={2.25} />
                Circle controls
              </Link>
              <Link to="/dashboard#account-pulse" onClick={() => setOpenDropdown("")}>
                <Activity size={16} strokeWidth={2.25} />
                Account pulse
              </Link>
              <Link to="/dashboard#stats" onClick={() => setOpenDropdown("")}>
                <BarChart3 size={16} strokeWidth={2.25} />
                Snapshot stats
              </Link>
            </div>
          </div>

          <button
            type="button"
            className={`theme-switch-button ${isDark ? "is-on" : ""}`}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={isDark}
            title={isDark ? "Dark mode on" : "Dark mode off"}
            onClick={toggleTheme}
          >
            <span className="theme-switch-track">
              <span className="theme-switch-knob" />
            </span>
          </button>

          <Link
            to="/dashboard#account"
            className="navbar-profile"
            aria-label="Account profile"
            title="Account profile"
          >
            <UserAvatar user={user} size="sm" />
            <span>{user?.name || "Profile"}</span>
          </Link>
        </div>
      </nav>

      <main className="main-panel">
        {showHeader ? (
          <header className="page-header page-header-bar">
            <div>
              <p className="small-label">{eyebrow}</p>
              <h1>{title}</h1>
              {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
            </div>
          </header>
        ) : null}

        <div className={`content-grid ${aside ? "" : "content-grid-full"}`}>
          <section className="content-column">{children}</section>
          {aside ? <section className="aside-column">{aside}</section> : null}
        </div>

        {showFooter ? (
          <footer className="app-footer">
            <span>Silent Connection</span>
            <span>Private snapshots for trusted relationships.</span>
          </footer>
        ) : null}
      </main>
    </div>
  );
}
