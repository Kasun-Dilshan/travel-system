import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  Share2,
  FileDown,
  Mail,
} from 'lucide-react';
import MapComponent from '../components/MapComponent';
import ItineraryTimeline, { normalizeItineraryDays } from '../components/ItineraryTimeline';
import SEO from '../components/SEO';
import API_URL, { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';
import { getPackageLocalizationFallback } from '../utils/packageLocalizationFallback';
import { formatMoney } from '../utils/money';
import { isTruthyFlag } from '../utils/flags';
import { downloadTourPdf } from '../utils/tourPdf';

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.02H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.8 8.44-4.94 8.44-9.93z" />
    </svg>
  );
}

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t, currency, usdToLkrRate } = useSite();
  const activeLang = language;

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const shareMenuRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window === 'undefined' ? 1024 : window.innerWidth || 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!shareOpen) return undefined;
    const onPointerDown = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShareOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShareOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [shareOpen]);

  const isMobile = windowWidth < 968;

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setTour(null);
      setLoading(false);
      setError('missing');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentImageIndex(0);
    setExpandedDays({});

    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/packages?id=${encodeURIComponent(id)}&lang=${encodeURIComponent(activeLang)}`
        );
        if (!res.ok) throw new Error('Failed to fetch tour');
        const data = await res.json();
        if (cancelled) return;
        if (data && (data._id || data.id)) {
          setTour(data);
        } else {
          setTour(null);
          setError('not_found');
        }
      } catch {
        if (!cancelled) {
          setTour(null);
          setError('fetch');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, activeLang]);

  const localized = {
    ...getPackageLocalizationFallback(tour, activeLang),
    ...getLocalizationBucket(tour, activeLang),
  };
  const displayTitle = localized.title || tour?.title;
  const displayDescription = localized.description || tour?.description;
  const displayDuration = localized.duration || tour?.duration;
  const displayItinerary = localized.itinerary || tour?.itinerary;
  const displayInclusionsRaw = localized.inclusions ?? tour?.inclusions ?? [];
  const displayInclusions = (Array.isArray(displayInclusionsRaw) ? displayInclusionsRaw : [])
    .map((i) => String(i || '').trim())
    .filter(Boolean);

  const displayExclusionsRaw = localized.exclusions ?? tour?.exclusions ?? [];
  const displayExclusions = (Array.isArray(displayExclusionsRaw) ? displayExclusionsRaw : [])
    .map((i) => String(i || '').trim())
    .filter(Boolean);
  const displayHighlightsRaw = localized.highlights ?? tour?.highlights ?? [];
  const displayHighlights = (Array.isArray(displayHighlightsRaw) ? displayHighlightsRaw : [displayHighlightsRaw])
    .flatMap((h) => String(h || '').split(/[\n,]+/))
    .map((h) => h.trim())
    .filter(Boolean);

  const itineraryArray = useMemo(() => {
    if (Array.isArray(displayItinerary)) return displayItinerary;
    if (displayItinerary == null) return [];
    if (typeof displayItinerary === 'string') {
      const s = displayItinerary.trim();
      if (!s) return [];
      if (s.startsWith('[') || s.startsWith('{')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.itinerary)) {
            return parsed.itinerary;
          }
        } catch {
          // ignore
        }
      }
      return [s];
    }
    if (typeof displayItinerary === 'object') {
      const maybe = displayItinerary;
      if (Array.isArray(maybe.itinerary)) return maybe.itinerary;
    }
    return [];
  }, [displayItinerary]);

  const itineraryDays = useMemo(
    () => normalizeItineraryDays(itineraryArray),
    [itineraryArray]
  );

  const toggleDay = (idx) => {
    setExpandedDays((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const stops = tour?.route?.stops ?? [];
  const rawPath = tour?.route?.path ?? stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  const hasRoute = Array.isArray(stops) && stops.length > 0 && Array.isArray(rawPath) && rawPath.length > 0;

  const imagesRaw = tour
    ? tour.images ?? tour.gallery ?? (tour.image ? [tour.image] : [])
    : [];
  const imagesList = Array.isArray(imagesRaw)
    ? imagesRaw
    : typeof imagesRaw === 'string' && imagesRaw.trim()
      ? [imagesRaw]
      : [];
  const images = imagesList.map((u) => mediaUrl(u)).filter(Boolean);
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [hasMultipleImages, images.length]);

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  const bookTour = () => {
    navigate('/booking', { state: { tour } });
  };

  const tourPageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareToFacebook = () => {
    if (!tourPageUrl) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tourPageUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=640,height=720');
    setShareOpen(false);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(displayTitle || 'Tour package');
    const body = encodeURIComponent(
      [
        displayTitle || 'Tour package',
        displayDuration ? `Duration: ${displayDuration}` : '',
        '',
        displayDescription ? String(displayDescription).slice(0, 400) : '',
        '',
        `View tour: ${tourPageUrl}`,
      ]
        .filter(Boolean)
        .join('\n')
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShareOpen(false);
  };

  const handleDownloadPdf = () => {
    if (!tour || pdfBusy) return;
    setPdfBusy(true);
    try {
      const locationLabel =
        tour.category === 'Outbound'
          ? t.tourLocationWorld || 'International'
          : t.tourLocationSriLanka || 'Sri Lanka';
      const priceLabel = `${formatMoney(tour.price, currency, {
        usdToLkrRate,
        fromCurrency: tour.currency,
      })} / ${t.uiPerPerson || 'person'}`;

      downloadTourPdf({
        title: displayTitle,
        duration: displayDuration,
        location: locationLabel,
        priceLabel,
        description: displayDescription,
        highlights: displayHighlights,
        itineraryDays,
        inclusions: displayInclusions,
        exclusions: displayExclusions,
        pageUrl: tourPageUrl,
      });
    } finally {
      setPdfBusy(false);
    }
  };

  const actionIconBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    height: '40px',
    minWidth: '40px',
    padding: isMobile ? '0 0.65rem' : '0 0.9rem',
    borderRadius: '0.75rem',
    border: '1px solid hsl(var(--secondary) / 0.18)',
    background: 'white',
    color: 'hsl(var(--secondary))',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease, border-color 0.2s ease',
  };

  const nextImage = (e) => {
    e?.stopPropagation?.();
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation?.();
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
        }}
      >
        <div className="loader" />
      </main>
    );
  }

  if (error || !tour) {
    return (
      <main
        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <SEO title="Tour Not Found | Serendib Travel & Tours" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--secondary))', margin: 0 }}>
          {t.uiTourNotFound || 'Tour not found'}
        </h1>
        <p style={{ color: 'hsl(var(--foreground) / 0.65)', margin: 0, maxWidth: '28rem' }}>
          {t.uiTourNotFoundDesc || 'This tour may have been removed or the link is incorrect.'}
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem' }}>
          {t.uiBackHome || 'Back to Home'}
        </Link>
      </main>
    );
  }

  const seoTitle = tour.seoTitle || `${displayTitle} | Serendib Travel & Tours`;
  const seoDescription =
    tour.seoDescription ||
    (displayDescription ? String(displayDescription).slice(0, 160) : undefined);

  return (
    <main
      dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        background: 'hsl(var(--background))',
        paddingBottom: isMobile ? '7rem' : '4rem',
        textAlign: activeLang === 'ar' ? 'right' : 'left',
      }}
    >
      <SEO title={seoTitle} description={seoDescription} image={images[0]} />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '1.25rem 1rem 0' : '1.75rem 5% 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={goBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--foreground) / 0.65)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '0.5rem 0',
            }}
          >
            <ArrowLeft size={18} />
            {t.uiBack || 'Back'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div ref={shareMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShareOpen((open) => !open)}
                aria-label={t.uiShare || 'Share'}
                aria-expanded={shareOpen}
                aria-haspopup="menu"
                title={t.uiShare || 'Share'}
                style={actionIconBtnStyle}
              >
                <Share2 size={18} />
                {!isMobile && <span>{t.uiShare || 'Share'}</span>}
              </button>

              {shareOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.45rem)',
                    right: activeLang === 'ar' ? 'auto' : 0,
                    left: activeLang === 'ar' ? 0 : 'auto',
                    minWidth: '180px',
                    background: 'white',
                    border: '1px solid hsl(var(--glass-border))',
                    borderRadius: '0.85rem',
                    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                    padding: '0.4rem',
                    zIndex: 40,
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={shareToFacebook}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.7rem 0.8rem',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '0.65rem',
                      cursor: 'pointer',
                      color: 'hsl(var(--secondary))',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--primary) / 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <FacebookIcon size={18} />
                    {t.uiShareFacebook || 'Facebook'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={shareByEmail}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.7rem 0.8rem',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '0.65rem',
                      cursor: 'pointer',
                      color: 'hsl(var(--secondary))',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--primary) / 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Mail size={18} />
                    {t.uiShareEmail || 'Email'}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfBusy}
              aria-label={t.uiDownloadPdf || 'Download PDF'}
              title={t.uiDownloadPdf || 'Download PDF'}
              style={{
                ...actionIconBtnStyle,
                opacity: pdfBusy ? 0.65 : 1,
                cursor: pdfBusy ? 'wait' : 'pointer',
              }}
            >
              <FileDown size={18} />
              {!isMobile && <span>{pdfBusy ? (t.uiDownloading || 'Preparing…') : (t.uiDownloadPdf || 'PDF')}</span>}
            </button>
          </div>
        </div>

        {/* Full-width photo gallery */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? '260px' : '420px',
            overflow: 'hidden',
            backgroundColor: '#0a0a0a',
            borderRadius: isMobile ? '0.85rem' : '1rem',
            marginBottom: isMobile ? '1.5rem' : '2rem',
          }}
        >
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${displayTitle} - ${currentImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </AnimatePresence>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              No image
            </div>
          )}

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <ChevronRight size={22} />
              </button>

              <div
                style={{
                  position: 'absolute',
                  bottom: '1.15rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.45rem',
                  zIndex: 10,
                }}
              >
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to image ${idx + 1}`}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: currentImageIndex === idx ? '22px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      padding: 0,
                      backgroundColor:
                        currentImageIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title + meta */}
        <div style={{ marginBottom: isMobile ? '1.75rem' : '2.25rem' }}>
          {isTruthyFlag(tour.isLimitedTime) && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'hsl(var(--primary))',
                color: 'white',
                padding: '0.4rem 1rem',
                borderRadius: '99px',
                fontSize: '0.75rem',
                fontWeight: 900,
                marginBottom: '1rem',
              }}
            >
              <Zap size={14} fill="currentColor" />
              {t.flashSaleLabel} - {tour.discountPercentage}% {t.flashSaleSave}
            </div>
          )}

          <h1
            style={{
              fontSize: isMobile ? '1.85rem' : '2.5rem',
              fontWeight: 900,
              color: 'hsl(var(--secondary))',
              margin: '0 0 0.85rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            {displayTitle}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              color: 'hsl(var(--foreground) / 0.6)',
            }}
          >
            {displayDuration && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} className="text-primary" />
                <span style={{ fontWeight: 600 }}>{displayDuration}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} className="text-primary" />
              <span style={{ fontWeight: 600 }}>
                {tour.category === 'Outbound'
                  ? t.tourLocationWorld || 'International'
                  : t.tourLocationSriLanka || 'Sri Lanka'}
              </span>
            </div>
          </div>
        </div>

        {/* Details + booking sidebar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 300px',
            gap: isMobile ? '2rem' : '2.75rem',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0 }}>
            {Boolean(displayDescription) && (
              <section>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    color: 'hsl(var(--secondary))',
                  }}
                >
                  {t.uiDescription || 'Description'}
                </h2>
                <p
                  style={{
                    color: 'hsl(var(--foreground) / 0.75)',
                    fontWeight: 600,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    margin: 0,
                  }}
                >
                  {displayDescription}
                </p>
              </section>
            )}

            {itineraryDays.length > 0 && (
              <section>
                <ItineraryTimeline
                  title={t.uiItinerary || 'Itinerary'}
                  days={itineraryDays}
                  expandedDays={expandedDays}
                  onToggle={toggleDay}
                />
              </section>
            )}

            {displayInclusions.length > 0 && (
              <section>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    color: 'hsl(var(--secondary))',
                  }}
                >
                  {t.uiInclusions || "What's Included"}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '0.85rem',
                  }}
                >
                  {displayInclusions.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'hsl(var(--foreground) / 0.7)',
                      }}
                    >
                      <div style={{ color: 'hsl(var(--primary))' }}>
                        <CheckCircle2 size={16} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: 'hsl(var(--foreground) / 0.8)',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {displayExclusions.length > 0 && (
              <section>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    color: 'hsl(var(--secondary))',
                  }}
                >
                  {t.uiExclusions || "What's Not Included"}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '0.85rem',
                  }}
                >
                  {displayExclusions.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'hsl(var(--foreground) / 0.7)',
                      }}
                    >
                      <div style={{ color: '#ef4444' }}>
                        <XCircle size={16} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: 'hsl(var(--foreground) / 0.8)',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isMobile && displayHighlights.length > 0 && (
              <section
                style={{
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  backgroundColor: 'hsl(var(--primary) / 0.03)',
                  border: '1px solid hsl(var(--primary) / 0.08)',
                }}
              >
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    color: 'hsl(var(--secondary))',
                  }}
                >
                  {t.uiTourHighlights || 'Tour Highlights'}
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {displayHighlights.map((item, idx) => (
                    <li
                      key={`${item}-${idx}`}
                      style={{
                        fontSize: '0.9rem',
                        color: 'hsl(var(--foreground) / 0.7)',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      <ShieldCheck
                        size={16}
                        className="text-primary"
                        style={{ marginTop: '2px', flexShrink: 0 }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  marginBottom: '1rem',
                  color: 'hsl(var(--secondary))',
                }}
              >
                {t.uiRouteMap || 'Route Map'}
              </h2>
              <div
                style={{
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  backgroundColor: 'hsl(var(--primary) / 0.03)',
                  border: '1px solid hsl(var(--primary) / 0.1)',
                  height: isMobile ? '260px' : '380px',
                  width: '100%',
                }}
              >
                {hasRoute ? (
                  <MapComponent
                    stops={stops}
                    path={rawPath}
                    height="100%"
                    dayMode={stops.some((s) => s?.day)}
                  />
                ) : (
                  <div
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <p style={{ color: 'hsl(var(--foreground) / 0.5)', fontSize: '0.9rem' }}>
                      {t.uiRouteComingSoon || 'Route coordinates coming soon.'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {!isMobile && (
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'sticky',
                top: '6.5rem',
                alignSelf: 'start',
              }}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid hsl(var(--glass-border))',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'hsl(var(--foreground) / 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t.uiPriceFrom || 'Starting From'}
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.25rem',
                    margin: '0.5rem 0 1rem',
                  }}
                >
                  <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'hsl(var(--secondary))' }}>
                    {formatMoney(tour.price, currency, {
                      usdToLkrRate,
                      fromCurrency: tour.currency,
                    })}
                  </span>
                  <span
                    style={{
                      color: 'hsl(var(--foreground) / 0.5)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    /{t.uiPerPerson || 'person'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={bookTour}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.9rem', borderRadius: '1rem', fontSize: '0.95rem' }}
                >
                  {t.uiConfirmBooking || 'Confirm Booking'}
                </button>
              </div>

              {displayHighlights.length > 0 && (
                <div
                  style={{
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    backgroundColor: 'hsl(var(--primary) / 0.03)',
                    border: '1px solid hsl(var(--primary) / 0.08)',
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      marginBottom: '1rem',
                      color: 'hsl(var(--secondary))',
                    }}
                  >
                    {t.uiTourHighlights || 'Tour Highlights'}
                  </h3>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {displayHighlights.map((item, idx) => (
                      <li
                        key={`${item}-${idx}`}
                        style={{
                          fontSize: '0.9rem',
                          color: 'hsl(var(--foreground) / 0.7)',
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'flex-start',
                        }}
                      >
                        <ShieldCheck
                          size={16}
                          className="text-primary"
                          style={{ marginTop: '2px', flexShrink: 0 }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem 1.25rem',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            backgroundColor: 'white',
            borderTop: '1px solid hsl(var(--glass-border))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 50,
            boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'hsl(var(--foreground) / 0.5)',
                textTransform: 'uppercase',
              }}
            >
              {t.uiFrom || 'STARTING FROM'}
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'hsl(var(--secondary))' }}>
              {formatMoney(tour.price, currency, {
                usdToLkrRate,
                fromCurrency: tour.currency,
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={bookTour}
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.5rem', flexShrink: 0 }}
          >
            {t.uiBookNow || 'Book Now'}
          </button>
        </div>
      )}
    </main>
  );
}
