import type { ListProductsPageSize } from '@belearning/shared';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { MAIN_ELEMENT_ID } from '../constants/layoutIds';

export function useProductListScroll(page: number, pageSize: ListProductsPageSize) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollKey = `product-list:${location.key}`;
  const scrollRestorationTouched = useRef(false);

  useEffect(() => {
    if (scrollRestorationTouched.current) {
      return;
    }
    scrollRestorationTouched.current = true;
    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      /* empty */
    }
  }, []);

  useLayoutEffect(() => {
    if (navigationType !== 'POP') {
      return;
    }
    const raw = sessionStorage.getItem(scrollKey);
    if (raw === null) {
      return;
    }
    const y = Number(raw);
    if (Number.isFinite(y)) {
      window.scrollTo(0, y);
    }
  }, [scrollKey, navigationType]);

  useEffect(() => {
    const onScroll = () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      onScroll();
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollKey]);

  const prev = useRef<{ page: number; pageSize: ListProductsPageSize } | null>(null);
  useEffect(() => {
    if (prev.current === null) {
      prev.current = { page, pageSize };
      return;
    }
    const changed = prev.current.page !== page || prev.current.pageSize !== pageSize;
    prev.current = { page, pageSize };
    if (!changed || navigationType === 'POP') {
      return;
    }
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(MAIN_ELEMENT_ID)?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start',
    });
  }, [page, pageSize, navigationType]);
}
