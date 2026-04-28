import { Code2, PenTool, CheckCircle, Clock, Zap, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';

const WEB_ADMIN_TASKS = [
  { action: 'Detected 300% traffic spike → recommended Quick Links widget', status: 'pending_review', time: '4 min ago' },
  { action: 'Ran accessibility scan — 0 issues found', status: 'auto_applied', time: '18 min ago' },
  { action: 'Synced faculty directory from PowerSchool', status: 'auto_applied', time: '1 hr ago' },
  { action: 'Updated Parent Handbook link (new version detected in Drive)', status: 'auto_applied', time: '3 hrs ago' },
  { action: 'Fixed 2 broken navigation links', status: 'auto_applied', time: 'Yesterday' },
];

const CONTENT_CREATOR_TASKS = [
  { action: 'Drafted blog post: "Oakwood Excels at State Science Fair"', status: 'pending_review', time: '2 min ago' },
  { action: 'Generated parent newsletter for October (awaiting approval)', status: 'pending_review', time: '1 hr ago' },
  { action: 'Indexed 14 new district announcements from MoE feed', status: 'auto_applied', time: '2 hrs ago' },
  { action: 'Drafted blog post: "Join the Statewide Math Olympiad!"', status: 'auto_applied', time: '4 hrs ago' },
  { action: 'Summarized 12 parent emails into FAQ draft', status: 'auto_applied', time: 'Yesterday' },
];

function AgentSection({ title, role, tasks, gradient, iconBg, icon, bgDecor }: {
  title: string;
  role: string;
  tasks: { action: string; status: string; time: string }[];
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
  bgDecor: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className={cn('rounded-2xl p-5 text-white relative overflow-hidden', gradient)}>
        <div className="absolute -bottom-6 -right-6 opacity-10">{bgDecor}</div>
        <div className="flex items-center gap-4 relative z-10">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border border-white/20', iconBg)}>
            {icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold leading-tight">{title}</h2>
            <p className="text-white/70 text-xs mt-0.5">{role}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Active
          </div>
        </div>
      </div>

      {/* Task feed */}
      <div className="space-y-2">
        {tasks.map((entry, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', iconBg)}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">{entry.action}</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />{entry.time}
              </p>
            </div>
            {entry.status === 'auto_applied' ? (
              <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1', 'text-emerald-600 bg-emerald-50 border border-emerald-200')}>
                <CheckCircle className="w-3 h-3" /> Done
              </span>
            ) : (
              <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1', 'text-amber-600 bg-amber-50 border border-amber-200')}>
                <Clock className="w-3 h-3" /> Review
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksView() {
  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-light tracking-tight text-black mb-1">Tasks</h1>
        <p className="text-slate-500 text-sm">Recent activity across all your AI agents.</p>
      </div>

      <AgentSection
        title="Web Admin Agent"
        role="SysOps · Always On"
        tasks={WEB_ADMIN_TASKS}
        gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
        iconBg="bg-blue-100 text-blue-700"
        icon={<Code2 className="w-3.5 h-3.5" />}
        bgDecor={<BrainCircuit className="w-36 h-36" />}
      />

      <AgentSection
        title="Content Creator Agent"
        role="Copywriting · Automated"
        tasks={CONTENT_CREATOR_TASKS}
        gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
        iconBg="bg-emerald-100 text-emerald-700"
        icon={<PenTool className="w-3.5 h-3.5" />}
        bgDecor={<Zap className="w-36 h-36" />}
      />

    </div>
  );
}
