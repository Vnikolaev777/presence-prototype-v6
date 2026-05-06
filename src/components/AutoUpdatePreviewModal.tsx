import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Eye, CheckCircle, ArrowRight, CalendarDays, BookOpen, Database } from 'lucide-react';
import { SchoolAfterMagic } from '../pages/SchoolAfterMagic';
import { useT, useRegion } from '../lib/i18n';

type Variant = 'teacher' | 'vacation';

interface Props {
  onClose: () => void;
  variant?: Variant;
}

const TEACHER_WHAT_WAS_DONE_KEYS = [
  'autoUpdateModal.teacher.done.0',
  'autoUpdateModal.teacher.done.1',
  'autoUpdateModal.teacher.done.2',
];

const VACATION_WHAT_WAS_DONE_KEYS = [
  'autoUpdateModal.vacation.done.0',
  'autoUpdateModal.vacation.done.1',
  'autoUpdateModal.vacation.done.2',
  'autoUpdateModal.vacation.done.3',
];

const VACATION_CLUBS = [
  { labelKey: 'autoUpdateModal.vacation.club.0.label', timeKey: 'autoUpdateModal.vacation.club.0.time' },
  { labelKey: 'autoUpdateModal.vacation.club.1.label', timeKey: 'autoUpdateModal.vacation.club.1.time' },
  { labelKey: 'autoUpdateModal.vacation.club.2.label', timeKey: 'autoUpdateModal.vacation.club.2.time' },
  { labelKey: 'autoUpdateModal.vacation.club.3.label', timeKey: 'autoUpdateModal.vacation.club.3.time' },
];

export function AutoUpdatePreviewModal({ onClose, variant = 'teacher' }: Props) {
  const t = useT();
  const region = useRegion();
  const [showAfter, setShowAfter] = useState(true);
  const [alwaysManual, setAlwaysManual] = useState(false);

  const isVacation = variant === 'vacation';
  const whatWasDoneKeys = isVacation ? VACATION_WHAT_WAS_DONE_KEYS : TEACHER_WHAT_WAS_DONE_KEYS;
  const title = t(isVacation ? 'autoUpdateModal.vacation.title' : 'autoUpdateModal.teacher.title');
  const toggleLabel = t(isVacation ? 'autoUpdateModal.vacation.toggleLabel' : 'autoUpdateModal.teacher.toggleLabel');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal — same wide split layout as AiReviewModal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full max-w-[1400px] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-slate-500 hover:text-slate-800 bg-white/80 backdrop-blur hover:bg-slate-100 rounded-full p-2 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ── Left Panel ──────────────────────────────────────────────── */}
          <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col shrink-0 bg-white z-0 relative">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold tracking-wide uppercase mb-2">
                <Zap className="w-4 h-4" />
                {t('autoUpdateModal.headerLabel')}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{title}</h2>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">

              {/* Source */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t(isVacation ? 'autoUpdateModal.section.sources' : 'autoUpdateModal.section.source')}
                </h3>
                {isVacation ? (
                  <div className="space-y-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src="https://www.google.com/s2/favicons?domain=powerschool.com&sz=64"
                          alt="PowerSchool"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">PowerSchool <span className="text-[10px] text-slate-400 font-normal">{t('autoUpdateModal.vacation.source.powerschool.tag')}</span></p>
                        <p className="text-xs text-slate-400">{t('autoUpdateModal.vacation.source.powerschool.detail')}</p>
                      </div>
                      <Database className="w-4 h-4 text-blue-400 shrink-0" />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src="https://www.google.com/s2/favicons?domain=canvas.instructure.com&sz=64"
                          alt="Canvas LMS"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">Canvas LMS</p>
                        <p className="text-xs text-slate-400">{t('autoUpdateModal.vacation.source.canvas.detail')}</p>
                      </div>
                      <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    </div>
                  </div>
                ) : region.id === 'Germany' ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src="https://www.google.com/s2/favicons?domain=webuntis.com&sz=64"
                        alt="WebUntis"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">WebUntis</p>
                      <p className="text-xs text-slate-400">Neuer Personaleintrag erkannt · Gerade eben</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src="https://www.google.com/s2/favicons?domain=powerschool.com&sz=64"
                        alt="PowerSchool"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">PowerSchool</p>
                      <p className="text-xs text-slate-400">{t('autoUpdateModal.teacher.source.detail')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* What was done */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('autoUpdateModal.section.whatWasDone')}</h3>
                <ul className="space-y-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  {whatWasDoneKeys.map((key, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Published card */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t(isVacation ? 'autoUpdateModal.section.publishedSchedule' : 'autoUpdateModal.section.publishedProfile')}
                </h3>
                {isVacation ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 text-white flex items-center justify-center shadow-sm shrink-0">
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{t('autoUpdateModal.vacation.card.title')}</p>
                        <p className="text-xs text-amber-600 font-semibold mt-0.5">{t('autoUpdateModal.vacation.card.dates')}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t('autoUpdateModal.vacation.card.subDates')}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                    </div>
                    <div className="border-t border-slate-200 pt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t('autoUpdateModal.vacation.card.runningDuringBreak')}</p>
                      {VACATION_CLUBS.map(c => (
                        <div key={c.labelKey} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-medium">{t(c.labelKey)}</span>
                          <span className="text-slate-400">{t(c.timeKey)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : region.id === 'Germany' ? (
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <img
                      src="https://randomuser.me/api/portraits/women/29.jpg"
                      alt="Li Chen"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm">Li Chen</p>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">Mathematik · Klasse 4b</p>
                      <p className="text-xs text-slate-400 mt-0.5">Neue Lehrkraft</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <img
                      src="https://randomuser.me/api/portraits/men/75.jpg"
                      alt="Mr. James Holloway"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm">Mr. James Holloway</p>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">{t('autoUpdateModal.teacher.card.subject')}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t('autoUpdateModal.teacher.card.department')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                  </div>
                )}
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-3">
              {/* Primary row */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  {t('autoUpdateModal.action.revert')}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('autoUpdateModal.action.looksGood')}
                </button>
              </div>

              {/* Toggle row — opt into manual review */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-medium leading-snug pr-4">
                  {toggleLabel}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={alwaysManual}
                  onClick={() => setAlwaysManual(v => !v)}
                  className="shrink-0 focus:outline-none"
                >
                  <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${alwaysManual ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${alwaysManual ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Panel: Live Preview ────────────────────────────────── */}
          <div className="hidden md:flex flex-1 flex-col bg-slate-100 relative">
            {/* Preview Toolbar */}
            <div className="h-14 bg-white border-b border-l border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" /> {t('autoUpdateModal.preview.title')}
              </div>

              {/* Before / After Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setShowAfter(false)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    !showAfter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t('autoUpdateModal.preview.before')}
                </button>
                <button
                  onClick={() => setShowAfter(true)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    showAfter ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t('autoUpdateModal.preview.after')}
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 relative overflow-hidden">
              {region.id === 'Germany' ? (
                <iframe
                  key={`${variant}-${showAfter}`}
                  src={`${import.meta.env.BASE_URL}lerchenberg/good.html?highlight=${
                    isVacation ? 'section-events' : 'section-team'
                  }&state=${showAfter ? 'after' : 'before'}`}
                  className="w-full h-full border-0"
                  title="Grundschule Lerchenberg Vorschau"
                />
              ) : (
                <div className="w-full h-full overflow-y-auto bg-slate-50">
                  <SchoolAfterMagic
                    previewType={isVacation ? undefined : 'new_teacher'}
                    showAfter={showAfter}
                  />
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
