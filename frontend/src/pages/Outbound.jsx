import React from 'react';
import ContactSection from '../components/ContactSection';
import { useSite } from '../context/SiteContext';
import SubHero from '../components/SubHero';
import SubAboutUs from '../components/SubAboutUs';
import SectionHeader from '../components/SectionHeader';
import DestinationsMegaMenu from '../components/DestinationsMegaMenu';
import ServicesGrid from '../components/ServicesGrid';
import parisImg from '../assets/paris.webp';
import aboutOutboundImg from '../assets/about-outbound-services.webp';
import SEO from '../components/SEO';

export default function Outbound() {
  const { language, t } = useSite();

  const serviceLabels = {
    transport: t.serviceTransport,
    hotels: t.serviceHotels,
    activities: t.serviceActivities,
    events: t.serviceEvents,
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
          <SubAboutUs
            title={t.aboutTitle}
            content={t.aboutGlobal}
            accentColor="hsl(var(--accent))"
            image={aboutOutboundImg}
            imageAlt="Bangkok Grand Palace at sunset"
          />
        </div>

        <div id="tours-section">
          <section style={{ padding: '60px 0 20px' }}>
            <SectionHeader
              title={t.findToursTitle || t.navFindTours || 'Find your next tour'}
              label={t.sectionLabelWorldTours || 'WORLD TOURS'}
              accentColor="hsl(var(--accent))"
            />

            <p
              style={{
                textAlign: 'center',
                fontSize: '0.95rem',
                color: 'hsl(var(--foreground) / 0.55)',
                fontWeight: 600,
                marginBottom: '1.75rem',
              }}
            >
              {t.outboundMegaMenuSubtitle ||
                'Choose a region, then pick a country to explore tours.'}
            </p>

            <DestinationsMegaMenu embedded />
          </section>
        </div>

        <div id="services-section">
          <ServicesGrid
            title={t.servicesTitle}
            serviceLabels={serviceLabels}
            accentColor="hsl(var(--accent))"
          />
        </div>

        <div id="contact-section">
          <ContactSection type="outbound" />
        </div>
      </div>
    </main>
  );
}
