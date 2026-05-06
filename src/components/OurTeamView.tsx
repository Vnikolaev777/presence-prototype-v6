import { useState } from 'react';
import { Bot, Code2, PenTool, BrainCircuit, Zap, GraduationCap, Activity, Globe, AlertTriangle, Sliders, Bell, ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useT } from '../lib/i18n';

interface Props {
  agents: any[];
  connectedSystems: any[];
  autoUpdatesCount: number;
}

type SubTab = 'team' | 'activity' | 'settings';

// ─── Mock activity log ───────────────────────────────────────────────────────
// Action and time strings reuse the tasks.* keys defined in TasksView since
// they're identical fixtures.
type ActivityEntry = {
  agentKey: string;
  color: string;
  icon: React.ReactNode;
  actionKey: string;
  timeKey: string;
  status: 'pending_review' | 'auto_applied';
};

const ACTIVITY_LOG: ActivityEntry[] = [
  { agentKey: 'ourTeam.activity.agent.contentCreator', color: 'bg-emerald-100 text-emerald-700', icon: <PenTool className="w-3.5 h-3.5"/>, actionKey: 'tasks.contentCreator.t0.action', timeKey: 'tasks.time.2MinAgo',  status: 'pending_review' },
  { agentKey: 'ourTeam.activity.agent.webAdmin',       color: 'bg-blue-100 text-blue-700',       icon: <Code2 className="w-3.5 h-3.5"/>,    actionKey: 'tasks.webAdmin.t0.action',       timeKey: 'tasks.time.4MinAgo',  status: 'pending_review' },
  { agentKey: 'ourTeam.activity.agent.webAdmin',       color: 'bg-blue-100 text-blue-700',       icon: <Code2 className="w-3.5 h-3.5"/>,    actionKey: 'tasks.webAdmin.t1.action',       timeKey: 'tasks.time.18MinAgo', status: 'auto_applied' },
  { agentKey: 'ourTeam.activity.agent.contentCreator', color: 'bg-emerald-100 text-emerald-700', icon: <PenTool className="w-3.5 h-3.5"/>, actionKey: 'tasks.contentCreator.t1.action', timeKey: 'tasks.time.1HrAgo',   status: 'pending_review' },
  { agentKey: 'ourTeam.activity.agent.webAdmin',       color: 'bg-blue-100 text-blue-700',       icon: <Code2 className="w-3.5 h-3.5"/>,    actionKey: 'tasks.webAdmin.t2.action',       timeKey: 'tasks.time.1HrAgo',   status: 'auto_applied' },
  { agentKey: 'ourTeam.activity.agent.contentCreator', color: 'bg-emerald-100 text-emerald-700', icon: <PenTool className="w-3.5 h-3.5"/>, actionKey: 'tasks.contentCreator.t2.action', timeKey: 'tasks.time.2HrAgo',   status: 'auto_applied' },
  { agentKey: 'ourTeam.activity.agent.webAdmin',       color: 'bg-blue-100 text-blue-700',       icon: <Code2 className="w-3.5 h-3.5"/>,    actionKey: 'tasks.webAdmin.t3.action',       timeKey: 'tasks.time.3HrAgo',   status: 'auto_applied' },
  { agentKey: 'ourTeam.activity.agent.webAdmin',       color: 'bg-blue-100 text-blue-700',       icon: <Code2 className="w-3.5 h-3.5"/>,    actionKey: 'tasks.webAdmin.t4.action',       timeKey: 'tasks.time.yesterday', status: 'auto_applied' },
];

// ─── Skill chip arrays ───────────────────────────────────────────────────────
const WA_SKILL_KEYS = [
  'ourTeam.cv.webAdmin.skill.0',
  'ourTeam.cv.webAdmin.skill.1',
  'ourTeam.cv.webAdmin.skill.2',
  'ourTeam.cv.webAdmin.skill.3',
  'ourTeam.cv.webAdmin.skill.4',
  'ourTeam.cv.webAdmin.skill.5',
];

const CC_SKILL_KEYS = [
  'ourTeam.cv.contentCreator.skill.0',
  'ourTeam.cv.contentCreator.skill.1',
  'ourTeam.cv.contentCreator.skill.2',
  'ourTeam.cv.contentCreator.skill.3',
  'ourTeam.cv.contentCreator.skill.4',
  'ourTeam.cv.contentCreator.skill.5',
];

// ─── Settings data ────────────────────────────────────────────────────────────
const NOTIFICATION_SETTINGS = [
  { labelKey: 'ourTeam.settings.notifications.0', enabled: true  },
  { labelKey: 'ourTeam.settings.notifications.1', enabled: true  },
  { labelKey: 'ourTeam.settings.notifications.2', enabled: false },
];

const AGENT_SETTINGS = [
  {
    headingKey: 'ourTeam.settings.webAdmin.heading',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    icon: <Code2 className="w-4 h-4" />,
    settings: [
      { labelKey: 'ourTeam.settings.webAdmin.toggle.0', enabled: true  },
      { labelKey: 'ourTeam.settings.webAdmin.toggle.1', enabled: true  },
      { labelKey: 'ourTeam.settings.webAdmin.toggle.2', enabled: true  },
      { labelKey: 'ourTeam.settings.webAdmin.toggle.3', enabled: true  },
      { labelKey: 'ourTeam.settings.webAdmin.toggle.4', enabled: false },
    ]
  },
  {
    headingKey: 'ourTeam.settings.contentCreator.heading',
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    icon: <PenTool className="w-4 h-4" />,
    settings: [
      { labelKey: 'ourTeam.settings.contentCreator.toggle.0', enabled: true  },
      { labelKey: 'ourTeam.settings.contentCreator.toggle.1', enabled: true  },
      { labelKey: 'ourTeam.settings.contentCreator.toggle.2', enabled: false },
      { labelKey: 'ourTeam.settings.contentCreator.toggle.3', enabled: false },
      { labelKey: 'ourTeam.settings.contentCreator.toggle.4', enabled: true  },
    ]
  }
];

export function OurTeamView({ autoUpdatesCount }: Props) {
  const t = useT();
  const [subTab, setSubTab] = useState<SubTab>('team');

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-700">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight text-black mb-1 flex items-center gap-3">
          <Bot className="w-7 h-7 text-indigo-500" /> {t('ourTeam.title')}
        </h1>
        <p className="text-slate-500 text-sm">{t('ourTeam.subtitle')}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title={t('ourTeam.stats.activeAgents')}      value={2}                     icon={<Activity      className="text-emerald-500 w-5 h-5" />} />
        <StatCard title={t('ourTeam.stats.autoUpdatesToday')}  value={autoUpdatesCount || 5} icon={<Globe         className="text-blue-500 w-5 h-5" />} />
        <StatCard title={t('ourTeam.stats.pendingReviews')}    value={2}                     icon={<AlertTriangle className="text-amber-500 w-5 h-5" />} />
        <StatCard title={t('ourTeam.stats.uptime')}            value="100%"                  icon={<ShieldCheck   className="text-indigo-500 w-5 h-5" />} />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['team', 'activity', 'settings'] as SubTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
              subTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab === 'team' ? t('ourTeam.tab.team') : tab === 'activity' ? t('ourTeam.tab.activity') : t('ourTeam.tab.settings')}
          </button>
        ))}
      </div>

      {/* ── TEAM TAB ──────────────────────────────────────────────────────── */}
      {subTab === 'team' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Web Admin CV */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-20"><BrainCircuit className="w-48 h-48" /></div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
                    <Code2 className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{t('ourTeam.cv.webAdmin.name')}</h2>
                    <p className="text-blue-100 font-medium text-lg">{t('ourTeam.cv.webAdmin.title')}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-blue-500/50 px-3 py-1 rounded-full text-xs font-bold border border-blue-400">{t('ourTeam.cv.webAdmin.tag.0')}</span>
                      <span className="bg-blue-500/50 px-3 py-1 rounded-full text-xs font-bold border border-blue-400">{t('ourTeam.cv.webAdmin.tag.1')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t('ourTeam.cv.objective')}</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">{t('ourTeam.cv.webAdmin.objective')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t('ourTeam.cv.webAdmin.skillsHeading')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {WA_SKILL_KEYS.map(k => (
                      <span key={k} className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">{t(k)}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Creator CV */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <div className="p-8 bg-gradient-to-br from-emerald-500 to-teal-700 text-white relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-20"><Zap className="w-56 h-56" /></div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
                    <PenTool className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{t('ourTeam.cv.contentCreator.name')}</h2>
                    <p className="text-emerald-100 font-medium text-lg">{t('ourTeam.cv.contentCreator.title')}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400">{t('ourTeam.cv.contentCreator.tag.0')}</span>
                      <span className="bg-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400">{t('ourTeam.cv.contentCreator.tag.1')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t('ourTeam.cv.objective')}</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">{t('ourTeam.cv.contentCreator.objective')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t('ourTeam.cv.contentCreator.skillsHeading')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {CC_SKILL_KEYS.map(k => (
                      <span key={k} className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">{t(k)}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-sm">
            <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">{t('ourTeam.cv.education.heading')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('ourTeam.cv.education.body')}</p>
          </div>
        </div>
      )}

      {/* ── ACTIVITY LOG TAB ──────────────────────────────────────────────── */}
      {subTab === 'activity' && (
        <div className="animate-in fade-in duration-500 space-y-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">{t('ourTeam.activity.heading')}</p>
          {ACTIVITY_LOG.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0", entry.color)}>
                {entry.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500">{t(entry.agentKey)}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t(entry.timeKey)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-snug">{t(entry.actionKey)}</p>
              </div>
              {entry.status === 'auto_applied' ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('ourTeam.activity.status.autoApplied')}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t('ourTeam.activity.status.needsReview')}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────────────────── */}
      {subTab === 'settings' && (
        <div className="animate-in fade-in duration-500 space-y-6 max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-sm">{t('ourTeam.settings.notifications.heading')}</h3>
            </div>
            {NOTIFICATION_SETTINGS.map((s, i) => (
              <ToggleRow key={i} label={t(s.labelKey)} enabled={s.enabled} />
            ))}
          </div>

          {AGENT_SETTINGS.map((ag, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className={cn("flex items-center gap-2 mb-2", ag.color)}>
                {ag.icon}
                <h3 className="font-bold text-slate-800 text-sm">{t(ag.headingKey)}</h3>
              </div>
              {ag.settings.map((s, j) => (
                <ToggleRow key={j} label={t(s.labelKey)} enabled={s.enabled} />
              ))}
            </div>
          ))}

          <div className="bg-white border border-red-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-red-700 text-sm">{t('ourTeam.settings.control.heading')}</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">{t('ourTeam.settings.control.title')}</p>
                <p className="text-xs text-slate-400">{t('ourTeam.settings.control.body')}</p>
              </div>
              <button className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                {t('ourTeam.settings.control.action')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="p-3 bg-blue-50 text-blue-500 rounded-xl shadow-inner border border-blue-100">{icon}</div>
    </div>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        onClick={() => setOn(v => !v)}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none",
          on ? "bg-blue-500" : "bg-slate-200"
        )}
      >
        <span className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          on ? "translate-x-5" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}
