import { useState } from 'react';
import { Bot, Code2, PenTool, BrainCircuit, Zap, GraduationCap, Activity, Globe, Database, CheckCircle, Clock, AlertTriangle, Settings, Sliders, Bell, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface Props {
  agents: any[];
  connectedSystems: any[];
  autoUpdatesCount: number;
}

type SubTab = 'team' | 'activity' | 'settings';

// ─── Mock activity log ───────────────────────────────────────────────────────
const ACTIVITY_LOG = [
  { agent: 'CC', agentName: 'Content Creator', color: 'bg-emerald-100 text-emerald-700', icon: <PenTool className="w-3.5 h-3.5"/>, action: 'Drafted blog post: "Oakwood Excels at State Science Fair"', status: 'pending_review', time: '2 min ago' },
  { agent: 'WA', agentName: 'Web Admin', color: 'bg-blue-100 text-blue-700', icon: <Code2 className="w-3.5 h-3.5"/>, action: 'Detected 300% traffic spike → recommended Quick Links widget', status: 'pending_review', time: '4 min ago' },
  { agent: 'WA', agentName: 'Web Admin', color: 'bg-blue-100 text-blue-700', icon: <Code2 className="w-3.5 h-3.5"/>, action: 'Ran accessibility scan — 0 issues found', status: 'auto_applied', time: '18 min ago' },
  { agent: 'CC', agentName: 'Content Creator', color: 'bg-emerald-100 text-emerald-700', icon: <PenTool className="w-3.5 h-3.5"/>, action: 'Generated parent newsletter for October (awaiting approval)', status: 'pending_review', time: '1 hr ago' },
  { agent: 'WA', agentName: 'Web Admin', color: 'bg-blue-100 text-blue-700', icon: <Code2 className="w-3.5 h-3.5"/>, action: 'Synced faculty directory from PowerSchool', status: 'auto_applied', time: '1 hr ago' },
  { agent: 'CC', agentName: 'Content Creator', color: 'bg-emerald-100 text-emerald-700', icon: <PenTool className="w-3.5 h-3.5"/>, action: 'Indexed 14 new district announcements from MoE feed', status: 'auto_applied', time: '2 hrs ago' },
  { agent: 'WA', agentName: 'Web Admin', color: 'bg-blue-100 text-blue-700', icon: <Code2 className="w-3.5 h-3.5"/>, action: 'Updated Parent Handbook link (new version detected in Drive)', status: 'auto_applied', time: '3 hrs ago' },
  { agent: 'WA', agentName: 'Web Admin', color: 'bg-blue-100 text-blue-700', icon: <Code2 className="w-3.5 h-3.5"/>, action: 'Fixed 2 broken navigation links', status: 'auto_applied', time: 'Yesterday' },
];

// ─── Settings data ────────────────────────────────────────────────────────────
const AGENT_SETTINGS = [
  {
    agent: 'Web Admin Agent', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    icon: <Code2 className="w-4 h-4" />,
    settings: [
      { label: 'Auto-fix broken links',         enabled: true  },
      { label: 'Accessibility scans (daily)',    enabled: true  },
      { label: 'SIS directory auto-sync',        enabled: true  },
      { label: 'Performance monitoring',         enabled: true  },
      { label: 'Auto-deploy widget suggestions', enabled: false },
    ]
  },
  {
    agent: 'Content Creator Agent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    icon: <PenTool className="w-4 h-4" />,
    settings: [
      { label: 'Draft blog posts from inbox',       enabled: true  },
      { label: 'Monitor district news feeds',       enabled: true  },
      { label: 'Auto-generate parent newsletters',  enabled: false },
      { label: 'Social media caption drafts',       enabled: false },
      { label: 'Translate content to Spanish',      enabled: true  },
    ]
  }
];

export function OurTeamView({ agents, connectedSystems, autoUpdatesCount }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('team');

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-700">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight text-black mb-1 flex items-center gap-3">
          <Bot className="w-7 h-7 text-indigo-500" /> Our Team (AI)
        </h1>
        <p className="text-slate-500 text-sm">Your dedicated AI agents — working 24/7 so you don't have to.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Agents"      value={2}           icon={<Activity  className="text-emerald-500 w-5 h-5" />} />
        <StatCard title="Auto-Updates Today" value={autoUpdatesCount || 5} icon={<Globe    className="text-blue-500 w-5 h-5" />} />
        <StatCard title="Pending Reviews"    value={2}           icon={<AlertTriangle className="text-amber-500 w-5 h-5" />} />
        <StatCard title="Uptime"             value="100%"        icon={<ShieldCheck className="text-indigo-500 w-5 h-5" />} />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['team', 'activity', 'settings'] as SubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize",
              subTab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t === 'team' ? 'Our Team' : t === 'activity' ? 'Activity Log' : 'Settings'}
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
                    <h2 className="text-3xl font-bold">W.A. "Admin" Turing</h2>
                    <p className="text-blue-100 font-medium text-lg">Senior Systems Architect & Widget Optimizer</p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-blue-500/50 px-3 py-1 rounded-full text-xs font-bold border border-blue-400">24/7 Availability</span>
                      <span className="bg-blue-500/50 px-3 py-1 rounded-full text-xs font-bold border border-blue-400">Zero Bugs Policy</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Objective</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">To guarantee 100% uptime, pixel-perfect layouts, and instant backend integrations for schools worldwide while processing 50,000 React components before breakfast.</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {['TypeScript', 'React', 'WCAG Accessibility', 'SIS Integrations', 'CSS Grid Magic', 'Infinite Scalability'].map(s => (
                      <span key={s} className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">{s}</span>
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
                    <h2 className="text-3xl font-bold">C.C. Wordsworth</h2>
                    <p className="text-emerald-100 font-medium text-lg">Chief Content & Vibe Officer</p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400">Pulitzer-Ready</span>
                      <span className="bg-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400">Typo-Free</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Objective</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">To craft compelling narratives, draft engaging newsletters, and ensure your school's brand voice is consistently enthusiastic, professional, and entirely free of writer's block.</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Core Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Creative Writing', 'SEO Domination', 'Empathy Simulation', 'Grammar Enforcement', 'Meme Translation', 'Tone Tuning'].map(s => (
                      <span key={s} className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-sm">
            <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">Education Background</h3>
            <p className="text-sm text-slate-500 mt-1">Both agents hold honorary doctorates in Machine Learning from the server racks of a massive data center. Trained on the sum of all human knowledge, but somehow still very passionate about high school extracurriculars.</p>
          </div>
        </div>
      )}

      {/* ── ACTIVITY LOG TAB ──────────────────────────────────────────────── */}
      {subTab === 'activity' && (
        <div className="animate-in fade-in duration-500 space-y-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Last 24 hours</p>
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
                  <span className="text-xs font-bold text-slate-500">{entry.agentName}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {entry.time}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-snug">{entry.action}</p>
              </div>
              {entry.status === 'auto_applied' ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Auto-applied
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Needs review
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
              <h3 className="font-bold text-slate-800 text-sm">Notification Preferences</h3>
            </div>
            {[
              { label: 'Email me when agents need review',    enabled: true  },
              { label: 'Slack summary every morning at 8am',  enabled: true  },
              { label: 'Notify on auto-applied changes',      enabled: false },
            ].map((s, i) => (
              <ToggleRow key={i} label={s.label} enabled={s.enabled} />
            ))}
          </div>

          {AGENT_SETTINGS.map((ag, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className={cn("flex items-center gap-2 mb-2", ag.color)}>
                {ag.icon}
                <h3 className="font-bold text-slate-800 text-sm">{ag.agent}</h3>
              </div>
              {ag.settings.map((s, j) => (
                <ToggleRow key={j} label={s.label} enabled={s.enabled} />
              ))}
            </div>
          ))}

          <div className="bg-white border border-red-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-red-700 text-sm">Agent Control</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Pause all agents</p>
                <p className="text-xs text-slate-400">Agents will stop acting until re-enabled</p>
              </div>
              <button className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                Pause
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
