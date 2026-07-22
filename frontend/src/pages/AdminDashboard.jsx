import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL, { mediaUrl } from '../config';
import AdminLogin from '../components/AdminLogin';
import MapComponent from '../components/MapComponent';
import { getLocalizationBucket, normalizeLanguageCode } from '../utils/localization';
import { getPackageLocalizationFallback } from '../utils/packageLocalizationFallback';
import { useSite } from '../context/SiteContext';
import { RevenueChart, CategoryDistribution } from '../components/DashboardCharts';
import { formatMoney } from '../utils/money';
import { buildRouteFromItinerary, extractDayStopsFromItinerary, routeKey, cleanTextLines } from '../utils/geocodeRoute';
import {
  Users, Calendar, Phone, Mail, MapPin, Trash2,
  CheckCircle2, X, Clock, Search, AlertCircle,
  TrendingUp, LayoutDashboard, Briefcase, Settings,
  Plus, RefreshCcw, Pencil, Save, LogOut, ExternalLink,
  DollarSign, BookOpen, Globe, Image, Link as LinkIcon,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff, Star, Tag, FileText
} from 'lucide-react';
import { OUTBOUND_CONTINENTS, mergeContinentsWithFallback } from '../data/outbound-regions';
import AdminDestinationsTab from '../components/AdminDestinationsTab';

function countryCodeForPackage(form) {
  if (form?.category === 'Inbound') return 'LK';
  const countryId = String(form?.countryId || '').toLowerCase();
  const codeByCountry = {
    japan: 'JP', china: 'CN', india: 'IN', singapore: 'SG', thailand: 'TH',
    uae: 'AE', dubai: 'AE', 'saudi-arabia': 'SA', france: 'FR', 'united-kingdom': 'GB',
    uk: 'GB', germany: 'DE', italy: 'IT', spain: 'ES', australia: 'AU',
    'united-states': 'US', usa: 'US', maldives: 'MV', malaysia: 'MY', indonesia: 'ID',
  };
  return codeByCountry[countryId] || undefined;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

function pickLocalizedField(localizedVal, baseVal) {
  if (typeof localizedVal === 'string' && localizedVal.trim()) return localizedVal;
  if (baseVal !== null && baseVal !== undefined && baseVal !== '') return baseVal;
  return localizedVal || baseVal || '';
}

function pickLocalizedArray(localizedVal, baseVal) {
  if (Array.isArray(localizedVal) && localizedVal.length > 0) return localizedVal;
  if (Array.isArray(baseVal)) return baseVal;
  return [];
}

async function uploadAdminImage(file) {
  const token = localStorage.getItem('admin_token');
  const body = new FormData();
  body.append('image', file);
  if (token) {
    body.append('admin_token', token);
  }
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          'X-Admin-Token': token,
        }
      : {},
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Upload failed: ${res.status}`);
  }
  return res.json();
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { language } = useSite();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_session') === 'active' && !!localStorage.getItem('admin_token');
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [destinations, setDestinations] = useState(OUTBOUND_CONTINENTS);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('pending');

  // Package modal
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBlogCover, setIsUploadingBlogCover] = useState(false);
  const [pkgPreviewIndex, setPkgPreviewIndex] = useState(0);
  const [isPkgLibraryOpen, setIsPkgLibraryOpen] = useState(false);
  const [pkgLibraryFiles, setPkgLibraryFiles] = useState([]);
  const [isLoadingPkgLibrary, setIsLoadingPkgLibrary] = useState(false);
  const [pkgLibraryError, setPkgLibraryError] = useState('');
  const emptyPkg = { title: '', price: 0, image: '', gallery: [], duration: '', description: '', category: 'Inbound', continentId: '', countryId: '', type: 'Round', inclusions: [], exclusions: [], highlights: [], itinerary: [], route: { stops: [], path: [] }, featured: false, isHot: false, isLimitedTime: false, discountPercentage: 0, seoTitle: '', seoDescription: '' };
  const [pkgForm, setPkgForm] = useState(emptyPkg);
  const [pkgBaseSnapshot, setPkgBaseSnapshot] = useState(null);
  const [isGeocodingRoute, setIsGeocodingRoute] = useState(false);
  const [routeGeoStatus, setRouteGeoStatus] = useState('');
  const routeGenRef = useRef(0);

  // Blog modal
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const emptyBlog = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: [], category: 'Travel Tips', author: 'Serendib Travel', status: 'draft', readTime: '', seoTitle: '', seoDescription: '' };
  const [blogForm, setBlogForm] = useState(emptyBlog);
  const [blogBaseSnapshot, setBlogBaseSnapshot] = useState(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsBaseSnapshot, setSettingsBaseSnapshot] = useState(null);
  const premiumServiceKeys = ['transport', 'hotels', 'activities', 'events', 'corporate'];

  const defaultPremiumServices = [
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
  ];

  const normalizedPremiumServices = (list) => {
    const arr = Array.isArray(list) ? list.filter(Boolean) : [];
    const byKey = new Map(arr.map((s) => [s.key, s]));
    return premiumServiceKeys.map((key) => {
      const base = defaultPremiumServices.find((d) => d.key === key) || { key };
      const cur = byKey.get(key) || {};
      return {
        key,
        shortDesc: cur.shortDesc ?? base.shortDesc ?? '',
        details: cur.details ?? base.details ?? '',
        highlights: Array.isArray(cur.highlights) ? cur.highlights : (base.highlights ?? []),
        ctaLabel: cur.ctaLabel ?? base.ctaLabel ?? '',
        ctaLink: cur.ctaLink ?? base.ctaLink ?? '',
      };
    });
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = useCallback((token) => {
    setIsLoggedIn(true);
    fetchData();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_token');
  };

  // ── Data Fetch ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const requests = [
      { key: 'bookings', url: `${API_URL}/bookings`, apply: (data) => { if (Array.isArray(data)) setBookings(data); } },
      { key: 'packages', url: `${API_URL}/packages`, apply: (data) => { if (Array.isArray(data)) setPackages(data); } },
      { key: 'blogs', url: `${API_URL}/blogs?all=true`, apply: (data) => { if (Array.isArray(data)) setBlogs(data); } },
      {
        key: 'destinations',
        url: `${API_URL}/destinations`,
        apply: (data) => {
          if (Array.isArray(data)) {
            setDestinations(mergeContinentsWithFallback(data, OUTBOUND_CONTINENTS));
          }
        },
      },
      {
        key: 'settings',
        url: `${API_URL}/settings`,
        apply: (data) => {
          if (data) {
            setSiteSettings(data);
            setSettingsForm(data);
            setSettingsBaseSnapshot(data);
          }
        },
      },
      { key: 'reviews', url: `${API_URL}/reviews?all=true`, apply: (data) => { if (Array.isArray(data)) setReviews(data); } },
    ];

    const results = await Promise.allSettled(requests.map((r) => apiFetch(r.url)));
    const failures = [];

    results.forEach((result, index) => {
      const { key, apply } = requests[index];
      if (result.status === 'fulfilled') {
        apply(result.value);
      } else {
        failures.push(`${key}: ${result.reason?.message || 'request failed'}`);
      }
    });

    if (failures.length) {
      setError(failures.join(' · '));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, fetchData]);

  // When the admin UI language changes, show that language's settings fields
  // (but keep the underlying base snapshot immutable for safe saving).
  useEffect(() => {
    if (!siteSettings) return;
    const base = settingsBaseSnapshot || siteSettings || {};
    const bucket = getLocalizationBucket(base, language);
    // Merge only for editing convenience; saving logic decides whether to write base or a language bucket.
    setSettingsForm((prev) => ({
      ...base,
      ...bucket,
      // preserve localizations object
      localizations: base.localizations || prev?.localizations || {},
    }));
  }, [language, siteSettings, settingsBaseSnapshot]);

  // ── Bookings ──────────────────────────────────────────────────────────────
  const handleOpenBookingModal = (booking) => {
    setCurrentBooking(booking);
    setIsBookingModalOpen(true);
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await apiFetch(`${API_URL}/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) { alert(err.message); }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking forever?')) return;
    try {
      await apiFetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) { alert(err.message); }
  };

  // ── Packages ──────────────────────────────────────────────────────────────
  const normalizeRoute = (route) => {
    if (!route || typeof route !== 'object') return { stops: [], path: [] };
    const stops = Array.isArray(route.stops) ? route.stops.filter((s) => Number.isFinite(Number(s?.lat)) && Number.isFinite(Number(s?.lng))) : [];
    const path = Array.isArray(route.path) && route.path.length
      ? route.path.filter((p) => Number.isFinite(Number(p?.lat)) && Number.isFinite(Number(p?.lng)))
      : stops.map((s) => ({ lat: s.lat, lng: s.lng }));
    return { stops, path };
  };

  const handleOpenPkgModal = (pkg = null) => {
    setCurrentPackage(pkg);
    setPkgPreviewIndex(0);
    setIsPkgLibraryOpen(false);
    setPkgLibraryError('');
    setRouteGeoStatus('');
    setIsGeocodingRoute(false);
    routeGenRef.current += 1;

    const existingRoute = normalizeRoute(pkg?.route);

    // Keep an immutable snapshot of the base (English/source) fields so that
    // saving while viewing a different language only updates `localizations[lang]`
    // without overwriting the base content.
    setPkgBaseSnapshot(pkg ? {
      title: pkg.title || '',
      price: pkg.price || 0,
      image: pkg.image || '',
      gallery: pkg.gallery || pkg.images || [],
      duration: pkg.duration || '',
      description: pkg.description || '',
      category: pkg.category || 'Inbound',
      continentId: pkg.continentId || '',
      countryId: pkg.countryId || '',
      type: pkg.type || 'Round',
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
      exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : [],
      highlights: Array.isArray(pkg.highlights) ? pkg.highlights : [],
      itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary : [],
      route: existingRoute,
      featured: !!pkg.featured,
      isHot: !!pkg.isHot,
      isLimitedTime: !!pkg.isLimitedTime,
      discountPercentage: pkg.discountPercentage || 0,
      seoTitle: pkg.seoTitle || '',
      seoDescription: pkg.seoDescription || '',
      localizations: (pkg && typeof pkg.localizations === 'object' && pkg.localizations) ? pkg.localizations : {},
    } : null);

    const localized = pkg ? {
      ...getPackageLocalizationFallback(pkg, language),
      ...getLocalizationBucket(pkg, language),
    } : {};

    // When viewing the admin portal in a non-English language, edit that language's
    // bucket if present; otherwise fall back to base fields for convenience.
    setPkgForm(pkg ? {
      title: pickLocalizedField(localized.title, pkg.title),
      price: pkg.price || 0,
      image: pkg.image || '',
      gallery: pkg.gallery || pkg.images || [],
      duration: pickLocalizedField(localized.duration, pkg.duration),
      description: pickLocalizedField(localized.description, pkg.description),
      category: pickLocalizedField(localized.category, pkg.category) || 'Inbound',
      continentId: pkg.continentId || '',
      countryId: pkg.countryId || '',
      type: pickLocalizedField(localized.type, pkg.type) || 'Round',
      inclusions: pickLocalizedArray(localized.inclusions, pkg.inclusions),
      exclusions: pickLocalizedArray(localized.exclusions, pkg.exclusions),
      highlights: pickLocalizedArray(localized.highlights, pkg.highlights),
      itinerary: pickLocalizedArray(localized.itinerary, pkg.itinerary),
      route: existingRoute,
      featured: pkg.featured || false,
      isHot: pkg.isHot || false,
      isLimitedTime: pkg.isLimitedTime || false,
      discountPercentage: pkg.discountPercentage || 0,
      seoTitle: pickLocalizedField(localized.seoTitle, pkg.seoTitle),
      seoDescription: pickLocalizedField(localized.seoDescription, pkg.seoDescription),
    } : emptyPkg);
    setIsPkgModalOpen(true);
  };

  // Auto-generate day-by-day tour route whenever itinerary place names change
  useEffect(() => {
    if (!isPkgModalOpen) return;

    const itinerary = Array.isArray(pkgForm.itinerary) ? pkgForm.itinerary : [];
    const dayStops = extractDayStopsFromItinerary(itinerary);
    const labelsKey = dayStops.map((s) => s.label).join('|').toLowerCase();
    const hasAnyText = itinerary.some((line) => String(line ?? '').trim());

    if (!dayStops.length) {
      if (!hasAnyText) {
        setPkgForm((p) => {
          const current = normalizeRoute(p.route);
          if (!current.stops.length) return p;
          return { ...p, route: { stops: [], path: [] } };
        });
        setRouteGeoStatus('');
      } else {
        setRouteGeoStatus('Add place names (e.g. Day 1: Sigiriya) — press Enter for the next day');
      }
      setIsGeocodingRoute(false);
      return;
    }

    const currentStops = normalizeRoute(pkgForm.route).stops;
    const currentLabelsKey = currentStops.map((s) => String(s.label || '').trim()).join('|').toLowerCase();
    if (labelsKey === currentLabelsKey && currentStops.length === dayStops.length) {
      setRouteGeoStatus(`${currentStops.length} day${currentStops.length === 1 ? '' : 's'} on map`);
      return;
    }

    const gen = ++routeGenRef.current;
    const timer = setTimeout(async () => {
      setIsGeocodingRoute(true);
      setRouteGeoStatus('Finding day locations on map…');
      try {
        const route = await buildRouteFromItinerary(itinerary, {
          countryCode: countryCodeForPackage(pkgForm),
        });
        if (gen !== routeGenRef.current) return;
        setPkgForm((p) => ({ ...p, route }));
        if (route.stops.length) {
          setRouteGeoStatus(`${route.stops.length} of ${dayStops.length} day${dayStops.length === 1 ? '' : 's'} plotted`);
        } else {
          setRouteGeoStatus('No places found — use clear place names (e.g. Day 1: Sigiriya)');
        }
      } catch {
        if (gen !== routeGenRef.current) return;
        setRouteGeoStatus('Could not look up locations. Check your connection and try again.');
      } finally {
        if (gen === routeGenRef.current) setIsGeocodingRoute(false);
      }
    }, 700);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when itinerary / destination context changes
  }, [isPkgModalOpen, pkgForm.itinerary, pkgForm.category, pkgForm.countryId]);

  const openPkgLibrary = async () => {
    setIsPkgLibraryOpen(true);
    setIsLoadingPkgLibrary(true);
    setPkgLibraryError('');
    try {
      const res = await apiFetch(`${API_URL}/uploads?type=packages`);
      setPkgLibraryFiles(Array.isArray(res?.files) ? res.files : []);
    } catch (err) {
      setPkgLibraryError(err.message || 'Failed to load library');
      setPkgLibraryFiles([]);
    } finally {
      setIsLoadingPkgLibrary(false);
    }
  };

  const addFromPkgLibrary = (pathOrUrl) => {
    if (!pathOrUrl) return;
    setPkgForm((p) => {
      const prev = Array.isArray(p.gallery) ? p.gallery : [];
      if (prev.includes(pathOrUrl)) return p;
      if (prev.length >= 5) return p;
      const next = [...prev, pathOrUrl].slice(0, 5);
      return { ...p, gallery: next, image: next[0] || p.image || '' };
    });
  };

  const handlePkgCoverFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const onlyImages = files.filter((f) => f && typeof f.type === 'string' && f.type.startsWith('image/'));
    if (onlyImages.length !== files.length) {
      alert('Please choose image files only (JPEG, PNG, WebP, or GIF).');
    }

    const currentCount = Array.isArray(pkgForm.gallery) ? pkgForm.gallery.length : 0;
    const availableSlots = Math.max(0, 5 - currentCount);
    const selected = onlyImages.slice(0, availableSlots);

    if (!selected.length) {
      alert('You can upload up to 5 photos.');
      return;
    }

    setIsUploadingCover(true);
    try {
      const uploadedUrls = [];
      for (const file of selected) {
        const { url } = await uploadAdminImage(file);
        if (url) uploadedUrls.push(url);
      }

      setPkgForm((p) => {
        const prevGallery = Array.isArray(p.gallery) ? p.gallery : [];
        const nextGallery = [...prevGallery, ...uploadedUrls].slice(0, 5);
        return {
          ...p,
          gallery: nextGallery,
          image: nextGallery[0] || p.image || '',
        };
      });
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    const gallery = Array.isArray(pkgForm.gallery) ? pkgForm.gallery.filter(Boolean) : [];
    const cover = String(gallery[0] || pkgForm.image || '').trim();
    if (!cover) {
      alert('Please upload at least 1 tour photo.');
      return;
    }
    if (pkgForm.category === 'Outbound' && (!pkgForm.continentId || !pkgForm.countryId)) {
      alert('Please select a Region and Country so this tour appears on the Destinations page.');
      return;
    }
    setIsSaving(true);
    try {
      const method = currentPackage ? 'PUT' : 'POST';
      const url = currentPackage ? `${API_URL}/packages/${currentPackage._id}` : `${API_URL}/packages`;

      const isNonEnglish = String(language || 'en').toLowerCase() !== 'en';
      const destinationFields = pkgForm.category === 'Outbound'
        ? { continentId: pkgForm.continentId || '', countryId: pkgForm.countryId || '' }
        : { continentId: '', countryId: '' };
      const makeBucket = (form) => ({
        title: form.title || '',
        description: form.description || '',
        duration: form.duration || '',
        type: form.type || '',
        category: form.category || '',
        highlights: cleanTextLines(form.highlights),
        inclusions: cleanTextLines(form.inclusions),
        exclusions: cleanTextLines(form.exclusions),
        itinerary: cleanTextLines(form.itinerary),
        seoTitle: form.seoTitle || '',
        seoDescription: form.seoDescription || '',
      });

      let payload;
      if (isNonEnglish && currentPackage) {
        const base = pkgBaseSnapshot || {};
        const existingLocalizations = (base.localizations && typeof base.localizations === 'object')
          ? base.localizations
          : (currentPackage.localizations && typeof currentPackage.localizations === 'object' ? currentPackage.localizations : {});

        payload = {
          // keep base/original fields intact
          ...base,
          // always keep these canonical media + price/flags in sync
          price: pkgForm.price,
          featured: !!pkgForm.featured,
          isHot: !!pkgForm.isHot,
          isLimitedTime: !!pkgForm.isLimitedTime,
          discountPercentage: pkgForm.discountPercentage || 0,
          expiryDate: pkgForm.expiryDate ?? base.expiryDate ?? null,
          gallery,
          image: cover,
          category: pkgForm.category || base.category || 'Inbound',
          route: normalizeRoute(pkgForm.route),
          ...destinationFields,
          // update only the active language bucket
          localizations: {
            ...(existingLocalizations || {}),
            [language]: {
              ...(existingLocalizations?.[language] || {}),
              ...makeBucket(pkgForm),
            },
          },
        };
      } else {
        // English (or creating a package): save as base, and optionally seed the bucket too.
        payload = {
          ...pkgForm,
          ...destinationFields,
          gallery,
          image: cover,
          route: normalizeRoute(pkgForm.route),
          itinerary: cleanTextLines(pkgForm.itinerary),
          highlights: cleanTextLines(pkgForm.highlights),
          inclusions: cleanTextLines(pkgForm.inclusions),
          exclusions: cleanTextLines(pkgForm.exclusions),
          localizations: isNonEnglish
            ? {
                ...((currentPackage && typeof currentPackage.localizations === 'object' && currentPackage.localizations) ? currentPackage.localizations : {}),
                [language]: {
                  ...(((currentPackage && currentPackage.localizations && currentPackage.localizations[language]) || {})),
                  ...makeBucket(pkgForm),
                },
              }
            : (currentPackage?.localizations || pkgForm.localizations),
        };
      }
      const saved = await apiFetch(url, { method, body: JSON.stringify(payload) });
      setPackages(prev => currentPackage ? prev.map(p => p._id === saved._id ? saved : p) : [...prev, saved]);
      setIsPkgModalOpen(false);
    } catch (err) { alert(err.message); }
    finally { setIsSaving(false); }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this tour package?')) return;
    try {
      await apiFetch(`${API_URL}/packages/${id}`, { method: 'DELETE' });
      setPackages(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert(err.message); }
  };

  // ── Blogs ─────────────────────────────────────────────────────────────────
  const handleOpenBlogModal = (blog = null) => {
    setCurrentBlog(blog);
    const isNonEnglish = normalizeLanguageCode(language) !== 'en';
    setBlogBaseSnapshot(blog ? ({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      coverImage: blog.coverImage || '',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      category: blog.category || 'Travel Tips',
      author: blog.author || 'Serendib Travel',
      status: blog.status || 'draft',
      readTime: blog.readTime || '',
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      localizations: (blog && typeof blog.localizations === 'object' && blog.localizations) ? blog.localizations : {},
    }) : null);

    const localized = blog ? getLocalizationBucket(blog, language) : {};
    setBlogForm(blog ? {
      title: pickLocalizedField(localized.title, blog.title),
      slug: blog.slug || '',
      excerpt: pickLocalizedField(localized.excerpt, blog.excerpt),
      content: pickLocalizedField(localized.content, blog.content),
      coverImage: blog.coverImage || '',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      category: pickLocalizedField(localized.category, blog.category) || 'Travel Tips',
      author: pickLocalizedField(localized.author, blog.author) || 'Serendib Travel',
      status: blog.status || 'draft',
      readTime: pickLocalizedField(localized.readTime, blog.readTime),
      seoTitle: pickLocalizedField(localized.seoTitle, blog.seoTitle),
      seoDescription: pickLocalizedField(localized.seoDescription, blog.seoDescription),
    } : emptyBlog);
    setIsBlogModalOpen(true);
  };

  const handleBlogCoverFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }
    setIsUploadingBlogCover(true);
    try {
      const { url } = await uploadAdminImage(file);
      setBlogForm(p => ({ ...p, coverImage: url }));
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploadingBlogCover(false);
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = currentBlog ? 'PUT' : 'POST';
      const url = currentBlog ? `${API_URL}/blogs/${currentBlog._id}` : `${API_URL}/blogs`;
      const isNonEnglish = normalizeLanguageCode(language) !== 'en';
      const makeBucket = (form) => ({
        title: form.title || '',
        excerpt: form.excerpt || '',
        content: form.content || '',
        category: form.category || '',
        author: form.author || '',
        readTime: form.readTime || '',
        seoTitle: form.seoTitle || '',
        seoDescription: form.seoDescription || '',
      });

      let payload;
      if (isNonEnglish && currentBlog) {
        const base = blogBaseSnapshot || {};
        const existingLocalizations = (base.localizations && typeof base.localizations === 'object')
          ? base.localizations
          : (currentBlog.localizations && typeof currentBlog.localizations === 'object' ? currentBlog.localizations : {});

        payload = {
          // keep base/original fields intact
          ...base,
          // keep canonical fields in sync across languages
          coverImage: blogForm.coverImage || base.coverImage || '',
          tags: Array.isArray(blogForm.tags) ? blogForm.tags : (base.tags || []),
          status: blogForm.status || base.status || 'draft',
          // update only the active language bucket
          localizations: {
            ...(existingLocalizations || {}),
            [language]: {
              ...(existingLocalizations?.[language] || {}),
              ...makeBucket(blogForm),
            },
          },
        };
      } else {
        // English (or creating): save as base, and optionally seed the bucket too.
        payload = {
          ...blogForm,
          localizations: isNonEnglish
            ? {
                ...((currentBlog && typeof currentBlog.localizations === 'object' && currentBlog.localizations) ? currentBlog.localizations : {}),
                [language]: {
                  ...(((currentBlog && currentBlog.localizations && currentBlog.localizations[language]) || {})),
                  ...makeBucket(blogForm),
                },
              }
            : (currentBlog?.localizations || blogForm.localizations),
        };
      }

      const saved = await apiFetch(url, { method, body: JSON.stringify(payload) });
      setBlogs(prev => currentBlog ? prev.map(b => b._id === saved._id ? saved : b) : [...prev, saved]);
      setIsBlogModalOpen(false);
    } catch (err) { alert(err.message); }
    finally { setIsSaving(false); }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await apiFetch(`${API_URL}/blogs/${id}`, { method: 'DELETE' });
      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) { alert(err.message); }
  };

  // ── Settings ──────────────────────────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const isNonEnglish = normalizeLanguageCode(language) !== 'en';

      // Only these fields are language-dependent; contact links, emails, phone etc. remain global.
      const makeBucket = (form) => ({
        heroTitle: form.heroTitle || '',
        heroSubtitle: form.heroSubtitle || '',
        aboutTitle: form.aboutTitle || '',
        aboutText: form.aboutText || '',
        contactAddress: form.contactAddress || '',
        announcementText: form.announcementText || '',
        companyName: form.companyName || '',
        companyTagline: form.companyTagline || '',
        footerText: form.footerText || '',
        seoTitle: form.seoTitle || '',
        seoDescription: form.seoDescription || '',
        premiumServices: Array.isArray(form.premiumServices) ? form.premiumServices : [],
      });

      let payload;
      if (isNonEnglish && settingsBaseSnapshot) {
        const base = settingsBaseSnapshot || {};
        const existingLocalizations = (base.localizations && typeof base.localizations === 'object')
          ? base.localizations
          : (settingsForm.localizations && typeof settingsForm.localizations === 'object' ? settingsForm.localizations : {});

        payload = {
          ...base,
          // Keep global/canonical fields in sync
          heroImages: settingsForm.heroImages || base.heroImages || [],
          partnerLogos: settingsForm.partnerLogos || base.partnerLogos || [],
          featuredTourIds: settingsForm.featuredTourIds || base.featuredTourIds || [],
          announcementEnabled: !!settingsForm.announcementEnabled,
          announcementLink: settingsForm.announcementLink || base.announcementLink || '',
          contactEmail: settingsForm.contactEmail || base.contactEmail || '',
          contactPhone: settingsForm.contactPhone || base.contactPhone || '',
          contactWhatsApp: settingsForm.contactWhatsApp || base.contactWhatsApp || '',
          socialFacebook: settingsForm.socialFacebook || base.socialFacebook || '',
          socialInstagram: settingsForm.socialInstagram || base.socialInstagram || '',
          socialTwitter: settingsForm.socialTwitter || base.socialTwitter || '',
          socialYoutube: settingsForm.socialYoutube || base.socialYoutube || '',
          socialTripAdvisor: settingsForm.socialTripAdvisor || base.socialTripAdvisor || '',
          companyLogo: settingsForm.companyLogo || base.companyLogo || '',
          localizations: {
            ...(existingLocalizations || {}),
            [language]: {
              ...(existingLocalizations?.[language] || {}),
              ...makeBucket(settingsForm),
            },
          },
        };
      } else {
        payload = {
          ...settingsForm,
          localizations: isNonEnglish
            ? {
                ...((settingsForm && typeof settingsForm.localizations === 'object' && settingsForm.localizations) ? settingsForm.localizations : {}),
                [language]: {
                  ...(((settingsForm && settingsForm.localizations && settingsForm.localizations[language]) || {})),
                  ...makeBucket(settingsForm),
                },
              }
            : settingsForm.localizations,
        };
      }

      const saved = await apiFetch(`${API_URL}/settings`, { method: 'PUT', body: JSON.stringify(payload) });
      setSiteSettings(saved);
      setSettingsForm(saved);
      setSettingsBaseSnapshot(saved);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) { alert(err.message); }
    finally { setIsSavingSettings(false); }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const stats = {
    totalBookings: bookings.length,
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (b.totalPrice || 0), 0),
    avgTourPrice: packages.length > 0 ? packages.reduce((acc, p) => acc + (p.price || 0), 0) / packages.length : 0,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    pendingReviews: reviews.filter(r => r.status === 'pending').length,
  };

  const approveReview = async (id) => {
    try {
      const updated = await apiFetch(`${API_URL}/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) });
      setReviews((prev) => prev.map((r) => r._id === id ? updated : r));
    } catch (err) {
      alert(err.message);
    }
  };

  const rejectReview = async (id) => {
    if (!window.confirm('Reject and delete this review?')) return;
    try {
      await apiFetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = bookingFilter === 'all' || b.status === bookingFilter;
    const matchesSearch = (b.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (b.tourTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar" style={{ width: '280px', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
        <div style={{ padding: '0 0.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'hsl(var(--primary))', borderRadius: '0.5rem' }}></div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>Serendib</h2>
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CMS Portal</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<Calendar size={20} />} label="Bookings" badge={stats.pendingBookings || null} />
          <NavItem active={activeTab === 'tours'} onClick={() => setActiveTab('tours')} icon={<Briefcase size={20} />} label="Tour Packages" />
          <NavItem active={activeTab === 'destinations'} onClick={() => setActiveTab('destinations')} icon={<Globe size={20} />} label="Destinations" />
          <NavItem active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={<BookOpen size={20} />} label="Blog Posts" />
          <NavItem active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<Star size={20} />} label="Reviews" badge={stats.pendingReviews || null} />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Site Settings" />
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button onClick={() => window.open('/', '_blank')} className="admin-nav-item" style={{ color: '#64748b', marginBottom: '0.5rem' }}>
            <ExternalLink size={18} /><span>View Site</span>
          </button>
          <button onClick={handleLogout} className="admin-nav-item" style={{ color: '#ef4444' }}>
            <LogOut size={20} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '3rem', marginLeft: '280px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'bookings' && 'Bookings'}
              {activeTab === 'tours' && 'Tour Packages'}
              {activeTab === 'destinations' && 'Destinations'}
              {activeTab === 'blogs' && 'Blog Posts'}
              {activeTab === 'reviews' && 'Reviews'}
              {activeTab === 'settings' && 'Site Settings'}
            </h1>
            <p style={{ color: '#64748b' }}>Welcome back, Admin.</p>
          </div>
          <button onClick={fetchData} className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <RefreshCcw size={18} /> Sync
          </button>
        </header>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', borderRadius: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontWeight: 600 }}>
            <AlertCircle size={20} />
            <span>Some data could not be loaded: {error}</span>
          </div>
        )}

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '6rem' }}>
            <div className="loader" style={{ margin: '0 auto' }} />
          </div>
        )}

        {!isLoading && (
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <StatCard label="Total Revenue" value={formatMoney(stats.revenue, 'USD')} icon={<DollarSign size={24} />} trend="+12.5%" className="stat-gradient-1" />
                  <StatCard label="Total Bookings" value={stats.totalBookings} icon={<Users size={24} />} trend="+4 this week" className="stat-gradient-2" />
                  <StatCard label="Pending" value={stats.pendingBookings} icon={<Clock size={24} />} className="stat-gradient-3" />
                  <StatCard label="Blog Posts" value={blogs.length} icon={<BookOpen size={24} />} className="stat-gradient-4" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '2rem' }}>Revenue Trend</h3>
                    <RevenueChart data={[
                      { label: 'Mon', value: 1200 }, { label: 'Tue', value: 1900 },
                      { label: 'Wed', value: 1500 }, { label: 'Thu', value: 2500 },
                      { label: 'Fri', value: 2200 }, { label: 'Sat', value: 3800 },
                      { label: 'Sun', value: 4200 },
                    ]} />
                  </div>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '2rem' }}>Tour Categories</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                      <CategoryDistribution data={[
                        { label: 'Inbound', value: packages.filter(p => p.category === 'Inbound').length, color: 'hsl(var(--primary))' },
                        { label: 'Outbound', value: packages.filter(p => p.category === 'Outbound').length, color: '#6366f1' },
                      ]} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Recent Bookings</h3>
                    {bookings.slice(0, 5).map(b => (
                      <div key={b._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{b.clientName}</p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.tourTitle}</p>
                        </div>
                        <div className={`badge badge-${b.status}`} style={{ fontSize: '0.65rem' }}>{b.status}</div>
                      </div>
                    ))}
                  </div>
                  <div className="admin-card">
                    <h3 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Latest Blog Posts</h3>
                    {blogs.slice(0, 5).map(b => (
                      <div key={b._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: b.coverImage ? `url(${mediaUrl(b.coverImage)}) center/cover` : 'linear-gradient(135deg,hsl(var(--primary)),#6366f1)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{b.title}</p>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{b.category}</p>
                        </div>
                        <span style={{ fontSize: '0.65rem', padding: '0.25rem 0.6rem', borderRadius: '1rem', background: b.status === 'published' ? '#f0fdf4' : '#f1f5f9', color: b.status === 'published' ? '#15803d' : '#64748b', fontWeight: '700' }}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                    {blogs.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No blog posts yet. Create one in the Blog tab.</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── BOOKINGS ── */}
            {activeTab === 'bookings' && (
              <motion.div key="bookings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="admin-card" style={{ padding: '0' }}>
                  <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                        <button key={f} onClick={() => setBookingFilter(f)} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', backgroundColor: bookingFilter === f ? '#0f172a' : '#f1f5f9', color: bookingFilter === f ? 'white' : '#64748b', border: 'none', fontWeight: '700', fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {f} {f !== 'all' ? `(${bookings.filter(b => b.status === f).length})` : ''}
                        </button>
                      ))}
                    </div>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                      <input type="text" placeholder="Search..." className="form-control" style={{ paddingLeft: '3rem', borderRadius: '0.75rem', background: '#f8fafc' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th><th>Tour Package</th><th>Status</th><th>Price</th><th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b._id}>
                            <td>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>{b.clientName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.email}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '700', color: 'hsl(var(--primary))' }}>{b.tourTitle}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(b.bookingDate).toLocaleDateString()}</div>
                            </td>
                            <td><div className={`badge badge-${b.status}`}>{b.status}</div></td>
                            <td><div style={{ fontWeight: '800' }}>{formatMoney(b.totalPrice || 0, 'USD')}</div></td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleOpenBookingModal(b)}
                                  className="btn"
                                  title="View details"
                                  style={{ background: '#f1f5f9', color: '#475569', padding: '0.5rem' }}
                                >
                                  <Eye size={18} />
                                </button>
                                {b.status === 'pending' && (
                                  <button onClick={() => updateBookingStatus(b._id, 'confirmed')} className="btn" style={{ background: '#f0fdf4', color: '#15803d', padding: '0.5rem' }}>
                                    <CheckCircle2 size={18} />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteBooking(b._id)} className="btn" style={{ background: '#fef2f2', color: '#ef4444', padding: '0.5rem' }}>
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No bookings found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TOURS ── */}
            {activeTab === 'tours' && (
              <motion.div key="tours" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <p style={{ color: '#64748b' }}>{packages.length} tour packages</p>
                  <button onClick={() => handleOpenPkgModal()} className="btn btn-primary" style={{ gap: '0.75rem' }}>
                    <Plus size={20} /> Create New Package
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                  {packages.map(p => (
                    <div key={p._id} className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                      {(() => {
                        const localized = {
                          ...getPackageLocalizationFallback(p, language),
                          ...getLocalizationBucket(p, language),
                        };
                        const displayTitle = localized.title || p.title;
                        const displayDuration = localized.duration || p.duration;
                        const displayType = localized.type || p.type;
                        const displayCategory = localized.category || p.category;
                        const destinationLabel = (() => {
                          if (displayCategory !== 'Outbound' || !p.countryId) return '';
                          const continent = destinations.find((c) => c.id === p.continentId);
                          const country = continent?.countries?.find((c) => c.id === p.countryId);
                          if (!country) return '';
                          return continent ? `${continent.name} · ${country.name}` : country.name;
                        })();

                        return (
                          <>
                      <div style={{ position: 'relative', height: '180px' }}>
                        <img src={mediaUrl(p.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                          <span style={{ background: '#0f172a', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '800' }}>{displayCategory}</span>
                          {p.featured && <span style={{ background: '#f59e0b', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '800' }}>⭐ Featured</span>}
                          {p.isHot && <span style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '800' }}>🔥 Hot</span>}
                        </div>
                      </div>
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.35rem', color: '#0f172a' }}>{displayTitle}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: destinationLabel ? '0.35rem' : '1rem' }}>{displayDuration} · {displayType}</p>
                        {destinationLabel && (
                          <p style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, marginBottom: '1rem' }}>{destinationLabel}</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a' }}>
                            {formatMoney(p.price || 0, 'USD')}
                          </span>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleOpenPkgModal(p)} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9', color: '#64748b' }}><Pencil size={16} /></button>
                            <button onClick={() => handleDeletePackage(p._id)} className="btn" style={{ padding: '0.5rem', background: '#fef2f2', color: '#ef4444' }}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                  {packages.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                      <Briefcase size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p>No tour packages yet. Create your first one!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── DESTINATIONS ── */}
            {activeTab === 'destinations' && (
              <AdminDestinationsTab continents={destinations} onContinentsChange={setDestinations} />
            )}

            {/* ── BLOGS ── */}
            {activeTab === 'blogs' && (
              <motion.div key="blogs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <p style={{ color: '#64748b' }}>{blogs.length} posts · {blogs.filter(b => b.status === 'published').length} published</p>
                  <button onClick={() => handleOpenBlogModal()} className="btn btn-primary" style={{ gap: '0.75rem' }}>
                    <Plus size={20} /> New Blog Post
                  </button>
                </div>
                <div className="admin-card" style={{ padding: '0' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Post</th><th>Category</th><th>Status</th><th>Published</th><th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map(b => (
                        <tr key={b._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '48px', height: '36px', borderRadius: '0.5rem', background: b.coverImage ? `url(${mediaUrl(b.coverImage)}) center/cover` : 'linear-gradient(135deg,hsl(var(--primary)),#6366f1)', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{b.title}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/{b.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '700' }}>{b.category}</span></td>
                          <td>
                            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '800', background: b.status === 'published' ? '#f0fdf4' : '#f8fafc', color: b.status === 'published' ? '#15803d' : '#64748b' }}>
                              {b.status === 'published' ? '✓ Published' : '◦ Draft'}
                            </span>
                          </td>
                          <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                            {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              {b.status === 'published' && (
                                <a href={`/blog/${b.slug}`} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.5rem', background: '#f0fdf4', color: '#15803d' }}>
                                  <ExternalLink size={16} />
                                </a>
                              )}
                              <button onClick={() => handleOpenBlogModal(b)} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9', color: '#64748b' }}><Pencil size={16} /></button>
                              <button onClick={() => handleDeleteBlog(b._id)} className="btn" style={{ padding: '0.5rem', background: '#fef2f2', color: '#ef4444' }}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {blogs.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                          <BookOpen size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
                          No blog posts yet
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── REVIEWS ── */}
            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>
                    {reviews.length} total · {reviews.filter(r => r.status === 'approved').length} approved · {reviews.filter(r => r.status === 'pending').length} pending
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['pending', 'approved', 'all'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setReviewFilter(f)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.75rem',
                          backgroundColor: reviewFilter === f ? '#0f172a' : '#f1f5f9',
                          color: reviewFilter === f ? 'white' : '#64748b',
                          border: 'none',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-card" style={{ padding: 0 }}>
                  <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Review</th>
                          <th>Photos</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews
                          .filter((r) => reviewFilter === 'all' || r.status === reviewFilter)
                          .map((r) => (
                            <tr key={r._id}>
                              <td style={{ maxWidth: 520 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    <div style={{ fontWeight: '900', color: '#0f172a' }}>{r.name || '—'}</div>
                                    {r.location && (
                                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>
                                        {r.location}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    {Array.from({ length: Math.max(1, Math.min(5, Number(r.rating) || 0)) }).map((_, i) => (
                                      <Star key={i} size={14} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                                    ))}
                                  </div>
                                  <div style={{ color: '#475569', lineHeight: 1.5 }}>
                                    {String(r.text || '').slice(0, 220)}{String(r.text || '').length > 220 ? '…' : ''}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  {(Array.isArray(r.photos) ? r.photos : []).slice(0, 3).map((p, idx) => (
                                    <a key={`${p}-${idx}`} href={mediaUrl(p)} target="_blank" rel="noreferrer" title="Open photo">
                                      <div
                                        style={{
                                          width: 46,
                                          height: 36,
                                          borderRadius: '0.5rem',
                                          border: '1px solid #e2e8f0',
                                          background: `url(${mediaUrl(p)}) center/cover`,
                                        }}
                                      />
                                    </a>
                                  ))}
                                  {Array.isArray(r.photos) && r.photos.length > 3 && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b' }}>
                                      +{r.photos.length - 3}
                                    </div>
                                  )}
                                  {(!Array.isArray(r.photos) || r.photos.length === 0) && (
                                    <div style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.85rem' }}>—</div>
                                  )}
                                </div>
                              </td>

                              <td>
                                <span
                                  style={{
                                    padding: '0.3rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '900',
                                    background: r.status === 'approved' ? '#f0fdf4' : '#fff7ed',
                                    color: r.status === 'approved' ? '#15803d' : '#9a3412',
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {r.status || 'pending'}
                                </span>
                              </td>

                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  {r.status === 'pending' && (
                                    <button
                                      onClick={() => approveReview(r._id)}
                                      className="btn"
                                      style={{ background: '#f0fdf4', color: '#15803d', padding: '0.5rem' }}
                                      title="Approve"
                                    >
                                      <CheckCircle2 size={18} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => rejectReview(r._id)}
                                    className="btn"
                                    style={{ background: '#fef2f2', color: '#ef4444', padding: '0.5rem' }}
                                    title="Reject & delete"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                        {reviews.filter((r) => reviewFilter === 'all' || r.status === reviewFilter).length === 0 && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 800 }}>
                              No reviews found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <form onSubmit={handleSaveSettings}>
                  <SettingsSection title="Hero Section" icon={<Globe size={18} />}>
                    <FormField label="Hero Title">
                      <input className="form-control" value={settingsForm.heroTitle || ''} onChange={e => setSettingsForm(p => ({ ...p, heroTitle: e.target.value }))} placeholder="e.g. Discover Sri Lanka's Hidden Paradise" />
                    </FormField>
                    <FormField label="Hero Subtitle">
                      <textarea className="form-control" rows={3} value={settingsForm.heroSubtitle || ''} onChange={e => setSettingsForm(p => ({ ...p, heroSubtitle: e.target.value }))} style={{ resize: 'vertical' }} />
                    </FormField>
                    <FormField label="Hero Background Image URL (primary)">
                      <input className="form-control" value={(settingsForm.heroImages || [])[0] || ''} onChange={e => setSettingsForm(p => ({ ...p, heroImages: [e.target.value, ...(p.heroImages || []).slice(1)] }))} placeholder="https://..." />
                    </FormField>
                  </SettingsSection>

                  <SettingsSection title="Company Info" icon={<Briefcase size={18} />}>
                    <div className="grid-2">
                      <FormField label="Company Name">
                        <input className="form-control" value={settingsForm.companyName || ''} onChange={e => setSettingsForm(p => ({ ...p, companyName: e.target.value }))} />
                      </FormField>
                      <FormField label="Tagline">
                        <input className="form-control" value={settingsForm.companyTagline || ''} onChange={e => setSettingsForm(p => ({ ...p, companyTagline: e.target.value }))} />
                      </FormField>
                    </div>
                    <FormField label="Company Logo URL">
                      <input className="form-control" value={settingsForm.companyLogo || ''} onChange={e => setSettingsForm(p => ({ ...p, companyLogo: e.target.value }))} placeholder="https://..." />
                    </FormField>
                    <FormField label="About Text">
                      <textarea className="form-control" rows={4} value={settingsForm.aboutText || ''} onChange={e => setSettingsForm(p => ({ ...p, aboutText: e.target.value }))} style={{ resize: 'vertical' }} />
                    </FormField>
                  </SettingsSection>

                  <SettingsSection title="Contact Details" icon={<Phone size={18} />}>
                    <div className="grid-2">
                      <FormField label="Email">
                        <input className="form-control" type="email" value={settingsForm.contactEmail || ''} onChange={e => setSettingsForm(p => ({ ...p, contactEmail: e.target.value }))} />
                      </FormField>
                      <FormField label="Phone">
                        <input className="form-control" value={settingsForm.contactPhone || ''} onChange={e => setSettingsForm(p => ({ ...p, contactPhone: e.target.value }))} />
                      </FormField>
                      <FormField label="WhatsApp Number (digits only)">
                        <input className="form-control" value={settingsForm.contactWhatsApp || ''} onChange={e => setSettingsForm(p => ({ ...p, contactWhatsApp: e.target.value }))} placeholder="94771234567" />
                      </FormField>
                      <FormField label="Address">
                        <input className="form-control" value={settingsForm.contactAddress || ''} onChange={e => setSettingsForm(p => ({ ...p, contactAddress: e.target.value }))} />
                      </FormField>
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Social Media Links" icon={<LinkIcon size={18} />}>
                    <div className="grid-2">
                      {[
                        { key: 'socialFacebook', label: 'Facebook URL' },
                        { key: 'socialInstagram', label: 'Instagram URL' },
                        { key: 'socialTwitter', label: 'Twitter / X URL' },
                        { key: 'socialYoutube', label: 'YouTube URL' },
                        { key: 'socialTripAdvisor', label: 'TripAdvisor URL' },
                      ].map(({ key, label }) => (
                        <FormField key={key} label={label}>
                          <input className="form-control" value={settingsForm[key] || ''} onChange={e => setSettingsForm(p => ({ ...p, [key]: e.target.value }))} placeholder="https://..." />
                        </FormField>
                      ))}
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Announcement Banner" icon={<AlertCircle size={18} />}>
                    <FormField label="">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={settingsForm.announcementEnabled || false} onChange={e => setSettingsForm(p => ({ ...p, announcementEnabled: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: 'hsl(var(--primary))' }} />
                        <span style={{ fontWeight: '700', color: '#475569' }}>Enable announcement banner on site</span>
                      </label>
                    </FormField>
                    <FormField label="Banner Text">
                      <input className="form-control" value={settingsForm.announcementText || ''} onChange={e => setSettingsForm(p => ({ ...p, announcementText: e.target.value }))} placeholder="e.g. 🎉 Special 20% discount on all packages this month!" />
                    </FormField>
                    <FormField label="Banner Link (optional)">
                      <input className="form-control" value={settingsForm.announcementLink || ''} onChange={e => setSettingsForm(p => ({ ...p, announcementLink: e.target.value }))} placeholder="https://..." />
                    </FormField>
                  </SettingsSection>

                  <SettingsSection title="SEO Defaults" icon={<Search size={18} />}>
                    <FormField label="Default SEO Title">
                      <input className="form-control" value={settingsForm.seoTitle || ''} onChange={e => setSettingsForm(p => ({ ...p, seoTitle: e.target.value }))} />
                    </FormField>
                    <FormField label="Default SEO Description">
                      <textarea className="form-control" rows={3} value={settingsForm.seoDescription || ''} onChange={e => setSettingsForm(p => ({ ...p, seoDescription: e.target.value }))} style={{ resize: 'vertical' }} />
                    </FormField>
                    <FormField label="Footer Text">
                      <input className="form-control" value={settingsForm.footerText || ''} onChange={e => setSettingsForm(p => ({ ...p, footerText: e.target.value }))} />
                    </FormField>
                  </SettingsSection>

                  <SettingsSection title="Premium Services (Popup details)" icon={<Star size={18} />}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, color: '#64748b', fontWeight: 700 }}>
                        These details show in the popup when users click a service card.
                      </p>
                      <button
                        type="button"
                        className="btn"
                        style={{ background: '#f1f5f9', color: '#475569' }}
                        onClick={() => setSettingsForm((p) => ({ ...p, premiumServices: defaultPremiumServices }))}
                      >
                        Reset defaults
                      </button>
                    </div>

                    {normalizedPremiumServices(settingsForm.premiumServices).map((svc) => (
                      <div key={svc.key} style={{ border: '1px solid #e2e8f0', borderRadius: '0.9rem', padding: '1rem', background: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                          <div style={{ fontWeight: 900, color: '#0f172a', textTransform: 'capitalize' }}>{svc.key}</div>
                          <div style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.8rem' }}>Card + Popup</div>
                        </div>

                        <div className="grid-2">
                          <FormField label="Card short description">
                            <input
                              className="form-control"
                              value={svc.shortDesc || ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSettingsForm((p) => {
                                  const next = normalizedPremiumServices(p.premiumServices).map((x) => x.key === svc.key ? { ...x, shortDesc: v } : x);
                                  return { ...p, premiumServices: next };
                                });
                              }}
                              placeholder="Shown on the card"
                            />
                          </FormField>
                          <FormField label="CTA Link (optional)">
                            <input
                              className="form-control"
                              value={svc.ctaLink || ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSettingsForm((p) => {
                                  const next = normalizedPremiumServices(p.premiumServices).map((x) => x.key === svc.key ? { ...x, ctaLink: v } : x);
                                  return { ...p, premiumServices: next };
                                });
                              }}
                              placeholder="/booking or https://..."
                            />
                          </FormField>
                        </div>

                        <div className="grid-2">
                          <FormField label="CTA Label (optional)">
                            <input
                              className="form-control"
                              value={svc.ctaLabel || ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSettingsForm((p) => {
                                  const next = normalizedPremiumServices(p.premiumServices).map((x) => x.key === svc.key ? { ...x, ctaLabel: v } : x);
                                  return { ...p, premiumServices: next };
                                });
                              }}
                              placeholder="e.g. Request a quote"
                            />
                          </FormField>
                          <FormField label="Highlights (one per line)">
                            <textarea
                              className="form-control"
                              rows={4}
                              style={{ resize: 'vertical' }}
                              value={(Array.isArray(svc.highlights) ? svc.highlights : []).join('\n')}
                              onChange={(e) => {
                                const v = e.target.value.split('\n').map((x) => x.trim()).filter(Boolean);
                                setSettingsForm((p) => {
                                  const next = normalizedPremiumServices(p.premiumServices).map((x) => x.key === svc.key ? { ...x, highlights: v } : x);
                                  return { ...p, premiumServices: next };
                                });
                              }}
                              placeholder="Airport transfers&#10;Private driver&#10;Luxury options"
                            />
                          </FormField>
                        </div>

                        <FormField label="Popup details text">
                          <textarea
                            className="form-control"
                            rows={5}
                            style={{ resize: 'vertical' }}
                            value={svc.details || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setSettingsForm((p) => {
                                const next = normalizedPremiumServices(p.premiumServices).map((x) => x.key === svc.key ? { ...x, details: v } : x);
                                return { ...p, premiumServices: next };
                              });
                            }}
                            placeholder="Full details shown in popup..."
                          />
                        </FormField>
                      </div>
                    ))}
                  </SettingsSection>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    {settingsSaved && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: '700' }}>
                        <CheckCircle2 size={18} /> Settings saved!
                      </motion.span>
                    )}
                    <button type="submit" disabled={isSavingSettings} className="btn btn-primary" style={{ gap: '0.75rem', minWidth: '180px' }}>
                      {isSavingSettings ? 'Saving...' : <><Save size={18} /> Save All Settings</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ── Package Modal ── */}
      <AnimatePresence>
        {isPkgModalOpen && (
          <Modal onClose={() => setIsPkgModalOpen(false)} title={currentPackage ? 'Edit Tour Package' : 'Create New Package'}>
            <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2">
                <FormField label="Package Title"><input required className="form-control" value={pkgForm.title} onChange={e => setPkgForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Cultural Triangle Experience" /></FormField>
                <FormField label="Category">
                  <select
                    className="form-control"
                    value={pkgForm.category}
                    onChange={e => {
                      const category = e.target.value;
                      setPkgForm(p => ({
                        ...p,
                        category,
                        continentId: category === 'Outbound' ? (p.continentId || '') : '',
                        countryId: category === 'Outbound' ? (p.countryId || '') : '',
                      }));
                    }}
                  >
                    <option value="Inbound">Inbound (Sri Lanka)</option>
                    <option value="Outbound">Outbound (International)</option>
                  </select>
                </FormField>
              </div>
              {pkgForm.category === 'Outbound' && (
                <div className="grid-2">
                  <FormField label="Region (Destinations)">
                    <select
                      required
                      className="form-control"
                      value={pkgForm.continentId || ''}
                      onChange={e => setPkgForm(p => ({ ...p, continentId: e.target.value, countryId: '' }))}
                    >
                      <option value="">Select region</option>
                      {destinations.map((continent) => (
                        <option key={continent.id} value={continent.id}>{continent.name}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Country (Destinations)">
                    <select
                      required
                      className="form-control"
                      value={pkgForm.countryId || ''}
                      onChange={e => setPkgForm(p => ({ ...p, countryId: e.target.value }))}
                      disabled={!pkgForm.continentId}
                    >
                      <option value="">{pkgForm.continentId ? 'Select country' : 'Select region first'}</option>
                      {(destinations.find((c) => c.id === pkgForm.continentId)?.countries || []).map((country) => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
              )}
              <div className="grid-2">
                <FormField label="Price (USD)"><input required type="number" className="form-control" value={pkgForm.price} onChange={e => setPkgForm(p => ({ ...p, price: Number(e.target.value) }))} /></FormField>
                <FormField label="Duration"><input required className="form-control" value={pkgForm.duration} onChange={e => setPkgForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 8 Days" /></FormField>
              </div>
              <div className="grid-2">
                <FormField label="Type">
                  <select className="form-control" value={pkgForm.type} onChange={e => setPkgForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="Day">Day Trip</option>
                    <option value="Round">Round Trip</option>
                  </select>
                </FormField>
                <FormField label="Options">
                  <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '700', color: '#475569' }}>
                      <input type="checkbox" checked={pkgForm.featured} onChange={e => setPkgForm(p => ({ ...p, featured: e.target.checked }))} style={{ accentColor: 'hsl(var(--primary))' }} /> Featured
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '700', color: '#475569' }}>
                      <input type="checkbox" checked={pkgForm.isLimitedTime} onChange={e => setPkgForm(p => ({ ...p, isLimitedTime: e.target.checked }))} style={{ accentColor: 'hsl(var(--primary))' }} /> Limited Time
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '700', color: '#475569' }}>
                      <input type="checkbox" checked={pkgForm.isHot} onChange={e => setPkgForm(p => ({ ...p, isHot: e.target.checked }))} style={{ accentColor: 'hsl(var(--primary))' }} /> Hot Package (Popup)
                    </label>
                  </div>
                </FormField>
              </div>
              {pkgForm.isLimitedTime && (
                <FormField label="Discount %">
                  <input type="number" min={0} max={100} className="form-control" value={pkgForm.discountPercentage} onChange={e => setPkgForm(p => ({ ...p, discountPercentage: Number(e.target.value) }))} />
                </FormField>
              )}
              <FormField label="Cover image">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                    <input id="pkg-cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple style={{ display: 'none' }} onChange={handlePkgCoverFiles} disabled={isUploadingCover} />
                    <label htmlFor="pkg-cover-file" className="btn" style={{ cursor: isUploadingCover ? 'wait' : 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#475569' }}>
                      <Image size={18} /> {isUploadingCover ? 'Uploading…' : 'Choose up to 5 photos'}
                    </label>
                    <button
                      type="button"
                      className="btn"
                      style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfeff', color: '#155e75' }}
                      onClick={openPkgLibrary}
                      disabled={isUploadingCover}
                    >
                      <Image size={18} /> Choose from library
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                      {(Array.isArray(pkgForm.gallery) ? pkgForm.gallery.length : 0)}/5 selected
                    </span>
                  </div>
                  {(Array.isArray(pkgForm.gallery) ? pkgForm.gallery.length : 0) > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
                        <img
                          src={mediaUrl(pkgForm.gallery[pkgPreviewIndex])}
                          alt=""
                          style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}
                        />

                        {(pkgForm.gallery.length > 1) && (
                          <>
                            <button
                              type="button"
                              className="btn"
                              style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.85)',
                                color: '#0f172a',
                                border: '1px solid rgba(15,23,42,0.12)'
                              }}
                              onClick={() => setPkgPreviewIndex((i) => (i - 1 + pkgForm.gallery.length) % pkgForm.gallery.length)}
                              aria-label="Previous image"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <button
                              type="button"
                              className="btn"
                              style={{
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.85)',
                                color: '#0f172a',
                                border: '1px solid rgba(15,23,42,0.12)'
                              }}
                              onClick={() => setPkgPreviewIndex((i) => (i + 1) % pkgForm.gallery.length)}
                              aria-label="Next image"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {pkgForm.gallery.map((u, idx) => (
                          <button
                            key={`${u}-${idx}`}
                            type="button"
                            onClick={() => setPkgPreviewIndex(idx)}
                            style={{
                              width: '58px',
                              height: '40px',
                              borderRadius: '0.5rem',
                              border: idx === pkgPreviewIndex ? '2px solid hsl(var(--primary))' : '1px solid #e2e8f0',
                              background: `url(${mediaUrl(u)}) center/cover`,
                              cursor: 'pointer'
                            }}
                            aria-label={`Preview image ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', background: '#fef2f2', color: '#b91c1c' }}
                          onClick={() => {
                            setPkgForm((p) => ({ ...p, gallery: [], image: '' }));
                            setPkgPreviewIndex(0);
                          }}
                        >
                          Remove all
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', background: '#fff7ed', color: '#9a3412' }}
                          onClick={() => {
                            setPkgForm((p) => {
                              const g = Array.isArray(p.gallery) ? p.gallery : [];
                              const next = g.filter((_, i) => i !== pkgPreviewIndex);
                              return { ...p, gallery: next, image: next[0] || '' };
                            });
                            setPkgPreviewIndex((i) => Math.max(0, i - 1));
                          }}
                          disabled={!pkgForm.gallery.length}
                        >
                          Remove current
                        </button>
                      </div>
                    </div>
                  ) : (
                    pkgForm.image ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <img src={mediaUrl(pkgForm.image)} alt="" style={{ width: '120px', height: '72px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                        <button type="button" className="btn" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', background: '#fef2f2', color: '#b91c1c' }} onClick={() => setPkgForm(p => ({ ...p, image: '' }))}>Remove</button>
                      </div>
                    ) : null
                  )}
                </div>
              </FormField>

              {isPkgLibraryOpen && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.9rem', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 900, color: '#0f172a' }}>Image library (already uploaded)</div>
                    <button type="button" className="btn" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={() => setIsPkgLibraryOpen(false)}>
                      Close
                    </button>
                  </div>

                  {pkgLibraryError && (
                    <div style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '0.5rem' }}>{pkgLibraryError}</div>
                  )}

                  {isLoadingPkgLibrary ? (
                    <div style={{ color: '#475569', fontWeight: 700 }}>Loading…</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.65rem' }}>
                      {pkgLibraryFiles.map((f) => (
                        <button
                          key={f.path}
                          type="button"
                          onClick={() => addFromPkgLibrary(f.path)}
                          disabled={(Array.isArray(pkgForm.gallery) ? pkgForm.gallery.length : 0) >= 5}
                          title="Add to tour images"
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.6rem',
                            overflow: 'hidden',
                            background: '#fff',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <div style={{ width: '100%', aspectRatio: '1 / 1', background: `url(${mediaUrl(f.path)}) center/cover` }} />
                        </button>
                      ))}
                      {!pkgLibraryFiles.length && !pkgLibraryError && (
                        <div style={{ gridColumn: '1 / -1', color: '#64748b', fontWeight: 700 }}>
                          No uploaded images found yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <FormField label="Description">
                <textarea required className="form-control" rows={3} style={{ resize: 'vertical' }} value={pkgForm.description} onChange={e => setPkgForm(p => ({ ...p, description: e.target.value }))} />
              </FormField>
              <FormField label="Highlights (one per line)">
                <textarea className="form-control" rows={3} style={{ resize: 'vertical' }} value={(pkgForm.highlights || []).join('\n')} onChange={e => setPkgForm(p => ({ ...p, highlights: e.target.value.split('\n').filter(Boolean) }))} placeholder="Temple of the Tooth Relic&#10;Elephant Safari&#10;Tea Plantation Visit" />
              </FormField>
              <FormField label="Itinerary (one day per line)">
                <textarea
                  className="form-control"
                  rows={6}
                  style={{ resize: 'vertical' }}
                  value={(pkgForm.itinerary || []).map((item) => (typeof item === 'string' ? item : (item?.day ? `${item.day}: ${(item.activities || []).join(', ')}` : JSON.stringify(item)))).join('\n')}
                  onChange={(e) => setPkgForm((p) => ({ ...p, itinerary: e.target.value.split('\n') }))}
                  placeholder="Day 1: Colombo&#10;Day 2: Sigiriya&#10;Day 3: Kandy&#10;Day 4: Ella"
                />
                <div style={{ marginTop: '0.45rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 600, lineHeight: 1.4 }}>
                  Press Enter for each new day. Place names update the day-by-day route map automatically.
                </div>
              </FormField>

              <FormField label="Day-by-day route map">
                <div style={{
                  borderRadius: '0.85rem',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  minHeight: '240px',
                }}>
                  {(pkgForm.route?.stops || []).length > 0 ? (
                    <MapComponent
                      key={routeKey(pkgForm.route)}
                      stops={pkgForm.route.stops}
                      path={pkgForm.route.path || pkgForm.route.stops}
                      height="260px"
                      dayMode
                    />
                  ) : (
                    <div style={{
                      height: '240px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.25rem',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}>
                      {isGeocodingRoute
                        ? 'Locating day places…'
                        : 'Add Day 1, Day 2, Day 3… with place names to build the route'}
                    </div>
                  )}
                </div>
                {(pkgForm.route?.stops || []).length > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}>
                    {pkgForm.route.stops.map((stop, idx) => (
                      <div
                        key={`${stop.day}-${stop.label}-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#334155',
                        }}
                      >
                        <span style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'hsl(142 76% 36%)',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          flexShrink: 0,
                        }}>
                          {stop.day || idx + 1}
                        </span>
                        <span>{stop.label || `Day ${idx + 1}`}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(routeGeoStatus || isGeocodingRoute) && (
                  <div style={{ marginTop: '0.45rem', fontSize: '0.82rem', color: isGeocodingRoute ? '#0369a1' : '#64748b', fontWeight: 700 }}>
                    {routeGeoStatus}
                  </div>
                )}
              </FormField>
              <div className="grid-2">
                <FormField label="Inclusions (one per line)">
                  <textarea className="form-control" rows={4} style={{ resize: 'vertical' }} value={(pkgForm.inclusions || []).join('\n')} onChange={e => setPkgForm(p => ({ ...p, inclusions: e.target.value.split('\n').filter(Boolean) }))} placeholder="Airport transfers&#10;Accommodation&#10;Daily breakfast" />
                </FormField>
                <FormField label="Exclusions (one per line)">
                  <textarea className="form-control" rows={4} style={{ resize: 'vertical' }} value={(pkgForm.exclusions || []).join('\n')} onChange={e => setPkgForm(p => ({ ...p, exclusions: e.target.value.split('\n').filter(Boolean) }))} placeholder="International flights&#10;Visa fees&#10;Travel insurance" />
                </FormField>
              </div>
              <FormField label="SEO Title (optional)">
                <input className="form-control" value={pkgForm.seoTitle} onChange={e => setPkgForm(p => ({ ...p, seoTitle: e.target.value }))} />
              </FormField>
              <FormField label="SEO Description (optional)">
                <textarea className="form-control" rows={2} style={{ resize: 'vertical' }} value={pkgForm.seoDescription} onChange={e => setPkgForm(p => ({ ...p, seoDescription: e.target.value }))} />
              </FormField>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsPkgModalOpen(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ flex: 1, gap: '0.75rem' }}>
                  {isSaving ? 'Saving...' : <><Save size={18} /> {currentPackage ? 'Update' : 'Create'} Package</>}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Blog Modal ── */}
      <AnimatePresence>
        {isBlogModalOpen && (
          <Modal onClose={() => setIsBlogModalOpen(false)} title={currentBlog ? 'Edit Blog Post' : 'New Blog Post'} wide>
            <form onSubmit={handleSaveBlog} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FormField label="Post Title">
                <input required className="form-control" value={blogForm.title} onChange={e => {
                  const title = e.target.value;
                  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
                  setBlogForm(p => ({ ...p, title, slug }));
                }} placeholder="e.g. Top 10 Things to Do in Kandy" />
              </FormField>
              <div className="grid-2">
                <FormField label="URL Slug">
                  <input className="form-control" value={blogForm.slug} onChange={e => setBlogForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated from title" />
                </FormField>
                <FormField label="Category">
                  <input className="form-control" list="blog-categories" value={blogForm.category} onChange={e => setBlogForm(p => ({ ...p, category: e.target.value }))} />
                  <datalist id="blog-categories">
                    {['Travel Tips', 'Destinations', 'Culture', 'Food & Cuisine', 'Adventure', 'News', 'Guides'].map(c => <option key={c} value={c} />)}
                  </datalist>
                </FormField>
              </div>
              <div className="grid-2">
                <FormField label="Author">
                  <input className="form-control" value={blogForm.author} onChange={e => setBlogForm(p => ({ ...p, author: e.target.value }))} />
                </FormField>
                <FormField label="Read Time">
                  <input className="form-control" value={blogForm.readTime} onChange={e => setBlogForm(p => ({ ...p, readTime: e.target.value }))} placeholder="e.g. 5 min read" />
                </FormField>
              </div>
              <FormField label="Cover image">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                    <input id="blog-cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleBlogCoverFile} disabled={isUploadingBlogCover} />
                    <label htmlFor="blog-cover-file" className="btn" style={{ cursor: isUploadingBlogCover ? 'wait' : 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#475569' }}>
                      <Image size={18} /> {isUploadingBlogCover ? 'Uploading…' : 'Choose file'}
                    </label>
                  </div>
                  {blogForm.coverImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <img src={mediaUrl(blogForm.coverImage)} alt="" style={{ width: '120px', height: '72px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                      <button type="button" className="btn" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', background: '#fef2f2', color: '#b91c1c' }} onClick={() => setBlogForm(p => ({ ...p, coverImage: '' }))}>Remove</button>
                    </div>
                  )}
                </div>
              </FormField>
              <FormField label="Excerpt (short summary)">
                <textarea required className="form-control" rows={2} style={{ resize: 'vertical' }} value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="A short engaging summary of this article..." />
              </FormField>
              <FormField label="Content (HTML supported)">
                <textarea required className="form-control" rows={12} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem' }} value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))} placeholder="<h2>Introduction</h2><p>Your content here...</p>" />
              </FormField>
              <FormField label="Tags (comma separated)">
                <input className="form-control" value={(blogForm.tags || []).join(', ')} onChange={e => setBlogForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="sri lanka, culture, travel" />
              </FormField>
              <FormField label="Status">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['draft', 'published'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '700', color: blogForm.status === s ? 'hsl(var(--primary))' : '#475569' }}>
                      <input type="radio" name="status" value={s} checked={blogForm.status === s} onChange={e => setBlogForm(p => ({ ...p, status: e.target.value }))} style={{ accentColor: 'hsl(var(--primary))' }} />
                      {s === 'published' ? '✓ Publish' : '◦ Save as Draft'}
                    </label>
                  ))}
                </div>
              </FormField>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsBlogModalOpen(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ flex: 1, gap: '0.75rem' }}>
                  {isSaving ? 'Saving...' : <><Save size={18} /> {currentBlog ? 'Update' : 'Publish'} Post</>}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Booking Details Modal ── */}
      <AnimatePresence>
        {isBookingModalOpen && currentBooking && (
          <Modal
            onClose={() => {
              setIsBookingModalOpen(false);
              setCurrentBooking(null);
            }}
            title="Booking Details"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className={`badge badge-${currentBooking.status}`} style={{ fontSize: '0.75rem' }}>
                  {currentBooking.status}
                </span>
                {!!currentBooking._id && (
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
                    ID: {currentBooking._id}
                  </span>
                )}
              </div>

              <div className="admin-card" style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontWeight: '900' }}>
                      <Users size={18} /> Customer
                    </div>
                    <div style={{ marginTop: '0.5rem', fontWeight: '800', color: '#0f172a' }}>{currentBooking.clientName || '—'}</div>
                    <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> {currentBooking.email || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} /> {currentBooking.phone || '—'}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontWeight: '900' }}>
                      <Briefcase size={18} /> Tour
                    </div>
                    <div style={{ marginTop: '0.5rem', fontWeight: '800', color: 'hsl(var(--primary))' }}>{currentBooking.tourTitle || '—'}</div>
                    <div style={{ marginTop: '0.25rem', color: '#64748b', fontSize: '0.85rem' }}>
                      Tour ID: {currentBooking.tourId || '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="admin-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontWeight: '800', fontSize: '0.85rem' }}>
                    <Calendar size={16} /> Travel date
                  </div>
                  <div style={{ marginTop: '0.35rem', fontWeight: '900', color: '#0f172a' }}>
                    {currentBooking.bookingDate ? new Date(currentBooking.bookingDate).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div className="admin-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontWeight: '800', fontSize: '0.85rem' }}>
                    <Users size={16} /> Guests
                  </div>
                  <div style={{ marginTop: '0.35rem', fontWeight: '900', color: '#0f172a' }}>
                    {Number.isFinite(Number(currentBooking.guests)) ? Number(currentBooking.guests) : (currentBooking.guests || '—')}
                  </div>
                </div>
                <div className="admin-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontWeight: '800', fontSize: '0.85rem' }}>
                    <DollarSign size={16} /> Total price
                  </div>
                  <div style={{ marginTop: '0.35rem', fontWeight: '900', color: '#0f172a' }}>
                    {formatMoney(Number(currentBooking.totalPrice || 0), 'USD')}
                  </div>
                </div>
              </div>

              <div className="admin-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontWeight: '900' }}>
                  <FileText size={18} /> Special requests
                </div>
                <div style={{ marginTop: '0.6rem', whiteSpace: 'pre-wrap', color: '#0f172a', lineHeight: 1.5 }}>
                  {String(currentBooking.specialRequests || '').trim() ? currentBooking.specialRequests : '—'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                {currentBooking.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateBookingStatus(currentBooking._id, 'confirmed');
                      setIsBookingModalOpen(false);
                      setCurrentBooking(null);
                    }}
                    className="btn"
                    style={{ background: '#f0fdf4', color: '#15803d', padding: '0.65rem 0.9rem', fontWeight: '800' }}
                  >
                    <CheckCircle2 size={18} /> Confirm booking
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setCurrentBooking(null);
                  }}
                  className="btn"
                  style={{ background: '#f1f5f9', color: '#475569', padding: '0.65rem 0.9rem', fontWeight: '800' }}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper Sub-Components ────────────────────────────────────────────────────

function NavItem({ active, onClick, icon, label, badge }) {
  return (
    <button className={`admin-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: '900' }}>
          {badge}
        </span>
      )}
      {active && !badge && (
        <motion.div layoutId="activeTab" style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
      )}
    </button>
  );
}

function StatCard({ label, value, icon, trend, className }) {
  return (
    <div className={`admin-card ${className}`} style={{ color: 'white', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }}>
        {React.cloneElement(icon, { size: 120 })}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          {trend && <div style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>{trend}</div>}
        </div>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.8, marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: '900' }}>{value}</p>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.75rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid #f1f5f9' : 'none' }}>
        <span style={{ color: 'hsl(var(--primary))' }}>{icon}</span>
        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{title}</span>
        <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="form-group">
      {label && <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>{label}</label>}
      {children}
    </div>
  );
}

function Modal({ onClose, title, children, wide }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="admin-card"
        style={{ width: '100%', maxWidth: wide ? '900px' : '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <X size={18} />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '2rem', color: '#0f172a' }}>{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}
