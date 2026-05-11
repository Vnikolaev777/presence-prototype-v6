import { useState, useEffect } from 'react';
import { Bot, CheckCircle, Clock, Zap, Database, BarChart2, FileText, Link2, ShieldCheck, Users, Rss, ExternalLink, CalendarDays, X, Bell, ClipboardCheck, Signal, Wifi, BatteryFull, Loader2, Globe, MessageSquare, Mail, AlertTriangle, Eye, Trophy } from 'lucide-react';
import type { AiAction } from '../data/mockData';
import { AiReviewModal } from './AiReviewModal';
import { AutoUpdatePreviewModal } from './AutoUpdatePreviewModal';
import { cn } from '../lib/utils';
import { useT, useRegion } from '../lib/i18n';

// ─── Auto-update feed data ──────────────────────────────────────────────────
// Realistic items driven by the 3 connected systems + the two web agents

type AutoUpdate = {
  id: string;
  /** Source label as a literal (used for brand names like "PowerSchool"). */
  source: string;
  /** Optional translation key — overrides `source` for non-brand sources (e.g. "Web Admin Agent"). */
  sourceKey?: string;
  sourceDomainKey?: string;
  sourceDomain?: string;
  sourceDomains?: string[]; // when multiple sources contributed (e.g. SIS + LMS)
  /** DACH-region overrides for source display */
  dachSource?: string;
  dachSourceDomain?: string;
  /** Translation key for the title — resolved via useT() in AutoUpdateRow. */
  titleKey: string;
  /** Translation key for the body. */
  detailKey: string;
  /** Translation key for the time label (typically a shared `tasks.time.*` key). */
  timeKey: string;
  icon: React.ReactNode;
  iconBg: string;
};

// New auto-update item from the auto-updates scenario.
// Sourced from both PowerSchool (SIS) and Canvas LMS, surfaced after the
// "Set up automated updates" scenario completes.
const VACATION_UPDATE: AutoUpdate = {
  id: 'au_vacation',
  source: 'PowerSchool + Canvas LMS',
  sourceDomains: ['powerschool.com', 'canvas.instructure.com'],
  titleKey: 'dashboard.fixture.vacation.title',
  detailKey: 'dashboard.fixture.vacation.detail',
  timeKey: 'tasks.time.justNow',
  icon: <CalendarDays className="w-3.5 h-3.5" />,
  iconBg: 'bg-amber-100 text-amber-600',
};

const AUTO_UPDATES: AutoUpdate[] = [
  {
    id: 'au_0',
    source: 'PowerSchool',
    sourceKey: 'dashboard.fixture.autoUpdate.source.sis',
    sourceDomainKey: 'dashboard.fixture.autoUpdate.source.sis.domain',
    sourceDomain: 'powerschool.com',
    titleKey: 'dashboard.fixture.autoUpdate.0.title',
    detailKey: 'dashboard.fixture.autoUpdate.0.detail',
    timeKey: 'tasks.time.justNow',
    icon: <Users className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'au_1',
    source: 'PowerSchool',
    sourceKey: 'dashboard.fixture.autoUpdate.source.sis',
    sourceDomainKey: 'dashboard.fixture.autoUpdate.source.sis.domain',
    sourceDomain: 'powerschool.com',
    titleKey: 'dashboard.fixture.autoUpdate.1.title',
    detailKey: 'dashboard.fixture.autoUpdate.1.detail',
    timeKey: 'tasks.time.2MinAgo',
    icon: <Users className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'au_2',
    source: 'Google Analytics',
    sourceDomain: 'analytics.google.com',
    titleKey: 'dashboard.fixture.autoUpdate.2.title',
    detailKey: 'dashboard.fixture.autoUpdate.2.detail',
    timeKey: 'tasks.time.19MinAgo',
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'au_3',
    source: 'Google Workspace',
    sourceDomain: 'workspace.google.com',
    titleKey: 'dashboard.fixture.autoUpdate.3.title',
    detailKey: 'dashboard.fixture.autoUpdate.3.detail',
    timeKey: 'tasks.time.41MinAgo',
    icon: <FileText className="w-3.5 h-3.5" />,
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'au_4',
    source: 'PowerSchool',
    sourceKey: 'dashboard.fixture.autoUpdate.source.sis',
    sourceDomainKey: 'dashboard.fixture.autoUpdate.source.sis.domain',
    sourceDomain: 'powerschool.com',
    titleKey: 'dashboard.fixture.autoUpdate.4.title',
    detailKey: 'dashboard.fixture.autoUpdate.4.detail',
    timeKey: 'tasks.time.1HrAgo',
    icon: <Database className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'au_5',
    source: 'Web Admin Agent',
    sourceKey: 'dashboard.fixture.source.webAdmin',
    titleKey: 'dashboard.fixture.autoUpdate.5.title',
    detailKey: 'dashboard.fixture.autoUpdate.5.detail',
    timeKey: 'tasks.time.3HrAgo',
    icon: <Link2 className="w-3.5 h-3.5" />,
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'au_6',
    source: 'ClassDojo',
    sourceDomain: 'classdojo.com',
    titleKey: 'dashboard.fixture.autoUpdate.6.title',
    detailKey: 'dashboard.fixture.autoUpdate.6.detail',
    timeKey: 'tasks.time.5HrsAgo',
    icon: <Rss className="w-3.5 h-3.5" />,
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'au_7',
    source: 'Google Analytics',
    sourceDomain: 'analytics.google.com',
    titleKey: 'dashboard.fixture.autoUpdate.7.title',
    detailKey: 'dashboard.fixture.autoUpdate.7.detail',
    timeKey: 'tasks.time.yesterday',
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'au_8',
    source: 'Web Crawler α',
    sourceKey: 'dashboard.fixture.source.webCrawler',
    titleKey: 'dashboard.fixture.autoUpdate.8.title',
    detailKey: 'dashboard.fixture.autoUpdate.8.detail',
    timeKey: 'tasks.time.yesterday',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'au_9',
    source: 'PowerSchool',
    sourceKey: 'dashboard.fixture.autoUpdate.source.sis',
    sourceDomainKey: 'dashboard.fixture.autoUpdate.source.sis.domain',
    sourceDomain: 'powerschool.com',
    titleKey: 'dashboard.fixture.autoUpdate.9.title',
    detailKey: 'dashboard.fixture.autoUpdate.9.detail',
    timeKey: 'tasks.time.2DaysAgo',
    icon: <Users className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
];

// ─── Auto-update row component ──────────────────────────────────────────────
function AutoUpdateRow({ item, onView }: { item: AutoUpdate; onView?: () => void }) {
  const t = useT();
  return (
    <div className="flex gap-3 items-start py-3 px-4 hover:bg-slate-50 transition-colors rounded-xl group">
      {/* Source favicon(s) or fallback icon */}
      <div className="relative shrink-0 mt-0.5">
        {item.sourceDomains && item.sourceDomains.length > 1 ? (
          // Multi-source: stacked favicons
          <div className="flex -space-x-1.5">
            {item.sourceDomains.slice(0, 2).map((domain, idx) => (
              <div
                key={domain}
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-200 shadow-sm',
                  idx === 0 ? 'z-10' : 'z-0'
                )}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                  alt={domain}
                  className="w-4 h-4 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-200 shadow-sm')}>
            {(item.sourceDomainKey ? t(item.sourceDomainKey) : item.sourceDomain) ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${item.sourceDomainKey ? t(item.sourceDomainKey) : item.sourceDomain}&sz=64`}
                alt={item.sourceKey ? t(item.sourceKey) : item.source}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.className = cn('w-8 h-8 rounded-lg flex items-center justify-center', item.iconBg);
                }}
              />
            ) : (
              <div className={cn('w-full h-full flex items-center justify-center rounded-lg', item.iconBg)}>
                {item.icon}
              </div>
            )}
          </div>
        )}
        {/* Green auto-done dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{t(item.titleKey)}</p>
          <span className="text-xs text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">{t(item.timeKey)}</span>
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">{t(item.detailKey)}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-slate-400 font-medium">{item.sourceKey ? t(item.sourceKey) : item.source}</span>
          {onView && (
            <button onClick={onView} className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
              {t('dashboard.feed.row.view')} <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Compact consent phone preview ──────────────────────────────────────────
function ConsentPhonePreview() {
  const t = useT();
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  useEffect(() => {
    if (stage >= 3) return;
    const t = setTimeout(() => setStage(s => (s + 1) as 0 | 1 | 2 | 3), stage === 0 ? 900 : 1400);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div className="flex items-center justify-center py-8 bg-slate-100">
      {/* Compact phone frame */}
      <div className="w-[230px] bg-slate-900 rounded-[32px] p-2 shadow-2xl border border-slate-800">
        <div className="w-full bg-white rounded-[24px] overflow-hidden flex flex-col" style={{ height: 420 }}>
          {/* Status bar */}
          <div className="shrink-0 h-6 px-5 flex items-center justify-between text-[10px] font-bold text-slate-900 bg-white relative">
            <span>5:32</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-1 w-16 h-3.5 bg-slate-900 rounded-full" />
            <div className="flex items-center gap-0.5">
              <Signal className="w-2.5 h-2.5" />
              <Wifi className="w-2.5 h-2.5" />
              <BatteryFull className="w-3 h-3" />
            </div>
          </div>

          {/* Content */}
          {stage === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 bg-slate-50 px-4 text-center">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              <p className="text-[10px] text-slate-500">{t('dashboard.consentPreview.sending')}</p>
            </div>
          )}

          {stage >= 1 && stage < 3 && (
            <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
              <div className="px-4 py-2 flex items-center gap-2 bg-white border-b border-slate-200 shrink-0">
                <img src="https://www.google.com/s2/favicons?domain=sdui.de&sz=64" alt="Sdui" className="w-4 h-4 object-contain" />
                <p className="text-[11px] font-bold text-slate-900">Sdui</p>
                <span className="ml-auto text-[9px] text-slate-400">{t('dashboard.consentPreview.timeNow')}</span>
              </div>
              <div className="p-3 space-y-2 flex-1 overflow-hidden">
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">{t('dashboard.consentPreview.permissionSlipBadge')}</p>
                  <p className="text-[11px] font-bold text-slate-900 leading-snug">{t('dashboard.consentPreview.permissionSlipTitle')}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{t('dashboard.consentPreview.permissionSlipBody')}</p>
                  <button className="mt-2 w-full text-[10px] font-bold py-1.5 rounded-lg bg-blue-600 text-white">
                    {t('dashboard.consentPreview.openForm')}
                  </button>
                </div>

                {stage >= 2 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.consentPreview.prefilled')}</p>
                    {['Student: Lina M.', 'Class: 10b', 'Emergency: +49 …'].map(line => (
                      <div key={line} className="flex items-center gap-1.5 text-[10px] text-slate-700">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0" /> {line}
                      </div>
                    ))}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-2 h-2 text-white" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800">{t('dashboard.consentPreview.iAgree')}</span>
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white h-7 flex items-center justify-center">
                      <span className="text-slate-400 italic text-xs" style={{ fontFamily: 'Caveat, cursive' }}>M. Müller</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {stage === 3 && (
            <div className="flex-1 flex flex-col bg-emerald-50 items-center justify-center gap-2 px-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-emerald-900">{t('dashboard.consentPreview.submitted.title')}</p>
              <p className="text-[10px] text-emerald-700 leading-relaxed">{t('dashboard.consentPreview.submitted.body')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Weather alert preview modal ─────────────────────────────────────────────
// ─── Consent modal ───────────────────────────────────────────────────────────
function ConsentModal({ onClose, onApprove }: { onClose: () => void; onApprove: () => void }) {
  const t = useT();
  const region = useRegion();
  const [tab, setTab] = useState<'sdui' | 'email'>('sdui');
  const [autoApply, setAutoApply] = useState(false);
  const isDACH = region.id === 'Germany';

  const tabs = [
    { id: 'sdui'  as const, label: 'Sdui',  icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'email' as const, label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full max-w-[1400px] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-500 hover:text-slate-800 bg-white/80 backdrop-blur hover:bg-slate-100 rounded-full p-2 shadow-sm transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* ── Left panel ── */}
        <div className="w-full md:w-[400px] lg:w-[440px] flex flex-col shrink-0 bg-white z-0 relative">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-wide uppercase mb-2">
              <ClipboardCheck className="w-4 h-4" />
              {t('dashboard.review.consent.badge')}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{t('dashboard.review.consent.title')}</h2>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-7">
            {/* Source */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('autoUpdateModal.section.source')}</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img src={`https://www.google.com/s2/favicons?domain=${isDACH ? 'webuntis.com' : 'powerschool.com'}&sz=64`} alt={isDACH ? 'WebUntis' : 'PowerSchool'} className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{isDACH ? 'WebUntis' : 'PowerSchool'}</p>
                  <p className="text-xs text-slate-400">{isDACH ? 'Klassenfahrt Biologie erkannt · Mai 14' : 'Biology field trip detected · May 14'}</p>
                </div>
              </div>
            </div>

            {/* Trip details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isDACH ? 'Details' : 'Trip Details'}</h3>
              <ul className="space-y-2.5 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                {(isDACH ? [
                  { icon: <CalendarDays className="w-4 h-4 text-indigo-500" />, label: 'Datum', value: '14. Mai 2026' },
                  { icon: <Globe className="w-4 h-4 text-slate-400" />,         label: 'Ziel',  value: 'Naturhistorisches Museum' },
                  { icon: <Users className="w-4 h-4 text-slate-400" />,        label: 'Klasse', value: 'Klasse 10b · 28 Schüler:innen' },
                  { icon: <Clock className="w-4 h-4 text-amber-500" />,        label: 'Frist',  value: 'Bestätigung bis 10. Mai' },
                ] : [
                  { icon: <CalendarDays className="w-4 h-4 text-indigo-500" />, label: 'Date',      value: 'May 14, 2026' },
                  { icon: <Globe className="w-4 h-4 text-slate-400" />,         label: 'Destination', value: 'Natural History Museum' },
                  { icon: <Users className="w-4 h-4 text-slate-400" />,        label: 'Class',     value: 'Class 10b · 28 students' },
                  { icon: <Clock className="w-4 h-4 text-amber-500" />,        label: 'Deadline',  value: 'Confirm by May 10' },
                ]).map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="text-slate-400 w-20 shrink-0 text-xs font-medium">{item.label}</span>
                    <span className="text-slate-700 font-medium">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Channels */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isDACH ? 'Versand über' : 'Sending via'}</h3>
              <ul className="space-y-2 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                {[
                  { icon: <MessageSquare className="w-4 h-4 text-indigo-500" />, label: isDACH ? 'Sdui-Push an 28 Eltern' : 'Sdui push to 28 parents' },
                  { icon: <Mail className="w-4 h-4 text-slate-400" />,           label: isDACH ? 'E-Mail-Fallback (kein App-Konto)' : 'Email fallback (no app account)' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 mt-0.5">{item.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer — same as AiReviewModal */}
          <div className="p-5 border-t border-slate-100 bg-white space-y-3">
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                {t('aiReviewModal.action.reject')}
              </button>
              <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                {t('aiReviewModal.action.edit')}
              </button>
              <button onClick={() => { onApprove(); onClose(); }} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> {t('aiReviewModal.action.approve')}
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 font-medium pr-4">{t('aiReviewModal.autoApply')}</span>
              <button type="button" role="switch" aria-checked={autoApply} onClick={() => setAutoApply(v => !v)} className="shrink-0 focus:outline-none">
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${autoApply ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${autoApply ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-100 relative">
          <div className="h-14 bg-white border-b border-l border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" /> {t('dashboard.consentPreview.title')}
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-0.5">
              {tabs.map(tb => (
                <button key={tb.id} onClick={() => setTab(tb.id)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                    tab === tb.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                  {tb.icon} {tb.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {tab === 'sdui' && <ConsentPhonePreview />}
            {tab === 'email' && (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 p-8">
                <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs">{isDACH ? 'Primarschule Rosenbach <info@ps-rosenbach.ch>' : 'Oakwood High <info@oakwoodhigh.org>'}</p>
                      <p className="text-[10px] text-slate-400">{isDACH ? 'An: Eltern Klasse 10b · Mo, 5. Mai 2026' : 'To: Class 10b parents · Mon, May 5 2026'}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-base font-extrabold text-slate-900">{isDACH ? '📋 Einverständniserklärung — Klassenfahrt 14. Mai' : '📋 Permission Slip — Field Trip May 14'}</p>
                    <p className="text-sm text-slate-600">{isDACH ? 'Liebe Eltern,' : 'Dear parents,'}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{isDACH
                      ? 'Für die Exkursion der Klasse 10b ins Naturhistorische Museum am 14. Mai 2026 benötigen wir Ihr schriftliches Einverständnis.'
                      : 'Class 10b will visit the Natural History Museum on May 14, 2026. We need your written consent.'}</p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-indigo-900 mb-2">{isDACH ? 'Bitte bestätigen Sie bis 10. Mai:' : 'Please confirm by May 10:'}</p>
                      <a href="#" className="block w-full text-center py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold">{isDACH ? 'Formular öffnen →' : 'Open form →'}</a>
                    </div>
                    <p className="text-sm text-slate-600">{isDACH ? 'Mit freundlichen Grüßen,\nSchulleitung' : 'Best regards,\nOakwood High Administration'}</p>
                    <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                      {isDACH ? 'Gesendet an 28 Empfänger · Presence AI' : 'Sent to 28 recipients · Presence AI'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Weather alert preview modal ─────────────────────────────────────────────
function WeatherAlertModal({ onClose, onApprove }: { onClose: () => void; onApprove: () => void }) {
  const t = useT();
  const region = useRegion();
  const [tab, setTab] = useState<'website' | 'sdui' | 'email'>('website');
  const [autoApply, setAutoApply] = useState(false);

  const tabs = [
    { id: 'website' as const, label: t('dashboard.review.weather.preview.tab.website'), icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'sdui'    as const, label: t('dashboard.review.weather.preview.tab.sdui'),    icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'email'   as const, label: t('dashboard.review.weather.preview.tab.email'),   icon: <Mail className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full max-w-[1400px] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-500 hover:text-slate-800 bg-white/80 backdrop-blur hover:bg-slate-100 rounded-full p-2 shadow-sm transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* ── Left panel ── */}
        <div className="w-full md:w-[400px] lg:w-[440px] flex flex-col shrink-0 bg-white z-0 relative">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold tracking-wide uppercase mb-2">
              <Trophy className="w-4 h-4" />
              {t('dashboard.review.weather.badge')}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{t('dashboard.review.weather.title')}</h2>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-7">
            {/* Source */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Source</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Regionale Schulolympiade</p>
                  <p className="text-xs text-slate-400">Ergebnisse veröffentlicht · Gerade eben</p>
                </div>
              </div>
            </div>

            {/* What was prepared */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prepared</h3>
              <ul className="space-y-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                {[
                  { icon: <Globe className="w-4 h-4 text-blue-500" />,    label: 'Website post celebrating the medal winners' },
                  { icon: <MessageSquare className="w-4 h-4 text-indigo-500" />, label: 'Sdui notification to share the news with parents' },
                  { icon: <Mail className="w-4 h-4 text-slate-400" />,    label: 'Email for parents not yet on Sdui' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 items-start">
                    <span className="shrink-0 mt-0.5">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer — same layout as AiReviewModal */}
          <div className="p-5 border-t border-slate-100 bg-white space-y-3">
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                {t('aiReviewModal.action.reject')}
              </button>
              <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5">
                {t('aiReviewModal.action.edit')}
              </button>
              <button onClick={() => { onApprove(); onClose(); }} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> {t('aiReviewModal.action.approve')}
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 font-medium pr-4">{t('aiReviewModal.autoApply')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoApply}
                onClick={() => setAutoApply(v => !v)}
                className="shrink-0 focus:outline-none"
              >
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${autoApply ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${autoApply ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-100 relative">
          {/* Toolbar with tabs */}
          <div className="h-14 bg-white border-b border-l border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" /> {t('dashboard.review.weather.preview.title')}
            </div>
            {/* Tab switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-0.5">
              {tabs.map(tb => (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                    tab === tb.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tb.icon} {tb.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 relative overflow-hidden">
            {/* Website tab */}
            {tab === 'website' && (
              <iframe
                key="weather-website"
                src={`${import.meta.env.BASE_URL}lerchenberg/good.html?highlight=announcement&state=after`}
                className="w-full h-full border-0"
                title="Website preview"
              />
            )}

            {/* Sdui tab */}
            {tab === 'sdui' && (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <div className="relative">
                  {/* Phone frame */}
                  <div className="w-[260px] bg-slate-900 rounded-[36px] p-2.5 shadow-2xl border border-slate-800">
                    <div className="w-full bg-white rounded-[28px] overflow-hidden flex flex-col" style={{ height: 500 }}>
                      {/* Status bar */}
                      <div className="shrink-0 h-7 px-5 flex items-center justify-between text-[11px] font-bold text-slate-900 bg-white relative">
                        <span>7:14</span>
                        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-20 h-4 bg-slate-900 rounded-full" />
                        <div className="flex items-center gap-0.5"><Signal className="w-3 h-3" /><Wifi className="w-3 h-3" /><BatteryFull className="w-3.5 h-3.5" /></div>
                      </div>
                      {/* App bar */}
                      <div className="px-5 py-2.5 flex items-center gap-2 bg-white border-b border-slate-100 shrink-0">
                        <img src="https://www.google.com/s2/favicons?domain=sdui.de&sz=64" alt="Sdui" className="w-5 h-5 object-contain" />
                        <p className="text-xs font-bold text-slate-900">Sdui</p>
                        <span className="ml-auto text-[10px] text-slate-400">jetzt</span>
                      </div>
                      {/* Notification */}
                      <div className="flex-1 bg-slate-50 p-3 space-y-2">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">🏅 Schulolympiade</span>
                          </div>
                          <p className="text-[12px] font-extrabold text-slate-900 leading-snug">Unsere Schüler gewinnen Medaillen bei der Regionalen Olympiade!</p>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">3 Schülerinnen und Schüler holten Gold, Silber und Bronze. Herzlichen Glückwunsch!</p>
                          <div className="flex gap-2 mt-2.5">
                            <button className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-amber-500 text-white">Mehr lesen</button>
                            <button className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">Ergebnisse</button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center pt-1">Gesendet an 312 Eltern</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap">
                    Eltern · Sdui-App
                  </div>
                </div>
              </div>
            )}

            {/* Email tab */}
            {tab === 'email' && (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 p-8">
                <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-sm">
                  {/* Email client header */}
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs leading-tight">Primarschule Rosenbach &lt;info@ps-rosenbach.ch&gt;</p>
                      <p className="text-[10px] text-slate-400">An: Alle Eltern · Do, 7. Mai 2026, 14:30</p>
                    </div>
                  </div>
                  {/* Email body */}
                  <div className="p-6 space-y-4">
                    <p className="text-base font-extrabold text-slate-900">🏅 Unsere Schüler bei der Regionalen Olympiade</p>
                    <p className="text-sm text-slate-600 leading-relaxed">Liebe Eltern,</p>
                    <p className="text-sm text-slate-600 leading-relaxed">wir freuen uns, Ihnen mitteilen zu können, dass unsere Schülerinnen und Schüler bei der <strong>Regionalen Schulolympiade</strong> hervorragende Ergebnisse erzielt haben.</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-amber-800 mb-2">Unsere Medaillengewinner</p>
                      <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                        <li><strong>Gold</strong> — Leichtathletik, 100 m Sprint</li>
                        <li><strong>Silber</strong> — Schwimmen, 200 m Freistil</li>
                        <li><strong>Bronze</strong> — Turnen, Mehrkampf</li>
                      </ul>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">Wir sind sehr stolz auf unsere Sportlerinnen und Sportler und gratulieren herzlich zu diesen großartigen Leistungen!</p>
                    <p className="text-sm text-slate-600">Mit freundlichen Grüßen,<br /><strong>Schulleitung Primarschule Rosenbach</strong></p>
                    <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                      Gesendet an 312 Empfänger · Diese E-Mail wurde automatisch von Presence erstellt
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Comm notification preview modal ────────────────────────────────────────
function PhoneNotifModal({ type, onClose }: { type: 'consent' | 'event'; onClose: () => void }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {type === 'consent' ? t('dashboard.consentPreview.title') : t('dashboard.eventPreview.title')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {type === 'consent' ? t('dashboard.consentPreview.subtitle') : t('dashboard.eventPreview.subtitle')}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {type === 'consent' ? (
          <ConsentPhonePreview />
        ) : (
          // Event notification — simple phone push mockup
          <div className="flex items-center justify-center py-8 bg-slate-100 p-10">
            <div className="w-[220px] rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden bg-slate-50 flex flex-col" style={{ height: 420 }}>
              {/* Status bar */}
              <div className="bg-slate-800 px-4 pt-2 pb-1 flex justify-between items-center shrink-0">
                <span className="text-[10px] text-white font-semibold">9:41</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-1.5 rounded-sm bg-white/60" />
                  <div className="w-1 h-1 rounded-full bg-white/60" />
                </div>
              </div>
              {/* Lock screen */}
              <div className="flex-1 bg-gradient-to-b from-slate-700 to-slate-900 flex flex-col items-center px-3 py-4 gap-3">
                <p className="text-[10px] text-white/60 font-medium">{t('dashboard.eventPreview.dateLabel')}</p>
                <p className="text-3xl font-light text-white">9:41</p>
                {/* Notification bubble */}
                <div className="w-full bg-white/15 backdrop-blur rounded-2xl p-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-white overflow-hidden flex items-center justify-center shrink-0">
                      <img src="https://www.google.com/s2/favicons?domain=sdui.de&sz=64" className="w-4 h-4 object-contain" alt="Sdui" />
                    </div>
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{t('dashboard.eventPreview.sduiLabel')}</span>
                  </div>
                  <p className="text-[11px] font-bold text-white leading-snug">{t('dashboard.eventPreview.sduiTitle')}</p>
                  <p className="text-[10px] text-white/75 mt-0.5 leading-snug">{t('dashboard.eventPreview.sduiBody')}</p>
                </div>
                <div className="w-full bg-white/10 backdrop-blur rounded-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-700 delay-500">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-white">@</span>
                    </div>
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{t('dashboard.eventPreview.emailLabel')}</span>
                  </div>
                  <p className="text-[11px] font-bold text-white leading-snug">{t('dashboard.eventPreview.emailTitle')}</p>
                  <p className="text-[10px] text-white/75 mt-0.5">{t('dashboard.eventPreview.emailBody')}</p>
                </div>
                <p className="text-[10px] text-white/40 mt-auto">{t('dashboard.eventPreview.footer')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export function Dashboard({ hasHiredAgents, hasMonitoringSetup, hasAutoUpdatesSetup, onNavigate }: any) {
  const [selectedAction, setSelectedAction] = useState<AiAction | null>(null);
  const [removedActions, setRemovedActions] = useState<string[]>([]);
  const [previewVariant, setPreviewVariant] = useState<'teacher' | 'vacation' | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const t = useT();
  const region = useRegion();

  // When the auto-updates scenario has been completed, add the vacation
  // schedule + holiday programs item at the top of the feed.
  const autoUpdates = hasAutoUpdatesSetup
    ? [VACATION_UPDATE, ...AUTO_UPDATES]
    : AUTO_UPDATES;

  // Action fixtures are built per-render so t() resolves in the active language.
  // When the user clicks "Review", `selectedAction` snapshots the current
  // language — switching locales while the modal is open won't retranslate it,
  // matching the same chat-snapshot pattern used elsewhere in the prototype.
  const isDACH = region.id === 'Germany';
  const CC_ACTION: AiAction = {
    id: 'cc_dash_1',
    isInternal: false,
    timestamp: t('tasks.time.justNow'),
    title: t(isDACH ? 'dashboard.fixture.cc.dach.title' : 'dashboard.fixture.cc.title'),
    summary: t(isDACH ? 'dashboard.fixture.cc.dach.summary' : 'dashboard.fixture.cc.summary'),
    proposedChanges: [
      t(isDACH ? 'dashboard.fixture.cc.dach.change.0' : 'dashboard.fixture.cc.change.0'),
      t('dashboard.fixture.cc.change.1'),
      t('dashboard.fixture.cc.change.2'),
    ],
    requiresUserInput: false,
    previewType: 'science_fair_blog',
    status: 'pending',
    source: isDACH ? 'WebUntis' : 'PowerSchool',
    sourceType: 'sis',
    confidence: 0.95,
    sources: isDACH ? [
      {
        website: 'WebUntis',
        url: 'https://webuntis.com',
        detail: t('dashboard.fixture.cc.dach.source.0.detail'),
      },
      {
        website: 'Badische Zeitung',
        url: 'https://badische-zeitung.de',
        detail: t('dashboard.fixture.cc.dach.source.1.detail'),
      },
      {
        website: 'Jugend forscht',
        url: 'https://jugendforscht.de',
        detail: t('dashboard.fixture.cc.dach.source.2.detail'),
      },
    ] : [
      {
        website: 'PowerSchool',
        url: 'https://powerschool.com',
        detail: t('dashboard.fixture.cc.source.0.detail'),
      },
      {
        website: 'Springfield Tribune',
        url: 'https://springfieldtribune.com',
        detail: t('dashboard.fixture.cc.source.1.detail'),
      },
      {
        website: 'State Science Fair',
        url: 'https://sciencefair.state.gov',
        detail: t('dashboard.fixture.cc.source.2.detail'),
      },
    ],
  };

  const WA_ACTION: AiAction = {
    id: 'wa_dash_1',
    isInternal: false,
    timestamp: t('dashboard.fixture.wa.timestamp'),
    title: t(isDACH ? 'dashboard.fixture.wa.dach.title' : 'dashboard.fixture.wa.title'),
    summary: t(isDACH ? 'dashboard.fixture.wa.dach.summary' : 'dashboard.fixture.wa.summary'),
    proposedChanges: [
      t(isDACH ? 'dashboard.fixture.wa.dach.change.0' : 'dashboard.fixture.wa.change.0'),
      t(isDACH ? 'dashboard.fixture.wa.dach.change.1' : 'dashboard.fixture.wa.change.1'),
      t(isDACH ? 'dashboard.fixture.wa.dach.change.2' : 'dashboard.fixture.wa.change.2'),
      t(isDACH ? 'dashboard.fixture.wa.dach.change.3' : 'dashboard.fixture.wa.change.3'),
    ],
    requiresUserInput: false,
    previewType: 'ada_compliance',
    status: 'pending',
    source: t('dashboard.fixture.source.webAdmin'),
    sourceType: 'district',
    sourceUrl: isDACH ? 'https://www.bmas.de/DE/Soziales/Teilhabe-und-Inklusion/Barrierefreiheit/barrierefreiheit.html' : 'https://www.ada.gov/resources/web-guidance/',
    sourceWebsite: isDACH ? t('dashboard.fixture.wa.dach.sourceWebsite') : 'ADA.gov',
    confidence: 0.97
  };

  const isCCPending      = !removedActions.includes(CC_ACTION.id);
  const isWAPending      = !removedActions.includes(WA_ACTION.id);
  const isConsentPending = !removedActions.includes('consent_1');
  const isEventPending   = !removedActions.includes('event_1');
  const pendingCount = [
    hasMonitoringSetup && isCCPending,
    hasMonitoringSetup && isWAPending,
    hasHiredAgents && isConsentPending,
    hasMonitoringSetup && isEventPending,
  ].filter(Boolean).length;

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-light tracking-tight text-black">{t('dashboard.title')}</h1>
          <button
            onClick={() => onNavigate?.('workspace')}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
          >
            <Zap className="w-4 h-4 text-indigo-500" />
            {t('dashboard.cta.addAutomations')}
          </button>
        </div>
        <p className="text-slate-500 text-sm mt-1">{t('dashboard.subtitle')}</p>

        {/* Status bar — only once agents are hired and content is live */}
        {hasHiredAgents && (
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-200 flex-wrap">

            {/* Live */}
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-emerald-700">{t('dashboard.status.connected')}</span>
              <span className="text-slate-400 text-xs">oakwoodhigh.org</span>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Last sync */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('dashboard.status.lastSync')} <span className="font-semibold text-slate-700">{t('dashboard.status.lastSyncValue')}</span></span>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Time saved — with hover tooltip */}
            <div className="relative group flex items-center gap-1.5 text-sm text-slate-500 cursor-default">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                <span className="font-semibold text-slate-700 underline underline-offset-2 decoration-dashed decoration-slate-300">6.5 hrs</span> {t('dashboard.status.timeSavedSuffix')}
              </span>

              {/* Tooltip — appears below */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-slate-900 text-white text-xs rounded-xl shadow-xl p-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                {/* Arrow */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                <p className="font-bold text-white mb-2.5">{t('dashboard.status.tooltip.title')}</p>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>{t('dashboard.status.tooltip.updates')}</span>
                    <span className="font-semibold text-white">10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('dashboard.status.tooltip.avg')}</span>
                    <span className="font-semibold text-white">~39 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('dashboard.status.tooltip.total')}</span>
                    <span className="font-semibold text-indigo-300">6.5 hrs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Auto-handled */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              <span><span className="font-semibold text-slate-700">{t('dashboard.status.autoHandledCount')}</span> {t('dashboard.status.autoHandledSuffix')}</span>
            </div>

          </div>
        )}
      </div>

      {/* Two-column grid — columns appear progressively as scenarios complete */}
      {!hasHiredAgents ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-16 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
          <Bot className="w-10 h-10 opacity-30" />
          <p className="font-medium text-sm">{t('dashboard.empty.title')}</p>
          <p className="text-xs leading-relaxed max-w-xs">{t('dashboard.empty.body')}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Manual Reviews — always visible, cards appear after monitoring scenario ── */}
        <div className="flex flex-col">
          {/* Column header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-700">{t('dashboard.review.heading')}</h2>
            {hasHiredAgents && pendingCount > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>

          {/* Column body */}
          {hasHiredAgents ? (
            <div className="space-y-3">

              {/* Consent form card — appears after first scenario */}
              {isConsentPending && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                  <h3 className="font-semibold text-slate-800 text-sm">{t('dashboard.review.consent.title')}</h3>
                  <p className="text-sm text-slate-600 mt-1">{t('dashboard.review.consent.body')}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setShowConsentModal(true)}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      {t('dashboard.review.action.review')}
                    </button>
                    <button
                      onClick={() => setRemovedActions(prev => [...prev, 'consent_1'])}
                      className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors ml-auto"
                    >
                      {t('dashboard.review.action.dismiss')}
                    </button>
                  </div>
                </div>
              )}

              {/* Weather alert card — appears after second (monitoring) scenario */}
              {hasMonitoringSetup && isEventPending && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                  <h3 className="font-semibold text-slate-800 text-sm">{t('dashboard.review.weather.title')}</h3>
                  <p className="text-sm text-slate-600 mt-1">{t('dashboard.review.weather.body')}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setShowWeatherModal(true)}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      {t('dashboard.review.action.review')}
                    </button>
                    <button
                      onClick={() => setRemovedActions(prev => [...prev, 'event_1'])}
                      className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors ml-auto"
                    >
                      {t('dashboard.review.action.dismiss')}
                    </button>
                  </div>
                </div>
              )}

              {/* Science Fair + ADA cards — appear after second (monitoring) scenario */}
              {hasMonitoringSetup && isCCPending && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                  <h3 className="font-semibold text-slate-800 text-sm">{t('dashboard.review.scienceFair.title')}</h3>
                  <p className="text-sm text-slate-600 mt-1">"{CC_ACTION.summary}"</p>
                  <button
                    onClick={() => setSelectedAction(CC_ACTION)}
                    className="mt-3 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {t('dashboard.review.action.review')}
                  </button>
                </div>
              )}

              {hasMonitoringSetup && isWAPending && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                  <h3 className="font-semibold text-slate-800 text-sm">{t('dashboard.review.ada.title')}</h3>
                  <p className="text-sm text-slate-600 mt-1">"{WA_ACTION.summary}"</p>
                  <button
                    onClick={() => setSelectedAction(WA_ACTION)}
                    className="mt-3 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {t('dashboard.review.action.review')}
                  </button>
                </div>
              )}

              {!isConsentPending && !(hasMonitoringSetup && isEventPending) && !(hasMonitoringSetup && isCCPending) && !(hasMonitoringSetup && isWAPending) && (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-sm font-medium">{t('dashboard.review.allCaughtUp.title')}</p>
                  <p className="text-xs">{t('dashboard.review.allCaughtUp.body')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center text-slate-400 space-y-2 flex flex-col items-center justify-center min-h-[180px]">
              <Clock className="w-8 h-8 opacity-25" />
              <p className="text-sm font-medium">{t('dashboard.review.empty.title')}</p>
              <p className="text-xs leading-relaxed max-w-xs">{t('dashboard.review.empty.body')}</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Automatic Updates — appears after migrate scenario ──── */}
        {hasHiredAgents && <div className="flex flex-col">
          {/* Column header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-700">{t('dashboard.feed.heading')}</h2>
            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              {t('dashboard.feed.live')}
            </span>
          </div>

          {/* Column body */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Subheader */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex -space-x-1.5">
                {(hasAutoUpdatesSetup
                  ? ['powerschool.com', 'canvas.instructure.com', 'analytics.google.com', 'classdojo.com']
                  : ['powerschool.com', 'analytics.google.com', 'classdojo.com']
                ).map((domain) => (
                  <div key={domain} className="w-5 h-5 rounded-full bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                      alt={domain}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t('dashboard.feed.subheading')}
              </p>
            </div>

            {/* Feed */}
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {autoUpdates.map((item) => (
                <AutoUpdateRow
                  key={item.id}
                  item={item}
                  onView={
                    item.id === 'au_vacation' ? () => setPreviewVariant('vacation') :
                    item.id === 'au_0'        ? () => setPreviewVariant('teacher')  :
                    undefined
                  }
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <p className="text-xs text-slate-400">{t('dashboard.feed.footer.count', { count: autoUpdates.length })}</p>
              <button className="text-xs font-semibold text-blue-600 hover:underline">{t('dashboard.feed.footer.viewAll')}</button>
            </div>
          </div>
        </div>}

      </div>
      )}

      {previewVariant && (
        <AutoUpdatePreviewModal
          variant={previewVariant}
          onClose={() => setPreviewVariant(null)}
        />
      )}

      {showConsentModal && (
        <ConsentModal
          onClose={() => setShowConsentModal(false)}
          onApprove={() => setRemovedActions(prev => [...prev, 'consent_1'])}
        />
      )}

      {showWeatherModal && (
        <WeatherAlertModal
          onClose={() => setShowWeatherModal(false)}
          onApprove={() => setRemovedActions(prev => [...prev, 'event_1'])}
        />
      )}

      {/* Review modal — unchanged */}
      {selectedAction && (
        <AiReviewModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onComplete={(id) => {
            setRemovedActions(prev => [...prev, id]);
            setSelectedAction(null);
          }}
        />
      )}
    </div>
  );
}
