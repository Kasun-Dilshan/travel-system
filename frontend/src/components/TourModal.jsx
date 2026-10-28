import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Clock, MapPin, CheckCircle2, XCircle, ShieldCheck, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import MapComponent from './MapComponent';
import ItineraryTimeline, { normalizeItineraryDays } from './ItineraryTimeline';
import API_URL, { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';
import { getPackageLocalizationFallback } from '../utils/packageLocalizationFallback';
import { formatMoney } from '../utils/money';
import { isTruthyFlag } from '../utils/flags';

export default function TourModal({ isOpen, onClose, tour, lang }) {
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [resolvedTour, setResolvedTour] = useState(null);
  const { language, t, currency, usdToLkrRate } = useSite();
  const activeLang = lang || language;
  const [windowWidth, setWindowWidth] = React.useState(() => {
    if (typeof window === 'undefined') return 1024;
    return window.innerWidth || 1024;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 968;
  // Keep all hooks below unconditional: early return used to skip hooks and break opening the modal.
  const activeTour = isOpen && tour ? (resolvedTour || tour) : null;

  // When language changes, refetch a fresh localized version of this tour from API.
  React.useEffect(() => {
    let cancelled = false;
    const id = tour?._id ?? tour?.id;
    if (!isOpen || !id) {
      setResolvedTour(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/packages?id=${encodeURIComponent(id)}&lang=${encodeURIComponent(activeLang)}`);
        if (!res.ok) throw new Error('Failed to fetch tour');
        const data = await res.json();
        if (!cancelled && data && (data._id || data.id)) {
          setResolvedTour(data);
        }
      } catch {
        if (!cancelled) setResolvedTour(null);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, tour?._id, tour?.id, activeLang]);
  
  // Localized Content
  const localized = {
    ...getPackageLocalizationFallback(activeTour, activeLang),
    ...getLocalizationBucket(activeTour, activeLang),
  };
  const displayTitle = localized.title || activeTour?.title;
  const displayDescription = localized.description || activeTour?.description;
  const displayDuration = localized.duration || activeTour?.duration;
  const displayItinerary = localized.itinerary || activeTour?.itinerary;
  const displayInclusionsRaw = localized.inclusions ?? activeTour?.inclusions ?? [];
  const displayInclusions = (Array.isArray(displayInclusionsRaw) ? displayInclusionsRaw : [])
    .map((i) => String(i || '').trim())
    .filter(Boolean);

  const displayExclusionsRaw = localized.exclusions ?? activeTour?.exclusions ?? [];
  const displayExclusions = (Array.isArray(displayExclusionsRaw) ? displayExclusionsRaw : [])
    .map((i) => String(i || '').trim())
    .filter(Boolean);
  const displayHighlightsRaw = localized.highlights ?? activeTour?.highlights ?? [];
  const displayHighlights = (Array.isArray(displayHighlightsRaw) ? displayHighlightsRaw : [displayHighlightsRaw])
    .flatMap((h) => String(h || '').split(/[\n,]+/))
    .map((h) => h.trim())
    .filter(Boolean);

  const itineraryArray = React.useMemo(() => {
    if (Array.isArray(displayItinerary)) return displayItinerary;
    if (displayItinerary == null) return [];
    if (typeof displayItinerary === 'string') {
      const s = displayItinerary.trim();
      if (!s) return [];
      if (s.startsWith('[') || s.startsWith('{')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.itinerary)) return parsed.itinerary;
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

  const itineraryDays = React.useMemo(
    () => normalizeItineraryDays(itineraryArray),
    [itineraryArray]
  );

  const toggleDay = (idx) => {
    setExpandedDays((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const stops = activeTour?.route?.stops ?? [];
  const rawPath = activeTour?.route?.path ?? stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  const hasRoute = Array.isArray(stops) && stops.length > 0 && Array.isArray(rawPath) && rawPath.length > 0;

  const imagesRaw = activeTour
    ? (activeTour.images ?? activeTour.gallery ?? (activeTour.image ? [activeTour.image] : []))
    : [];
  const imagesList = Array.isArray(imagesRaw)
    ? imagesRaw
    : (typeof imagesRaw === 'string' && imagesRaw.trim() ? [imagesRaw] : []);
  const images = imagesList.map((u) => mediaUrl(u)).filter(Boolean);
  const hasMultipleImages = images.length > 1;

  // Reset carousel state when opening or switching tours
  React.useEffect(() => {
    if (!isOpen || !tour) return;
    setCurrentImageIndex(0);
    setExpandedDays({});
    setResolvedTour(null);
  }, [isOpen, tour?._id, tour?.id]);

  // Close on ESC + lock body scroll while open
  React.useEffect(() => {
    if (!isOpen || !tour) return;
    if (typeof document === 'undefined') return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window?.addEventListener?.('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window?.removeEventListener?.('keydown', onKeyDown);
    };
  }, [isOpen, onClose, tour]);

  // Auto slideshow
  React.useEffect(() => {
    if (!isOpen || !hasMultipleImages) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isOpen, hasMultipleImages, images.length]);

  if (!isOpen || !tour) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '0' : '1.5rem',
          pointerEvents: 'auto',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 46, 32, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 0,
          }}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: isMobile ? '100%' : '1100px',
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '90vh',
            backgroundColor: 'white',
            borderRadius: isMobile ? '0' : '2rem',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: activeLang === 'ar' ? 'right' : 'left',
            zIndex: 1,
          }}
        >
          {/* Left Side Section: Image Gallery */}
          <div style={{ 
            position: 'relative', 
            width: isMobile ? '100%' : '42%', 
            height: isMobile ? '350px' : 'auto',
            flexShrink: 0, 
            overflow: 'hidden', 
            backgroundColor: '#000',
            borderRight: isMobile ? 'none' : '1px solid hsl(var(--glass-border))'
          }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${displayTitle} - ${currentImageIndex + 1}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AnimatePresence>

            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none'
            }} />

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '1.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '44px',
                    height: '44px',
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
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '1.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '44px',
                    height: '44px',
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
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dots Indicators */}
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.5rem',
                  zIndex: 10
                }}>
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      style={{
                        width: currentImageIndex === idx ? '24px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: currentImageIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 15
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Right Side Section: Content Details */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'hsl(var(--background) / 0.1)'
          }}>
            {/* Header Content Info */}
            <div style={{ padding: '3rem 3rem 1rem 3rem' }}>
              {isTruthyFlag(tour.isLimitedTime) && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'hsl(var(--primary))', 
                  color: 'white',
                  padding: '0.4rem 1rem',
                  borderRadius: '99px',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  marginBottom: '1rem',
                  boxShadow: '0 10px 20px -5px hsla(var(--primary) / 0.3)'
                }}>
                  <Zap size={14} fill="currentColor" />
                  {t.flashSaleLabel} - {tour.discountPercentage}% {t.flashSaleSave}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'hsl(var(--secondary))', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                    {displayTitle}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'hsl(var(--foreground) / 0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={18} className="text-primary" />
                      <span style={{ fontWeight: '600' }}>{displayDuration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={18} className="text-primary" />
                      <span style={{ fontWeight: '600' }}>{t.tourLocationSriLanka || 'Sri Lanka'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Body Grid */}
            <div style={{ padding: '0 3rem 3rem 3rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '3rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                {/* Description */}
                {Boolean(displayDescription) && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: 'hsl(var(--secondary))' }}>
                      {t.uiDescription || 'Description'}
                    </h3>
                    <p style={{ color: 'hsl(var(--foreground) / 0.75)', fontWeight: '600', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {displayDescription}
                    </p>
                  </div>
                )}

                {/* Itinerary */}
                {itineraryDays.length > 0 && (
                  <ItineraryTimeline
                    title={t.uiItinerary || 'Itinerary'}
                    days={itineraryDays}
                    expandedDays={expandedDays}
                    onToggle={toggleDay}
                  />
                )}

                {/* Inclusions */}
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {t.uiInclusions || 'What\'s Included'}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {displayInclusions.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--foreground) / 0.7)' }}>
                        <div style={{ color: 'hsl(var(--primary))' }}>
                          <CheckCircle2 size={16} />
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'hsl(var(--foreground) / 0.8)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                {displayExclusions.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {t.uiExclusions || 'What\'s Not Included'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      {displayExclusions.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--foreground) / 0.7)' }}>
                          <div style={{ color: '#ef4444' }}>
                            <XCircle size={16} />
                          </div>
                          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'hsl(var(--foreground) / 0.8)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Sticky Sidebar Right (Desktop only) */}
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '0' }}>
                   {/* Desktop booking + details */}
                   <div style={{ 
                     backgroundColor: 'white', 
                     padding: '1.5rem', 
                     borderRadius: '1.5rem',
                     border: '1px solid hsl(var(--glass-border))',
                     boxShadow: 'var(--shadow-sm)',
                   }}>
                     <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'hsl(var(--foreground) / 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                       {t.uiPriceFrom || 'Starting From'}
                     </span>
                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.5rem 0 1rem 0' }}>
                       <span style={{ fontSize: '2rem', fontWeight: '900', color: 'hsl(var(--secondary))' }}>
                         {formatMoney(tour.price, currency, { usdToLkrRate, fromCurrency: tour.currency })}
                       </span>
                       <span style={{ color: 'hsl(var(--foreground) / 0.5)', fontWeight: '700', fontSize: '0.85rem' }}>
                         /{t.uiPerPerson || 'person'}
                       </span>
                     </div>
                     <button
                       onClick={() => {
                         onClose();
                         navigate('/booking', { state: { tour } });
                       }}
                       className="btn btn-primary"
                       style={{ width: '100%', padding: '0.9rem', borderRadius: '1rem', fontSize: '0.95rem' }}
                     >
                       {t.uiConfirmBooking || 'Confirm Booking'}
                     </button>
                   </div>

                   {/* This area can be used for extra info or widgets */}
                   {displayHighlights.length > 0 && (
                     <div style={{
                       padding: '2rem',
                       borderRadius: '1.5rem',
                       backgroundColor: 'hsl(var(--primary) / 0.03)',
                       border: '1px solid hsl(var(--primary) / 0.08)',
                     }}>
                       <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1rem', color: 'hsl(var(--secondary))' }}>
                         {t.uiTourHighlights || 'Tour Highlights'}
                       </h4>
                       <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0 }}>
                         {displayHighlights.map((item, idx) => (
                           <li
                             key={`${item}-${idx}`}
                             style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground) / 0.7)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}
                           >
                             <ShieldCheck size={16} className="text-primary" style={{ marginTop: '2px', flexShrink: 0 }} />
                             <span>{item}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                </div>
              )}

              {/* Route Map — full width under content + sidebar */}
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {t.uiRouteMap || 'Route Map'}
                </h3>
                <div style={{
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  backgroundColor: 'hsl(var(--primary) / 0.03)',
                  border: '1px solid hsl(var(--primary) / 0.1)',
                  height: isMobile ? '280px' : '420px',
                  width: '100%',
                }}>
                  {hasRoute ? (
                    <MapComponent
                      stops={stops}
                      path={rawPath}
                      height="100%"
                      dayMode={stops.some((s) => s?.day)}
                    />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <p style={{ color: 'hsl(var(--foreground) / 0.5)', fontSize: '0.9rem' }}>
                        {t.uiRouteComingSoon || 'Route coordinates coming soon.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile Bottom Bar for Booking */}
            {isMobile && (
              <div style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                padding: '1.5rem', 
                backgroundColor: 'white', 
                borderTop: '1px solid hsl(var(--glass-border))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--foreground) / 0.5)', textTransform: 'uppercase' }}>
                    {t.uiFrom || 'STARTING FROM'}
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'hsl(var(--secondary))' }}>
                    {formatMoney(tour.price, currency, { usdToLkrRate, fromCurrency: tour.currency })}
                  </div>
                </div>
                <button
                   onClick={() => {
                    onClose();
                    navigate('/booking', { state: { tour } });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem' }}
                >
                  {t.uiBookNow || 'Book Now'}
                </button>
              </div>
            )}
            
            {/* Extra padding for mobile bottom bar */}
            {isMobile && <div style={{ height: '100px', flexShrink: 0 }} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Render at <body> level to avoid stacking-context / z-index issues.
  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
