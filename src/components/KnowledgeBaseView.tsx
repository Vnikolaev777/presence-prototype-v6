import { useState, useRef } from 'react';
import {
  Globe, School, Upload, ExternalLink, Palette,
  File, Image, FileSpreadsheet, Trash2, Info,
  MessageSquare, ThumbsUp, ThumbsDown, Pencil,
  CheckCircle2, Link2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useT, useRegion } from '../lib/i18n';

// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab = 'website' | 'school' | 'files' | 'integrations';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || ''))
    return <Image className="w-4 h-4 text-emerald-500" />;
  if (['xls', 'xlsx', 'csv'].includes(ext || ''))
    return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
  return <File className="w-4 h-4 text-blue-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface KnowledgeBaseViewProps {
  connectedSystems: any[];
  setConnectedSystems: (s: any[]) => void;
  actions: any[];
  setActions: (a: any[]) => void;
  onNavigate: (tab: string) => void;
}

export function KnowledgeBaseView({ connectedSystems, setConnectedSystems, actions, setActions, onNavigate }: KnowledgeBaseViewProps) {
  const t = useT();
  const region = useRegion();
  const [activeTab, setActiveTab] = useState<MainTab>('website');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => [
    { id: '1', name: 'Parent_Handbook_2026.pdf',     size: 2_450_000, uploadedAt: t('knowledge.files.seeded.0.date') },
    { id: '2', name: 'Emergency_Contact_Form.pdf',   size: 312_000,   uploadedAt: t('knowledge.files.seeded.1.date') },
    { id: '3', name: 'School_Calendar_2025-26.xlsx', size: 88_000,    uploadedAt: t('knowledge.files.seeded.2.date') },
  ]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      setUploadedFiles(prev => [
        {
          id: Date.now().toString() + file.name,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toLocaleDateString(region.intlLocale, { month: 'short', day: 'numeric', year: 'numeric' }),
        },
        ...prev,
      ]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) =>
    setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const TABS: { id: MainTab; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'website',      labelKey: 'knowledge.tab.website',      icon: <Globe className="w-4 h-4" /> },
    { id: 'school',       labelKey: 'knowledge.tab.school',       icon: <School className="w-4 h-4" /> },
    { id: 'files',        labelKey: 'knowledge.tab.files',        icon: <Upload className="w-4 h-4" /> },
    { id: 'integrations', labelKey: 'knowledge.tab.integrations', icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">

      {/* ── Page header + tabs ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-light tracking-tight text-black mb-1">{t('knowledge.title')}</h1>
        <p className="text-slate-500 text-sm mb-5">{t('knowledge.subtitle')}</p>

        {/* Top tab bar */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-max border border-slate-200 shadow-sm gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.icon}
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'website' && <WebsiteProfileTab />}
        {activeTab === 'school'  && <SchoolProfileTab />}
        {activeTab === 'integrations' && (
          <IntegrationsTab
            connectedSystems={connectedSystems}
            setConnectedSystems={setConnectedSystems}
            actions={actions}
            setActions={setActions}
            onNavigate={onNavigate}
          />
        )}
        {activeTab === 'files'   && (
          <SchoolFilesTab
            files={uploadedFiles}
            onRemove={removeFile}
            onFiles={handleFiles}
            dragOver={dragOver}
            onDragOver={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            fileInputRef={fileInputRef}
          />
        )}
      </div>
    </div>
  );
}

// ─── Website Profile Tab ──────────────────────────────────────────────────────


function WebsiteProfileTab() {
  const t = useT();
  const previewUrl = `${window.location.origin}/presence-prototype/preview.html`;

  return (
    <div className="max-w-4xl space-y-6">

      {/* Quick links row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Preview link */}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">{t('knowledge.website.preview.title')}</p>
            <p className="text-xs text-slate-600 mt-0.5 truncate">{t('knowledge.website.preview.subtitle')}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
        </a>

        {/* Design scheme link */}
        <a
          href="/school-after-magic"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
            <Palette className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">{t('knowledge.website.scheme.title')}</p>
            <p className="text-xs text-slate-600 mt-0.5">{t('knowledge.website.scheme.subtitle')}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
        </a>
      </div>


      {/* Tone of Voice */}
      <ToneOfVoiceCard />

    </div>
  );
}

// ─── Tone of Voice ───────────────────────────────────────────────────────────

const TONE_TRAITS = [
  { label: 'Warm',         desc: 'Approachable and caring — students and families feel welcome.',       color: 'amber'   },
  { label: 'Inspiring',    desc: 'Motivates students to reach their potential; celebrates achievement.', color: 'indigo'  },
  { label: 'Clear',        desc: 'Simple, jargon-free language everyone can understand.',               color: 'blue'    },
  { label: 'Inclusive',    desc: 'Reflects the diversity of our community; never exclusive.',            color: 'emerald' },
  { label: 'Professional', desc: 'Respectful and polished — reflects positively on the institution.',   color: 'slate'   },
];

const TONE_EXAMPLE_KEYS = [
  { do: 'knowledge.tone.example.0.do', dont: 'knowledge.tone.example.0.dont' },
  { do: 'knowledge.tone.example.1.do', dont: 'knowledge.tone.example.1.dont' },
  { do: 'knowledge.tone.example.2.do', dont: 'knowledge.tone.example.2.dont' },
];

const TRAIT_COLORS: Record<string, { pill: string; dot: string }> = {
  amber:   { pill: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-400'   },
  indigo:  { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400'  },
  blue:    { pill: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400'    },
  emerald: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  slate:   { pill: 'bg-slate-100 text-slate-700 border-slate-200',   dot: 'bg-slate-400'   },
};
// `TONE_TRAITS` and `TRAIT_COLORS` are kept for future use; not currently rendered.
void TONE_TRAITS;
void TRAIT_COLORS;

function ToneOfVoiceCard() {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(() => t('knowledge.tone.description'));
  const [draft, setDraft] = useState(description);

  const save = () => { setDescription(draft); setEditing(false); };
  const cancel = () => { setDraft(description); setEditing(false); };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">

      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-900">{t('knowledge.tone.heading')}</h2>
        <button
          onClick={() => setEditing(true)}
          className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Pencil className="w-3 h-3" /> {t('common.action.edit')}
        </button>
      </div>

      {/* Brand voice description */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
            className="w-full text-sm text-slate-700 leading-relaxed border border-blue-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={save} className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors">{t('common.action.save')}</button>
            <button onClick={cancel} className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">{t('common.action.cancel')}</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      )}

      {/* Do / Don't examples */}
      <div>
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-800">{t('knowledge.tone.dosDonts.heading')}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t('knowledge.tone.dosDonts.subtitle')}</p>
        </div>
        <div className="space-y-2">
          {TONE_EXAMPLE_KEYS.map((ex, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-relaxed">{t(ex.do)}</p>
              </div>
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <ThumbsDown className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{t(ex.dont)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── School Profile Tab ───────────────────────────────────────────────────────

const FACT_KEYS = [
  'knowledge.school.fact.0',
  'knowledge.school.fact.1',
  'knowledge.school.fact.2',
  'knowledge.school.fact.3',
  'knowledge.school.fact.4',
  'knowledge.school.fact.5',
  'knowledge.school.fact.6',
  'knowledge.school.fact.7',
];

interface Memory { id: string; text: string }

function SchoolProfileTab() {
  const t = useT();
  // Snapshot the seeded facts in the active language at first render. New
  // user-added memories are stored as plain text.
  const [memories, setMemories] = useState<Memory[]>(() =>
    FACT_KEYS.map((k, i) => ({ id: String(i + 1), text: t(k) }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const startEdit = (m: Memory) => { setEditingId(m.id); setDraft(m.text); };
  const saveEdit = () => {
    if (draft.trim()) setMemories(prev => prev.map(m => m.id === editingId ? { ...m, text: draft.trim() } : m));
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);
  const remove = (id: string) => setMemories(prev => prev.filter(m => m.id !== id));
  const addMemory = () => {
    if (newText.trim()) {
      setMemories(prev => [...prev, { id: Date.now().toString(), text: newText.trim() }]);
      setNewText('');
      setAdding(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-2">

      {memories.map(m => (
        <div
          key={m.id}
          className="group flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:border-slate-300 transition-colors"
        >
          {editingId === m.id ? (
            <div className="flex-1 space-y-2">
              <textarea
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') cancelEdit(); }}
                rows={2}
                className="w-full text-sm text-slate-800 leading-relaxed border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">{t('common.action.save')}</button>
                <button onClick={cancelEdit} className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">{t('common.action.cancel')}</button>
              </div>
            </div>
          ) : (
            <>
              <p className="flex-1 text-sm text-slate-700 leading-relaxed pt-0.5">{m.text}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
                <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Add new memory */}
      {adding ? (
        <div className="bg-white border border-blue-300 rounded-xl px-4 py-3 shadow-sm space-y-2">
          <textarea
            autoFocus
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addMemory(); } if (e.key === 'Escape') { setAdding(false); setNewText(''); } }}
            placeholder={t('knowledge.school.addPlaceholder')}
            rows={2}
            className="w-full text-sm text-slate-800 leading-relaxed focus:outline-none resize-none placeholder:text-slate-400"
          />
          <div className="flex gap-2">
            <button onClick={addMemory} className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">{t('common.action.add')}</button>
            <button onClick={() => { setAdding(false); setNewText(''); }} className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">{t('common.action.cancel')}</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          <span className="text-lg leading-none">+</span> {t('knowledge.school.addFact')}
        </button>
      )}
    </div>
  );
}

// ─── Integrations Tab ────────────────────────────────────────────────────────

interface IntegrationDef {
  name: string;
  typeKey: string;
  descKey: string;
  domain: string;
  defaultLive: boolean;
}

const INTEGRATIONS_BY_REGION: Record<string, IntegrationDef[]> = {
  US: [
    {
      name: 'PowerSchool',
      typeKey: 'knowledge.integrations.type.sis',
      descKey: 'knowledge.integrations.powerschool.desc',
      domain: 'powerschool.com',
      defaultLive: true,
    },
    {
      name: 'Google Analytics',
      typeKey: 'knowledge.integrations.type.analytics',
      descKey: 'knowledge.integrations.googleAnalytics.desc',
      domain: 'analytics.google.com',
      defaultLive: true,
    },
    {
      name: 'ClassDojo',
      typeKey: 'knowledge.integrations.type.engagement',
      descKey: 'knowledge.integrations.classdojo.desc',
      domain: 'classdojo.com',
      defaultLive: true,
    },
  ],
  Germany: [
    {
      name: 'WebUntis',
      typeKey: 'knowledge.integrations.type.sis',
      descKey: 'knowledge.integrations.webuntis.desc',
      domain: 'webuntis.com',
      defaultLive: true,
    },
    {
      name: 'Matomo',
      typeKey: 'knowledge.integrations.type.analytics',
      descKey: 'knowledge.integrations.matomo.desc',
      domain: 'matomo.org',
      defaultLive: true,
    },
    {
      name: 'Sdui',
      typeKey: 'knowledge.integrations.type.comms',
      descKey: 'knowledge.integrations.sdui.desc',
      domain: 'sdui.de',
      defaultLive: true,
    },
  ],
};

function IntegrationsTab({ connectedSystems, setConnectedSystems, onNavigate }: {
  connectedSystems: any[];
  setConnectedSystems: (s: any[]) => void;
  actions: any[];
  setActions: (a: any[]) => void;
  onNavigate: (tab: string) => void;
}) {
  const t = useT();
  const region = useRegion();
  const [connecting, setConnecting] = useState<string | null>(null);

  const integrations = INTEGRATIONS_BY_REGION[region.id] ?? INTEGRATIONS_BY_REGION.US;

  const handleConnect = (name: string, type: string) => {
    setConnecting(name);
    setTimeout(() => {
      setConnectedSystems([...connectedSystems, { name, type, status: 'connected', lastSync: 'Just now' }]);
      setConnecting(null);
    }, 1500);
  };

  const isConnected = (name: string) =>
    integrations.find(i => i.name === name)?.defaultLive ||
    connectedSystems.some((s: any) => s.name === name);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(intg => (
          <IntegrationCard
            key={intg.name}
            name={intg.name}
            description={t(intg.descKey)}
            domain={intg.domain}
            isConnected={isConnected(intg.name)}
            isConnecting={connecting === intg.name}
            onConnect={() => handleConnect(intg.name, t(intg.typeKey))}
          />
        ))}
      </div>
      <button
        onClick={() => onNavigate('utilities')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors px-1"
      >
        <span className="text-lg leading-none">+</span> {t('knowledge.integrations.addMore')}
      </button>
    </div>
  );
}

function IntegrationCard({ name, description, domain, isConnected, isConnecting, onConnect }: {
  name: string; description: string; domain: string;
  isConnected: boolean; isConnecting: boolean; onConnect: () => void;
}) {
  const t = useT();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
            alt={name}
            className="w-6 h-6 object-contain"
          />
        </div>
        {isConnected && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('knowledge.integrations.connected')}
          </span>
        )}
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1.5">{name}</h3>
      <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">{description}</p>
      {!isConnected ? (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <><div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" /> {t('knowledge.integrations.authenticating')}</>
          ) : t('knowledge.integrations.connect')}
        </button>
      ) : (
        <button className="w-full py-2 rounded-lg text-xs font-bold text-slate-400 border border-slate-200 cursor-not-allowed">
          {t('knowledge.integrations.manageSettings')}
        </button>
      )}
    </div>
  );
}

// ─── School Files Tab ─────────────────────────────────────────────────────────

interface SchoolFilesTabProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onFiles: (files: FileList | null) => void;
  dragOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

function SchoolFilesTab({
  files, onRemove, onFiles, dragOver,
  onDragOver, onDragLeave, onDrop, fileInputRef
}: SchoolFilesTabProps) {
  const t = useT();
  return (
    <div className="max-w-3xl space-y-5">

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); onDragOver(); }}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
        )}
      >
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          <Upload className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            {dragOver ? t('knowledge.files.dropOnDragOver') : t('knowledge.files.dropZone')}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{t('knowledge.files.browseHint')}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => onFiles(e.target.files)}
        />
      </div>

      {/* File count header */}
      {files.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-slate-700">
            {t(files.length === 1 ? 'knowledge.files.uploadedCount.one' : 'knowledge.files.uploadedCount.other', { count: files.length })}
          </p>
          <p className="text-xs text-slate-400">{t('knowledge.files.uploadedHover')}</p>
        </div>
      )}

      {/* File list */}
      {files.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <File className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{t('knowledge.files.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(file => (
            <div
              key={file.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {getFileIcon(file.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)} · {t('knowledge.files.uploadedAt', { date: file.uploadedAt })}</p>
              </div>
              <button
                onClick={() => onRemove(file.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400"
                title={t('knowledge.files.removeTooltip')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          <span className="font-semibold">{t('knowledge.files.tipPrefix')}</span>{' '}{t('knowledge.files.tipBody')}
        </p>
      </div>
    </div>
  );
}
