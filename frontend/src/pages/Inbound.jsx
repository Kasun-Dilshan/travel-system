import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PackageCard from '../components/PackageCard';
import DestinationModal from '../components/DestinationModal';
import { DESTINATIONS } from '../data/destinations';
import ContactSection from '../components/ContactSection';
import API_URL from '../config';
import { useSite } from '../context/SiteContext';
import SubHero from '../components/SubHero';
import SubAboutUs from '../components/SubAboutUs';
import SectionHeader from '../components/SectionHeader';
import DestinationsGrid from '../components/DestinationsGrid';
import ServicesGrid from '../components/ServicesGrid';
import InternalNav from '../components/InternalNav';
import sigiriyaImg from '../assets/sigiriya.webp';
import SEO from '../components/SEO';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function Inbound() {
  const navigate = useNavigate();
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destOpen, setDestOpen] = useState(false);
  const [dynamicPackages, setDynamicPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, t } = useSite();

  const openTour = (tour) => {
    const id = tour?._id ?? tour?.id;
    if (!id) return;
    navigate(`/tours/${id}`);
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
  }, [language]);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/packages?lang=${encodeURIComponent(language)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const inbound = data.filter((p) => p.category === 'Inbound');
      setDynamicPackages(inbound);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const roundTours = dynamicPackages.filter((p) => p.type === 'Round');
  const dayTours = dynamicPackages.filter((p) => !p.type || p.type === 'Day');

  const destinations = DESTINATIONS;

  const serviceLabels = {
    transport: t.serviceTransport,
    hotels: t.serviceHotels,
    activities: t.serviceActivities,
    events: t.serviceEvents,
  };

  const navLinks = [
    { label: t.navAbout, id: 'about-section' },
    { label: t.navTours, id: 'tours-section' },
    { label: t.navDestinations, id: 'destinations-section' },
    { label: t.navServices, id: 'services-section' },
    { label: t.navTerms, path: '/terms' },
    { label: t.navContact, id: 'contact-section' },
  ];

  return (
    <main
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{ minHeight: '100vh', padding: '0 0 100px 0', textAlign: language === 'ar' ? 'right' : 'left' }}
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
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="loader" />
            </div>
          ) : (
            <>
              {roundTours.length > 0 && (
                <section style={{ padding: '40px 0' }}>
                  <SectionHeader
                    title={t.roundToursTitle}
                    label={t.sectionLabelExcursions || 'EXCURSIONS'}
                  />
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid-layout"
                  >
                    {roundTours.map((p) => (
                      <motion.div variants={fadeInUp} key={p._id || p.id}>
                        <PackageCard pkg={p} image={p.image} onViewDetails={openTour} />
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}

              {dayTours.length > 0 && (
                <section style={{ padding: '40px 0' }}>
                  <SectionHeader
                    title={t.dayToursTitle}
                    label={t.sectionLabelDayTrips || 'DAY TRIPS'}
                  />
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid-layout"
                  >
                    {dayTours.map((p) => (
                      <motion.div variants={fadeInUp} key={p._id || p.id}>
                        <PackageCard pkg={p} image={p.image} onViewDetails={openTour} />
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}
            </>
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

        <div id="contact-section">
          <ContactSection type="inbound" />
        </div>
      </div>

      <DestinationModal
        isOpen={destOpen}
        onClose={closeDestination}
        destination={selectedDestination}
        headerBadge={t.inboundLabel}
      />
    </main>
  );
}
