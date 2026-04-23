import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Calendar, Users, Phone, Mail, User, Info, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import API_URL, { mediaUrl } from '../config';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tour } = location.state || {};

  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    bookingDate: '',
    guests: 1,
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!tour) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <SEO title="No Tour Selected" description="Please select a tour to proceed with booking." />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Tour Selected</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const tourId = tour?._id ?? tour?.id;
      if (!tourId) throw new Error('Tour ID is missing. Please re-open the tour and try again.');

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          guests: Number(formData.guests),
          tourId,
          tourTitle: tour.title,
          totalPrice: tour.price * Number(formData.guests)
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit booking');
      }

      setIsSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container" style={{
        padding: '8rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <SEO title="Booking Success" description="Your booking has been successfully submitted." />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={{ color: 'hsl(var(--primary))', marginBottom: '2rem' }}
        >
          <CheckCircle2 size={80} />
        </motion.div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', color: 'hsl(var(--secondary))' }}>
          Booking Confirmed!
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.7, textAlign: 'center', maxWidth: '500px', marginBottom: '2rem' }}>
          Thank you for choosing Serendib Travel. We have received your booking for <strong>{tour.title}</strong> and will contact you shortly.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">Return Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '8rem 2rem', backgroundColor: 'hsl(var(--primary) / 0.015)', minHeight: '100vh' }}>
      <SEO 
        title={`Book ${tour.title} | Serendib Travel`}
        description={`Secure your spot for the ${tour.title}. Premium Sri Lankan travel experience.`}
      />

      <div className="container" style={{ maxWidth: '1100px' }}>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'hsl(var(--primary) / 0.05)',
            padding: '0.6rem 1.25rem',
            borderRadius: '999px',
            border: '1px solid hsl(var(--primary) / 0.1)',
            color: 'hsl(var(--primary))',
            fontWeight: '800',
            cursor: 'pointer',
            marginBottom: '2.5rem',
            fontSize: '0.9rem'
          }}
          whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--primary) / 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={18} /> Back to Tour
        </motion.button>

        <div 
          className="main-booking-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '3rem', 
            alignItems: 'start',
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >

          {/* Summary Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              backgroundColor: 'white',
              padding: '2.5rem',
              borderRadius: '2.5rem',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)',
              border: '1px solid hsl(var(--primary) / 0.08)'
            }}
          >
            <div style={{
              backgroundColor: 'hsl(var(--primary) / 0.05)',
              color: 'hsl(var(--primary))',
              display: 'inline-block',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1.5rem'
            }}>
              Tour Summary
            </div>
            
            <div style={{ position: 'relative', marginBottom: '1.5rem', overflow: 'hidden', borderRadius: '1.5rem' }}>
              <img
                src={mediaUrl(tour.image)}
                alt={tour.title}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                backgroundColor: 'hsla(0,0%,0%,0.6)',
                padding: '0.4rem 0.8rem',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '0.8rem',
                backdropFilter: 'blur(4px)'
              }}>
                ${tour.price} <span style={{ opacity: 0.7 }}>/ person</span>
              </div>
            </div>

            <h4 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '1.25rem', color: 'hsl(var(--secondary))', lineHeight: 1.2 }}>{tour.title}</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                <span>Subtotal</span>
                <span>${tour.price} &times; {formData.guests}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                <span>Service Fee</span>
                <span>Included</span>
              </div>
              
              <div style={{ 
                borderTop: '1px solid hsl(var(--primary) / 0.1)', 
                paddingTop: '1.25rem', 
                marginTop: '0.5rem',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline'
              }}>
                <span style={{ fontWeight: '700', color: 'hsl(var(--secondary))' }}>Total Amount</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '900', color: 'hsl(var(--primary))' }}>
                  ${tour.price * formData.guests}
                </span>
              </div>
            </div>

            <div style={{ 
              marginTop: '2rem', 
              padding: '1.25rem', 
              backgroundColor: 'hsl(var(--secondary) / 0.03)', 
              borderRadius: '1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <CheckCircle2 size={20} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '0.2rem' }} />
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Secure SSL encrypted booking. Your data is protected by our privacy policy.
              </p>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              backgroundColor: 'white',
              padding: '3.5rem',
              borderRadius: '3rem',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.1)',
              border: '1px solid hsl(var(--primary) / 0.05)'
            }}
          >
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.75rem', color: 'hsl(var(--secondary))', letterSpacing: '-0.02em' }}>
                Book Your Experience
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'hsl(var(--foreground) / 0.5)', maxWidth: '500px' }}>
                Fill in the details below to secure your spot on this premium Sri Lankan journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="grid-2">
                <motion.div whileTap={{ scale: 0.995 }} className="form-group">
                  <label htmlFor="clientName" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '800', color: 'hsl(var(--secondary))' }}>
                    <User size={16} /> CLIENT NAME*
                  </label>
                  <input
                    id="clientName"
                    type="text"
                    name="clientName"
                    required
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="form-control"
                  />
                </motion.div>
                <motion.div whileTap={{ scale: 0.995 }} className="form-group">
                  <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '800', color: 'hsl(var(--secondary))' }}>
                    <Mail size={16} /> EMAIL ADDRESS*
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="form-control"
                  />
                </motion.div>
              </div>

              <div className="grid-2">
                <motion.div whileTap={{ scale: 0.995 }} className="form-group">
                  <label htmlFor="phone" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '800', color: 'hsl(var(--secondary))' }}>
                    <Phone size={16} /> PHONE NUMBER*
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 XX XXX XXXX"
                    className="form-control"
                  />
                </motion.div>
                <motion.div whileTap={{ scale: 0.995 }} className="form-group">
                  <label htmlFor="bookingDate" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '800', color: 'hsl(var(--secondary))' }}>
                    <Calendar size={16} /> TRAVEL DATE*
                  </label>
                  <input
                    id="bookingDate"
                    type="date"
                    name="bookingDate"
                    required
                    value={formData.bookingDate}
                    onChange={handleChange}
                    className="form-control"
                    style={{ cursor: 'pointer' }}
                  />
                </motion.div>
              </div>

              <motion.div whileTap={{ scale: 0.995 }} className="form-group">
                <label htmlFor="guests" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '800', color: 'hsl(var(--secondary))' }}>
                  <Users size={16} /> NUMBER OF GUESTS*
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="guests"
                    type="number"
                    name="guests"
                    min="1"
                    required
                    value={formData.guests}
                    onChange={handleChange}
                    className="form-control"
                    style={{ paddingRight: '3rem' }}
                  />
                  <span style={{ position: 'absolute', right: '1.25rem', opacity: 0.4, fontWeight: '700', fontSize: '0.8rem', pointerEvents: 'none' }}>
                    PERSONS
                  </span>
                </div>
              </motion.div>

              <motion.div whileTap={{ scale: 0.995 }} className="form-group">
                <label htmlFor="specialRequests" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '800', color: 'hsl(var(--secondary))' }}>
                  <Info size={16} /> SPECIAL REQUESTS
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  rows="4"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Tell us about dietary needs, accessibility, or special occasions..."
                  className="form-control"
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    color: '#ef4444', 
                    fontSize: '0.9rem', 
                    padding: '1.25rem', 
                    backgroundColor: '#fef2f2', 
                    borderRadius: '1.25rem',
                    border: '1px solid #fee2e2',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>&times;</span> {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  fontSize: '1.15rem',
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  borderRadius: '1.5rem',
                  boxShadow: '0 15px 30px -10px hsla(var(--primary) / 0.4)'
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                    />
                    Finalizing Booking...
                  </>
                ) : (
                  <>
                    Confirm & Complete Booking <Send size={20} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
