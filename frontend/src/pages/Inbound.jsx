import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PackageCard from '../components/PackageCard';
import TourModal from '../components/TourModal';
import DestinationModal from '../components/DestinationModal';
import { DESTINATIONS } from '../data/destinations';
import ContactSection from '../components/ContactSection';
import LanguagePicker from '../components/LanguagePicker';
import { TRANSLATIONS } from '../data/translations';
import API_URL from '../config';

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
import DestinationsGrid from '../components/DestinationsGrid';
import ServicesGrid from '../components/ServicesGrid';
import BlogPreview from '../components/BlogPreview';
import ReviewCarousel from '../components/ReviewCarousel';
import InternalNav from '../components/InternalNav';
import sigiriyaImg from '../assets/sigiriya.png';
import kandyImg from '../assets/kandy.png';
import mirissaImg from '../assets/mirissa.png';
import galleImg from '../assets/galle.png';
import trincomaleeImg from '../assets/trincomalee.png';

import SEO from '../components/SEO';

export default function Inbound({ selectedLanguage = 'en', setSelectedLanguage }) {
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destOpen, setDestOpen] = useState(false);
  const [dynamicPackages, setDynamicPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const openTour = (tour) => {
    setSelectedTour(tour);
    setTourOpen(true);
  };

  const closeTour = () => {
    setTourOpen(false);
    setSelectedTour(null);
  };

  const openDestination = (dest) => {
    setSelectedDestination(dest);
    setDestOpen(true);
  };

  const closeDestination = () => {
    setDestOpen(false);
    setSelectedDestination(null);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/packages`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDynamicPackages(data.filter(p => p.category === 'Inbound'));
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const allPackages = dynamicPackages;
  const roundTours = allPackages.filter(p => p.type === 'Round');
  const dayTours = allPackages.filter(p => !p.type || p.type === 'Day');

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const destinations = DESTINATIONS;

  const serviceLabels = {
    transport: t.serviceTransport,
    hotels: t.serviceHotels,
    activities: t.serviceActivities,
    events: t.serviceEvents
  };

  const navLinks = [
    { label: t.navAbout, id: 'about-section' },
    { label: t.navTours, id: 'tours-section' },
    { label: t.navDestinations, id: 'destinations-section' },
    { label: t.navServices, id: 'services-section' },
    { label: t.navGuides, id: 'guides-section' },
    { label: t.navReviews, id: 'reviews-section' },
    { label: t.navTerms, path: '/terms' },
    { label: t.navContact, id: 'contact-section' }
  ];


  return (
    <main 
      dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
      style={{ minHeight: '100vh', padding: '0 0 100px 0', textAlign: selectedLanguage === 'ar' ? 'right' : 'left' }}
    >
      <SEO 
        title={`${t.inboundTitle} | Serendib Inbound Tours`}
        description={t.inboundDesc}
      />

      <SubHero 
        title={t.inboundTitle}
        subtitle={t.inboundDesc}
        label={t.inboundLabel}
        image={sigiriyaImg}
        accentColor="hsl(var(--primary))"
      />

      <InternalNav links={navLinks} accentColor="hsl(var(--primary))" />

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 5%' }}>
        <div id="about-section">
          <SubAboutUs title={t.aboutTitle} content={t.aboutSriLanka} />
        </div>

        <div id="tours-section">
          {/* Round Tours Section */}
          {roundTours.length > 0 && (
            <section style={{ padding: '60px 0' }}>
              <SectionHeader title={t.roundToursTitle} label="EXCURSIONS" />
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid-layout">
                {roundTours.map(p => (
                  <motion.div variants={fadeInUp} key={p._id || p.id}>
                    <PackageCard pkg={p} image={p.image} onViewDetails={() => openTour(p)} lang={selectedLanguage} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* Day Tours Section */}
          {dayTours.length > 0 && (
            <section style={{ padding: '60px 0' }}>
              <SectionHeader title={t.dayToursTitle} label="DAY TRIPS" />
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid-layout">
                {dayTours.map(p => (
                  <motion.div variants={fadeInUp} key={p._id || p.id}>
                    <PackageCard pkg={p} image={p.image} onViewDetails={() => openTour(p)} lang={selectedLanguage} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}
        </div>

        <div id="destinations-section">
          <DestinationsGrid 
            title={t.destinationsTitle} 
            destinations={destinations} 
            onSelectDestination={openDestination}
          />
        </div>
        
        <div id="services-section">
          <ServicesGrid title={t.servicesTitle} serviceLabels={serviceLabels} />
        </div>
        
        <div id="guides-section">
          <BlogPreview title={t.guideTitle} />
        </div>

        <section id="reviews-section" style={{ padding: '80px 0' }}>
          <SectionHeader title="What Travelers' Say" center={true} />
          <ReviewCarousel />
        </section>
        

        <div id="contact-section">
          <ContactSection type="inbound" lang={selectedLanguage} />
        </div>
      </div>
      
      <TourModal isOpen={tourOpen} onClose={closeTour} tour={selectedTour} lang={selectedLanguage} />
      <DestinationModal isOpen={destOpen} onClose={closeDestination} destination={selectedDestination} />
    </main>
  );
}
