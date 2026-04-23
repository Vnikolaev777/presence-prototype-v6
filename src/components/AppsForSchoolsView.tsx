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
        <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-1">Apps for Schools</h1>
        <p className="text-slate-500 text-sm">Browse and manage applications available for your school.</p>
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
