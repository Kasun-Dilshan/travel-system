import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight, ChevronDown, MapPin, Phone, Search } from "lucide-react";
import LanguagePicker from "./LanguagePicker";
import CurrencyPicker from "./CurrencyPicker";
import { useSite } from "../context/SiteContext";
import serendibLogo from "../assets/serendib-logo.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, localizedSettings, settings } = useSite();

  const companyName =
    localizedSettings?.companyName || settings?.companyName || "Serendib Travel & Tours";
  const logoSrc = serendibLogo;
  const contactPhone =
    localizedSettings?.contactPhone || settings?.contactPhone || "+94 77 113 3100";
  const phoneHref = `tel:${contactPhone.replace(/[^\d+]/g, "")}`;

  const serviceChildren = [
    { name: t.serviceTickets || "Tickets", path: "/services#tickets" },
    { name: t.serviceVisa || "Visa", path: "/services#visa" },
    { name: t.serviceToursBooking || "Tours Booking", path: "/services#tours-booking" },
  ];

  const navLinks = [
    { name: t.navFindTours || "Find tours...", path: "/booking", icon: MapPin },
    { name: t.navInboundMain, path: "/inbound" },
    { name: t.navOutboundMain, path: "/outbound" },
    { name: t.navDestinations || "Destinations", path: "/outbound/destinations" },
    { name: t.navBlogMain, path: "/blog" },
    { name: t.navReviews || "Reviews", path: "/reviews" },
    {
      name: t.navServices || "Services",
      path: "/services",
      children: serviceChildren,
    },
  ];

  useEffect(() => {
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!servicesOpen) return undefined;
    const onPointerDown = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setServicesOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [servicesOpen]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path.startsWith("/#")) return location.pathname === "/" && location.hash === path.slice(1);
    if (path.includes("#")) {
      const [pathname, hash] = path.split("#");
      return location.pathname === pathname && location.hash === `#${hash}`;
    }
    if (path === "/outbound/destinations") {
      return location.pathname.startsWith("/outbound/destinations");
    }
    if (path === "/outbound") {
      return location.pathname === "/outbound";
    }
    if (path === "/services") {
      return location.pathname === "/services";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="site-navbar">
      <nav className="site-navbar__inner" aria-label="Main">
        <Link
          to="/"
          className="site-navbar__brand"
          onClick={() => setMobileMenuOpen(false)}
          aria-label={companyName}
        >
          <img
            src={logoSrc}
            alt={companyName}
            className="site-navbar__brand-logo"
          />
        </Link>

        <div className="site-navbar__links desktop-only">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            const hasChildren = Array.isArray(link.children) && link.children.length > 0;

            if (hasChildren) {
              return (
                <div
                  key={link.path}
                  className={`site-navbar__dropdown${servicesOpen ? " is-open" : ""}`}
                  ref={servicesRef}
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    type="button"
                    className={`site-navbar__link site-navbar__dropdown-trigger${active || servicesOpen ? " is-active" : ""}`}
                    aria-label={`${link.name} menu`}
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    onClick={() => setServicesOpen((open) => !open)}
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      size={16}
                      strokeWidth={2.25}
                      aria-hidden="true"
                      className="site-navbar__dropdown-chevron"
                      style={{
                        transform: servicesOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>

                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        className="site-navbar__dropdown-menu"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16 }}
                        role="menu"
                      >
                        <Link
                          to={link.path}
                          role="menuitem"
                          className={`site-navbar__dropdown-item${location.pathname === link.path && !location.hash ? " is-active" : ""}`}
                          onClick={() => setServicesOpen(false)}
                        >
                          {t.servicesPageTitle || "Our Services"}
                        </Link>
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            role="menuitem"
                            className={`site-navbar__dropdown-item${isActive(child.path) ? " is-active" : ""}`}
                            onClick={() => setServicesOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

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
                const hasChildren = Array.isArray(link.children) && link.children.length > 0;

                if (hasChildren) {
                  return (
                    <div key={link.path} className="site-navbar__mobile-group">
                      <button
                        type="button"
                        className={`site-navbar__mobile-link site-navbar__mobile-accordion${isActive(link.path) ? " is-active" : ""}`}
                        aria-expanded={mobileServicesOpen}
                        onClick={() => setMobileServicesOpen((open) => !open)}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                          {link.name}
                        </span>
                        <ChevronDown
                          size={18}
                          style={{
                            transform: mobileServicesOpen ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="site-navbar__mobile-submenu"
                          >
                            <Link
                              to={link.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`site-navbar__mobile-sublink${location.pathname === link.path && !location.hash ? " is-active" : ""}`}
                            >
                              {t.servicesPageTitle || "Our Services"}
                            </Link>
                            {link.children.map((child) => (
                              <Link
                                key={child.path}
                                to={child.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`site-navbar__mobile-sublink${isActive(child.path) ? " is-active" : ""}`}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

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
          overflow: visible;
        }

        .site-navbar__inner {
          display: flex;
          align-items: stretch;
          min-height: 100px;
          width: 100%;
        }

        .site-navbar__brand {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          min-width: 280px;
          max-width: 380px;
          padding: 0.25rem 0.75rem;
          background: #fff;
          text-decoration: none;
          overflow: hidden;
        }

        .site-navbar__brand-logo {
          display: block;
          width: 100%;
          max-width: 340px;
          height: auto;
          max-height: 110px;
          object-fit: contain;
        }

        .site-navbar__links {
          display: flex;
          align-items: center;
          flex: 1;
          gap: clamp(1rem, 1.8vw, 1.85rem);
          padding: 0 clamp(1rem, 1.8vw, 1.75rem);
          overflow: visible;
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
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
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

        .site-navbar__dropdown {
          position: relative;
          display: flex;
          align-items: center;
          align-self: stretch;
        }

        .site-navbar__dropdown-trigger {
          gap: 0.3rem;
          height: 100%;
          align-self: stretch;
        }

        .site-navbar__dropdown-chevron {
          flex-shrink: 0;
        }

        .site-navbar__dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 220px;
          margin-top: 0;
          padding: 0.55rem;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 0.85rem;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
          z-index: 1200;
        }

        /* Keep hover bridge so options stay open under the arrow */
        .site-navbar__dropdown.is-open::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          height: 10px;
        }

        .site-navbar__dropdown-item {
          display: block;
          padding: 0.7rem 0.85rem;
          border-radius: 0.55rem;
          color: #111;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .site-navbar__dropdown-item:hover,
        .site-navbar__dropdown-item.is-active {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
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
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
        }

        .site-navbar__mobile-link.is-active {
          color: hsl(var(--primary));
        }

        .site-navbar__mobile-submenu {
          overflow: hidden;
          padding: 0 0 0.35rem 0.85rem;
        }

        .site-navbar__mobile-sublink {
          display: block;
          padding: 0.65rem 0.15rem;
          color: #333;
          text-decoration: none;
          font-size: 0.98rem;
          font-weight: 600;
          border-bottom: 1px solid #f5f5f5;
        }

        .site-navbar__mobile-sublink.is-active {
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
