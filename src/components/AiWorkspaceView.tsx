import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, MoveRight, Layers, LayoutTemplate, Accessibility,
  Database, Bot, CheckCircle, PenTool, Code2, ShieldAlert,
  Server, Link as LinkIcon, Users, Loader2, AlertCircle,
  RefreshCw, FileText, Zap, ShieldCheck, ExternalLink,
  FolderOpen, BookOpen, ChevronDown, Plus,
  Search, Star, Globe, Bell, TrendingUp, MessageSquare, Activity, MapPin, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SchoolBefore } from '../pages/SchoolBefore';
import { SchoolAfterMagic } from '../pages/SchoolAfterMagic';
import { AuditChatCardV2, PostAuditChatCardV2, AuditCanvasV2, PostAuditCanvasV2 } from './AuditPreviews';

type ScenarioStep = 'idle' | 'url_input' | 'audit' | 'orchestrator' | 'generation' | 'post_audit' | 'hiring'
  | 'mon_input' | 'mon_scanning' | 'mon_findings' | 'mon_configure' | 'mon_active';

interface AiWorkspaceViewProps {
  onFinishScenario?: () => void;
  onAgentsHired?: () => void;
  onMonitoringComplete?: () => void;  // called when monitoring scenario finishes
}

const QUICK_ACTIONS = [
  { icon: <Layers         className="w-4 h-4" />, label: 'Improve and migrate your website to Presence', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', scenario: true  },
  { icon: <RefreshCw      className="w-4 h-4" />, label: 'Setup Internet Monitoring',   color: 'bg-violet-50 text-violet-600 border-violet-100', scenario: false, monitoringScenario: true },
  { icon: <LayoutTemplate className="w-4 h-4" />, label: 'Create a website',            color: 'bg-blue-50 text-blue-600 border-blue-100',    scenario: false },
  { icon: <ShieldAlert    className="w-4 h-4" />, label: 'Make a website audit',         color: 'bg-emerald-50 text-emerald-600 border-emerald-100', scenario: false },
  { icon: <Accessibility  className="w-4 h-4" />, label: 'Improve accessibility',        color: 'bg-rose-50 text-rose-600 border-rose-100',    scenario: false },
  { icon: <Users          className="w-4 h-4" />, label: 'Create a Family Hub',          color: 'bg-amber-50 text-amber-600 border-amber-100',  scenario: false },
  { icon: <Database       className="w-4 h-4" />, label: 'Create event pages',           color: 'bg-cyan-50 text-cyan-600 border-cyan-100',     scenario: false },
];

const SIS_PROVIDERS = [
  { name: 'PowerSchool',        domain: 'powerschool.com'          },
  { name: 'FACTS SIS',          domain: 'factsmgt.com'             },
  { name: 'Infinite Campus',    domain: 'infinitecampus.com'       },
  { name: 'Skyward',            domain: 'skyward.com'              },
  { name: 'Frontline SIS',      domain: 'frontlineeducation.com'   },
  { name: 'Aeries SIS',         domain: 'aeries.com'               },
  { name: 'Tyler SIS',          domain: 'tylertech.com'            },
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
  const metrics = [
    { label: 'Usability',    hint: 'Navigation & mobile experience', value: 32, color: 'text-red-500',   barColor: 'bg-red-500'   },
    { label: 'Readability',  hint: 'How clearly content is presented', value: 45, color: 'text-amber-500', barColor: 'bg-amber-500' },
    { label: 'Discoverability',  hint: 'Visibility in search results',    value: 20, color: 'text-red-500',   barColor: 'bg-red-500'   },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Site Audit</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">How visitors experience your site today</p>
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
          <div key={m.label} className="flex-1 space-y-2">
            <div className={cn("text-2xl font-extrabold", m.color)}>{m.value}%</div>
            <div className="text-xs text-slate-700 font-bold">{m.label}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{m.hint}</div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", m.barColor)} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {['Missing images & favicon', 'Invisible in Google SEO & Maps search', 'Outdated content & info'].map(tag => (
          <span key={tag} className="bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-4 py-2 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
  );
}

// ─── New site audit full canvas ─────────────────────────────────────────────
function PostAuditCanvas() {
  const metrics = [
    { label: 'Usability',   value: 98, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { label: 'Readability', value: 96, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { label: 'Discoverability', value: 94, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">New Site Audit</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">Web Performance Score</p>
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
          <div key={m.label} className="flex-1 space-y-2">
            <div className={cn("text-2xl font-extrabold", m.color)}>{m.value}%</div>
            <div className="text-xs text-slate-500 font-medium">{m.label}</div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-700", m.barColor)} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {['Fully Optimized', 'WCAG Compliant', 'SEO Ready'].map(tag => (
          <span key={tag} className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold px-4 py-2 rounded-full">{tag}</span>
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
  const types = [
    {
      id: 'sis',
      label: 'SIS',
      sub: 'Student Information System',
      icon: <Database className="w-7 h-7" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      active: true,
    },
    {
      id: 'lms',
      label: 'LMS',
      sub: 'Learning Management System',
      icon: <BookOpen className="w-7 h-7" />,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      active: false,
    },
    {
      id: 'folder',
      label: 'Shared Folder',
      sub: 'Google Drive, OneDrive & more',
      icon: <FolderOpen className="w-7 h-7" />,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      active: false,
    },
  ];
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 w-full max-w-lg space-y-7">

        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Connect a Data Source</h2>
          <p className="text-slate-500 text-sm mt-1">Choose the type of integration to get started</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-slate-400">
            40+ integrations available · More can be added at any time
          </p>
          <button
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIS provider selector (center canvas) ──────────────────────────────────
function SISSelectScreen({ onContinue }: { onContinue: (sis: string) => void }) {
  const [selected, setSelected] = useState('PowerSchool');
  return (
    <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-500 overflow-auto">
      <div className="p-6 space-y-5 max-w-2xl w-full mx-auto">

        <div>
          <h2 className="text-lg font-bold text-slate-900">Select your SIS</h2>
          <p className="text-slate-500 text-sm mt-0.5">Choose your Student Information System provider</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {SIS_PROVIDERS.map((p) => {
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
          })}
        </div>

        <button
          onClick={() => onContinue(selected)}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
        >
          Continue with {selected}
        </button>
      </div>
    </div>
  );
}

// ─── PowerSchool OAuth connect screen (center canvas) ──────────────────────
function ConnectPowerSchoolScreen({ onAuthorize }: { onAuthorize: () => void }) {
  const permissions = [
    'Student enrollment information',
    'Class schedules and rosters',
    'Academic calendar events',
    'Student demographics (name, grade)',
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
            <h2 className="text-2xl font-bold text-slate-900">Connect PowerSchool</h2>
            <p className="text-slate-500 text-sm mt-0.5">Secure OAuth 2.0 Authorization</p>
          </div>
        </div>

        {/* Security badges */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Secure Connection</p>
              <p className="text-xs text-slate-500">Your credentials are never stored on our servers</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <CheckCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Read-Only Access</p>
              <p className="text-xs text-slate-500">We only request permission to view student data</p>
            </div>
          </div>
        </div>

        {/* Permissions list */}
        <div>
          <p className="text-sm font-bold text-slate-800 mb-3">This integration will access:</p>
          <div className="space-y-2">
            {permissions.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                {item}
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
            Authorize with PowerSchool
          </button>
          <p className="text-center text-xs text-slate-400">
            You'll be redirected to PowerSchool's secure login page
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Migration progress path ────────────────────────────────────────────────
const PROGRESS_STEPS: { label: string; detail: string }[] = [
  { label: 'Audit',    detail: 'Analyze current website' },
  { label: 'Connect',  detail: 'Connect data sources' },
  { label: 'Build',    detail: 'Migrate & generate new site' },
  { label: 'Review',   detail: 'Review migrated website' },
  { label: 'Re-audit', detail: 'Analyzing new website' },
  { label: 'Publish',  detail: 'Go live & set up automation' },
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
      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Workflow</p>
      <div>
        {PROGRESS_STEPS.map(({ label, detail }, i) => {
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
                  {label}
                </p>
                <p className={cn(
                  'text-[11px] mt-0.5 transition-colors duration-300',
                  isActive ? 'text-blue-600 font-medium' : 'text-slate-400'
                )}>
                  {detail}
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
  { id: 'sports',    label: 'Sport Events',           sub: 'IHSA results, league standings',       icon: <Activity    className="w-5 h-5" /> },
  { id: 'science',   label: 'Science Events',          sub: 'STEM competitions, research fairs',    icon: <Search      className="w-5 h-5" /> },
  { id: 'openhouse', label: 'Open Day Events',       sub: 'Admissions, tours, open days',         icon: <Users       className="w-5 h-5" /> },
  { id: 'district',  label: 'District Announcements',  sub: 'Oakwood Public Schools feed',          icon: <FileText    className="w-5 h-5" /> },
  { id: 'legal',     label: 'Legal News',              sub: 'Education law, regulatory changes',    icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'health',    label: 'Health Standards',        sub: 'Accessibility, WCAG, web compliance',  icon: <Globe       className="w-5 h-5" /> },
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
  // Both phases use the same 6 tiles — after activation they show "Connected"
  return (
    <div className="flex-1 overflow-auto bg-white animate-in fade-in duration-700 p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Choose Topics to Monitor</h2>
        <p className="text-slate-400 text-sm mt-1">
          {showSelected
            ? `${selectedTopics.length} topics connected`
            : 'Select the topics you\'d like AI to watch — tap to toggle'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {TOPIC_TILES.map(t => {
          const selected = selectedTopics.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => !showSelected && onToggle(t.id)}
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
                  {t.icon}
                </div>
                {showSelected && selected ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Connected</span>
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
                <p className={cn("text-sm font-bold", selected ? "text-slate-900" : "text-slate-400")}>{t.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
      {!showSelected && (
        <p className="text-xs text-slate-400 text-center">{selectedTopics.length} of {TOPIC_TILES.length} topics selected</p>
      )}
    </div>
  );
}

// ─── Monitoring: setup animation canvas ─────────────────────────────────────
function MonitoringSetupCanvas({ topics, extraSite }: { topics: string[]; extraSite?: string | null }) {
  const [ticked, setTicked] = useState(0);
  const baseTiles = topics.map(id => TOPIC_TILES.find(t => t.id === id)).filter(Boolean) as typeof TOPIC_TILES;
  const items = [
    ...baseTiles,
    ...(extraSite ? [{ id: 'extra', label: extraSite, sub: 'External website', icon: <Globe className="w-5 h-5" /> }] : []),
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
          {allDone ? 'Monitoring is Live' : 'Setting Up Monitoring'}
        </h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">
          {allDone ? 'All feeds are connected and active' : 'Connecting topic feeds for Oakwood High School'}
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
                  {isDone ? 'Feed connected' : isActive ? 'Connecting...' : 'Waiting'}
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
          <span className="text-sm font-bold text-blue-700">All {items.length} feeds active</span>
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
const MONITORING_STEPS: { label: string; detail: string }[] = [
  { label: 'Topics',  detail: 'Select topics to monitor'  },
  { label: 'Setup',   detail: 'Connect source feeds'      },
  { label: 'Active',  detail: 'Monitoring is live'        },
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
  const active = getMonitoringProgressIndex(step);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-in fade-in duration-300">
      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Workflow</p>
      <div>
        {MONITORING_STEPS.map(({ label, detail }, i) => {
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
                  {label}
                </p>
                <p className={cn(
                  'text-[11px] mt-0.5 transition-colors duration-300',
                  isActive ? 'text-blue-600 font-medium' : 'text-slate-400'
                )}>
                  {detail}
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
export function AiWorkspaceView({ onFinishScenario, onAgentsHired, onMonitoringComplete }: AiWorkspaceViewProps) {
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
  const [centerTab, setCenterTab] = useState<'site' | 'audit'>('site');
  const [auditTab, setAuditTab] = useState<'site' | 'audit'>('site');

  // Monitoring scenario state
  const [monTopicsSubmitted, setMonTopicsSubmitted]   = useState(false);
  const [monSelectedTopics, setMonSelectedTopics]     = useState<string[]>(['sports', 'science', 'openhouse', 'district', 'legal', 'health']);
  const [monWebsiteReady, setMonWebsiteReady]         = useState(false);
  const [monWebsiteSubmitted, setMonWebsiteSubmitted] = useState(false);
  const [monExtraSite, setMonExtraSite]               = useState<string | null>(null);

  const TARGET_URL = 'https://oakwoodhigh.org';

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
        agentMessage("I need to connect your school's data so the site stays accurate automatically — no manual updates.");
      } else if (orchestratorTick === -1) {
        agentMessage("To sync your directory, calendar, and announcements automatically, connect your SIS. You can also skip this and connect later.");
        setConnectionStep('type_select');
      } else if (orchestratorTick === 4) {
        agentMessage("Everything's in place — time to build your new site.");
      }
    }
  }, [orchestratorTick, scenarioStep]);

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
    setChatMessages([{ role: 'user', content: 'Improve the existing website' }]);
    setTimeout(() => {
      agentMessage("Sure! To get started, please share the URL of your current school website and I'll analyze its structure, content, and performance.");
      setUrlPromptReady(true);
    }, 800);
  };

  const confirmUrl = () => {
    setUrlSubmitted(true);
    userMessage(typedUrl);
    setTimeout(() => {
      agentMessage(
        <span>Scanning <span className="font-bold text-blue-600">{typedUrl}</span> now — pulling up the current structure, page hierarchy, and assets. This will only take a moment...</span>
      );
      setTimeout(() => {
        setScenarioStep('audit');
        setAuditTab('audit');
        agentMessage("Audit done — check the Audit tab for the full report.");
        // agentMessage(<AuditChatCardV2 />); // hidden for now
        setTimeout(() => {
          agentMessage("Visitors struggle to navigate it on mobile, the content is hard to read, and it's nearly invisible in search results.");
          setTimeout(() => {
            agentMessage(
              <span>We can fix all of this — want me to go ahead?</span>
            );
            setTimeout(() => setAuditReady(true), 400);
          }, 900);
        }, 700);
      }, 2500);
    }, 900);
  };

  const handleTypeSelectSIS = () => {
    userMessage('SIS — Student Information System');
    setConnectionStep('sis_select');
  };

  const handleSISContinue = (sisName: string) => {
    userMessage(`Connect via ${sisName}`);
    setConnectionStep('powerschool_auth');
  };

  const handleAuthorize = () => {
    setConnectionStep(null);
    agentMessage("PowerSchool connected! You can add more systems — Google Calendar, LMS, shared folders — anytime from the Integrations tab.");
  };

  const handleSkipConnection = () => {
    setConnectionStep(null);
    userMessage("Skip for now.");
    agentMessage("No problem — you can connect your data sources any time from Integrations.");
  };

  const advanceToOrchestrator = () => {
    userMessage("Let's fix it — migrate the site.");
    setTimeout(() => {
      setScenarioStep('orchestrator');
      setOrchestratorTick(-4);
    }, 1000);
  };

  const advanceToGeneration = () => {
    userMessage("Let's go — migrate the site.");
    setTimeout(() => {
      setScenarioStep('generation');
      agentMessage("On it — building your new website now.");
      // Auto-advance to post_audit after the site "loads"
      setTimeout(() => {
        setScenarioStep('post_audit');
        setTimeout(() => {
          agentMessage(
            <span>
              Take a look — all your content has been migrated.{' '}
              <a href={window.location.hostname === 'localhost' ? `${import.meta.env.BASE_URL}school-after-magic` : 'https://vnikolaev777.github.io/presence-prototype-v3/preview.html'} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium">
                Open in new tab ↗
              </a>
              . Does everything look right?
            </span>
          );
          setTimeout(() => setPostAuditReady(true), 400);
        }, 700);
      }, 2800);
    }, 1000);
  };

  const approveSite = () => {
    userMessage("Looks good — let's go!");
    setPostAuditReady(false);
    // agentMessage(<PostAuditChatCardV2 />); // hidden for now
    setTimeout(() => {
      agentMessage(
        <span>🎉 <strong>Your new site is live</strong> at a temporary Presence URL. Ready to connect your own domain and make it official?</span>
      );
      setTimeout(() => setSiteApproved(true), 500);
    }, 800);
  };

  const advanceToHiring = () => {
    userMessage("Amazing — let's set it all up.");
    setTimeout(() => {
      setScenarioStep('hiring');
      agentMessage("Your website is live. I've also set up three automatic processes running in the background:");
      onAgentsHired?.();
      setTimeout(() => {
        agentMessage(
          <div className="space-y-2 text-slate-600">
            <p className="font-semibold text-slate-800 text-sm">On your Automations you can find:</p>
            <div className="flex items-start gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <span>Automatic updates from PowerSchool — directory, schedules, and documents, ready to publish.</span>
            </div>
            <div className="flex items-start gap-2">
              <PenTool className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>News drafts and newsletters generated from external events and district feeds, waiting for your approval.</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span>Accessibility reports flagging any issues against the latest standards.</span>
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
    setChatMessages([{ role: 'user', content: 'Setup internet monitoring' }]);
    setTimeout(() => {
      agentMessage("I've pre-selected 6 relevant topic categories for Oakwood High. Tap to adjust, then activate when you're ready.");
    }, 800);
  };

  const toggleMonTopic = (id: string) => {
    setMonSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const activateSources = () => {
    const topicNames = monSelectedTopics.map(id => TOPIC_LABELS[id]).join(', ');
    userMessage(`Activate: ${topicNames}`);
    setMonTopicsSubmitted(true);
    setTimeout(() => {
      agentMessage("Topics confirmed! Would you also like me to monitor any specific websites?");
      setTimeout(() => setMonWebsiteReady(true), 400);
    }, 800);
  };

  const startSetup = (extraSite: string | null) => {
    const totalSources = monSelectedTopics.length + (extraSite ? 1 : 0);
    setScenarioStep('mon_scanning');
    setTimeout(() => {
      agentMessage(`Setting up ${totalSources} monitoring source${totalSources !== 1 ? 's' : ''} for Oakwood High — connecting feeds now...`);
      const setupDuration = totalSources * 520 + 1200;
      setTimeout(() => {
        setScenarioStep('mon_active');
        agentMessage(
          <span>
            <strong>All feeds are live.</strong> I'll scan your {totalSources} source{totalSources !== 1 ? 's' : ''} daily and surface anything relevant — head to the Automations to see what I find.
          </span>
        );
      }, setupDuration);
    }, 800);
  };

  const submitWebsite = () => {
    const site = 'State Ministry of Education website';
    userMessage(`Yes — add the ${site}.`);
    setMonWebsiteSubmitted(true);
    setMonExtraSite(site);
    startSetup(site);
  };

  const skipWebsite = () => {
    userMessage("No, that's all.");
    setMonWebsiteSubmitted(true);
    startSetup(null);
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

  return (
    <div className="flex h-full w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">

      {/* ── LEFT: CHAT PANEL ─────────────────────────────────────────────── */}
      <div className="w-1/3 min-w-[300px] max-w-sm border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Presence Assistant</h2>
            <p className="text-xs text-slate-500">
              {isIdle          ? 'Ready to help'             :
               isAudit         ? 'Audit complete'            :
               isPostAudit     ? 'Site live — 10/10'         :
               isMonInput      ? 'Configuring sources'       :
               isMonScanning   ? 'Setting up feeds...'       :
               isMonActive     ? 'Monitoring is live'        :
                                 'Migrating website'}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">

          {/* IDLE STATE */}
          {isIdle && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex flex-col mr-auto items-start max-w-[95%]">
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm text-sm shadow-sm bg-white border border-slate-200 text-slate-700">
                  <p className="font-medium mb-1">Hi! I'm your Presence Assistant —</p>
                  <p className="text-slate-500 text-xs leading-relaxed">here to build and maintain your website, handle integrations, and run AI agents that keep your online presence in sync with the outside world. What should we start with?</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Presence Assistant</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Quick Actions</p>
                {QUICK_ACTIONS.map((action, i) => (
                  <button key={i} onClick={action.scenario ? startScenario : (action as any).monitoringScenario ? startMonitoringScenario : undefined}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all group text-sm font-semibold bg-white hover:shadow-md hover:border-slate-300 cursor-pointer border-slate-200 text-slate-700">
                    <span className={cn("p-1.5 rounded-lg border shrink-0", action.color)}>{action.icon}</span>
                    <span className="flex-1">{action.label}</span>
                    <MoveRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SCENARIO: chat messages */}
          {!isIdle && chatMessages.map((msg, i) => (
            <div key={i} className={cn("flex flex-col max-w-[90%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={cn("px-3 py-2 rounded-2xl text-sm shadow-sm",
                msg.role === 'user'
                  ? "bg-slate-800 text-white rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">{msg.role === 'user' ? 'You' : 'Presence Assistant'}</span>
            </div>
          ))}

          {/* URL INPUT (migration): confirm button */}
          {isUrlInput && !urlSubmitted && urlPromptReady && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={confirmUrl}
                className="border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                Submit link &rarr;
              </button>
            </div>
          )}

          {/* MONITORING: activate topics button */}
          {isMonInput && !monTopicsSubmitted && monSelectedTopics.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={activateSources}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                Activate {monSelectedTopics.length} topic{monSelectedTopics.length !== 1 ? 's' : ''} &rarr;
              </button>
            </div>
          )}

          {/* MONITORING: website quick-reply button */}
          {isMonInput && monWebsiteReady && !monWebsiteSubmitted && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
              <button onClick={submitWebsite}
                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                Add website
              </button>
            </div>
          )}

          {/* SCENARIO ACTION BUTTONS */}
          {!isIdle && !isUrlInput && !isMonInput && !isMonScanning && (
            <div className="pt-4 flex justify-start">
              {isAudit && auditReady && (
                <button onClick={advanceToOrchestrator}
                  className="animate-in fade-in slide-in-from-bottom border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  Proceed with migration &rarr;
                </button>
              )}
              {scenarioStep === 'orchestrator' && orchestratorTick >= 4 && (
                <button onClick={advanceToGeneration}
                  className="animate-in fade-in slide-in-from-bottom border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  Migrate &amp; Improve &rarr;
                </button>
              )}
              {isPostAudit && postAuditReady && !siteApproved && (
                <button onClick={approveSite}
                  className="animate-in fade-in slide-in-from-bottom border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  Looks good — continue &rarr;
                </button>
              )}
              {isPostAudit && siteApproved && (
                <button onClick={advanceToHiring}
                  className="animate-in fade-in slide-in-from-bottom border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors">
                  Connect domain &amp; publish &rarr;
                </button>
              )}
              {scenarioStep === 'hiring' && (
                <button onClick={finishAndGoToDashboard}
                  className="animate-in fade-in slide-in-from-bottom bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                  Go to Automations <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {/* Monitoring: go to Automations — also sets hasMonitoringSetup */}
              {isMonActive && (
                <button onClick={finishMonitoringAndGoToDashboard}
                  className="animate-in fade-in slide-in-from-bottom bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
                  Go to Automations <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CENTER: CANVAS ────────────────────────────────────────────────── */}
      <div ref={centerColRef} className="flex-1 min-w-0 relative hidden md:flex flex-col border-r border-slate-200 overflow-hidden bg-white">

        {/* IDLE + URL not yet submitted: placeholder */}
        {(isIdle || (isUrlInput && !urlSubmitted)) && (
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
              <AuditCanvasV2 />
            ) : (
              <div className="flex-1 min-h-0 overflow-auto bg-white">
                <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-700 font-medium">
                  Example — for illustration purposes only
                </div>
                <div style={{ zoom: siteScale, width: '1100px' }} className="pointer-events-none"><SchoolBefore /></div>
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
              <AuditCanvasV2 />
            ) : (
              <div className="flex-1 min-h-0 overflow-auto bg-white">
                <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-700 font-medium">
                  Example — for illustration purposes only
                </div>
                <div style={{ zoom: siteScale, width: '1100px' }} className="pointer-events-none"><SchoolBefore /></div>
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
                  ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />10/10 Audit</>
                  : <><Loader2 className="w-3.5 h-3.5 animate-spin" />Audit</>
                }
              </button>
            </div>
            {/* Content */}
            {centerTab === 'audit' && siteApproved ? (
              <PostAuditCanvasV2 />
            ) : (
              <div className="flex-1 min-h-0 overflow-auto bg-white">
                <div style={{ zoom: siteScale, width: '1100px' }} className="pointer-events-none"><SchoolAfterMagic showAfter={true} /></div>
              </div>
            )}
          </div>
        )}

        {/* HIRING: "after" site — AI Managed */}
        {scenarioStep === 'hiring' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            <div className="shrink-0 bg-white px-3 py-2 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5 shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/></div>
              <div className="bg-blue-50 px-3 py-1 rounded text-xs text-blue-700 font-bold font-mono flex-1 text-center border border-blue-200">https://oakwoodhigh.org (AI Managed)</div>
              <div className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                <CheckCircle className="w-3 h-3" /> Live
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-white">
              <div style={{ zoom: siteScale, width: '1100px' }} className="pointer-events-none"><SchoolAfterMagic showAfter={true} /></div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: CONTROL PANEL ─────────────────────────────────────────── */}
      <div className="w-72 min-w-[260px] bg-slate-50 overflow-y-auto relative hidden lg:block shadow-inner">
        <div className="p-5 space-y-6">

          {/* MIGRATION PROGRESS PATH */}
          {!isIdle && !isMonitoring && <ScenarioProgressBar step={scenarioStep} siteApproved={siteApproved} />}

          {/* MONITORING PROGRESS PATH */}
          {isMonitoring && <MonitoringProgressBar step={scenarioStep} />}

          {/* IDLE / URL INPUT / AUDIT / MONITORING: empty state */}
          {(isMonInput || isMonScanning) && (
            <div className="flex flex-col items-center justify-center gap-3 pt-16 text-center px-2 animate-in fade-in">
              <Server className="w-8 h-8 text-slate-200" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Active feeds will appear here once setup is complete.
              </p>
            </div>
          )}

          {/* MONITORING: active feeds info card */}
          {isMonActive && (
            <div className="p-4 bg-white border border-blue-200 rounded-2xl space-y-3 animate-in slide-in-from-right-10 fade-in duration-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Sources</p>
              </div>
              <div className="space-y-2">
                {monSelectedTopics.map(id => {
                  const tile = TOPIC_TILES.find(t => t.id === id);
                  if (!tile) return null;
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <div className="text-blue-500 [&>svg]:w-3.5 [&>svg]:h-3.5">{tile.icon}</div>
                      <span className="text-xs text-slate-600 font-medium">{tile.label}</span>
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
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100">Scans daily · drafts queued for review</p>
            </div>
          )}

          {/* Integrations (migration only) */}
          {!isIdle && !isUrlInput && !isAudit && !isMonitoring && (scenarioStep !== 'orchestrator' || orchestratorTick >= 0) && (
            <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl animate-in slide-in-from-right-10 fade-in duration-500">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Integrations</p>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full cursor-help">View All</span>
              </div>

              {/* SIS section */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SIS</p>
              <div className="space-y-2 mb-4">
                {[
                  { name: "PowerSchool", domain: "powerschool.com" },
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
                  { label: 'LMS', sub: 'Canvas, Schoology, Google Classroom…', icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { label: 'Shared Folder', sub: 'Google Drive, OneDrive, Dropbox…', icon: <FolderOpen className="w-3.5 h-3.5" /> },
                ].map(tile => (
                  <div key={tile.label} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-dashed border-slate-300 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                        {tile.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500">{tile.label}</p>
                        <p className="text-[9px] text-slate-400 leading-tight">{tile.sub}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors">
                      <Plus className="w-3 h-3" /> Add
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
