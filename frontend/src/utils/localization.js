export function normalizeLanguageCode(language) {
  const raw = String(language || '').trim().toLowerCase();
  if (!raw) return 'en';
  let base = raw;
  if (base.includes('-')) base = base.split('-')[0];
  if (base.includes('_')) base = base.split('_')[0];

  // Common aliases used in UI/legacy storage.
  // Keep this conservative and explicit.
  if (base === 'cn') return 'zh';
  if (base === 'zh-cn' || base === 'zh-hans') return 'zh';

  return base;
}

function parseObjectLike(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return {};
  const trimmed = value.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getLocalizationBucket(item, language) {
  const localizations = {
    ...parseObjectLike(item?.localizations),
    ...parseObjectLike(item?.translations),
    ...parseObjectLike(item?.i18n),
    ...parseObjectLike(item?.localized),
    ...parseObjectLike(item?.locale),
  };
  const normalizedLang = normalizeLanguageCode(language);
  const fallbackOrder = [language, normalizedLang, 'en'];

  for (const key of fallbackOrder) {
    if (!key) continue;
    const direct = localizations[key];
    if (direct && typeof direct === 'object') return direct;
  }

  for (const [key, value] of Object.entries(localizations)) {
    if (normalizeLanguageCode(key) === normalizedLang && value && typeof value === 'object') {
      return value;
    }
  }

  return {};
}
