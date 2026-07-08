import { INBOUND_PACKAGES, OUTBOUND_PACKAGES } from '../data/tours';
import { normalizeLanguageCode } from './localization';

const ALL_FALLBACK_PACKAGES = [...INBOUND_PACKAGES, ...OUTBOUND_PACKAGES];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function findFallbackPackage(pkg) {
  if (!pkg) return null;
  const pkgId = pkg.id ?? pkg._id;
  const pkgTitle = normalizeText(pkg.title);

  return (
    ALL_FALLBACK_PACKAGES.find((item) => (item.id ?? item._id) === pkgId) ||
    ALL_FALLBACK_PACKAGES.find((item) => normalizeText(item.title) === pkgTitle) ||
    null
  );
}

export function getPackageLocalizationFallback(pkg, language) {
  const source = findFallbackPackage(pkg);
  if (!source || !source.localizations) return {};
  const lang = normalizeLanguageCode(language);
  return source.localizations?.[lang] || source.localizations?.en || {};
}

