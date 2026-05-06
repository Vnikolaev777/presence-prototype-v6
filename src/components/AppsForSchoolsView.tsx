import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useT } from '../lib/i18n';

interface App {
  id: string;
  name: string;
  abbrev: string;
  /** Translation key for this app's description. Resolved via useT() at render. */
  descriptionKey: string;
  iconBg: string;
  iconText?: string;
}

const APPS: App[] = [
  {
    id: 'grafari',
    name: 'Grafari',
    abbrev: 'Gr',
    descriptionKey: 'appsForSchools.app.grafari.description',
    iconBg: 'bg-sky-400',
  },
  {
    id: 'orthograph',
    name: 'Orthograph',
    abbrev: 'Or',
    descriptionKey: 'appsForSchools.app.orthograph.description',
    iconBg: 'bg-slate-900',
  },
  {
    id: 'writing-lab',
    name: 'Writing Lab',
    abbrev: 'WL',
    descriptionKey: 'appsForSchools.app.writingLab.description',
    iconBg: 'bg-blue-800',
  },
  {
    id: 'science-labs',
    name: 'Science Labs',
    abbrev: 'SL',
    descriptionKey: 'appsForSchools.app.scienceLabs.description',
    iconBg: 'bg-emerald-500',
  },
  {
    id: 'software-it',
    name: 'Software & IT',
    abbrev: 'IT',
    descriptionKey: 'appsForSchools.app.softwareIt.description',
    iconBg: 'bg-amber-400',
  },
  {
    id: 'coding',
    name: 'Coding',
    abbrev: '</>',
    descriptionKey: 'appsForSchools.app.coding.description',
    iconBg: 'bg-slate-900',
  },
];

export function AppsForSchoolsView() {
  const t = useT();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-black mb-1">{t('appsForSchools.title')}</h1>
        <p className="text-slate-500 text-sm">{t('appsForSchools.subtitle')}</p>
      </div>

      {/* AI Recommendation Banner — Calcularis */}
      <div className="relative rounded-2xl mb-8 border border-sky-200 bg-white overflow-hidden">
        {/* Subtle Calcularis accent wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 via-white to-white pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row gap-6 p-6">
          {/* Left: AI insight + recommendation copy */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-600">{t('appsForSchools.banner.label')}</span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 mb-1.5">
              {t('appsForSchools.banner.title')}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              {t('appsForSchools.banner.body')}
            </p>

            {/* Trust / scientific badges — all light blue */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" /> {t('appsForSchools.banner.badge.research')}
              </span>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                {t('appsForSchools.banner.badge.years')}
              </span>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                {t('appsForSchools.banner.badge.studies')}
              </span>
            </div>
          </div>

          {/* Right: Calcularis-branded preview card */}
          <div className="lg:w-96 lg:flex-shrink-0 bg-white border border-sky-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-sky-500/30">
                <span className="text-white font-bold text-sm tracking-tight">Ca</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-slate-900 text-base leading-tight">Calcularis</div>
                <div className="text-xs text-slate-500 leading-snug mt-0.5">{t('appsForSchools.calcularis.tagline')}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
              {t('appsForSchools.calcularis.quote')}
            </p>

            <a
              href="https://constructor.tech/products/learning/practice/calcularis/schools"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 bg-sky-500 text-white px-4 py-2.5 rounded-full text-xs font-bold hover:bg-sky-600 transition-colors shadow-sm"
            >
              {t('appsForSchools.calcularis.cta')} <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4">{t('appsForSchools.otherApps.heading')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {APPS.map(app => (
          <div
            key={app.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl ${app.iconBg} flex items-center justify-center mx-auto mb-5 shadow-sm`}>
              <span className="text-white font-bold text-sm tracking-tight">{app.abbrev}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">{app.name}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{t(app.descriptionKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
