import { useCallback, useState } from 'react';

function getErrorMessage(e: unknown, custom?: (e: unknown) => string): string {
  return custom?.(e) ?? (e instanceof Error ? e.message : 'Request failed');
}

export function useAsyncRequest<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (fn: () => Promise<T>, options?: { onError?: (e: unknown) => string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (e) {
      setError(getErrorMessage(e, options?.onError));
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
