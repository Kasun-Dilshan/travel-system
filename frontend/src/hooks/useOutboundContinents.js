import { useEffect, useState } from 'react';
import API_URL from '../config';
import {
  OUTBOUND_CONTINENTS,
  mergeContinentsWithFallback,
} from '../data/outbound-regions';

const FETCH_TIMEOUT_MS = 12000;

/**
 * Loads admin-managed destinations from the API, with static fallback.
 * Starts with seed data so country pages can render immediately.
 */
export default function useOutboundContinents() {
  const [continents, setContinents] = useState(OUTBOUND_CONTINENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
      : null;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/destinations`, {
          signal: controller?.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch destinations (${res.status})`);
        const data = await res.json();
        if (!cancelled) {
          setContinents(mergeContinentsWithFallback(data, OUTBOUND_CONTINENTS));
        }
      } catch (err) {
        if (!cancelled) {
          const aborted = err?.name === 'AbortError';
          setError(
            aborted
              ? 'Destinations request timed out'
              : err?.message || 'Failed to load destinations'
          );
          setContinents(OUTBOUND_CONTINENTS);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      controller?.abort?.();
    };
  }, []);

  return { continents, isLoading, error, setContinents };
}
