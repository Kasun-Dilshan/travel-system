import { useEffect, useState } from 'react';
import API_URL from '../config';
import {
  OUTBOUND_CONTINENTS,
  mergeContinentsWithFallback,
} from '../data/outbound-regions';

/**
 * Loads admin-managed destinations from the API, with static fallback.
 */
export default function useOutboundContinents() {
  const [continents, setContinents] = useState(OUTBOUND_CONTINENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/destinations`);
        if (!res.ok) throw new Error(`Failed to fetch destinations (${res.status})`);
        const data = await res.json();
        if (!cancelled) {
          setContinents(mergeContinentsWithFallback(data, OUTBOUND_CONTINENTS));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load destinations');
          setContinents(OUTBOUND_CONTINENTS);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { continents, isLoading, error, setContinents };
}
