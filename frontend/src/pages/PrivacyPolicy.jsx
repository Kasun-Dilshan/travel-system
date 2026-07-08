import React from 'react';
import { motion } from 'framer-motion';
import SubHero from '../components/SubHero';
import SEO from '../components/SEO';
import { useSite } from '../context/SiteContext';

const PrivacyPolicy = () => {
  const { language, t } = useSite();

  const privacyData = [
    {
      id: 1,
      title: "1. Introduction",
      content: "Serendib Travels and Tours (“we”, “our”, “us”) is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services, website, or communicate with us."
    },
    {
      id: 2,
      title: "2. Information We Collect",
      content: "We may collect the following types of information:",
      subsections: [
        {
          subtitle: "Personal Information",
          points: [
            "Full name",
            "Contact number",
            "Email address",
            "Nationality and country of residence",
            "Passport details (when required for bookings)",
            "Travel preferences and special requirements (dietary, medical, etc.)",
            "Emergency contact details"
          ]
        },
        {
          subtitle: "Booking & Payment Information",
          points: [
            "Travel dates and itineraries",
            "Hotel and transport preferences",
            "Payment details (processed securely via third-party providers)"
          ]
        },
        {
          subtitle: "Technical Information",
          points: [
            "IP address",
            "Browser type and device",
            "Website usage data"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "3. How We Use Your Information",
      content: "We use your information to:",
      points: [
        "Process and manage your travel bookings",
        "Arrange hotels, transport, tours, and experiences",
        "Communicate with you regarding your trip",
        "Provide customer support",
        "Improve our services and website",
        "Send promotional offers (only with your consent)"
      ],
      note: "Travel companies typically use data mainly for booking coordination and service improvement"
    },
    {
      id: 4,
      title: "4. Sharing Your Information",
      content: "We may share your data only, when necessary, with:",
      points: [
        "Hotels and accommodation providers",
        "Transport providers (drivers, airlines, etc.)",
        "Tour guides and local partners",
        "Payment processing providers"
      ],
      note: "All partners are required to protect your information and use it only for service delivery. We do not sell or misuse your personal data."
    },
    {
      id: 5,
      title: "5. Data Security",
      content: "We take appropriate measures to protect your information, including:",
      points: [
        "Secure systems and restricted access",
        "Encrypted communication where applicable",
        "Trusted payment gateways"
      ],
      note: "However, no system is 100% secure, and users should also take precautions."
    },
    {
      id: 6,
      title: "6. Cookies Policy",
      content: "Our website may use cookies to:",
      points: [
        "Improve user experience",
        "Analyze website traffic",
        "Remember your preferences"
      ],
      note: "You can disable cookies through your browser settings."
    },
    {
      id: 7,
      title: "7. Your Rights",
      content: "You have the right to:",
      points: [
        "Request access to your personal data",
        "Correct inaccurate information",
        "Request deletion of your data",
        "Withdraw consent for marketing communications"
      ],
      note: "Many travel companies allow users to control and access their personal data under privacy practices"
    },
    {
      id: 8,
      title: "8. Data Retention",
      content: "We keep your information only as long as necessary to:",
      points: [
        "Complete your travel services",
        "Meet legal and regulatory requirements",
        "Resolve disputes"
      ]
    },
    {
      id: 9,
      title: "9. Third-Party Links",
      content: "Our website may contain links to external websites. We are not responsible for their privacy practices."
    },
    {
      id: 10,
      title: "10. Updates to This Policy",
      content: "We may update this Privacy Policy from time to time. Any changes will be posted on our website."
    },
    {
      id: 11,
      title: "11. Contact Us",
      content: "For any questions regarding this Privacy Policy:",
      details: [
        "Serendib Travels and Tours",
        "Email: inbound_manager@serendibdestinations.com",
        "Phone: 0744110416",
        "No.87, Pannipitiya Road, Battramulla"
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: 'hsl(var(--background))' }}>
      <SEO 
        title="Privacy Policy | Serendib Travel"
        description="Learn how Serendib Travel & Tours collects, uses, and protects your personal data."
      />
      <SubHero 
        title={t.privacyTitle || 'Privacy Policy'}
        subtitle={t.privacySubtitle || 'Your privacy is our priority. We are committed to safeguarding your personal data and ensuring transparency in how we handle your information.'}
        label={t.legalLabel || 'Legals & Policies'}
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
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
        {privacyData.map((section, index) => (
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
                color: section.points || section.subsections || section.details ? 'hsl(var(--foreground) / 0.8)' : 'hsl(var(--foreground) / 0.7)',
                marginBottom: section.points || section.subsections || section.details ? '1.5rem' : 0
              }}>
                {section.content}
              </p>
            )}

            {section.subsections && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
                {section.subsections.map((sub, i) => (
                  <div key={i}>
                    <h4 style={{ 
                      fontSize: '1.3rem', 
                      color: 'hsl(var(--secondary))', 
                      marginBottom: '1rem',
                      fontWeight: 700 
                    }}>
                      {sub.subtitle}
                    </h4>
                    <ul style={{ 
                      listStyle: 'none', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.75rem' 
                    }}>
                      {sub.points.map((point, j) => (
                        <li key={j} style={{ 
                          display: 'flex', 
                          gap: '1rem',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          color: 'hsl(var(--foreground) / 0.7)'
                        }}>
                          <span style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
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
                    <span style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.note && (
              <p style={{ 
                marginTop: '1.5rem', 
                fontSize: '1rem', 
                fontStyle: 'italic', 
                color: 'hsl(var(--foreground) / 0.5)',
                paddingLeft: '1.5rem',
                borderLeft: '3px solid hsl(var(--primary) / 0.2)'
              }}>
                {section.note}
              </p>
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
                  <p key={i} style={{ fontWeight: i === 0 ? 700 : 500, color: 'hsl(var(--secondary))' }}>
                    {detail}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </section>

      {/* Decorative Background Elements */}
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

export default PrivacyPolicy;
