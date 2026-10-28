import React from 'react';

function extractDayNumber(label, idx) {
  const match = String(label || '').match(/(\d+)/);
  return match ? Number(match[1]) : idx + 1;
}

export function padDay(n) {
  const num = Number(n) || 1;
  return String(num).padStart(2, '0');
}

export function formatDayLabel(n) {
  return `Day ${padDay(n)}`;
}

function cleanActivityItem(item) {
  if (typeof item === 'string') return item.trim();
  if (item && typeof item === 'object') {
    const location = typeof item.location === 'string' ? item.location.trim() : '';
    const text = item.activity ?? item.text ?? item.title ?? item.description ?? '';
    const detail = typeof text === 'string' ? text.trim() : String(text || '').trim();
    if (location && detail && location !== detail) return `${location}: ${detail}`;
    return location || detail;
  }
  return String(item || '').trim();
}

function placesFromActivities(activities) {
  if (!Array.isArray(activities)) return '';
  const places = activities
    .map((a) => {
      if (typeof a === 'string') return '';
      if (a && typeof a === 'object' && a.location) return String(a.location).trim();
      return '';
    })
    .filter(Boolean);
  return [...new Set(places)].join(', ');
}

/** Split "Places | Details" or "Places :: Details" into places + detail body. */
function splitPlacesAndDetails(text) {
  const s = String(text || '').trim();
  if (!s) return { places: '', details: '' };

  const pipe = s.match(/^(.+?)\s*[|｜]\s*(.+)$/s);
  if (pipe) {
    return { places: pipe[1].trim(), details: pipe[2].trim() };
  }

  const doubleColon = s.match(/^(.+?)\s*::\s*(.+)$/s);
  if (doubleColon) {
    return { places: doubleColon[1].trim(), details: doubleColon[2].trim() };
  }

  return { places: s, details: '' };
}

function splitDetailLines(text) {
  return String(text || '')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function isDayOnlyTitle(value, dayNumber) {
  const s = String(value || '').trim();
  if (!s) return true;
  const n = Number(dayNumber) || 0;
  const padded = padDay(n);
  return new RegExp(`^day\\s*0*${n}\\s*$`, 'i').test(s)
    || new RegExp(`^day\\s*${padded}\\s*$`, 'i').test(s);
}

/** Match "DAY 01", "Day 1:", "Day 01 |" style day headers. */
function matchDayHeader(text) {
  const s = String(text || '').trim();
  if (!s) return null;

  // Day 1: Title | Details   OR   Day 01 - Title | Details
  const colonStyle = s.match(/^(day\s*\d+)\s*[:\-–—]\s*(.*)$/i);
  if (colonStyle) {
    return { dayLabel: colonStyle[1], rest: (colonStyle[2] || '').trim() };
  }

  // DAY 01 | ARRIVAL DELHI   OR   DAY 02 | A | B
  const pipeStyle = s.match(/^(day\s*\d+)\s*[|｜]\s*(.*)$/i);
  if (pipeStyle) {
    return { dayLabel: pipeStyle[1], rest: (pipeStyle[2] || '').trim() };
  }

  // Bare "Day 01" / "DAY 1"
  if (/^day\s*\d+\s*$/i.test(s)) {
    return { dayLabel: s, rest: '' };
  }

  return null;
}

/** True when an item is a day row (not a bare activity/stop). */
function isDayWrapperItem(item) {
  if (typeof item === 'string') {
    return Boolean(matchDayHeader(item));
  }
  if (!item || typeof item !== 'object') return false;
  if (item.day != null && String(item.day).trim() !== '') return true;
  if (typeof item.places === 'string' || typeof item.details === 'string') return true;
  if (Array.isArray(item.activities)) return true;
  if (typeof item.title === 'string' && /^day\s*\d+/i.test(item.title.trim())) return true;
  return false;
}

function hasDayContent(day) {
  if (!day) return false;
  const places = String(day.places || '').trim();
  const details = Array.isArray(day.details)
    ? day.details.filter(Boolean)
    : splitDetailLines(day.details);
  return Boolean(places) || details.length > 0;
}

function renumberDays(days) {
  return days.map((day, idx) => {
    const dayNumber = idx + 1;
    return {
      ...day,
      dayNumber,
      heading: formatDayLabel(dayNumber),
    };
  });
}

function parseDayItem(item, idx) {
  if (typeof item === 'string') {
    const s = item.trim();
    if (!s) return null;

    const header = matchDayHeader(s);
    if (header) {
      const dayNumber = extractDayNumber(header.dayLabel, idx);
      const rest = header.rest;
      // Colon style "Day 1: Title | Details" can split title/details on same line.
      // Pipe style "DAY 01 | TITLE" keeps everything after the day as the title.
      const colonStyle = /^(day\s*\d+)\s*[:\-–—]/i.test(s);
      const { places, details } = colonStyle && (rest.includes('|') || rest.includes('｜') || rest.includes('::'))
        ? splitPlacesAndDetails(rest)
        : { places: rest, details: '' };
      return {
        dayNumber,
        heading: formatDayLabel(dayNumber),
        places,
        details: splitDetailLines(details),
      };
    }

    const { places, details } = splitPlacesAndDetails(s);
    return {
      dayNumber: idx + 1,
      heading: formatDayLabel(idx + 1),
      places,
      details: splitDetailLines(details),
    };
  }

  if (item && typeof item === 'object') {
    const dayNumber = extractDayNumber(item.day ?? item.title, idx);
    const activities = Array.isArray(item.activities) ? item.activities : [];
    const fromActivities = activities.map(cleanActivityItem).filter(Boolean);

    let places =
      (typeof item.places === 'string' && item.places.trim()) ||
      placesFromActivities(activities) ||
      '';

    let detailsText =
      (typeof item.details === 'string' && item.details.trim()) ||
      (typeof item.description === 'string' && item.description.trim()) ||
      '';

    // Legacy: title held places when it wasn't just "Day 01"
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!places && title && !isDayOnlyTitle(title, dayNumber)) {
      places = title;
    }

    let details = splitDetailLines(detailsText);
    if (details.length === 0 && fromActivities.length > 0) {
      details = fromActivities;
    }

    // Single location/text activity object (no day wrapper)
    if (!places && !details.length) {
      const location = typeof item.location === 'string' ? item.location.trim() : '';
      const text = cleanActivityItem(item);
      if (location) places = location;
      if (text && text !== location) details = [text];
      else if (text && !places) details = [text];
    }

    return {
      dayNumber,
      heading: formatDayLabel(dayNumber),
      places,
      details,
    };
  }

  const s = String(item || '').trim();
  return s
    ? { dayNumber: idx + 1, heading: formatDayLabel(idx + 1), places: '', details: [s] }
    : null;
}

/**
 * Collapse string lines like:
 *   DAY 01 | ARRIVAL DELHI
 *   Arrive at airport...
 *   Meals: No Meals
 *   DAY 02 | SRINAGAR
 *   After breakfast...
 * into day objects with places + details.
 */
function groupStringLinesIntoDays(lines) {
  const days = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    if (!hasDayContent(current)) {
      current = null;
      return;
    }
    days.push(current);
    current = null;
  };

  for (const raw of lines) {
    const s = String(raw || '').trim();
    if (!s) continue;

    const header = matchDayHeader(s);
    if (header) {
      pushCurrent();
      const dayNumber = extractDayNumber(header.dayLabel, days.length);
      const rest = header.rest;
      const colonStyle = /^(day\s*\d+)\s*[:\-–—]/i.test(s);
      const split = colonStyle && (rest.includes('|') || rest.includes('｜') || rest.includes('::'))
        ? splitPlacesAndDetails(rest)
        : { places: rest, details: '' };
      current = {
        dayNumber,
        heading: formatDayLabel(dayNumber),
        places: split.places,
        details: splitDetailLines(split.details),
      };
      continue;
    }

    if (current) {
      current.details = [...(current.details || []), s];
    } else {
      // Orphan lines before any day header → Day 01 details
      current = {
        dayNumber: 1,
        heading: formatDayLabel(1),
        places: '',
        details: [s],
      };
    }
  }

  pushCurrent();
  return days;
}

/**
 * Normalize package itinerary into day rows for the accordion UI.
 * Day count / labels follow the ordered day-detail rows that have content
 * (places or details), not stale day labels or bare activity length.
 * Supported formats:
 *   Day 01: Paro, Thimphu | Meet your guide and transfer...
 *   DAY 01 | ARRIVAL DELHI  (+ following detail lines)
 *   { day: "Day 01", places: "...", details: "..." }
 *   { day, title, activities: [{ location, text }] }
 */
export function normalizeItineraryDays(itineraryArray) {
  // Allow a single multi-line string (admin paste / legacy saves)
  if (typeof itineraryArray === 'string') {
    const lines = itineraryArray.split(/\r?\n/);
    return normalizeItineraryDays(lines);
  }

  if (!Array.isArray(itineraryArray) || itineraryArray.length === 0) return [];

  // Flatten accidental "one big string with newlines" array entries
  const flattened = [];
  for (const item of itineraryArray) {
    if (typeof item === 'string' && /[\r\n]/.test(item)) {
      flattened.push(...item.split(/\r?\n/));
    } else {
      flattened.push(item);
    }
  }

  const looksLikeDayRows = flattened.some(isDayWrapperItem);

  // Legacy activity/stop lists are one day, not one day per stop.
  if (!looksLikeDayRows) {
    const places = placesFromActivities(flattened);
    const details = flattened.map(cleanActivityItem).filter(Boolean);
    if (!places && details.length === 0) return [];
    return [{
      dayNumber: 1,
      heading: formatDayLabel(1),
      places,
      details,
    }];
  }

  const allStrings = flattened.every(
    (item) => typeof item === 'string' || item == null
  );

  // Freeform admin paste: day headers mixed with detail lines
  if (allStrings) {
    const grouped = groupStringLinesIntoDays(flattened);
    if (grouped.length > 0) return renumberDays(grouped);
  }

  return renumberDays(
    flattened
      .map((item, idx) => parseDayItem(item, idx))
      .filter((day) => day && hasDayContent(day))
  );
}

/** Convert any stored itinerary into editable day rows for the admin form. */
export function toEditableItineraryDays(itineraryArray) {
  const days = normalizeItineraryDays(itineraryArray);
  if (!days.length) return [];
  return days.map((d) => ({
    day: formatDayLabel(d.dayNumber),
    title: formatDayLabel(d.dayNumber),
    places: d.places || '',
    details: Array.isArray(d.details) ? d.details.join('\n') : String(d.details || ''),
  }));
}

/** Clean editable day rows before saving to the API. */
export function serializeItineraryDays(days) {
  return (Array.isArray(days) ? days : [])
    .map((day) => {
      if (typeof day === 'string') {
        const s = day.trim();
        if (!s) return null;
        const { places, details } = splitPlacesAndDetails(s);
        if (!places && !details) return null;
        return { places, details };
      }
      if (!day || typeof day !== 'object') return null;
      const places = String(day.places || '').trim();
      const details = String(day.details || day.description || '').trim();
      if (!places && !details) return null;
      return { places, details };
    })
    .filter(Boolean)
    .map((day, idx) => {
      const label = formatDayLabel(idx + 1);
      return {
        day: label,
        title: label,
        places: day.places,
        details: day.details,
      };
    });
}

export default function ItineraryTimeline({ days, expandedDays = {}, onToggle, title }) {
  if (!Array.isArray(days) || days.length === 0) return null;

  return (
    <div>
      {title ? (
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: 'hsl(var(--secondary))',
          }}
        >
          {title}
        </h2>
      ) : null}

      <div
        style={{
          background: '#f3f4f6',
          borderRadius: '0.75rem',
          padding: '1rem 1rem 0.5rem',
        }}
      >
        <div
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.35rem',
            paddingLeft: '0.15rem',
          }}
        >
          Day
        </div>

        <div style={{ position: 'relative' }}>
          {days.map((dayEntry, idx) => {
            const isOpen = Boolean(expandedDays?.[idx]);
            const isLast = idx === days.length - 1;
            // Always number by position among day-detail rows shown
            const dayNumber = idx + 1;
            const dayOnlyLabel = formatDayLabel(dayNumber);
            const dayDetailsLabel = `${dayOnlyLabel} Details`;
            const places = String(dayEntry.places || '').trim();
            const detailItems = Array.isArray(dayEntry.details) ? dayEntry.details.filter(Boolean) : [];
            const canExpand = detailItems.length > 0;

            return (
              <div
                key={`day-${dayNumber}-${idx}`}
                style={{
                  position: 'relative',
                  paddingLeft: '2.75rem',
                  paddingBottom: isLast ? '0.75rem' : 0,
                  borderBottom: isLast ? 'none' : '1px solid #d1d5db',
                }}
              >
                {!isLast && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 15,
                      top: 28,
                      bottom: 0,
                      width: 2,
                      background: '#d1d5db',
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.85rem 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '0.85rem',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#111827',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        zIndex: 1,
                      }}
                    >
                      {padDay(dayNumber)}
                    </span>

                    <div style={{ minWidth: 0, flex: 1, paddingTop: '0.2rem' }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: '#111827',
                          lineHeight: 1.35,
                        }}
                      >
                        {dayOnlyLabel}
                      </div>

                      {places ? (
                        <p
                          style={{
                            margin: '0.35rem 0 0',
                            color: '#374151',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            lineHeight: 1.45,
                          }}
                        >
                          {places}
                        </p>
                      ) : null}

                      {isOpen && canExpand && (
                        <div
                          id={`itinerary-day-${idx}`}
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.85rem 1rem',
                            background: '#fff',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase',
                              color: 'hsl(var(--secondary))',
                              marginBottom: '0.55rem',
                            }}
                          >
                            {dayDetailsLabel}
                          </div>

                          <div
                            style={{
                              color: '#111827',
                              fontSize: '0.95rem',
                              fontWeight: 400,
                              lineHeight: 1.65,
                            }}
                          >
                            {detailItems.map((item, detailIdx) => (
                              <p
                                key={`${String(item)}-${detailIdx}`}
                                style={{ margin: detailIdx === 0 ? 0 : '0.55rem 0 0' }}
                              >
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {canExpand ? (
                    <button
                      type="button"
                      onClick={() => onToggle?.(idx)}
                      aria-expanded={isOpen}
                      aria-controls={`itinerary-day-${idx}`}
                      style={{
                        flexShrink: 0,
                        marginTop: '0.1rem',
                        padding: '0.35rem 0.7rem',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        background: isOpen ? '#111827' : '#e5e7eb',
                        color: isOpen ? '#fff' : '#4b5563',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                    >
                      {isOpen ? 'Hide ×' : 'Show +'}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
