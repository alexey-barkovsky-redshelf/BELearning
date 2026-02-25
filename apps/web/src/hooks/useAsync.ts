import { useCallback, useEffect, useRef, useState } from 'react';

function getErrorMessage(e: unknown, custom?: (e: unknown) => string): string {
  return custom?.(e) ?? (e instanceof Error ? e.message : 'Request failed');
}

/**
 * Hook for request by deps: when deps change, fn() runs; result in data/loading/error.
 * Use for "load on mount / on userId change" etc.
 *
 * When to use which:
 * - useAsync: load data when deps change (e.g. mount, userId). Use refetch() to reload.
 * - useAsyncRequest: run an action on demand (e.g. submit form, button click).
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList,
  options?: { onError?: (e: unknown) => string; enabled?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fnRef.current()
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(getErrorMessage(e, options?.onError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, ...deps]);

  const refetch = useCallback(() => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    fnRef.current()
      .then(setData)
      .catch((e) => {
        setError(getErrorMessage(e, options?.onError));
      })
      .finally(() => setLoading(false));
  }, [enabled, ...deps]);

  return { data, loading, error, refetch };
}
