import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight, MapPin, Phone, Search } from "lucide-react";
import LanguagePicker from "./LanguagePicker";
import CurrencyPicker from "./CurrencyPicker";
import { useSite } from "../context/SiteContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, localizedSettings, settings } = useSite();

  const companyName =
    localizedSettings?.companyName || settings?.companyName || "Serendib Travel & Tours";
  const companyTagline =
    localizedSettings?.companyTagline ||
    settings?.companyTagline ||
    "Your Gateway to Sri Lanka";
  const contactPhone =
    localizedSettings?.contactPhone || settings?.contactPhone || "+94 77 123 4567";
  const phoneHref = `tel:${contactPhone.replace(/[^\d+]/g, "")}`;

  const nameParts = companyName.replace(/\s+&\s+/g, " ").split(/\s+/);
  const brandPrimary = nameParts[0] || "Serendib";
  const brandSecondary = nameParts.slice(1).join(" ") || "Travel & Tours";

  const navLinks = [
    { name: t.navFindTours || "Find tours...", path: "/booking", icon: MapPin },
    { name: t.navInboundMain, path: "/inbound" },
    { name: t.navOutboundMain, path: "/outbound" },
    { name: t.navDestinations || "Destinations", path: "/outbound/destinations" },
    { name: t.navBlogMain, path: "/blog" },
    { name: t.navReviews || "Reviews", path: "/reviews" },
    { name: t.navWhySerendib || "Why Serendib", path: "/#about" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path.startsWith("/#")) return location.pathname === "/" && location.hash === path.slice(1);
    if (path === "/outbound/destinations") {
      return location.pathname.startsWith("/outbound/destinations");
    }
    if (path === "/outbound") {
      return location.pathname === "/outbound";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="site-navbar">
      <nav className="site-navbar__inner" aria-label="Main">
        <Link to="/" className="site-navbar__brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="site-navbar__brand-mark" aria-hidden="true">
            <span className="site-navbar__arc site-navbar__arc--top" />
            <span className="site-navbar__arc site-navbar__arc--bottom" />
          </span>
          <span className="site-navbar__brand-text">
            <span className="site-navbar__brand-name">
              <strong>{brandPrimary}</strong>
              <span className="site-navbar__brand-light">{brandSecondary}</span>
            </span>
            <span className="site-navbar__brand-tagline">{companyTagline}</span>
          </span>
        </Link>

        <div className="site-navbar__links desktop-only">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`site-navbar__link${active ? " is-active" : ""}`}
              >
                {Icon ? <Icon size={17} strokeWidth={2} aria-hidden="true" /> : null}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="site-navbar__utils desktop-only">
          <a href={phoneHref} className="site-navbar__phone" aria-label={`Call ${contactPhone}`}>
            <Phone size={18} strokeWidth={2} aria-hidden="true" />
            <span className="site-navbar__phone-num">{contactPhone}</span>
          </a>

          <span className="site-navbar__divider" aria-hidden="true" />

          <button
            type="button"
            className="site-navbar__icon-btn"
            aria-label={t.uiSearch || "Search"}
            onClick={() => navigate("/outbound/destinations")}
          >
            <Search size={20} strokeWidth={2} />
          </button>

          <div className="site-navbar__pickers">
            <CurrencyPicker darkMode={false} />
            <LanguagePicker currentLang={language} onSelect={setLanguage} darkMode={false} />
          </div>
        </div>

        <button
          type="button"
          className="site-navbar__icon-btn mobile-only"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="site-navbar__mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="site-navbar__mobile-links">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`site-navbar__mobile-link${isActive(link.path) ? " is-active" : ""}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      {Icon ? <Icon size={18} /> : null}
                      {link.name}
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                );
              })}

              <a
                href={phoneHref}
                className="site-navbar__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <Phone size={18} />
                  {contactPhone}
                </span>
              </a>

              <Link
                to="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ marginTop: "0.5rem", textAlign: "center" }}
              >
                {t.navBookingMain}
              </Link>

              <div className="site-navbar__mobile-pickers">
                <CurrencyPicker darkMode={false} />
                <LanguagePicker currentLang={language} onSelect={setLanguage} darkMode={false} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .site-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          border-top: 1px solid #e8e8e8;
          border-bottom: 1px solid #e8e8e8;
          padding-top: env(safe-area-inset-top, 0px);
        }

        .site-navbar__inner {
          display: flex;
          align-items: stretch;
          min-height: 88px;
          width: 100%;
        }

        .site-navbar__brand {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          min-width: 220px;
          padding: 1rem 1.75rem;
          background: hsl(var(--primary));
          color: #fff;
          text-decoration: none;
          overflow: hidden;
        }

        .site-navbar__brand-mark {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .site-navbar__arc {
          position: absolute;
          left: 50%;
          width: 118%;
          height: 70%;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          border-radius: 50%;
          transform: translateX(-50%);
        }

        .site-navbar__arc--top {
          top: -42%;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-right-color: transparent;
          clip-path: inset(55% 0 0 0);
        }

        .site-navbar__arc--bottom {
          bottom: -42%;
          border-top-color: transparent;
          border-left-color: transparent;
          border-right-color: transparent;
          clip-path: inset(0 0 55% 0);
        }

        .site-navbar__brand-text {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          line-height: 1.05;
        }

        .site-navbar__brand-name {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: baseline;
          gap: 0.25em;
          font-family: Outfit, sans-serif;
          font-size: clamp(1.15rem, 1.8vw, 1.45rem);
          letter-spacing: 0.01em;
          color: #fff;
        }

        .site-navbar__brand-name strong {
          font-weight: 800;
        }

        .site-navbar__brand-light {
          font-weight: 400;
        }

        .site-navbar__brand-tagline {
          margin-top: 0.4rem;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.92);
          max-width: 14rem;
        }

        .site-navbar__links {
          display: flex;
          align-items: center;
          flex: 1;
          gap: clamp(1rem, 1.8vw, 1.85rem);
          padding: 0 clamp(1rem, 1.8vw, 1.75rem);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .site-navbar__links::-webkit-scrollbar {
          display: none;
        }

        .site-navbar__link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
          padding: 0.5rem 0;
          text-decoration: none;
          color: #111;
          font-size: 1rem;
          font-weight: 600;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .site-navbar__link:hover {
          color: hsl(var(--primary));
        }

        .site-navbar__link.is-active {
          color: #111;
        }

        .site-navbar__link.is-active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2px;
          height: 2px;
          background: hsl(var(--primary));
        }

        .site-navbar__utils {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex-shrink: 0;
          padding: 0 1.15rem 0 0.35rem;
          margin-left: auto;
        }

        .site-navbar__phone {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          color: #111;
          font-weight: 700;
          font-size: 0.95rem;
          line-height: 1.15;
        }

        .site-navbar__phone:hover {
          color: hsl(var(--primary));
        }

        .site-navbar__phone-num {
          white-space: nowrap;
        }

        .site-navbar__divider {
          width: 1px;
          height: 36px;
          background: #d9d9d9;
          flex-shrink: 0;
        }

        .site-navbar__icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border: none;
          background: transparent;
          color: #111;
          cursor: pointer;
          border-radius: 0;
          flex-shrink: 0;
        }

        .site-navbar__icon-btn:hover {
          color: hsl(var(--primary));
        }

        .site-navbar__pickers {
          display: none;
          align-items: center;
          gap: 0.5rem;
        }

        .site-navbar__mobile {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
          padding: 1.25rem max(1.25rem, env(safe-area-inset-right, 0px)) 1.5rem max(1.25rem, env(safe-area-inset-left, 0px));
        }

        .site-navbar__mobile-links {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .site-navbar__mobile-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 0.15rem;
          text-decoration: none;
          color: #111;
          font-size: 1.05rem;
          font-weight: 700;
          border-bottom: 1px solid #f1f1f1;
        }

        .site-navbar__mobile-link.is-active {
          color: hsl(var(--primary));
        }

        .site-navbar__mobile-pickers {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .desktop-only { display: none !important; }
        .mobile-only { display: inline-flex !important; margin-left: auto; margin-right: 0.5rem; align-self: center; }

        @media (min-width: 1100px) {
          .desktop-only { display: flex !important; }
          .mobile-only { display: none !important; }
          .site-navbar__pickers { display: flex !important; }
        }

        @media (min-width: 1100px) and (max-width: 1280px) {
          .site-navbar__pickers { display: none !important; }
          .site-navbar__link { font-size: 0.9rem; }
          .site-navbar__links { gap: 0.9rem; }
        }
      `}</style>
    </header>
  );
}
