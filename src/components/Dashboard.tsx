import { useState } from 'react';
import { Bot, CheckCircle, Clock, Zap, Database, BarChart2, FileText, Link2, ShieldCheck, Users, Rss, ExternalLink, CalendarDays } from 'lucide-react';
import type { AiAction } from '../data/mockData';
import { AiReviewModal } from './AiReviewModal';
import { AutoUpdatePreviewModal } from './AutoUpdatePreviewModal';
import { cn } from '../lib/utils';

// ─── Auto-update feed data ──────────────────────────────────────────────────
// Realistic items driven by the 3 connected systems + the two web agents

type AutoUpdate = {
  id: string;
  source: string;
  sourceDomain?: string;
  sourceDomains?: string[]; // when multiple sources contributed (e.g. SIS + LMS)
  title: string;
  detail: string;
  time: string;
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
  title: 'Vacation Schedule & Holiday Programs Published',
  detail: 'Spring Break (Apr 13–17) added to the Calendar. New Holiday Programs hub with lesson and club schedules during the break is live.',
  time: 'Just now',
  icon: <CalendarDays className="w-3.5 h-3.5" />,
  iconBg: 'bg-amber-100 text-amber-600',
};

const AUTO_UPDATES: AutoUpdate[] = [
  {
    id: 'au_0',
    source: 'PowerSchool',
    sourceDomain: 'powerschool.com',
    title: 'New Teacher Profile Published',
    detail: 'Mr. James Holloway joined as 10th Grade History teacher. Profile page created and added to the Faculty Directory.',
    time: 'Just now',
    icon: <Users className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'au_1',
    source: 'PowerSchool',
    sourceDomain: 'powerschool.com',
    title: 'Faculty Directory Updated',
    detail: 'Ms. Emily Chen added as AP Biology teacher. Faculty page updated and re-indexed automatically.',
    time: '2 min ago',
    icon: <Users className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'au_2',
    source: 'Google Analytics',
    sourceDomain: 'analytics.google.com',
    title: 'Athletics Page SEO Improved',
    detail: 'Low search visibility detected for the Athletics schedule. Meta titles & descriptions auto-updated.',
    time: '19 min ago',
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'au_3',
    source: 'Google Workspace',
    sourceDomain: 'workspace.google.com',
    title: 'Parent Handbook 2026 Published',
    detail: "New PDF detected in Principal's Drive. Old version replaced on the Resources page.",
    time: '41 min ago',
    icon: <FileText className="w-3.5 h-3.5" />,
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'au_4',
    source: 'PowerSchool',
    sourceDomain: 'powerschool.com',
    title: 'Class Schedule Synced',
    detail: 'Mr. Davis assigned to Advanced Calculus (Period 3). Academic Calendar page updated.',
    time: '1 hr ago',
    icon: <Database className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'au_5',
    source: 'Web Admin Agent',
    title: 'Broken Links Repaired',
    detail: '3 broken navigation links detected and fixed across the Events and Contact pages.',
    time: '3 hrs ago',
    icon: <Link2 className="w-3.5 h-3.5" />,
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'au_6',
    source: 'ClassDojo',
    sourceDomain: 'classdojo.com',
    title: 'Engagement Digest Synced',
    detail: 'Weekly parent engagement stats published. 94% read rate on last newsletter.',
    time: '5 hrs ago',
    icon: <Rss className="w-3.5 h-3.5" />,
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'au_7',
    source: 'Google Analytics',
    sourceDomain: 'analytics.google.com',
    title: 'Lunch Menu Page Boosted',
    detail: 'Traffic spike detected (+180%) from parent searches. Quick-link widget added to homepage.',
    time: 'Yesterday',
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'au_8',
    source: 'Web Crawler α',
    title: 'Accessibility Scan Passed',
    detail: 'Full site scan completed — 0 WCAG violations found. Report saved to Knowledge Model.',
    time: 'Yesterday',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'au_9',
    source: 'PowerSchool',
    sourceDomain: 'powerschool.com',
    title: 'Enrollment Numbers Updated',
    detail: 'Q2 enrollment data synced. "About Our School" page stats refreshed automatically.',
    time: '2 days ago',
    icon: <Users className="w-3.5 h-3.5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
];

// ─── Auto-update row component ──────────────────────────────────────────────
function AutoUpdateRow({ item, onView }: { item: AutoUpdate; onView?: () => void }) {
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
            {item.sourceDomain ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${item.sourceDomain}&sz=64`}
                alt={item.source}
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
          <p className="text-sm font-semibold text-slate-800 leading-tight">{item.title}</p>
          <span className="text-xs text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">{item.time}</span>
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">{item.detail}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-slate-400 font-medium">{item.source}</span>
          {onView && (
            <button onClick={onView} className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
              View <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export function Dashboard({ hasHiredAgents, hasMonitoringSetup, hasAutoUpdatesSetup, onNavigate }: any) {
  const [selectedAction, setSelectedAction] = useState<AiAction | null>(null);
  const [removedActions, setRemovedActions] = useState<string[]>([]);
  const [previewVariant, setPreviewVariant] = useState<'teacher' | 'vacation' | null>(null);

  // When the auto-updates scenario has been completed, add the vacation
  // schedule + holiday programs item at the top of the feed.
  const autoUpdates = hasAutoUpdatesSetup
    ? [VACATION_UPDATE, ...AUTO_UPDATES]
    : AUTO_UPDATES;

  const CC_ACTION: AiAction = {
    id: 'cc_dash_1',
    isInternal: false,
    timestamp: 'Just now',
    title: 'Publish: State Science Fair Results',
    summary: "I found Oakwood students listed as participants in the State Science Fair via PowerSchool, then cross-referenced with a Springfield Tribune article confirming 3 gold medals. The official results on sciencefair.state.gov matched — I connected all three and drafted a blog post.",
    proposedChanges: [
      "Create new Blog Post: 'Oakwood Excels at State Science Fair'",
      "Publish to Homepage Feed",
      "Send notification email to Parents"
    ],
    requiresUserInput: false,
    previewType: 'science_fair_blog',
    status: 'pending',
    source: 'PowerSchool',
    sourceType: 'sis',
    confidence: 0.95,
    sources: [
      {
        website: 'PowerSchool',
        url: 'https://powerschool.com',
        detail: 'Found 4 Oakwood students registered as Science Fair participants',
      },
      {
        website: 'Springfield Tribune',
        url: 'https://springfieldtribune.com',
        detail: 'Article: "Local Students Sweep Regional Science Fair" — 3 gold medals confirmed',
      },
      {
        website: 'State Science Fair',
        url: 'https://sciencefair.state.gov',
        detail: 'Official results page — Oakwood listed in top 3 schools statewide',
      },
    ],
  };

  const WA_ACTION: AiAction = {
    id: 'wa_dash_1',
    isInternal: false,
    timestamp: '1m ago',
    title: 'ADA Compliance Update Required',
    summary: "The U.S. Department of Justice finalized new ADA Title II rules requiring public school websites to meet WCAG 2.1 AA standards by April 2026. I've identified 4 pages on your site that need updates to stay compliant.",
    proposedChanges: [
      "Add alt text to 12 images missing descriptions on the Athletics and Events pages.",
      "Increase color contrast ratio on the navigation menu to meet 4.5:1 minimum.",
      "Add keyboard focus indicators to all interactive elements.",
      "Update contact form with proper ARIA labels for screen reader support."
    ],
    requiresUserInput: false,
    previewType: 'ada_compliance',
    status: 'pending',
    source: 'Web Admin Agent',
    sourceType: 'district',
    sourceUrl: 'https://www.ada.gov/resources/web-guidance/',
    sourceWebsite: 'ADA.gov',
    confidence: 0.97
  };

  const isCCPending = !removedActions.includes(CC_ACTION.id);
  const isWAPending = !removedActions.includes(WA_ACTION.id);
  const pendingCount = [isCCPending, isWAPending].filter(Boolean).length;

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-light tracking-tight text-black">Automations</h1>
          <button
            onClick={() => onNavigate?.('workspace')}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
          >
            <Zap className="w-4 h-4 text-indigo-500" />
            Add more automations
          </button>
        </div>
        <p className="text-slate-500 text-sm mt-1">AI-driven updates to your school website — review proposals or see what was already handled.</p>

        {/* Status bar — only once agents are hired and content is live */}
        {hasHiredAgents && (
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-200 flex-wrap">

            {/* Live */}
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-emerald-700">Connected</span>
              <span className="text-slate-400 text-xs">oakwoodhigh.org</span>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Last sync */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last sync <span className="font-semibold text-slate-700">2 min ago</span></span>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Time saved — with hover tooltip */}
            <div className="relative group flex items-center gap-1.5 text-sm text-slate-500 cursor-default">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                <span className="font-semibold text-slate-700 underline underline-offset-2 decoration-dashed decoration-slate-300">6.5 hrs</span> saved this week
              </span>

              {/* Tooltip — appears below */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-slate-900 text-white text-xs rounded-xl shadow-xl p-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                {/* Arrow */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                <p className="font-bold text-white mb-2.5">How we calculate this</p>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Updates auto-handled</span>
                    <span className="font-semibold text-white">10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. time per update</span>
                    <span className="font-semibold text-white">~39 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total time saved</span>
                    <span className="font-semibold text-indigo-300">6.5 hrs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Auto-handled */}
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              <span><span className="font-semibold text-slate-700">10 updates</span> auto-handled</span>
            </div>

          </div>
        )}
      </div>

      {/* Two-column grid — columns appear progressively as scenarios complete */}
      {!hasHiredAgents ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-16 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
          <Bot className="w-10 h-10 opacity-30" />
          <p className="font-medium text-sm">Nothing here yet.</p>
          <p className="text-xs leading-relaxed max-w-xs">Complete the setup in Presence Assistant to start seeing automated updates here.</p>
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
            <h2 className="text-sm font-bold text-slate-700">Needs Your Review</h2>
            {hasMonitoringSetup && pendingCount > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>

          {/* Column body */}
          {hasMonitoringSetup ? (
            <div className="space-y-3">
              {isCCPending && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">New post: Celebrate our Science Fair winners</h3>
                    <p className="text-sm text-slate-600 mt-1">"{CC_ACTION.summary}"</p>
                    <button
                      onClick={() => setSelectedAction(CC_ACTION)}
                      className="mt-3 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Review Draft
                    </button>
                  </div>
                </div>
              )}

              {isWAPending && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Your site needs updates to meet new ADA standards</h3>
                    <p className="text-sm text-slate-600 mt-1">"{WA_ACTION.summary}"</p>
                    <button
                      onClick={() => setSelectedAction(WA_ACTION)}
                      className="mt-3 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Review ADA Updates
                    </button>
                  </div>
                </div>
              )}

              {(!isCCPending && !isWAPending) && (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs">No pending suggestions from your agents.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center text-slate-400 space-y-2 flex flex-col items-center justify-center min-h-[180px]">
              <Clock className="w-8 h-8 opacity-25" />
              <p className="text-sm font-medium">No review requests yet.</p>
              <p className="text-xs leading-relaxed max-w-xs">Set up internet monitoring in Presence Assistant to receive proposals that need your approval.</p>
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
            <h2 className="text-sm font-bold text-slate-700">Automatic Updates</h2>
            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live
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
                Handled automatically by your connected systems
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
              <p className="text-xs text-slate-400">{autoUpdates.length} updates this week</p>
              <button className="text-xs font-semibold text-blue-600 hover:underline">View full history →</button>
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
