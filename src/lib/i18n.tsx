// ─────────────────────────────────────────────────────────────────────────────
// Locale + region context for the prototype.
//
//  - <LocaleProvider> wraps the app once. Persists to localStorage.
//  - useLocale()  → { locale, setLanguage, setRegion, setLocale }
//  - useT()       → t(key) — resolves a translation with fallback chain
//  - useRegion()  → the active region's config (connectors, consents, etc.)
//
// String resolution chain:  `${lang}-${region}` → `${lang}` → 'en' → key
//
// Strings live in JSON files at src/i18n/locales/*.json so they can be edited
// by anyone without touching TypeScript. See src/i18n/README.md for the format.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  regions,
  type Region,
  type RegionConfig,
  type RegionLanguage,
} from '../i18n/regions';
import enBase from '../i18n/locales/en.json';
import deBase from '../i18n/locales/de.json';
import enUS from '../i18n/locales/en-US.json';
import enGermany from '../i18n/locales/en-Germany.json';
import deUS from '../i18n/locales/de-US.json';
import deGermany from '../i18n/locales/de-Germany.json';

// ── Public types ────────────────────────────────────────────────────────────

export type Language = RegionLanguage;
export type { Region, RegionConfig };

/**
 * The set of valid translation keys, derived from en.json. Every key in en.json
 * gets autocomplete in editors. Other locales may legally be missing keys —
 * the resolver falls back to English in that case.
 */
export type StringKey = keyof typeof enBase;

export interface Locale {
  language: Language;
  region: Region;
}

// ── Defaults & persistence ──────────────────────────────────────────────────

const STORAGE_KEY = 'presence:locale';
const DEFAULT_LOCALE: Locale = { language: 'en', region: 'Germany' };

function loadStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOCALE;
    const parsed = JSON.parse(raw) as Partial<Locale> | null;
    const language: Language = parsed?.language === 'de' ? 'de' : 'en';
    // Region is no longer user-controlled (the picker was removed from the
    // ProfileMenu). Always default to Germany so users who had a stale `US`
    // value stored from the old default aren't stuck on it. Devs can still
    // call setRegion() programmatically; the value just won't survive a reload.
    return { language, region: 'Germany' };
  } catch {
    return DEFAULT_LOCALE;
  }
}

function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(locale));
  } catch {
    /* swallow — storage may be blocked (private mode, quota, etc.) */
  }
}

// ── Resolver ────────────────────────────────────────────────────────────────

const dictionaries: Record<string, Record<string, string>> = {
  en:        enBase as Record<string, string>,
  de:        deBase as Record<string, string>,
  'en-US':   enUS as Record<string, string>,
  'en-Germany': enGermany as Record<string, string>,
  'de-US':   deUS as Record<string, string>,
  'de-Germany': deGermany as Record<string, string>,
};

function resolveString(key: string, locale: Locale): string {
  const composite = `${locale.language}-${locale.region}`;
  return (
    dictionaries[composite]?.[key] ??
    dictionaries[locale.language]?.[key] ??
    dictionaries.en[key] ??
    key
  );
}

// ── Context + Provider ──────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLanguage: (language: Language) => void;
  /**
   * Switch region. Keeps the current language if the new region supports it,
   * otherwise adopts the region's default language.
   */
  setRegion: (region: Region) => void;
  /** Direct setter — escape hatch for cases where you want full control. */
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => loadStoredLocale());

  useEffect(() => {
    persistLocale(locale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale.language;
    }
  }, [locale]);

  const setLanguage = useCallback((language: Language) => {
    setLocaleState(prev => (prev.language === language ? prev : { ...prev, language }));
  }, []);

  const setRegion = useCallback((region: Region) => {
    setLocaleState(prev => {
      if (prev.region === region) return prev;
      const cfg = regions[region];
      const language = cfg.availableLanguages.includes(prev.language)
        ? prev.language
        : cfg.defaultLanguage;
      return { region, language };
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(prev =>
      prev.language === next.language && prev.region === next.region ? prev : next
    );
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLanguage, setRegion, setLocale }),
    [locale, setLanguage, setRegion, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}

/**
 * Returns a translation function. Pass a typed StringKey for autocomplete; pass
 * `string` (cast at the call site) when the key is built dynamically.
 *
 * Optional `vars` substitute `{name}` placeholders in the resolved string:
 *   t('dashboard.feed.footer.count', { count: 12 })  // "12 updates this week"
 */
export function useT(): (key: StringKey | string, vars?: Record<string, string | number>) => string {
  const { locale } = useLocale();
  return useCallback((key: StringKey | string, vars?: Record<string, string | number>) => {
    let value = resolveString(key, locale);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return value;
  }, [locale]);
}

export function useRegion(): RegionConfig {
  const { locale } = useLocale();
  return regions[locale.region];
}
