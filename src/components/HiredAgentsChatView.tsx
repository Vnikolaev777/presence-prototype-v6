import { useState, useRef, useEffect } from 'react';
import { PenTool, Code2, Send, CheckCircle, Eye } from 'lucide-react';
import { ContentView } from './ContentView';
import { SourcesView } from './SourcesView';
import { AgentsView } from './AgentsView';
import { AiReviewModal } from './AiReviewModal';
import { cn } from '../lib/utils';
import { useT } from '../lib/i18n';
import type { AiAction } from '../data/mockData';
import type { Teacher, BlogPost } from '../data/schoolData';

interface HiredAgentsChatViewProps {
  actions: AiAction[];
  setActions: any;
  connectedSystems: any[];
  setConnectedSystems: any;
  agents: any[];
  setAgents: any;
}

type AgentType = 'content' | 'admin';

type ChatMessage = {
  id: number;
  role: string;
  content: string;
  isTyping?: boolean;
  actionId?: string; // links to a generated AiAction
};

/** Translation function shape — accepts a key plus optional {var} substitutions. */
type T = (key: string, vars?: Record<string, string | number>) => string;

// ── Intent parser ─────────────────────────────────────────────────────────────
// Bilingual: matches both English and German keywords so a German user can
// type natural German prompts and trigger the same flows.

function parseIntent(text: string): 'add_teacher' | 'add_blog_post' | 'unknown' {
  const t = text.toLowerCase();
  const addV = '(add|new|hire|create|introduce|hinzufügen|hinzufuegen|anlegen|einstellen|erstellen|neu)';
  const teacherN = '(teacher|professor|faculty|staff|instructor|lehrer|lehrerin|lehrkraft|dozent|dozentin)';
  const writeV = '(add|new|write|publish|create|post|schreiben|veröffentlichen|veroeffentlichen|erstellen|posten|verfassen)';
  const blogN = '(blog|post|article|news|announcement|beitrag|artikel|nachricht|ankündigung|ankuendigung|mitteilung)';

  if (new RegExp(`\\b${addV}\\b.*\\b${teacherN}\\b`, 'i').test(t)
    || new RegExp(`\\b${teacherN}\\b.*\\b${addV}\\b`, 'i').test(t)) return 'add_teacher';
  if (new RegExp(`\\b${writeV}\\b.*\\b${blogN}\\b`, 'i').test(t)
    || new RegExp(`\\b${blogN}\\b.*\\b${writeV}\\b`, 'i').test(t)) return 'add_blog_post';
  return 'unknown';
}

function extractName(text: string): string | null {
  const m = text.match(/\b(Mr\.|Ms\.|Mrs\.|Dr\.|Herr|Frau)\s+([A-ZÄÖÜ][a-zäöüß]+)/);
  return m ? `${m[1]} ${m[2]}` : null;
}

/**
 * Map of English + German subject keywords to translation keys. The keyword on
 * the left is matched against the user's input (case-insensitive); the value on
 * the right resolves to the displayed subject name in the active language.
 */
function extractSubjectKey(text: string): string {
  const subjects: Record<string, string> = {
    // English
    math: 'chat.subject.mathematics',
    calculus: 'chat.subject.advancedCalculus',
    algebra: 'chat.subject.algebra',
    science: 'chat.subject.science',
    biology: 'chat.subject.apBiology',
    chemistry: 'chat.subject.chemistry',
    physics: 'chat.subject.physics',
    english: 'chat.subject.englishLit',
    history: 'chat.subject.worldHistory',
    geography: 'chat.subject.geography',
    'computer science': 'chat.subject.computerScience',
    cs: 'chat.subject.computerScience',
    coding: 'chat.subject.computerScience',
    art: 'chat.subject.visualArts',
    music: 'chat.subject.music',
    pe: 'chat.subject.physicalEducation',
    sports: 'chat.subject.athletics',
    economics: 'chat.subject.economics',
    psychology: 'chat.subject.psychology',
    // German
    mathe: 'chat.subject.mathematics',
    mathematik: 'chat.subject.mathematics',
    naturwissenschaft: 'chat.subject.science',
    biologie: 'chat.subject.apBiology',
    chemie: 'chat.subject.chemistry',
    physik: 'chat.subject.physics',
    englisch: 'chat.subject.englishLit',
    geschichte: 'chat.subject.worldHistory',
    geographie: 'chat.subject.geography',
    erdkunde: 'chat.subject.geography',
    informatik: 'chat.subject.computerScience',
    kunst: 'chat.subject.visualArts',
    musik: 'chat.subject.music',
    sport: 'chat.subject.athletics',
    wirtschaft: 'chat.subject.economics',
    psychologie: 'chat.subject.psychology',
  };
  const t = text.toLowerCase();
  for (const [keyword, key] of Object.entries(subjects)) {
    if (t.includes(keyword)) return key;
  }
  return 'chat.subject.generalStudies';
}

function extractDepartmentKey(text: string): string {
  const t = text.toLowerCase();
  if (/\b(math|calculus|algebra|mathe|mathematik)\b/.test(t)) return 'chat.department.mathematics';
  if (/\b(science|biology|chemistry|physics|naturwissenschaft|biologie|chemie|physik)\b/.test(t)) return 'chat.department.science';
  if (/\b(english|englisch)\b/.test(t)) return 'chat.department.english';
  if (/\b(history|geography|geschichte|geographie|erdkunde)\b/.test(t)) return 'chat.department.socialStudies';
  if (/\b(computer science|cs|coding|informatik)\b/.test(t)) return 'chat.department.stem';
  if (/\b(art|music|kunst|musik)\b/.test(t)) return 'chat.department.arts';
  if (/\b(pe|sports|athletic|sport)\b/.test(t)) return 'chat.department.athletics';
  return 'chat.department.general';
}

function buildTeacherAction(text: string, t: T): AiAction {
  const name = extractName(text) || t('chat.action.teacher.defaultName');
  const subject = t(extractSubjectKey(text));
  const dept = t(extractDepartmentKey(text));

  const photoIndex = Math.floor(Math.random() * 40) + 20;
  const isFemale = name.startsWith('Ms.') || name.startsWith('Mrs.') || name.startsWith('Frau');
  const photo = `https://randomuser.me/api/portraits/${isFemale ? 'women' : 'men'}/${photoIndex}.jpg`;

  const teacher: Teacher = {
    name,
    role: subject,
    department: dept,
    photo,
    tag: t('chat.action.teacher.tag'),
    bio: t('chat.action.teacher.bio', { subject }),
  };

  return {
    id: `chat_teacher_${Date.now()}`,
    source: t('chat.action.source'),
    sourceType: 'chat',
    isInternal: true,
    title: t('chat.action.teacher.title', { name }),
    summary: t('chat.action.teacher.summary', { name, subject, dept }),
    confidence: 0.95,
    proposedChanges: [
      t('chat.action.teacher.change.0', { name }),
      t('chat.action.teacher.change.1', { dept }),
      t('chat.action.teacher.change.2'),
    ],
    status: 'pending',
    timestamp: t('chat.action.timestamp'),
    previewType: 'new_teacher',
    pendingChanges: { newTeacher: teacher },
  };
}

function buildBlogAction(text: string, t: T): AiAction {
  const topicMatch = text.match(/about\s+(.+?)(?:\.|$)/i)
    || text.match(/(?:post|article|blog|beitrag|artikel)\s+(?:on|about|for|über|zu)\s+(.+?)(?:\.|$)/i);
  const topicHint = topicMatch ? topicMatch[1].trim() : t('chat.action.blog.defaultTopic');

  const titleStr = t('chat.action.blog.title', { topic: topicHint.charAt(0).toUpperCase() + topicHint.slice(1) });
  const excerpt = t('chat.action.blog.excerpt', { topic: topicHint });

  const post: BlogPost = {
    id: `chat_post_${Date.now()}`,
    title: titleStr,
    excerpt,
    image: '',
    category: t('chat.action.blog.category'),
  };

  return {
    id: `chat_blog_${Date.now()}`,
    source: t('chat.action.source'),
    sourceType: 'chat',
    isInternal: true,
    title: t('chat.action.blog.actionTitle', { title: titleStr }),
    summary: t('chat.action.blog.summary', { topic: topicHint }),
    confidence: 0.92,
    proposedChanges: [
      t('chat.action.blog.change.0', { title: titleStr }),
      t('chat.action.blog.change.1'),
      t('chat.action.blog.change.2'),
    ],
    status: 'pending',
    timestamp: t('chat.action.timestamp'),
    previewType: 'new_blog_post',
    pendingChanges: { newBlogPost: post },
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HiredAgentsChatView({
  actions, setActions, connectedSystems, setConnectedSystems, agents, setAgents
}: HiredAgentsChatViewProps) {
  const t = useT();
  const [activeAgent, setActiveAgent] = useState<AgentType>('content');
  const [inputText, setInputText] = useState('');
  const [reviewAction, setReviewAction] = useState<AiAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial messages — snapshot in the language at first render. Switching
  // language later doesn't retranslate already-shown messages (matches how a
  // real chat works).
  const [messages, setMessages] = useState<Record<AgentType, ChatMessage[]>>(() => ({
    content: [
      { id: 1, role: 'agent', content: t('chat.greet.content') }
    ],
    admin: [
      { id: 1, role: 'agent', content: t('chat.greet.admin') }
    ],
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (agent: AgentType, msg: Omit<ChatMessage, 'id'>) => {
    setMessages(prev => ({
      ...prev,
      [agent]: [...prev[agent], { id: Date.now() + Math.random(), ...msg }]
    }));
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    const agent = activeAgent;
    addMessage(agent, { role: 'user', content: text });
    setInputText('');

    if (agent !== 'content') {
      setTimeout(() => {
        addMessage(agent, { role: 'agent', content: t('chat.response.admin.recalibrate') });
      }, 900);
      return;
    }

    const intent = parseIntent(text);

    if (intent === 'unknown') {
      setTimeout(() => {
        addMessage(agent, { role: 'agent', content: t('chat.response.content.unknown') });
      }, 800);
      return;
    }

    const stepKeys = intent === 'add_teacher'
      ? ['chat.steps.teacher.0', 'chat.steps.teacher.1', 'chat.steps.teacher.2', 'chat.steps.teacher.3']
      : ['chat.steps.blog.0',    'chat.steps.blog.1',    'chat.steps.blog.2',    'chat.steps.blog.3'];

    stepKeys.forEach((stepKey, i) => {
      const isLast = i === stepKeys.length - 1;
      setTimeout(() => {
        if (!isLast) {
          addMessage(agent, { role: 'agent', content: t(stepKey) });
        } else {
          const action = intent === 'add_teacher' ? buildTeacherAction(text, t) : buildBlogAction(text, t);
          setActions((prev: AiAction[]) => [action, ...prev]);
          addMessage(agent, { role: 'agent', content: t(stepKey), actionId: action.id });
        }
      }, 700 + i * 900);
    });
  };

  const agentNameKey = activeAgent === 'content'
    ? 'ourTeam.activity.agent.contentCreator'
    : 'ourTeam.activity.agent.webAdmin';
  const agentName = t(agentNameKey);

  return (
    <>
    <div className="flex h-[calc(100vh-6rem)] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">

      {/* LEFT SIDEBAR: AGENT SELECTION */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <span className="font-bold text-slate-800">{t('chat.heading')}</span>
        </div>

        <div className="p-2 space-y-2 flex-1">
          <button
            onClick={() => setActiveAgent('content')}
            className={cn(
              "w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors",
              activeAgent === 'content' ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-200/50 border border-transparent"
            )}
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", activeAgent === 'content' ? "bg-emerald-500 text-white" : "bg-white text-emerald-600")}>
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{t('ourTeam.activity.agent.contentCreator')}</p>
              <p className="text-xs text-slate-500">CC Wordsworth</p>
            </div>
          </button>

          <button
            onClick={() => setActiveAgent('admin')}
            className={cn(
              "w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors",
              activeAgent === 'admin' ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-200/50 border border-transparent"
            )}
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", activeAgent === 'admin' ? "bg-blue-600 text-white" : "bg-white text-blue-600")}>
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{t('ourTeam.activity.agent.webAdmin')}</p>
              <p className="text-xs text-slate-500">W.A. Turing</p>
            </div>
          </button>
        </div>
      </div>

      {/* CENTER: CHAT WINDOW */}
      <div className="flex-1 min-w-[350px] flex flex-col border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="h-16 border-b border-slate-200 flex items-center px-6 shrink-0 gap-3">
          {activeAgent === 'content' ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><PenTool className="w-4 h-4 text-emerald-600"/></div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Code2 className="w-4 h-4 text-blue-600"/></div>
          )}
          <div>
            <h2 className="font-bold text-slate-800 text-sm">
              {t('chat.directLine', { agent: agentName })}
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {t('chat.online')}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages[activeAgent].map((msg) => (
            <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed",
                msg.role === 'user'
                  ? "bg-slate-800 text-white rounded-br-sm"
                  : (activeAgent === 'content' ? "bg-emerald-50 border border-emerald-100 text-slate-800 font-medium rounded-bl-sm" : "bg-blue-50 border border-blue-100 text-slate-800 font-medium rounded-bl-sm")
              )}>
                {msg.content}
              </div>
              {msg.actionId && (
                <button
                  onClick={() => {
                    const action = actions.find(a => a.id === msg.actionId);
                    if (action) setReviewAction(action);
                  }}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {t('chat.reviewProposedChange')}
                </button>
              )}
              <span className="text-[10px] font-bold text-slate-400 mt-1">{msg.role === 'user' ? t('chat.sender.you') : (activeAgent === 'content' ? 'CC Wordsworth' : 'W.A. Turing')}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="relative flex items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={t('chat.input.placeholder', { agent: agentName })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none max-h-32 min-h-[48px]"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className={cn("absolute right-2 bottom-2 p-1.5 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50", activeAgent === 'content' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700")}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: CONTEXT "DESK" */}
      <div className="w-[55%] flex flex-col bg-slate-100/50 shrink-0 overflow-y-auto relative hidden xl:block shadow-inner">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 flex items-center justify-between z-10">
          <span className="uppercase tracking-widest">{activeAgent === 'content' ? t('chat.rightPanel.header.content') : t('chat.rightPanel.header.admin')}</span>
          <CheckCircle className={cn("w-3 h-3", activeAgent === 'content' ? "text-emerald-500" : "text-blue-500")} />
        </div>

        <div className="p-4 w-full h-full">
          {activeAgent === 'content' ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-full overflow-y-auto w-full scale-[0.80] origin-top">
               <ContentView actions={actions} setActions={setActions} />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-full overflow-y-auto w-full scale-[0.85] origin-top">
               <SourcesView
                  connectedSystems={connectedSystems}
                  setConnectedSystems={setConnectedSystems}
                  actions={actions}
                  setActions={setActions}
               />
               <div className="mt-8 border-t border-slate-200 pt-8 pb-12">
                 <h2 className="px-8 text-xl font-bold mb-4">{t('chat.rightPanel.coreAgents')}</h2>
                 <AgentsView agents={agents} setAgents={setAgents} />
               </div>
            </div>
          )}
        </div>
      </div>

    </div>

    {/* Review Modal */}
    {reviewAction && (
      <AiReviewModal
        action={reviewAction}
        onClose={() => setReviewAction(null)}
        onComplete={(id, status) => {
          setActions((prev: AiAction[]) => prev.map(a => a.id === id ? { ...a, status } : a));
          setReviewAction(null);
        }}
      />
    )}
    </>
  );
}
