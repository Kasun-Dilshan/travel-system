/**
 * Extract place names from itinerary lines and geocode them into a day-by-day tour route.
 * Uses Open-Meteo Geocoding API (free, CORS-friendly, no API key).
 */

const SKIP_LABELS = new Set([
  'arrival', 'departure', 'return', 'return transfer', 'hotel pickup',
  'local lunch', 'lunch', 'dinner', 'breakfast', 'free day', 'rest day',
  'check-in', 'check out', 'checkout', 'transfer', 'airport transfer',
]);

function parseDayNumber(text, fallbackIndex) {
  const match = String(text || '').match(/^\s*day\s*(\d+)/i);
  if (match) return Number(match[1]);
  return fallbackIndex + 1;
}

function stripDayPrefix(text) {
  return String(text || '')
    .replace(/^\s*day\s*\d+\s*[:.\-–—]\s*/i, '')
    .replace(/^\s*\d{1,2}:\d{2}\s*(am|pm)?\s*[-–—:]?\s*/i, '')
    .trim();
}

function normalizeLocationLabel(raw) {
  let text = stripDayPrefix(raw);
  if (!text) return '';

  // Prefer the first place-like segment: "Sigiriya - climb the rock" → "Sigiriya"
  const parts = text.split(/\s*[-–—|/]\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    if (parts[0].split(/\s+/).length <= 4) text = parts[0];
  }

  text = text
    .replace(/^(arrival\s+(in|at|to)|arrive\s+(in|at|to)|departure\s+(to|from)|depart\s+(to|from)|drive\s+to|travel\s+to|visit|explore|transfer\s+to)\s+/i, '')
    .trim();

  text = text.replace(/\s+(and|&)\s+.+$/i, '').trim();
  text = text.replace(/\s+(city tour|tour|visit|sightseeing|excursion|day trip|rock fortress|fortress)$/i, '').trim();

  if (!text || SKIP_LABELS.has(text.toLowerCase())) return '';
  if (text.split(/\s+/).length > 6) return '';
  return text;
}

function rawLineFromItem(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return '';
  if (item.location) return String(item.location);
  if (item.day && Array.isArray(item.activities)) {
    return `${item.day}: ${(item.activities || []).join(', ')}`;
  }
  if (item.day) return String(item.day);
  if (item.text) return String(item.text);
  return '';
}

/**
 * Returns ordered day stops: [{ day, place, label }]
 * One entry per itinerary line that has a place name (day-by-day).
 */
export function extractDayStopsFromItinerary(itinerary = []) {
  const stops = [];
  let lineIndex = 0;

  for (const item of itinerary) {
    const raw = rawLineFromItem(item).trim();
    if (!raw) continue;

    const place = normalizeLocationLabel(raw);
    if (!place) {
      lineIndex += 1;
      continue;
    }

    const day = parseDayNumber(raw, lineIndex);
    stops.push({
      day,
      place,
      label: `Day ${day}: ${place}`,
    });
    lineIndex += 1;
  }

  return stops;
}

/** @deprecated use extractDayStopsFromItinerary — kept for callers expecting string labels */
export function extractLocationsFromItinerary(itinerary = []) {
  return extractDayStopsFromItinerary(itinerary).map((s) => s.label);
}

async function geocodeOne(name, { countryCode } = {}) {
  const params = new URLSearchParams({
    name,
    count: '5',
    language: 'en',
    format: 'json',
  });
  if (countryCode) params.set('countryCode', countryCode);

  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  if (!results.length) {
    if (countryCode) return geocodeOne(name, {});
    return null;
  }

  const best = results[0];
  const lat = Number(best.latitude);
  const lng = Number(best.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat,
    lng,
    resolvedName: best.name || name,
  };
}

/**
 * Build day-by-day { stops, path } from itinerary lines.
 * Marker labels look like "Day 1: Colombo".
 */
export async function buildRouteFromItinerary(itinerary, options = {}) {
  const dayStops = extractDayStopsFromItinerary(itinerary);
  if (!dayStops.length) return { stops: [], path: [] };

  const stops = [];
  for (const dayStop of dayStops) {
    try {
      const hit = await geocodeOne(dayStop.place, options);
      if (hit) {
        stops.push({
          day: dayStop.day,
          place: dayStop.place,
          label: dayStop.label,
          lat: hit.lat,
          lng: hit.lng,
        });
      }
      await new Promise((r) => setTimeout(r, 120));
    } catch {
      // skip failed lookups
    }
  }

  const path = stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  return { stops, path };
}

export function routeKey(route) {
  const stops = route?.stops || [];
  return stops.map((s) => `${s.day || ''}:${s.label}:${s.lat},${s.lng}`).join('|');
}

export function cleanTextLines(lines) {
  return (Array.isArray(lines) ? lines : [])
    .map((line) => String(line ?? '').trim())
    .filter(Boolean);
}
