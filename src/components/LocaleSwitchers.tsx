// ─────────────────────────────────────────────────────────────────────────────
// Two pill-shaped dropdowns for the top header — Region, then Language.
// They share a DropdownShell (button + animated panel + click-outside handling)
// so the two switchers stay visually identical.
//
// Hidden below `md` because mobile already has the hamburger menu; a
// mobile-friendly switcher lands in Phase 2.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Languages } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocale, useT, type Language } from '../lib/i18n';
import type { Region } from '../i18n/regions';

const REGION_OPTIONS: Region[] = ['US', 'Germany'];
const LANGUAGE_OPTIONS: Language[] = ['en', 'de'];

export function LocaleSwitchers() {
  return (
    <div className="hidden md:flex items-center gap-2">
      <RegionDropdown />
      <LanguageDropdown />
    </div>
  );
}

// ── Shared dropdown shell ───────────────────────────────────────────────────

interface DropdownShellProps {
  icon: ReactNode;
  buttonLabel: string;
  ariaLabel: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: ReactNode;
}

function DropdownShell({ icon, buttonLabel, ariaLabel, open, setOpen, children }: DropdownShellProps) {
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
  }, [open, setOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white/80 border border-slate-200 hover:bg-white hover:border-slate-300 transition-colors shadow-sm"
      >
        {icon}
        <span>{buttonLabel}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 z-50"
            role="listbox"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Region dropdown ─────────────────────────────────────────────────────────

function RegionDropdown() {
  const t = useT();
  const { locale, setRegion } = useLocale();
  const [open, setOpen] = useState(false);
  const currentLabel = t(`localeSwitcher.region.${locale.region}`);

  return (
    <DropdownShell
      icon={<Globe className="w-3.5 h-3.5 text-slate-500" />}
      buttonLabel={currentLabel}
      ariaLabel={`${t('localeSwitcher.region.label')}: ${currentLabel}`}
      open={open}
      setOpen={setOpen}
    >
      <DropdownHeader>{t('localeSwitcher.region.label')}</DropdownHeader>
      {REGION_OPTIONS.map(r => (
        <DropdownOption
          key={r}
          label={t(`localeSwitcher.region.${r}`)}
          selected={locale.region === r}
          onSelect={() => { setRegion(r); setOpen(false); }}
        />
      ))}
    </DropdownShell>
  );
}

// ── Language dropdown ───────────────────────────────────────────────────────

function LanguageDropdown() {
  const t = useT();
  const { locale, setLanguage } = useLocale();
  const [open, setOpen] = useState(false);
  const currentLabel = t(`localeSwitcher.language.${locale.language}`);

  return (
    <DropdownShell
      icon={<Languages className="w-3.5 h-3.5 text-slate-500" />}
      buttonLabel={currentLabel}
      ariaLabel={`${t('localeSwitcher.language.label')}: ${currentLabel}`}
      open={open}
      setOpen={setOpen}
    >
      <DropdownHeader>{t('localeSwitcher.language.label')}</DropdownHeader>
      {LANGUAGE_OPTIONS.map(l => (
        <DropdownOption
          key={l}
          label={t(`localeSwitcher.language.${l}`)}
          selected={locale.language === l}
          onSelect={() => { setLanguage(l); setOpen(false); }}
        />
      ))}
    </DropdownShell>
  );
}

// ── Internal building blocks ────────────────────────────────────────────────

function DropdownHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 pt-1 pb-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">
      {children}
    </div>
  );
}

interface DropdownOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function DropdownOption({ label, selected, onSelect }: DropdownOptionProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
        selected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
      )}
    >
      <span>{label}</span>
      {selected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
    </button>
  );
}
