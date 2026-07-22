import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Globe2 } from 'lucide-react';
import { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import useOutboundContinents from '../hooks/useOutboundContinents';
import { getLocalizationBucket } from '../utils/localization';
import SEO from './SEO';

const ACTIVE = 'hsl(var(--primary))';

function localize(item, language) {
  if (!item) return null;
  return { ...item, ...getLocalizationBucket(item, language) };
}

/**
 * Full-viewport destinations mega-menu:
 * Regions | Countries | Destinations preview
 */
export default function DestinationsMegaMenu() {
  const { language, t } = useSite();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { continents } = useOutboundContinents();

  const initialRegionId =
    searchParams.get('region') || continents[0]?.id || 'asia';

  const [activeRegionId, setActiveRegionId] = useState(initialRegionId);
  const [hoveredCountryId, setHoveredCountryId] = useState(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get('region');
    if (fromUrl && continents.some((c) => c.id === fromUrl)) {
      setActiveRegionId(fromUrl);
    } else if (continents.length && !continents.some((c) => c.id === activeRegionId)) {
      setActiveRegionId(continents[0].id);
    }
  }, [searchParams, continents, activeRegionId]);

  const activeRegion = useMemo(
    () => continents.find((c) => c.id === activeRegionId) || continents[0],
    [activeRegionId, continents]
  );

  const previewCountry = useMemo(() => {
    if (!hoveredCountryId || !activeRegion) return null;
    return activeRegion.countries.find((c) => c.id === hoveredCountryId) || null;
  }, [hoveredCountryId, activeRegion]);

  const localizedPreview = localize(previewCountry || activeRegion, language);

  const selectRegion = (id) => {
    setActiveRegionId(id);
    setHoveredCountryId(null);
    setSearchParams({ region: id }, { replace: true });
  };

  const openCountry = (country) => {
    if (!country || !activeRegion) return;
    navigate(`/outbound/destinations/${activeRegion.id}/${country.id}`);
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
    <main
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{
        flex: 1,
        height: '100%',
        minHeight: 0,
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'hsl(var(--background))',
        boxSizing: 'border-box',
        paddingTop: 'clamp(68px, 10vw, 88px)',
      }}
    >
      <SEO
        title={`${t.navDestinations || 'Destinations'} | Serendib Global Wonders`}
        description={
          t.outboundMegaMenuSubtitle ||
          'Choose a region, then pick a country to explore tours.'
        }
      />

      {/* Top bar — full width */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          padding: 'clamp(0.85rem, 1.5vw, 1.25rem) clamp(1.25rem, 3.5vw, 3rem)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Link
          to="/outbound"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: 'clamp(0.6rem, 1vw, 0.8rem) clamp(1rem, 1.5vw, 1.35rem)',
            borderRadius: '999px',
            border: '1px solid hsl(var(--accent) / 0.25)',
            background: 'hsl(var(--accent) / 0.08)',
            color: 'hsl(var(--secondary))',
            fontWeight: 700,
            fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} />
          {t.uiBack || 'Back'}
        </Link>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'hsl(var(--secondary))',
              lineHeight: 1.15,
            }}
          >
            {t.navDestinations || 'Destinations'}
          </h1>
          {!isMobile && (
            <p
              style={{
                margin: '0.35rem 0 0',
                fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                opacity: 0.6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t.outboundMegaMenuSubtitle ||
                'Choose a region, then pick a country to explore tours.'}
            </p>
          )}
        </div>
      </div>

      {/* Mega menu fills remaining viewport — edge to edge */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          padding: '0 clamp(1.25rem, 3.5vw, 3rem) clamp(1rem, 2vw, 1.75rem)',
          boxSizing: 'border-box',
          display: 'flex',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
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
            {/* Regions */}
            <div
              style={{
                ...columnBase,
                borderRight: isMobile ? 'none' : '1px solid hsl(var(--foreground) / 0.08)',
                borderBottom: isMobile ? '1px solid hsl(var(--foreground) / 0.08)' : 'none',
              }}
            >
              <div style={headerStyle}>{t.outboundRegionsHeading || 'Regions'}</div>
              <nav
                aria-label={t.outboundRegionsHeading || 'Regions'}
                style={{ overflowY: isMobile ? 'visible' : 'auto', flex: 1, minHeight: 0 }}
              >
                {continents.map((region) => {
                  const loc = localize(region, language);
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
                      <span>{loc?.name || region.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Countries */}
            <div
              style={{
                ...columnBase,
                borderRight: isMobile ? 'none' : '1px solid hsl(var(--foreground) / 0.08)',
                borderBottom: isMobile ? '1px solid hsl(var(--foreground) / 0.08)' : 'none',
              }}
            >
              <div style={headerStyle}>{t.outboundCountriesHeading || 'Countries'}</div>
              <AnimatePresence mode="wait">
                <motion.nav
                  key={activeRegionId}
                  aria-label={t.outboundCountriesHeading || 'Countries'}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflowY: isMobile ? 'visible' : 'auto', flex: 1, minHeight: 0 }}
                >
                  <button
                    type="button"
                    onClick={() => setHoveredCountryId(null)}
                    onMouseEnter={() => setHoveredCountryId(null)}
                    style={{
                      ...listItemBase,
                      color: !hoveredCountryId ? ACTIVE : 'hsl(var(--secondary))',
                    }}
                  >
                    {t.outboundAllCountries || 'All Countries'}
                  </button>

                  {activeRegion?.countries.map((country) => {
                    const loc = localize(country, language);
                    const active = hoveredCountryId === country.id;
                    return (
                      <button
                        key={country.id}
                        type="button"
                        onMouseEnter={() => setHoveredCountryId(country.id)}
                        onFocus={() => setHoveredCountryId(country.id)}
                        onClick={() => openCountry(country)}
                        style={{
                          ...listItemBase,
                          color: active ? ACTIVE : 'hsl(var(--secondary))',
                        }}
                      >
                        {loc?.name || country.name}
                      </button>
                    );
                  })}
                </motion.nav>
              </AnimatePresence>
            </div>

            {/* Destinations preview */}
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
                  key={previewCountry?.id || activeRegionId}
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
                  {(previewCountry || activeRegion)?.image && (
                    <div
                      style={{
                        width: '100%',
                        flex: isMobile ? '0 0 auto' : '1 1 52%',
                        minHeight: isMobile ? 160 : 220,
                        maxHeight: isMobile ? 220 : 'none',
                        borderRadius: 'clamp(0.85rem, 1.5vw, 1.25rem)',
                        overflow: 'hidden',
                        marginBottom: 'clamp(1rem, 1.8vw, 1.5rem)',
                      }}
                    >
                      <img
                        src={mediaUrl((previewCountry || activeRegion).image)}
                        alt={localizedPreview?.name || ''}
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
                        t.outboundMegaPreviewBlurb ||
                        'Get packed for the adventure of a lifetime.';
                      const limit = isMobile ? 160 : 260;
                      return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
                    })()}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                    {previewCountry ? (
                      <button
                        type="button"
                        onClick={() => openCountry(previewCountry)}
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
                        {t.uiLearnMore || 'Learn more'}
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
                        <Globe2 size={36} strokeWidth={1.25} />
                        <span style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', fontWeight: 600 }}>
                          {t.outboundSelectCountryHint || 'Select a country to view tours'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
