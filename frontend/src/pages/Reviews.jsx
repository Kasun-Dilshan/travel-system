import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, LoaderCircle, Send, Star } from 'lucide-react';
import SEO from '../components/SEO';
import API_URL, { mediaUrl } from '../config';
import { useSite } from '../context/SiteContext';

function StarRating({ value }) {
  const rating = Math.max(1, Math.min(5, Number(value) || 0));
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? 'hsl(var(--primary))' : 'transparent'}
          color={i < rating ? 'hsl(var(--primary))' : 'rgba(15,23,42,0.25)'}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t } = useSite();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const photoPreviews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos]
  );

  useEffect(
    () => () => {
      for (const preview of photoPreviews) {
        try {
          URL.revokeObjectURL(preview.url);
        } catch {
          /* ignore */
        }
      }
    },
    [photoPreviews]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setLoading(true);
      setLoadError('');
      try {
        const res = await fetch(`${API_URL}/reviews`);
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.message || `Request failed: ${res.status}`);
        }
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load reviews');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || [])
      .filter((f) => f && typeof f.type === 'string' && f.type.startsWith('image/'))
      .slice(0, 5);
    e.target.value = '';
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');

    const trimmedName = String(name || '').trim();
    const trimmedText = String(text || '').trim();
    if (!trimmedName || !trimmedText) {
      setSubmitMessage('Please enter your name and review.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('location', String(location || '').trim());
      formData.append('rating', String(rating || 5));
      formData.append('text', trimmedText);
      for (const photo of photos) {
        formData.append('photos[]', photo);
      }

      const res = await fetch(`${API_URL}/reviews`, { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Submit failed: ${res.status}`);
      }

      setName('');
      setLocation('');
      setRating(5);
      setText('');
      setPhotos([]);
      setSubmitMessage(data?.message || 'Submitted for approval.');
    } catch (err) {
      setSubmitMessage(err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ paddingTop: '110px' }}>
      <SEO
        title="Reviews | Serendib Travel & Tours"
        description="Read traveler reviews and share your experience."
      />

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 max(1.25rem, 5%) 3rem' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: 'hsl(var(--secondary))',
              marginBottom: '0.75rem',
            }}
          >
            {t.navReviews || 'Reviews'}
          </h1>
          <p style={{ color: 'hsl(var(--foreground))', opacity: 0.8, maxWidth: 720, margin: 0 }}>
            {t.homeReviewsSubtitle || 'Testimonials from our travelers'}
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '2rem',
            marginTop: '2rem',
          }}
        >
          <div>
            {loading ? (
              <div
                className="glass"
                style={{
                  padding: '2rem',
                  borderRadius: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <LoaderCircle className="spin" size={18} />
                <div style={{ fontWeight: 800 }}>Loading reviews…</div>
              </div>
            ) : loadError ? (
              <div
                className="glass"
                style={{ padding: '2rem', borderRadius: '1.25rem', color: '#b91c1c', fontWeight: 800 }}
              >
                {loadError}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {reviews.map((review) => (
                  <motion.div
                    key={review._id || review.id}
                    whileHover={{ y: -6 }}
                    className="glass"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <StarRating value={review.rating} />
                    <div style={{ color: 'hsl(var(--foreground))', opacity: 0.9, lineHeight: 1.6 }}>
                      “{review.text}”
                    </div>
                    {Array.isArray(review.photos) && review.photos.length > 0 && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '0.5rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        {review.photos.slice(0, 6).map((photo, idx) => (
                          <a
                            key={`${photo}-${idx}`}
                            href={mediaUrl(photo)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'block' }}
                          >
                            <div
                              style={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(15,23,42,0.08)',
                                background: `url(${mediaUrl(photo)}) center/cover`,
                              }}
                              title="Open photo"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      <div style={{ fontWeight: 900, color: 'hsl(var(--secondary))' }}>{review.name}</div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: 'hsl(var(--foreground))',
                          opacity: 0.6,
                          fontSize: '0.9rem',
                        }}
                      >
                        {review.location || ''}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {reviews.length === 0 && (
                  <div
                    className="glass"
                    style={{
                      padding: '2rem',
                      borderRadius: '1.25rem',
                      fontWeight: 800,
                      color: 'hsl(var(--foreground))',
                      opacity: 0.75,
                    }}
                  >
                    No reviews yet.
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="glass"
            style={{ borderRadius: '1.25rem', padding: '1.5rem', height: 'fit-content' }}
          >
            <h2 style={{ margin: 0, fontWeight: 900, color: 'hsl(var(--secondary))', fontSize: '1.2rem' }}>
              Share your experience
            </h2>
            <p
              style={{
                marginTop: '0.5rem',
                marginBottom: '1rem',
                color: 'hsl(var(--foreground))',
                opacity: 0.75,
                lineHeight: 1.5,
              }}
            >
              Your review will appear on the website after admin approval.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                className="form-control"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="form-control"
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label style={{ fontWeight: 900, color: 'hsl(var(--foreground))', opacity: 0.75 }}>
                  Rating
                </label>
                <select
                  className="form-control"
                  style={{ flex: 1 }}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Write your review…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ resize: 'vertical' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  id="review-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                  disabled={submitting}
                />
                <label
                  htmlFor="review-photos"
                  className="btn"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(15,23,42,0.12)',
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Image size={18} />
                  Add photos (max 5)
                </label>
                <div
                  style={{
                    fontWeight: 800,
                    color: 'hsl(var(--foreground))',
                    opacity: 0.6,
                    fontSize: '0.9rem',
                  }}
                >
                  {photos.length}/5 selected
                </div>
              </div>

              {photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {photoPreviews.map((preview) => (
                    <div
                      key={preview.url}
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(15,23,42,0.12)',
                        background: `url(${preview.url}) center/cover`,
                      }}
                    />
                  ))}
                </div>
              )}

              {submitMessage && (
                <div
                  style={{
                    fontWeight: 800,
                    color: submitMessage.toLowerCase().includes('fail') ? '#b91c1c' : '#15803d',
                  }}
                >
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="spin" size={18} />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit review
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
