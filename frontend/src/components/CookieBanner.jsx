import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";

const STORAGE_KEY = "travel_site_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useSite();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== "accepted" && stored !== "rejected") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <p id="cookie-banner-title" className="cookie-banner__title">
            {t.cookieBannerTitle}
          </p>
          <p id="cookie-banner-desc" className="cookie-banner__message">
            {t.cookieBannerMessage}{" "}
            <Link to="/privacy" className="cookie-banner__link">
              {t.cookieBannerPrivacy}
            </Link>
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--outline"
            onClick={() => persist("rejected")}
          >
            {t.cookieBannerReject}
          </button>
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--primary"
            onClick={() => persist("accepted")}
          >
            {t.cookieBannerAccept}
          </button>
        </div>
      </div>
    </div>
  );
}
