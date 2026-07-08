import React from 'react';
import { useSite } from '../context/SiteContext';
import { SUPPORTED_CURRENCIES } from '../utils/money';

export default function CurrencyPicker({ darkMode }) {
  const { currency, setCurrency } = useSite();

  const baseStyle = {
    padding: '0.45rem 0.75rem',
    borderRadius: '999px',
    fontWeight: 800,
    fontSize: '0.82rem',
    border: '1px solid',
    cursor: 'pointer',
    outline: 'none',
    background: darkMode ? 'rgba(255,255,255,0.12)' : 'white',
    color: darkMode ? 'white' : 'hsl(var(--foreground))',
    borderColor: darkMode ? 'rgba(255,255,255,0.25)' : 'hsl(var(--glass-border))',
    backdropFilter: darkMode ? 'blur(8px)' : undefined,
  };

  return (
    <select
      aria-label="Currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      style={baseStyle}
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c === 'USD' ? 'USD ($)' : 'LKR (Rs)'}
        </option>
      ))}
    </select>
  );
}

