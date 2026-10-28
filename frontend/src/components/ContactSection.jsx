import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';

const CONTACT_DATA = {
  inbound: {
    titleKey: 'contactTitle',
    subtitleKey: 'contactSubtitle',
    address: 'No.87, Pannipitiya Road, Battramulla',
    phone: '+94 77 113 3100',
    email: 'inbound_manager@serendibdestinations.com',
    accent: 'hsl(var(--primary))'
  },
  outbound: {
    titleKey: 'contactTitle',
    subtitleKey: 'contactSubtitle',
    address: 'Serendib Group of Companies',
    phone: '+94 77 113 3100',
    email: 'ticketing@serendibgroups.com',
    accent: 'hsl(var(--accent))'
  }
};

export default function ContactSection({ type = 'inbound' }) {
  const source = CONTACT_DATA[type] || CONTACT_DATA.inbound;
  const { t } = useSite();

  return (
    <section style={{ marginTop: '6rem', marginBottom: '4rem' }}>
      <div
        style={{
          padding: 'clamp(1.75rem, 5vw, 4rem)',
          borderRadius: 'clamp(1.25rem, 4vw, 2.5rem)',
          background: 'linear-gradient(135deg, hsl(var(--secondary) / 0.03) 0%, hsl(var(--primary) / 0.05) 100%)',
          border: '1px solid hsl(var(--primary) / 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Decorative Element */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          backgroundColor: source.accent,
          opacity: 0.03,
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center' }}>
          {/* Text Content */}
          <div>
            <p className="section-label" style={{ color: source.accent }}>{t.contactLabel}</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '900', marginBottom: '1rem' }}>{t[source.titleKey]}</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.7, marginBottom: '2.5rem', maxWidth: '450px' }}>
              {t[source.subtitleKey]} {t.contactTeam}
            </p>

            <motion.div
              whileHover={{ x: 10 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: source.accent, fontWeight: '800', cursor: 'pointer' }}
            >
              {t.contactCTA} <ArrowRight size={20} />
            </motion.div>
          </div>

          {/* Details Card */}
          <div style={{
            backgroundColor: 'white',
            padding: '2.5rem',
            borderRadius: '2rem',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
            border: '1px solid hsl(var(--glass-border))',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <DetailItem icon={<MapPin size={20} color={source.accent} />} label={t.contactAddress} value={source.address} />
            <DetailItem icon={<Phone size={20} color={source.accent} />} label={t.contactHotline} value={source.phone} />
            <DetailItem icon={<Mail size={20} color={source.accent} />} label={t.contactEmail} value={source.email} />
            <DetailItem icon={<Clock size={20} color={source.accent} />} label={t.contactHours} value={t.officeHoursDays} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: '1.25rem' }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        backgroundColor: 'hsl(var(--primary) / 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.4, marginBottom: '0.25rem' }}>
          {label}
        </p>
        <p style={{ fontSize: '1rem', fontWeight: '600', color: 'hsl(var(--secondary))' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
