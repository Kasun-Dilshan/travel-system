import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin } from 'lucide-react';
import { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';
import { INBOUND_REGIONS } from '../data/inbound-regions';

const ACTIVE = 'hsl(var(--primary))';

function localize(item, language) {
  if (!item) return null;
  return { ...item, ...getLocalizationBucket(item, language) };
}

/**
 * Inbound destinations filter: Tour type | Locations | Preview
 * @param {{ onSelectDestination?: (place, region) => void }} props
 */
export default function InboundDestinationsMenu({ onSelectDestination }) {
  const { language, t } = useSite();
  const regions = INBOUND_REGIONS;

  const [activeRegionId, setActiveRegionId] = useState(regions[0]?.id || '');
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === activeRegionId) || regions[0],
    [activeRegionId, regions]
  );

  const previewPlace = useMemo(() => {
    if (!hoveredPlaceId || !activeRegion) return null;
    return activeRegion.destinations.find((d) => d.id === hoveredPlaceId) || null;
  }, [hoveredPlaceId, activeRegion]);

  const localizedPreview = localize(previewPlace || activeRegion, language);

  const selectRegion = (id) => {
    setActiveRegionId(id);
    setHoveredPlaceId(null);
  };

  const openPlace = (place) => {
    if (!place) return;
    onSelectDestination?.(place, activeRegion);
  };

  const headerStyle = {
    fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'hsl(var(--foreground) / 0.45)',
    marginBottom: 'clamp(1rem, 1.5vw, 1.35rem)',
    flexShrink: 0,
  };

  const listItemBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    width: '100%',
    padding: 'clamp(0.65rem, 1.2vw, 0.9rem) 0',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'clamp(1.15rem, 2.2vw, 1.55rem)',
    fontWeight: 700,
    textAlign: language === 'ar' ? 'right' : 'left',
    color: 'hsl(var(--secondary))',
    transition: 'color 0.15s ease',
  };

  const columnBase = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: isMobile ? 'auto' : '100%',
    overflow: isMobile ? 'visible' : 'hidden',
    padding: isMobile
      ? '1.25rem 1.35rem'
      : 'clamp(1.5rem, 2.5vw, 2.25rem) clamp(1.5rem, 2.8vw, 2.5rem)',
    boxSizing: 'border-box',
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{
        width: '100%',
        minHeight: isMobile ? 'auto' : 480,
        height: isMobile ? 'auto' : 'min(560px, 62vh)',
        background: '#fff',
        borderRadius: 'clamp(1rem, 2vw, 1.75rem)',
        border: '1px solid hsl(var(--primary) / 0.1)',
        boxShadow: '0 24px 56px -28px rgba(0,0,0,0.22)',
        overflow: isMobile ? 'auto' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: isMobile ? 'auto' : 0,
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : 'minmax(220px, 0.9fr) minmax(260px, 1.05fr) minmax(320px, 1.45fr)',
          gridTemplateRows: isMobile ? 'auto' : '1fr',
          width: '100%',
          height: isMobile ? 'auto' : '100%',
        }}
      >
        <div
          style={{
            ...columnBase,
            borderRight: isMobile ? 'none' : '1px solid hsl(var(--foreground) / 0.08)',
            borderBottom: isMobile ? '1px solid hsl(var(--foreground) / 0.08)' : 'none',
          }}
        >
          <div style={headerStyle}>{t.inboundTourTypeHeading || 'Tour type'}</div>
          <nav
            aria-label={t.inboundTourTypeHeading || 'Tour type'}
            style={{ overflowY: isMobile ? 'visible' : 'auto', flex: 1, minHeight: 0 }}
          >
            {regions.map((region) => {
              const active = region.id === activeRegionId;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => selectRegion(region.id)}
                  style={{
                    ...listItemBase,
                    color: active ? ACTIVE : 'hsl(var(--secondary))',
                  }}
                >
                  {active ? (
                    <ChevronRight size={22} color={ACTIVE} style={{ flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 22, flexShrink: 0 }} />
                  )}
                  <span>{region.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div
          style={{
            ...columnBase,
            borderRight: isMobile ? 'none' : '1px solid hsl(var(--foreground) / 0.08)',
            borderBottom: isMobile ? '1px solid hsl(var(--foreground) / 0.08)' : 'none',
          }}
        >
          <div style={headerStyle}>{t.inboundLocationsHeading || 'Locations'}</div>
          <AnimatePresence mode="wait">
            <motion.nav
              key={activeRegionId}
              aria-label={t.inboundLocationsHeading || 'Locations'}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              style={{ overflowY: isMobile ? 'visible' : 'auto', flex: 1, minHeight: 0 }}
            >
              <button
                type="button"
                onClick={() => {
                  setHoveredPlaceId(null);
                  onSelectDestination?.(null, activeRegion);
                }}
                onMouseEnter={() => setHoveredPlaceId(null)}
                style={{
                  ...listItemBase,
                  color: !hoveredPlaceId ? ACTIVE : 'hsl(var(--secondary))',
                }}
              >
                {t.inboundAllLocations || 'All Locations'}
              </button>

              {activeRegion?.destinations.map((place) => {
                const loc = localize(place, language);
                const active = hoveredPlaceId === place.id;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onMouseEnter={() => setHoveredPlaceId(place.id)}
                    onFocus={() => setHoveredPlaceId(place.id)}
                    onClick={() => openPlace(place)}
                    style={{
                      ...listItemBase,
                      color: active ? ACTIVE : 'hsl(var(--secondary))',
                    }}
                  >
                    {loc?.name || place.name}
                  </button>
                );
              })}
            </motion.nav>
          </AnimatePresence>
        </div>

        <div
          style={{
            ...columnBase,
            background: 'linear-gradient(180deg, hsl(var(--primary) / 0.04), #fff 50%)',
          }}
        >
          <div style={{ ...headerStyle, color: ACTIVE }}>
            {t.navDestinations || 'Destinations'}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={previewPlace?.id || activeRegionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: isMobile ? 'visible' : 'auto',
              }}
            >
              {(previewPlace || activeRegion)?.image && (
                <div
                  style={{
                    width: '100%',
                    flex: isMobile ? '0 0 auto' : '1 1 52%',
                    minHeight: isMobile ? 160 : 180,
                    maxHeight: isMobile ? 220 : 'none',
                    borderRadius: 'clamp(0.85rem, 1.5vw, 1.25rem)',
                    overflow: 'hidden',
                    marginBottom: 'clamp(1rem, 1.8vw, 1.5rem)',
                  }}
                >
                  <img
                    src={mediaUrl((previewPlace || activeRegion).image)}
                    alt={localizedPreview?.name || activeRegion?.name || ''}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              )}

              <h3
                style={{
                  fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)',
                  fontWeight: 800,
                  color: 'hsl(var(--secondary))',
                  margin: '0 0 clamp(0.55rem, 1vw, 0.85rem)',
                }}
              >
                {localizedPreview?.name || activeRegion?.name}
              </h3>

              <p
                style={{
                  fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                  color: ACTIVE,
                  margin: '0 0 clamp(1rem, 1.5vw, 1.35rem)',
                  flex: '0 1 auto',
                }}
              >
                {(() => {
                  const text =
                    localizedPreview?.description ||
                    localizedPreview?.fullDescription ||
                    activeRegion?.description ||
                    'Discover Sri Lanka with our curated inbound tours.';
                  const limit = isMobile ? 160 : 200;
                  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
                })()}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                {previewPlace ? (
                  <button
                    type="button"
                    onClick={() => openPlace(previewPlace)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: 'clamp(0.75rem, 1.2vw, 0.95rem) clamp(1.25rem, 2vw, 1.6rem)',
                      borderRadius: '999px',
                      border: 'none',
                      background: 'hsl(var(--secondary))',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
                    }}
                  >
                    {t.navTours || 'View tours'}
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: ACTIVE,
                      opacity: 0.85,
                    }}
                  >
                    <MapPin size={36} strokeWidth={1.25} />
                    <span style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', fontWeight: 600 }}>
                      {t.outboundSelectCountryHint || 'Select a destination to view tours'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
