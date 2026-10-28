import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from 'lucide-react';
import serendibLogo from '../assets/serendib-logo.png';
import { useSite } from '../context/SiteContext';

/** Brand icons (lucide no longer ships trademarked social icons). */
function SocialSvg({ children, size = 18, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function InstagramIcon({ size }) {
  return (
    <SocialSvg size={size}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </SocialSvg>
  );
}

function FacebookIcon({ size }) {
  return (
    <SocialSvg size={size}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </SocialSvg>
  );
}

function YoutubeIcon({ size }) {
  return (
    <SocialSvg size={size}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </SocialSvg>
  );
}

export default function Footer() {
  const { t, localizedSettings: settings } = useSite();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const companyName = settings?.companyName || 'Serendib Travel & Tours';
  // Prefer admin-set logo only when it looks like a real URL; otherwise use the bundled brand mark.
  const configuredLogo = (settings?.companyLogo || '').trim();
  const logoSrc =
    configuredLogo && /^(https?:\/\/|\/|data:)/i.test(configuredLogo)
      ? configuredLogo
      : serendibLogo;
  const year = new Date().getFullYear();

  const phone = settings?.contactPhone || '+94 77 113 3100';
  const emailAddr = settings?.contactEmail || 'ticketing@serendibgroups.com';
  const address = settings?.contactAddress || 'Colombo, Sri Lanka';
  const whatsapp = (settings?.contactWhatsApp || '').replace(/\D/g, '');

  const socials = [
    { Icon: InstagramIcon, href: settings?.socialInstagram, label: 'Instagram' },
    { Icon: FacebookIcon, href: settings?.socialFacebook, label: 'Facebook' },
    {
      Icon: MessageCircle,
      href: whatsapp ? `https://wa.me/${whatsapp}` : '',
      label: 'WhatsApp',
    },
    { Icon: YoutubeIcon, href: settings?.socialYoutube, label: 'YouTube' },
  ].filter((s) => Boolean(s.href));

  const exploreLinks = [
    { to: '/inbound', label: t.footerExploreInbound },
    { to: '/outbound', label: t.footerExploreOutbound },
    { to: '/blog', label: t.footerExploreCuratedBlogs },
    { to: '/booking', label: t.navBookingMain },
  ];

  const companyLinks = [
    { to: '/#about', label: t.navAbout },
    { to: '/services', label: t.navServices },
    { to: '/inbound#reviews', label: t.navReviews },
    { to: '/inbound#contact', label: t.navContact },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__accent" aria-hidden="true" />

      <div className="site-footer__inner">
        <div className="site-footer__grid">
          {/* Brand */}
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__brand-link" aria-label={companyName}>
              <img
                src={logoSrc}
                alt={companyName}
                className="site-footer__logo"
                onError={(e) => {
                  if (e.currentTarget.dataset.fallbackApplied) return;
                  e.currentTarget.dataset.fallbackApplied = '1';
                  e.currentTarget.src = serendibLogo;
                }}
              />
            </Link>

            <p className="site-footer__desc">
              {t.footerDescription ||
                'Crafting unforgettable journeys across Sri Lanka and beyond.'}
            </p>

            {socials.length > 0 && (
              <div className="site-footer__socials">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="site-footer__social"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <nav className="site-footer__col" aria-label={t.footerExploreTitle}>
            <h2 className="site-footer__heading">{t.footerExploreTitle}</h2>
            <ul className="site-footer__links">
              {exploreLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="site-footer__link">
                    {label}
                    <ArrowUpRight size={14} className="site-footer__link-icon" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav className="site-footer__col" aria-label={t.footerCompanyTitle || 'Company'}>
            <h2 className="site-footer__heading">{t.footerCompanyTitle || 'Company'}</h2>
            <ul className="site-footer__links">
              {companyLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="site-footer__link">
                    {label}
                    <ArrowUpRight size={14} className="site-footer__link-icon" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + Newsletter */}
          <div className="site-footer__col site-footer__col--wide">
            <h2 className="site-footer__heading">{t.footerContactTitle || t.navContact}</h2>
            <ul className="site-footer__contact">
              <li>
                <MapPin size={16} aria-hidden="true" />
                <span>{address}</span>
              </li>
              <li>
                <Phone size={16} aria-hidden="true" />
                <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
              </li>
              <li>
                <Mail size={16} aria-hidden="true" />
                <a href={`mailto:${emailAddr}`}>{emailAddr}</a>
              </li>
            </ul>

            <form className="site-footer__newsletter" onSubmit={handleSubscribe}>
              <p className="site-footer__newsletter-label">{t.footerNewsletterTitle}</p>
              <div className="site-footer__newsletter-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t.footerEmailPlaceholder}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footerEmailPlaceholder}
                  autoComplete="email"
                />
                <button type="submit" className="btn btn-primary site-footer__subscribe">
                  {subscribed ? (t.footerSubscribed || 'Thank you') : t.footerSubscribeNow}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">
            <Link to="/admin" className="site-footer__admin-mark" title="Admin Access">
              ©
            </Link>
            {` ${year} ${companyName}. All rights reserved.`}
          </p>
          <div className="site-footer__legal">
            <Link to="/privacy">{t.footerPrivacyPolicy}</Link>
            <Link to="/terms">{t.footerTerms}</Link>
            <Link to="/cookies">{t.footerCookies}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
