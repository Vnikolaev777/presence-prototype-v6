// ─────────────────────────────────────────────────────────────────────────────
// Profile menu — the JD avatar in the top header opens a popover containing
// "Developer Settings" (currently just the region picker).
//
// The region selector used to live next to the language pill in the header,
// but it's a developer-facing concern (controls which fixtures/connectors
// the demo shows) and shouldn't be a primary control for end users.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocale, useT } from '../lib/i18n';
import type { Region } from '../i18n/regions';

const REGION_OPTIONS: Region[] = ['US', 'Germany'];

export function ProfileMenu() {
  const t = useT();
  const { locale, setRegion } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('profileMenu.developerSettings')}
        className={cn(
          'h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 transition-colors',
          open ? 'bg-slate-200 border-slate-300' : 'hover:bg-slate-200 hover:border-slate-300'
        )}
      >
        JD
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-2 z-50"
            role="menu"
          >
            <div className="px-2 pt-1 pb-2 mb-1 border-b border-slate-100">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {t('profileMenu.developerSettings')}
              </p>
            </div>
            <div className="px-2 pt-1.5 pb-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">
                {t('localeSwitcher.region.label')}
              </p>
              <div className="space-y-0.5">
                {REGION_OPTIONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    role="menuitemradio"
                    aria-checked={locale.region === r}
                    onClick={() => { setRegion(r); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      locale.region === r ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <span>{t(`localeSwitcher.region.${r}`)}</span>
                    {locale.region === r && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
