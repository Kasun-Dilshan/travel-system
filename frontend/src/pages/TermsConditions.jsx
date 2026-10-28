import React from 'react';
import { motion } from 'framer-motion';
import SubHero from '../components/SubHero';
import SEO from '../components/SEO';
import { useSite } from '../context/SiteContext';

const TermsConditions = () => {
  const { language, t } = useSite();

  const termsData = [
    {
      id: 1,
      title: "1. Introduction",
      content: "Welcome to Serendib Travels and Tours (“we”, “our”, “us”). By booking any tour, package, or service with us, you agree to the following Terms & Conditions."
    },
    {
      id: 2,
      title: "2. Booking & Confirmation",
      points: [
        "All bookings must be made via email, phone, or our official platforms.",
        "A booking is confirmed only after receiving the required deposit or full payment.",
        "You are responsible for providing accurate personal and travel details."
      ]
    },
    {
      id: 3,
      title: "3. Payments",
      points: [
        "A deposit (usually 20%–50%) is required to confirm bookings.",
        "Full payment must be completed before the start of the tour.",
        "Payments can be made via bank transfer, online payment gateways, or other agreed methods."
      ]
    },
    {
      id: 4,
      title: "4. Cancellation & Refund Policy",
      points: [
        "Cancellations must be made in writing (email/WhatsApp).",
        "Cancellation charges may apply depending on the timing:",
        "• 14+ days before travel → Partial refund",
        "• 7–14 days → 50% charge",
        "• Less than 7 days → No refund",
        "Refunds (if applicable) will be processed within a reasonable period.",
        "Some bookings (hotels, flights) may be non-refundable as per supplier policies."
      ]
    },
    {
      id: 5,
      title: "5. Changes & Amendments",
      points: [
        "Any changes to bookings must be requested in advance.",
        "We will try our best to accommodate changes, but this depends on availability.",
        "Additional charges may apply."
      ]
    },
    {
      id: 6,
      title: "6. Travel Documents & Responsibilities",
      points: [
        "Clients must ensure they have valid passports, visas, and required travel documents.",
        "Serendib Travels and Tours is not responsible for denied entry due to incorrect documentation."
      ]
    },
    {
      id: 7,
      title: "7. Pricing & Inclusions",
      points: [
        "Prices include only the services clearly mentioned in your itinerary.",
        "Prices may change due to external factors such as fuel costs, taxes, or supplier changes.",
        "Entrance fees, optional tours, and personal expenses are usually not included unless specified."
      ]
    },
    {
      id: 8,
      title: "8. Liability",
      points: [
        "We act as an intermediary between clients and service providers (hotels, transport, etc.).",
        "We are not liable for:",
        "• Delays, cancellations, or changes by third-party providers",
        "• Natural disasters, weather conditions, or unforeseen events",
        "• Loss, theft, or damage of personal belongings",
        "Clients travel at their own risk."
      ]
    },
    {
      id: 9,
      title: "9. Health & Safety",
      points: [
        "Clients must inform us of any medical conditions or special needs in advance.",
        "You are responsible for your own health, safety, and travel insurance."
      ]
    },
    {
      id: 10,
      title: "10. Force Majeure",
      content: "We are not responsible for failure to perform due to events beyond our control, including: Natural disasters, Political unrest, Pandemics, Flight cancellations."
    },
    {
      id: 11,
      title: "11. Conduct",
      points: [
        "Clients are expected to behave respectfully towards staff, guides, and others.",
        "We reserve the right to terminate services without refund in case of misconduct."
      ]
    },
    {
      id: 12,
      title: "12. Complaints",
      points: [
        "Any issues must be reported immediately during the tour so we can assist.",
        "Complaints after the tour may not be considered if not raised during the trip."
      ]
    },
    {
      id: 13,
      title: "13. Governing Law",
      content: "These Terms & Conditions are governed by the laws of Sri Lanka."
    },
    {
      id: 14,
      title: "14. Contact Information",
      content: "Serendib Travels and Tours",
      details: [
        "Email: inbound_manager@serendibdestinations.com",
        "Phone: +94 77 113 3100",
        "No.87, Pannipitiya Road, Battramulla"
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: 'hsl(var(--background))' }}>
      <SEO 
        title="Terms & Conditions | Serendib Travel" 
        description="Read our terms and conditions for booking tours and services with Serendib Travel & Tours." 
      />
      <SubHero 
        title={t.termsTitle || 'Terms & Conditions'}
        subtitle={t.termsSubtitle || 'Our commitment to transparency and your peace of mind while exploring the world with Serendib.'}
        label={t.legalLabel || 'Legals & Policies'}
        image="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2039&auto=format&fit=crop"
        currentLang={language}
        accentColor="hsl(var(--primary))"
      />

      <section style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '5rem 5%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4rem'
      }}>
        {termsData.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: '3rem',
              borderRadius: '2rem',
              background: 'white',
              border: '1px solid hsl(var(--glass-border))',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
            }}
          >
            <h3 className="serif" style={{ 
              fontSize: '2rem', 
              marginBottom: '2rem',
              color: 'hsl(var(--secondary))',
              borderBottom: '2px solid hsl(var(--primary) / 0.1)',
              paddingBottom: '1rem',
              display: 'inline-block'
            }}>
              {section.title}
            </h3>
            
            {section.content && (
              <p style={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.8, 
                color: 'hsl(var(--foreground) / 0.8)',
                marginBottom: section.points || section.details ? '1.5rem' : 0
              }}>
                {section.content}
              </p>
            )}

            {section.points && (
              <ul style={{ 
                listStyle: 'none', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem' 
              }}>
                {section.points.map((point, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    gap: '1rem',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    color: 'hsl(var(--foreground) / 0.7)'
                  }}>
                    {!point.startsWith('•') && (
                      <span style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>•</span>
                    )}
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.details && (
              <div style={{ 
                marginTop: '1rem',
                padding: '1.5rem',
                background: 'hsl(var(--primary) / 0.03)',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {section.details.map((detail, i) => (
                  <p key={i} style={{ fontWeight: 600, color: 'hsl(var(--secondary))' }}>
                    {detail}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </section>

      {/* Modern Gradient Background Decorative Elements */}
      <div style={{
        position: 'fixed',
        top: '20%',
        right: '-10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, hsla(142, 76%, 36%, 0.05) 0%, transparent 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '-5%',
        width: '30vw',
        height: '30vw',
        background: 'radial-gradient(circle, hsla(142, 76%, 36%, 0.03) 0%, transparent 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default TermsConditions;
