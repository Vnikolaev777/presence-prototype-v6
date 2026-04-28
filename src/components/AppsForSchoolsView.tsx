import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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
      <div className="relative rounded-2xl mb-8 border border-red-200 bg-white overflow-hidden">
        {/* Subtle Calcularis-red accent wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-white pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row gap-6 p-6">
          {/* Left: AI insight + recommendation copy */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">AI Recommendation</span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 mb-1.5">
              Spotted students who could benefit from more accessibility
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              Recent math lessons show learners struggling with arithmetic fluency and showing signs of math anxiety. We recommend <span className="font-semibold text-slate-700">Calcularis</span> — an adaptive, multi-sensory math training proven to support every child from kindergarten to 4th grade, including those with dyscalculia.
            </p>

            {/* Trust / scientific badges */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Backed by neuroscience research
              </span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                15 years of AI research
              </span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                10+ peer-reviewed studies
              </span>
            </div>
          </div>

          {/* Right: Calcularis-branded preview card */}
          <div className="lg:w-96 lg:flex-shrink-0 bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/30">
                <span className="text-white font-bold text-sm tracking-tight">Ca</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-slate-900 text-base leading-tight">Calcularis</div>
                <div className="text-xs text-slate-500 leading-snug mt-0.5">Adaptive math · Kindergarten – Grade 4</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
              "Help every child from kindergarten to 4th grade excel in math with our proven online training program."
            </p>

            {/* Stat strip — pulled from constructor.tech */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-red-50 border border-red-100 rounded-lg px-2 py-2 text-center">
                <div className="text-base font-extrabold text-red-600 leading-none">25%</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-1">less math anxiety</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg px-2 py-2 text-center">
                <div className="text-base font-extrabold text-red-600 leading-none">45%</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-1">more correct answers</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg px-2 py-2 text-center">
                <div className="text-base font-extrabold text-red-600 leading-none">100k+</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-1">parents trust it</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white px-4 py-2.5 rounded-full text-xs font-bold hover:bg-red-600 transition-colors shadow-sm whitespace-nowrap">
                Add Calcularis <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="https://constructor.tech/products/learning/practice/calcularis/schools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2.5 whitespace-nowrap"
              >
                Learn more
              </a>
            </div>
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
