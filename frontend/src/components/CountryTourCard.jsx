import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';
import { getPackageLocalizationFallback } from '../utils/packageLocalizationFallback';
import { formatMoney } from '../utils/money';
import { normalizeItineraryDays } from './ItineraryTimeline';

function extractDays(duration) {
  const match = String(duration || '').match(/(\d+)/);
  return match ? match[1] : '—';
}

function daysFromPackage(pkg, localized) {
  const itinerary = localized?.itinerary ?? pkg?.itinerary;
  const dayCount = normalizeItineraryDays(Array.isArray(itinerary) ? itinerary : []).length;
  if (dayCount > 0) return String(dayCount);
  return extractDays(pkg?.duration);
}

/** Flat tour card matching Bunnik-style country gallery. */
export default function CountryTourCard({ pkg, onViewDetails }) {
  const { language, t, currency, usdToLkrRate } = useSite();
  const localized = {
    ...getPackageLocalizationFallback(pkg, language),
    ...getLocalizationBucket(pkg, language),
  };
  const title = localized.title || pkg.title;
  const days = daysFromPackage(pkg, localized);
  const priceLabel =
    Number(pkg.price) > 0
      ? formatMoney(pkg.price, currency, { usdToLkrRate, fromCurrency: pkg.currency })
      : t.uiContactForPrice || 'Contact us';

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onViewDetails?.(pkg)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails?.(pkg);
        }
      }}
      style={{
        cursor: 'pointer',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', width: '100%' }}>
        <img
          src={mediaUrl(pkg.image)}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div style={{ padding: 'clamp(1rem, 1.5vw, 1.25rem) 0 0.35rem', minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 'clamp(1.15rem, 2vw, 1.4rem)',
            fontWeight: 700,
            color: 'hsl(var(--secondary))',
            lineHeight: 1.35,
            minHeight: '2.5em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>

        <div
          style={{
            marginTop: 'clamp(0.85rem, 1.4vw, 1.1rem)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '0.75rem',
            borderTop: '1px solid hsl(var(--foreground) / 0.1)',
            paddingTop: 'clamp(0.7rem, 1.2vw, 0.9rem)',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 'clamp(1.15rem, 2vw, 1.75rem)', minWidth: 0, flex: 1 }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 'clamp(0.72rem, 1.1vw, 0.8rem)',
                  fontWeight: 600,
                  color: 'hsl(var(--foreground) / 0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t.outboundTourDays || 'Days'}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(1.05rem, 1.6vw, 1.2rem)',
                  color: 'hsl(var(--secondary))',
                }}
              >
                {days}
              </div>
            </div>

            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 'clamp(0.72rem, 1.1vw, 0.8rem)',
                  fontWeight: 600,
                  color: 'hsl(var(--foreground) / 0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t.uiFrom || 'STARTING FROM'}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(1.05rem, 1.6vw, 1.2rem)',
                  color: 'hsl(var(--secondary))',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {priceLabel}
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label={t.uiLearnMore || 'Learn more'}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(pkg);
            }}
            style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              border: 'none',
              borderRadius: 6,
              background: 'hsl(var(--primary))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
