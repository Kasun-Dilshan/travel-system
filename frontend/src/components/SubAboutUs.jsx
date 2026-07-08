import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Users } from 'lucide-react';
import aboutServicesImg from '../assets/about-our-services.webp';
import { useSite } from '../context/SiteContext';

const SubAboutUs = ({ title, content, accentColor = 'hsl(var(--primary))' }) => {
  const { t } = useSite();
  const features = [
    { icon: <ShieldCheck size={20} />, label: t?.subAboutVerified || "Verified Tours" },
    { icon: <Star size={20} />, label: t?.subAboutPremium || "Premium Quality" },
    { icon: <Users size={20} />, label: t?.subAboutGuides || "Local Guides" }
  ];

  return (
    <section style={{ padding: '80px 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '4rem',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="serif" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.5rem', color: 'hsl(var(--secondary))' }}>
            {title}
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.7, lineHeight: 1.8, marginBottom: '2rem' }}>
            {content}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: accentColor, fontWeight: 700, fontSize: '0.9rem' }}>
                {f.icon}
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{
            height: '400px',
            borderRadius: '2rem',
            backgroundColor: 'hsl(var(--primary) / 0.05)',
            border: '1px solid hsl(var(--glass-border))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <img
            src={aboutServicesImg}
            alt="About our services"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '2rem'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: '2rem',
            border: '1px dashed hsl(var(--primary) / 0.2)',
            borderRadius: '1.5rem'
          }} />
        </motion.div>
      </div>
    </section>
  );
};

export default SubAboutUs;
