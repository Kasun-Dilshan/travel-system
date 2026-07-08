import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Info, Calendar, Wind, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket, normalizeLanguageCode } from '../utils/localization';

export default function DestinationModal({
  isOpen,
  onClose,
  destination,
  headerBadge,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [windowWidth, setWindowWidth] = React.useState(() => {
    if (typeof window === 'undefined') return 1024;
    return window.innerWidth || 1024;
  });
  const { language, t } = useSite();
  const activeLang = normalizeLanguageCode(language);
  const isMobile = windowWidth < 768;
  const targetScale = isMobile ? 1 : 0.7;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const localizedUi = {
    en: { quickFacts: 'Quick Facts', exploreTours: 'Explore Tours' },
    de: { quickFacts: 'Kurzinfos', exploreTours: 'Touren entdecken' },
    fr: { quickFacts: 'Infos rapides', exploreTours: 'Explorer les tours' },
    zh: { quickFacts: '快速信息', exploreTours: '探索行程' },
    jp: { quickFacts: 'クイック情報', exploreTours: 'ツアーを見る' },
    ar: { quickFacts: 'معلومات سريعة', exploreTours: 'استكشف الجولات' },
    hi: { quickFacts: 'त्वरित जानकारी', exploreTours: 'टूर एक्सप्लोर करें' },
  };

  const factLabelMap = {
    en: {
      country: 'Country', bestTime: 'Best Time', highlights: 'Highlights', region: 'Region', capital: 'Capital',
      altitude: 'Altitude', vibe: 'Vibe', activity: 'Activity', weather: 'Weather', architecture: 'Architecture',
      unesco: 'UNESCO', distance: 'Distance', bay: 'Bay', beach: 'Beach', season: 'Season', wildlife: 'Wildlife',
      area: 'Area', status: 'Status', feature: 'Feature', animal: 'Animal', size: 'Size', climate: 'Climate',
      nickname: 'Nickname', elevation: 'Elevation'
    },
    de: {
      country: 'Land', bestTime: 'Beste Zeit', highlights: 'Highlights', region: 'Region', capital: 'Hauptstadt',
      altitude: 'Höhe', vibe: 'Atmosphäre', activity: 'Aktivität', weather: 'Wetter', architecture: 'Architektur',
      unesco: 'UNESCO', distance: 'Entfernung', bay: 'Bucht', beach: 'Strand', season: 'Saison', wildlife: 'Tierwelt',
      area: 'Fläche', status: 'Status', feature: 'Merkmal', animal: 'Tier', size: 'Größe', climate: 'Klima',
      nickname: 'Spitzname', elevation: 'Höhenlage'
    },
    fr: {
      country: 'Pays', bestTime: 'Meilleure période', highlights: 'Points forts', region: 'Région', capital: 'Capitale',
      altitude: 'Altitude', vibe: 'Ambiance', activity: 'Activité', weather: 'Météo', architecture: 'Architecture',
      unesco: 'UNESCO', distance: 'Distance', bay: 'Baie', beach: 'Plage', season: 'Saison', wildlife: 'Faune',
      area: 'Superficie', status: 'Statut', feature: 'Particularité', animal: 'Animal', size: 'Taille', climate: 'Climat',
      nickname: 'Surnom', elevation: 'Élévation'
    },
    zh: {
      country: '国家', bestTime: '最佳时间', highlights: '亮点', region: '地区', capital: '首府',
      altitude: '海拔', vibe: '氛围', activity: '活动', weather: '天气', architecture: '建筑',
      unesco: '联合国教科文组织', distance: '距离', bay: '海湾', beach: '海滩', season: '季节', wildlife: '野生动物',
      area: '面积', status: '状态', feature: '特色', animal: '动物', size: '大小', climate: '气候',
      nickname: '别名', elevation: '海拔高度'
    },
    jp: {
      country: '国', bestTime: 'ベストシーズン', highlights: 'ハイライト', region: '地域', capital: '首都',
      altitude: '標高', vibe: '雰囲気', activity: 'アクティビティ', weather: '気候', architecture: '建築',
      unesco: 'ユネスコ', distance: '距離', bay: '湾', beach: 'ビーチ', season: 'シーズン', wildlife: '野生動物',
      area: '面積', status: 'ステータス', feature: '特徴', animal: '動物', size: '規模', climate: '気候',
      nickname: '愛称', elevation: '標高'
    },
    ar: {
      country: 'الدولة', bestTime: 'أفضل وقت', highlights: 'أبرز المعالم', region: 'المنطقة', capital: 'العاصمة',
      altitude: 'الارتفاع', vibe: 'الأجواء', activity: 'النشاط', weather: 'الطقس', architecture: 'العمارة',
      unesco: 'اليونسكو', distance: 'المسافة', bay: 'الخليج', beach: 'الشاطئ', season: 'الموسم', wildlife: 'الحياة البرية',
      area: 'المساحة', status: 'الحالة', feature: 'الميزة', animal: 'الحيوان', size: 'الحجم', climate: 'المناخ',
      nickname: 'اللقب', elevation: 'مستوى الارتفاع'
    },
    hi: {
      country: 'देश', bestTime: 'सबसे अच्छा समय', highlights: 'मुख्य आकर्षण', region: 'क्षेत्र', capital: 'राजधानी',
      altitude: 'ऊंचाई', vibe: 'माहौल', activity: 'गतिविधि', weather: 'मौसम', architecture: 'वास्तुकला',
      unesco: 'यूनेस्को', distance: 'दूरी', bay: 'खाड़ी', beach: 'समुद्र तट', season: 'मौसम', wildlife: 'वन्यजीव',
      area: 'क्षेत्रफल', status: 'स्थिति', feature: 'विशेषता', animal: 'जानवर', size: 'आकार', climate: 'जलवायु',
      nickname: 'उपनाम', elevation: 'ऊँचाई स्तर'
    },
  };

  const localizedDestination = useMemo(() => {
    if (!destination) return null;
    const bucket = getLocalizationBucket(destination, activeLang);
    return { ...destination, ...bucket };
  }, [destination, activeLang]);

  const displayName = localizedDestination?.name || destination?.name || '';
  const displayDescription = localizedDestination?.fullDescription || localizedDestination?.description || '';
  const displayFacts = localizedDestination?.facts || destination?.facts || [];

  const normalizeFactKey = (label) => {
    const cleaned = String(label || '').trim().toLowerCase().replace(/\s+/g, '');
    if (cleaned === 'besttime') return 'bestTime';
    return cleaned;
  };

  const localizeFactLabel = (label) => {
    const key = normalizeFactKey(label);
    return factLabelMap[activeLang]?.[key] || factLabelMap.en[key] || label;
  };
  const displayHeaderBadge = headerBadge || t.inboundLabel || 'DISCOVER SRI LANKA';

  const images = useMemo(() => {
    if (!destination) return [];
    if (destination.images?.length) return destination.images;
    return destination.image ? [destination.image] : [];
  }, [destination]);

  const hasMultipleImages = images.length > 1;

  // Reset carousel when opening or switching destination (hooks must run before any return)
  useEffect(() => {
    if (!isOpen || !destination) return;
    setCurrentImageIndex(0);
  }, [isOpen, destination?.id, destination?.name]);

  useEffect(() => {
    if (!isOpen || !hasMultipleImages) return;
    const len = images.length;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % len);
    }, 4000);
    return () => clearInterval(timer);
  }, [isOpen, hasMultipleImages, images.length]);

  if (!isOpen || !destination) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const modalLayoutStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '1100px',
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: '2.5rem',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    textAlign: activeLang === 'ar' ? 'right' : 'left',
    transformOrigin: 'center',
  };

  const imagePaneStyle = {
    position: 'relative',
    flex: isMobile ? '0 0 auto' : '0 0 48%',
    height: isMobile ? '450px' : 'auto',
    minHeight: isMobile ? undefined : '640px',
    backgroundColor: '#000',
    overflow: 'hidden',
  };

  const contentPaneStyle = {
    flex: '1 1 auto',
    padding: isMobile ? '2.5rem 2.25rem' : '3.25rem',
    overflowY: 'auto',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 46, 32, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: Math.max(0.6, targetScale - 0.05), y: 24 }}
          animate={{ opacity: 1, scale: targetScale, y: 0 }}
          exit={{ opacity: 0, scale: Math.max(0.62, targetScale - 0.03), y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
          style={modalLayoutStyle}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 25
            }}
          >
            <X size={24} />
          </button>

          {/* Image Pane (Carousel) */}
          <div style={imagePaneStyle}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${displayName} - ${currentImageIndex + 1}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AnimatePresence>

            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)',
              pointerEvents: 'none'
            }} />

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '1.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '1.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dots Indicators */}
                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.6rem',
                  zIndex: 10
                }}>
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      style={{
                        width: currentImageIndex === idx ? '28px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: currentImageIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content Pane */}
          <div style={contentPaneStyle}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <MapPin size={18} color="hsl(var(--primary))" />
                <span style={{ fontWeight: '800', letterSpacing: '0.1em', fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8, color: 'hsl(var(--foreground) / 0.7)' }}>
                  {displayHeaderBadge}
                </span>
              </div>
              <h2 style={{ fontSize: isMobile ? '2.4rem' : '3rem', fontWeight: '900', color: 'hsl(var(--secondary))', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                {displayName}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: isMobile ? '2rem' : '3rem' }}>
              <div>
                <section style={{ marginBottom: isMobile ? '2rem' : '2.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.25rem', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Info size={22} color="hsl(var(--primary))" /> {(t.navAbout || 'About')} {displayName}
                  </h3>
                  <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'hsl(var(--foreground) / 0.85)', fontWeight: '450' }}>
                    {displayDescription}
                  </p>
                </section>
              </div>

              <aside>
                <div style={{
                  backgroundColor: 'hsl(var(--primary) / 0.03)',
                  borderRadius: '2rem',
                  padding: '2rem',
                  border: '1px solid hsl(var(--primary) / 0.1)'
                }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1.25rem', color: 'hsl(var(--secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {localizedUi[activeLang]?.quickFacts || localizedUi.en.quickFacts}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {displayFacts?.map((fact, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'hsl(var(--foreground) / 0.4)', textTransform: 'uppercase' }}>
                          {localizeFactLabel(fact.label)}
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'hsl(var(--secondary))' }}>
                          {fact.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    padding: '1.15rem',
                    backgroundColor: 'hsl(var(--secondary))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1.25rem',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px -5px hsl(var(--secondary) / 0.3)'
                  }}
                >
                  {localizedUi[activeLang]?.exploreTours || localizedUi.en.exploreTours}
                </motion.button>
              </aside>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
