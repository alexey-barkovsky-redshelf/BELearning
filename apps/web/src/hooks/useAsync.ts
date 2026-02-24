import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Хук для запроса по зависимостям: при смене deps вызывается fn(), результат в data/loading/error.
 * Удобно для «загрузить при монтировании / при смене userId» и т.п.
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
          const message = options?.onError?.(e) ?? (e instanceof Error ? e.message : 'Request failed');
          setError(message);
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
        const message = options?.onError?.(e) ?? (e instanceof Error ? e.message : 'Request failed');
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [enabled, ...deps]);

  return { data, loading, error, refetch };
}
