import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

import beachImg from '../assets/carousel-beach.webp';
import mountainImg from '../assets/carousel-mountain.webp';
import cityImg from '../assets/carousel-city.webp';
import safariImg from '../assets/carousel-safari.webp';
import wildlifeLankaImg from '../assets/carousel-wildlife-lanka.webp';
import lagoonImg from '../assets/carousel-lagoon.webp';

const slides = [
  {
    id: 1,
    image: beachImg,
    title: "Escape to Paradise",
    subtitle: "Discover the hidden gems of Sri Lanka's pristine coastline.",
    cta: "Explore Inbound Tours",
    link: "/inbound"
  },
  {
    id: 2,
    image: mountainImg,
    title: "Summit New Heights",
    subtitle: "Experience breathtaking alpine landscapes and luxury retreats.",
    cta: "See Global Escapes",
    link: "/outbound"
  },
  {
    id: 3,
    image: cityImg,
    title: "Vibrant City Beats",
    subtitle: "Immerse yourself in the energy of the world's most dynamic capitals.",
    cta: "Start Your Journey",
    link: "/outbound"
  },
  {
    id: 4,
    image: safariImg,
    title: "Untamed Safari",
    subtitle: "Witness the majesty of nature's finest in the heart of the savannah.",
    cta: "Explore Wildlife",
    link: "/outbound"
  },
  {
    id: 5,
    image: wildlifeLankaImg,
    title: "Wild Sri Lanka",
    subtitle: "Encounter the rare Sri Lankan leopard and majestic elephant herds.",
    cta: "Start Your Safari",
    link: "/inbound"
  },
  {
    id: 6,
    image: lagoonImg,
    title: "Azure Tranquility",
    subtitle: "Surrender to the serenity of crystal waters and island bliss.",
    cta: "Book Your Escape",
    link: "/outbound"
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();
  const { t } = useSite();

  const localizedSlides = React.useMemo(() => {
    const slideT = t?.heroCarouselSlides;
    if (!Array.isArray(slideT)) return slides;
    return slides.map((s, idx) => {
      const over = slideT[idx];
      if (!over || typeof over !== 'object') return s;
      return { ...s, ...over };
    });
  }, [t]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % localizedSlides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + localizedSlides.length) % localizedSlides.length);
  };

  const variants = {
    enter: (direction) => ({
      scale: 1.1,
      opacity: 0,
      filter: 'blur(10px)'
    }),
    center: {
      zIndex: 1,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: {
      zIndex: 0,
      opacity: 0,
      scale: 1.05,
      transition: {
        duration: 1.2
      }
    }
  };

  return (
    <div style={{
      position: 'relative',
      height: 'min(95dvh, 920px)',
      minHeight: 'min(520px, 100dvh)',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      backgroundColor: '#000',
    }}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)',
            zIndex: 1
          }} />
          
          <img
            src={localizedSlides[current].image}
            alt={localizedSlides[current].title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          <div style={{
            position: 'absolute',
            bottom: 'clamp(18%, 22vh, 28%)',
            left: 'max(1rem, 6%)',
            right: 'max(1rem, 6%)',
            maxWidth: '1200px',
            margin: '0 auto',
            zIndex: 2,
            color: 'white'
          }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span style={{ 
                color: 'white', 
                opacity: 0.9,
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '4px',
                fontSize: '0.9rem',
                display: 'block',
                marginBottom: '1rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                borderLeft: '4px solid hsl(var(--primary))',
                paddingLeft: '1.5rem'
              }}>
                {t?.heroCarouselLabel || 'Luxury Travel Experiences'}
              </span>
              <h1 className="serif" style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: '1.5rem',
                color: 'white',
                textShadow: '0 10px 40px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.7)',
              }}>
                {localizedSlides[current].title}
              </h1>

              
              <p style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                opacity: 1,
                marginBottom: '3rem',
                lineHeight: 1.6,
                maxWidth: '700px',
                fontWeight: 500,
                textShadow: '0 2px 15px rgba(0,0,0,0.8)',
              }}>
                {localizedSlides[current].subtitle}
              </p>

              
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'white', color: 'black' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(localizedSlides[current].link)}
                style={{
                  background: 'transparent',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid white',
                  padding: '1.25rem 2.5rem',
                  borderRadius: '100px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {localizedSlides[current].cta} <ArrowRight size={22} />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div
        className="hero-carousel-controls"
        style={{
        position: 'absolute',
        bottom: 'max(6%, env(safe-area-inset-bottom, 0px))',
        left: 'max(1rem, 8%)',
        right: 'max(1rem, 8%)',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div className="hero-carousel-dots" style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {localizedSlides.map((_, idx) => (
            <motion.div
              key={idx}
              initial={false}
              animate={{ 
                width: current === idx ? '50px' : '10px',
                backgroundColor: current === idx ? 'white' : 'rgba(255,255,255,0.4)'
              }}
              onClick={() => {
                setCurrent(idx);
              }}
              style={{
                height: '4px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button type="button" aria-label="Previous slide" onClick={prevSlide} style={controlBtnStyle}>
            <ChevronLeft size={24} />
          </button>
          <button type="button" aria-label="Next slide" onClick={nextSlide} style={controlBtnStyle}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes reveal {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }
        @media (max-width: 640px) {
          .hero-carousel-controls {
            flex-direction: column-reverse;
            align-items: stretch !important;
            bottom: max(1rem, env(safe-area-inset-bottom, 0px)) !important;
          }
          .hero-carousel-controls > div:last-child {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

const controlBtnStyle = {
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
};
