// ─────────────────────────────────────────────────────────────────────────────
// Region configuration: integrations, connectors, consents, currencies, and
// formatting locale. Components consume this via `useRegion()` from src/lib/i18n.
//
// Adding a new region: add an entry to `regions`, extend the `Region` union,
// and add region-specific string overrides (e.g. 'de-CH') in src/i18n/strings.ts
// as needed. The string resolver already walks ${language}-${region} → ${language}
// → 'en', so per-region copy slots in without touching consumer code.
// ─────────────────────────────────────────────────────────────────────────────

export type Region = 'US' | 'Germany';

export type RegionLanguage = 'en' | 'de';

/**
 * A school-side integration (SIS, LMS, identity provider, comms platform, storage).
 * Distinct from the curricular "Apps" surface in AppsForSchoolsView.tsx
 * (Calcularis, Grafari, etc.) — those are learning products, these are systems.
 */
export interface ConnectorRef {
  id: string;
  name: string;
  category: 'sis' | 'lms' | 'identity' | 'comms' | 'storage' | 'other';
  /** Optional URL to the vendor's marketing site; safe to render as a link. */
  url?: string;
}

export interface ConsentRequirement {
  id: 'cookies' | 'analytics' | 'gdpr' | 'ccpa' | 'newsletter';
  required: boolean;
  /** Translation key for the consent label (resolved via useT). */
  labelKey: string;
  /** Translation key for the consent body (resolved via useT). */
  bodyKey: string;
}

export interface RegionConfig {
  id: Region;
  /** BCP-47 locale string for Intl.NumberFormat / Intl.DateTimeFormat. */
  intlLocale: string;
  /** ISO 4217 currency code. */
  currency: 'USD' | 'EUR' | 'CHF';
  /** Language picked when first switching to this region (or when current language isn't supported here). */
  defaultLanguage: RegionLanguage;
  /** Languages worth showing in the language switcher when this region is active. */
  availableLanguages: RegionLanguage[];
  /** Privacy regime — drives which consent banners apply. */
  privacyRegime: 'gdpr' | 'ccpa' | 'none';
  /** Recommended SIS / LMS / comms integrations for this region. */
  connectors: ConnectorRef[];
  /** Comm-Hub platform IDs to pre-select for this region. Must match CommPlatformId. */
  defaultCommPlatforms: string[];
  /** Consent requirements for this region. */
  consents: ConsentRequirement[];
}

export const regions: Record<Region, RegionConfig> = {
  US: {
    id: 'US',
    intlLocale: 'en-US',
    currency: 'USD',
    defaultLanguage: 'en',
    availableLanguages: ['en'],
    privacyRegime: 'ccpa',
    connectors: [
      { id: 'powerschool',      name: 'PowerSchool',      category: 'sis' },
      { id: 'clever',           name: 'Clever',           category: 'identity' },
      { id: 'classlink',        name: 'ClassLink',        category: 'identity' },
      { id: 'google-classroom', name: 'Google Classroom', category: 'lms' },
      { id: 'canvas',           name: 'Canvas',           category: 'lms' },
      { id: 'schoology',        name: 'Schoology',        category: 'lms' },
      { id: 'parentsquare',     name: 'ParentSquare',     category: 'comms' },
    ],
    // CommPlatformId currently only contains 'email' as a US-friendly option.
    // Phase 2: extend CommPlatformId to include 'parentsquare' / 'bloomz' and add here.
    defaultCommPlatforms: ['email'],
    consents: [
      { id: 'cookies',   required: false, labelKey: 'consent.cookies.label',   bodyKey: 'consent.cookies.body' },
      { id: 'analytics', required: false, labelKey: 'consent.analytics.label', bodyKey: 'consent.analytics.body' },
      { id: 'ccpa',      required: false, labelKey: 'consent.ccpa.label',      bodyKey: 'consent.ccpa.body' },
    ],
  },
  Germany: {
    id: 'Germany',
    intlLocale: 'de-DE',
    currency: 'EUR',
    defaultLanguage: 'de',
    availableLanguages: ['de', 'en'],
    privacyRegime: 'gdpr',
    connectors: [
      { id: 'iserv',       name: 'IServ',         category: 'lms' },
      { id: 'webuntis',    name: 'WebUntis',      category: 'sis' },
      { id: 'logineo',     name: 'LOGINEO NRW',   category: 'identity' },
      { id: 'sdui',        name: 'sdui',          category: 'comms' },
      { id: 'itslearning', name: 'itslearning',   category: 'lms' },
      { id: 'moodle',      name: 'Moodle',        category: 'lms' },
      { id: 'ms365',       name: 'Microsoft 365', category: 'storage' },
    ],
    defaultCommPlatforms: ['sdui', 'email'],
    consents: [
      { id: 'gdpr',      required: true,  labelKey: 'consent.gdpr.label',      bodyKey: 'consent.gdpr.body' },
      { id: 'cookies',   required: true,  labelKey: 'consent.cookies.label',   bodyKey: 'consent.cookies.body' },
      { id: 'analytics', required: false, labelKey: 'consent.analytics.label', bodyKey: 'consent.analytics.body' },
    ],
  },
};
