// Prefer same-origin `/api` so Vite/Vercel/proxies can route requests.
// If you host the PHP backend elsewhere, set `VITE_API_URL` to that origin + `/api`.
// Example: https://your-domain.com/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

/** Strips accidental " []" / JSON-array junk from stored image paths (see package `image` column). */
export function sanitizeMediaPath(path) {
  if (path == null) return '';
  if (Array.isArray(path)) {
    const first = path.find((x) => typeof x === 'string' && String(x).trim());
    return first != null ? sanitizeMediaPath(first) : '';
  }
  if (typeof path !== 'string') return '';
  let s = path.trim();
  if (!s) return '';
  s = s.replace(/\s*\[\]\s*$/u, '').trim();
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === 'string') {
        return sanitizeMediaPath(parsed[0]);
      }
    } catch {
      /* ignore */
    }
  }
  // Fix common misspellings from older saves.
  s = s.replace(/(^|\/)uplods(\/|$)/giu, '$1uploads$2');
  s = s.replace(/(^|\/)pakejes(\/|$)/giu, '$1packages$2');
  return s;
}

/**
 * Resolves package/blog image URLs. Paths under `/uploads/` are stored by the PHP API
 * on the backend host; the browser must request that host (not only the Vite dev origin).
 *
 * Precedence: absolute `VITE_API_URL` origin → `VITE_PHP_BACKEND_URL` → dev default
 * `http://localhost:8000` → same-origin relative path (production behind one host).
 */
export function mediaUrl(path) {
  const trimmed = sanitizeMediaPath(path);
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const isUpload = normalized.startsWith('/uploads/') || normalized.startsWith('uploads/');
  const uploadPath = normalized.startsWith('/') ? normalized : `/${normalized}`;

  if (!isUpload) return trimmed;

  const api = import.meta.env.VITE_API_URL || '/api';
  try {
    if (api.startsWith('http://') || api.startsWith('https://')) {
      const apiUrl = new URL(api);
      // If API is hosted in a subfolder (e.g. https://host/app/api),
      // uploads live next to it (https://host/app/uploads/...), not at domain root.
      const base = new URL(apiUrl.href);
      base.pathname = base.pathname.replace(/\/api\/?$/i, '/');
      base.search = '';
      base.hash = '';
      return new URL(uploadPath, base).href;
    }
  } catch {
    /* ignore */
  }

  const backend = String(import.meta.env.VITE_PHP_BACKEND_URL || '').trim().replace(/\/$/, '');
  if (/^https?:\/\//i.test(backend)) {
    try {
      const backendUrl = new URL(backend);
      const base = new URL(backendUrl.href);
      base.pathname = base.pathname.replace(/\/api\/?$/i, '/');
      base.search = '';
      base.hash = '';
      return new URL(uploadPath, base).href;
    } catch {
      /* ignore */
    }
  }

  // Prefer same-origin path.
  // In dev/preview, Vite can proxy `/uploads` to the PHP backend (see `vite.config.js`),
  // and in production a web server can serve `/uploads` directly from the same host.
  return uploadPath;
}

export default API_URL;

