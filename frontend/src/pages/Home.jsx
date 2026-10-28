import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import HeroCarousel from '../components/HeroCarousel';
import HomeTourSearch from '../components/HomeTourSearch';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import LimitedTimeTours from '../components/LimitedTimeTours';
import ReviewCarousel from '../components/ReviewCarousel';
import { useSite } from '../context/SiteContext';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useSite();

  const openTour = (tour) => {
    const id = tour?._id ?? tour?.id;
    if (!id) return;
    navigate(`/tours/${id}`);
  };

  return (
    <main style={{ width: '100%', overflowX: 'hidden' }}>
      <SEO 
        title="Home | Serendib Travel & Tours"
        description="Experience the magic of Sri Lanka with Serendib Travel & Tours. Curated luxury adventures and cultural journeys."
      />

      <section>
        <HeroCarousel />
        <HomeTourSearch onOpenTour={openTour} />
      </section>

      <LimitedTimeTours onOpenTour={openTour} />
      
      <section style={{
        padding: 'clamp(3rem, 8vw, 80px) 0 40px',
        width: '100%'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
            maxWidth: '1440px',
            marginInline: 'auto',
            paddingInline: 'max(1.25rem, 5%)',
            paddingLeft: 'max(1.25rem, 5%, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(1.25rem, 5%, env(safe-area-inset-right, 0px))'
          }}
        >
          <h2 className="serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'hsl(var(--secondary))', marginBottom: '1.5rem' }}>
            {t.homeCollectionsTitle || 'Our Signature Collections'}
          </h2>
          <div style={{ width: '80px', height: '4px', background: 'hsl(var(--primary))', margin: '0 auto 1.5rem', borderRadius: '2px' }} />
          <p style={{ fontSize: '1.2rem', color: 'hsl(var(--foreground))', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
            {t.homeCollectionsSubtitle || 'Choose your path: Serene Island Escapes or Global Wonders.'}
          </p>
        </motion.div>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <Hero />
        </div>
      </section>

      <section style={{ padding: '40px 0', background: 'hsl(var(--primary) / 0.02)' }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 max(1.25rem, 5%)',
          paddingLeft: 'max(1.25rem, 5%, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1.25rem, 5%, env(safe-area-inset-right, 0px))'
        }}>
          <AboutUs />
        </div>
      </section>

      <ReviewCarousel />
    </main>
  );
}
