import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Clock, MapPin, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import MapComponent from './MapComponent';
import { TRANSLATIONS } from '../data/translations';
import { mediaUrl } from '../config';

export default function TourModal({ isOpen, onClose, tour, lang = 'en' }) {
  const navigate = useNavigate();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 968;

  if (!isOpen || !tour) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  // Localized Content
  const localized = tour.localizations?.[lang] || {};
  const displayTitle = localized.title || tour.title;
  const displayDescription = localized.description || tour.description;
  const displayItinerary = localized.itinerary || tour.itinerary;
  const displayInclusions = localized.inclusions || tour.inclusions;

  const stops = tour.route?.stops ?? [];
  const rawPath = tour.route?.path ?? stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  const hasRoute = Array.isArray(stops) && stops.length > 0 && Array.isArray(rawPath) && rawPath.length > 0;

  const images = (tour.images || [tour.image]).map((u) => mediaUrl(u));
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
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
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '0' : '1.5rem',
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
            backdropFilter: 'blur(8px)'
          }}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
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
            textAlign: lang === 'ar' ? 'right' : 'left'
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
              {tour.isLimitedTime && (
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
                      <span style={{ fontWeight: '600' }}>{tour.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={18} className="text-primary" />
                      <span style={{ fontWeight: '600' }}>Sri Lanka</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Mini Booking Card */}
                {!isMobile && (
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '1.5rem',
                    border: '1px solid hsl(var(--glass-border))',
                    boxShadow: 'var(--shadow-sm)',
                    minWidth: '220px'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'hsl(var(--foreground) / 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t.uiPriceFrom || 'Starting From'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '900', color: 'hsl(var(--secondary))' }}>${tour.price}</span>
                      <span style={{ color: 'hsl(var(--foreground) / 0.5)', fontWeight: '700', fontSize: '0.85rem' }}>/person</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/booking', { state: { tour } });
                      }}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', fontSize: '0.95rem' }}
                    >
                      {t.uiConfirmBooking || 'Confirm Booking'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Body Grid */}
            <div style={{ padding: '0 3rem 3rem 3rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '3rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                {/* Description */}
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {t.uiDescription || 'Description'}
                  </h3>
                  <p style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'hsl(var(--foreground) / 0.85)', fontWeight: '450' }}>
                    {displayDescription}
                  </p>
                </div>

                {/* Itinerary */}
                <div style={{ position: 'relative' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {t.uiItinerary || 'Itinerary'}
                  </h3>

                  <div style={{ 
                    display: displayItinerary[0]?.day ? 'grid' : 'block',
                    gridTemplateColumns: displayItinerary[0]?.day ? 'minmax(100px, 140px) 1fr' : 'none',
                    gap: '2rem',
                    alignItems: 'start'
                  }}>
                    {/* Day Selector - Vertical Column */}
                    {displayItinerary[0]?.day && (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '0.6rem', 
                        paddingRight: '1rem',
                        borderRight: '1px solid hsl(var(--primary) / 0.1)',
                        position: 'sticky',
                        top: '1rem'
                      }}>
                        {displayItinerary.map((dayObj, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedDayIndex(idx)}
                            style={{
                              padding: '0.8rem 1rem',
                              borderRadius: '0.75rem',
                              border: '1px solid',
                              borderColor: selectedDayIndex === idx ? 'hsl(var(--primary))' : 'transparent',
                              backgroundColor: selectedDayIndex === idx ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                              color: selectedDayIndex === idx ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.5)',
                              fontWeight: '700',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <span style={{ 
                              width: '20px', 
                              height: '20px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              borderRadius: '4px',
                              backgroundColor: selectedDayIndex === idx ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.1)',
                              color: selectedDayIndex === idx ? 'white' : 'hsl(var(--primary))',
                              fontSize: '0.7rem',
                              flexShrink: 0
                            }}>
                              {idx + 1}
                            </span>
                            {dayObj.day}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Activities List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedDayIndex}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          {(displayItinerary[0]?.day ? displayItinerary[selectedDayIndex].activities : displayItinerary).map((item, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              gap: '1.25rem', 
                              padding: '1.25rem',
                              borderRadius: '1.25rem',
                              backgroundColor: 'hsl(var(--primary) / 0.03)',
                              border: '1px solid hsl(var(--primary) / 0.05)',
                              marginBottom: '0.75rem'
                            }}>
                              <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '10px', 
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                flexShrink: 0,
                                fontWeight: '900',
                                color: 'hsl(var(--primary))',
                                fontSize: '0.75rem'
                              }}>
                                {idx + 1}
                              </div>
                              <div>
                                {typeof item === 'object' ? (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                      <span style={{ fontWeight: '700', color: 'hsl(var(--primary))', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.location}</span>
                                    </div>
                                    <p style={{ color: 'hsl(var(--foreground) / 0.8)', lineHeight: 1.5, fontWeight: '450', fontSize: '1rem' }}>{item.text}</p>
                                  </>
                                ) : (
                                  <p style={{ color: 'hsl(var(--foreground) / 0.8)', lineHeight: 1.5, fontWeight: '450', fontSize: '1rem' }}>{item}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

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

                {/* Route Map */}
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {t.uiRouteMap || 'Route Map'}
                  </h3>
                  <div style={{
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    backgroundColor: 'hsl(var(--primary) / 0.03)',
                    border: '1px solid hsl(var(--primary) / 0.1)',
                    height: '300px'
                  }}>
                    {hasRoute ? (
                      <MapComponent stops={stops} path={rawPath} />
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <p style={{ color: 'hsl(var(--foreground) / 0.5)', fontSize: '0.9rem' }}>
                          Route coordinates coming soon.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Sidebar Right (Desktop only) */}
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '0' }}>
                   {/* This area can be used for extra info or widgets */}
                   <div style={{
                     padding: '2rem',
                     borderRadius: '1.5rem',
                     backgroundColor: 'hsl(var(--primary) / 0.03)',
                     border: '1px solid hsl(var(--primary) / 0.08)',
                   }}>
                     <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1rem', color: 'hsl(var(--secondary))' }}>Tour Highlights</h4>
                     <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground) / 0.7)', display: 'flex', gap: '0.5rem' }}>
                          <ShieldCheck size={16} className="text-primary" /> Verified Tour
                        </li>
                        <li style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground) / 0.7)', display: 'flex', gap: '0.5rem' }}>
                          <ShieldCheck size={16} className="text-primary" /> Luxury Transport
                        </li>
                        <li style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground) / 0.7)', display: 'flex', gap: '0.5rem' }}>
                          <ShieldCheck size={16} className="text-primary" /> Handpicked Hotels
                        </li>
                     </ul>
                   </div>
                </div>
              )}
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
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--foreground) / 0.5)', textTransform: 'uppercase' }}>From</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'hsl(var(--secondary))' }}>${tour.price}</div>
                </div>
                <button
                   onClick={() => {
                    onClose();
                    navigate('/booking', { state: { tour } });
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem' }}
                >
                  Book Now
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
}
