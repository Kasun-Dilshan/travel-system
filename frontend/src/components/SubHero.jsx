import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSite } from '../context/SiteContext';

const SubHero = ({ 
  title, 
  subtitle, 
  label, 
  image, 
  currentLang, 
  accentColor = 'hsl(var(--primary))' 
}) => {
  const { language } = useSite();
  const activeLang = currentLang || language;
  const isRtl = activeLang === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section 
      className="full-bleed"
      style={{
        position: 'relative',
        height: 'clamp(320px, 72dvh, 88vh)',
        minHeight: 'min(520px, 85dvh)',
        overflow: 'hidden',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        marginBottom: 'clamp(2.5rem, 6vw, 5rem)',
        zIndex: 1
      }}
    >
      {/* Background Image with Zoom Animation */}
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}
      >
        <img 
          src={image} 
          alt={title} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            filter: 'brightness(0.6)'
          }} 
        />
      </motion.div>

      {/* Overlay Gradients */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%), linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1440px',
        width: '100%',
        paddingLeft: 'max(1rem, 5vw, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, 5vw, env(safe-area-inset-right, 0px))',
        textAlign: isRtl ? 'right' : 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
          {/* Label / Breadcrumb */}
          <motion.span 
            variants={itemVariants}
            style={{ 
              color: 'white', 
              opacity: 0.9,
              fontWeight: 800, 
              letterSpacing: '0.4em', 
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '1.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              borderLeft: isRtl ? 'none' : `4px solid ${accentColor}`,
              borderRight: isRtl ? `4px solid ${accentColor}` : 'none',
              paddingLeft: isRtl ? '0' : '1.5rem',
              paddingRight: isRtl ? '1.5rem' : '0'
            }}
          >
            {label}
          </motion.span>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="serif"
            style={{ 
              fontSize: 'clamp(3rem, 10vw, 6.5rem)', 
              fontWeight: 800, 
              lineHeight: 1,
              marginBottom: '2rem',
              maxWidth: '900px',
              color: 'white',
              textShadow: '0 20px 50px rgba(0,0,0,0.9), 0 10px 20px rgba(0,0,0,0.5)'
            }}
          >
            {title}
          </motion.h1>

          {/* Description / Subtitle */}
          <motion.p 
            variants={itemVariants}
            style={{ 
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '650px',
              lineHeight: 1.6,
              marginBottom: '3rem',
              fontWeight: 500,
              textShadow: '0 2px 15px rgba(0,0,0,0.8)'
            }}
          >
            {subtitle}
          </motion.p>

        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          color: 'white',
          opacity: 0.6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
};

export default SubHero;
