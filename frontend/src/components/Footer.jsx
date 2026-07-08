import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, MessageCircle, Users, Heart } from 'lucide-react';
import logoImg from '../assets/logo.webp';
import { useSite } from '../context/SiteContext';

export default function Footer() {
  const { t } = useSite();

  return (
    <footer
      className="site-footer"
      style={{
      padding: 'clamp(3.5rem, 10vw, 100px) max(1.25rem, 5%) max(2.5rem, env(safe-area-inset-bottom, 0px))',
      paddingLeft: 'max(1.25rem, 5%, env(safe-area-inset-left, 0px))',
      paddingRight: 'max(1.25rem, 5%, env(safe-area-inset-right, 0px))',
      backgroundColor: 'hsl(142, 76%, 15%)',
      color: '#ffffff',
      position: 'relative',
      zIndex: 2,
      overflow: 'hidden',
      marginTop: 'auto',
    }}>
      {/* Decorative Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(to right, transparent, hsla(142, 76%, 36%, 0.3), transparent)',
      }} />

      <div className="footer-grid" style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: 'clamp(2.5rem, 6vw, 5rem)'
      }}>
        <div className="footer-brand-col" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <img 
              src={logoImg} 
              alt="Serendib Logo" 
              style={{ height: '60px', width: 'auto', filter: 'brightness(0) invert(1)' }} 
            />
            <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '2px', lineHeight: 1 }}>
                SERENDIB
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '4px', color: 'hsl(var(--primary))', marginTop: '4px' }}>
                TRAVEL & TOURS
              </span>
            </div>
          </div>
          <p style={{ opacity: 0.6, lineHeight: 1.8, marginBottom: '3rem', maxWidth: '500px', fontSize: '1.1rem' }}>
            {t.footerDescription ||
              "Crafting unforgettable journeys across Sri Lanka and beyond. We provide luxury adventures that resonate with the soul and create lasting memories."}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { Icon: Camera, label: "Instagram" },
              { Icon: MessageCircle, label: "WhatsApp" },
              { Icon: Users, label: "Facebook" }
            ].map(({ Icon, label }, idx) => (
              <motion.a 
                key={idx}
                whileHover={{ y: -5, color: 'hsl(var(--primary))', backgroundColor: 'white' }}
                href="#" 
                aria-label={label}
                rel="noopener noreferrer"
                style={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={22} />
              </motion.a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="serif" style={{ color: 'white', marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 600 }}>{t.footerExploreTitle}</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: 0.6, fontSize: '1.1rem' }}>
            <li><Link to="/inbound" style={{ color: 'inherit', textDecoration: 'none' }}>{t.footerExploreInbound}</Link></li>
            <li><Link to="/outbound" style={{ color: 'inherit', textDecoration: 'none' }}>{t.footerExploreOutbound}</Link></li>
            <li style={{ cursor: 'pointer' }}>{t.footerExploreLuxuryStays}</li>
            <li style={{ cursor: 'pointer' }}>{t.footerExploreCuratedBlogs}</li>
          </ul>
        </div>

        <div>
          <h2 className="serif" style={{ color: 'white', marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 600 }}>{t.footerNewsletterTitle}</h2>
          <p style={{ opacity: 0.6, marginBottom: '2rem', lineHeight: 1.6 }}>{t.footerNewsletterSubtitle}</p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <label htmlFor="newsletter-email" className="sr-only" style={{ display: 'none' }}>Email address</label>
            <input 
              id="newsletter-email"
              type="email" 
              placeholder={t.footerEmailPlaceholder}
              aria-label="Email address for newsletter"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
            <button 
              className="btn btn-primary" 
              style={{ padding: '1.25rem', borderRadius: '1rem', width: '100%', fontWeight: 700 }}
            >
              {t.footerSubscribeNow}
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar" style={{
        maxWidth: '1440px',
        margin: 'clamp(3rem, 8vw, 80px) auto 0',
        paddingTop: '30px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem',
        opacity: 0.4,
        fontSize: '0.95rem'
      }}>
        <p>
          <Link 
            to="/admin" 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none', 
              cursor: 'pointer',
              display: 'inline-block',
              padding: '10px',
              margin: '-10px',
              transition: 'opacity 0.2s'
            }}
            title="Admin Access"
          >
            ©
          </Link> 
          2026 Serendib Travel & Tours. Elevating every journey.
        </p>
        <div className="footer-legal-links" style={{ display: 'flex', gap: 'clamp(1rem, 4vw, 3rem)', flexWrap: 'wrap' }}>
          <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}><span>{t.footerPrivacyPolicy}</span></Link>
          <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}><span>{t.footerTerms}</span></Link>
          <Link to="/cookies" style={{ color: 'inherit', textDecoration: 'none' }}><span>{t.footerCookies}</span></Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {t.footerMadeWith} <Heart size={16} fill="currentColor" /> {t.footerMadeWithSuffix}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .footer-brand-col { grid-column: span 1 !important; }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            text-align: left;
          }
          .footer-legal-links { width: 100%; justify-content: flex-start; }
        }
      `}</style>
    </footer>
  );
}
