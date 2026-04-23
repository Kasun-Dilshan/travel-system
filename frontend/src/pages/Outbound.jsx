import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PackageCard from '../components/PackageCard';
import TourModal from '../components/TourModal';
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
import parisImg from '../assets/paris.png';
import dubaiImg from '../assets/dubai.png';
import tokyoImg from '../assets/tokyo.png';
import londonImg from '../assets/london.png';
import singaporeImg from '../assets/singapore.png';

import SEO from '../components/SEO';

export default function Outbound({ selectedLanguage = 'en', setSelectedLanguage }) {
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/packages`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDynamicPackages(data.filter(p => p.category === 'Outbound'));
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

  const destinations = [
    { name: "Paris", description: "The city of light and romance.", image: parisImg },
    { name: "Dubai", description: "Futuristic skylines and desert luxury.", image: dubaiImg },
    { name: "Tokyo", description: "Neon streets and ancient culture.", image: tokyoImg },
    { name: "London", description: "Historic landmarks and modern energy.", image: londonImg },
    { name: "Singapore", description: "A garden city with vibrant beats.", image: singaporeImg }
  ];

  const serviceLabels = {
    transport: t.serviceTransport,
    hotels: t.serviceHotels,
    activities: t.serviceActivities,
    events: t.serviceEvents
  };



  return (
    <main 
      dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
      style={{ minHeight: '100vh', padding: '0 0 100px 0', textAlign: selectedLanguage === 'ar' ? 'right' : 'left' }}
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
              <SectionHeader title={t.roundToursTitle} label="WORLD TOURS" accentColor="hsl(var(--accent))" />
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
              <SectionHeader title={t.dayToursTitle} label="CITY BREAKS" accentColor="hsl(var(--accent))" />
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
          <DestinationsGrid title={t.destinationsTitle} destinations={destinations} accentColor="hsl(var(--accent))" />
        </div>
        
        <div id="services-section">
          <ServicesGrid title={t.servicesTitle} serviceLabels={serviceLabels} accentColor="hsl(var(--accent))" />
        </div>
        
        <div id="guides-section">
          <BlogPreview title={t.guideTitle} accentColor="hsl(var(--accent))" />
        </div>

        <section id="reviews-section" style={{ padding: '80px 0' }}>
          <SectionHeader title="Global Feedback" center={true} accentColor="hsl(var(--accent))" />
          <ReviewCarousel />
        </section>
        
        <div id="contact-section">
          <ContactSection type="outbound" lang={selectedLanguage} />
        </div>
      </div>
      
      <TourModal isOpen={tourOpen} onClose={closeTour} tour={selectedTour} lang={selectedLanguage} />
    </main>
  );
}
