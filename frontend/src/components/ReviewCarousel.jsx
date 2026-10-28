import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import API_URL from '../config';
import { useSite } from '../context/SiteContext';

const FALLBACK_REVIEWS = [
  {
    id: 1,
    name: 'James Anderson',
    text: 'Serendib Travel & Tours made our honeymoon in Sri Lanka absolutely magical. The attention to detail and personal touch were unmatched.',
    rating: 5,
    created_at: '2026-07-21T10:00:00Z',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    text: 'The wildlife safari and tea plantation tours were breathtaking. Everything was perfectly organized, allowing us to just relax and enjoy.',
    rating: 5,
    created_at: '2026-07-14T10:00:00Z',
  },
  {
    id: 3,
    name: 'Michael Chen',
    text: 'Professional, reliable, and deeply knowledgeable. They showed us hidden gems of the cultural triangle that most tourists never see.',
    rating: 5,
    created_at: '2026-07-08T10:00:00Z',
  },
  {
    id: 4,
    name: 'Elena Rodriguez',
    text: 'From the moment we landed until our departure, we felt like VIPs. The luxury accommodations they handpicked were stunning.',
    rating: 5,
    created_at: '2026-06-28T10:00:00Z',
  },
  {
    id: 5,
    name: 'David Wilson',
    text: "I've traveled with many agencies, but Serendib's personalized service is on another level. They truly treat your trip as their own.",
    rating: 5,
    created_at: '2026-06-18T10:00:00Z',
  },
  {
    id: 6,
    name: 'Sophie Müller',
    text: 'The perfect blend of adventure and relaxation. Their guides are exceptional and their passion for Sri Lanka is contagious.',
    rating: 4,
    created_at: '2026-06-10T10:00:00Z',
  },
];

function TrustpilotMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#00b67a"
        d="M12 1.5l2.76 8.5H24l-7.08 5.15 2.7 8.35L12 18.35 4.38 23.5l2.7-8.35L0 10h9.24L12 1.5z"
      />
    </svg>
  );
}

function SquareStars({ rating = 5 }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 18,
            height: 18,
            background: i < value ? '#00b67a' : '#dcdce6',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#fff"
              d="M12 2.5l2.9 6.1 6.7.7-5 4.6 1.4 6.6L12 17.5 5.9 20.5l1.4-6.6-5-4.6 6.7-.7L12 2.5z"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

function reviewTitle(text = '') {
  const cleaned = String(text).trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'Great experience';
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim() || cleaned;
  if (firstSentence.length <= 42) return firstSentence;
  return `${firstSentence.slice(0, 39).trim()}...`;
}

function reviewSnippet(text = '') {
  const cleaned = String(text).trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 110) return cleaned;
  return `${cleaned.slice(0, 107).trim()}...`;
}

function truncateName(name = '', max = 16) {
  const value = String(name).trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}...`;
}

function formatRelativeDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);

  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 14) return `${days} days ago`;

  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

export default function ReviewCarousel() {
  const { t } = useSite();
  const trackRef = useRef(null);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const res = await fetch(`${API_URL}/reviews`);
        const data = await res.json().catch(() => []);
        if (!res.ok || !Array.isArray(data) || data.length === 0) return;

        const highRated = data
          .filter((r) => Number(r.rating) >= 4)
          .map((r) => ({
            id: r.id || r._id,
            name: r.name || 'Guest',
            text: r.text || '',
            rating: Number(r.rating) || 5,
            created_at: r.created_at || r.approved_at || null,
          }));

        if (!cancelled && highRated.length > 0) {
          setReviews(highRated);
        }
      } catch {
        /* keep fallback reviews */
      }
    }

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg =
      count === 0
        ? 0
        : reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count;
    return {
      average: Math.round(avg * 10) / 10,
      count,
    };
  }, [reviews]);

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [reviews]);

  const scrollByCards = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('[data-review-card]');
    const amount = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <section
      style={{
        background: '#fff',
        padding: 'clamp(2.5rem, 6vw, 4rem) 0 clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 max(1.25rem, 5%)',
          paddingLeft: 'max(1.25rem, 5%, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1.25rem, 5%, env(safe-area-inset-right, 0px))',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span
              aria-hidden="true"
              style={{
                color: '#c8102e',
                fontSize: 'clamp(2.75rem, 5vw, 3.75rem)',
                lineHeight: 0.7,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 700,
              }}
            >
              “
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: 'Montserrat, Outfit, sans-serif',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#111',
                letterSpacing: '-0.02em',
              }}
            >
              {t.homeReviewsTitle || 'Serendib Reviews'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrustpilotMark size={26} />
            <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#191919' }}>Trustpilot</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label="Previous reviews"
            onClick={() => scrollByCards(-1)}
            disabled={!canScrollLeft}
            style={{
              position: 'absolute',
              left: -6,
              top: '42%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #d7d7de',
              background: '#fff',
              color: canScrollLeft ? '#333' : '#bbb',
              display: 'grid',
              placeItems: 'center',
              cursor: canScrollLeft ? 'pointer' : 'default',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            aria-label="Next reviews"
            onClick={() => scrollByCards(1)}
            disabled={!canScrollRight}
            style={{
              position: 'absolute',
              right: -6,
              top: '42%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #d7d7de',
              background: '#fff',
              color: canScrollRight ? '#333' : '#bbb',
              display: 'grid',
              placeItems: 'center',
              cursor: canScrollRight ? 'pointer' : 'default',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={trackRef}
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '0.25rem 1.75rem 0.5rem',
              WebkitOverflowScrolling: 'touch',
            }}
            className="review-carousel-track"
          >
            {reviews.map((review) => (
              <article
                key={review.id}
                data-review-card
                style={{
                  flex: '0 0 min(240px, 78vw)',
                  scrollSnapAlign: 'start',
                  background: '#f5f5f7',
                  padding: '1.1rem 1rem 1.15rem',
                  minHeight: 210,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <SquareStars rating={review.rating} />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#6b6b76',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '1.5px solid #9a9aa3',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={9} strokeWidth={3} />
                    </span>
                    Verified
                  </span>
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    color: '#111',
                    lineHeight: 1.3,
                  }}
                >
                  {reviewTitle(review.text)}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#333',
                    lineHeight: 1.45,
                    flex: 1,
                  }}
                >
                  {reviewSnippet(review.text)}
                </p>

                <div
                  style={{
                    marginTop: 'auto',
                    fontSize: '0.8rem',
                    color: '#6b6b76',
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{truncateName(review.name)}</span>
                  <span>{formatRelativeDate(review.created_at)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <p style={{ margin: 0, color: '#222', fontSize: '0.98rem' }}>
            Rated{' '}
            <strong>
              {stats.average.toFixed(1)} / 5
            </strong>{' '}
            based on{' '}
            <strong>
              {stats.count.toLocaleString()} review{stats.count === 1 ? '' : 's'}
            </strong>
            . Showing our 4 &amp; 5 star reviews.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: '0.85rem',
            }}
          >
            <TrustpilotMark size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#191919' }}>Trustpilot</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <Link
            to="/reviews"
            style={{
              color: '#c8102e',
              fontWeight: 800,
              fontSize: '0.95rem',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            View all reviews
          </Link>
        </div>
      </div>

      <style>{`
        .review-carousel-track::-webkit-scrollbar { display: none; }
        @media (min-width: 900px) {
          .review-carousel-track [data-review-card] {
            flex-basis: calc((100% - 48px) / 4) !important;
          }
        }
        @media (min-width: 640px) and (max-width: 899px) {
          .review-carousel-track [data-review-card] {
            flex-basis: calc((100% - 16px) / 2) !important;
          }
        }
      `}</style>
    </section>
  );
}
