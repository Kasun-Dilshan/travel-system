import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logoImg from "../assets/logo.webp";
import { Menu, X, ChevronRight } from "lucide-react";
import LanguagePicker from "./LanguagePicker";
import CurrencyPicker from "./CurrencyPicker";
import { useSite } from "../context/SiteContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useSite();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.navHome, path: "/" },
    { name: t.navInboundMain, path: "/inbound" },
    { name: t.navOutboundMain, path: "/outbound" },
    { name: t.navBlogMain, path: "/blog" },
    { name: t.navReviews || "Reviews", path: "/reviews" },
  ];


  const isActive = (path) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={scrolled ? "glass-nav" : ""}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: scrolled
          ? "max(0.75rem, env(safe-area-inset-top, 0px))"
          : "max(1.5rem, env(safe-area-inset-top, 0px))",
        paddingBottom: scrolled ? "0.75rem" : "1.5rem",
        paddingLeft: "max(5%, env(safe-area-inset-left, 0px))",
        paddingRight: "max(5%, env(safe-area-inset-right, 0px))",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        backgroundColor: scrolled ? "hsla(142, 40%, 98%, 0.8)" : "transparent",
      }}
    >
      <nav
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo Section */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={logoImg}
              alt="Serendib Logo"
              style={{
                height: scrolled ? "45px" : "60px",
                width: "auto",
                transition: "all 0.4s ease",
                filter: scrolled ? "none" : "brightness(1.5) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: scrolled ? "1.2rem" : "1.6rem",
                  fontWeight: "900",
                  letterSpacing: "1px",
                  color: scrolled ? "hsl(var(--foreground))" : "white",
                  lineHeight: 1,
                  transition: "all 0.4s ease",
                  textShadow: scrolled ? "none" : "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                SERENDIB
              </span>
              <span
                style={{
                  fontSize: scrolled ? "0.6rem" : "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "3px",
                  color: scrolled ? "hsl(var(--primary))" : "hsl(var(--primary))",
                  marginTop: "2px",
                  transition: "font-size 0.4s ease",
                  textShadow: scrolled ? "none" : "0 1px 5px rgba(0,0,0,0.5)",
                  filter: scrolled ? "none" : "saturate(1.5) brightness(1.2)",
                }}
              >
                TRAVEL & TOURS
              </span>
            </div>
          </motion.div>
        </Link>
 
        {/* Desktop Links */}
        <div
          style={{
            display: "none",
            gap: "2.5rem",
            alignItems: "center",
          }}
          className="desktop-links"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: isActive(link.path)
                  ? "hsl(var(--primary))"
                  : scrolled
                  ? "hsl(var(--foreground))"
                  : "white",
                transition: "all 0.3s ease",
                position: "relative",
                textShadow: scrolled ? "none" : "0 1px 10px rgba(0,0,0,0.3)",
              }}
            >
              {link.name}
              {isActive(link.path) && (
                <motion.div
                  layoutId="nav-underline"
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: 0,
                    right: 0,
                    height: "2px",
                    backgroundColor: "hsl(var(--primary))",
                    borderRadius: "2px",
                  }}
                />
              )}
            </Link>
          ))}
          
          <div style={{ marginLeft: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <CurrencyPicker darkMode={!scrolled} />
            <LanguagePicker currentLang={language} onSelect={setLanguage} darkMode={!scrolled} />
          </div>
        </div>
 
 
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: scrolled ? "hsl(var(--foreground))" : "white",
            transition: "all 0.3s ease",
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              padding: "2rem",
              paddingLeft: "max(2rem, env(safe-area-inset-left, 0px))",
              paddingRight: "max(2rem, env(safe-area-inset-right, 0px))",
              borderBottom: "1px solid hsl(var(--glass-border))",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              zIndex: 999,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    textDecoration: "none",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: isActive(link.path)
                      ? "hsl(var(--primary))"
                      : "hsl(var(--foreground))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {link.name}
                  <ChevronRight size={20} />
                </Link>
              ))}
              <Link
                to="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
              >
                {t.navBookingMain}
              </Link>
              
              <div style={{ 
                marginTop: "1.5rem", 
                paddingTop: "1.5rem", 
                borderTop: "1px solid hsl(var(--glass-border))",
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap"
              }}>
                <CurrencyPicker darkMode={false} />
                <LanguagePicker currentLang={language} onSelect={setLanguage} darkMode={false} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 969px) {
          .desktop-links { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 968px) {
          .desktop-links { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </motion.header>
  );
}
