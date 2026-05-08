// ─────────────────────────────────────────────────────────────────────────────
// Recommended Apps — placeholder preview.
// Layout structure is in place; real content (title, banner copy, app list,
// CTAs, icons) will be filled in later. All visible text/imagery is rendered
// as neutral grey skeleton blocks for now.
// ─────────────────────────────────────────────────────────────────────────────

const APP_PLACEHOLDERS = Array.from({ length: 6 });

export function AppsForSchoolsView() {
  return (
    <div>
      {/* Page header — title + subtitle skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-8 w-72 rounded-md bg-slate-200" />
        <div className="h-3.5 w-96 rounded bg-slate-100" />
      </div>

      {/* AI Recommendation banner skeleton */}
      <div className="relative rounded-2xl mb-8 border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Left: insight copy */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Eyebrow tag */}
            <div className="h-3 w-32 rounded bg-slate-100" />
            {/* Headline */}
            <div className="h-5 w-4/5 rounded bg-slate-200" />
            {/* Body lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-11/12 rounded bg-slate-100" />
              <div className="h-3 w-3/4 rounded bg-slate-100" />
            </div>
            {/* Badge pills */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <div className="h-6 w-44 rounded-full bg-slate-100 border border-slate-200" />
              <div className="h-6 w-32 rounded-full bg-slate-100 border border-slate-200" />
              <div className="h-6 w-36 rounded-full bg-slate-100 border border-slate-200" />
            </div>
          </div>

          {/* Right: featured app preview card */}
          <div className="lg:w-96 lg:flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              {/* App icon */}
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2 pt-1">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-44 rounded bg-slate-100" />
              </div>
            </div>

            {/* Tagline lines */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-5/6 rounded bg-slate-100" />
            </div>

            {/* CTA button */}
            <div className="h-9 w-full rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </div>
      </div>

      {/* "Other apps" subheading */}
      <div className="h-5 w-32 rounded bg-slate-200 mb-4" />

      {/* Apps grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {APP_PLACEHOLDERS.map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-slate-200 mb-5" />
            {/* Name */}
            <div className="h-4 w-24 rounded bg-slate-200 mb-3" />
            {/* Description lines */}
            <div className="w-full space-y-2">
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-5/6 rounded bg-slate-100 mx-auto" />
              <div className="h-3 w-2/3 rounded bg-slate-100 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
