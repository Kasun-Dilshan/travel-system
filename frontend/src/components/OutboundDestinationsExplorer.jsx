import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe2, ArrowLeft, MapPin } from 'lucide-react';
import { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket } from '../utils/localization';
import SectionHeader from './SectionHeader';
import SEO from './SEO';

export const OUTBOUND_ACCENT = 'hsl(var(--accent))';

export function localizeRegionItem(item, language) {
  if (!item) return null;
  const bucket = getLocalizationBucket(item, language);
  return { ...item, ...bucket };
}

export function OutboundDestinationsShell({
  title,
  subtitle,
  backTo,
  backLabel,
  children,
  seoTitle,
  seoDescription,
}) {
  const { language, t } = useSite();

  return (
    <main
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        padding: '0 0 clamp(3rem, 8vw, 5rem) 0',
        textAlign: language === 'ar' ? 'right' : 'left',
        boxSizing: 'border-box',
      }}
    >
      <SEO
        title={seoTitle || `${title} | Serendib Global Wonders`}
        description={seoDescription || subtitle || t.outboundDesc}
      />

      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(72px, 12vw, 100px) clamp(1rem, 4vw, 2.5rem) 0',
          boxSizing: 'border-box',
        }}
      >
        {backTo && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              to={backTo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '999px',
                border: '1px solid hsl(var(--accent) / 0.25)',
                background: 'hsl(var(--accent) / 0.08)',
                color: 'hsl(var(--secondary))',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={18} />
              {backLabel || t.uiBack || 'Back'}
            </Link>
          </div>
        )}

        <SectionHeader
          title={title}
          subtitle={subtitle}
          center={true}
          accentColor={OUTBOUND_ACCENT}
        />

        <div style={{ marginTop: '3rem' }}>{children}</div>
      </div>
    </main>
  );
}

export function DestinationChoiceCard({ item, language, badge, to, index = 0 }) {
  const localized = localizeRegionItem(item, language);

  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        whileHover={{ y: -10 }}
        style={{
          position: 'relative',
          height: '350px',
          borderRadius: '2rem',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: item.image
              ? `url(${mediaUrl(item.image)}) center/cover no-repeat`
              : 'hsl(var(--primary) / 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 60%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '2rem',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MapPin size={16} color={OUTBOUND_ACCENT} />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {badge}
            </span>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: 0 }}>
            {localized?.name || item.name}
          </h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '0.5rem' }}>
            {localized?.description || item.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

/** Destinations CTA on the main Outbound page — navigates to destinations route. */
export default function OutboundDestinationsExplorer() {
  const { t } = useSite();

  return (
    <section id="destinations-section" style={{ padding: '80px 0' }}>
      <SectionHeader
        title={t.destinationsTitle}
        subtitle={
          t.outboundDestinationsCtaSubtitle ||
          'Browse international destinations by region and country.'
        }
        center={true}
        accentColor={OUTBOUND_ACCENT}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <Link to="/outbound/destinations" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '1.15rem 2.5rem',
              borderRadius: '1.5rem',
              background: 'hsl(var(--secondary))',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 16px 36px -12px hsl(var(--secondary) / 0.45)',
              cursor: 'pointer',
            }}
          >
            <Globe2 size={22} color={OUTBOUND_ACCENT} />
            {t.navDestinations || 'Destinations'}
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
