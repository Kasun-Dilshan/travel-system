import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Hotel, Compass, Calendar, Building } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { useSite } from '../context/SiteContext';
import { getLocalizationBucket, normalizeLanguageCode } from '../utils/localization';

import transportCover from '../assets/premium-services/transport-car-rentals.webp';
import hotelsCover from '../assets/premium-services/luxury-hotel-bookings.webp';
import activitiesCover from '../assets/premium-services/activity-tour-planning.webp';
import eventsCover from '../assets/premium-services/event-mice-travels.webp';
import corporateCover from '../assets/premium-services/corporate-travels.webp';

const ServicesGrid = ({
  title,
  accentColor = 'hsl(var(--primary))',
  serviceLabels = {},
}) => {
  const { localizedSettings: settings, language, t } = useSite() || {};
  const [openKey, setOpenKey] = useState(null);
  const activeLang = normalizeLanguageCode(language);
  const localizedCardDesc = React.useMemo(() => ({
    de: {
      transport: 'Premium-Flotte fur alle Ihre Reisebedurfnisse.',
      hotels: 'Exklusive Angebote mit handverlesenen Luxusunterkunften.',
      activities: 'Kuratiere Erlebnisse und lokale Abenteuer.',
      events: 'Umfassende Eventplanung und MICE-Unterstutzung.',
      corporate: 'MaBgeschneiderte Geschaftsreiselosungen.',
    },
    fr: {
      transport: 'Flotte premium pour tous vos besoins de voyage.',
      hotels: 'Offres exclusives avec des sejours de luxe soigneusement choisis.',
      activities: 'Experiences organisees et aventures locales.',
      events: 'Planification complete des evenements et support MICE.',
      corporate: 'Solutions de voyage d affaires sur mesure.',
    },
    zh: {
      transport: '满足您所有出行需求的高端车队。',
      hotels: '甄选奢华酒店，享受专属优惠。',
      activities: '精选体验与本地探索活动。',
      events: '提供完整活动策划与会奖旅游支持。',
      corporate: '量身定制的商务差旅解决方案。',
    },
    jp: {
      transport: 'あらゆる移動ニーズに対応するプレミアム車両。',
      hotels: '厳選したラグジュアリーステイを特別価格で。',
      activities: '厳選体験とローカルアドベンチャー。',
      events: 'イベント企画とMICEサポートを一括提供。',
      corporate: '企業向けに最適化した出張ソリューション。',
    },
    ar: {
      transport: 'اسطول فاخر لجميع احتياجات سفرك.',
      hotels: 'عروض حصرية مع اقامات فاخرة مختارة بعناية.',
      activities: 'تجارب منسقة ومغامرات محلية.',
      events: 'تخطيط متكامل للفعاليات ودعم رحلات MICE.',
      corporate: 'حلول سفر اعمال مصممة حسب الحاجة.',
    },
    hi: {
      transport: 'आपकी सभी यात्रा जरूरतों के लिए प्रीमियम फ्लीट।',
      hotels: 'चुने हुए लग्जरी स्टे के साथ एक्सक्लूसिव ऑफर्स।',
      activities: 'क्यूरेटेड अनुभव और स्थानीय एडवेंचर्स।',
      events: 'फुल इवेंट प्लानिंग और MICE सपोर्ट।',
      corporate: 'आपके व्यवसाय के लिए अनुकूलित ट्रैवल समाधान।',
    },
  }), []);
  const localizedPopupContent = React.useMemo(() => ({
    de: {
      transport: {
        details: 'Wahlen Sie aus Limousinen, SUVs, Vans und Luxusfahrzeugen mit professionellen Fahrern. Wir organisieren Flughafentransfers, Stadtfahrten und mehrtagige Transporte mit flexiblen Zeitplanen.',
        highlights: ['Flughafentransfers', 'Privatfahrer', 'Luxus- und Familienoptionen', 'Flexible Reiserouten'],
        ctaLabel: 'Angebot anfragen',
      },
      hotels: {
        details: 'Wir empfehlen und buchen die besten Hotels und Resorts passend zu Budget, Lage und Reisestil. Profitieren Sie von kuratierten Optionen und zuverlassigen Partnern.',
        highlights: ['Ausgewahlte Unterkunfte', 'Beste verfugbare Preise', 'Familien- und Honeymoon-Optionen', 'Schnelle Bestatigungen'],
        ctaLabel: 'Empfehlungen erhalten',
      },
      activities: {
        details: 'Von Kulturstatten bis Natur und Abenteuer planen wir Erlebnisse passend zu Ihren Interessen. Auf Wunsch organisieren wir Guides, Tickets und Zeitfenster.',
        highlights: ['Lokale Guides', 'Individuelle Aktivitaten', 'Tickets und Reservierungen', 'Sichere, geprufte Partner'],
        ctaLabel: 'Aktivitaten planen',
      },
      events: {
        details: 'Wir unterstutzen Meetings, Incentives, Konferenzen und Events von Anfang bis Ende: Veranstaltungsorte, Logistik, Unterkunft, Transport und Vor-Ort-Koordination.',
        highlights: ['Venue-Sourcing', 'Gruppenlogistik', 'Vor-Ort-Koordination', 'Anbieter-Management'],
        ctaLabel: 'Unser Team kontaktieren',
      },
      corporate: {
        details: 'Business-Travel-Planung fur Teams und Fuhrungskrafte. Wir ubernehmen Zeitplane, Buchungen und Support mit Fokus auf Zuverlassigkeit, Geschwindigkeit und Komfort.',
        highlights: ['Prioritats-Support', 'Flexible Anderungen', 'Team-Reiserouten', 'Vertrauenswurdige Partner'],
        ctaLabel: 'Corporate Desk kontaktieren',
      },
    },
    fr: {
      transport: {
        details: 'Choisissez parmi des berlines, SUV, vans et vehicules de luxe avec chauffeurs professionnels. Nous gerons transferts aeroport, trajets urbains et transports sur plusieurs jours.',
        highlights: ['Transferts aeroport', 'Chauffeur prive', 'Options luxe et famille', 'Itineraires flexibles'],
        ctaLabel: 'Demander un devis',
      },
      hotels: {
        details: 'Nous recommandons et reservons les meilleurs hotels et resorts selon votre budget, vos preferences et votre style de voyage.',
        highlights: ['Sejours selectionnes', 'Meilleurs tarifs disponibles', 'Options famille et lune de miel', 'Confirmations rapides'],
        ctaLabel: 'Obtenir des recommandations',
      },
      activities: {
        details: 'Des sites culturels a la nature et l aventure, nous planifions des experiences adaptees a vos interets. Nous pouvons aussi gerer guides et billets.',
        highlights: ['Guides locaux', 'Activites personnalisees', 'Billets et reservations', 'Partenaires verifies'],
        ctaLabel: 'Planifier mes activites',
      },
      events: {
        details: 'Nous accompagnons reunions, incentives, conferences et evenements de bout en bout: lieux, logistique, hebergement, transport et coordination sur site.',
        highlights: ['Recherche de lieux', 'Logistique de groupe', 'Coordination sur site', 'Gestion des prestataires'],
        ctaLabel: 'Parler a notre equipe',
      },
      corporate: {
        details: 'Solutions de voyage d affaires pour equipes et dirigeants. Nous gerons planning, reservations et assistance avec rapidite et fiabilite.',
        highlights: ['Support prioritaire', 'Modifications flexibles', 'Itineraires equipe', 'Partenaires fiables'],
        ctaLabel: 'Contacter le service corporate',
      },
    },
    zh: {
      transport: {
        details: '可选择轿车、SUV、面包车和豪华车型，配备专业司机。我们可安排机场接送、市区用车及多日交通，并支持灵活行程。',
        highlights: ['机场接送', '专属司机', '豪华与家庭车型', '灵活行程安排'],
        ctaLabel: '申请报价',
      },
      hotels: {
        details: '我们会根据您的预算、偏好区域和旅行风格推荐并预订优质酒店与度假村，提供精选方案与可靠合作资源。',
        highlights: ['精选酒店', '最优可用价格', '家庭与蜜月方案', '快速确认'],
        ctaLabel: '获取推荐',
      },
      activities: {
        details: '从文化景点到自然与探险活动，我们按您的兴趣定制体验，并可安排导游、门票与时段预约。',
        highlights: ['本地导游', '定制活动', '门票与预订', '安全可靠合作方'],
        ctaLabel: '规划我的活动',
      },
      events: {
        details: '我们为会议、奖励旅游、会展与活动提供端到端支持：场地、物流、住宿、交通与现场执行协调。',
        highlights: ['场地筛选', '团队物流', '现场协调', '供应商管理'],
        ctaLabel: '联系团队',
      },
      corporate: {
        details: '为团队与高管提供定制商务差旅服务，覆盖行程规划、预订与支持，强调效率、可靠与舒适。',
        highlights: ['优先支持', '灵活改签', '团队行程', '可信合作伙伴'],
        ctaLabel: '联系商务服务',
      },
    },
    jp: {
      transport: {
        details: 'セダン、SUV、バン、ラグジュアリー車をプロドライバー付きで手配します。空港送迎、都市内移動、複数日移動まで柔軟に対応します。',
        highlights: ['空港送迎', '専属ドライバー', 'ラグジュアリー/ファミリー対応', '柔軟な行程'],
        ctaLabel: '見積もりを依頼',
      },
      hotels: {
        details: 'ご予算、エリア、旅行スタイルに合わせて厳選ホテルやリゾートを提案・予約します。信頼できる提携先でスムーズな滞在を提供します。',
        highlights: ['厳選ステイ', '最適料金', '家族/ハネムーン向け', '迅速な確約'],
        ctaLabel: 'おすすめを受け取る',
      },
      activities: {
        details: '文化体験から自然・アドベンチャーまで、興味に合わせて最適化。ガイド、チケット、時間指定予約も手配可能です。',
        highlights: ['現地ガイド', 'カスタム体験', 'チケット/予約', '信頼できる提携先'],
        ctaLabel: 'アクティビティを計画',
      },
      events: {
        details: '会議、インセンティブ、カンファレンス、イベントを一貫支援。会場、物流、宿泊、移動、現地運営まで対応します。',
        highlights: ['会場選定', '団体ロジスティクス', '現地運営', 'ベンダー管理'],
        ctaLabel: 'チームに相談',
      },
      corporate: {
        details: '企業・役員向けの出張計画を最適化。スケジュール、予約、サポートまで迅速かつ確実に対応します。',
        highlights: ['優先サポート', '柔軟な変更', 'チーム行程', '信頼パートナー'],
        ctaLabel: '法人デスクへ連絡',
      },
    },
    ar: {
      transport: {
        details: 'اختر من سيارات سيدان وSUV وفانات ومركبات فاخرة مع سائقين محترفين. نوفر نقل المطار والمشاوير داخل المدينة والتنقل متعدد الايام بمرونة كاملة.',
        highlights: ['نقل المطار', 'سائق خاص', 'خيارات فاخرة وعائلية', 'برامج مرنة'],
        ctaLabel: 'اطلب عرض سعر',
      },
      hotels: {
        details: 'نرشح ونحجز افضل الفنادق والمنتجعات حسب الميزانية والموقع واسلوب السفر، مع خيارات مختارة وشركاء موثوقين.',
        highlights: ['اقامات مختارة', 'افضل الاسعار المتاحة', 'خيارات للعائلات وشهر العسل', 'تأكيدات سريعة'],
        ctaLabel: 'احصل على توصيات',
      },
      activities: {
        details: 'من المواقع الثقافية الى الطبيعة والمغامرات، نخطط تجارب تناسب اهتماماتك، مع امكانية ترتيب مرشدين وتذاكر وحجوزات زمنية.',
        highlights: ['مرشدون محليون', 'انشطة مخصصة', 'تذاكر وحجوزات', 'شركاء موثوقون'],
        ctaLabel: 'خطط انشطتي',
      },
      events: {
        details: 'ندعم الاجتماعات والرحلات التحفيزية والمؤتمرات والفعاليات من البداية للنهاية: اماكن، لوجستيات، اقامة، نقل، وتنسيق ميداني.',
        highlights: ['اختيار المواقع', 'لوجستيات المجموعات', 'تنسيق ميداني', 'ادارة الموردين'],
        ctaLabel: 'تواصل مع فريقنا',
      },
      corporate: {
        details: 'حلول سفر اعمال مخصصة للفرق والمديرين، تشمل الجداول والحجوزات والدعم مع التركيز على السرعة والموثوقية والراحة.',
        highlights: ['دعم اولوية', 'تعديلات مرنة', 'برامج فرق', 'شركاء موثوقون'],
        ctaLabel: 'تواصل مع قسم الشركات',
      },
    },
    hi: {
      transport: {
        details: 'सेडान, SUV, वैन और लग्जरी वाहनों में से चुनें, प्रोफेशनल ड्राइवर के साथ। हम एयरपोर्ट ट्रांसफर, सिटी राइड और मल्टी-डे ट्रांसपोर्ट को फ्लेक्सिबल शेड्यूल के साथ संभालते हैं।',
        highlights: ['एयरपोर्ट ट्रांसफर', 'प्राइवेट ड्राइवर', 'लग्जरी और फैमिली विकल्प', 'लचीली यात्रा योजना'],
        ctaLabel: 'कोटेशन प्राप्त करें',
      },
      hotels: {
        details: 'हम आपके बजट, पसंदीदा लोकेशन और ट्रैवल स्टाइल के अनुसार बेहतरीन होटल और रिसॉर्ट चुनकर बुक करते हैं।',
        highlights: ['चयनित स्टे', 'सर्वश्रेष्ठ उपलब्ध दरें', 'फैमिली और हनीमून विकल्प', 'तेज कन्फर्मेशन'],
        ctaLabel: 'सिफारिशें पाएं',
      },
      activities: {
        details: 'कल्चरल साइट्स से लेकर नेचर और एडवेंचर तक, हम आपकी रुचि के अनुसार अनुभव प्लान करते हैं। जरूरत पर गाइड और टिकट भी अरेंज करते हैं।',
        highlights: ['लोकल गाइड', 'कस्टम एक्टिविटीज', 'टिकट और रिजर्वेशन', 'विश्वसनीय पार्टनर्स'],
        ctaLabel: 'मेरी एक्टिविटीज प्लान करें',
      },
      events: {
        details: 'मीटिंग, इंसेंटिव, कॉन्फ्रेंस और इवेंट्स के लिए एंड-टू-एंड सपोर्ट: वेन्यू, लॉजिस्टिक्स, स्टे, ट्रांसपोर्ट और ऑन-साइट कोऑर्डिनेशन।',
        highlights: ['वेन्यू सोर्सिंग', 'ग्रुप लॉजिस्टिक्स', 'ऑन-साइट कोऑर्डिनेशन', 'वेंडर मैनेजमेंट'],
        ctaLabel: 'हमारी टीम से बात करें',
      },
      corporate: {
        details: 'टीम और एग्जीक्यूटिव्स के लिए विशेष बिजनेस ट्रैवल समाधान। हम शेड्यूल, बुकिंग और सपोर्ट को तेज और भरोसेमंद तरीके से संभालते हैं।',
        highlights: ['प्रायोरिटी सपोर्ट', 'फ्लेक्सिबल बदलाव', 'टीम यात्रा योजना', 'विश्वसनीय साझेदार'],
        ctaLabel: 'कॉर्पोरेट डेस्क से संपर्क करें',
      },
    },
  }), []);

  const getLocalizedField = React.useCallback((serviceObj, field, fallbackValue) => {
    if (!serviceObj) return fallbackValue;

    const localizedBucket = getLocalizationBucket(serviceObj, activeLang);

    const fromBucket = localizedBucket?.[field];
    if (fromBucket != null && fromBucket !== '') return fromBucket;

    const directValue = serviceObj[field];
    if (directValue == null || directValue === '') return fallbackValue;

    // Support per-field localization objects, e.g. details: { en: "...", zh: "..." }
    if (directValue && typeof directValue === 'object' && !Array.isArray(directValue)) {
      const normalized = normalizeLanguageCode(activeLang);
      const candidate =
        directValue[activeLang] ??
        directValue[normalized] ??
        directValue.en;
      if (candidate != null && candidate !== '') return candidate;
    }

    if (
      activeLang !== 'en' &&
      fallbackValue != null &&
      fallbackValue !== '' &&
      (!Array.isArray(fallbackValue) || fallbackValue.length > 0)
    ) {
      return fallbackValue;
    }

    return directValue;
  }, [activeLang]);

  const services = useMemo(() => {
    const fromSettings = Array.isArray(settings?.premiumServices) ? settings.premiumServices : [];
    const byKey = new Map(fromSettings.filter(Boolean).map((s) => [s.key, s]));

    return [
      {
        key: 'transport',
        coverImage: transportCover,
        icon: <Car size={32} />,
        title: serviceLabels?.transport || 'Transport & Car Rentals',
        desc: getLocalizedField(
          byKey.get('transport'),
          'shortDesc',
          localizedCardDesc[activeLang]?.transport || 'Premium fleet for all your travel needs.',
        ),
        details: byKey.get('transport') || {},
      },
      {
        key: 'hotels',
        coverImage: hotelsCover,
        icon: <Hotel size={32} />,
        title: serviceLabels?.hotels || 'Luxury Hotel Bookings',
        desc: getLocalizedField(
          byKey.get('hotels'),
          'shortDesc',
          localizedCardDesc[activeLang]?.hotels || 'Exclusive deals with handpicked luxury stays.',
        ),
        details: byKey.get('hotels') || {},
      },
      {
        key: 'activities',
        coverImage: activitiesCover,
        icon: <Compass size={32} />,
        title: serviceLabels?.activities || 'Activity & Tour Planning',
        desc: getLocalizedField(
          byKey.get('activities'),
          'shortDesc',
          localizedCardDesc[activeLang]?.activities || 'Curated experiences and local adventures.',
        ),
        details: byKey.get('activities') || {},
      },
      {
        key: 'events',
        coverImage: eventsCover,
        icon: <Calendar size={32} />,
        title: serviceLabels?.events || 'Event & MICE Travels',
        desc: getLocalizedField(
          byKey.get('events'),
          'shortDesc',
          localizedCardDesc[activeLang]?.events || 'Full event planning and MICE support.',
        ),
        details: byKey.get('events') || {},
      },
      {
        key: 'corporate',
        coverImage: corporateCover,
        icon: <Building size={32} />,
        title: t?.serviceCorporate || 'Corporate Travels',
        desc: getLocalizedField(
          byKey.get('corporate'),
          'shortDesc',
          localizedCardDesc[activeLang]?.corporate || 'Tailored business travel solutions.',
        ),
        details: byKey.get('corporate') || {},
      },
    ];
  }, [activeLang, getLocalizedField, localizedCardDesc, serviceLabels, settings?.premiumServices, t?.serviceCorporate]);

  const activeService = services.find((s) => s.key === openKey) || null;
  const activeDetails = activeService?.details || null;
  const popupFallback = localizedPopupContent[activeLang]?.[activeService?.key] || {};
  const activeDetailsText = getLocalizedField(activeDetails, 'details', popupFallback.details || '');
  const activeHighlightsRaw = getLocalizedField(activeDetails, 'highlights', popupFallback.highlights || []);
  const activeHighlights = Array.isArray(activeHighlightsRaw)
    ? activeHighlightsRaw.filter(Boolean)
    : [];
  const activeCtaLabel = String(
    getLocalizedField(activeDetails, 'ctaLabel', popupFallback.ctaLabel || t?.uiLearnMore || 'Learn more') || ''
  ).trim();

  return (
    <section style={{ padding: '80px 0' }}>
      <SectionHeader title={title} center={true} accentColor={accentColor} />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
      }}>
        {services.map((service, i) => (
          <motion.div
            key={service.key || i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            role="button"
            tabIndex={0}
            onClick={() => setOpenKey((prev) => (prev === service.key ? null : service.key))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setOpenKey((prev) => (prev === service.key ? null : service.key));
              if (e.key === 'Escape') setOpenKey(null);
            }}
            style={{
              borderRadius: '2rem',
              backgroundColor: 'white',
              border: '1px solid hsl(var(--glass-border))',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              outline: 'none'
            }}
            whileHover={{ y: -4, boxShadow: '0 16px 40px -14px rgba(0,0,0,0.10)' }}
          >
            <div style={{ position: 'relative', width: '100%', height: '160px', background: '#0b1220' }}>
              {!!service.coverImage && (
                <img
                  src={service.coverImage}
                  alt={service.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
              )}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.55) 100%)',
                }}
              />
              <div style={{ position: 'absolute', left: '1.25rem', bottom: '1.25rem' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '1.25rem', 
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.20)',
                  backdropFilter: 'blur(8px)',
                }}>
                  {service.icon}
                </div>
              </div>
            </div>

            <div style={{ padding: '1.75rem 1.75rem 2rem', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'hsl(var(--secondary))' }}>
                {service.title}
              </h4>
              <p style={{ fontSize: '1rem', opacity: 0.85, lineHeight: 1.6, fontWeight: '450', color: 'hsl(var(--foreground))' }}>
                {service.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {!!activeService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenKey(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              background: 'rgba(15,23,42,0.55)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '780px',
                borderRadius: '1.25rem',
                background: 'white',
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.20)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '0.9rem', background: 'hsl(var(--primary) / 0.06)', color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.cloneElement(activeService.icon, { size: 22 })}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'hsl(var(--secondary))' }}>{activeService.title}</div>
                    <div style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground) / 0.75)', fontWeight: 550 }}>
                      {activeService.desc}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenKey(null)}
                  style={{
                    border: 'none',
                    background: '#f1f5f9',
                    color: '#334155',
                    borderRadius: '0.9rem',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  {t?.uiClose || 'Close'}
                </button>
              </div>

              <div style={{ padding: '1.5rem 1.75rem' }}>
                <div style={{ color: 'hsl(var(--foreground))', opacity: 0.9, lineHeight: 1.75, fontWeight: 450, whiteSpace: 'pre-wrap' }}>
                  {String(activeDetailsText || '').trim()
                    ? activeDetailsText
                    : (t?.uiDetailsComingSoon || 'Details will appear here once added by admin.')}
                </div>

                {activeHighlights.length > 0 && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <div style={{ fontWeight: 900, color: 'hsl(var(--secondary))', marginBottom: '0.6rem' }}>
                      {t?.uiHighlights || 'Highlights'}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.35rem' }}>
                      {activeHighlights.map((h, idx) => (
                        <li key={idx} style={{ color: 'hsl(var(--foreground) / 0.88)', lineHeight: 1.6 }}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {String(activeDetails?.ctaLink || '').trim() && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <a
                      href={activeDetails.ctaLink}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {activeCtaLabel || (t?.uiLearnMore || 'Learn more')}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesGrid;
