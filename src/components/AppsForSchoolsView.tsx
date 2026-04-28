import { Sparkles, ArrowRight, Accessibility } from 'lucide-react';

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
    id: 'calcularis',
    name: 'Calcularis',
    abbrev: 'Ca',
    description: 'Inclusive adaptive math solution for grades 1–3, validated by solid neuroscience research.',
    iconBg: 'bg-red-500',
  },
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

      {/* Personalized Accessibility Apps Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,_rgba(255,255,255,0.18)_0%,_transparent_55%)] pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">New · AI Recommendation</span>
              </div>
              <h2 className="text-lg font-extrabold tracking-tight mb-0.5">Personalized Accessibility Apps</h2>
              <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
                Tailored learning tools for students with dyslexia, dyscalculia, and visual or motor needs — adapted to each learner's profile.
              </p>
            </div>
          </div>

          <button className="self-start md:self-center flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors shadow-md whitespace-nowrap">
            Explore <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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
