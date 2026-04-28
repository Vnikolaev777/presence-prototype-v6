import { useState } from 'react';
import { CheckCircle, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

const DOMAIN_MAP: Record<string, string> = {
  'PowerSchool': 'powerschool.com', 'Infinite Campus': 'infinitecampus.com', 'Skyward': 'skyward.com',
  'FACTS SIS': 'factsmgt.com', 'Aeries SIS': 'aeries.com', 'Arbor': 'arbor-education.com',
  'Canvas': 'instructure.com', 'Google Classroom': 'classroom.google.com', 'Moodle': 'moodle.org',
  'Schoology': 'schoology.com', 'Brightspace': 'd2l.com', 'Blackboard': 'blackboard.com',
  'Microsoft 365': 'microsoft.com', 'Google Workspace': 'workspace.google.com', 'Wonde': 'wonde.com',
  'Okta': 'okta.com', 'Clever': 'clever.com', 'ClassLink': 'classlink.com',
  'Google Search': 'google.com', 'Bing Search': 'bing.com', 'Zoom': 'zoom.us',
  'Power BI': 'powerbi.microsoft.com', 'Zapier': 'zapier.com', 'WordPress': 'wordpress.org',
  'Drupal': 'drupal.org', 'Remind': 'remind.com', 'Seesaw': 'seesaw.me', 'ClassDojo': 'classdojo.com',
  'ParentSquare': 'parentsquare.com', 'Bloomz': 'bloomz.com', 'ClassTag': 'classtag.com',
  'Sdui': 'sdui.de', 'Klassly': 'klassroom.co', 'SchoolMessenger': 'schoolmessenger.com',
  'Azure AD / Entra': 'microsoft.com', 'SIMS': 'ess-sims.co.uk', 'Veracross': 'veracross.com',
  'iSAMS': 'isams.com', 'Google Analytics': 'analytics.google.com',
  'MS Teams Edu': 'microsoft.com', 'EBA': 'eba.gov.tr', 'WebUnits': 'webunits.com',
  'K12NET': 'k12net.com', 'Magister': 'magister.com', 'SomToday': 'somtoday.nl',
  'Librus': 'librus.pl', 'TalkingPoints': 'talkingpts.org', 'Sebit Vitamin': 'vitaminegitim.com',
};

const colors = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700', 'bg-fuchsia-100 text-fuchsia-700'
];

// Three connectors shown at the top as "already connected"
const CONNECTED = [
  { name: 'PowerSchool', domain: 'powerschool.com', desc: 'Student Information System' },
  { name: 'Google Analytics', domain: 'analytics.google.com', desc: 'Website Analytics' },
  { name: 'ClassDojo', domain: 'classdojo.com', desc: 'Parent & Student Engagement' },
];

// Remaining connectors, grouped into 3 categories
const CATEGORIES = [
  {
    label: 'Student Information & Learning',
    connectors: [
      'Infinite Campus', 'Skyward', 'FACTS SIS', 'Aeries SIS', 'Arbor',
      'WebUnits', 'K12NET', 'SIMS', 'Magister', 'SomToday', 'Librus', 'Veracross', 'iSAMS',
      'Canvas', 'Google Classroom', 'Moodle', 'Schoology', 'Brightspace', 'Blackboard',
      'MS Teams Edu', 'EBA', 'Sebit Vitamin', 'Seesaw',
    ],
  },
  {
    label: 'Communication & Engagement',
    connectors: [
      'ParentSquare', 'Remind', 'Bloomz', 'ClassTag', 'TalkingPoints',
      'Sdui', 'Klassly', 'SchoolMessenger',
    ],
  },
  {
    label: 'Productivity, Identity & Web',
    connectors: [
      'Clever', 'ClassLink', 'Microsoft 365', 'Google Workspace', 'Wonde', 'Okta',
      'Azure AD / Entra', 'Zoom', 'Google Search', 'Bing Search',
      'Power BI', 'Zapier', 'WordPress', 'Drupal',
    ],
  },
];

function ConnectorCard({ name, fallbackIndex, size = 'md' }: { name: string; fallbackIndex: number; size?: 'sm' | 'md' }) {
  const domain = DOMAIN_MAP[name];
  const color = colors[fallbackIndex % colors.length];
  const initial = name.charAt(0).toUpperCase();
  const iconSize = size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  const imgSize = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white hover:shadow-md border border-slate-200 rounded-xl transition-all group cursor-pointer text-center gap-3 overflow-hidden">
      <div className={cn(iconSize, "rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-black/5 group-hover:scale-110 transition-transform duration-300 overflow-hidden bg-white", !domain && color)}>
        {domain ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
            alt={name}
            className={cn(imgSize, "object-contain")}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = initial;
                e.currentTarget.parentElement.className = cn(iconSize, "rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-black/5 transition-transform duration-300", color);
              }
            }}
          />
        ) : initial}
      </div>
      <span className="text-sm font-medium text-slate-700 line-clamp-2 leading-tight">{name}</span>
    </div>
  );
}

// How many items fit in the first row at lg (6-col grid)
const FIRST_ROW = 6;

function CategorySection({ cat, ci }: { cat: typeof CATEGORIES[0]; ci: number }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cat.connectors : cat.connectors.slice(0, FIRST_ROW);
  const hasMore = cat.connectors.length > FIRST_ROW;

  return (
    <div key={cat.label}>
      <h3 className="text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-200">{cat.label}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {visible.map((name, i) => (
          <ConnectorCard key={name} name={name} fallbackIndex={ci * 10 + i} />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Show {cat.connectors.length - FIRST_ROW} more</>
          )}
        </button>
      )}
    </div>
  );
}

export function UtilitiesHubView() {
  return (
    <div className="max-w-6xl space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black mb-1">Integrations</h1>
          <p className="text-slate-500 text-sm">Manage your connected data sources and browse available integrations.</p>
        </div>
        <div className="text-xs text-blue-600 font-bold cursor-pointer hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shrink-0">
          + Request Custom Connector
        </div>
      </div>

      {/* Connected Section */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" /> Connected
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONNECTED.map((conn) => (
            <div key={conn.name} className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-emerald-100 overflow-hidden shrink-0">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${conn.domain}&sz=128`}
                  alt={conn.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-900">{conn.name}</p>
                <p className="text-sm text-emerald-700/60">{conn.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                  Live
                </div>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-emerald-600 opacity-0 group-hover:opacity-100 hover:bg-emerald-100 transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Connectors grouped by category */}
      <div className="space-y-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Available Connectors</h2>
        {CATEGORIES.map((cat, ci) => (
          <CategorySection key={cat.label} cat={cat} ci={ci} />
        ))}
      </div>
    </div>
  );
}
