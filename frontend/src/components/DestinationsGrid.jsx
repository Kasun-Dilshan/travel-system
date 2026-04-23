import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { mediaUrl } from '../config';

const DestinationsGrid = ({ 
  title, 
  subtitle, 
  destinations, 
  onSelectDestination,
  accentColor = 'hsl(var(--primary))' 
}) => {
  return (
    <section style={{ padding: '80px 0' }}>
      <SectionHeader title={title} subtitle={subtitle} center={true} accentColor={accentColor} />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '3rem'
      }}>
        {destinations.map((dest, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => onSelectDestination?.(dest)}
            style={{
              position: 'relative',
              height: '350px',
              borderRadius: '2rem',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
            }}
          >
            {/* Background Image Placeholder or Image if provided */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              background: dest.image ? `url(${mediaUrl(dest.image)}) center/cover no-repeat` : 'none'
            }} />

            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2rem',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MapPin size={16} color={accentColor} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Destination</span>
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>{dest.name}</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>{dest.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default DestinationsGrid;
