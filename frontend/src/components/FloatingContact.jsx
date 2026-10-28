import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Phone, Mail, X, Send } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import API_URL from '../config';

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function FloatingContact() {
  const { localizedSettings: settings, t } = useSite();
  const titleId = useId();
  const messageId = useId();
  const emailId = useId();
  const messageRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const phone =
    settings?.contactPhone || '+94 77 113 3100';
  const email =
    settings?.contactEmail || 'ticketing@serendibgroups.com';

  // Same number as hotline — digits only for wa.me
  const whatsappDigits = phone.replace(/\D/g, '');

  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}`
    : '';

  const closePopup = () => {
    if (sending) return;
    setOpen(false);
    setError('');
    setSent(false);
  };

  const openPopup = (presetMessage = '') => {
    setError('');
    setSent(false);
    if (typeof presetMessage === 'string' && presetMessage.trim()) {
      setMessage(presetMessage.trim());
    }
    setOpen(true);
  };

  useEffect(() => {
    const onOpenEmailPopup = (event) => {
      const preset = event?.detail?.message;
      openPopup(typeof preset === 'string' ? preset : '');
    };
    window.addEventListener('serendib:open-email', onOpenEmailPopup);
    return () => window.removeEventListener('serendib:open-email', onOpenEmailPopup);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !sending) {
        setOpen(false);
        setError('');
        setSent(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const tFocus = window.setTimeout(() => {
      messageRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(tFocus);
    };
  }, [open, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError('Please enter your message.');
      return;
    }

    setSending(true);
    setError('');
    setSent(false);

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          email: senderEmail.trim(),
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to send message.');
      }

      setSent(true);
      setMessage('');
      setSenderEmail('');
    } catch (err) {
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const popup = open
    ? createPortal(
        <div
          className="email-popup-overlay"
          role="presentation"
          onClick={closePopup}
        >
          <div
            className="email-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="email-popup__header">
              <h2 id={titleId} className="email-popup__title">
                Send a message
              </h2>
              <button
                type="button"
                className="email-popup__close"
                onClick={closePopup}
                aria-label="Close"
                disabled={sending}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <p className="email-popup__to">
              To: <strong>{email}</strong>
            </p>

            {sent ? (
              <div className="email-popup__success" role="status">
                <p>Your message has been sent. Thank you!</p>
                <button
                  type="button"
                  className="btn-primary email-popup__btn"
                  onClick={closePopup}
                >
                  Close
                </button>
              </div>
            ) : (
              <form className="email-popup__form" onSubmit={handleSend}>
                <label htmlFor={emailId} className="email-popup__label">
                  Your email (optional)
                </label>
                <input
                  id={emailId}
                  className="form-control"
                  type="email"
                  autoComplete="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="so we can reply to you"
                  disabled={sending}
                />

                <label htmlFor={messageId} className="email-popup__label">
                  Enter your message
                </label>
                <textarea
                  id={messageId}
                  ref={messageRef}
                  className="form-control email-popup__message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here…"
                  required
                  disabled={sending}
                />

                {error && (
                  <p className="email-popup__error" role="alert">
                    {error}
                  </p>
                )}

                <div className="email-popup__actions">
                  <button
                    type="button"
                    className="email-popup__btn email-popup__btn--cancel"
                    onClick={closePopup}
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary email-popup__btn"
                    disabled={sending || !message.trim()}
                  >
                    <Send size={16} aria-hidden="true" />
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <aside className="floating-contact" aria-label={t.navContact || 'Contact'}>
        <a
          href={phoneHref}
          className="floating-contact__btn"
          aria-label={`Call ${phone}`}
          title={phone}
        >
          <Phone size={20} strokeWidth={2} aria-hidden="true" />
        </a>
        {whatsappHref && (
          <a
            href={whatsappHref}
            className="floating-contact__btn floating-contact__btn--whatsapp"
            aria-label={`WhatsApp ${phone}`}
            title={`WhatsApp ${phone}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={20} />
          </a>
        )}
        <button
          type="button"
          className="floating-contact__btn"
          aria-label={`Email ${email}`}
          title={email}
          onClick={openPopup}
        >
          <Mail size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </aside>
      {popup}
    </>
  );
}
