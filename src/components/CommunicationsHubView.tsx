import { useEffect, useRef, useState } from 'react';
import {
  Bell, ClipboardCheck, ArrowLeft, Bot, RefreshCw,
  ChevronRight, Send, ShieldCheck, AlertTriangle, Sparkles, Mail,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useT } from '../lib/i18n';
import {
  CommEmergencyMobileCanvas,
  CommConsentFormBuilderCanvas,
  CommConsentParentPreviewCanvas,
  CommConsentDashboardCanvas,
  CommHubStatusCard,
  COMM_PLATFORMS,
  type CommPlatformId,
} from './CommunicationHubViews';

type ExamplePage = 'gallery' | 'emergency' | 'consent';

type EmergencyStep = 'comm_emerg_idle' | 'comm_emerg_compose' | 'comm_emerg_enhanced' | 'comm_emerg_broadcasting' | 'comm_emerg_done';
type ConsentStep   = 'comm_consent_compose' | 'comm_consent_form' | 'comm_consent_routing' | 'comm_consent_parent' | 'comm_consent_dashboard';

const ENHANCED_DE = 'Wichtige Information: Aufgrund extremer Witterungsbedingungen bleibt die Schule am heutigen Tag geschlossen. Eine Notbetreuung ist eingerichtet.';

interface CommunicationsHubViewProps {
  connectedPlatforms?: CommPlatformId[];
}

// ─── Page entry ─────────────────────────────────────────────────────────────
export function CommunicationsHubView({ connectedPlatforms = ['sdui', 'email'] }: CommunicationsHubViewProps) {
  const [page, setPage] = useState<ExamplePage>('gallery');

  return (
    <div className="space-y-6">
      <PageHeader connectedPlatforms={connectedPlatforms} />

      {page === 'gallery' && <Gallery onSelect={setPage} connectedPlatforms={connectedPlatforms} />}

      {page === 'emergency' && (
        <EmergencyExample
          key="emergency"
          onBack={() => setPage('gallery')}
          connectedPlatforms={connectedPlatforms}
        />
      )}

      {page === 'consent' && (
        <ConsentExample
          key="consent"
          onBack={() => setPage('gallery')}
          connectedPlatforms={connectedPlatforms}
        />
      )}
    </div>
  );
}

// ─── Page header ────────────────────────────────────────────────────────────
function PageHeader({ connectedPlatforms }: { connectedPlatforms: CommPlatformId[] }) {
  const t = useT();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('commHub.title')}</h1>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {t('commHub.examplesBadge')}
          </span>
        </div>
        <p className="text-sm text-slate-500 max-w-2xl">{t('commHub.subtitle')}</p>
      </div>
      <div className="shrink-0 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mr-1">{t('commHub.liveChannels')}</span>
        {connectedPlatforms.length === 0 && (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-full">
            {t('commHub.noChannels')}
          </span>
        )}
        {connectedPlatforms.map(id => {
          const p = COMM_PLATFORMS.find(p => p.id === id)!;
          return (
            <span key={id} className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {p.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gallery ────────────────────────────────────────────────────────────────
function Gallery({
  onSelect, connectedPlatforms,
}: {
  onSelect: (page: ExamplePage) => void;
  connectedPlatforms: CommPlatformId[];
}) {
  const t = useT();
  const examples: {
    id: 'emergency' | 'consent';
    titleKey: string;
    blurbKey: string;
    durationKey: string;
    tagKeys: string[];
    icon: React.ReactNode;
    accent: string;
    accentSoft: string;
  }[] = [
    {
      id: 'emergency',
      titleKey: 'commHub.example.emergency.title',
      blurbKey: 'commHub.example.emergency.blurb',
      durationKey: 'commHub.example.emergency.duration',
      tagKeys: ['commHub.example.emergency.tag.0', 'commHub.example.emergency.tag.1', 'commHub.example.emergency.tag.2'],
      icon: <Bell className="w-6 h-6" />,
      accent: 'from-red-500 to-red-600',
      accentSoft: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      id: 'consent',
      titleKey: 'commHub.example.consent.title',
      blurbKey: 'commHub.example.consent.blurb',
      durationKey: 'commHub.example.consent.duration',
      tagKeys: ['commHub.example.consent.tag.0', 'commHub.example.consent.tag.1', 'commHub.example.consent.tag.2'],
      icon: <ClipboardCheck className="w-6 h-6" />,
      accent: 'from-blue-500 to-blue-600',
      accentSoft: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">{t('commHub.gallery.heading')}</h2>
        <span className="text-xs text-slate-400">{t('commHub.gallery.count', { count: examples.length })}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {examples.map(ex => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex.id)}
            className="group bg-white border border-slate-200 rounded-2xl p-6 text-left transition-all hover:shadow-xl hover:border-blue-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-md', ex.accent)}>
                {ex.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t(ex.durationKey)}</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t(ex.titleKey)}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t(ex.blurbKey)}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {ex.tagKeys.map(tk => (
                <span key={tk} className={cn('text-[10px] font-bold px-2 py-1 rounded-full border', ex.accentSoft)}>
                  {t(tk)}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {t('commHub.gallery.aiWalkthrough')}
              </span>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                {t('commHub.gallery.runExample')} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Helpful note */}
      {connectedPlatforms.length < 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">{t('commHub.gallery.warning.title')}</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{t('commHub.gallery.warning.body')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Walkthrough chrome ──────────────────────────────────────────────────────
function WalkthroughHeader({
  title, onBack, onReset, accent,
}: {
  title: string;
  onBack: () => void;
  onReset: () => void;
  accent: 'red' | 'blue';
}) {
  const t = useT();
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('commHub.walkthrough.back')}
      </button>
      <div className={cn(
        'flex items-center gap-2 px-3 py-1 rounded-full border',
        accent === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
      )}>
        {accent === 'red' ? <Bell className="w-3.5 h-3.5" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
        <span className="text-xs font-bold">{title}</span>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {t('commHub.walkthrough.restart')}
      </button>
    </div>
  );
}

// ─── Reusable chat panel ────────────────────────────────────────────────────
type ChatMessage = { role: 'user' | 'agent'; content: React.ReactNode };

function ChatPanel({
  subtitle, messages, footer,
}: {
  subtitle: string;
  messages: ChatMessage[];
  footer?: React.ReactNode;
}) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, footer]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl flex flex-col overflow-hidden h-[640px]">
      <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">{t('commHub.chat.title')}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex flex-col max-w-[90%]', m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}>
            <div className={cn(
              'px-3 py-2 rounded-2xl text-sm shadow-sm',
              m.role === 'user'
                ? 'bg-slate-800 text-white rounded-br-sm [&_a]:text-blue-300 [&_a]:underline [&_a:hover]:text-blue-100'
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
            )}>
              {m.content}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">{m.role === 'user' ? t('commHub.chat.sender.you') : t('commHub.chat.title')}</span>
          </div>
        ))}
        {footer}
      </div>
    </div>
  );
}

// ─── Walkthrough layout ────────────────────────────────────────────────────
function WalkthroughLayout({
  chat, canvas, rail,
}: {
  chat: React.ReactNode;
  canvas: React.ReactNode;
  rail: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] xl:grid-cols-[minmax(280px,360px)_1fr_280px] gap-4">
      <div className="lg:order-1">{chat}</div>
      <div className="lg:order-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[640px]">
        {canvas}
      </div>
      <div className="hidden xl:block xl:order-3 space-y-4">{rail}</div>
    </div>
  );
}

// ─── EXAMPLE 1: Emergency broadcast ─────────────────────────────────────────
function EmergencyExample({
  onBack, connectedPlatforms,
}: {
  onBack: () => void;
  connectedPlatforms: CommPlatformId[];
}) {
  const t = useT();
  const [step, setStep]                 = useState<EmergencyStep>('comm_emerg_idle');
  const [draft, setDraft]               = useState('');
  const [enhanced, setEnhanced]         = useState('');
  const [channels, setChannels]         = useState({ website: true, sdui: true, email: true });
  const [broadcastTick, setBroadcastTick] = useState(0);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [resetKey, setResetKey]         = useState(0);

  const addAgent = (content: React.ReactNode) => setMessages(prev => [...prev, { role: 'agent', content }]);
  const addUser  = (content: React.ReactNode) => setMessages(prev => [...prev, { role: 'user',  content }]);

  // Intro narration on mount / reset
  useEffect(() => {
    setMessages([]);
    setStep('comm_emerg_idle');
    setDraft('');
    setEnhanced('');
    setChannels({ website: true, sdui: true, email: true });
    setBroadcastTick(0);

    const t1 = setTimeout(() => addAgent(t('commHub.emergency.intro')), 600);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Tick through broadcast channels
  useEffect(() => {
    if (step !== 'comm_emerg_broadcasting') return;
    const activeCount = Object.values(channels).filter(Boolean).length;
    if (broadcastTick >= activeCount) {
      const tt = setTimeout(() => {
        setStep('comm_emerg_done');
        addAgent(t('commHub.emergency.broadcast.done', { count: activeCount, plural: activeCount !== 1 ? 's' : '' }));
      }, 600);
      return () => clearTimeout(tt);
    }
    const tt = setTimeout(() => setBroadcastTick(v => v + 1), 1100);
    return () => clearTimeout(tt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, broadcastTick, channels]);

  const tapEmergency = () => {
    addUser(t('commHub.emergency.tap.userMessage'));
    setTimeout(() => {
      addAgent(t('commHub.emergency.tap.agentReply'));
      setStep('comm_emerg_compose');
      setDraft(t('commHub.emergency.draft.default'));
    }, 500);
  };

  const submitDraft = () => {
    addUser(draft);
    setTimeout(() => {
      setEnhanced(ENHANCED_DE);
      addAgent(t('commHub.emergency.enhanced.reply'));
      setStep('comm_emerg_enhanced');
    }, 1200);
  };

  const toggleChannel = (key: 'website' | 'sdui' | 'email') => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const broadcast = () => {
    const active = Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(', ');
    addUser(t('commHub.emergency.broadcast.userMessage', { channels: active }));
    setBroadcastTick(0);
    setTimeout(() => {
      addAgent(t('commHub.emergency.broadcast.reaching'));
      setStep('comm_emerg_broadcasting');
    }, 400);
  };

  const reset = () => setResetKey(v => v + 1);

  const subtitle =
    step === 'comm_emerg_idle'         ? t('commHub.emergency.subtitle.idle') :
    step === 'comm_emerg_compose'      ? t('commHub.emergency.subtitle.compose') :
    step === 'comm_emerg_enhanced'     ? t('commHub.emergency.subtitle.enhanced') :
    step === 'comm_emerg_broadcasting' ? t('commHub.emergency.subtitle.broadcasting') :
                                         t('commHub.emergency.subtitle.done');

  // Quick-reply footer
  const chatFooter = (() => {
    if (step === 'comm_emerg_idle') {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
          <button onClick={tapEmergency}
            className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2 animate-pulse">
            <Bell className="w-3.5 h-3.5" />
            {t('commHub.emergency.cta.trigger')}
          </button>
        </div>
      );
    }
    if (step === 'comm_emerg_done') {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 flex flex-wrap gap-2">
          <button onClick={reset}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            {t('commHub.walkthrough.replay')}
          </button>
          <button onClick={onBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
            {t('commHub.walkthrough.back')}
          </button>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className="space-y-4">
      <WalkthroughHeader title={t('commHub.example.emergency.title')} onBack={onBack} onReset={reset} accent="red" />
      <WalkthroughLayout
        chat={<ChatPanel subtitle={subtitle} messages={messages} footer={chatFooter} />}
        canvas={
          <CommEmergencyMobileCanvas
            step={step as any}
            draft={draft}
            onDraftChange={setDraft}
            onSubmitDraft={submitDraft}
            enhanced={enhanced}
            channels={channels}
            onToggleChannel={toggleChannel}
            onBroadcast={broadcast}
            broadcastTick={broadcastTick}
            onTriggerEmergency={tapEmergency}
          />
        }
        rail={
          <>
            <div className="bg-white border border-red-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-red-500" />
                <p className="text-xs font-bold text-slate-900">{t('commHub.rail.emergency.whyTitle')}</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t('commHub.rail.emergency.whyBody')}</p>
            </div>
            <CommHubStatusCard connected={connectedPlatforms} currentStep={step} />
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs font-bold text-slate-900">{t('commHub.rail.emergency.dsgvoTitle')}</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t('commHub.rail.emergency.dsgvoBody')}</p>
            </div>
          </>
        }
      />
    </div>
  );
}

// ─── EXAMPLE 2: Consent forms ───────────────────────────────────────────────
function ConsentExample({
  onBack, connectedPlatforms,
}: {
  onBack: () => void;
  connectedPlatforms: CommPlatformId[];
}) {
  const t = useT();
  const [step, setStep]                 = useState<ConsentStep>('comm_consent_compose');
  const [prompt, setPrompt]             = useState('');
  const [formReady, setFormReady]       = useState(false);
  const [routing, setRouting]           = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [resetKey, setResetKey]         = useState(0);

  const addAgent = (content: React.ReactNode) => setMessages(prev => [...prev, { role: 'agent', content }]);
  const addUser  = (content: React.ReactNode) => setMessages(prev => [...prev, { role: 'user',  content }]);

  // Intro narration on mount / reset
  useEffect(() => {
    setMessages([]);
    setStep('comm_consent_compose');
    setPrompt(t('commHub.consent.prompt.default'));
    setFormReady(false);
    setRouting(false);
    setReminderSent(false);

    const tt = setTimeout(() => addAgent(t('commHub.consent.intro')), 600);
    return () => clearTimeout(tt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Auto-advance from parent preview to dashboard
  useEffect(() => {
    if (step !== 'comm_consent_parent') return;
    const tt = setTimeout(() => {
      addAgent(t('commHub.consent.dashboard.reply'));
      setStep('comm_consent_dashboard');
    }, 5500);
    return () => clearTimeout(tt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const generateForm = () => {
    addUser(prompt);
    setTimeout(() => {
      addAgent(t('commHub.consent.generated.reply'));
      setStep('comm_consent_form');
      setFormReady(true);
    }, 1400);
  };

  const confirmRouting = () => {
    addUser(t('commHub.consent.routing.userMessage'));
    setRouting(true);
    setTimeout(() => {
      addAgent(t('commHub.consent.routing.reply'));
      setStep('comm_consent_parent');
      setRouting(false);
    }, 1500);
  };

  const sendReminder = () => {
    addUser(t('commHub.consent.reminder.userMessage'));
    setReminderSent(true);
    setTimeout(() => {
      addAgent(t('commHub.consent.reminder.reply'));
    }, 700);
  };

  const reset = () => setResetKey(v => v + 1);

  const subtitle =
    step === 'comm_consent_compose'   ? t('commHub.consent.subtitle.compose') :
    step === 'comm_consent_form'      ? t('commHub.consent.subtitle.form') :
    step === 'comm_consent_routing'   ? t('commHub.consent.subtitle.routing') :
    step === 'comm_consent_parent'    ? t('commHub.consent.subtitle.parent') :
                                        t('commHub.consent.subtitle.dashboard');

  const canvas = (
    step === 'comm_consent_parent'
      ? <CommConsentParentPreviewCanvas />
      : step === 'comm_consent_dashboard'
        ? <CommConsentDashboardCanvas onSendReminder={sendReminder} reminderSent={reminderSent} />
        : <CommConsentFormBuilderCanvas
            step={step as any}
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={generateForm}
            formReady={formReady}
            routing={routing}
            onConfirmRouting={confirmRouting}
          />
  );

  // Quick-reply footer
  const chatFooter = (() => {
    if (step === 'comm_consent_dashboard') {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 flex flex-wrap gap-2">
          {!reminderSent && (
            <button onClick={sendReminder}
              className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              {t('commHub.consent.cta.sendReminder')}
            </button>
          )}
          <button onClick={reset}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            {t('commHub.walkthrough.replay')}
          </button>
          <button onClick={onBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm transition-colors flex items-center gap-2">
            {t('commHub.walkthrough.back')}
          </button>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className="space-y-4">
      <WalkthroughHeader title={t('commHub.example.consent.title')} onBack={onBack} onReset={reset} accent="blue" />
      <WalkthroughLayout
        chat={<ChatPanel subtitle={subtitle} messages={messages} footer={chatFooter} />}
        canvas={canvas}
        rail={
          <>
            <div className="bg-white border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs font-bold text-slate-900">{t('commHub.rail.consent.whyTitle')}</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t('commHub.rail.consent.whyBody')}</p>
            </div>
            <CommHubStatusCard connected={connectedPlatforms} currentStep={step} />
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs font-bold text-slate-900">{t('commHub.rail.consent.dsgvoTitle')}</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t('commHub.rail.consent.dsgvoBody')}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-xs font-bold text-slate-900">{t('commHub.rail.consent.channelTitle')}</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t('commHub.rail.consent.channelBody')}</p>
            </div>
          </>
        }
      />
    </div>
  );
}
