import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PackageCard from '../components/PackageCard';
import TourModal from '../components/TourModal';
import ContactSection from '../components/ContactSection';
import API_URL from '../config';
import { useSite } from '../context/SiteContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

import SubHero from '../components/SubHero';
import SubAboutUs from '../components/SubAboutUs';
import SectionHeader from '../components/SectionHeader';
import OutboundDestinationsExplorer from '../components/OutboundDestinationsExplorer';
import ServicesGrid from '../components/ServicesGrid';
import parisImg from '../assets/paris.webp';

import SEO from '../components/SEO';

export default function Outbound() {
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [dynamicPackages, setDynamicPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, t } = useSite();

  const openTour = (tour) => {
    setSelectedTour(tour);
    setTourOpen(true);
  };

  const closeTour = () => {
    setTourOpen(false);
    setSelectedTour(null);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPackages();
  }, [language]);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/packages?lang=${encodeURIComponent(language)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const outbound = data.filter(p => p.category === 'Outbound');
      setDynamicPackages(outbound);

      // If a tour is already selected, re-bind it to the freshly fetched
      // (language-specific) object so the modal/details update correctly.
      setSelectedTour((prev) => {
        if (!prev) return prev;
        const prevId = prev._id ?? prev.id;
        if (!prevId) return prev;
        return outbound.find((p) => (p._id ?? p.id) === prevId) || prev;
      });
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const allPackages = dynamicPackages;
  const roundTours = allPackages.filter(p => p.type === 'Round');
  const dayTours = allPackages.filter(p => !p.type || p.type === 'Day');

  const serviceLabels = {
    transport: t.serviceTransport,
    hotels: t.serviceHotels,
    activities: t.serviceActivities,
    events: t.serviceEvents
  };



  return (
    <main 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{ minHeight: '100vh', padding: '0 0 100px 0', textAlign: language === 'ar' ? 'right' : 'left' }}
    >
      <SEO 
        title={`${t.outboundTitle} | Serendib Global Wonders`}
        description={t.outboundDesc}
      />

      <SubHero 
        title={t.outboundTitle}
        subtitle={t.outboundDesc}
        label={t.outboundLabel}
        image={parisImg}
        accentColor="hsl(var(--accent))"
      />



      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 5%' }}>
        <div id="about-section">
          <SubAboutUs title={t.aboutTitle} content={t.aboutGlobal} accentColor="hsl(var(--accent))" />
        </div>

        <div id="tours-section">
          {/* Round Tours Section */}
          {roundTours.length > 0 && (
            <section style={{ padding: '60px 0' }}>
              <SectionHeader title={t.roundToursTitle} label={t.sectionLabelWorldTours || 'WORLD TOURS'} accentColor="hsl(var(--accent))" />
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid-layout">
                {roundTours.map(p => (
                  <motion.div variants={fadeInUp} key={p._id || p.id}>
                    <PackageCard pkg={p} image={p.image} onViewDetails={openTour} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* Day Tours Section */}
          {dayTours.length > 0 && (
            <section style={{ padding: '60px 0' }}>
              <SectionHeader title={t.dayToursTitle} label={t.sectionLabelCityBreaks || 'CITY BREAKS'} accentColor="hsl(var(--accent))" />
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid-layout">
                {dayTours.map(p => (
                  <motion.div variants={fadeInUp} key={p._id || p.id}>
                    <PackageCard pkg={p} image={p.image} onViewDetails={openTour} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}
        </div>

        <OutboundDestinationsExplorer />
        
        <div id="services-section">
          <ServicesGrid title={t.servicesTitle} serviceLabels={serviceLabels} accentColor="hsl(var(--accent))" />
        </div>
        
        <div id="contact-section">
          <ContactSection type="outbound" />
        </div>
      </div>
      
      <TourModal isOpen={tourOpen} onClose={closeTour} tour={selectedTour} />
    </main>
  );
}
