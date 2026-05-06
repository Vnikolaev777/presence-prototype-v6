import { Code2, PenTool, CheckCircle, Clock, Zap, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import { useT } from '../lib/i18n';

type TaskEntry = {
  /** Translation key for the action description. */
  actionKey: string;
  /** Translation key for the timestamp label (shared across tasks where possible). */
  timeKey: string;
  status: 'pending_review' | 'auto_applied';
};

const WEB_ADMIN_TASKS: TaskEntry[] = [
  { actionKey: 'tasks.webAdmin.t0.action', timeKey: 'tasks.time.4MinAgo',  status: 'pending_review' },
  { actionKey: 'tasks.webAdmin.t1.action', timeKey: 'tasks.time.18MinAgo', status: 'auto_applied' },
  { actionKey: 'tasks.webAdmin.t2.action', timeKey: 'tasks.time.1HrAgo',   status: 'auto_applied' },
  { actionKey: 'tasks.webAdmin.t3.action', timeKey: 'tasks.time.3HrAgo',   status: 'auto_applied' },
  { actionKey: 'tasks.webAdmin.t4.action', timeKey: 'tasks.time.yesterday', status: 'auto_applied' },
];

const CONTENT_CREATOR_TASKS: TaskEntry[] = [
  { actionKey: 'tasks.contentCreator.t0.action', timeKey: 'tasks.time.2MinAgo',  status: 'pending_review' },
  { actionKey: 'tasks.contentCreator.t1.action', timeKey: 'tasks.time.1HrAgo',   status: 'pending_review' },
  { actionKey: 'tasks.contentCreator.t2.action', timeKey: 'tasks.time.2HrAgo',   status: 'auto_applied' },
  { actionKey: 'tasks.contentCreator.t3.action', timeKey: 'tasks.time.4HrAgo',   status: 'auto_applied' },
  { actionKey: 'tasks.contentCreator.t4.action', timeKey: 'tasks.time.yesterday', status: 'auto_applied' },
];

function AgentSection({ title, role, tasks, gradient, iconBg, icon, bgDecor }: {
  title: string;
  role: string;
  tasks: TaskEntry[];
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
  bgDecor: React.ReactNode;
}) {
  const t = useT();
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> {t('tasks.section.active')}
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
              <p className="text-sm text-slate-700">{t(entry.actionKey)}</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />{t(entry.timeKey)}
              </p>
            </div>
            {entry.status === 'auto_applied' ? (
              <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1', 'text-emerald-600 bg-emerald-50 border border-emerald-200')}>
                <CheckCircle className="w-3 h-3" /> {t('tasks.status.done')}
              </span>
            ) : (
              <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1', 'text-amber-600 bg-amber-50 border border-amber-200')}>
                <Clock className="w-3 h-3" /> {t('tasks.status.review')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksView() {
  const t = useT();
  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-light tracking-tight text-black mb-1">{t('tasks.title')}</h1>
        <p className="text-slate-500 text-sm">{t('tasks.subtitle')}</p>
      </div>

      <AgentSection
        title={t('tasks.webAdmin.title')}
        role={t('tasks.webAdmin.role')}
        tasks={WEB_ADMIN_TASKS}
        gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
        iconBg="bg-blue-100 text-blue-700"
        icon={<Code2 className="w-3.5 h-3.5" />}
        bgDecor={<BrainCircuit className="w-36 h-36" />}
      />

      <AgentSection
        title={t('tasks.contentCreator.title')}
        role={t('tasks.contentCreator.role')}
        tasks={CONTENT_CREATOR_TASKS}
        gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
        iconBg="bg-emerald-100 text-emerald-700"
        icon={<PenTool className="w-3.5 h-3.5" />}
        bgDecor={<Zap className="w-36 h-36" />}
      />

    </div>
  );
}
