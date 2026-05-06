/**
 * AuditPreviews.tsx
 * ─────────────────
 * Standalone, self-contained copies of the audit UI pieces.
 * Safe to edit here — originals in AiWorkspaceView.tsx are untouched.
 *
 * V1 exports (original, simple):
 *   AuditGauge, AuditChatCard, PostAuditChatCard, AuditCanvas, PostAuditCanvas
 *
 * V2 exports (redesigned, Lighthouse-style):
 *   AuditChatCardV2, PostAuditChatCardV2, AuditCanvasV2, PostAuditCanvasV2
 *
 *   AuditPreviewPage — dev showcase for both versions
 */

import { AlertCircle, CheckCircle, Zap, Eye, Search, ShieldCheck, FileText, Lock, Monitor, Save, Share2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Score color helpers ─────────────────────────────────────────────────────
function scoreColor(n: number) {
  if (n >= 70) return { text: 'text-emerald-600', bar: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', hex: '#10b981' };
  if (n >= 50) return { text: 'text-orange-500', bar: 'bg-orange-400', bg: 'bg-orange-50', border: 'border-orange-200', hex: '#f97316' };
  return { text: 'text-red-500', bar: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200', hex: '#ef4444' };
}

// ─── Category row (used in V2 canvas) ────────────────────────────────────────
function CategoryRow({ icon, label, score, prevScore, detail }: {
  icon: React.ReactNode; label: string; score: number; prevScore?: number; detail?: string;
}) {
  const c = scoreColor(score);
  const delta = prevScore !== undefined ? score - prevScore : undefined;
  const cp = prevScore !== undefined ? scoreColor(prevScore) : null;

  if (prevScore !== undefined && cp) {
    // Single bar with tick mark at previous score
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 shrink-0">{icon}</span>
          <span className="text-[13px] font-bold text-slate-800 flex-1">{label}</span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+{delta}</span>
        </div>
        {/* bar with room above for the tick label */}
        <div className="ml-5 flex items-center gap-3" style={{ paddingTop: '14px' }}>
          <div className="flex-1 relative">
            {/* track */}
            <div className="h-2 bg-slate-100 rounded-full relative overflow-visible">
              {/* green fill */}
              <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full" style={{ width: `${score}%` }} />
              {/* tick at previous score */}
              <div
                className="absolute w-0.5 bg-slate-500 rounded-sm"
                style={{ left: `${prevScore}%`, transform: 'translateX(-50%)', top: '-4px', bottom: '-4px' }}
              >
                <span
                  className="absolute text-[9px] text-slate-600 font-semibold tabular-nums whitespace-nowrap"
                  style={{ bottom: '100%', marginBottom: '3px', left: '50%', transform: 'translateX(-50%)' }}
                >
                  {prevScore}
                </span>
              </div>
            </div>
          </div>
          <span className="text-sm font-bold text-emerald-600 tabular-nums w-6 text-right">{score}</span>
        </div>
        {detail && <p className="text-[10px] text-slate-500 ml-5 mt-1 leading-tight">{detail}</p>}
      </div>
    );
  }

  // Single-bar layout (used in before-audit canvas)
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-slate-700 flex-1">{label}</span>
        <span className={cn('text-sm font-extrabold tabular-nums', c.text)}>{score}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-5">
        <div className={cn('h-full rounded-full', c.bar)} style={{ width: `${score}%` }} />
      </div>
      {detail && <p className="text-[10px] text-slate-400 ml-5 leading-tight">{detail}</p>}
    </div>
  );
}

// ─── Compliance row (used in V2 canvas) ──────────────────────────────────────
type ComplianceStatus = 'compliant' | 'partial' | 'at-risk' | 'non-compliant';
function ComplianceRow({ law, sub, status }: { law: string; sub: string; status: ComplianceStatus }) {
  const s: Record<ComplianceStatus, { bg: string; border: string; text: string; label: string }> = {
    'compliant':     { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'compliant' },
    'partial':       { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-600',  label: 'partial' },
    'at-risk':       { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-500',     label: 'at risk' },
    'non-compliant': { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-500',     label: 'non-compliant' },
  };
  const st = s[status];
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-t border-slate-100 first:border-t-0">
      <div className="min-w-0">
        <p className="text-[11px] text-slate-700 font-semibold truncate">{law}</p>
        <p className="text-[10px] text-slate-400 truncate">{sub}</p>
      </div>
      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0', st.bg, st.border, st.text)}>
        {st.label}
      </span>
    </div>
  );
}

// ─── Shared circular gauge ──────────────────────────────────────────────────
export function AuditGauge({
  score,
  maxScore,
  size = 120,
  strokeWidth = 12,
  color = '#ef4444',
}: {
  score: number;
  maxScore: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const cx = size / 2, cy = size / 2;
  const r  = (size - strokeWidth * 2) / 2;
  const c  = 2 * Math.PI * r;
  const filled = (score / maxScore) * c;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}

// ─── Current site audit mini card (chat bubble) ─────────────────────────────
export function AuditChatCard() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2 w-full">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <AuditGauge score={4} maxScore={10} size={48} strokeWidth={6} color="#ef4444" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500 font-extrabold text-sm leading-none">4</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800">
            Site Audit <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 mt-1">
            <div>Usability: <span className="font-bold text-red-500">32%</span></div>
            <div>Readability: <span className="font-bold text-amber-500">45%</span></div>
            <div>Discoverability: <span className="font-bold text-red-500">20%</span></div>
          </div>
        </div>
      </div>
      <div className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
        Click to view details
      </div>
    </div>
  );
}

// ─── New site audit mini card (chat bubble) ──────────────────────────────────
export function PostAuditChatCard() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2 w-full">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <AuditGauge score={10} maxScore={10} size={48} strokeWidth={6} color="#10b981" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-500 font-extrabold text-sm leading-none">10</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800">
            New Site Audit <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 mt-1">
            <div>Usability: <span className="font-bold text-emerald-600">98%</span></div>
            <div>Readability: <span className="font-bold text-emerald-600">96%</span></div>
            <div>Discoverability: <span className="font-bold text-emerald-600">94%</span></div>
          </div>
        </div>
      </div>
      <div className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
        Click to view details
      </div>
    </div>
  );
}

// ─── Current site audit — full canvas panel ──────────────────────────────────
export function AuditCanvas() {
  const metrics = [
    { label: 'Usability',       hint: 'Navigation & mobile experience',    value: 32, color: 'text-red-500',   barColor: 'bg-red-500'   },
    { label: 'Readability',     hint: 'How clearly content is presented',  value: 45, color: 'text-amber-500', barColor: 'bg-amber-500' },
    { label: 'Discoverability', hint: 'Visibility in search results',       value: 20, color: 'text-red-500',   barColor: 'bg-red-500'   },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Site Audit</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">How visitors experience your site today</p>
      </div>

      <div className="relative">
        <AuditGauge score={4} maxScore={10} size={200} strokeWidth={20} color="#ef4444" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-6xl font-extrabold text-red-500 leading-none">4</span>
          <span className="text-slate-400 text-base font-medium">/10</span>
          <AlertCircle className="w-5 h-5 text-red-400 mt-1" />
        </div>
      </div>

      <div className="flex gap-8 w-full max-w-md">
        {metrics.map(m => (
          <div key={m.label} className="flex-1 space-y-2">
            <div className={cn('text-2xl font-extrabold', m.color)}>{m.value}%</div>
            <div className="text-xs text-slate-700 font-bold">{m.label}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{m.hint}</div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', m.barColor)} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {['Missing images & favicon', 'Invisible in Google SEO & Maps search', 'Outdated content & info'].map(tag => (
          <span key={tag} className="bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-4 py-2 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── New site audit — full canvas panel ─────────────────────────────────────
export function PostAuditCanvas() {
  const metrics = [
    { label: 'Usability',       value: 98, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { label: 'Readability',     value: 96, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { label: 'Discoverability', value: 94, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 p-12 bg-white animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">New Site Audit</h2>
        <p className="text-slate-400 mt-1 text-sm font-medium">Web Performance Score</p>
      </div>

      <div className="relative">
        <AuditGauge score={10} maxScore={10} size={200} strokeWidth={20} color="#10b981" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-6xl font-extrabold text-emerald-500 leading-none">10</span>
          <span className="text-slate-400 text-base font-medium">/10</span>
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-1" />
        </div>
      </div>

      <div className="flex gap-10 w-full max-w-sm">
        {metrics.map(m => (
          <div key={m.label} className="flex-1 space-y-2">
            <div className={cn('text-2xl font-extrabold', m.color)}>{m.value}%</div>
            <div className="text-xs text-slate-500 font-medium">{m.label}</div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700', m.barColor)} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {['Fully Optimized', 'WCAG Compliant', 'SEO Ready'].map(tag => (
          <span key={tag} className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold px-4 py-2 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── V2: Current site audit — chat bubble ────────────────────────────────────
export function AuditChatCardV2() {
  const cats = [
    { label: 'Perf',      score: 38 },
    { label: 'A11y',      score: 31 },
    { label: 'Privacy',   score: 45 },
    { label: 'Security',  score: 72 },
    { label: 'Usability', score: 42 },
    { label: 'Content',   score: 40 },
    { label: 'Discov',    score: 52 },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 w-full">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <AuditGauge score={46} maxScore={100} size={52} strokeWidth={6} color="#ef4444" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500 font-extrabold text-[13px] leading-none">46</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800">
            Site Audit <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">oakwoodhigh.org · 14 issues found</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {cats.map(cat => {
          const c = scoreColor(cat.score);
          return (
            <span key={cat.label} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', c.bg, c.border, c.text)}>
              {cat.label} {cat.score}
            </span>
          );
        })}
      </div>
      <div className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Click to view details</div>
    </div>
  );
}

// ─── V2: New site audit — chat bubble ────────────────────────────────────────
export function PostAuditChatCardV2() {
  const cats = [
    { label: 'Perf',      score: 98 },
    { label: 'A11y',      score: 96 },
    { label: 'Privacy',   score: 95 },
    { label: 'Security',  score: 99 },
    { label: 'Usability', score: 94 },
    { label: 'Content',   score: 97 },
    { label: 'Discov',    score: 100 },
  ];
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2.5 w-full">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <AuditGauge score={97} maxScore={100} size={52} strokeWidth={6} color="#10b981" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-600 font-extrabold text-[13px] leading-none">97</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800">
            New Site Audit <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">oakwoodhigh.org · All checks passed</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {cats.map(cat => {
          const c = scoreColor(cat.score);
          return (
            <span key={cat.label} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', c.bg, c.border, c.text)}>
              {cat.label} {cat.score}
            </span>
          );
        })}
      </div>
      <div className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">Click to view details</div>
    </div>
  );
}

// ─── Locale data for V2 canvases ─────────────────────────────────────────────
export type AuditLang = 'en' | 'de';

const AUDIT_LOCALE: Record<AuditLang, {
  auditTitle: string; newAuditTitle: string; domain: string;
  needsImprovement: string; excellent: string;
  healthScore: string; allChecksPassed: string;
  critical: string; warning: string; warnings: string;
  ptsImprovement: string; before: string; now: string;
  categoryScoresTitle: string; comparisonLegend: string;
  complianceTitle: string; keyImprovementsTitle: string;
  saveLbl: string; shareLbl: string; viewFullReportLbl: string;
  categories: { key: string; label: string; beforeDetail: string; afterDetail: string }[];
  issues: { tag: string; category: string; text: string }[];
  complianceBefore: { law: string; sub: string; status: ComplianceStatus }[];
  complianceAfter:  { law: string; sub: string; status: ComplianceStatus }[];
  passed: string[];
}> = {
  en: {
    auditTitle: 'Site Audit Report',
    newAuditTitle: 'New Site Audit Report',
    domain: 'oakwoodhigh.org · April 2026',
    needsImprovement: 'Needs Improvement',
    excellent: 'Excellent',
    healthScore: 'Health Score',
    allChecksPassed: '● All checks passed',
    critical: 'critical', warning: 'warning', warnings: 'warnings',
    ptsImprovement: 'pts improvement',
    before: 'Before', now: 'Now',
    categoryScoresTitle: 'Category Scores',
    comparisonLegend: 'Previous score · current score in green',
    complianceTitle: 'Compliance',
    keyImprovementsTitle: 'Key Improvements',
    saveLbl: 'Save', shareLbl: 'Share', viewFullReportLbl: 'View Full Report',
    categories: [
      { key: 'Performance',     label: 'Performance',     beforeDetail: 'LCP 8.4s · Images unoptimized',                                     afterDetail: 'LCP 1.2s · No blocking resources · WebP images · CDN enabled' },
      { key: 'Accessibility',   label: 'Accessibility',   beforeDetail: '19 untagged PDFs · Missing alt text · No WCAG statement',           afterDetail: 'All images have alt text · WCAG 2.1 AA · All PDFs tagged' },
      { key: 'Student Privacy', label: 'Student Privacy', beforeDetail: 'No FERPA notice · COPPA gaps',                                      afterDetail: 'No trackers on student pages · FERPA notice published · COPPA compliant' },
      { key: 'Security',        label: 'Security',        beforeDetail: 'HTTPS present · Mixed content on 3 pages · 2 warnings',             afterDetail: 'HTTPS enforced · No mixed content · No vulnerabilities' },
      { key: 'Usability',       label: 'Usability',       beforeDetail: 'Not mobile-friendly · nav confusing · avg 4.2 clicks to CTA',       afterDetail: 'Mobile-friendly · nav OK · avg 1.4 clicks to CTA' },
      { key: 'Content',         label: 'Content',         beforeDetail: '18 pages outdated · 6 dead links',                                  afterDetail: 'All pages current · 0 dead links' },
      { key: 'Discoverability', label: 'Discoverability', beforeDetail: 'No meta descriptions · Not in Google Maps · Missing sitemap',       afterDetail: 'Meta descriptions on all pages · Google Maps verified · Sitemap live' },
    ],
    issues: [
      { tag: 'blocker', category: 'Accessibility',   text: 'PDF policies not screen-reader accessible — ADA Title II deadline Apr 24' },
      { tag: 'blocker', category: 'Accessibility',   text: 'No accessibility statement published — required under ADA Title II' },
      { tag: 'privacy', category: 'Student Privacy', text: 'Tracking pixels on student pages — COPPA risk for under-13 users' },
      { tag: 'high',    category: 'Performance',     text: 'LCP 8.4s on enrollment page · hero image 4.2 MB unoptimized' },
      { tag: 'blocker', category: 'Forms',           text: 'Enrollment form has no ARIA labels — keyboard navigation impossible' },
      { tag: 'blocker', category: 'Navigation',      text: 'Skip-to-content link missing — screen readers cannot bypass nav' },
      { tag: 'blocker', category: 'Authentication',  text: 'Password reset flow broken on Safari — students locked out' },
      { tag: 'privacy', category: 'Analytics',       text: 'Google Analytics collecting PII from student profile pages — FERPA risk' },
      { tag: 'privacy', category: 'Analytics',       text: 'Third-party chatbot retaining student conversation data — COPPA risk' },
      { tag: 'high',    category: 'Mobile',          text: 'Hamburger menu unresponsive on iOS 17 — 3-tap workaround required' },
      { tag: 'high',    category: 'Links',           text: '6 broken internal links on About and Staff pages' },
      { tag: 'high',    category: 'Mobile',          text: 'Touch targets on events calendar below 44×44px minimum' },
    ],
    complianceBefore: [
      { law: 'ADA Title II · WCAG 2.1 AA', sub: 'Digital accessibility for public entities', status: 'non-compliant' },
      { law: 'FERPA',                       sub: 'Directory info, annual notice, consent',     status: 'partial' },
      { law: 'COPPA',                       sub: 'Third-party services for under-13 users',    status: 'at-risk' },
      { law: 'CIPA',                        sub: 'Internet safety policy disclosure',           status: 'compliant' },
    ],
    complianceAfter: [
      { law: 'ADA Title II · WCAG 2.1 AA', sub: 'Digital accessibility for public entities', status: 'compliant' },
      { law: 'FERPA',                       sub: 'Directory info, annual notice, consent',     status: 'compliant' },
      { law: 'COPPA',                       sub: 'Third-party services for under-13 users',    status: 'compliant' },
      { law: 'CIPA',                        sub: 'Internet safety policy disclosure',           status: 'compliant' },
    ],
    passed: [
      'LCP 1.2s — down from 8.4s · all images WebP-optimized',
      '19 PDFs fully tagged and screen-reader accessible',
      'Accessibility statement with complaint contact published',
      'All tracking pixels removed from student-facing pages',
    ],
  },
  de: {
    auditTitle: 'Website-Audit-Bericht',
    newAuditTitle: 'Neuer Website-Audit-Bericht',
    domain: 'oakwoodhigh.de · April 2026',
    needsImprovement: 'Verbesserungsbedarf',
    excellent: 'Ausgezeichnet',
    healthScore: 'Gesundheitswert',
    allChecksPassed: '● Alle Prüfungen bestanden',
    critical: 'kritisch', warning: 'Warnung', warnings: 'Warnungen',
    ptsImprovement: 'Punkte Verbesserung',
    before: 'Vorher', now: 'Jetzt',
    categoryScoresTitle: 'Kategoriebewertungen',
    comparisonLegend: 'Vorheriger Wert · aktueller Wert in Grün',
    complianceTitle: 'Rechtskonformität',
    keyImprovementsTitle: 'Wichtigste Verbesserungen',
    saveLbl: 'Speichern', shareLbl: 'Teilen', viewFullReportLbl: 'Vollständiger Bericht',
    categories: [
      { key: 'Performance',     label: 'Leistung',                beforeDetail: 'LCP 8,4 s · Bilder unkomprimiert',                                              afterDetail: 'LCP 1,2 s · Keine Render-Blocker · WebP-Bilder · CDN aktiv' },
      { key: 'Accessibility',   label: 'Barrierefreiheit',        beforeDetail: '19 ungetaggte PDFs · Fehlende Alt-Texte · Kein BITV-Hinweis',                   afterDetail: 'Alle Bilder mit Alt-Text · BITV 2.0 / WCAG 2.1 AA · Alle PDFs getaggt' },
      { key: 'Student Privacy', label: 'Schülerdatenschutz',      beforeDetail: 'Kein DSGVO-Hinweis · Datenschutzlücken',                                        afterDetail: 'Keine Tracker auf Schülerseiten · DSGVO-Hinweis veröffentlicht · Konform' },
      { key: 'Security',        label: 'Sicherheit',              beforeDetail: 'HTTPS vorhanden · Mixed Content auf 3 Seiten · 2 Warnungen',                    afterDetail: 'HTTPS erzwungen · Kein Mixed Content · Keine Schwachstellen' },
      { key: 'Usability',       label: 'Benutzerfreundlichkeit',  beforeDetail: 'Nicht mobil-optimiert · Navigation unübersichtlich · Ø 4,2 Klicks bis CTA',    afterDetail: 'Mobil-optimiert · Navigation klar · Ø 1,4 Klicks bis CTA' },
      { key: 'Content',         label: 'Inhalte',                 beforeDetail: '18 veraltete Seiten · 6 tote Links',                                            afterDetail: 'Alle Seiten aktuell · 0 tote Links' },
      { key: 'Discoverability', label: 'Auffindbarkeit',          beforeDetail: 'Keine Meta-Beschreibungen · Nicht in Google Maps · Sitemap fehlt',              afterDetail: 'Meta-Beschreibungen auf allen Seiten · Google Maps verifiziert · Sitemap aktiv' },
    ],
    issues: [
      { tag: 'blocker', category: 'Accessibility',   text: 'PDF-Richtlinien nicht barrierefrei lesbar — BITV-2.0-Frist Apr 24' },
      { tag: 'blocker', category: 'Accessibility',   text: 'Kein Barrierefreiheits-Hinweis veröffentlicht — BITV 2.0 erforderlich' },
      { tag: 'privacy', category: 'Student Privacy', text: 'Tracking-Pixel auf Schülerseiten — DSGVO-Risiko' },
      { tag: 'high',    category: 'Performance',     text: 'LCP 8,4 s auf Anmeldeseite · Hero-Bild 4,2 MB unkomprimiert' },
      { tag: 'blocker', category: 'Formulare',       text: 'Anmeldeformular ohne ARIA-Labels — Tastaturnavigation unmöglich' },
      { tag: 'blocker', category: 'Navigation',      text: 'Skip-to-content-Link fehlt — Screenreader können Navigation nicht überspringen' },
      { tag: 'blocker', category: 'Authentifizierung', text: 'Passwort-Reset fehlerhaft in Safari — Schüler ausgesperrt' },
      { tag: 'privacy', category: 'Analyse',         text: 'Google Analytics erfasst personenbezogene Daten auf Schülerprofilen — DSGVO-Verstoß' },
      { tag: 'privacy', category: 'Analyse',         text: 'Drittanbieter-Chatbot speichert Schüler-Gesprächsdaten — DSGVO-Risiko' },
      { tag: 'high',    category: 'Mobil',           text: 'Hamburger-Menü reagiert nicht auf iOS 17 — 3-Tippen-Workaround erforderlich' },
      { tag: 'high',    category: 'Links',           text: '6 tote interne Links auf Über-uns- und Lehrkräfte-Seiten' },
      { tag: 'high',    category: 'Mobil',           text: 'Tipp-Ziele im Veranstaltungskalender unter 44×44 px Mindestgröße' },
    ],
    complianceBefore: [
      { law: 'BITV 2.0 · WCAG 2.1 AA',  sub: 'Digitale Barrierefreiheit für öffentliche Stellen', status: 'non-compliant' },
      { law: 'DSGVO (Art. 13 & 14)',     sub: 'Informationspflichten, Einwilligung, Verzeichnis',  status: 'partial' },
      { law: 'DSGVO + JMStV',            sub: 'Drittanbieter-Dienste für unter-13-Jährige',         status: 'at-risk' },
      { law: 'JMStV',                    sub: 'Jugendmedienschutz-Staatsvertrag',                   status: 'compliant' },
    ],
    complianceAfter: [
      { law: 'BITV 2.0 · WCAG 2.1 AA',  sub: 'Digitale Barrierefreiheit für öffentliche Stellen', status: 'compliant' },
      { law: 'DSGVO (Art. 13 & 14)',     sub: 'Informationspflichten, Einwilligung, Verzeichnis',  status: 'compliant' },
      { law: 'DSGVO + JMStV',            sub: 'Drittanbieter-Dienste für unter-13-Jährige',         status: 'compliant' },
      { law: 'JMStV',                    sub: 'Jugendmedienschutz-Staatsvertrag',                   status: 'compliant' },
    ],
    passed: [
      'LCP 1,2 s — von 8,4 s · Alle Bilder als WebP optimiert',
      '19 PDFs vollständig getaggt und barrierefrei lesbar',
      'Barrierefreiheits-Hinweis mit Beschwerdekontakt veröffentlicht',
      'Alle Tracking-Pixel von schülerbezogenen Seiten entfernt',
    ],
  },
};

// ─── V2: Current site audit — full canvas ────────────────────────────────────
export function AuditCanvasV2({ lang = 'en' }: { lang?: AuditLang }) {
  const L = AUDIT_LOCALE[lang];
  const PENALTIES: Record<string, number> = { blocker: 20, privacy: 15, high: 10 };
  const { issues } = L;

  const BASE_SCORES: Record<string, number> = {
    Performance: 48, Accessibility: 71, 'Student Privacy': 60,
    Security: 72, Usability: 42, Content: 40, Discoverability: 52,
  };

  const catScores: Record<string, number> = Object.fromEntries(
    Object.entries(BASE_SCORES).map(([cat, base]) => {
      const penalty = issues.filter(i => i.category === cat).reduce((s, i) => s + PENALTIES[i.tag], 0);
      return [cat, Math.max(0, base - penalty)];
    })
  );

  const SCORE = Math.round(Object.values(catScores).reduce((s, v) => s + v, 0) / Object.keys(catScores).length);
  const c = scoreColor(SCORE);

  const ICONS: Record<string, React.ReactNode> = {
    Performance:     <Zap className="w-3.5 h-3.5" />,
    Accessibility:   <Eye className="w-3.5 h-3.5" />,
    'Student Privacy': <ShieldCheck className="w-3.5 h-3.5" />,
    Security:        <Lock className="w-3.5 h-3.5" />,
    Usability:       <Monitor className="w-3.5 h-3.5" />,
    Content:         <FileText className="w-3.5 h-3.5" />,
    Discoverability: <Search className="w-3.5 h-3.5" />,
  };

  const categories = L.categories.map(cat => ({
    icon: ICONS[cat.key], label: cat.label,
    score: catScores[cat.key], detail: cat.beforeDetail,
  }));

  const criticalCount = issues.filter(i => i.tag === 'blocker' || i.tag === 'privacy').length;
  const warningCount  = issues.filter(i => i.tag === 'high').length;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-6 bg-white animate-in fade-in duration-700">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{L.auditTitle}</h2>
          <p className="text-slate-400 text-[11px] mt-0.5">{L.domain}</p>
        </div>
        <span className="bg-red-50 border border-red-200 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
          {L.needsImprovement}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <AuditGauge score={SCORE} maxScore={100} size={80} strokeWidth={8} color={c.hex} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-2xl font-extrabold leading-none', c.text)}>{SCORE}</span>
            <span className="text-slate-400 text-[10px]">/100</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-700">{L.healthScore}</div>
          <div className="flex gap-3 text-[11px]">
            <span className="text-red-500 font-bold">● {criticalCount} {L.critical}</span>
            <span className="text-orange-500 font-bold">● {warningCount} {warningCount !== 1 ? L.warnings : L.warning}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{L.categoryScoresTitle}</div>
        <div className="space-y-2">
          {categories.map(cat => <CategoryRow key={cat.label} {...cat} />)}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{L.complianceTitle}</div>
        <div className="border border-slate-100 rounded-lg px-3 py-0.5">
          {L.complianceBefore.map(r => <ComplianceRow key={r.law} {...r} />)}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
          <Save className="w-3.5 h-3.5" /> {L.saveLbl}
        </button>
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
          <Share2 className="w-3.5 h-3.5" /> {L.shareLbl}
        </button>
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors ml-auto">
          <ExternalLink className="w-3.5 h-3.5" /> {L.viewFullReportLbl}
        </button>
      </div>
    </div>
  );
}

// ─── V2: New site audit — full canvas ────────────────────────────────────────
export function PostAuditCanvasV2({ lang = 'en' }: { lang?: AuditLang }) {
  const L = AUDIT_LOCALE[lang];
  const SCORE = 97;
  const PREV_SCORE = 46;
  const c = scoreColor(SCORE);
  const cp = scoreColor(PREV_SCORE);

  const ICONS: Record<string, React.ReactNode> = {
    Performance:     <Zap className="w-3.5 h-3.5" />,
    Accessibility:   <Eye className="w-3.5 h-3.5" />,
    'Student Privacy': <ShieldCheck className="w-3.5 h-3.5" />,
    Security:        <Lock className="w-3.5 h-3.5" />,
    Usability:       <Monitor className="w-3.5 h-3.5" />,
    Content:         <FileText className="w-3.5 h-3.5" />,
    Discoverability: <Search className="w-3.5 h-3.5" />,
  };

  const AFTER_SCORES: Record<string, number> = {
    Performance: 98, Accessibility: 96, 'Student Privacy': 95,
    Security: 99, Usability: 94, Content: 97, Discoverability: 100,
  };
  const PREV_SCORES: Record<string, number> = {
    Performance: 38, Accessibility: 31, 'Student Privacy': 45,
    Security: 72, Usability: 42, Content: 40, Discoverability: 52,
  };

  const categories = L.categories.map(cat => ({
    icon: ICONS[cat.key], label: cat.label,
    score: AFTER_SCORES[cat.key], prevScore: PREV_SCORES[cat.key], detail: cat.afterDetail,
  }));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-6 bg-white animate-in fade-in duration-700">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{L.newAuditTitle}</h2>
          <p className="text-slate-400 text-[11px] mt-0.5">{L.domain}</p>
        </div>
        <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
          {L.excellent}
        </span>
      </div>

      {/* ── Before / Now gauges ── */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="relative shrink-0">
            <AuditGauge score={PREV_SCORE} maxScore={100} size={64} strokeWidth={7} color={cp.hex} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-base font-extrabold leading-none', cp.text)}>{PREV_SCORE}</span>
              <span className="text-slate-400 text-[9px]">/100</span>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{L.before}</span>
        </div>

        <div className="flex flex-col items-center gap-0.5 flex-1">
          <span className="text-emerald-500 font-extrabold text-base">+{SCORE - PREV_SCORE}</span>
          <div className="flex items-center gap-1 w-full">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-300 text-xs">→</span>
            <div className="flex-1 h-px bg-emerald-300" />
          </div>
          <span className="text-[9px] text-slate-400">{L.ptsImprovement}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="relative shrink-0">
            <AuditGauge score={SCORE} maxScore={100} size={64} strokeWidth={7} color={c.hex} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-base font-extrabold leading-none', c.text)}>{SCORE}</span>
              <span className="text-slate-400 text-[9px]">/100</span>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{L.now}</span>
        </div>

        <div className="ml-1 space-y-1 border-l border-slate-100 pl-3">
          <div className="text-[10px] font-bold text-slate-700">{L.healthScore}</div>
          <div className="text-[11px] text-emerald-600 font-bold">{L.allChecksPassed}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{L.categoryScoresTitle}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-0.5 h-3 bg-slate-500 rounded-sm shrink-0" />
            <span className="text-[10px] text-slate-500">{L.comparisonLegend}</span>
          </div>
        </div>
        <div className="space-y-4">
          {categories.map(cat => <CategoryRow key={cat.label} {...cat} />)}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{L.complianceTitle}</div>
        <div className="border border-slate-100 rounded-lg px-3 py-0.5">
          {L.complianceAfter.map(r => <ComplianceRow key={r.law} {...r} />)}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{L.keyImprovementsTitle}</div>
        <div className="space-y-1.5">
          {L.passed.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
              <span className="text-[11px] text-slate-600 leading-tight">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
          <Save className="w-3.5 h-3.5" /> {L.saveLbl}
        </button>
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
          <Share2 className="w-3.5 h-3.5" /> {L.shareLbl}
        </button>
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors ml-auto">
          <ExternalLink className="w-3.5 h-3.5" /> {L.viewFullReportLbl}
        </button>
      </div>
    </div>
  );
}

// ─── Dev showcase page ───────────────────────────────────────────────────────
export function AuditPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8 space-y-14">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Audit Previews — Dev Showcase</h1>
        <p className="text-slate-500 text-sm mt-1">All components in <code className="bg-slate-200 px-1 rounded">AuditPreviews.tsx</code> · originals in <code className="bg-slate-200 px-1 rounded">AiWorkspaceView.tsx</code> untouched</p>
      </div>

      {/* ── V2 redesign (Lighthouse-style) ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">V2 — Redesigned (Lighthouse-style)</h2>
          <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Chat bubble cards</p>
          <div className="flex gap-6 flex-wrap">
            <div className="w-72">
              <p className="text-[10px] text-slate-400 mb-1.5">46/100 — before migration</p>
              <AuditChatCardV2 />
            </div>
            <div className="w-72">
              <p className="text-[10px] text-slate-400 mb-1.5">97/100 — after migration</p>
              <PostAuditChatCardV2 />
            </div>
          </div>
        </div>

        {/* EN canvases */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">🇺🇸 English — full canvas panels</p>
          <div className="flex gap-6 flex-wrap items-start">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ width: 480, minHeight: 540 }}>
              <div className="bg-slate-800 text-slate-400 text-[10px] font-mono px-4 py-2 shrink-0">AuditCanvasV2 lang="en" — 46/100</div>
              <AuditCanvasV2 lang="en" />
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ width: 480, minHeight: 540 }}>
              <div className="bg-slate-800 text-slate-400 text-[10px] font-mono px-4 py-2 shrink-0">PostAuditCanvasV2 lang="en" — 97/100</div>
              <PostAuditCanvasV2 lang="en" />
            </div>
          </div>
        </div>

        {/* DE canvases */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">🇩🇪 Deutsch — Vollansicht</p>
          <div className="flex gap-6 flex-wrap items-start">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ width: 480, minHeight: 540 }}>
              <div className="bg-slate-800 text-slate-400 text-[10px] font-mono px-4 py-2 shrink-0">AuditCanvasV2 lang="de" — 46/100</div>
              <AuditCanvasV2 lang="de" />
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ width: 480, minHeight: 540 }}>
              <div className="bg-slate-800 text-slate-400 text-[10px] font-mono px-4 py-2 shrink-0">PostAuditCanvasV2 lang="de" — 97/100</div>
              <PostAuditCanvasV2 lang="de" />
            </div>
          </div>
        </div>
      </section>

      {/* ── V1 original (for reference) ─────────────────────────────────────── */}
      <section className="space-y-4 opacity-50">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">V1 — Original (kept for reference)</h2>

        <div className="flex gap-6 flex-wrap">
          <div className="w-72">
            <p className="text-[10px] text-slate-400 mb-1.5">4/10 — before</p>
            <AuditChatCard />
          </div>
          <div className="w-72">
            <p className="text-[10px] text-slate-400 mb-1.5">10/10 — after</p>
            <PostAuditChatCard />
          </div>
        </div>

        <div className="flex gap-6 flex-wrap items-start">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ width: 480, minHeight: 520 }}>
            <div className="bg-slate-800 text-slate-400 text-[10px] font-mono px-4 py-2 shrink-0">AuditCanvas — 4/10</div>
            <AuditCanvas />
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ width: 480, minHeight: 520 }}>
            <div className="bg-slate-800 text-slate-400 text-[10px] font-mono px-4 py-2 shrink-0">PostAuditCanvas — 10/10</div>
            <PostAuditCanvas />
          </div>
        </div>
      </section>
    </div>
  );
}
