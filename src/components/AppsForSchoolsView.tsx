import { Sparkles, ArrowRight } from 'lucide-react';

interface App {
  id: string;
  name: string;
  abbrev: string;
  description: string;
  iconBg: string;
  iconText?: string;
}

const APPS: App[] = [
  {
    id: 'grafari',
    name: 'Grafari',
    abbrev: 'Gr',
    description: 'Spelling and writing solution aligned with DE and CH curricula, for grades 1–3.',
    iconBg: 'bg-sky-400',
  },
  {
    id: 'orthograph',
    name: 'Orthograph',
    abbrev: 'Or',
    description: 'Inclusive vocabulary trainer for grades 3–5, based on a multi-sensory approach, validated by research.',
    iconBg: 'bg-slate-900',
  },
  {
    id: 'writing-lab',
    name: 'Writing Lab',
    abbrev: 'WL',
    description: 'Solution for storytelling and story-writing, suitable for grades 1–6.',
    iconBg: 'bg-blue-800',
  },
  {
    id: 'science-labs',
    name: 'Science Labs',
    abbrev: 'SL',
    description: 'Virtual experiments covering biology, chemistry, and physics.',
    iconBg: 'bg-emerald-500',
  },
  {
    id: 'software-it',
    name: 'Software & IT',
    abbrev: 'IT',
    description: 'Sandbox environments for technical skill-building.',
    iconBg: 'bg-amber-400',
  },
  {
    id: 'coding',
    name: 'Coding',
    abbrev: '</>',
    description: 'Programming environments with real-time feedback.',
    iconBg: 'bg-slate-900',
  },
];

export function AppsForSchoolsView() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-black mb-1">Recommended Apps</h1>
        <p className="text-slate-500 text-sm">Browse and manage applications available for your school.</p>
      </div>

      {/* AI Recommendation Banner — Calcularis */}
      <div className="relative rounded-2xl mb-8 border border-indigo-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
          {/* Copy */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">AI Recommendation</span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 mb-1">
              Spotted students who could benefit from more accessibility
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              We noticed recent math lessons where some students may need additional support. Based on their profiles, we recommend adding <span className="font-semibold text-slate-700">Calcularis</span> — an inclusive adaptive math solution validated by neuroscience research.
            </p>
          </div>

          {/* Calcularis preview card embedded in banner */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 md:w-80 md:flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm tracking-tight">Ca</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-slate-900 text-sm mb-0.5">Calcularis</div>
              <div className="text-xs text-slate-500 leading-snug">Adaptive math · Grades 1–3</div>
            </div>
            <button className="flex items-center gap-1 bg-indigo-600 text-white px-3.5 py-2 rounded-full text-xs font-bold hover:bg-indigo-500 transition-colors shadow-sm whitespace-nowrap">
              Add <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4">Other apps</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {APPS.map(app => (
          <div
            key={app.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl ${app.iconBg} flex items-center justify-center mx-auto mb-5 shadow-sm`}>
              <span className="text-white font-bold text-sm tracking-tight">{app.abbrev}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">{app.name}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{app.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
