import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

/** Minimal i18n: JSON locale files + traverse/interpolate. For pluralization/namespaces consider react-i18next. */
const messages: Record<string, Record<string, unknown>> = { en: en as Record<string, unknown>, ru: ru as Record<string, unknown> };

const STORAGE_KEY = 'belearning-lang';

type Lang = 'ru' | 'en';

function getStoredLang(): Lang {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'en' || s === 'ru') {
      return s;
    }
  } catch {}
  return 'en';
}

function traverse(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

function interpolate(str: string, params: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ''));
}

type TFunction = (key: string, params?: Record<string, string | number>) => string;

type LocaleContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const t = useCallback<TFunction>(
    (key, params) => {
      const raw = traverse(messages[lang], key);
      const str = raw ?? key;
      return params ? interpolate(str, params) : str;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t }),
    [lang, setLang, t]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useTranslation() {
  const { t, lang, setLang } = useLocale();
  return { t, i18n: { language: lang, changeLanguage: setLang } };
}
