import React from 'react';
import { motion } from 'framer-motion';

// Import the branded logos
import jetwingLogo from '../assets/jetwing-hotels.webp';
import cinnamonLogo from '../assets/cinnamon-hotels.webp';
import ugaLogo from '../assets/uga-escapes.webp';

const PARTNERS = [
  { id: 1, name: 'Jetwing Hotels', logo: jetwingLogo },
  { id: 2, name: 'Cinnamon Hotels & Resorts', logo: cinnamonLogo },
  { id: 3, name: 'Uga Escapes', logo: ugaLogo },
];

const PartnerLogos = ({ accentColor = 'hsl(var(--primary))' }) => {
  return (
    <section style={{ padding: '40px 0 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          style={{ 
            textTransform: 'uppercase', 
            letterSpacing: '3px', 
            fontSize: '0.8rem', 
            fontWeight: 700,
            color: accentColor,
            marginBottom: '1rem'
          }}
        >
          Our Trusted Hospitality Partners
        </motion.p>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '4rem',
        opacity: 0.9
      }}>
        {PARTNERS.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, opacity: 1 }}
            style={{ 
              width: '220px', 
              height: '120px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              filter: 'grayscale(100%)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              padding: '1.5rem',
              borderRadius: '1.5rem',
              backgroundColor: 'hsl(var(--primary) / 0.02)',
              border: '1px solid hsl(var(--primary) / 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'grayscale(0%)';
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'grayscale(100%)';
              e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.02)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img 
              src={partner.logo} 
              alt={partner.name} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain' 
              }} 
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PartnerLogos;
