import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import API_URL from '../config';
import { TRANSLATIONS } from '../data/translations';
import { normalizeLanguageCode } from '../utils/localization';
import { fetchLiveUsdToLkrRate, getUsdToLkrRate, getUsdToLkrRateRefreshMs, normalizeCurrency } from '../utils/money';

const SiteContext = createContext(null);

function pickLocalizedBucket(obj, language) {
  if (!obj || typeof obj !== 'object') return null;
  const candidates = [
    obj.localizations,
    obj.translations,
    obj.i18n,
    obj.localized,
    obj.locale,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'object') {
      const bucket = c[language] || c.en;
      if (bucket && typeof bucket === 'object') return bucket;
    }
  }
  return null;
}

function localizeValue(value, language) {
  if (Array.isArray(value)) return value.map((v) => localizeValue(v, language));
  if (!value || typeof value !== 'object') return value;
  const bucket = pickLocalizedBucket(value, language);
  const base = { ...value };
  if (bucket) Object.assign(base, bucket);
  // Also localize nested arrays/objects that may have their own buckets
  for (const [k, v] of Object.entries(base)) {
    if (Array.isArray(v) || (v && typeof v === 'object')) {
      base[k] = localizeValue(v, language);
    }
  }
  return base;
}

const defaultSettings = {
  heroTitle: 'Discover Sri Lanka\'s Hidden Paradise',
  heroSubtitle: 'Your journey to the gem of the Indian Ocean starts here.',
  heroImages: [],
  aboutTitle: 'About Serendib Travel & Tours',
  aboutText: 'We are a premier travel agency specializing in both inbound and outbound tours.',
  contactEmail: 'ticketing@serendibgroups.com',
  contactPhone: '+94 77 113 3100',
  contactWhatsApp: '+94771133100',
  contactAddress: 'No. 123, Galle Road, Colombo 03, Sri Lanka',
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  socialYoutube: '',
  socialTripAdvisor: '',
  partnerLogos: [],
  announcementEnabled: false,
  announcementText: '',
  announcementLink: '',
  companyName: 'Serendib Travel & Tours',
  companyTagline: 'Your Gateway to Sri Lanka',
  companyLogo: '',
  footerText: '© 2024 Serendib Travel & Tours. All rights reserved.',
  seoTitle: 'Serendib Travel & Tours — Sri Lanka Tour Packages',
  seoDescription: 'Book premium inbound and outbound tours with Serendib Travel & Tours.',
  premiumServices: [
    {
      key: 'transport',
      shortDesc: 'Premium fleet for all your travel needs.',
      details:
        'Choose from sedans, SUVs, vans, and luxury vehicles with professional drivers. We handle airport transfers, city rides, and multi-day transport with flexible schedules.',
      highlights: ['Airport transfers', 'Private driver', 'Luxury & family options', 'Flexible itineraries'],
      ctaLabel: 'Request a quote',
      ctaLink: '/booking',
    },
    {
      key: 'hotels',
      shortDesc: 'Exclusive deals with handpicked luxury stays.',
      details:
        'We recommend and book the best hotels and resorts based on your budget, preferred locations, and travel style. Enjoy curated options and trusted partners for a smooth stay.',
      highlights: ['Handpicked stays', 'Best available rates', 'Family & honeymoon options', 'Fast confirmations'],
      ctaLabel: 'Get recommendations',
      ctaLink: '/booking',
    },
    {
      key: 'activities',
      shortDesc: 'Curated experiences and local adventures.',
      details:
        'From cultural sites to nature and adventure, we plan experiences that match your interests. We can also arrange guides, tickets, and timed entries where required.',
      highlights: ['Local guides', 'Custom activities', 'Tickets & reservations', 'Safe, verified partners'],
      ctaLabel: 'Plan my activities',
      ctaLink: '/booking',
    },
    {
      key: 'events',
      shortDesc: 'Full event planning and MICE support.',
      details:
        'We support meetings, incentives, conferences, and events from end to end—venues, logistics, accommodation, transport, and on-site coordination.',
      highlights: ['Venue sourcing', 'Group logistics', 'On-site coordination', 'Vendor management'],
      ctaLabel: 'Talk to our team',
      ctaLink: '/booking',
    },
    {
      key: 'corporate',
      shortDesc: 'Tailored business travel solutions.',
      details:
        'Corporate travel planning for teams and executives. We handle schedules, bookings, and support with a focus on reliability, speed, and comfort.',
      highlights: ['Priority support', 'Flexible changes', 'Team itineraries', 'Trusted partners'],
      ctaLabel: 'Contact corporate desk',
      ctaLink: '/booking',
    },
  ],
};

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('app_language') || 'en';
    const normalized = normalizeLanguageCode(stored);
    // Migrate legacy values (e.g. cn -> zh) so other lookups work.
    if (normalized !== stored) {
      try { localStorage.setItem('app_language', normalized); } catch {}
    }
    return normalized;
  });

  const [currency, setCurrency] = useState(() => {
    const stored = localStorage.getItem('app_currency') || 'USD';
    return normalizeCurrency(stored);
  });

  const [usdToLkrRate, setUsdToLkrRate] = useState(() => getUsdToLkrRate());
  const [usdToLkrMeta, setUsdToLkrMeta] = useState(() => ({
    source: 'env',
    asOfMs: null,
  }));

  // Fetch realtime USD->LKR periodically (with localStorage cache).
  useEffect(() => {
    const CACHE_KEY = 'usd_to_lkr_rate_cache_v1';
    const refreshMs = getUsdToLkrRateRefreshMs();
    const maxAgeMs = Math.max(refreshMs, 2 * 60 * 1000);

    let cancelled = false;
    let timer = null;
    let controller = null;

    const loadCache = () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const rate = Number(parsed?.rate);
        const asOfMs = Number(parsed?.asOfMs);
        const source = String(parsed?.source || 'cache');
        if (!Number.isFinite(rate) || rate <= 0) return null;
        if (!Number.isFinite(asOfMs) || asOfMs <= 0) return null;
        return { rate, asOfMs, source };
      } catch {
        return null;
      }
    };

    const saveCache = (payload) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    };

    const applyRate = ({ rate, asOfMs, source }) => {
      if (cancelled) return;
      setUsdToLkrRate(rate);
      setUsdToLkrMeta({ source, asOfMs });
    };

    const refreshOnce = async () => {
      try {
        controller?.abort?.();
        controller = new AbortController();
        const out = await fetchLiveUsdToLkrRate({ signal: controller.signal });
        if (cancelled) return;
        applyRate({ rate: out.rate, asOfMs: out.asOfMs, source: out.source });
        saveCache({ rate: out.rate, asOfMs: out.asOfMs, source: out.source });
      } catch {
        // Keep whatever rate we already have (env/cache), silently.
      }
    };

    // First: apply recent cache if available.
    const cached = loadCache();
    if (cached && (Date.now() - cached.asOfMs) <= maxAgeMs) {
      applyRate(cached);
    }

    // Then: fetch now (don’t wait for interval).
    refreshOnce();

    timer = setInterval(refreshOnce, refreshMs);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      controller?.abort?.();
    };
  }, []);

  useEffect(() => {
    const normalized = normalizeLanguageCode(language);
    if (normalized !== language) {
      setLanguage(normalized);
      return;
    }
    localStorage.setItem('app_language', normalized);
    document.documentElement.lang = normalized;
    document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    const normalized = normalizeCurrency(currency);
    if (normalized !== currency) {
      setCurrency(normalized);
      return;
    }
    try { localStorage.setItem('app_currency', normalized); } catch {}
  }, [currency]);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setSettings({ ...defaultSettings, ...data });
      })
      .catch(() => {}) // silently fall back to defaults
      .finally(() => setLoading(false));
  }, []);

  const t = useMemo(() => {
    const lang = normalizeLanguageCode(language);
    return TRANSLATIONS[lang] || TRANSLATIONS.en;
  }, [language]);

  const localizedSettings = useMemo(() => {
    return localizeValue(settings, normalizeLanguageCode(language));
  }, [settings, language]);

  return (
    <SiteContext.Provider value={{ settings, localizedSettings, setSettings, loading, language, setLanguage, currency, setCurrency, usdToLkrRate, usdToLkrMeta, t }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    return {
      settings: {},
      localizedSettings: {},
      setSettings: () => {},
      loading: false,
      language: 'en',
      setLanguage: () => {},
      currency: 'USD',
      setCurrency: () => {},
      usdToLkrRate: 300,
      usdToLkrMeta: {},
      t: TRANSLATIONS.en,
    };
  }
  return ctx;
}

export default SiteContext;
