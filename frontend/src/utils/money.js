// Package prices are stored with an explicit currency (`packages.currency`, default USD).
// Display helpers convert between USD and LKR using the live/site rate.

function readNumberEnv(name, fallback) {
  try {
    const raw = import.meta?.env?.[name];
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

export const SUPPORTED_CURRENCIES = /** @type {const} */ (['USD', 'LKR']);

export function getUsdToLkrRate() {
  // Keep as env-configurable so you can update without code changes.
  // Example: VITE_USD_TO_LKR=305
  return readNumberEnv('VITE_USD_TO_LKR', 300);
}

export function getUsdToLkrRateRefreshMs() {
  // MoneyConvert updates every ~5 minutes; keep a small buffer.
  // You can override in env (milliseconds), e.g. 300000.
  return readNumberEnv('VITE_USD_TO_LKR_REFRESH_MS', 5 * 60 * 1000);
}

export function normalizeCurrency(value) {
  const s = String(value || '').trim().toUpperCase();
  return SUPPORTED_CURRENCIES.includes(s) ? s : 'USD';
}

export async function fetchLiveUsdToLkrRate({ signal } = {}) {
  // Source: https://moneyconvert.net/api/ (no auth, updates frequently)
  const res = await fetch('https://cdn.moneyconvert.net/api/latest.json', {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Rate fetch failed: ${res.status}`);
  }
  const data = await res.json();
  const rate = Number(data?.rates?.LKR);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('Invalid LKR rate');
  }
  return {
    rate,
    source: 'moneyconvert',
    asOfMs: Date.now(),
    base: String(data?.base || 'USD'),
  };
}

function resolveRate(usdToLkrRate) {
  return Number.isFinite(Number(usdToLkrRate)) && Number(usdToLkrRate) > 0
    ? Number(usdToLkrRate)
    : getUsdToLkrRate();
}

/** Convert an amount from one supported currency to another (via USD). */
export function convertAmount(amount, fromCurrency, toCurrency, { usdToLkrRate } = {}) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);
  if (from === to) return value;

  const rate = resolveRate(usdToLkrRate);
  const asUsd = from === 'USD' ? value : value / rate;
  return to === 'USD' ? asUsd : asUsd * rate;
}

/** @deprecated Prefer convertAmount — kept for older call sites that assume USD storage. */
export function convertFromUsd(usdAmount, currency, { usdToLkrRate } = {}) {
  return convertAmount(usdAmount, 'USD', currency, { usdToLkrRate });
}

export function formatMoney(amount, currency, options = {}) {
  const to = normalizeCurrency(currency);
  const from = normalizeCurrency(options.fromCurrency || 'USD');
  const value = convertAmount(amount, from, to, { usdToLkrRate: options.usdToLkrRate });
  const locale = options.locale || (to === 'LKR' ? 'en-LK' : 'en-US');

  // Current UI shows whole-number prices, so keep it consistent.
  const digits = typeof options.maximumFractionDigits === 'number'
    ? options.maximumFractionDigits
    : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: to,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  } catch {
    // Last-resort fallback
    const rounded = Math.round(value);
    return to === 'LKR' ? `LKR ${rounded.toLocaleString()}` : `$${rounded.toLocaleString()}`;
  }
}
