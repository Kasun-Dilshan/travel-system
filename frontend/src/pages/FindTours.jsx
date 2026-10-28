import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, X } from 'lucide-react';
import SEO from '../components/SEO';
import PackageCard from '../components/PackageCard';
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
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function FindTours() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useSite();
  const { continents } = useOutboundContinents();
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get('q') || '');

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

  const openTour = (tour) => {
    const id = tour?._id ?? tour?.id;
    if (!id) return;
    navigate(`/tours/${id}`);
  };

  const title = t.findToursTitle || t.navFindTours || 'Find tours';
  const subtitle =
    t.findToursSubtitle ||
    'Search by country or tour name to discover matching tours.';
  const placeholder =
    t.findToursPlaceholder || 'Search by country or tour name (e.g. France, Japan, Paris)';

  return (
    <main
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{
        minHeight: '70vh',
        padding: '2.5rem max(1.25rem, 5%) 4rem',
        background:
          'linear-gradient(180deg, hsl(var(--primary) / 0.04) 0%, hsl(var(--background)) 40%)',
      }}
    >
      <SEO title={`${title} | Serendib Travel`} description={subtitle} />

      <div className="container" style={{ maxWidth: '1200px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'hsl(var(--primary))',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            <MapPin size={16} />
            {t.navFindTours || 'Find tours'}
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
              fontWeight: 900,
              color: 'hsl(var(--secondary))',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'hsl(var(--foreground) / 0.55)',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          style={{
            maxWidth: '640px',
            margin: '0 auto 2.5rem',
            position: 'relative',
          }}
        >
          <Search
            size={20}
            style={{
              position: 'absolute',
              top: '50%',
              [language === 'ar' ? 'right' : 'left']: '1.15rem',
              transform: 'translateY(-50%)',
              color: 'hsl(var(--primary))',
              pointerEvents: 'none',
              opacity: 0.85,
            }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="form-control"
            autoFocus
            style={{
              paddingLeft: language === 'ar' ? '1.25rem' : '3rem',
              paddingRight: language === 'ar' ? '3rem' : (query ? '3rem' : '1.25rem'),
              height: '3.5rem',
              fontSize: '1.05rem',
              borderRadius: '1.25rem',
              backgroundColor: 'white',
              boxShadow: '0 12px 40px -18px rgba(0,0,0,0.18)',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t.uiClear || 'Clear'}
              style={{
                position: 'absolute',
                top: '50%',
                [language === 'ar' ? 'left' : 'right']: '0.85rem',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'hsl(var(--primary) / 0.08)',
                color: 'hsl(var(--primary))',
                width: '2rem',
                height: '2rem',
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </motion.div>

        {trimmedQuery && countrySuggestions.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '1.75rem',
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

        <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: 'hsl(var(--foreground) / 0.55)', fontWeight: 600 }}>
            {isLoading
              ? t.uiLoading || 'Loading tours...'
              : trimmedQuery
                ? (t.findToursResultsFor || '{count} tours for “{query}”')
                    .replace('{count}', String(filteredTours.length))
                    .replace('{query}', trimmedQuery)
                : (t.findToursShowingAll || '{count} tours — type a country or tour name to filter')
                    .replace('{count}', String(filteredTours.length))}
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="loader" />
          </div>
        ) : filteredTours.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              borderRadius: '1.5rem',
              background: 'hsl(var(--primary) / 0.03)',
              border: '1px dashed hsl(var(--primary) / 0.15)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'hsl(var(--secondary))' }}>
              {t.findToursEmptyTitle || 'No tours found'}
            </h2>
            <p style={{ color: 'hsl(var(--foreground) / 0.55)', maxWidth: '420px', margin: '0 auto' }}>
              {t.findToursEmptyDesc ||
                'Try another country or tour name, or clear the search to see all tours.'}
            </p>
          </div>
        ) : (
          <motion.div
            key={trimmedQuery || 'all'}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid-layout"
          >
            {filteredTours.map((pkg) => (
              <motion.div variants={fadeInUp} key={pkg._id || pkg.id}>
                <PackageCard pkg={pkg} image={pkg.image} onViewDetails={openTour} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
