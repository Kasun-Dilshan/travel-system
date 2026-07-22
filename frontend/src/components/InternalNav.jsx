import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const InternalNav = ({ links, accentColor = 'hsl(var(--primary))' }) => {
  const [activeSection, setActiveSection] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      // Check if sticky
      setIsSticky(window.scrollY > 400);

      // Check active section
      const scrollPosition = window.scrollY + 180; // Adjusted offset for better trigger point
      
      let currentSection = '';
      for (const link of links) {
        const element = document.getElementById(link.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = link.id;
            break;
          }
        }
      }
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [links, activeSection]);

  // Center the active link when it changes
  useEffect(() => {
    if (activeSection && containerRef.current) {
      const activeElement = containerRef.current.querySelector(`[data-section-id="${activeSection}"]`);
      if (activeElement) {
        const container = containerRef.current;
        const scrollLeft = activeElement.offsetLeft - (container.offsetWidth / 2) + (activeElement.offsetWidth / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSection]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav 
      className={`internal-nav ${isSticky ? 'sticky' : ''}`}
      style={{
        position: isSticky ? 'fixed' : 'relative',
        top: isSticky ? '88px' : '0',
        left: '0',
        width: '100%',
        zIndex: 40,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div 
        ref={containerRef}
        className="glass-nav"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '1.25rem 5%',
          display: 'flex',
          gap: '2.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          borderBottom: isSticky ? '1px solid hsla(var(--primary) / 0.1)' : 'none',
          boxShadow: isSticky ? '0 15px 35px -10px rgba(0,0,0,0.08)' : 'none',
          scrollSnapType: 'x mandatory'
        }}
      >
        <style>
          {`
            .internal-nav .glass-nav::-webkit-scrollbar {
              display: none;
            }
            .nav-link {
              white-space: nowrap;
              font-weight: 600;
              font-size: 0.95rem;
              color: hsl(var(--foreground) / 0.4);
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              padding: 0.25rem 0;
              scroll-snap-align: center;
            }
            .nav-link:hover {
              color: ${accentColor};
              transform: translateY(-1px);
            }
            .nav-link.active {
              color: ${accentColor};
              font-weight: 700;
              transform: scale(1.05);
            }
            .nav-link.active::after {
              content: '';
              position: absolute;
              bottom: -4px;
              left: 0;
              width: 100%;
              height: 2.5px;
              background-color: ${accentColor};
              border-radius: 99px;
              box-shadow: 0 2px 10px -2px ${accentColor};
            }
          `}
        </style>
        {links.map((link) => (
          link.path ? (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
              style={{ textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ) : (
            <div
              key={link.id}
              data-section-id={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
            >
              {link.label}
            </div>
          )
        ))}
      </div>
    </nav>
  );
};

export default InternalNav;
