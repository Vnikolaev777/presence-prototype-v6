import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, MoveRight, Layers, LayoutTemplate, Accessibility,
  Database, Bot, CheckCircle, PenTool, Code2, ShieldAlert,
  Server, Link as LinkIcon, Users, Loader2, AlertCircle,
  RefreshCw, FileText, Zap, ShieldCheck, ExternalLink,
  FolderOpen, BookOpen, ChevronDown, Plus,
  Search, Star, Globe, Bell, TrendingUp, MessageSquare, Activity, MapPin, Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useT, useLocale, useRegion } from '../lib/i18n';
import { SchoolBefore } from '../pages/SchoolBefore';
import { SchoolAfterMagic } from '../pages/SchoolAfterMagic';
import { AuditChatCardV2, PostAuditChatCardV2, AuditCanvasV2, PostAuditCanvasV2 } from './AuditPreviews';
import {
  COMM_PLATFORMS, CommProgressBar, CommPlatformPickerCanvas, CommConnectPlatformCanvas,
  CommHubMapCanvas, CommHubStatusCard,
  type CommPlatformId,
} from './CommunicationHubViews';

// ─── Region-aware school site preview ───────────────────────────────────────
// US  → React components (SchoolBefore / SchoolAfterMagic)
// Germany → static HTML files from public/lerchenberg/ served by Vite
function DemoSiteBefore({ siteScale }: { siteScale: number }) {
  const region = useRegion();
  if (region.id === 'Germany') {
    return (
      <iframe
        src={`${import.meta.env.BASE_URL}lerchenberg/bad.html`}
        title="Schulwebsite (vorher)"
        className="w-full border-0"
        style={{ minHeight: '700px', display: 'block' }}
      />
    );
  }
  return (
    <div style={{ zoom: siteScale, width: '1100px' }} className="pointer-events-none">
      <SchoolBefore />
    </div>
  );
}

function DemoSiteAfter({ siteScale }: { siteScale: number }) {
  const region = useRegion();
  if (region.id === 'Germany') {
    return (
      <iframe
        src={`${import.meta.env.BASE_URL}lerchenberg/good.html`}
        title="Schulwebsite (nachher)"
        className="w-full border-0"
        style={{ minHeight: '700px', display: 'block' }}
      />
    );
  }
  return (
    <div style={{ zoom: siteScale, width: '1100px' }} className="pointer-events-none">
      <SchoolAfterMagic showAfter={true} />
    </div>
  );
}

type ScenarioStep = 'idle' | 'url_input' | 'audit' | 'orchestrator' | 'generation' | 'post_audit' | 'hiring'
  | 'mon_input' | 'mon_scanning' | 'mon_findings' | 'mon_configure' | 'mon_active'
  | 'auto_url_input' | 'auto_analyze' | 'auto_cms' | 'auto_sis' | 'auto_lms' | 'auto_shared_folder' | 'auto_active'
  | 'comm_select' | 'comm_connect_sdui' | 'comm_connect_email' | 'comm_hub_active';

interface AiWorkspaceViewProps {
  onFinishScenario?: () => void;
  onAgentsHired?: () => void;
  onMonitoringComplete?: () => void;                        // called when monitoring scenario finishes
  onAutoUpdatesComplete?: () => void;                       // called when auto-updates scenario finishes
  onCommHubComplete?: (connected: CommPlatformId[]) => void; // called with channels wired in Phase 1
  onOpenCommHub?: () => void;                                // navigate to the Communications Hub page
  onSisConnected?: (name: string, domain: string) => void;  // called when a SIS is successfully authorized
}

// Set to false to hide the parent-comms scenario quick action while it's
// being iterated on. Flip back to true to expose it.
const SHOW_COMM_SCENARIO_ACTION = false;

const ALL_QUICK_ACTIONS = [
  { icon: <Layers         className="w-4 h-4" />, labelKey: 'workspace.quickAction.improve',       color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: true  },
  { icon: <RefreshCw      className="w-4 h-4" />, labelKey: 'workspace.quickAction.monitoring',    color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false, monitoringScenario: true },
  { icon: <Zap            className="w-4 h-4" />, labelKey: 'workspace.quickAction.automated',     color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false, autoUpdatesScenario: true },
  { icon: <Bell           className="w-4 h-4" />, labelKey: 'workspace.quickAction.commHub',       color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false, commScenario: true, hidden: !SHOW_COMM_SCENARIO_ACTION },
  { icon: <LayoutTemplate className="w-4 h-4" />, labelKey: 'workspace.quickAction.create',        color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false },
  { icon: <ShieldAlert    className="w-4 h-4" />, labelKey: 'workspace.quickAction.audit',         color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false },
  { icon: <Accessibility  className="w-4 h-4" />, labelKey: 'workspace.quickAction.accessibility', color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false },
  { icon: <Users          className="w-4 h-4" />, labelKey: 'workspace.quickAction.familyHub',     color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false },
  { icon: <Database       className="w-4 h-4" />, labelKey: 'workspace.quickAction.events',        color: 'bg-blue-50 text-blue-500 border-blue-100', scenario: false },
];

const QUICK_ACTIONS = ALL_QUICK_ACTIONS.filter(a => !(a as any).hidden);

const SIS_PROVIDERS = [
  { name: 'ASV Bayern',   domain: 'asv.bayern.de'      },
  { name: 'SVWS-NRW',     domain: 'svws.nrw.de'        },
  { name: 'LUSD',         domain: 'lusd.hessen.de'     },
  { name: 'DaNiS',        domain: 'danis-hilfe.nibis.de' },
  { name: 'SaxSVS',       domain: 'saxsvs.de'          },
];

// Germany-specific grouped SIS list
const SIS_PROVIDERS_GERMANY = [
  {
    groupKey: 'workspace.sisSelect.group.government' as const,
    providers: [
      { name: 'DaNiS',      domain: 'danis-hilfe.nibis.de' },
      { name: 'ASV Bayern', domain: 'asv.bayern.de'        },
      { name: 'SVWS-NRW',   domain: 'svws.nrw.de'          },
      { name: 'LUSD',       domain: 'lusd.hessen.de'       },
      { name: 'SaxSVS',     domain: 'saxsvs.de'            },
    ],
  },
  {
    groupKey: 'workspace.sisSelect.group.commercial' as const,
    providers: [
      { name: 'WebUntis',  domain: 'webuntis.com'          },
      { name: 'DaVinci',   domain: 'davinci.stueber.de'    },
      { name: 'aSc',       domain: 'asctimetables.com'     },
      { name: 'Indiware',  domain: 'indiware.de'           },
    ],
  },
];

// ─── Shared circular gauge ──────────────────────────────────────────────────
function CircularGauge({ score, maxScore, size = 120, strokeWidth = 12, color = '#ef4444' }: {
  score: number; maxScore: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const cx = size / 2, cy = size / 2;
  const r  = (size - strokeWidth * 2) / 2;
  const c  = 2 * Math.PI * r;
  const filled = (score / maxScore) * c;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={`${filled} ${c - filled}`}
        transform={`rotate(-90 ${cx} ${cy})`} />
    </svg>
  );
}

// ─── Current site audit mini card (chat) ────────────────────────────────────
function AuditChatCard() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2 w-full">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <CircularGauge score={4} maxScore={10} size={48} strokeWidth={6} color="#ef4444" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500 font-extrabold text-sm leading-none">4</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800">
            Site Audit <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 mt-1">
            <div>Usability: <span className="font-bold text-red-500">32%</span></div>
            <div>Readability: <span className="font-bold text-amber-500">45%</span></div>
            <div>Discoverability: <span className="font-bold text-red-500">20%</span></div>
          </div>
        </div>
      </div>
      <div className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Click to view details</div>
    </div>
  );
}

// ─── New site audit mini card (chat) ───────────────────────────────────────
function PostAuditChatCard() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2 w-full">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <CircularGauge score={10} maxScore={10} size={48} strokeWidth={6} color="#10b981" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-500 font-extrabold text-sm leading-none">10</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800">
            New Site Audit <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 mt-1">
            <div>Usability: <span className="font-bold text-emerald-600">98%</span></div>
            <div>Readability: <span className="font-bold text-emerald-600">96%</span></div>
            <div>Discoverability: <span className="font-bold text-emerald-600">94%</span></div>
          </div>
        </div>
      </div>
      <div className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Click to view details</div>
    </div>
  );
}

// ─── Current site audit full canvas ─────────────────────────────────────────
function AuditCanvas() {
  const t = useT();
  const metrics = [
    { labelKey: 'workspace.audit.metric.usability.label',       hintKey: 'workspace.audit.metric.usability.hint',       value: 32, color: 'text-red-500',   barColor: 'bg-red-500'   },
    { labelKey: 'workspace.audit.metric.readability.label',     hintKey: 'workspace.audit.metric.readability.hint',     value: 45, color: 'text-amber-500', barColor: 'bg-amber-500' },
    { labelKey: 'workspace.audit.metric.discoverability.label', hintKey: 'workspace.audit.metric.discoverability.hint', value: 20, color: 'text-red-500',   barColor: 'bg-red-500'   },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('workspace.audit.title')}</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">{t('workspace.audit.subtitle')}</p>
      </div>
      <div className="relative">
        <CircularGauge score={4} maxScore={10} size={200} strokeWidth={20} color="#ef4444" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-6xl font-extrabold text-red-500 leading-none">4</span>
          <span className="text-slate-400 text-base font-medium">/10</span>
          <AlertCircle className="w-5 h-5 text-red-400 mt-1" />
        </div>
      </div>
      <div className="flex gap-8 w-full max-w-md">
        {metrics.map(m => (
          <div key={m.labelKey} className="flex-1 space-y-2">
            <div className={cn("text-2xl font-extrabold", m.color)}>{m.value}%</div>
            <div className="text-xs text-slate-700 font-bold">{t(m.labelKey)}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{t(m.hintKey)}</div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", m.barColor)} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {['workspace.audit.tag.0', 'workspace.audit.tag.1', 'workspace.audit.tag.2'].map(key => (
          <span key={key} className="bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-4 py-2 rounded-full">{t(key)}</span>
        ))}
      </div>
    </div>
  );
}

// ─── New site audit full canvas ─────────────────────────────────────────────
function PostAuditCanvas() {
  const t = useT();
  const metrics = [
    { labelKey: 'workspace.audit.metric.usability.label',       value: 98, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { labelKey: 'workspace.audit.metric.readability.label',     value: 96, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { labelKey: 'workspace.audit.metric.discoverability.label', value: 94, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('workspace.postAudit.title')}</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">{t('workspace.postAudit.subtitle')}</p>
      </div>
      <div className="relative">
        <CircularGauge score={10} maxScore={10} size={200} strokeWidth={20} color="#10b981" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-6xl font-extrabold text-emerald-500 leading-none">10</span>
          <span className="text-slate-400 text-base font-medium">/10</span>
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-1" />
        </div>
      </div>
      <div className="flex gap-10 w-full max-w-sm">
        {metrics.map(m => (
          <div key={m.labelKey} className="flex-1 space-y-2">
            <div className={cn("text-2xl font-extrabold", m.color)}>{m.value}%</div>
            <div className="text-xs text-slate-500 font-medium">{t(m.labelKey)}</div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-700", m.barColor)} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {['workspace.postAudit.tag.0', 'workspace.postAudit.tag.1', 'workspace.postAudit.tag.2'].map(key => (
          <span key={key} className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold px-4 py-2 rounded-full">{t(key)}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Agent hire card (chat bubble) ─────────────────────────────────────────
function AgentHireCard({ name, role, description, gradientClass, icon }: {
  name: string; role: string; description: string; gradientClass: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className={cn("px-4 py-3 flex items-center gap-3", gradientClass)}>
        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-tight">{name}</div>
          <div className="text-white/70 text-[10px]">{role}</div>
        </div>
        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/30 shrink-0 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Hired
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Connection type picker (center canvas) ─────────────────────────────────
function ConnectionTypeScreen({ onSelectSIS, onSkip }: { onSelectSIS: () => void; onSkip: () => void }) {
  const t = useT();
  const types = [
    {
      id: 'sis',
      label: 'SIS',
      sub: t('workspace.connectionType.sis.sub'),
      icon: <Database className="w-7 h-7" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      active: true,
    },
    {
      id: 'lms',
      label: 'LMS',
      sub: t('workspace.connectionType.lms.sub'),
      icon: <BookOpen className="w-7 h-7" />,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      active: false,
    },
    {
      id: 'folder',
      label: t('workspace.connectionType.folder.label'),
      sub: t('workspace.connectionType.folder.sub'),
      icon: <FolderOpen className="w-7 h-7" />,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      active: false,
    },
    {
      id: 'comms',
      label: t('workspace.connectionType.comms.label'),
      sub: t('workspace.connectionType.comms.sub'),
      icon: <MessageSquare className="w-7 h-7" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      active: false,
    },
  ];
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 w-full max-w-sm space-y-7">

        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">{t('workspace.connectionType.heading')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('workspace.connectionType.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {types.map(t => (
            <button
              key={t.id}
              onClick={t.active ? onSelectSIS : undefined}
              className={cn(
                'flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all duration-200',
                t.active
                  ? `${t.bg} ${t.border} hover:shadow-md hover:scale-[1.03] cursor-pointer`
                  : `${t.bg} ${t.border} cursor-default`
              )}
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', t.bg, t.color)}>
                {t.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{t.label}</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5 break-words hyphens-auto">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-slate-400">{t('workspace.connectionType.footer')}</p>
          <button
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            {t('workspace.skipForNow')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIS provider selector (center canvas) ──────────────────────────────────
function SISSelectScreen({ onContinue }: { onContinue: (sis: string) => void }) {
  const t = useT();
  const region = useRegion();
  const isGermany = region.id === 'Germany';
  const [selected, setSelected] = useState('DaNiS');

  const SisCard = ({ p }: { p: { name: string; domain: string } }) => {
    const isSelected = selected === p.name;
    return (
      <button
        key={p.name}
        onClick={() => setSelected(p.name)}
        className={cn(
          'flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-3 text-center group',
          isSelected
            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 shadow-sm'
            : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'
        )}
      >
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-black/5 overflow-hidden bg-white transition-transform duration-200',
          !isSelected && 'group-hover:scale-110'
        )}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`}
            alt={p.name}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.textContent = p.name.charAt(0);
                e.currentTarget.parentElement.className = 'w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-blue-100 text-blue-700 border border-black/5';
              }
            }}
          />
        </div>
        <span className={cn(
          'text-xs font-semibold leading-tight',
          isSelected ? 'text-blue-700' : 'text-slate-700'
        )}>{p.name}</span>
        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-blue-500 -mt-1" />}
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-500 overflow-auto">
      <div className="p-6 space-y-5 max-w-2xl w-full mx-auto">

        <div>
          <h2 className="text-lg font-bold text-slate-900">{t('workspace.sisSelect.heading')}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{t('workspace.sisSelect.subtitle')}</p>
        </div>

        {isGermany ? (
          <div className="space-y-5">
            {SIS_PROVIDERS_GERMANY.map(group => (
              <div key={group.groupKey}>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {t(group.groupKey)}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {group.providers.map(p => <SisCard key={p.name} p={p} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {SIS_PROVIDERS.map(p => <SisCard key={p.name} p={p} />)}
          </div>
        )}

        <button
          onClick={() => onContinue(selected)}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
        >
          {t('workspace.sisSelect.continueWith', { name: selected })}
        </button>
      </div>
    </div>
  );
}

// ─── WebUntis OAuth connect screen (center canvas) ──────────────────────────
function ConnectPowerSchoolScreen({ onAuthorize }: { onAuthorize: () => void }) {
  const t = useT();
  const permissionKeys = [
    'workspace.webuntis.permission.0',
    'workspace.webuntis.permission.1',
    'workspace.webuntis.permission.2',
    'workspace.webuntis.permission.3',
  ];
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('workspace.webuntis.title')}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{t('workspace.webuntis.subtitle')}</p>
          </div>
        </div>

        {/* Security badges */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('workspace.security.secureTitle')}</p>
              <p className="text-xs text-slate-500">{t('workspace.security.secureBody')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <CheckCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('workspace.security.readOnlyTitle')}</p>
              <p className="text-xs text-slate-500">{t('workspace.security.readOnlyBody')}</p>
            </div>
          </div>
        </div>

        {/* Permissions list */}
        <div>
          <p className="text-sm font-bold text-slate-800 mb-3">{t('workspace.webuntis.permissionsLabel')}</p>
          <div className="space-y-2">
            {permissionKeys.map(key => (
              <div key={key} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                {t(key)}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <button
            onClick={onAuthorize}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
          >
            <ExternalLink className="w-4 h-4" />
            {t('workspace.webuntis.authorize')}
          </button>
          <p className="text-center text-xs text-slate-400">{t('workspace.webuntis.redirectNote')}</p>
        </div>

      </div>
    </div>
  );
}

// ─── Improvement progress path ──────────────────────────────────────────────
const PROGRESS_STEPS: { labelKey: string; detailKey: string }[] = [
  { labelKey: 'workspace.progress.audit.label',    detailKey: 'workspace.progress.audit.detail' },
  { labelKey: 'workspace.progress.connect.label',  detailKey: 'workspace.progress.connect.detail' },
  { labelKey: 'workspace.progress.build.label',    detailKey: 'workspace.progress.build.detail' },
  { labelKey: 'workspace.progress.review.label',   detailKey: 'workspace.progress.review.detail' },
  { labelKey: 'workspace.progress.reaudit.label',  detailKey: 'workspace.progress.reaudit.detail' },
  { labelKey: 'workspace.progress.publish.label',  detailKey: 'workspace.progress.publish.detail' },
];

function getProgressIndex(step: ScenarioStep, siteApproved: boolean): number {
  switch (step) {
    case 'url_input':
    case 'audit':        return 0;
    case 'orchestrator': return 1;
    case 'generation':   return 2;
    case 'post_audit':   return siteApproved ? 4 : 3;
    case 'hiring':       return 5;
    default:             return -1;
  }
}

function ScenarioProgressBar({ step, siteApproved }: { step: ScenarioStep; siteApproved: boolean }) {
  const t = useT();
  const active = getProgressIndex(step, siteApproved);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= PROGRESS_STEPS.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-in fade-in duration-300">
      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">{t('workspace.progress.workflow')}</p>
      <div>
        {PROGRESS_STEPS.map(({ labelKey, detailKey }, i) => {
          const isComplete = i < active;
          const isActive   = i === active;
          const isLast     = i === PROGRESS_STEPS.length - 1;
          if (i >= revealed) return null;
          return (
            <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Timeline spine */}
              <div className="flex flex-col items-center shrink-0">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 shrink-0',
                  isComplete ? 'bg-blue-600' :
                  isActive   ? 'bg-blue-600 ring-2 ring-blue-200 ring-offset-1' :
                               'bg-slate-100 border-2 border-slate-200'
                )}>
                  {isComplete
                    ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                    : isActive
                      ? <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      : <span className="w-2 h-2 rounded-full bg-slate-300" />
                  }
                </div>
                {!isLast && (
                  <div className={cn(
                    'w-0.5 my-1 transition-colors duration-500',
                    i < active ? 'bg-blue-400' : 'bg-slate-200'
                  )} style={{ minHeight: '22px' }} />
                )}
              </div>
              {/* Step text */}
              <div className="pb-4 min-w-0">
                <p className={cn(
                  'text-sm font-bold leading-tight transition-colors duration-300',
                  isComplete ? 'text-slate-400 line-through decoration-slate-300' :
                  isActive   ? 'text-slate-900' :
                               'text-slate-400'
                )}>
                  {t(labelKey)}
                </p>
                <p className={cn(
                  'text-[11px] mt-0.5 transition-colors duration-300',
                  isActive ? 'text-blue-600 font-medium' : 'text-slate-400'
                )}>
                  {t(detailKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Monitoring: discovered items chat card ──────────────────────────────────
function MonitoringFoundItemsChatCard() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2 w-full">
      <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-1">
        <Search className="w-4 h-4 text-blue-500" />
        4 items discovered — drafts ready
      </div>
      <div className="text-xs text-slate-600 space-y-1.5">
        <div className="flex items-start gap-2">
          <Search   className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
          <span>Science Olympiad wins Regional — <em className="text-slate-500">WTTW Oakwood</em></span>
        </div>
        <div className="flex items-start gap-2">
          <FileText className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
          <span>New Absence Policy — <em className="text-slate-500">Oakwood Public Schools</em></span>
        </div>
        <div className="flex items-start gap-2">
          <Activity className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
          <span>Boys Basketball Regional Champs — <em className="text-slate-500">IHSA</em></span>
        </div>
        <div className="flex items-start gap-2">
          <Globe    className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
          <span>WCAG 2.2 Checklist for K-12 — <em className="text-slate-500">WebAIM Research</em></span>
        </div>
      </div>
    </div>
  );
}

// ─── Monitoring: topic tiles + source config canvas ─────────────────────────
const TOPIC_TILES = [
  { id: 'sports',    label: 'Sport Events',           sub: 'IHSA results, league standings',       labelKey: 'workspace.topic.sports.label',    subKey: 'workspace.topic.sports.sub',    icon: <Activity    className="w-5 h-5" /> },
  { id: 'science',   label: 'Science Events',          sub: 'STEM competitions, research fairs',    labelKey: 'workspace.topic.science.label',   subKey: 'workspace.topic.science.sub',   icon: <Search      className="w-5 h-5" /> },
  { id: 'openhouse', label: 'Open Day Events',         sub: 'Admissions, tours, open days',         labelKey: 'workspace.topic.openhouse.label', subKey: 'workspace.topic.openhouse.sub', icon: <Users       className="w-5 h-5" /> },
  { id: 'district',  label: 'District Announcements',  sub: 'Oakwood Public Schools feed',          labelKey: 'workspace.topic.district.label',  subKey: 'workspace.topic.district.sub',  icon: <FileText    className="w-5 h-5" /> },
  { id: 'legal',     label: 'Legal News',              sub: 'Education law, regulatory changes',    labelKey: 'workspace.topic.legal.label',     subKey: 'workspace.topic.legal.sub',     icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'health',    label: 'Health Standards',        sub: 'Accessibility, WCAG, web compliance',  labelKey: 'workspace.topic.health.label',    subKey: 'workspace.topic.health.sub',    icon: <Globe       className="w-5 h-5" /> },
];

const TOPIC_LABELS: Record<string, string> = Object.fromEntries(TOPIC_TILES.map(t => [t.id, t.label]));

function MonitoringSourcesCanvas({
  selectedTopics,
  onToggle,
  showSelected,
}: {
  selectedTopics: string[];
  onToggle: (id: string) => void;
  showSelected: boolean;
}) {
  const t = useT();
  // Both phases use the same 6 tiles — after activation they show "Connected"
  return (
    <div className="flex-1 overflow-auto bg-white animate-in fade-in duration-700 p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('workspace.monitoringCanvas.heading')}</h2>
        <p className="text-slate-400 text-sm mt-1">
          {showSelected
            ? t('workspace.monitoringCanvas.connectedCount', { count: selectedTopics.length })
            : t('workspace.monitoringCanvas.tapToggle')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {TOPIC_TILES.map(tile => {
          const selected = selectedTopics.includes(tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => !showSelected && onToggle(tile.id)}
              disabled={showSelected}
              className={cn(
                "rounded-2xl border-2 p-5 text-left space-y-3 transition-all duration-200",
                !showSelected && "hover:scale-[1.02] active:scale-[0.98]",
                selected && !showSelected ? "bg-blue-50 border-blue-300 shadow-md" :
                selected &&  showSelected ? "bg-blue-50 border-blue-300 shadow-md" :
                                            "bg-white border-slate-200 opacity-40"
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  selected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                )}>
                  {tile.icon}
                </div>
                {showSelected && selected ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{t('workspace.monitoringCanvas.connectedBadge')}</span>
                ) : (
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    selected ? "border-blue-500 bg-blue-500" : "border-slate-300"
                  )}>
                    {selected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                )}
              </div>
              <div>
                <p className={cn("text-sm font-bold", selected ? "text-slate-900" : "text-slate-400")}>{t(tile.labelKey)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t(tile.subKey)}</p>
              </div>
            </button>
          );
        })}
      </div>
      {!showSelected && (
        <p className="text-xs text-slate-400 text-center">{t('workspace.monitoringCanvas.selectedCount', { count: selectedTopics.length, total: TOPIC_TILES.length })}</p>
      )}
    </div>
  );
}

// ─── Monitoring: setup animation canvas ─────────────────────────────────────
function MonitoringSetupCanvas({ topics, extraSite }: { topics: string[]; extraSite?: string | null }) {
  const t = useT();
  const [ticked, setTicked] = useState(0);
  const baseTiles = topics.map(id => TOPIC_TILES.find(tt => tt.id === id)).filter(Boolean) as typeof TOPIC_TILES;
  const items = [
    ...baseTiles.map(tile => ({ id: tile.id, label: t(tile.labelKey), sub: t(tile.subKey), icon: tile.icon })),
    ...(extraSite ? [{ id: 'extra', label: extraSite, sub: t('workspace.monitoringSetup.externalWebsite'), icon: <Globe className="w-5 h-5" /> }] : []),
  ];

  useEffect(() => {
    if (ticked >= items.length) return;
    const timer = setTimeout(() => setTicked(t => t + 1), 520);
    return () => clearTimeout(timer);
  }, [ticked, items.length]);

  const allDone = ticked >= items.length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {allDone ? t('workspace.monitoringSetup.headingLive') : t('workspace.monitoringSetup.headingActive')}
        </h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">
          {allDone ? t('workspace.monitoringSetup.subtitleLive') : t('workspace.monitoringSetup.subtitleActive')}
        </p>
      </div>
      <div className="w-full max-w-md space-y-3">
        {items.map((s, i) => {
          const isDone   = ticked > i;
          const isActive = ticked === i;
          return (
            <div key={s.id} className={cn(
              "flex items-center gap-4 p-3 rounded-xl border transition-all duration-500",
              isDone   ? "bg-blue-50 border-blue-200"  :
              isActive ? "bg-slate-50 border-blue-300" :
                         "bg-slate-50 border-slate-200 opacity-40"
            )}>
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4",
                isDone   ? "bg-blue-100 text-blue-600"  :
                isActive ? "bg-blue-50 text-blue-500"   :
                           "bg-slate-100 text-slate-400"
              )}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold",
                  isDone || isActive ? "text-slate-900" : "text-slate-400"
                )}>{s.label}</p>
                <p className="text-xs text-slate-400">
                  {isDone ? t('workspace.monitoringSetup.feedConnected') : isActive ? t('workspace.monitoringSetup.connecting') : t('workspace.monitoringSetup.waiting')}
                </p>
              </div>
              <div className="shrink-0">
                {isDone   ? <CheckCircle className="w-5 h-5 text-blue-500" />           :
                 isActive ? <Loader2     className="w-5 h-5 text-blue-400 animate-spin" /> :
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
              </div>
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-5 py-2.5 animate-in fade-in duration-500">
          <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-sm font-bold text-blue-700">{t('workspace.monitoringSetup.allFeedsActive', { count: items.length })}</span>
        </div>
      )}
    </div>
  );
}

// ─── Monitoring: discovery feed canvas ──────────────────────────────────────
function MonitoringDiscoveryCanvas() {
  const items = [
    {
      source: 'WTTW Oakwood',
      sourceType: 'Science & Academic',
      time: '2 hours ago',
      headline: 'Oakwood High School Science Olympiad Team Takes Regional Title',
      draft: 'Blog post + Homepage announcement',
    },
    {
      source: 'Oakwood Public Schools',
      sourceType: 'District',
      time: 'Yesterday',
      headline: 'Updated Student Absence Policy — Effective April 1, 2026',
      draft: 'Policy page update + Parent alert banner',
    },
    {
      source: 'IHSA',
      sourceType: 'Sports',
      time: '3 days ago',
      headline: 'Oakwood HS Boys Basketball — Regional Champions 2026',
      draft: 'Athletics news post + Homepage banner',
    },
    {
      source: 'WebAIM Research',
      sourceType: 'Web Health',
      time: '4 days ago',
      headline: 'New WCAG 2.2 Compliance Checklist for K-12 School Websites Released',
      draft: 'Compliance checklist page update',
    },
  ];
  return (
    <div className="flex-1 overflow-auto bg-white animate-in fade-in duration-700 p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">4 Items Discovered</h2>
        <p className="text-slate-400 text-sm mt-1">Relevant content found across monitored sources — AI drafts generated for each</p>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-slate-900 border border-blue-200">
                  {item.sourceType}
                </span>
                <span className="text-[10px] text-slate-500">{item.source}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug">{item.headline}</p>
            <div className="flex items-center gap-2">
              <PenTool className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-600">Draft ready: <span className="font-semibold text-slate-900">{item.draft}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Monitoring: draft review queue canvas ───────────────────────────────────
function MonitoringDraftsCanvas() {
  const drafts = [
    { title: 'Science Olympiad Team Takes Regional Title',          type: 'Blog Post',       source: 'WTTW Oakwood'           },
    { title: 'Updated Student Absence Policy — Effective April 1', type: 'Policy Update',   source: 'Oakwood Public Schools' },
    { title: 'Boys Basketball — Regional Champions 2026',          type: 'Athletics Post',  source: 'IHSA'                   },
    { title: 'WCAG 2.2 Compliance Checklist for K-12 Websites',    type: 'Compliance Page', source: 'WebAIM Research'         },
  ];
  return (
    <div className="flex-1 overflow-auto bg-white animate-in fade-in duration-700 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Content Review Queue</h2>
          <p className="text-slate-400 text-sm mt-1">4 AI-generated drafts awaiting your approval</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-700 font-bold text-sm">4 Pending</span>
        </div>
      </div>

      <div className="space-y-3">
        {drafts.map((d, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <PenTool className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 leading-snug">{d.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-slate-900">{d.type}</span>
                <span className="text-[10px] text-slate-400">via {d.source}</span>
              </div>
            </div>
            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending Review
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">Monitoring continues in the background</p>
          <p className="text-xs text-blue-600 mt-1">New items from your 6 configured sources will be scanned daily and queued as drafts automatically.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Monitoring workflow progress bar ────────────────────────────────────────
const MONITORING_STEPS: { labelKey: string; detailKey: string }[] = [
  { labelKey: 'workspace.monitoring.topics.label', detailKey: 'workspace.monitoring.topics.detail' },
  { labelKey: 'workspace.monitoring.setup.label',  detailKey: 'workspace.monitoring.setup.detail' },
  { labelKey: 'workspace.monitoring.active.label', detailKey: 'workspace.monitoring.active.detail' },
];

function getMonitoringProgressIndex(step: ScenarioStep): number {
  switch (step) {
    case 'mon_input':    return 0;
    case 'mon_scanning': return 1;
    case 'mon_active':   return 2;
    default:             return -1;
  }
}

function MonitoringProgressBar({ step }: { step: ScenarioStep }) {
  const t = useT();
  const active = getMonitoringProgressIndex(step);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-in fade-in duration-300">
      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">{t('workspace.progress.workflow')}</p>
      <div>
        {MONITORING_STEPS.map(({ labelKey, detailKey }, i) => {
          const isComplete = i < active;
          const isActive   = i === active;
          const isLast     = i === MONITORING_STEPS.length - 1;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 shrink-0',
                  isComplete ? 'bg-blue-600' :
                  isActive   ? 'bg-blue-600 ring-2 ring-blue-200 ring-offset-1' :
                               'bg-slate-100 border-2 border-slate-200'
                )}>
                  {isComplete
                    ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                    : isActive
                      ? <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      : <span className="w-2 h-2 rounded-full bg-slate-300" />
                  }
                </div>
                {!isLast && (
                  <div className={cn(
                    'w-0.5 my-1 transition-colors duration-500',
                    i < active ? 'bg-blue-400' : 'bg-slate-200'
                  )} style={{ minHeight: '22px' }} />
                )}
              </div>
              <div className="pb-4 min-w-0">
                <p className={cn(
                  'text-sm font-bold leading-tight transition-colors duration-300',
                  isComplete ? 'text-slate-400 line-through decoration-slate-300' :
                  isActive   ? 'text-slate-900' :
                               'text-slate-400'
                )}>
                  {t(labelKey)}
                </p>
                <p className={cn(
                  'text-[11px] mt-0.5 transition-colors duration-300',
                  isActive ? 'text-blue-600 font-medium' : 'text-slate-400'
                )}>
                  {t(detailKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Auto-updates scenario: source systems ───────────────────────────────────
// Each source is its own connection step. They all share the same light-blue
// palette to match the monitoring scenario's visual language.
type AutoSourceId = 'cms' | 'sis' | 'lms' | 'shared_folder';
type AutoSource = {
  id: AutoSourceId;
  label: string;
  /** Translation key for the subtitle. */
  subKey: string;
  domain: string;
  /** Translation keys for permissions. */
  permissionKeys: string[];
  /** Translation key for the connect CTA. */
  ctaKey: string;
  iconKey: 'globe' | 'database' | 'book' | 'folder';
  /** Translation key for what part of the site this source feeds. */
  feedsKey: string;
};

const AUTO_UPDATE_SOURCES: AutoSource[] = [
  {
    id: 'cms',
    label: 'WordPress',
    subKey: 'workspace.autoSource.cms.sub',
    domain: 'wordpress.com',
    iconKey: 'globe',
    ctaKey: 'workspace.autoSource.cms.cta',
    feedsKey: 'workspace.autoSource.cms.feeds',
    permissionKeys: [
      'workspace.autoSource.cms.permission.0',
      'workspace.autoSource.cms.permission.1',
      'workspace.autoSource.cms.permission.2',
      'workspace.autoSource.cms.permission.3',
    ],
  },
  {
    id: 'sis',
    label: 'DaNiS',
    subKey: 'workspace.autoSource.sis.sub',
    domain: 'danis-hilfe.nibis.de',
    iconKey: 'database',
    ctaKey: 'workspace.autoSource.sis.cta',
    feedsKey: 'workspace.autoSource.sis.feeds',
    permissionKeys: [
      'workspace.webuntis.permission.0',
      'workspace.webuntis.permission.1',
      'workspace.webuntis.permission.2',
      'workspace.webuntis.permission.3',
    ],
  },
  {
    id: 'lms',
    label: 'Canvas LMS',
    subKey: 'workspace.autoSource.lms.sub',
    domain: 'canvas.instructure.com',
    iconKey: 'book',
    ctaKey: 'workspace.autoSource.lms.cta',
    feedsKey: 'workspace.autoSource.lms.feeds',
    permissionKeys: [
      'workspace.autoSource.lms.permission.0',
      'workspace.autoSource.lms.permission.1',
      'workspace.autoSource.lms.permission.2',
      'workspace.autoSource.lms.permission.3',
    ],
  },
  {
    id: 'shared_folder',
    label: 'Shared Folder',
    subKey: 'workspace.autoSource.folder.sub',
    domain: 'drive.google.com',
    iconKey: 'folder',
    ctaKey: 'workspace.autoSource.folder.cta',
    feedsKey: 'workspace.autoSource.folder.feeds',
    permissionKeys: [
      'workspace.autoSource.folder.permission.0',
      'workspace.autoSource.folder.permission.1',
      'workspace.autoSource.folder.permission.2',
    ],
  },
];

function autoSourceIcon(key: AutoSource['iconKey']) {
  const cls = "w-9 h-9 object-contain";
  switch (key) {
    case 'globe':    return <Globe      className={cls} />;
    case 'database': return <Database   className={cls} />;
    case 'book':     return <BookOpen   className={cls} />;
    case 'folder':   return <FolderOpen className={cls} />;
  }
}

// Step → source ID mapping
const AUTO_STEP_TO_SOURCE: Record<string, AutoSourceId> = {
  auto_cms:           'cms',
  auto_sis:           'sis',
  auto_lms:           'lms',
  auto_shared_folder: 'shared_folder',
};

const AUTO_STEP_ORDER: ScenarioStep[] = ['auto_cms', 'auto_sis', 'auto_lms', 'auto_shared_folder', 'auto_active'];

// ─── Auto-updates: site analysis canvas ─────────────────────────────────────
// Shows the current website with a "scanning" pass that progressively reveals
// findings — areas of the site that would benefit from being auto-synced.
function AutoUpdatesAnalyzeCanvas({
  websiteUrl, scanTick, siteScale,
}: {
  websiteUrl: string;
  scanTick: number;
  siteScale: number;
}) {
  const findings: { source: AutoSourceId; area: string; example: string }[] = [
    { source: 'cms', area: 'Pages & posts',           example: 'Homepage banners, news posts' },
    { source: 'sis', area: 'Faculty Directory',       example: '47 staff entries' },
    { source: 'lms', area: 'Calendar & club pages',   example: 'Spring Break, Robotics Club' },
  ];

  const scanComplete = scanTick >= findings.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-in fade-in zoom-in-95 duration-700">
      {/* URL bar */}
      <div className="shrink-0 bg-white px-3 py-2 border-b border-slate-200 flex items-center gap-2">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"/>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"/>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/>
        </div>
        <div className="bg-blue-50 px-3 py-1 rounded text-xs text-blue-700 font-bold font-mono flex-1 text-center border border-blue-200">{websiteUrl}</div>
        {scanComplete ? (
          <div className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3 h-3" /> Analysis complete
          </div>
        ) : (
          <div className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
            <Loader2 className="w-3 h-3 animate-spin" /> Scanning…
          </div>
        )}
      </div>

      {/* Site preview + scan / findings overlay */}
      <div className="relative flex-1 min-h-0 overflow-hidden bg-slate-50">
        {/* Underlying site */}
        <div className="absolute inset-0 overflow-auto">
          <DemoSiteAfter siteScale={siteScale} />
        </div>

        {/* Scanning sweep */}
        {!scanComplete && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent"
              style={{ animation: 'autoScan 2.4s linear infinite' }}
            />
            <style>{`@keyframes autoScan { 0% { top: -10%; } 100% { top: 110%; } }`}</style>
          </div>
        )}

        {/* Findings overlay panel — bottom-right */}
        <div className="absolute right-4 top-4 bottom-4 w-72 max-w-[calc(100%-2rem)] bg-white/95 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {scanComplete ? 'What I found' : 'Analyzing site…'}
            </p>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
              scanComplete
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            )}>
              {Math.min(scanTick, findings.length)} / {findings.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-auto">
            {findings.map((f, i) => {
              const revealed = scanTick > i;
              const source = AUTO_UPDATE_SOURCES.find(s => s.id === f.source)!;
              return (
                <div
                  key={f.area}
                  className={cn(
                    "rounded-xl border p-3 transition-all duration-500",
                    revealed
                      ? "bg-blue-50 border-blue-200 opacity-100 translate-y-0"
                      : "bg-slate-50 border-slate-200 opacity-0 translate-y-2"
                  )}
                >
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">{f.area}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{f.example}</p>
                  {revealed && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-blue-700">
                      <span>→</span>
                      <div className="w-3.5 h-3.5 rounded bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=64`}
                          alt={source.label}
                          className="w-2.5 h-2.5 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <span>{source.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {scanComplete && (
            <div className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
              I'd like to connect <strong>3 sources</strong> to keep this in sync — see the chat for the plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auto-updates: generic per-source connection canvas ─────────────────────
// One screen per data source — used for CMS, SIS, LMS, Shared Folder, Other.
// Each step has its own Authorize and Skip CTAs.
function ConnectAutoSourceCanvas({
  source, websiteUrl, stepIndex, totalSteps, onAuthorize, onSkip,
}: {
  source: AutoSource;
  websiteUrl: string;
  stepIndex: number;
  totalSteps: number;
  onAuthorize: () => void;
  onSkip: () => void;
}) {
  const t = useT();
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 w-full max-w-sm space-y-6">

        {/* Step pill */}
        <div className="flex items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {t('workspace.autoSource.stepCount', { step: stepIndex, total: totalSteps })}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
            {autoSourceIcon(source.iconKey)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('workspace.autoSource.connect', { label: source.label })}</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {source.id === 'cms'
                ? <>{t('workspace.autoSource.cmsHint.before')}<span className="font-semibold">{websiteUrl}</span>{t('workspace.autoSource.cmsHint.after')}</>
                : t(source.subKey)}
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('workspace.security.secureTitle')}</p>
              <p className="text-xs text-slate-500">{t('workspace.security.oauthBody')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <CheckCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('workspace.security.scopedTitle')}</p>
              <p className="text-xs text-slate-500">{t('workspace.security.scopedBody')}</p>
            </div>
          </div>
        </div>

        {/* Permissions list */}
        <div>
          <p className="text-sm font-bold text-slate-800 mb-3">{t('workspace.autoSource.permissionsLabel')}</p>
          <div className="space-y-2">
            {source.permissionKeys.map(key => (
              <div key={key} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                {t(key)}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <button
            onClick={onAuthorize}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
          >
            <ExternalLink className="w-4 h-4" />
            {t(source.ctaKey)}
          </button>
          <button
            onClick={onSkip}
            className="w-full text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors py-1"
          >
            {t('workspace.skipForNow')}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Auto-updates: final "active" canvas ────────────────────────────────────
function AutoUpdatesActiveCanvas({ websiteUrl, connected, skipped }: {
  websiteUrl: string;
  connected: AutoSourceId[];
  skipped: AutoSourceId[];
}) {
  const t = useT();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('workspace.autoActive.heading')}</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">
          <span className="font-semibold text-slate-700">{websiteUrl}</span>{t('workspace.autoActive.subtitleSuffix')}
        </p>
      </div>
      <div className="w-full max-w-md space-y-3">
        {AUTO_UPDATE_SOURCES.map(s => {
          const isConnected = connected.includes(s.id);
          const isSkipped   = skipped.includes(s.id);
          return (
            <div key={s.id} className={cn(
              "flex items-center gap-4 p-3 rounded-xl border transition-all duration-500",
              isConnected ? "bg-blue-50 border-blue-200" :
              isSkipped   ? "bg-slate-50 border-dashed border-slate-300 opacity-60" :
                            "bg-slate-50 border-slate-200 opacity-40"
            )}>
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=128`}
                  alt={s.label}
                  className="w-5 h-5 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold", isConnected ? "text-slate-900" : "text-slate-500")}>{s.label}</p>
                <p className="text-xs text-slate-400">
                  {isConnected ? t('workspace.autoActive.connected') :
                   isSkipped   ? t('workspace.autoActive.skipped') :
                                 t(s.subKey)}
                </p>
              </div>
              <div className="shrink-0">
                {isConnected ? <CheckCircle className="w-5 h-5 text-blue-500" /> :
                 isSkipped   ? <span className="text-[10px] font-bold text-slate-400 uppercase">{t('workspace.autoActive.skippedShort')}</span> :
                               <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-5 py-2.5 animate-in fade-in duration-500">
        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-sm font-bold text-blue-700">
          {t('workspace.autoActive.summary', { count: connected.length, total: AUTO_UPDATE_SOURCES.length })}
        </span>
      </div>
    </div>
  );
}

// ─── Auto-updates workflow progress bar ──────────────────────────────────────
const AUTO_STEPS: { labelKey: string; detailKey: string }[] = [
  { labelKey: 'workspace.auto.site.label',         detailKey: 'workspace.auto.site.detail' },
  { labelKey: 'workspace.auto.analyze.label',      detailKey: 'workspace.auto.analyze.detail' },
  { labelKey: 'workspace.auto.cms.label',          detailKey: 'workspace.auto.cms.detail' },
  { labelKey: 'workspace.auto.sis.label',          detailKey: 'workspace.auto.sis.detail' },
  { labelKey: 'workspace.auto.lms.label',          detailKey: 'workspace.auto.lms.detail' },
  { labelKey: 'workspace.auto.sharedFolder.label', detailKey: 'workspace.auto.sharedFolder.detail' },
  { labelKey: 'workspace.auto.active.label',       detailKey: 'workspace.auto.active.detail' },
];

function getAutoProgressIndex(step: ScenarioStep): number {
  switch (step) {
    case 'auto_url_input':     return 0;
    case 'auto_analyze':       return 1;
    case 'auto_cms':           return 2;
    case 'auto_sis':           return 3;
    case 'auto_lms':           return 4;
    case 'auto_shared_folder': return 5;
    case 'auto_active':        return 6;
    default:                   return -1;
  }
}

function AutoUpdatesProgressBar({ step }: { step: ScenarioStep }) {
  const t = useT();
  const active = getAutoProgressIndex(step);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-in fade-in duration-300">
      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">{t('workspace.progress.workflow')}</p>
      <div>
        {AUTO_STEPS.map(({ labelKey, detailKey }, i) => {
          const isComplete = i < active;
          const isActive   = i === active;
          const isLast     = i === AUTO_STEPS.length - 1;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 shrink-0',
                  isComplete ? 'bg-blue-600' :
                  isActive   ? 'bg-blue-600 ring-2 ring-blue-200 ring-offset-1' :
                               'bg-slate-100 border-2 border-slate-200'
                )}>
                  {isComplete
                    ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                    : isActive
                      ? <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      : <span className="w-2 h-2 rounded-full bg-slate-300" />
                  }
                </div>
                {!isLast && (
                  <div className={cn(
                    'w-0.5 my-1 transition-colors duration-500',
                    i < active ? 'bg-blue-400' : 'bg-slate-200'
                  )} style={{ minHeight: '22px' }} />
                )}
              </div>
              <div className="pb-4 min-w-0">
                <p className={cn(
                  'text-sm font-bold leading-tight transition-colors duration-300',
                  isComplete ? 'text-slate-400 line-through decoration-slate-300' :
                  isActive   ? 'text-slate-900' :
                               'text-slate-400'
                )}>
                  {t(labelKey)}
                </p>
                <p className={cn(
                  'text-[11px] mt-0.5 transition-colors duration-300',
                  isActive ? 'text-blue-600 font-medium' : 'text-slate-400'
                )}>
                  {t(detailKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function AiWorkspaceView({ onFinishScenario, onAgentsHired, onMonitoringComplete, onAutoUpdatesComplete, onCommHubComplete, onOpenCommHub, onSisConnected }: AiWorkspaceViewProps) {
  const t = useT();
  const [scenarioStep, setScenarioStep] = useState<ScenarioStep>('idle');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'agent', content: React.ReactNode}[]>([]);
  const [orchestratorTick, setOrchestratorTick] = useState<number>(-4);

  const [typedUrl, setTypedUrl]           = useState('');
  const [urlSubmitted, setUrlSubmitted]   = useState(false);
  const [urlPromptReady, setUrlPromptReady] = useState(false);
  const [auditReady, setAuditReady]       = useState(false);
  const [postAuditReady, setPostAuditReady] = useState(false);
  const [siteApproved, setSiteApproved] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'type_select' | 'sis_select' | 'powerschool_auth' | null>(null);
  const [selectedSisInfo, setSelectedSisInfo] = useState<{ name: string; domain: string }>({ name: 'WebUntis', domain: 'webuntis.com' });
  const [centerTab, setCenterTab] = useState<'site' | 'audit'>('site');
  const [auditTab, setAuditTab] = useState<'site' | 'audit'>('site');
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Monitoring scenario state
  const [monTopicsSubmitted, setMonTopicsSubmitted]   = useState(false);
  const [monSelectedTopics, setMonSelectedTopics]     = useState<string[]>(['sports', 'science', 'openhouse', 'district', 'legal', 'health']);
  const [monWebsiteReady, setMonWebsiteReady]         = useState(false);
  const [monWebsiteSubmitted, setMonWebsiteSubmitted] = useState(false);
  const [monExtraSite, setMonExtraSite]               = useState<string | null>(null);

  // Auto-updates scenario state
  const [autoTypedUrl, setAutoTypedUrl]                 = useState('');
  const [autoUrlPromptReady, setAutoUrlPromptReady]     = useState(false);
  const [autoUrlSubmitted, setAutoUrlSubmitted]         = useState(false);
  const [autoAnalyzeTick, setAutoAnalyzeTick]           = useState(0);
  const [autoPlanReady, setAutoPlanReady]               = useState(false);
  const [autoConnectedSources, setAutoConnectedSources] = useState<AutoSourceId[]>([]);
  const [autoSkippedSources, setAutoSkippedSources]     = useState<AutoSourceId[]>([]);

  // Communication-hub scenario state (Phase 1 only — emergency & consent live in the Communications Hub page)
  const [commSelectedPlatforms, setCommSelectedPlatforms]   = useState<CommPlatformId[]>(['sdui', 'email']);
  const [commConnectedPlatforms, setCommConnectedPlatforms] = useState<CommPlatformId[]>([]);
  const [commPickerLocked, setCommPickerLocked]             = useState(false);

  const { locale } = useLocale();
  const region = useRegion();
  const isGermany = region.id === 'Germany';
  const TARGET_URL = isGermany ? 'https://rosenbach.de' : 'https://oakwoodhigh.org';
  const auditLang: import('./AuditPreviews').AuditLang =
    locale.language === 'de' ? 'de' : 'en';
  const auditRegion: import('./AuditPreviews').AuditRegion =
    isGermany ? 'DACH' : 'US';

  // Scale site previews to fit the center column
  const centerColRef = useRef<HTMLDivElement>(null);
  const [siteScale, setSiteScale] = useState(0.5);
  useEffect(() => {
    const el = centerColRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setSiteScale(w / 1100);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-tick orchestrator
  useEffect(() => {
    if (scenarioStep === 'orchestrator' && orchestratorTick < 5 && connectionStep === null) {
      let waitTime = 1200;
      if (orchestratorTick === -4) waitTime = 2000;
      if (orchestratorTick === -3) waitTime = 2500;
      if (orchestratorTick === -2) waitTime = 3000;
      if (orchestratorTick === -1) waitTime = 1500;
      const timer = setTimeout(() => setOrchestratorTick(prev => prev + 1), waitTime);
      return () => clearTimeout(timer);
    }
  }, [scenarioStep, orchestratorTick, connectionStep]);

  // Orchestrator chat messages
  useEffect(() => {
    if (scenarioStep === 'orchestrator') {
      if (orchestratorTick === -3) {
        agentMessage(t('workspace.narration.orch.intro'));
      } else if (orchestratorTick === -1) {
        agentMessage(t('workspace.narration.orch.connectPrompt'));
        setConnectionStep('type_select');
      } else if (orchestratorTick === 4) {
        agentMessage(t('workspace.narration.orch.everythingInPlace'));
      }
    }
  }, [orchestratorTick, scenarioStep]);

  // Auto-updates analysis tick + chat narration
  useEffect(() => {
    if (scenarioStep !== 'auto_analyze') return;

    // Analysis findings narrated as the scan reveals each one.
    const FINDINGS_TOTAL = 3;

    if (autoAnalyzeTick === 0) {
      const tt = setTimeout(() => {
        agentMessage(t('workspace.narration.auto.lookGood'));
        setAutoAnalyzeTick(1);
      }, 1200);
      return () => clearTimeout(tt);
    }

    if (autoAnalyzeTick === 1) {
      const tt = setTimeout(() => {
        agentMessage(t('workspace.narration.auto.foundFaculty'));
        setAutoAnalyzeTick(2);
      }, 1800);
      return () => clearTimeout(tt);
    }

    if (autoAnalyzeTick === 2) {
      const tt = setTimeout(() => {
        agentMessage(t('workspace.narration.auto.calendarsClubs'));
        setAutoAnalyzeTick(3);
      }, 1800);
      return () => clearTimeout(tt);
    }

    if (autoAnalyzeTick === FINDINGS_TOTAL) {
      const tt = setTimeout(() => {
        agentMessage(
          <span>
            {t('workspace.narration.auto.planIntro')}
            <ul className="mt-2 ml-4 list-disc text-slate-700 space-y-0.5">
              <li>{t('workspace.narration.auto.plan.wordpress')}</li>
              <li>{t('workspace.narration.auto.plan.webuntis')}</li>
              <li>{t('workspace.narration.auto.plan.canvas')}</li>
            </ul>
            {t('workspace.narration.auto.planOutro')}
          </span>
        );
        setAutoPlanReady(true);
      }, 1500);
      return () => clearTimeout(tt);
    }
  }, [scenarioStep, autoAnalyzeTick]);

  const agentMessage = (content: React.ReactNode) => setChatMessages(prev => [...prev, { role: 'agent', content }]);
  const userMessage  = (content: React.ReactNode) => setChatMessages(prev => [...prev, { role: 'user',  content }]);

  // ── Step handlers ─────────────────────────────────────────────────────────

  const startScenario = () => {
    setScenarioStep('url_input');
    setTypedUrl(TARGET_URL);
    setUrlSubmitted(false);
    setUrlPromptReady(false);
    setAuditReady(false);
    setPostAuditReady(false);
    setSiteApproved(false);
    setConnectionStep(null);
    setAuditTab('site');
    setCenterTab('site');
    setChatMessages([{ role: 'user', content: t('workspace.narration.improve.start') }]);
    setTimeout(() => {
      agentMessage(t('workspace.narration.improve.urlPrompt'));
      setUrlPromptReady(true);
    }, 800);
  };

  const confirmUrl = () => {
    setUrlSubmitted(true);
    userMessage(typedUrl);
    setTimeout(() => {
      setScenarioStep('audit');
      setAuditTab('audit');
      agentMessage(
        <span>
          {t('workspace.narration.improve.scannedPrefix')}<span className="font-bold text-blue-600">{typedUrl}</span>{t('workspace.narration.improve.scannedSuffix')}
          <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-700">
            <li>{t('workspace.narration.improve.finding.0')}</li>
            <li>{t('workspace.narration.improve.finding.1')}</li>
            <li>{t('workspace.narration.improve.finding.2')}</li>
          </ol>
        </span>
      );
      // agentMessage(<AuditChatCardV2 />); // hidden for now
      setTimeout(() => {
        agentMessage(t('workspace.narration.improve.fixOffer'));
        setTimeout(() => setAuditReady(true), 400);
      }, 900);
    }, 2500);
  };

  const handleTypeSelectSIS = () => {
    userMessage(t('workspace.narration.improve.userPickSis'));
    setConnectionStep('sis_select');
  };

  const handleSISContinue = (sisName: string) => {
    userMessage(t('workspace.narration.improve.userConnectVia', { name: sisName }));
    const provider = SIS_PROVIDERS.find(p => p.name === sisName);
    setSelectedSisInfo({ name: sisName, domain: provider?.domain ?? 'webuntis.com' });
    setConnectionStep('powerschool_auth');
  };

  const handleAuthorize = () => {
    setConnectionStep(null);
    onSisConnected?.(selectedSisInfo.name, selectedSisInfo.domain);
    agentMessage(t('workspace.narration.improve.connected', { name: selectedSisInfo.name }));
  };

  const handleSkipConnection = () => {
    setConnectionStep(null);
    userMessage(t('workspace.narration.improve.userSkip'));
    agentMessage(t('workspace.narration.improve.skipReply'));
  };

  const advanceToOrchestrator = () => {
    userMessage(t('workspace.narration.improve.userFixIt'));
    setTimeout(() => {
      setScenarioStep('orchestrator');
      setOrchestratorTick(-4);
    }, 1000);
  };

  const advanceToGeneration = () => {
    userMessage(t('workspace.narration.improve.userLetsGo'));
    setTimeout(() => {
      setScenarioStep('generation');
      agentMessage(t('workspace.narration.improve.building'));
      // Auto-advance to post_audit after the site "loads"
      setTimeout(() => {
        setScenarioStep('post_audit');
        setTimeout(() => {
          agentMessage(
            <span>
              {t('workspace.narration.improve.takeLookPrefix')}{' '}
              <a href={isGermany
                  ? `${import.meta.env.BASE_URL}lerchenberg/good.html`
                  : window.location.hostname === 'localhost'
                    ? `${import.meta.env.BASE_URL}school-after-magic`
                    : 'https://vnikolaev777.github.io/presence-prototype-v3/preview.html'
                } target="_blank" rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium">
                {t('workspace.narration.improve.openInNewTab')}
              </a>
              {t('workspace.narration.improve.takeLookSuffix')}
            </span>
          );
          setTimeout(() => setPostAuditReady(true), 400);
        }, 700);
      }, 2800);
    }, 1000);
  };

  const approveSite = () => {
    userMessage(t('workspace.narration.improve.userLooksGood'));
    setPostAuditReady(false);
    // agentMessage(<PostAuditChatCardV2 />); // hidden for now
    setTimeout(() => {
      agentMessage(t('workspace.narration.improve.siteLive'));
      setTimeout(() => setSiteApproved(true), 500);
    }, 800);
  };

  const advanceToHiring = () => {
    userMessage(t('workspace.narration.improve.userAmazing'));
    setTimeout(() => {
      setScenarioStep('hiring');
      agentMessage(t('workspace.narration.improve.hiringIntro'));
      onAgentsHired?.();
      setTimeout(() => {
        agentMessage(
          <div className="space-y-2 text-slate-600">
            <p className="font-semibold text-slate-800 text-sm">{t('workspace.narration.improve.hiringHeading')}</p>
            <div className="flex items-start gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <span>{t('workspace.narration.improve.hiringLine.0')}</span>
            </div>
            <div className="flex items-start gap-2">
              <PenTool className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>{t('workspace.narration.improve.hiringLine.1')}</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span>{t('workspace.narration.improve.hiringLine.2')}</span>
            </div>
          </div>
        );
      }, 800);
    }, 1000);
  };

  const finishAndGoToDashboard = () => {
    if (onFinishScenario) onFinishScenario();
  };

  const finishMonitoringAndGoToDashboard = () => {
    onMonitoringComplete?.();
    onFinishScenario?.();
  };

  // ── Monitoring scenario handlers ─────────────────────────────────────────

  const startMonitoringScenario = () => {
    setScenarioStep('mon_input');
    setMonTopicsSubmitted(false);
    setMonSelectedTopics(['sports', 'science', 'openhouse', 'district', 'legal', 'health']);
    setMonWebsiteReady(false);
    setMonWebsiteSubmitted(false);
    setMonExtraSite(null);
    setChatMessages([{ role: 'user', content: t('workspace.narration.mon.start') }]);
    setTimeout(() => {
      agentMessage(t('workspace.narration.mon.preselected'));
    }, 800);
  };

  const toggleMonTopic = (id: string) => {
    setMonSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const activateSources = () => {
    const topicNames = monSelectedTopics.map(id => t(`workspace.topic.${id}.label`)).join(', ');
    userMessage(t('workspace.narration.mon.userActivate', { topics: topicNames }));
    setMonTopicsSubmitted(true);
    setTimeout(() => {
      agentMessage(t('workspace.narration.mon.topicsConfirmed'));
      setTimeout(() => setMonWebsiteReady(true), 400);
    }, 800);
  };

  const startSetup = (extraSite: string | null) => {
    const totalSources = monSelectedTopics.length + (extraSite ? 1 : 0);
    setScenarioStep('mon_scanning');
    setTimeout(() => {
      agentMessage(t('workspace.narration.mon.settingUp', { count: totalSources, plural: totalSources !== 1 ? 's' : '' }));
      const setupDuration = totalSources * 520 + 1200;
      setTimeout(() => {
        setScenarioStep('mon_active');
        agentMessage(t('workspace.narration.mon.allLive', { count: totalSources, plural: totalSources !== 1 ? 's' : '' }));
      }, setupDuration);
    }, 800);
  };

  const submitWebsite = () => {
    const site = t('workspace.narration.mon.ministrySiteName');
    userMessage(
      <span>
        {t('workspace.narration.mon.userAddPrefix')}{' '}
        <a
          href={isGermany ? 'https://www.ausbildung.de' : 'https://www.education.gov/'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {site}
        </a>{t('workspace.narration.mon.userAddSuffix')}
      </span>
    );
    setMonWebsiteSubmitted(true);
    setMonExtraSite(site);
    startSetup(site);
  };

  const skipWebsite = () => {
    userMessage(t('workspace.narration.mon.userNoMore'));
    setMonWebsiteSubmitted(true);
    startSetup(null);
  };

  // ── Auto-updates scenario handlers ────────────────────────────────────────

  const startAutoUpdatesScenario = () => {
    setScenarioStep('auto_url_input');
    setAutoTypedUrl(TARGET_URL);
    setAutoUrlSubmitted(false);
    setAutoUrlPromptReady(false);
    setAutoAnalyzeTick(0);
    setAutoPlanReady(false);
    setAutoConnectedSources([]);
    setAutoSkippedSources([]);
    setChatMessages([{ role: 'user', content: t('workspace.narration.autoFlow.start') }]);
    setTimeout(() => {
      agentMessage(t('workspace.narration.autoFlow.urlPrompt'));
      setAutoUrlPromptReady(true);
    }, 800);
  };

  const confirmAutoUrl = () => {
    setAutoUrlSubmitted(true);
    userMessage(autoTypedUrl);
    setTimeout(() => {
      agentMessage(
        <span>
          {t('workspace.narration.autoFlow.openingPrefix')}<span className="font-bold text-blue-600">{autoTypedUrl}</span>{t('workspace.narration.autoFlow.openingSuffix')}
        </span>
      );
      setScenarioStep('auto_analyze');
      setAutoAnalyzeTick(0);
    }, 1200);
  };

  const proceedAutoPlan = () => {
    userMessage(t('workspace.narration.autoFlow.userSetup'));
    setAutoPlanReady(false);
    setTimeout(() => {
      agentMessage(t('workspace.narration.autoFlow.walkthrough'));
      setScenarioStep('auto_cms');
    }, 600);
  };

  // Generic per-step authorize / skip handler.
  const handleAutoSourceAction = (action: 'authorize' | 'skip') => {
    const sourceId = AUTO_STEP_TO_SOURCE[scenarioStep];
    if (!sourceId) return;
    const source = AUTO_UPDATE_SOURCES.find(s => s.id === sourceId);
    if (!source) return;

    const stepIdx = AUTO_STEP_ORDER.indexOf(scenarioStep);
    const nextStep = AUTO_STEP_ORDER[stepIdx + 1] ?? 'auto_active';

    if (action === 'authorize') {
      userMessage(t(source.ctaKey));
      setAutoConnectedSources(prev => prev.includes(sourceId) ? prev : [...prev, sourceId]);
      if (sourceId === 'sis') {
        onSisConnected?.(source.label, source.domain);
      }
    } else {
      userMessage(t('workspace.skipForNow'));
      setAutoSkippedSources(prev => prev.includes(sourceId) ? prev : [...prev, sourceId]);
    }

    setTimeout(() => {
      // Build the agent message based on what we just did and what's next
      const nextSource = AUTO_STEP_TO_SOURCE[nextStep];
      const nextLabel = nextSource && AUTO_UPDATE_SOURCES.find(s => s.id === nextSource)?.label;

      if (nextStep === 'auto_active') {
        // Final transition — go straight to active state with summary message
        setScenarioStep('auto_active');
        // Include the just-handled source so the message reflects the latest decision.
        const willConnect = action === 'authorize'
          ? Array.from(new Set([...autoConnectedSources, sourceId]))
          : autoConnectedSources;
        const willSkip    = action === 'skip'
          ? Array.from(new Set([...autoSkippedSources, sourceId]))
          : autoSkippedSources;
        const connectedNames = willConnect.map(id => AUTO_UPDATE_SOURCES.find(s => s.id === id)?.label).join(', ');
        const skippedNames = willSkip.map(id => AUTO_UPDATE_SOURCES.find(s => s.id === id)?.label).join(', ');
        const summary = willConnect.length > 0
          ? t('workspace.narration.autoFlow.allSetWithConnected', { sources: connectedNames })
          : t('workspace.narration.autoFlow.allSetGeneric');
        const skipSuffix = willSkip.length > 0
          ? ' ' + t('workspace.narration.autoFlow.skippedSuffix', { sources: skippedNames })
          : '';
        agentMessage(summary + skipSuffix + ' ' + t('workspace.narration.autoFlow.manageInTab'));
        return;
      }

      // Mid-flow — acknowledge and prompt for the next source
      agentMessage(
        action === 'authorize'
          ? t('workspace.narration.autoFlow.midConnected', { name: source.label, next: nextLabel ?? '' })
          : t('workspace.narration.autoFlow.midSkipped', { name: source.label, next: nextLabel ?? '' })
      );
      setScenarioStep(nextStep);
    }, 800);
  };

  const finishAutoUpdatesAndGoToDashboard = () => {
    onAutoUpdatesComplete?.();
    onFinishScenario?.();
  };

  // ── Communication-hub scenario handlers ──────────────────────────────────

  const startCommScenario = () => {
    setScenarioStep('comm_select');
    setCommSelectedPlatforms(['sdui', 'email']);
    setCommConnectedPlatforms([]);
    setCommPickerLocked(false);
    setChatMessages([{
      role: 'user',
      content: t('workspace.narration.comm.start'),
    }]);
    setTimeout(() => {
      agentMessage(t('workspace.narration.comm.intro'));
    }, 800);
    setTimeout(() => {
      agentMessage(t('workspace.narration.comm.preselected'));
    }, 2000);
  };

  const toggleCommPlatform = (id: CommPlatformId) => {
    setCommSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const confirmCommPlatforms = () => {
    const labels = commSelectedPlatforms
      .map(id => COMM_PLATFORMS.find(p => p.id === id)?.label)
      .filter(Boolean)
      .join(' + ');
    userMessage(t('workspace.narration.comm.userUse', { platforms: labels }));
    setCommPickerLocked(true);
    setTimeout(() => {
      const wantsSdui = commSelectedPlatforms.includes('sdui');
      const wantsEmail = commSelectedPlatforms.includes('email');
      if (wantsSdui) {
        agentMessage(t('workspace.narration.comm.connectingSdui'));
        setScenarioStep('comm_connect_sdui');
      } else if (wantsEmail) {
        agentMessage(t('workspace.narration.comm.connectingSmtp'));
        setScenarioStep('comm_connect_email');
      } else {
        agentMessage(t('workspace.narration.comm.needChannel'));
        setCommPickerLocked(false);
      }
    }, 700);
  };

  const advanceCommAfterPlatform = (platformId: CommPlatformId, action: 'authorize' | 'skip') => {
    const platform = COMM_PLATFORMS.find(p => p.id === platformId)!;
    if (action === 'authorize') {
      userMessage(t('workspace.narration.comm.userAuthorize', { name: platform.label }));
      setCommConnectedPlatforms(prev => prev.includes(platformId) ? prev : [...prev, platformId]);
    } else {
      userMessage(t('workspace.narration.comm.userSkip', { name: platform.label }));
    }

    setTimeout(() => {
      // Sdui first, then email, then move to hub_active
      if (platformId === 'sdui') {
        const wantsEmail = commSelectedPlatforms.includes('email');
        if (action === 'authorize') {
          agentMessage(wantsEmail ? t('workspace.narration.comm.sduiConnectedNeedEmail') : t('workspace.narration.comm.sduiConnectedReady'));
        } else {
          agentMessage(wantsEmail ? t('workspace.narration.comm.sduiSkippedNeedEmail') : t('workspace.narration.comm.sduiSkippedReady'));
        }
        if (wantsEmail) {
          setScenarioStep('comm_connect_email');
        } else {
          setScenarioStep('comm_hub_active');
          setTimeout(() => promptHubLive(), 600);
        }
      } else if (platformId === 'email') {
        if (action === 'authorize') {
          agentMessage(t('workspace.narration.comm.smtpConnected'));
        } else {
          agentMessage(t('workspace.narration.comm.emailSkipped'));
        }
        setScenarioStep('comm_hub_active');
        setTimeout(() => promptHubLive(), 600);
      }
    }, 700);
  };

  const promptHubLive = () => {
    agentMessage(t('workspace.narration.comm.hubLive'));
  };

  const finishCommAndGoToDashboard = () => {
    onCommHubComplete?.(commConnectedPlatforms);
    onFinishScenario?.();
  };

  const openCommHubFromScenario = () => {
    onCommHubComplete?.(commConnectedPlatforms);
    onOpenCommHub?.();
  };

  // ── Derived booleans ──────────────────────────────────────────────────────
  const isIdle      = scenarioStep === 'idle';
  const isUrlInput  = scenarioStep === 'url_input';
  const isAudit     = scenarioStep === 'audit';
  const isPostAudit = scenarioStep === 'post_audit';

  // Monitoring derived booleans
  const isMonInput    = scenarioStep === 'mon_input';
  const isMonScanning = scenarioStep === 'mon_scanning';
  const isMonActive   = scenarioStep === 'mon_active';
  const isMonitoring  = isMonInput || isMonScanning || isMonActive;

  // Auto-updates derived booleans
  const isAutoUrlInput     = scenarioStep === 'auto_url_input';
  const isAutoAnalyze      = scenarioStep === 'auto_analyze';
  const isAutoCms          = scenarioStep === 'auto_cms';
  const isAutoSis          = scenarioStep === 'auto_sis';
  const isAutoLms          = scenarioStep === 'auto_lms';
  const isAutoSharedFolder = scenarioStep === 'auto_shared_folder';
  const isAutoActive       = scenarioStep === 'auto_active';
  const isAutoConnectingStep = isAutoCms || isAutoSis || isAutoLms || isAutoSharedFolder;
  const isAutoUpdates      = isAutoUrlInput || isAutoAnalyze || isAutoConnectingStep || isAutoActive;
  const currentAutoSourceId = AUTO_STEP_TO_SOURCE[scenarioStep];
  const currentAutoSource   = currentAutoSourceId
    ? AUTO_UPDATE_SOURCES.find(s => s.id === currentAutoSourceId)
    : undefined;
  const currentAutoStepIdx  = AUTO_STEP_ORDER.indexOf(scenarioStep);

  // Communication-hub derived booleans (Phase 1 only — emergency & consent live in the Communications Hub page)
  const isCommSelect       = scenarioStep === 'comm_select';
  const isCommConnectSdui  = scenarioStep === 'comm_connect_sdui';
  const isCommConnectEmail = scenarioStep === 'comm_connect_email';
  const isCommHubActive    = scenarioStep === 'comm_hub_active';
  const isCommHub = isCommSelect || isCommConnectSdui || isCommConnectEmail || isCommHubActive;
  const currentCommPlatform =
    isCommConnectSdui  ? COMM_PLATFORMS.find(p => p.id === 'sdui')! :
    isCommConnectEmail ? COMM_PLATFORMS.find(p => p.id === 'email')! :
    null;
  const commConnectStepIndex =
    isCommConnectSdui  ? 1 :
    isCommConnectEmail ? (commSelectedPlatforms.includes('sdui') ? 2 : 1) :
    0;
  const commConnectTotalSteps = commSelectedPlatforms.length;

  return (
    <div className="flex h-full w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">

      {/* ── LEFT: CHAT PANEL ─────────────────────────────────────────────── */}
      <div className="w-1/3 min-w-[300px] max-w-sm border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">{t('commHub.chat.title')}</h2>
            <p className="text-xs text-slate-500">
              {isIdle              ? t('workspace.subtitle.ready')          :
               isAudit             ? t('workspace.subtitle.auditComplete')  :
               isPostAudit         ? t('workspace.subtitle.siteLive')       :
               isMonInput          ? t('workspace.subtitle.monConfig')      :
               isMonScanning       ? t('workspace.subtitle.monSetup')       :
               isMonActive         ? t('workspace.subtitle.monLive')        :
               isAutoUrlInput      ? t('workspace.subtitle.autoUrl')        :
               isAutoAnalyze       ? t('workspace.subtitle.autoAnalyze')    :
               isAutoCms           ? t('workspace.subtitle.autoCms')        :
               isAutoSis           ? t('workspace.subtitle.autoSis')        :
               isAutoLms           ? t('workspace.subtitle.autoLms')        :
               isAutoSharedFolder  ? t('workspace.subtitle.autoFolder')     :
               isAutoActive        ? t('workspace.subtitle.autoLive')       :
               isCommSelect        ? t('workspace.subtitle.commSelect')    :
               isCommConnectSdui   ? t('workspace.subtitle.commSdui')       :
               isCommConnectEmail  ? t('workspace.subtitle.commEmail')      :
               isCommHubActive     ? t('workspace.subtitle.commLive')       :
                                     t('workspace.subtitle.migrating')}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">

          {/* IDLE STATE */}
          {isIdle && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex flex-col mr-auto items-start max-w-[95%]">
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm text-sm shadow-sm bg-white border border-slate-200 text-slate-700">
                  <p className="font-medium mb-1">{t('workspace.idle.greeting')}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{t('workspace.idle.body')}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{t('commHub.chat.title')}</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{t('workspace.idle.quickActions')}</p>
                {QUICK_ACTIONS.slice(0, showMoreActions ? QUICK_ACTIONS.length : 3).map((action, i) => (
                  i === 0 ? (
                    <button
                      key={i}
                      onClick={startScenario}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all group text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 hover:shadow-md border-indigo-300 text-indigo-800 cursor-pointer relative">
                      <span className={cn("p-1.5 rounded-lg border shrink-0", action.color)}>{action.icon}</span>
                      <span className="flex-1">{t(action.labelKey)}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">{t('workspace.idle.suggested')}</span>
                    </button>
                  ) : (
                    <button
                      key={i}
                      onClick={
                        action.scenario                       ? startScenario            :
                        (action as any).monitoringScenario    ? startMonitoringScenario  :
                        (action as any).autoUpdatesScenario   ? startAutoUpdatesScenario :
                        (action as any).commScenario          ? startCommScenario        :
                                                                undefined
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all group text-sm font-semibold bg-white hover:shadow-md hover:border-slate-300 cursor-pointer border-slate-200 text-slate-700">
                      <span className={cn("p-1.5 rounded-lg border shrink-0", action.color)}>{action.icon}</span>
                      <span className="flex-1">{t(action.labelKey)}</span>
                      <MoveRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )
                ))}
                <button
                  onClick={() => setShowMoreActions(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showMoreActions && "rotate-180")} />
                  {showMoreActions ? t('workspace.idle.viewLess') : t('workspace.idle.viewMore')}
                </button>
              </div>
            </div>
          )}

          {/* SCENARIO: chat messages */}
          {!isIdle && chatMessages.map((msg, i) => (
            <div key={i} className={cn("flex flex-col max-w-[90%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={cn("px-3 py-2 rounded-2xl text-sm shadow-sm",
                msg.role === 'user'
                  ? "bg-slate-800 text-white rounded-br-sm [&_a]:text-blue-300 [&_a]:underline [&_a:hover]:text-blue-100"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">{msg.role === 'user' ? t('chat.sender.you') : t('commHub.chat.title')}</span>
            </div>
          ))}

          {/* URL INPUT (improvement): confirm button */}
          {isUrlInput && !urlSubmitted && urlPromptReady && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={confirmUrl}
                className="border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t('workspace.cta.submitLink')} &rarr;
              </button>
            </div>
          )}

          {/* URL INPUT (auto-updates): confirm button */}
          {isAutoUrlInput && !autoUrlSubmitted && autoUrlPromptReady && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={confirmAutoUrl}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                {t('workspace.cta.submitUrl', { url: autoTypedUrl })}
              </button>
            </div>
          )}

          {/* AUTO-UPDATES: continue-with-plan button after analysis */}
          {isAutoAnalyze && autoPlanReady && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={proceedAutoPlan}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t('workspace.cta.proceedSetup')} &rarr;
              </button>
            </div>
          )}

          {/* AUTO-UPDATES: per-step Authorize / Skip quick replies */}
          {isAutoConnectingStep && currentAutoSource && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 flex flex-wrap gap-2">
              <button onClick={() => handleAutoSourceAction('authorize')}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t(currentAutoSource.ctaKey)} &rarr;
              </button>
              <button onClick={() => handleAutoSourceAction('skip')}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t('workspace.skipForNow')}
              </button>
            </div>
          )}

          {/* AUTO-UPDATES: go to Automations */}
          {isAutoActive && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={finishAutoUpdatesAndGoToDashboard}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t('workspace.cta.goToAutomations')} <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* COMMS: confirm platform picker */}
          {isCommSelect && !commPickerLocked && commSelectedPlatforms.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={confirmCommPlatforms}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('workspace.cta.connectPlatforms', { count: commSelectedPlatforms.length })} &rarr;
              </button>
            </div>
          )}

          {/* COMMS: per-platform Authorize / Skip quick replies */}
          {(isCommConnectSdui || isCommConnectEmail) && currentCommPlatform && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 flex flex-wrap gap-2">
              <button onClick={() => advanceCommAfterPlatform(currentCommPlatform.id, 'authorize')}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t(currentCommPlatform.ctaKey)} &rarr;
              </button>
              <button onClick={() => advanceCommAfterPlatform(currentCommPlatform.id, 'skip')}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t('workspace.skipForNow')}
              </button>
            </div>
          )}

          {/* COMMS: hub live — go to Communications Hub for examples */}
          {isCommHubActive && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 flex flex-wrap gap-2">
              <button onClick={openCommHubFromScenario}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                <Bell className="w-3.5 h-3.5" />
                {t('workspace.cta.openCommHub')} &rarr;
              </button>
              <button onClick={finishCommAndGoToDashboard}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t('workspace.cta.doneForNow')}
              </button>
            </div>
          )}

          {/* MONITORING: activate topics button */}
          {isMonInput && !monTopicsSubmitted && monSelectedTopics.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={activateSources}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                {t('workspace.cta.activateTopics', { count: monSelectedTopics.length })} &rarr;
              </button>
            </div>
          )}

          {/* MONITORING: website quick-reply button */}
          {isMonInput && monWebsiteReady && !monWebsiteSubmitted && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={submitWebsite}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                {t('workspace.cta.addWebsite')}
              </button>
            </div>
          )}

          {/* SCENARIO ACTION BUTTONS */}
          {!isIdle && !isUrlInput && !isMonInput && !isMonScanning && !isAutoUpdates && !isCommHub && (
            <div className="pt-4 flex justify-start">
              {isAudit && auditReady && (
                <button onClick={advanceToOrchestrator}
                  className="animate-in fade-in slide-in-from-bottom border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  {t('workspace.cta.proceedImprovements')} &rarr;
                </button>
              )}
              {scenarioStep === 'orchestrator' && orchestratorTick >= 4 && (
                <button onClick={advanceToGeneration}
                  className="animate-in fade-in slide-in-from-bottom border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  {t('workspace.cta.buildImproved')} &rarr;
                </button>
              )}
              {isPostAudit && postAuditReady && !siteApproved && (
                <button onClick={approveSite}
                  className="animate-in fade-in slide-in-from-bottom border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  {t('workspace.cta.looksGood')} &rarr;
                </button>
              )}
              {isPostAudit && siteApproved && (
                <button onClick={advanceToHiring}
                  className="animate-in fade-in slide-in-from-bottom border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  {t('workspace.cta.connectDomain')} &rarr;
                </button>
              )}
              {scenarioStep === 'hiring' && (
                <button onClick={finishAndGoToDashboard}
                  className="animate-in fade-in slide-in-from-bottom bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                  {t('workspace.cta.goToAutomations')} <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {/* Monitoring: go to Automations — also sets hasMonitoringSetup */}
              {isMonActive && (
                <button onClick={finishMonitoringAndGoToDashboard}
                  className="animate-in fade-in slide-in-from-bottom bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                  {t('workspace.cta.goToAutomations')} <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CENTER: CANVAS ────────────────────────────────────────────────── */}
      <div ref={centerColRef} className="flex-1 min-w-0 relative hidden md:flex flex-col border-r border-slate-200 overflow-hidden bg-white">

        {/* IDLE + URL not yet submitted: placeholder */}
        {(isIdle || (isUrlInput && !urlSubmitted) || (isAutoUrlInput && !autoUrlSubmitted)) && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center bg-slate-100 animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold text-sm max-w-xs">
              {isIdle
                ? <>Select a quick action on the left to get started.<br />Your website preview will appear here.</>
                : 'Your site preview will load once the URL is confirmed.'}
            </p>
          </div>
        )}

        {/* AUTO-UPDATES: post-URL site preview while we wait to enter analyze */}
        {isAutoUrlInput && autoUrlSubmitted && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            <div className="shrink-0 bg-white px-3 py-2 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5 shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/></div>
              <div className="bg-blue-50 px-3 py-1 rounded text-xs text-blue-700 font-bold font-mono flex-1 text-center border border-blue-200">{autoTypedUrl}</div>
              <div className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                <CheckCircle className="w-3 h-3" /> Loaded
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-white">
              <DemoSiteAfter siteScale={siteScale} />
            </div>
          </div>
        )}

        {/* AUTO-UPDATES: site analysis canvas */}
        {isAutoAnalyze && (
          <AutoUpdatesAnalyzeCanvas
            websiteUrl={autoTypedUrl}
            scanTick={autoAnalyzeTick}
            siteScale={siteScale}
          />
        )}

        {/* AUTO-UPDATES: per-source connection screens */}
        {isAutoConnectingStep && currentAutoSource && (
          <ConnectAutoSourceCanvas
            source={currentAutoSource}
            websiteUrl={autoTypedUrl}
            stepIndex={currentAutoStepIdx}
            totalSteps={AUTO_STEP_ORDER.length - 1 /* exclude auto_active */}
            onAuthorize={() => handleAutoSourceAction('authorize')}
            onSkip={() => handleAutoSourceAction('skip')}
          />
        )}

        {/* AUTO-UPDATES: final active canvas */}
        {isAutoActive && (
          <AutoUpdatesActiveCanvas
            websiteUrl={autoTypedUrl}
            connected={autoConnectedSources}
            skipped={autoSkippedSources}
          />
        )}

        {/* COMMS: Phase 1.A — platform picker */}
        {isCommSelect && (
          <CommPlatformPickerCanvas
            selected={commSelectedPlatforms}
            onToggle={toggleCommPlatform}
            locked={commPickerLocked}
          />
        )}

        {/* COMMS: Phase 1.B — per-platform OAuth modal */}
        {(isCommConnectSdui || isCommConnectEmail) && currentCommPlatform && (
          <CommConnectPlatformCanvas
            platform={currentCommPlatform}
            onAuthorize={() => advanceCommAfterPlatform(currentCommPlatform.id, 'authorize')}
            onSkip={() => advanceCommAfterPlatform(currentCommPlatform.id, 'skip')}
            stepIndex={commConnectStepIndex}
            totalSteps={commConnectTotalSteps}
          />
        )}

        {/* COMMS: Phase 1.C — hub map (final state of the connections scenario) */}
        {isCommHubActive && (
          <CommHubMapCanvas connected={commConnectedPlatforms} />
        )}

        {/* MONITORING: source config / website question phase */}
        {isMonInput && (
          <MonitoringSourcesCanvas
            selectedTopics={monSelectedTopics}
            onToggle={monTopicsSubmitted ? () => {} : toggleMonTopic}
            showSelected={monTopicsSubmitted}
          />
        )}

        {/* MONITORING: setup animation */}
        {(isMonScanning || isMonActive) && (
          <MonitoringSetupCanvas topics={monSelectedTopics} extraSite={monExtraSite} />
        )}

        {/* URL submitted OR audit OR generation: tab bar — Website (old) + Audit report */}
        {((isUrlInput && urlSubmitted) || isAudit || scenarioStep === 'generation') && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            {/* Tab bar */}
            <div className="shrink-0 flex bg-slate-50 border-b border-slate-200">
              <button
                onClick={() => setAuditTab('site')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  auditTab === 'site'
                    ? 'border-blue-500 text-slate-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Website
              </button>
              <button
                onClick={() => (isAudit || scenarioStep === 'generation') && setAuditTab('audit')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  !(isAudit || scenarioStep === 'generation')
                    ? 'border-transparent text-slate-300 cursor-default'
                    : auditTab === 'audit'
                      ? 'border-blue-500 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                {(isAudit || scenarioStep === 'generation')
                  ? <><AlertCircle className="w-3.5 h-3.5 text-red-400" />Audit</>
                  : <><Loader2 className="w-3.5 h-3.5 animate-spin" />Audit</>
                }
              </button>
            </div>
            {/* Content */}
            {auditTab === 'audit' && (isAudit || scenarioStep === 'generation') ? (
              <AuditCanvasV2 lang={auditLang} region={auditRegion} />
            ) : (
              <div className="flex-1 min-h-0 overflow-auto bg-white">
                <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-700 font-medium">
                  {t('workspace.exampleBanner')}
                </div>
                <DemoSiteBefore siteScale={siteScale} />
              </div>
            )}
          </div>
        )}

        {/* ORCHESTRATOR: connection flow screens OR desaturated old site */}
        {scenarioStep === 'orchestrator' && connectionStep === 'type_select' && (
          <ConnectionTypeScreen onSelectSIS={handleTypeSelectSIS} onSkip={handleSkipConnection} />
        )}
        {scenarioStep === 'orchestrator' && connectionStep === 'sis_select' && (
          <SISSelectScreen onContinue={handleSISContinue} />
        )}
        {scenarioStep === 'orchestrator' && connectionStep === 'powerschool_auth' && (
          <ConnectPowerSchoolScreen onAuthorize={handleAuthorize} />
        )}
        {scenarioStep === 'orchestrator' && connectionStep === null && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-700">
            <div className="shrink-0 flex bg-slate-50 border-b border-slate-200">
              <button
                onClick={() => setAuditTab('site')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  auditTab === 'site'
                    ? 'border-blue-500 text-slate-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Website
              </button>
              <button
                onClick={() => setAuditTab('audit')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  auditTab === 'audit'
                    ? 'border-blue-500 text-slate-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                Audit
              </button>
            </div>
            {auditTab === 'audit' ? (
              <AuditCanvasV2 lang={auditLang} region={auditRegion} />
            ) : (
              <div className="flex-1 min-h-0 overflow-auto bg-white">
                <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-700 font-medium">
                  {t('workspace.exampleBanner')}
                </div>
                <DemoSiteBefore siteScale={siteScale} />
              </div>
            )}
          </div>
        )}

        {/* POST-AUDIT: "after" site revealed */}
        {isPostAudit && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            {/* Tab bar */}
            <div className="shrink-0 flex bg-slate-50 border-b border-slate-200">
              <button
                onClick={() => setCenterTab('site')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  centerTab === 'site'
                    ? 'border-blue-500 text-slate-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Website
              </button>
              <button
                onClick={() => siteApproved && setCenterTab('audit')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  !siteApproved
                    ? 'border-transparent text-slate-300 cursor-default'
                    : centerTab === 'audit'
                      ? 'border-blue-500 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                {siteApproved
                  ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Audit</>
                  : <><Loader2 className="w-3.5 h-3.5 animate-spin" />Audit</>
                }
              </button>
            </div>
            {/* Content */}
            {centerTab === 'audit' && siteApproved ? (
              <PostAuditCanvasV2 lang={auditLang} region={auditRegion} />
            ) : (
              <div className="flex-1 min-h-0 overflow-auto bg-white">
                <DemoSiteAfter siteScale={siteScale} />
              </div>
            )}
          </div>
        )}

        {/* HIRING: "after" site — AI Managed */}
        {scenarioStep === 'hiring' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            <div className="shrink-0 bg-white px-3 py-2 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5 shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/></div>
              <div className="bg-blue-50 px-3 py-1 rounded text-xs text-blue-700 font-bold font-mono flex-1 text-center border border-blue-200">{TARGET_URL} ({t('workspace.hiringBar.aiManaged')})</div>
              <div className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                <CheckCircle className="w-3 h-3" /> Live
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-white">
              <DemoSiteAfter siteScale={siteScale} />
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: CONTROL PANEL ─────────────────────────────────────────── */}
      <div className="w-72 min-w-[260px] bg-slate-50 overflow-y-auto relative hidden lg:block shadow-inner">
        <div className="p-5 space-y-6">

          {/* MIGRATION PROGRESS PATH */}
          {!isIdle && !isMonitoring && !isAutoUpdates && !isCommHub && <ScenarioProgressBar step={scenarioStep} siteApproved={siteApproved} />}

          {/* MONITORING PROGRESS PATH */}
          {isMonitoring && <MonitoringProgressBar step={scenarioStep} />}

          {/* AUTO-UPDATES PROGRESS PATH */}
          {isAutoUpdates && <AutoUpdatesProgressBar step={scenarioStep} />}

          {/* COMMUNICATION-HUB PROGRESS PATH */}
          {isCommHub && <CommProgressBar step={scenarioStep} />}

          {/* COMMUNICATION-HUB: connected channels card */}
          {isCommHub && (isCommConnectSdui || isCommConnectEmail || isCommHubActive) && (
            <CommHubStatusCard connected={commConnectedPlatforms} currentStep={scenarioStep} />
          )}

          {/* AUTO-UPDATES: connected sources card */}
          {isAutoUpdates && (isAutoConnectingStep || isAutoActive) && (
            <div className="p-4 bg-white border border-blue-200 shadow-sm rounded-2xl animate-in slide-in-from-right-10 fade-in duration-500">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{t('workspace.sourcesPanel.heading')}</p>
                {isAutoActive && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {AUTO_UPDATE_SOURCES.map((s) => {
                  const isConnected = autoConnectedSources.includes(s.id);
                  const isSkipped   = autoSkippedSources.includes(s.id);
                  const isCurrent   = currentAutoSourceId === s.id;
                  return (
                    <div key={s.id} className={cn(
                      "flex items-center justify-between p-2 rounded-xl border transition-all duration-500",
                      isConnected ? "bg-blue-50 border-blue-100"             :
                      isSkipped   ? "bg-slate-50 border-dashed border-slate-300 opacity-70" :
                      isCurrent   ? "bg-blue-50 border-blue-200"             :
                                    "bg-slate-50 border-slate-100 opacity-60"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white shadow-sm p-0.5 border border-slate-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=128`}
                            alt={s.label}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-bold leading-tight",
                            isConnected ? "text-blue-800" :
                            isCurrent   ? "text-blue-800" :
                            isSkipped   ? "text-slate-500" :
                                          "text-slate-500"
                          )}>{s.label}</p>
                          <p className="text-[9px] text-slate-400 leading-tight">{s.sub.replace(/\s*\([^)]+\)$/, '')}</p>
                        </div>
                      </div>
                      {isConnected ? <CheckCircle className="w-4 h-4 text-blue-500 animate-in zoom-in shrink-0" />          :
                       isSkipped   ? <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">Skipped</span> :
                       isCurrent   ? <Loader2     className="w-4 h-4 text-blue-500 animate-spin shrink-0" />                 :
                                     <LinkIcon    className="w-3 h-3 text-slate-300 shrink-0" />}
                    </div>
                  );
                })}
              </div>
              {isAutoActive && (
                <p className="text-[10px] text-slate-400 leading-relaxed pt-3 mt-3 border-t border-slate-100">
                  Syncs continuously · changes auto-published to your site
                </p>
              )}
            </div>
          )}

          {/* IDLE / URL INPUT / AUDIT / MONITORING: empty state */}
          {(isMonInput || isMonScanning) && (
            <div className="flex flex-col items-center justify-center gap-3 pt-16 text-center px-2 animate-in fade-in">
              <Server className="w-8 h-8 text-slate-200" />
              <p className="text-xs text-slate-500 leading-relaxed">{t('workspace.sourcesPanel.empty')}</p>
            </div>
          )}

          {/* MONITORING: active feeds info card */}
          {isMonActive && (
            <div className="p-4 bg-white border border-blue-200 rounded-2xl space-y-3 animate-in slide-in-from-right-10 fade-in duration-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{t('workspace.sourcesPanel.heading')}</p>
              </div>
              <div className="space-y-2">
                {monSelectedTopics.map(id => {
                  const tile = TOPIC_TILES.find(t => t.id === id);
                  if (!tile) return null;
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <div className="text-blue-500 [&>svg]:w-3.5 [&>svg]:h-3.5">{tile.icon}</div>
                      <span className="text-xs text-slate-600 font-medium">{t(tile.labelKey)}</span>
                      <CheckCircle className="w-3 h-3 text-blue-400 ml-auto shrink-0" />
                    </div>
                  );
                })}
                {monExtraSite && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-xs text-slate-600 font-medium">{monExtraSite}</span>
                    <CheckCircle className="w-3 h-3 text-blue-400 ml-auto shrink-0" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100">{t('workspace.sourcesPanel.scansDaily')}</p>
            </div>
          )}

          {/* Integrations (improvement only) */}
          {!isIdle && !isUrlInput && !isAudit && !isMonitoring && !isAutoUpdates && !isCommHub && (scenarioStep !== 'orchestrator' || orchestratorTick >= 0) && (
            <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl animate-in slide-in-from-right-10 fade-in duration-500">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{t('nav.integrations')}</p>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full cursor-help">{t('workspace.integrationsPanel.viewAll')}</span>
              </div>

              {/* SIS section */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SIS</p>
              <div className="space-y-2 mb-4">
                {[
                  { name: "DaNiS", domain: "nibis.de" },
                ].map((sis, idx) => {
                  const isConnecting = orchestratorTick === idx;
                  const isConnected  = orchestratorTick > idx || scenarioStep !== 'orchestrator';
                  return (
                    <div key={sis.name} className={cn("flex items-center justify-between p-2 rounded-xl transition-all duration-500",
                      isConnected  ? "bg-emerald-50 border border-emerald-100/50" :
                      isConnecting ? "bg-blue-50 border border-blue-200"          : "bg-slate-50 border border-slate-100 opacity-50"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-white shadow-sm p-0.5 border border-slate-200 flex items-center justify-center overflow-hidden">
                          <img src={`https://www.google.com/s2/favicons?domain=${sis.domain}&sz=128`} alt={sis.name} className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        </div>
                        <span className={cn("text-xs font-bold transition-colors",
                          isConnected ? "text-emerald-800" : isConnecting ? "text-blue-800" : "text-slate-500")}>
                          {sis.name}
                        </span>
                      </div>
                      {isConnected  ? <CheckCircle className="w-4 h-4 text-emerald-500 animate-in zoom-in" /> :
                       isConnecting ? <Loader2     className="w-4 h-4 text-blue-500 animate-spin" />        :
                                      <LinkIcon    className="w-3 h-3 text-slate-300" />}
                    </div>
                  );
                })}
              </div>

              {/* LMS + Shared Folder — waiting tiles */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                {[
                  { labelKey: 'workspace.integrationsPanel.lms.label',    subKey: 'workspace.integrationsPanel.lms.sub',    icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { labelKey: 'workspace.integrationsPanel.folder.label', subKey: 'workspace.integrationsPanel.folder.sub', icon: <FolderOpen className="w-3.5 h-3.5" /> },
                ].map(tile => (
                  <div key={tile.labelKey} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-dashed border-slate-300 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                        {tile.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500">{t(tile.labelKey)}</p>
                        <p className="text-[9px] text-slate-400 leading-tight">{t(tile.subKey)}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors">
                      <Plus className="w-3 h-3" /> {t('workspace.integrationsPanel.add')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
