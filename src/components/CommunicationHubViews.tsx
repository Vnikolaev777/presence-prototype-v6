import { useEffect, useState } from 'react';
import {
  CheckCircle, ShieldCheck, ExternalLink, Loader2, AlertTriangle,
  MessageSquare, Mail, Server, Calendar, Send,
  Globe, Users, Lock, FileText, Edit3, ClipboardCheck, Bell,
  ChevronRight, Wifi, BatteryFull, Signal,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useT } from '../lib/i18n';

// ─── Types ─────────────────────────────────────────────────────────────────
export type CommPlatformId = 'sdui' | 'iserv' | 'webuntis' | 'email';

export type CommScenarioStep =
  | 'comm_select'
  | 'comm_connect_sdui'
  | 'comm_connect_email'
  | 'comm_hub_active'
  | 'comm_emerg_idle'
  | 'comm_emerg_compose'
  | 'comm_emerg_enhanced'
  | 'comm_emerg_broadcasting'
  | 'comm_emerg_done'
  | 'comm_consent_compose'
  | 'comm_consent_form'
  | 'comm_consent_routing'
  | 'comm_consent_parent'
  | 'comm_consent_dashboard';

export interface CommPlatform {
  id: CommPlatformId;
  /** Brand name — not translated. */
  label: string;
  /** Translation key for the subtitle. */
  subKey: string;
  domain: string;
  /** Translation key for the region/compliance label. */
  regionKey: string;
  /** Translation key for the connect CTA. */
  ctaKey: string;
  /** Translation keys for permission lines. */
  permissionKeys: string[];
  iconKey: 'message' | 'server' | 'calendar' | 'mail';
  recommended?: boolean;
  popular?: boolean;
}

// ─── Connector data ─────────────────────────────────────────────────────────
export const COMM_PLATFORMS: CommPlatform[] = [
  {
    id: 'sdui',
    label: 'Sdui',
    subKey: 'comm.platform.sdui.sub',
    domain: 'sdui.de',
    regionKey: 'comm.platform.sdui.region',
    ctaKey: 'comm.platform.sdui.cta',
    iconKey: 'message',
    popular: true,
    permissionKeys: [
      'comm.platform.sdui.permission.0',
      'comm.platform.sdui.permission.1',
      'comm.platform.sdui.permission.2',
      'comm.platform.sdui.permission.3',
    ],
  },
  {
    id: 'iserv',
    label: 'IServ',
    subKey: 'comm.platform.iserv.sub',
    domain: 'iserv.eu',
    regionKey: 'comm.platform.iserv.region',
    ctaKey: 'comm.platform.iserv.cta',
    iconKey: 'server',
    permissionKeys: [
      'comm.platform.iserv.permission.0',
      'comm.platform.iserv.permission.1',
      'comm.platform.iserv.permission.2',
    ],
  },
  {
    id: 'webuntis',
    label: 'WebUntis',
    subKey: 'comm.platform.webuntis.sub',
    domain: 'webuntis.com',
    regionKey: 'comm.platform.webuntis.region',
    ctaKey: 'comm.platform.webuntis.cta',
    iconKey: 'calendar',
    permissionKeys: [
      'comm.platform.webuntis.permission.0',
      'comm.platform.webuntis.permission.1',
      'comm.platform.webuntis.permission.2',
    ],
  },
  {
    id: 'email',
    label: 'Standard SMTP',
    subKey: 'comm.platform.email.sub',
    domain: 'email',
    regionKey: 'comm.platform.email.region',
    ctaKey: 'comm.platform.email.cta',
    iconKey: 'mail',
    recommended: true,
    permissionKeys: [
      'comm.platform.email.permission.0',
      'comm.platform.email.permission.1',
      'comm.platform.email.permission.2',
    ],
  },
];

export function commPlatformIcon(key: CommPlatform['iconKey'], cls = 'w-9 h-9') {
  switch (key) {
    case 'message':  return <MessageSquare className={cls} />;
    case 'server':   return <Server className={cls} />;
    case 'calendar': return <Calendar className={cls} />;
    case 'mail':     return <Mail className={cls} />;
  }
}

// ─── Progress bar ──────────────────────────────────────────────────────────
export const COMM_STEPS: { labelKey: string; detailKey: string }[] = [
  { labelKey: 'comm.steps.platforms.label', detailKey: 'comm.steps.platforms.detail' },
  { labelKey: 'comm.steps.connect.label',   detailKey: 'comm.steps.connect.detail' },
  { labelKey: 'comm.steps.live.label',      detailKey: 'comm.steps.live.detail' },
];

export function getCommProgressIndex(step: string): number {
  switch (step) {
    case 'comm_select':        return 0;
    case 'comm_connect_sdui':
    case 'comm_connect_email': return 1;
    case 'comm_hub_active':    return 2;
    default:                   return -1;
  }
}

export function CommProgressBar({ step }: { step: string }) {
  const t = useT();
  const active = getCommProgressIndex(step);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-in fade-in duration-300">
      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">{t('comm.steps.workflow')}</p>
      <div>
        {COMM_STEPS.map(({ labelKey, detailKey }, i) => {
          const isComplete = i < active;
          const isActive   = i === active;
          const isLast     = i === COMM_STEPS.length - 1;
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

// ─── Phone frame helper ─────────────────────────────────────────────────────
function PhoneFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="relative">
      <div className="w-[340px] h-[680px] bg-slate-900 rounded-[44px] p-2.5 shadow-2xl shadow-slate-900/30 border border-slate-800">
        <div className="w-full h-full bg-white rounded-[34px] overflow-hidden flex flex-col relative">
          {/* Status bar */}
          <div className="shrink-0 h-7 px-6 flex items-center justify-between text-[11px] font-bold text-slate-900 bg-white">
            <span>5:32</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-5 bg-slate-900 rounded-full" />
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryFull className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
        </div>
      </div>
      {label && (
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Phase 1.A — platform picker ────────────────────────────────────────────
export function CommPlatformPickerCanvas({
  selected, onToggle, locked,
}: {
  selected: CommPlatformId[];
  onToggle: (id: CommPlatformId) => void;
  locked?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex-1 overflow-auto bg-white animate-in fade-in duration-700 p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('commHub.canvas.picker.heading')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('commHub.canvas.picker.subtitle')}</p>
        </div>
        <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3 h-3" /> DSGVO
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {COMM_PLATFORMS.map(p => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => !locked && onToggle(p.id)}
              disabled={locked}
              className={cn(
                'rounded-2xl border-2 p-5 text-left space-y-3 transition-all duration-200 relative',
                !locked && 'hover:scale-[1.02] active:scale-[0.98]',
                isSelected
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              {p.popular && (
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                  {t('commHub.canvas.picker.popular')}
                </span>
              )}
              {p.recommended && (
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {t('commHub.canvas.picker.recommended')}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center">
                  {p.id === 'email' ? (
                    <Mail className="w-6 h-6 text-slate-700" />
                  ) : (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`}
                      alt={p.label}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.textContent = p.label.charAt(0);
                          e.currentTarget.parentElement.className = 'w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-blue-100 text-blue-700 border border-slate-200';
                        }
                      }}
                    />
                  )}
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                )}>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <div>
                <p className={cn('text-base font-bold', isSelected ? 'text-slate-900' : 'text-slate-700')}>{p.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t(p.subKey)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
                <Lock className="w-2.5 h-2.5" />
                {t(p.regionKey)}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        {t('commHub.canvas.picker.footer', { selected: selected.length, total: COMM_PLATFORMS.length })}
      </p>
    </div>
  );
}

// ─── Phase 1.B — per-platform OAuth modal w/ DSGVO checkbox ─────────────────
export function CommConnectPlatformCanvas({
  platform, onAuthorize, onSkip, stepIndex, totalSteps,
}: {
  platform: CommPlatform;
  onAuthorize: () => void;
  onSkip: () => void;
  stepIndex: number;
  totalSteps: number;
}) {
  const t = useT();
  const [dsgvo, setDsgvo] = useState(false);
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 w-full max-w-sm space-y-6">

        <div className="flex items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {t('commHub.canvas.connect.stepCount', { step: stepIndex, total: totalSteps })}
          </span>
        </div>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
            {commPlatformIcon(platform.iconKey, 'w-8 h-8')}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('commHub.canvas.connect.title', { platform: platform.label })}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{t(platform.subKey)}</p>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <p className="text-sm font-bold text-slate-800 mb-3">{t('commHub.canvas.connect.permissionsLabel')}</p>
          <div className="space-y-2">
            {platform.permissionKeys.map(key => (
              <div key={key} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{t(key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security badges */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('commHub.canvas.connect.localTitle')}</p>
              <p className="text-xs text-slate-500">{t('commHub.canvas.connect.localBody')}</p>
            </div>
          </div>
        </div>

        {/* DSGVO consent checkbox */}
        <label className={cn(
          'flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-colors',
          dsgvo ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
        )}>
          <input
            type="checkbox"
            checked={dsgvo}
            onChange={e => setDsgvo(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">{t('commHub.canvas.connect.dsgvoTitle')}</p>
            <p className="text-xs text-slate-500">{t('commHub.canvas.connect.dsgvoBody', { platform: platform.label })}</p>
          </div>
        </label>

        {/* CTA */}
        <div className="space-y-2">
          <button
            onClick={onAuthorize}
            disabled={!dsgvo}
            className={cn(
              'w-full font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg',
              dsgvo
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-600/25'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            )}
          >
            <ExternalLink className="w-4 h-4" />
            {t(platform.ctaKey)}
          </button>
          <button
            onClick={onSkip}
            className="w-full text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors py-1"
          >
            {t('commHub.canvas.connect.skip')}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Phase 1.C — hub map (visual confirmation) ──────────────────────────────
export function CommHubMapCanvas({ connected }: { connected: CommPlatformId[] }) {
  const t = useT();
  const platforms = COMM_PLATFORMS.filter(p => connected.includes(p.id));
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('commHub.canvas.map.heading')}</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">{t('commHub.canvas.map.subtitle')}</p>
      </div>

      <div className="relative w-[420px] h-[300px]">
        <svg viewBox="0 0 420 300" className="absolute inset-0 w-full h-full">
          {platforms.map((p, i) => {
            const angle = (Math.PI / (platforms.length + 1)) * (i + 1);
            const x = 210 + Math.cos(angle - Math.PI) * 150;
            const y = 150 + Math.sin(angle - Math.PI / 2) * 100 - 30;
            return (
              <line
                key={p.id}
                x1={210} y1={150}
                x2={x} y2={y}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
                style={{ animation: `dashFlow 1.2s linear infinite` }}
              />
            );
          })}
          <style>{`@keyframes dashFlow { to { stroke-dashoffset: -16; } }`}</style>
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 flex flex-col items-center justify-center gap-1">
            <Globe className="w-7 h-7" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('commHub.canvas.map.schoolSite')}</span>
          </div>
        </div>

        {platforms.map((p, i) => {
          const angle = (Math.PI / (platforms.length + 1)) * (i + 1);
          const x = 210 + Math.cos(angle - Math.PI) * 150;
          const y = 150 + Math.sin(angle - Math.PI / 2) * 100 - 30;
          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${(x / 420) * 100}%`, top: `${(y / 300) * 100}%` }}
            >
              <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg flex flex-col items-center gap-1 px-3 py-2 min-w-[110px]">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                  {p.id === 'email' ? (
                    <Mail className="w-4 h-4 text-slate-600" />
                  ) : (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`}
                      alt={p.label}
                      className="w-5 h-5 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-800">{p.label}</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> {t('commHub.canvas.map.live')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-5 py-2.5 animate-in fade-in duration-500">
        <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-sm font-bold text-blue-700">{t('commHub.canvas.map.compliant', { count: platforms.length, plural: platforms.length !== 1 ? 's' : '' })}</span>
      </div>
    </div>
  );
}

// ─── Phase 2 — emergency mobile canvas ──────────────────────────────────────
export function CommEmergencyMobileCanvas({
  step,
  draft, onDraftChange, onSubmitDraft,
  enhanced, channels, onToggleChannel, onBroadcast,
  broadcastTick, onTriggerEmergency,
}: {
  step: CommScenarioStep;
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmitDraft: () => void;
  enhanced: string;
  channels: { website: boolean; sdui: boolean; email: boolean };
  onToggleChannel: (key: 'website' | 'sdui' | 'email') => void;
  onBroadcast: () => void;
  broadcastTick: number;
  onTriggerEmergency: () => void;
}) {
  const t = useT();
  const isCompose       = step === 'comm_emerg_compose';
  const isEnhanced      = step === 'comm_emerg_enhanced';
  const isBroadcasting  = step === 'comm_emerg_broadcasting';
  const isDone          = step === 'comm_emerg_done';

  const channelRows = [
    { key: 'website' as const, labelKey: 'commHub.canvas.emergency.channel.website.label', subKey: 'commHub.canvas.emergency.channel.website.sub', deliveryKey: 'commHub.canvas.emergency.delivery.banner', icon: <Globe className="w-4 h-4" /> },
    { key: 'sdui' as const,    labelKey: 'commHub.canvas.emergency.channel.sdui.label',    subKey: 'commHub.canvas.emergency.channel.sdui.sub',    deliveryKey: 'commHub.canvas.emergency.delivery.sdui',   icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'email' as const,   labelKey: 'commHub.canvas.emergency.channel.email.label',   subKey: 'commHub.canvas.emergency.channel.email.sub',   deliveryKey: 'commHub.canvas.emergency.delivery.email',  icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex items-center justify-center gap-8 p-10 bg-slate-100 animate-in fade-in duration-700 overflow-auto">
      <PhoneFrame label="Administrator · Mobile">

        {/* IDLE */}
        {step === 'comm_emerg_idle' && (
          <div className="h-full flex flex-col bg-slate-50">
            <div className="px-5 pt-4 pb-3 bg-white border-b border-slate-200">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('commHub.canvas.emergency.statusTime')}</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5 leading-tight">{t('commHub.canvas.emergency.greeting')}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-900">{t('commHub.canvas.emergency.weatherTitle')}</p>
                  <p className="text-[11px] text-amber-700 leading-tight mt-0.5">{t('commHub.canvas.emergency.weatherBody')}</p>
                </div>
              </div>

              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('commHub.canvas.emergency.quickActions')}</p>

              <button
                onClick={onTriggerEmergency}
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 flex items-center gap-3 animate-pulse hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm">{t('commHub.canvas.emergency.triggerTitle')}</p>
                  <p className="text-[11px] text-white/80">{t('commHub.canvas.emergency.triggerSub')}</p>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              {[
                { labelKey: 'commHub.canvas.emergency.action.digest',   icon: <Send className="w-4 h-4 text-slate-500" /> },
                { labelKey: 'commHub.canvas.emergency.action.consent',  icon: <ClipboardCheck className="w-4 h-4 text-slate-500" /> },
                { labelKey: 'commHub.canvas.emergency.action.messenger', icon: <MessageSquare className="w-4 h-4 text-slate-500" /> },
              ].map(item => (
                <div key={item.labelKey} className="w-full p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">{item.icon}</div>
                  <p className="text-xs font-semibold text-slate-700 flex-1">{t(item.labelKey)}</p>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPOSE */}
        {isCompose && (
          <div className="h-full flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{t('commHub.canvas.emergency.compose.title')}</p>
                <p className="text-[10px] text-slate-400">{t('commHub.canvas.emergency.compose.sub')}</p>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <p className="text-[11px] text-slate-500">{t('commHub.canvas.emergency.compose.prompt')}</p>
              <textarea
                value={draft}
                onChange={e => onDraftChange(e.target.value)}
                placeholder={t('commHub.canvas.emergency.compose.placeholder')}
                className="w-full h-32 p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">{t('commHub.canvas.emergency.compose.hint')}</p>
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={onSubmitDraft}
                disabled={!draft.trim()}
                className={cn(
                  'w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all',
                  draft.trim()
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                )}
              >
                {t('commHub.canvas.emergency.compose.continue')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ENHANCED */}
        {isEnhanced && (
          <div className="h-full flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{t('commHub.canvas.emergency.review.title')}</p>
                <p className="text-[10px] text-slate-400">{t('commHub.canvas.emergency.review.sub')}</p>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">{t('commHub.canvas.emergency.review.germanDraft')}</span>
                  <span className="text-[9px] text-blue-600 bg-white border border-blue-200 px-1.5 py-0.5 rounded">AI</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">{enhanced}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('commHub.canvas.emergency.review.original')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug italic">"{draft}"</p>
              </div>

              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2">{t('commHub.canvas.emergency.review.sendTo')}</p>
              {channelRows.map(c => (
                <button
                  key={c.key}
                  onClick={() => onToggleChannel(c.key)}
                  className={cn(
                    'w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left',
                    channels[c.key]
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-slate-200'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    channels[c.key] ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                  )}>
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-bold', channels[c.key] ? 'text-slate-900' : 'text-slate-500')}>{t(c.labelKey)}</p>
                    <p className="text-[10px] text-slate-400">{t(c.subKey)}</p>
                  </div>
                  <div className={cn(
                    'w-9 h-5 rounded-full shrink-0 transition-colors flex items-center px-0.5',
                    channels[c.key] ? 'bg-blue-500 justify-end' : 'bg-slate-300 justify-start'
                  )}>
                    <div className="w-4 h-4 rounded-full bg-white shadow" />
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={onBroadcast}
                className="w-full font-bold py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/30 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('commHub.canvas.emergency.review.broadcast', { count: Object.values(channels).filter(Boolean).length })}
              </button>
            </div>
          </div>
        )}

        {/* BROADCASTING */}
        {(isBroadcasting || isDone) && (
          <div className="h-full flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full border flex items-center justify-center',
                isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
              )}>
                {isDone ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Bell className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{isDone ? t('commHub.canvas.emergency.done.title') : t('commHub.canvas.emergency.broadcasting.title')}</p>
                <p className="text-[10px] text-slate-400">{isDone ? t('commHub.canvas.emergency.done.sub') : t('commHub.canvas.emergency.broadcasting.sub')}</p>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {channelRows.filter(c => channels[c.key]).map((c, i) => {
                const isComplete = broadcastTick > i || isDone;
                const isActive   = broadcastTick === i && !isDone;
                return (
                  <div
                    key={c.key}
                    className={cn(
                      'p-3 rounded-xl border flex items-center gap-3 transition-all duration-500',
                      isComplete ? 'bg-emerald-50 border-emerald-200' :
                      isActive   ? 'bg-blue-50 border-blue-300'        :
                                   'bg-slate-50 border-slate-200 opacity-50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isComplete ? 'bg-emerald-100 text-emerald-600' :
                      isActive   ? 'bg-blue-100 text-blue-600'         :
                                   'bg-slate-100 text-slate-400'
                    )}>
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-bold',
                        isComplete ? 'text-emerald-900' :
                        isActive   ? 'text-slate-900'   :
                                     'text-slate-400'
                      )}>{t(c.labelKey)}</p>
                      <p className="text-[10px] text-slate-500">
                        {isComplete ? t('commHub.canvas.emergency.delivered', { detail: t(c.deliveryKey) }) :
                         isActive   ? t('commHub.canvas.emergency.sending') :
                                      t('commHub.canvas.emergency.queued')}
                      </p>
                    </div>
                    {isComplete ? <CheckCircle className="w-5 h-5 text-emerald-500" /> :
                     isActive   ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> :
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                  </div>
                );
              })}

              {isDone && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900">{t('commHub.canvas.emergency.reached.title')}</p>
                    <p className="text-[10px] text-emerald-700 leading-snug mt-0.5">{t('commHub.canvas.emergency.reached.body')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </PhoneFrame>

      {/* Side info card */}
      <div className="hidden xl:block w-72 space-y-3 self-start mt-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t('commHub.canvas.emergency.rail.phaseLabel')}</p>
          <p className="text-sm text-slate-700 leading-relaxed">{t('commHub.canvas.emergency.rail.phaseBody')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-xs font-bold text-slate-900">{t('commHub.canvas.emergency.rail.reachTitle')}</p>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{t('commHub.canvas.emergency.rail.reachBody')}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 3.A — smart form builder canvas ──────────────────────────────────
export function CommConsentFormBuilderCanvas({
  step, prompt, onPromptChange, onGenerate,
  formReady, routing, onConfirmRouting,
}: {
  step: CommScenarioStep;
  prompt: string;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
  formReady: boolean;
  routing: boolean;
  onConfirmRouting: () => void;
}) {
  const t = useT();
  const fields = [
    { labelKey: 'commHub.canvas.consent.field.studentName',     type: 'text',     required: true },
    { labelKey: 'commHub.canvas.consent.field.classGrade',      type: 'text',     required: true },
    { labelKey: 'commHub.canvas.consent.field.parentSignature', type: 'signature', required: true },
    { labelKey: 'commHub.canvas.consent.field.emergencyContact', type: 'phone',   required: true },
    { labelKey: 'commHub.canvas.consent.field.dietary',         type: 'textarea', required: false },
    { labelKey: 'commHub.canvas.consent.field.consent',         type: 'checkbox', required: true, terminal: true },
  ];

  const isCompose = step === 'comm_consent_compose';

  return (
    <div className="flex-1 flex flex-col bg-slate-100 animate-in fade-in duration-500 overflow-hidden">
      {/* Browser chrome */}
      <div className="shrink-0 bg-white px-3 py-2 border-b border-slate-200 flex items-center gap-2">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"/>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"/>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/>
        </div>
        <div className="bg-blue-50 px-3 py-1 rounded text-xs text-blue-700 font-bold font-mono flex-1 text-center border border-blue-200">
          oakwoodhigh.de/biologie-10/exkursion-wald
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full shrink-0">
          {t('commHub.canvas.consent.editorBadge')}
        </span>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left rail — block library */}
        <div className="w-44 shrink-0 bg-white border-r border-slate-200 p-3 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{t('commHub.canvas.consent.blocksLabel')}</p>
          {[
            { labelKey: 'commHub.canvas.consent.block.heading',   icon: <FileText className="w-3.5 h-3.5" /> },
            { labelKey: 'commHub.canvas.consent.block.text',      icon: <Edit3 className="w-3.5 h-3.5" /> },
            { labelKey: 'commHub.canvas.consent.block.image',     icon: <Globe className="w-3.5 h-3.5" /> },
            { labelKey: 'commHub.canvas.consent.block.smartForm', icon: <ClipboardCheck className="w-3.5 h-3.5" />, active: true },
            { labelKey: 'commHub.canvas.consent.block.calendar',  icon: <Calendar className="w-3.5 h-3.5" /> },
            { labelKey: 'commHub.canvas.consent.block.roster',    icon: <Users className="w-3.5 h-3.5" /> },
          ].map(b => (
            <div key={b.labelKey} className={cn(
              'flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold',
              b.active ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 opacity-60'
            )}>
              {b.icon}
              {t(b.labelKey)}
              {b.active && <span className="ml-auto text-[8px] font-bold text-blue-600 bg-white border border-blue-200 px-1 rounded-sm">{t('commHub.canvas.consent.block.dragged')}</span>}
            </div>
          ))}
        </div>

        {/* Page canvas */}
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Klasse 10 · Biologie</p>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Exkursion in den Wald</h1>
            <p className="text-sm text-slate-600">Freitag, 15. November · Treffpunkt 8:00 am Hauptportal</p>

            <div className={cn(
              'rounded-2xl border-2 border-dashed transition-all duration-500',
              isCompose ? 'border-blue-400 bg-blue-50/40 p-4' : 'border-blue-300 bg-white p-4'
            )}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">{t('commHub.canvas.consent.smartFormBadge')}</p>
                </div>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">{t('commHub.canvas.consent.aiGenerated')}</span>
              </div>

              {isCompose ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500">{t('commHub.canvas.consent.describePrompt')}</p>
                  <textarea
                    value={prompt}
                    onChange={e => onPromptChange(e.target.value)}
                    placeholder={t('commHub.canvas.consent.promptPlaceholder')}
                    className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={onGenerate}
                    disabled={!prompt.trim()}
                    className={cn(
                      'w-full text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all',
                      prompt.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    {t('commHub.canvas.consent.generate')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-700">
                  {fields.map((f, i) => (
                    <div
                      key={f.labelKey}
                      className={cn(
                        'rounded-xl border p-2.5 bg-white animate-in fade-in slide-in-from-bottom-1',
                        f.terminal ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'
                      )}
                      style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'backwards' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-bold text-slate-700">
                          {t(f.labelKey)}
                          {f.required && <span className="text-red-500 ml-0.5">*</span>}
                        </p>
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{f.type}</span>
                      </div>
                      {f.type === 'textarea' && <div className="h-8 rounded bg-slate-50 border border-slate-200" />}
                      {(f.type === 'text' || f.type === 'phone') && <div className="h-7 rounded bg-slate-50 border border-slate-200" />}
                      {f.type === 'signature' && <div className="h-10 rounded bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{t('commHub.canvas.consent.field.signHere')}</div>}
                      {f.type === 'checkbox' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border-2 border-emerald-400 bg-white" />
                          <span className="text-[11px] text-emerald-800 font-semibold">{t('commHub.canvas.consent.consentText')}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{t('commHub.canvas.consent.tripCost')}</span>
                    <span className="ml-auto text-sm font-bold text-amber-900">5,00 €</span>
                  </div>
                </div>
              )}
            </div>

            {/* Publish actions panel */}
            {formReady && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">{t('commHub.canvas.consent.publish.heading')}</p>
                <div className="space-y-2 mb-3">
                  {[
                    { id: 'sdui',  labelKey: 'commHub.canvas.consent.route.sdui.label',  subKey: 'commHub.canvas.consent.route.sdui.sub',  icon: <MessageSquare className="w-4 h-4" /> },
                    { id: 'email', labelKey: 'commHub.canvas.consent.route.email.label', subKey: 'commHub.canvas.consent.route.email.sub', icon: <Mail className="w-4 h-4" /> },
                  ].map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">{r.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900">{t(r.labelKey)}</p>
                        <p className="text-[10px] text-slate-500">{t(r.subKey)}</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                  ))}
                </div>
                <button
                  onClick={onConfirmRouting}
                  disabled={routing}
                  className={cn(
                    'w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm',
                    routing
                      ? 'bg-slate-100 text-slate-400 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                  )}
                >
                  {routing ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('commHub.canvas.consent.sending')}</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> {t('commHub.canvas.consent.sendCta')}</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 3.B — parent preview (mobile) ────────────────────────────────────
// Note: this canvas intentionally renders German showcase content (the
// notification body, "Ich stimme zu", "Einverständnis übermittelt", etc.)
// because it depicts the AI's German output to a German parent. Only chrome
// (loading state, "Form preview" label, side rail) is translated.
export function CommConsentParentPreviewCanvas() {
  const t = useT();
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  useEffect(() => {
    if (stage >= 3) return;
    const tt = setTimeout(() => setStage(s => (s + 1) as 0 | 1 | 2 | 3), stage === 0 ? 1100 : 1500);
    return () => clearTimeout(tt);
  }, [stage]);

  return (
    <div className="flex-1 flex items-center justify-center gap-8 p-10 bg-slate-100 animate-in fade-in duration-700 overflow-auto">
      <PhoneFrame label="Parent · Sdui app">
        {stage === 0 && (
          <div className="h-full flex flex-col bg-slate-50 items-center justify-center gap-3 px-6 text-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <p className="text-xs text-slate-500">{t('commHub.canvas.parent.waiting')}</p>
          </div>
        )}

        {stage >= 1 && stage < 3 && (
          <div className="h-full flex flex-col bg-slate-50">
            <div className="px-5 pt-3 pb-2 flex items-center gap-2 bg-white border-b border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                <img
                  src={`https://www.google.com/s2/favicons?domain=sdui.de&sz=128`}
                  alt="Sdui"
                  className="w-4 h-4 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <p className="text-xs font-bold text-slate-900">Sdui</p>
              <span className="ml-auto text-[10px] text-slate-400">{t('commHub.canvas.parent.timeNow')}</span>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Einverständniserklärung</p>
                <p className="text-sm font-bold text-slate-900 leading-snug">Wald-Exkursion Klasse 10b · Freitag</p>
                <p className="text-[11px] text-slate-500 mt-1">Bitte bis Donnerstag bestätigen — Kosten 5,00 €</p>
                <button className="mt-3 w-full text-xs font-bold py-2 rounded-lg bg-blue-600 text-white">
                  Formular öffnen →
                </button>
              </div>

              {stage >= 2 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('commHub.canvas.parent.formPreview')}</p>
                  <div className="space-y-2">
                    {['Schüler:in: Lina M.', 'Klasse: 10b', 'Notfallkontakt: +49 …'].map(line => (
                      <div key={line} className="flex items-center gap-2 text-[11px] text-slate-700">
                        <CheckCircle className="w-3 h-3 text-emerald-500" /> {line}
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800">Ich stimme zu</span>
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-2 h-12 flex items-center justify-center">
                    <span className="text-slate-400 italic text-sm" style={{ fontFamily: 'Caveat, cursive' }}>M. Müller</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {stage === 3 && (
          <div className="h-full flex flex-col bg-emerald-50 items-center justify-center gap-3 px-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-emerald-900">Einverständnis übermittelt</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Vielen Dank! Die Schule wurde benachrichtigt.
            </p>
          </div>
        )}
      </PhoneFrame>

      <div className="hidden xl:block w-72 space-y-3 self-start mt-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t('commHub.canvas.parent.rail.experienceTitle')}</p>
          <p className="text-sm text-slate-700 leading-relaxed">{t('commHub.canvas.parent.rail.experienceBody')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-xs font-bold text-slate-900">{t('commHub.canvas.parent.rail.dsgvoTitle')}</p>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{t('commHub.canvas.parent.rail.dsgvoBody')}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 3.C — admin consent dashboard ────────────────────────────────────
export function CommConsentDashboardCanvas({
  total = 30, received = 24, onSendReminder, reminderSent,
}: {
  total?: number;
  received?: number;
  onSendReminder: () => void;
  reminderSent: boolean;
}) {
  const t = useT();
  const pending = total - received;
  const pct = Math.round((received / total) * 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const filled = (received / total) * circumference;

  const pendingParents = [
    { name: 'Familie Becker',   student: 'Jonas B.',   lastKey: 'commHub.canvas.dashboard.pendingTime.2DaysAgo' },
    { name: 'Familie Demir',    student: 'Aylin D.',   lastKey: 'commHub.canvas.dashboard.pendingTime.2DaysAgo' },
    { name: 'Familie Schulz',   student: 'Maja S.',    lastKey: 'commHub.canvas.dashboard.pendingTime.1DayAgo' },
    { name: 'Familie Romano',   student: 'Luca R.',    lastKey: 'commHub.canvas.dashboard.pendingTime.1DayAgo' },
    { name: 'Familie Albrecht', student: 'Felix A.',   lastKey: 'commHub.canvas.dashboard.pendingTime.5HoursAgo' },
    { name: 'Familie Werner',   student: 'Hannah W.',  lastKey: 'commHub.canvas.dashboard.pendingTime.3HoursAgo' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 bg-white animate-in fade-in duration-700 overflow-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1">{t('commHub.canvas.dashboard.classLabel')}</p>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('commHub.canvas.dashboard.title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('commHub.canvas.dashboard.subtitle')}</p>
        </div>
        <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> {t('commHub.canvas.statusCard.live')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pie chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <svg width={160} height={160}>
              <circle cx={80} cy={80} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={16} />
              <circle
                cx={80} cy={80} r={radius} fill="none"
                stroke="#10b981" strokeWidth={16} strokeLinecap="round"
                strokeDasharray={`${filled} ${circumference - filled}`}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-3xl font-extrabold text-slate-900 leading-none">{received}/{total}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('commHub.canvas.dashboard.consentsLabel')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-700">{t('commHub.canvas.dashboard.signed', { count: received })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span className="text-xs font-semibold text-slate-700">{t('commHub.canvas.dashboard.pending', { count: pending })}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">{t('commHub.canvas.dashboard.completion', { pct })}</p>
        </div>

        {/* KPIs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('commHub.canvas.dashboard.byChannel')}</p>
          {[
            { label: 'Sdui',  value: 21, total: 24, color: 'bg-blue-500' },
            { label: 'Email', value: 3,  total: 6,  color: 'bg-amber-400' },
          ].map(r => (
            <div key={r.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{r.label}</span>
                <span className="font-mono text-slate-500">{r.value} / {r.total}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700', r.color)} style={{ width: `${(r.value / r.total) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">14s</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('commHub.canvas.dashboard.kpi.avgResponse')}</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">99%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('commHub.canvas.dashboard.kpi.emailDelivery')}</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600">{pct}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('commHub.canvas.dashboard.kpi.signed')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending list + reminder */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-slate-900">{t(pending === 1 ? 'commHub.canvas.dashboard.pendingTitle.one' : 'commHub.canvas.dashboard.pendingTitle.other', { count: pending })}</p>
            <p className="text-[11px] text-slate-400">{t('commHub.canvas.dashboard.pendingSub')}</p>
          </div>
          <button
            onClick={onSendReminder}
            disabled={reminderSent}
            className={cn(
              'text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-sm transition-all',
              reminderSent
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
            )}
          >
            {reminderSent
              ? <><CheckCircle className="w-3.5 h-3.5" /> {t('commHub.canvas.dashboard.remindersSent')}</>
              : <><Send className="w-3.5 h-3.5" /> {t('commHub.canvas.dashboard.sendReminder', { count: pending })}</>
            }
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pendingParents.slice(0, pending).map(p => (
            <div key={p.name} className={cn(
              'flex items-center gap-3 p-2.5 rounded-xl border transition-colors',
              reminderSent ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            )}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                reminderSent ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              )}>
                {p.name.split(' ')[1].charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{p.student} · {reminderSent ? t('commHub.canvas.dashboard.reminded') : t('commHub.canvas.dashboard.lastSeen', { time: t(p.lastKey) })}</p>
              </div>
              {reminderSent ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Bell className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Right-rail status card (live hub) ──────────────────────────────────────
export function CommHubStatusCard({
  connected, currentStep,
}: {
  connected: CommPlatformId[];
  currentStep: string;
}) {
  const t = useT();
  return (
    <div className="p-4 bg-white border border-blue-200 shadow-sm rounded-2xl animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{t('commHub.canvas.statusCard.heading')}</p>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> {t('commHub.canvas.statusCard.live')}
        </span>
      </div>
      <div className="space-y-2">
        {COMM_PLATFORMS.map(p => {
          const isConnected = connected.includes(p.id);
          const isCurrent =
            (currentStep === 'comm_connect_sdui'  && p.id === 'sdui') ||
            (currentStep === 'comm_connect_email' && p.id === 'email');
          return (
            <div key={p.id} className={cn(
              'flex items-center justify-between p-2 rounded-xl border transition-all duration-500',
              isConnected ? 'bg-blue-50 border-blue-100' :
              isCurrent   ? 'bg-blue-50 border-blue-200' :
                            'bg-slate-50 border-slate-100 opacity-60'
            )}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white shadow-sm p-0.5 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {p.id === 'email'
                    ? <Mail className="w-3.5 h-3.5 text-slate-600" />
                    : <img
                        src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`}
                        alt={p.label}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                  }
                </div>
                <div className="min-w-0">
                  <p className={cn('text-xs font-bold leading-tight',
                    isConnected ? 'text-blue-800' :
                    isCurrent   ? 'text-blue-800' :
                                  'text-slate-500'
                  )}>{p.label}</p>
                  <p className="text-[9px] text-slate-400 leading-tight">{t(p.regionKey)}</p>
                </div>
              </div>
              {isConnected ? <CheckCircle className="w-4 h-4 text-blue-500 animate-in zoom-in shrink-0" />          :
               isCurrent   ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />                    :
                             <Lock className="w-3 h-3 text-slate-300 shrink-0" />}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed pt-3 mt-3 border-t border-slate-100">
        {t('commHub.canvas.statusCard.footer')}
      </p>
    </div>
  );
}
