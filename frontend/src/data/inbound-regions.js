import { DESTINATIONS } from './destinations';

const byId = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));

function place(id) {
  return byId[id];
}

/** Sri Lanka regions → destinations for the inbound filter mega-menu. */
export const INBOUND_REGIONS = [
  {
    id: 'cultural-triangle',
    name: 'Cultural Triangle',
    description: 'Ancient cities, temples, and UNESCO heritage.',
    image: place('sigiriya')?.image,
    destinations: [place('sigiriya'), place('kandy')].filter(Boolean),
  },
  {
    id: 'hill-country',
    name: 'Hill Country',
    description: 'Tea estates, cool climate, and mountain views.',
    image: place('nuwara-eliya')?.image,
    destinations: [place('nuwara-eliya'), place('kandy')].filter(Boolean),
  },
  {
    id: 'south-coast',
    name: 'South Coast',
    description: 'Beaches, colonial forts, and ocean wildlife.',
    image: place('mirissa')?.image,
    destinations: [place('mirissa'), place('galle'), place('yala')].filter(Boolean),
  },
  {
    id: 'east-coast',
    name: 'East Coast',
    description: 'Golden beaches and calm turquoise bays.',
    image: place('trincomalee')?.image,
    destinations: [place('trincomalee')].filter(Boolean),
  },
  {
    id: 'wildlife',
    name: 'Wildlife',
    description: 'Safari parks and untamed wilderness.',
    image: place('yala')?.image,
    destinations: [place('yala'), place('wilpattu')].filter(Boolean),
  },
];

/** Match inbound packages to a tour type (region). Prefers saved IDs. */
export function filterPackagesByInboundRegion(packages, region) {
  if (!packages?.length) return [];
  if (!region) return packages;

  const regionId = String(region.id || '').trim();
  const placeIds = (region.destinations || []).map((d) => d?.id).filter(Boolean);

  return packages.filter((pkg) => {
    const pkgRegionId = String(pkg.inboundRegionId || '').trim();
    if (pkgRegionId) return pkgRegionId === regionId;

    const pkgDestinationId = String(pkg.destinationId || '').trim();
    if (pkgDestinationId && placeIds.includes(pkgDestinationId)) return true;

    // Legacy packages without explicit inbound links
    const keys = [region.id, region.name, ...placeIds, ...(region.destinations || []).flatMap((d) => [d?.name, ...(d?.matchKeys || [])])]
      .filter(Boolean)
      .map((k) => String(k).toLowerCase());
    const haystack = `${pkg.title || ''} ${pkg.description || ''} ${pkg.location || ''}`.toLowerCase();
    return keys.some((key) => haystack.includes(key));
  });
}

/** Match inbound packages to a location. Prefers saved destinationId. */
export function filterPackagesByDestination(packages, destination, regionId = null) {
  if (!packages?.length) return [];
  if (!destination) return packages;

  const keys = [destination.id, destination.name, ...(destination.matchKeys || [])]
    .filter(Boolean)
    .map((k) => String(k).toLowerCase());

  return packages.filter((pkg) => {
    const pkgDestinationId = String(pkg.destinationId || '').trim();
    if (pkgDestinationId) {
      if (pkgDestinationId !== destination.id) return false;
      const pkgRegionId = String(pkg.inboundRegionId || '').trim();
      if (regionId && pkgRegionId && pkgRegionId !== regionId) return false;
      return true;
    }

    // Legacy / demo packages without an explicit destination link
    const haystack = `${pkg.title || ''} ${pkg.description || ''} ${pkg.location || ''}`.toLowerCase();
    return keys.some((key) => haystack.includes(key));
  });
}
