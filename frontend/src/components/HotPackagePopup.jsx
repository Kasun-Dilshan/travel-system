import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Flame, ArrowRight } from 'lucide-react';
import API_URL, { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';
import { getPackageLocalizationFallback } from '../utils/packageLocalizationFallback';
import { formatMoney } from '../utils/money';
import { isTruthyFlag } from '../utils/flags';

const STORAGE_KEY = 'travel_site_hot_package_popup_dismissed';

export default function HotPackagePopup() {
  const navigate = useNavigate();
  const { language, t, currency, usdToLkrRate } = useSite();
  const [hotPackages, setHotPackages] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const dismissed = sessionStorage.getItem(STORAGE_KEY);
        if (dismissed === '1') return;

        const res = await fetch(`${API_URL}/packages?lang=${encodeURIComponent(language)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const hot = data.filter((pkg) => isTruthyFlag(pkg.isHot));
        if (cancelled || hot.length === 0) return;

        setHotPackages(hot);
        setVisible(true);
      } catch {
        // silently ignore fetch errors
      }
    })();

    return () => { cancelled = true; };
  }, [language]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const openTour = (pkg) => {
    const id = pkg?._id ?? pkg?.id;
    if (!id) return;
    dismiss();
    navigate(`/tours/${id}`);
  };

  if (!visible) return null;

  const popup = (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hot-package-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'max(1rem, env(safe-area-inset-top, 0px)) max(1rem, env(safe-area-inset-right, 0px)) max(1rem, env(safe-area-inset-bottom, 0px)) max(1rem, env(safe-area-inset-left, 0px))',
          }}
          onClick={dismiss}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hot-package-title"
            style={{
              width: 'min(920px, 100%)',
              maxHeight: 'min(88vh, 760px)',
              overflow: 'hidden',
              background: 'hsl(var(--card))',
              borderRadius: '1.75rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              border: '1px solid hsl(var(--glass-border))',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid hsl(var(--glass-border))',
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--secondary) / 0.08))',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <Flame size={22} color="hsl(var(--primary))" />
                  <h2 id="hot-package-title" className="serif" style={{ margin: 0, fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 900, color: 'hsl(var(--secondary))' }}>
                    {t.hotPackageTitle || 'Hot Package'}
                  </h2>
                </div>
                <p style={{ margin: 0, color: 'hsl(var(--foreground) / 0.7)', fontSize: '0.95rem' }}>
                  {t.hotPackageSubtitle || "Don't miss these trending travel packages!"}
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t.uiClose || 'Close'}
                style={{
                  border: 'none',
                  background: 'hsl(var(--background))',
                  borderRadius: '999px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              padding: '1.25rem 1.5rem 1.5rem',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}>
              {hotPackages.map((pkg) => {
                const localized = {
                  ...getPackageLocalizationFallback(pkg, language),
                  ...getLocalizationBucket(pkg, language),
                };
                const title = localized.title || pkg.title;
                const duration = localized.duration || pkg.duration;
                const category = localized.category || pkg.category;

                return (
                  <article
                    key={pkg._id || pkg.id}
                    style={{
                      borderRadius: '1.25rem',
                      overflow: 'hidden',
                      border: '1px solid hsl(var(--glass-border))',
                      background: 'hsl(var(--background))',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ position: 'relative', height: '160px' }}>
                      <img
                        src={mediaUrl(pkg.image)}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        background: 'hsl(var(--primary))',
                        color: 'white',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        <Flame size={12} /> HOT
                      </span>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--secondary))', lineHeight: 1.3 }}>
                        {title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--foreground) / 0.65)' }}>
                        {duration} · {category}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'hsl(var(--primary))' }}>
                          {formatMoney(pkg.price || 0, currency, { usdToLkrRate, fromCurrency: pkg.currency })}
                        </span>
                        <button
                          type="button"
                          onClick={() => openTour(pkg)}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
                        >
                          {t.hotPackageViewDetails || t.uiLearnMore || 'View Details'}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(popup, document.body) : popup;
}
