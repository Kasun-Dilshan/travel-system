import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Star, Users } from 'lucide-react';
import ellaImg from '../assets/ella.webp';
import { useSite } from '../context/SiteContext';

export default function AboutUs() {
  const { t } = useSite();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const features = [
    {
      icon: <ShieldCheck size={22} />,
      title: t?.aboutFeature1Title || "Trusted Expertise",
      description: t?.aboutFeature1Desc || "Over a decade of crafting unforgettable journeys across the globe."
    },
    {
      icon: <Star size={22} />,
      title: t?.aboutFeature2Title || "Premium Quality",
      description: t?.aboutFeature2Desc || "Handpicked accommodations and elite experiences for every traveler."
    },
    {
      icon: <Users size={22} />,
      title: t?.aboutFeature3Title || "Personalized Service",
      description: t?.aboutFeature3Desc || "Dedicated travel specialists who treat your trip as their own."
    }
  ];

  return (
    <section id="about" style={{ padding: '60px 0', overflow: 'hidden' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '5rem',
        alignItems: 'center'
      }}>
        
        {/* Left: Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.span variants={itemVariants} className="section-label" style={{ color: 'hsl(var(--primary))', display: 'block', marginBottom: '1rem' }}>
            {t?.aboutLabel || 'Our Story'}
          </motion.span>
          <motion.h2 className="serif" variants={itemVariants} style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'hsl(var(--secondary))', fontWeight: 800, marginBottom: '2rem', lineHeight: 1.1 }}>
            {(t?.aboutTitleLine1 || 'Crafting Memories')} <br /> {(t?.aboutTitleLine2 || 'Beyond Borders')}
          </motion.h2>
          <motion.p variants={itemVariants} style={{ 
            fontSize: '1.15rem', 
            color: 'hsl(var(--foreground))',
            opacity: 0.8,
            marginBottom: '3rem',
            lineHeight: 1.7,
            maxWidth: '550px'
          }}>
            {t?.aboutBody ||
              "At Serendib Travel & Tours, we believe travel is more than just visiting a destination; it's about the stories you bring home. We specialize in creating bespoke travel experiences that blend luxury, adventure, and cultural immersion."}
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  padding: '14px',
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  color: 'hsl(var(--primary))',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '800', 
                    marginBottom: '0.4rem',
                    color: 'hsl(var(--secondary))'
                  }}>
                    {feature.title}
                  </h4>
                  <p style={{ color: 'hsl(var(--foreground))', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5, fontWeight: '450' }}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Image Component */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          style={{
            position: 'relative',
            height: '650px',
            borderRadius: '2rem',
            overflow: 'hidden',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15)'
          }}
        >
          <img 
            src={ellaImg} 
            alt="Beautiful Sri Lanka Landscape" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
            className="glass"
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              left: '2.5rem',
              padding: '1.75rem',
              borderRadius: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              zIndex: 10,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              width: '55px',
              height: '55px',
              backgroundColor: 'hsl(var(--primary))',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '900',
              fontSize: '1.3rem',
              boxShadow: '0 10px 20px hsla(var(--primary) / 0.3)'
            }}>
              10+
            </div>
            <div>
              <p style={{ fontWeight: '800', lineHeight: 1.2, color: 'hsl(var(--secondary))', fontSize: '1.1rem' }}>
                {(t?.aboutYearsLine1 || 'Years of')} <br /> {(t?.aboutYearsLine2 || 'Excellence')}
              </p>
            </div>
          </motion.div>

          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 40%)',
            pointerEvents: 'none'
          }} />
        </motion.div>

      </div>
    </section>
  );
}
