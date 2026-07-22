import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";

// Context
import { SiteProvider, useSite } from "./context/SiteContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingObjects from "./components/FloatingObjects";
import CookieBanner from "./components/CookieBanner";
import HotPackagePopup from "./components/HotPackagePopup";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Inbound = lazy(() => import("./pages/Inbound"));
const Outbound = lazy(() => import("./pages/Outbound"));
const OutboundDestinations = lazy(() => import("./pages/OutboundDestinations"));
const OutboundContinent = lazy(() => import("./pages/OutboundContinent"));
const OutboundCountry = lazy(() => import("./pages/OutboundCountry"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Reviews = lazy(() => import("./pages/Reviews"));

// Loading Component
const PageLoader = () => (
  <div style={{
    minHeight: '100dvh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'hsl(var(--background))'
  }}>
    <div className="loader"></div>
  </div>
);

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Allow hash navigation (e.g. /page#section) to control scroll position.
    if (location.hash) return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return null;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isDestinationsPicker = location.pathname === "/outbound/destinations";
  const { localizedSettings: settings, t } = useSite();
  const announcementEnabled =
    settings?.announcementEnabled === true ||
    settings?.announcementEnabled === 1 ||
    settings?.announcementEnabled === "1";

  return (
    <div className="site-shell" style={isDestinationsPicker ? { height: '100dvh', overflow: 'hidden' } : undefined}>
      <ScrollToTop />
      {!isAdmin && announcementEnabled && settings?.announcementText && (
        <div className="announcement-banner">
          {settings.announcementText}
          {settings.announcementLink && (
            <a href={settings.announcementLink} target="_blank" rel="noreferrer">
              {t.uiLearnMore || 'Learn more'} →
            </a>
          )}
        </div>
      )}
      {!isAdmin && <FloatingObjects />}
      {!isAdmin && <Navbar />}
      
      <div
        className="site-main"
        style={
          isDestinationsPicker
            ? { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }
            : undefined
        }
      >
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </div>

      {!isAdmin && !isDestinationsPicker && <Footer />}
      {!isAdmin && <CookieBanner />}
      {!isAdmin && <HotPackagePopup />}
    </div>
  );
};


function AppRoutes() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inbound" element={<Inbound />} />
          <Route path="/outbound" element={<Outbound />} />
          <Route path="/outbound/destinations" element={<OutboundDestinations />} />
          <Route path="/outbound/destinations/:continentId" element={<OutboundContinent />} />
          <Route path="/outbound/destinations/:continentId/:countryId" element={<OutboundCountry />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <AppRoutes />
    </SiteProvider>
  );
}
