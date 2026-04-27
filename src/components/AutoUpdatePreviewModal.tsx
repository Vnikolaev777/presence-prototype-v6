import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Eye, CheckCircle, ArrowRight } from 'lucide-react';
import { SchoolAfterMagic } from '../pages/SchoolAfterMagic';

interface Props {
  onClose: () => void;
}

const WHAT_WAS_DONE = [
  'New faculty profile created for Mr. James Holloway',
  'Added to Team page — 10th Grade History',
  'Faculty Directory updated and re-indexed',
];

export function AutoUpdatePreviewModal({ onClose }: Props) {
  const [showAfter, setShowAfter] = useState(true);
  const [alwaysManual, setAlwaysManual] = useState(false);

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
                Auto-Applied Update
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">New Teacher Profile Published</h2>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">

              {/* Source */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Source</h3>
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
                    <p className="text-xs text-slate-400">New staff record detected · Just now</p>
                  </div>
                </div>
              </div>

              {/* What was done */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">What Was Done</h3>
                <ul className="space-y-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  {WHAT_WAS_DONE.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Published profile card */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Published Profile</h3>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/75.jpg"
                    alt="Mr. James Holloway"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm">Mr. James Holloway</p>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">10th Grade History</p>
                    <p className="text-xs text-slate-400 mt-0.5">Social Studies Department</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto shrink-0" />
                </div>
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
                  Revert
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Looks Good
                </button>
              </div>

              {/* Toggle row — opt into manual review */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-medium leading-snug pr-4">
                  Always require my review for teacher updates
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
                <Eye className="w-4 h-4 text-blue-500" /> Live Site Preview
              </div>

              {/* Before / After Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setShowAfter(false)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    !showAfter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Before
                </button>
                <button
                  onClick={() => setShowAfter(true)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    showAfter ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  After
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 relative overflow-hidden">
              <div className="w-full h-full overflow-y-auto bg-slate-50">
                <SchoolAfterMagic
                  previewType="new_teacher"
                  showAfter={showAfter}
                />
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
