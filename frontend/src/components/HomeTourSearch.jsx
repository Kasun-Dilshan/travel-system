import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import PackageCard from './PackageCard';
import API_URL from '../config';
import { useSite } from '../context/SiteContext';
import useOutboundContinents from '../hooks/useOutboundContinents';
import {
  filterPackagesByCountryName,
  findCountriesByName,
} from '../data/outbound-regions';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export default function HomeTourSearch({ onOpenTour }) {
  const { language, t } = useSite();
  const { continents } = useOutboundContinents();
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/packages?lang=${encodeURIComponent(language)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) setPackages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching packages:', err);
        if (!cancelled) setPackages([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const trimmedQuery = query.trim();
  const filteredTours = useMemo(
    () => filterPackagesByCountryName(packages, continents, trimmedQuery),
    [packages, continents, trimmedQuery]
  );
  const countrySuggestions = useMemo(
    () => findCountriesByName(continents, trimmedQuery, 6),
    [continents, trimmedQuery]
  );

  const placeholder =
    t.homeSearchPlaceholder ||
    t.findToursPlaceholder ||
    'Search by country or tour name...';
  const isRtl = language === 'ar';
  const resultsRef = useRef(null);

  const scrollToResults = () => {
    if (!trimmedQuery) return;
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="home-tour-search"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 max(1.25rem, 5%)',
        paddingLeft: 'max(1.25rem, 5%, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1.25rem, 5%, env(safe-area-inset-right, 0px))',
        paddingBottom: trimmedQuery ? 0 : '1.25rem',
      }}
    >
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        onSubmit={(e) => {
          e.preventDefault();
          scrollToResults();
        }}
        style={{
          position: 'relative',
          zIndex: 20,
          marginTop: '-3.25rem',
          maxWidth: '760px',
          marginLeft: 'auto',
          marginRight: 'auto',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.35)',
          border: '1px solid hsl(var(--glass-border))',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.55rem 0.55rem 0.55rem 0.35rem',
        }}
      >
        <Search
          size={20}
          style={{
            flexShrink: 0,
            marginLeft: isRtl ? 0 : '0.85rem',
            marginRight: isRtl ? '0.85rem' : 0,
            color: 'hsl(var(--primary))',
            opacity: 0.9,
          }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            background: 'transparent',
            height: '3rem',
            fontSize: '1.02rem',
            padding: '0 0.35rem',
            minWidth: 0,
            color: 'hsl(var(--foreground))',
            fontFamily: 'inherit',
          }}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t.uiClear || 'Clear'}
            style={{
              border: 'none',
              background: 'hsl(var(--primary) / 0.08)',
              color: 'hsl(var(--primary))',
              width: '2.15rem',
              height: '2.15rem',
              borderRadius: '999px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        ) : null}
        <button
          type="submit"
          className="home-search-submit"
          style={{
            border: 'none',
            background: 'hsl(var(--primary))',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.92rem',
            padding: '0.8rem 1.25rem',
            borderRadius: '1.1rem',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {t.uiSearch || t.homeSearchButton || 'Search'}
        </button>
      </motion.form>

      <style>{`
        .home-tour-search input[type="search"]::-webkit-search-cancel-button,
        .home-tour-search input[type="search"]::-webkit-search-decoration {
          -webkit-appearance: none;
          appearance: none;
        }
        @media (max-width: 520px) {
          .home-search-submit {
            padding: 0.8rem 0.95rem !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>

      {trimmedQuery ? (
        <div ref={resultsRef} style={{ padding: '2rem 0 0.5rem' }}>
          {trimmedQuery && countrySuggestions.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              {countrySuggestions.map((c) => (
                <button
                  key={`${c.continentId}-${c.id}`}
                  type="button"
                  onClick={() => setQuery(c.name)}
                  style={{
                    border: '1px solid hsl(var(--primary) / 0.15)',
                    background: 'hsl(var(--primary) / 0.05)',
                    color: 'hsl(var(--secondary))',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.95rem',
              color: 'hsl(var(--foreground) / 0.55)',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            {isLoading
              ? t.uiLoading || 'Loading tours...'
              : (t.findToursResultsFor || '{count} tours for “{query}”')
                  .replace('{count}', String(filteredTours.length))
                  .replace('{query}', trimmedQuery)}
          </p>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="loader" />
            </div>
          ) : filteredTours.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                borderRadius: '1.5rem',
                background: 'hsl(var(--primary) / 0.03)',
                border: '1px dashed hsl(var(--primary) / 0.15)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  marginBottom: '0.5rem',
                  color: 'hsl(var(--secondary))',
                }}
              >
                {t.findToursEmptyTitle || 'No tours found'}
              </h2>
              <p style={{ color: 'hsl(var(--foreground) / 0.55)', maxWidth: '420px', margin: '0 auto' }}>
                {t.findToursEmptyDesc ||
                  'Try another country or tour name, or clear the search to see all tours.'}
              </p>
            </div>
          ) : (
            <motion.div
              key={trimmedQuery}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid-layout"
            >
              {filteredTours.map((pkg) => (
                <motion.div variants={fadeInUp} key={pkg._id || pkg.id}>
                  <PackageCard pkg={pkg} image={pkg.image} onViewDetails={onOpenTour} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      ) : null}
    </div>
  );
}
