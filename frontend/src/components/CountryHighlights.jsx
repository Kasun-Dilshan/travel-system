import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';

function localizeHighlight(item, language) {
  if (!item) return null;
  return { ...item, ...getLocalizationBucket(item, language) };
}

/**
 * Country highlights gallery — horizontal place tabs + image / story panel.
 */
export default function CountryHighlights({ countryName, highlights = [] }) {
  const { language, t } = useSite();
  const [activeId, setActiveId] = useState(highlights[0]?.id || null);
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!highlights.length) {
      setActiveId(null);
      return;
    }
    if (!highlights.some((h) => h.id === activeId)) {
      setActiveId(highlights[0].id);
    }
  }, [highlights, activeId]);

  if (!highlights.length) return null;

  const active = highlights.find((h) => h.id === activeId) || highlights[0];
  const localized = localizeHighlight(active, language);
  const title = (t.outboundCountryHighlightsTitle || '{country} Highlights').replace(
    '{country}',
    countryName
  );

  return (
    <section
      id="highlights"
      style={{
        padding: 'clamp(1.25rem, 3vw, 2rem) 0 clamp(2.5rem, 5vw, 4rem)',
        scrollMarginTop: 72,
        background: 'hsl(var(--foreground) / 0.03)',
        marginLeft: 'calc(-1 * clamp(1.25rem, 4vw, 3.5rem))',
        marginRight: 'calc(-1 * clamp(1.25rem, 4vw, 3.5rem))',
        paddingLeft: 'clamp(1.25rem, 4vw, 3.5rem)',
        paddingRight: 'clamp(1.25rem, 4vw, 3.5rem)',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          margin: '0 0 clamp(1.25rem, 2.5vw, 1.85rem)',
          fontSize: 'clamp(1.65rem, 3.5vw, 2.35rem)',
          fontWeight: 800,
          color: 'hsl(var(--secondary))',
        }}
      >
        {title}
      </h2>

      <nav
        aria-label={title}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(0.85rem, 2vw, 1.75rem)',
          marginBottom: 'clamp(1.35rem, 2.5vw, 2rem)',
          borderBottom: '1px solid hsl(var(--foreground) / 0.1)',
          paddingBottom: '0.85rem',
        }}
      >
        {highlights.map((item) => {
          const loc = localizeHighlight(item, language);
          const isActive = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'clamp(1rem, 1.7vw, 1.2rem)',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? 'hsl(var(--secondary))' : 'hsl(var(--foreground) / 0.72)',
                padding: '0.25rem 0',
                position: 'relative',
              }}
            >
              {loc?.name || item.name}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: -14,
                    height: 3,
                    background: 'hsl(var(--primary))',
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
            minHeight: isNarrow ? 'auto' : 'clamp(320px, 42vh, 480px)',
            overflow: 'hidden',
            boxShadow: '0 18px 40px -28px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              minHeight: isNarrow ? 220 : '100%',
              overflow: 'hidden',
              background: '#111',
            }}
          >
            <img
              src={mediaUrl(active.image)}
              alt={localized?.name || active.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                minHeight: isNarrow ? 220 : 'clamp(320px, 42vh, 480px)',
              }}
            />
          </div>

          <div
            style={{
              background: 'hsl(var(--primary))',
              color: '#fff',
              padding: 'clamp(1.5rem, 3.5vw, 2.75rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <h3
              style={{
                margin: '0 0 clamp(0.85rem, 1.5vw, 1.25rem)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.15,
              }}
            >
              {localized?.name || active.name}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(1.05rem, 1.7vw, 1.2rem)',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.95)',
                flex: 1,
              }}
            >
              {localized?.description || active.description}
            </p>
            {(localized?.photoCredit || active.photoCredit) && (
              <p
                style={{
                  margin: 'clamp(1.25rem, 2vw, 1.75rem) 0 0',
                  fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                  opacity: 0.85,
                }}
              >
                {localized?.photoCredit || active.photoCredit}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
