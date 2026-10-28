import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, FileCheck, Map, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import SubHero from '../components/SubHero';
import { useSite } from '../context/SiteContext';
import ticketsImg from '../assets/premium-services/transport-car-rentals.webp';
import visaImg from '../assets/about-our-services.webp';
import toursImg from '../assets/premium-services/activity-tour-planning.webp';

function openEmailPopup(message) {
  window.dispatchEvent(
    new CustomEvent('serendib:open-email', {
      detail: { message: message || '' },
    })
  );
}

const SERVICES = [
  {
    id: 'tickets',
    icon: Plane,
    image: ticketsImg,
    titleKey: 'serviceTickets',
    descKey: 'serviceTicketsDesc',
    titleFallback: 'Tickets',
    descFallback:
      'Book domestic and international flight tickets with competitive fares, flexible options, and dedicated support from departure to arrival.',
  },
  {
    id: 'visa',
    icon: FileCheck,
    image: visaImg,
    titleKey: 'serviceVisa',
    descKey: 'serviceVisaDesc',
    titleFallback: 'Visa',
    descFallback:
      'Get expert guidance for visa applications, document checks, and submission support so your travel paperwork stays on track.',
  },
  {
    id: 'tours-booking',
    icon: Map,
    image: toursImg,
    titleKey: 'serviceToursBooking',
    descKey: 'serviceToursBookingDesc',
    titleFallback: 'Tours Booking',
    descFallback:
      'Reserve inbound and outbound tour packages tailored to your dates, group size, and travel style — from day trips to multi-country journeys.',
  },
];

export default function Services() {
  const { t, language } = useSite();
  const location = useLocation();
  const isRtl = language === 'ar';

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (!hash) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ minHeight: '100vh', paddingBottom: '100px', textAlign: isRtl ? 'right' : 'left' }}
    >
      <SEO
        title={`${t.navServices || 'Services'} | Serendib Travel & Tours`}
        description={
          t.servicesPageSubtitle ||
          'Flight tickets, visa support, and tour bookings with Serendib Travel & Tours.'
        }
      />

      <SubHero
        title={t.servicesPageTitle || t.navServices || 'Our Services'}
        subtitle={
          t.servicesPageSubtitle ||
          'Tickets, visa assistance, and tours booking — everything you need for a smooth journey.'
        }
        label={t.servicesPageLabel || 'WHAT WE OFFER'}
        image={visaImg}
        accentColor="hsl(var(--primary))"
      />

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 5%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            const title = t[service.titleKey] || service.titleFallback;
            const desc = t[service.descKey] || service.descFallback;

            return (
              <motion.article
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                style={{
                  scrollMarginTop: '120px',
                  borderRadius: '2rem',
                  backgroundColor: 'white',
                  border: '1px solid hsl(var(--glass-border))',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: 180, background: '#0b1220' }}>
                  <img
                    src={service.image}
                    alt={title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.55) 100%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: isRtl ? 'auto' : '1.25rem',
                      right: isRtl ? '1.25rem' : 'auto',
                      bottom: '1.25rem',
                      width: 64,
                      height: 64,
                      borderRadius: '1.25rem',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      color: 'hsl(var(--primary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.20)',
                    }}
                  >
                    <Icon size={28} strokeWidth={2} />
                  </div>
                </div>

                <div style={{ padding: '1.75rem 1.75rem 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      marginBottom: '0.75rem',
                      color: 'hsl(var(--secondary))',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '1rem',
                      opacity: 0.85,
                      lineHeight: 1.65,
                      color: 'hsl(var(--foreground))',
                      marginBottom: '1.5rem',
                      flex: 1,
                    }}
                  >
                    {desc}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      openEmailPopup(
                        `Hi, I would like to inquire about your ${title} service.`
                      )
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      alignSelf: isRtl ? 'flex-end' : 'flex-start',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {t.serviceInquireCta || t.navBookingMain || 'Inquire now'}
                    <ArrowRight size={18} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
