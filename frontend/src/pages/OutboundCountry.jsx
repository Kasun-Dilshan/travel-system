import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Building2,
  Languages,
  Coins,
  Church,
  Clock,
  CalendarDays,
  Sparkles,
  Globe2,
} from 'lucide-react';
import TourModal from '../components/TourModal';
import CountryTourCard from '../components/CountryTourCard';
import CountryHighlights from '../components/CountryHighlights';
import SEO from '../components/SEO';
import API_URL, { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { OUTBOUND_DEMO_TOURS } from '../data/outbound-demo-tours';
import {
  getCountryById,
  filterPackagesByCountry,
  mergeOutboundPackages,
} from '../data/outbound-regions';
import useOutboundContinents from '../hooks/useOutboundContinents';
import { localizeRegionItem } from '../components/OutboundDestinationsExplorer';
import logoImg from '../assets/logo.webp';

const PRIMARY = 'hsl(var(--primary))';
const NAV_CLEARANCE = '1.25rem';

function tipIcon(label) {
  const key = String(label || '').toLowerCase();
  if (key.includes('capital')) return Building2;
  if (key.includes('language')) return Languages;
  if (key.includes('currency')) return Coins;
  if (key.includes('religion')) return Church;
  if (key.includes('time')) return Clock;
  if (key.includes('best')) return CalendarDays;
  if (key.includes('highlight')) return Sparkles;
  return Globe2;
}

export default function OutboundCountry() {
  const { continentId, countryId } = useParams();
  const { language, t } = useSite();
  const { continents, isLoading: destinationsLoading } = useOutboundContinents();
  const { continent, country } = getCountryById(continentId, countryId, continents);

  const [packages, setPackages] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/packages?lang=${encodeURIComponent(language)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) setPackages(data.filter((p) => p.category === 'Outbound'));
      } catch (err) {
        console.error('Error fetching packages:', err);
        if (!cancelled) setPackages([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    const ids = ['overview', 'tours', 'highlights', 'facts'];
    const observers = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -45% 0px', threshold: 0.05 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [countryId]);

  const localizedContinent = useMemo(
    () => localizeRegionItem(continent, language),
    [continent, language]
  );
  const localizedCountry = useMemo(
    () => localizeRegionItem(country, language),
    [country, language]
  );

  const countryTours = useMemo(() => {
    const merged = mergeOutboundPackages(packages, OUTBOUND_DEMO_TOURS);
    return filterPackagesByCountry(merged, country, continent?.id);
  }, [packages, country, continent]);

  if (destinationsLoading) {
    return (
      <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
        Loading destination…
      </div>
    );
  }

  if (!continent || !country) {
    return <Navigate to="/outbound/destinations" replace />;
  }

  const countryName = localizedCountry?.name || country.name;
  const intro =
    localizedCountry?.fullDescription ||
    localizedCountry?.description ||
    country.fullDescription;
  const tips =
    (localizedCountry?.tips?.length && localizedCountry.tips) ||
    country.tips ||
    localizedCountry?.facts ||
    country.facts ||
    [];

  const highlights =
    (localizedCountry?.highlights?.length && localizedCountry.highlights) ||
    country.highlights ||
    [];

  const openTour = (tour) => {
    setSelectedTour(tour);
    setTourOpen(true);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navItems = [
    { id: 'overview', label: t.outboundOverview || 'Overview' },
    { id: 'tours', label: t.outboundSmallGroupTours || 'Small Group Tours' },
    ...(highlights.length
      ? [{ id: 'highlights', label: t.uiHighlights || 'Highlights' }]
      : []),
    { id: 'facts', label: t.outboundFactsTips || 'Facts & Tips' },
  ];

  const sidePad = 'clamp(1.25rem, 4vw, 3.5rem)';

  return (
    <main
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        background: '#fff',
        paddingTop: NAV_CLEARANCE,
        paddingBottom: 'clamp(3rem, 7vw, 6rem)',
        textAlign: language === 'ar' ? 'right' : 'left',
        boxSizing: 'border-box',
      }}
    >
      <SEO
        title={`${countryName} ${t.outboundToursSuffix || 'Tours'} | Serendib Global Wonders`}
        description={intro}
      />

      {/* Sub navigation — full width */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid hsl(var(--foreground) / 0.08)',
        }}
      >
        <div
          style={{
            width: '100%',
            margin: '0 auto',
            padding: `clamp(0.85rem, 1.4vw, 1.15rem) ${sidePad}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: isNarrow ? 'nowrap' : 'wrap',
            overflowX: isNarrow ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
            boxSizing: 'border-box',
          }}
        >
          <Link
            to={`/outbound/destinations?region=${continent.id}`}
            style={{
              color: 'hsl(var(--secondary))',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {(t.outboundRegionTours || '{region} Tours').replace(
              '{region}',
              localizedContinent?.name || continent.name
            )}
          </Link>

          <nav
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 'clamp(1rem, 2.5vw, 1.75rem)',
              alignItems: 'center',
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
                  fontWeight: activeSection === item.id ? 700 : 500,
                  color: activeSection === item.id ? PRIMARY : 'hsl(var(--secondary))',
                  padding: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/outbound/destinations"
              style={{
                color: 'hsl(var(--secondary))',
                textDecoration: 'none',
                fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {t.navDestinations || 'Destinations'}
            </Link>
          </nav>
        </div>
      </div>

      {/* Title strip — full bleed */}
      <div
        style={{
          background: 'hsl(var(--secondary))',
          color: '#fff',
          padding: `clamp(1.1rem, 2vw, 1.65rem) ${sidePad}`,
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: isNarrow ? '1fr' : '64px 1fr 64px',
            alignItems: 'center',
            gap: '1rem',
            boxSizing: 'border-box',
          }}
        >
          {!isNarrow && <span />}
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.85rem, 4.5vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.15,
              wordBreak: 'break-word',
            }}
          >
            {countryName} {t.outboundToursSuffix || 'Tours'}
          </h1>
          {!isNarrow && (
            <img
              src={logoImg}
              alt=""
              aria-hidden="true"
              style={{
                height: 44,
                width: 'auto',
                maxWidth: 64,
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                opacity: 0.9,
                justifySelf: 'end',
              }}
            />
          )}
        </div>
      </div>

      {/* Hero image — full bleed, taller */}
      <div
        style={{
          width: '100%',
          height: 'clamp(240px, 48vh, 560px)',
          maxHeight: '56dvh',
          overflow: 'hidden',
          background: '#111',
        }}
      >
        <img
          src={mediaUrl(country.image)}
          alt={countryName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </div>

      <div
        style={{
          width: '100%',
          margin: '0 auto',
          padding: `0 ${sidePad}`,
          boxSizing: 'border-box',
        }}
      >
        <section
          id="overview"
          style={{
            padding: 'clamp(2.25rem, 5vw, 3.75rem) 0 clamp(1.75rem, 3.5vw, 2.5rem)',
            scrollMarginTop: 72,
          }}
        >
          <p
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              textAlign: 'center',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
              lineHeight: 1.75,
              color: 'hsl(var(--foreground) / 0.82)',
            }}
          >
            {intro}
          </p>
        </section>

        <section
          id="tours"
          style={{
            padding: 'clamp(1.25rem, 3vw, 2rem) 0 clamp(2.5rem, 5vw, 4rem)',
            scrollMarginTop: 72,
          }}
        >
          <h2
            style={{
              margin: '0 0 clamp(1.5rem, 3vw, 2.25rem)',
              fontSize: 'clamp(1.65rem, 3.5vw, 2.35rem)',
              fontWeight: 800,
              color: 'hsl(var(--secondary))',
            }}
          >
            {t.outboundSmallGroupTours || 'Small Group Tours'}
          </h2>

          {countryTours.length > 0 ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isNarrow
                    ? '1fr'
                    : 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                  gap: 'clamp(1.75rem, 3.5vw, 2.75rem) clamp(1.35rem, 2.5vw, 2.25rem)',
                }}
              >
                {countryTours.map((pkg) => (
                  <CountryTourCard
                    key={pkg._id || pkg.id}
                    pkg={pkg}
                    onViewDetails={openTour}
                  />
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 'clamp(2rem, 4vw, 3rem)',
                }}
              >
                <button
                  type="button"
                  onClick={() => scrollTo('tours')}
                  style={{
                    border: 'none',
                    borderRadius: 6,
                    padding: 'clamp(0.95rem, 1.5vw, 1.15rem) clamp(1.5rem, 2.5vw, 2rem)',
                    background: PRIMARY,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    maxWidth: '100%',
                  }}
                >
                  {t.outboundBrowseAllTours || 'Browse all Small Group Tours'}
                </button>
              </div>
            </>
          ) : (
            <p
              style={{
                opacity: 0.7,
                textAlign: 'center',
                padding: '2rem 0',
                fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
              }}
            >
              {t.outboundNoCountryTours ||
                'No tours available for this country yet. Check back soon.'}
            </p>
          )}
        </section>

        {highlights.length > 0 && (
          <CountryHighlights countryName={countryName} highlights={highlights} />
        )}

        <section
          id="facts"
          style={{
            padding: '0.75rem 0 clamp(2.5rem, 5vw, 4rem)',
            scrollMarginTop: 72,
          }}
        >
          <h2
            style={{
              margin: '0 0 clamp(1.5rem, 3vw, 2.25rem)',
              fontSize: 'clamp(1.65rem, 3.5vw, 2.35rem)',
              fontWeight: 800,
              color: 'hsl(var(--secondary))',
            }}
          >
            {(t.outboundCountryFactsTitle || '{country} Facts & Tips').replace(
              '{country}',
              countryName
            )}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
              gap: 'clamp(1.35rem, 2.5vw, 2rem) clamp(1.75rem, 3vw, 2.5rem)',
            }}
          >
            {tips.map((tip, idx) => {
              const Icon = tipIcon(tip.label);
              return (
                <div
                  key={`${tip.label}-${idx}`}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', minWidth: 0 }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: 'hsl(var(--primary) / 0.08)',
                      color: PRIMARY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'clamp(0.78rem, 1.2vw, 0.88rem)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'hsl(var(--foreground) / 0.45)',
                        marginBottom: 4,
                      }}
                    >
                      {tip.label}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'hsl(var(--secondary))',
                        lineHeight: 1.4,
                        fontSize: 'clamp(1.05rem, 1.6vw, 1.2rem)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {tip.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <TourModal
        isOpen={tourOpen}
        onClose={() => {
          setTourOpen(false);
          setSelectedTour(null);
        }}
        tour={selectedTour}
      />
    </main>
  );
}
