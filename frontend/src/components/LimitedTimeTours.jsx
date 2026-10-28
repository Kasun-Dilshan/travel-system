import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import API_URL, { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';
import { getPackageLocalizationFallback } from '../utils/packageLocalizationFallback';
import { formatMoney } from '../utils/money';
import { isTruthyFlag } from '../utils/flags';

const CountdownTimer = ({ expiryDate, labels }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerItems = [
    { label: labels.days, value: timeLeft.days },
    { label: labels.hours, value: timeLeft.hours },
    { label: labels.minutes, value: timeLeft.minutes },
    { label: labels.seconds, value: timeLeft.seconds }
  ];

  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {timerItems.map((item, idx) => (
        <div key={idx} style={{ textAlign: 'center' }}>
          <div style={{
            background: 'hsl(var(--secondary))',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: '800',
            fontFamily: 'monospace',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            {String(item.value || 0).padStart(2, '0')}
          </div>
          <span style={{ fontSize: '0.55rem', fontWeight: '800', opacity: 0.6, marginTop: '2px', display: 'block', textTransform: 'uppercase' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function LimitedTimeTours({ onOpenTour }) {
  const { language, t, currency, usdToLkrRate } = useSite();
  const [dynamicPackages, setDynamicPackages] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/packages?lang=${encodeURIComponent(language)}`);
        if (!res.ok) throw new Error('Failed to fetch packages');
        const data = await res.json();
        if (isMounted && Array.isArray(data)) setDynamicPackages(data);
      } catch {
        // If fetch fails, show nothing (no demo data)
      }
    })();
    return () => { isMounted = false; };
  }, [language]);

  const flashSales = dynamicPackages.filter(p => isTruthyFlag(p.isLimitedTime));

  const timerLabels = {
    days: t.timerDays || 'D',
    hours: t.timerHours || 'H',
    minutes: t.timerMinutes || 'M',
    seconds: t.timerSeconds || 'S'
  };

  return (
    <section style={{
      padding: 'clamp(3rem, 10vw, 100px) max(1.25rem, 5%) 60px',
      paddingLeft: 'max(1.25rem, 5%, env(safe-area-inset-left, 0px))',
      paddingRight: 'max(1.25rem, 5%, env(safe-area-inset-right, 0px))',
      maxWidth: '1440px',
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '3.5rem',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ 
              background: 'hsl(var(--primary) / 0.1)', 
              color: 'hsl(var(--primary))',
              padding: '0.5rem 1rem',
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Zap size={14} fill="currentColor" />
              {t.flashSaleLabel}
            </span>
          </div>
          <h2 className="serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1 }}>
            {t.flashSaleTitle.split('. ').map((part, i) => (
              <React.Fragment key={i}>
                {i === 0 ? part + '.' : <><br/> <span style={{ color: 'hsl(var(--primary))' }}>{part}</span></>}
              </React.Fragment>
            ))}
          </h2>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '400px', color: 'hsl(var(--foreground) / 0.6)', fontSize: '1.1rem' }}
        >
          {t.flashSaleSubtitle}
        </motion.p>
      </div>

      <div className="grid-layout">
        {flashSales.map((pkg, idx) => {
          const originalPrice = Math.round(pkg.price / (1 - (pkg.discountPercentage / 100)));
          const localized = {
            ...getPackageLocalizationFallback(pkg, language),
            ...getLocalizationBucket(pkg, language),
          };
          const displayTitle = localized.title || pkg.title;
          const displayDescription = localized.description || pkg.description;
          
          return (
            <motion.div
              key={pkg._id || pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -12 }}
              style={{
                background: 'white',
                borderRadius: '2.5rem',
                overflow: 'hidden',
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.1)',
                border: '1px solid hsl(var(--glass-border))',
                position: 'relative'
              }}
            >
              <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                  src={mediaUrl(pkg.image)} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8))'
                }} />

                <div style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  background: 'hsl(var(--primary))',
                  color: 'white',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '99px',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  zIndex: 2
                }}>
                  {t.flashSaleSave} {pkg.discountPercentage}%
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '1.3rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  zIndex: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: 'white' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{t.flashSaleEndsIn}</span>
                    <CountdownTimer expiryDate={pkg.expiryDate} labels={timerLabels} />
                  </div>
                </div>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', flex: 1 }}>{displayTitle}</h3>
                </div>
                
                <p style={{ color: 'hsl(var(--foreground) / 0.6)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6, height: '3.2em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {displayDescription}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid hsl(var(--glass-border))'
                }}>
                  <div>
                    <span style={{ 
                      fontSize: '1rem', 
                      color: 'hsl(var(--foreground) / 0.4)', 
                      textDecoration: 'line-through',
                      fontWeight: '600'
                    }}>
                      {formatMoney(originalPrice, currency, { usdToLkrRate, fromCurrency: pkg.currency })}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '900', color: 'hsl(var(--secondary))' }}>
                        {formatMoney(pkg.price, currency, { usdToLkrRate, fromCurrency: pkg.currency })}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground) / 0.5)', fontWeight: '600' }}>
                        / {t.uiPerPerson || 'person'}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--secondary))', color: 'white' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenTour?.(pkg)}
                    style={{
                      background: 'hsl(var(--primary))',
                      color: 'white',
                      padding: '1rem 1.5rem',
                      borderRadius: '1.25rem',
                      border: 'none',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.3s'
                    }}
                  >
                    {t.flashSaleView} <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes pulse-soft {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
