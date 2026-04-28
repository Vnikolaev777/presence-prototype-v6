import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { AiWorkspaceView } from './components/AiWorkspaceView';
import { OurTeamView } from './components/OurTeamView';
import { TasksView } from './components/TasksView';
import { HiredAgentsChatView } from './components/HiredAgentsChatView';
import { UtilitiesHubView } from './components/UtilitiesHubView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { AppsForSchoolsView } from './components/AppsForSchoolsView';
import {
  Sparkles, Users, Layers, BookOpen, Zap,
  ListTodo, ChevronDown, ChevronRight, Menu, X, LayoutGrid,
} from 'lucide-react';
import { cn } from './lib/utils';
import type { AiAction } from './data/mockData';
import { MOCK_AI_ACTIONS, MOCK_STATS, MOCK_AGENTS } from './data/mockData';

export type TabType =
  | 'dashboard'
  | 'workspace'
  | 'team'
  | 'tasks'
  | 'hired_agents'
  | 'utilities'
  | 'knowledge_base'
  | 'apps_for_schools';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');
  const [teamExpanded, setTeamExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App-level state to power the demo continuity
  const [actions, setActions] = useState<AiAction[]>(MOCK_AI_ACTIONS);
  const [connectedSystems, setConnectedSystems] = useState<any[]>(MOCK_STATS.connectedSystems);
  const [agents, setAgents] = useState<any[]>(MOCK_AGENTS);

  // Scenario state
  const [hasHiredAgents, setHasHiredAgents] = useState(false);       // true after migrate scenario
  const [hasMonitoringSetup, setHasMonitoringSetup] = useState(false); // true after monitoring scenario
  const [hasAutoUpdatesSetup, setHasAutoUpdatesSetup] = useState(false); // true after auto-updates scenario
  const showTeamNav = false; // hidden for now, re-enable when ready

  return (
    <div className="h-screen bg-slate-50 text-slate-900 relative selection:bg-blue-500/20 flex flex-col overflow-hidden">
      {/* Background ambient glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[150px]" />
      </div>

      {/* Navigation / Header */}
      <header className="h-16 border-b border-slate-200/60 flex items-center justify-between px-6 bg-white/70 backdrop-blur-md sticky top-0 z-40 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)]" aria-label="Presence AI">
            AI
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-base tracking-tight text-slate-900 leading-tight">
              Presence <span className="text-blue-600 font-semibold">by IONOS</span>
            </h1>
            <span className="text-xs text-slate-500 font-medium tracking-wide">AI Autonomous websites for K–12</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 items-center justify-center text-sm font-semibold text-slate-700 hidden md:flex">
            JD
          </div>
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 z-30 p-3 space-y-1 shrink-0">
          <NavItem active={activeTab === 'workspace'} onClick={() => { setActiveTab('workspace'); setMobileMenuOpen(false); }} icon={<Sparkles className="w-5 h-5" />} label="Presence Assistant" />
          <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} icon={<Zap className="w-5 h-5" />} label="Automations" />
          {showTeamNav && hasHiredAgents && <>
            <NavItem active={activeTab === 'team'} onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); }} icon={<Users className="w-5 h-5" />} label="Team" />
            <NavItem active={activeTab === 'tasks'} onClick={() => { setActiveTab('tasks'); setMobileMenuOpen(false); }} icon={<ListTodo className="w-5 h-5" />} label="Tasks" />
          </>}
          <NavItem active={activeTab === 'utilities'} onClick={() => { setActiveTab('utilities'); setMobileMenuOpen(false); }} icon={<Layers className="w-5 h-5" />} label="Integrations" />
          <NavItem active={activeTab === 'knowledge_base'} onClick={() => { setActiveTab('knowledge_base'); setMobileMenuOpen(false); }} icon={<BookOpen className="w-5 h-5" />} label="Institution Context" />
          <NavItem active={activeTab === 'apps_for_schools'} onClick={() => { setActiveTab('apps_for_schools'); setMobileMenuOpen(false); }} icon={<LayoutGrid className="w-5 h-5" />} label="Recommended Apps" />
        </div>
      )}

      {/* Main layout wrapper */}
      <div className="flex-1 flex overflow-hidden z-10">

        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/50 border-r border-slate-200/60 backdrop-blur-md hidden md:flex flex-col p-4 shrink-0 overflow-y-auto">
          <nav className="space-y-1">
            <NavItem
              active={activeTab === 'workspace'}
              onClick={() => setActiveTab('workspace')}
              icon={<Sparkles className="w-5 h-5" />}
              label="Presence Assistant"
            />
            <NavItem
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              icon={<Zap className="w-5 h-5" />}
              label="Automations"
            />

            {showTeamNav && hasHiredAgents && (
              <div className="space-y-0.5">
                {/* Expandable group header */}
                <button
                  onClick={() => setTeamExpanded(v => !v)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm border',
                    (activeTab === 'team' || activeTab === 'tasks')
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Our Team (AI)
                  </div>
                  {teamExpanded
                    ? <ChevronDown className="w-4 h-4 opacity-50" />
                    : <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>

                {/* Sub-items */}
                {teamExpanded && (
                  <div className="ml-4 pl-3 border-l border-slate-200 space-y-0.5">
                    <NavItem
                      active={activeTab === 'team'}
                      onClick={() => setActiveTab('team')}
                      icon={<Users className="w-4 h-4" />}
                      label="Team"
                      small
                    />
                    <NavItem
                      active={activeTab === 'tasks'}
                      onClick={() => setActiveTab('tasks')}
                      icon={<ListTodo className="w-4 h-4" />}
                      label="Tasks"
                      small
                    />
                  </div>
                )}
              </div>
            )}

            <NavItem
              active={activeTab === 'utilities'}
              onClick={() => setActiveTab('utilities')}
              icon={<Layers className="w-5 h-5" />}
              label="Integrations"
            />
            <NavItem
              active={activeTab === 'knowledge_base'}
              onClick={() => setActiveTab('knowledge_base')}
              icon={<BookOpen className="w-5 h-5" />}
              label="Institution Context"
            />
            <hr className="border-slate-200 mx-2 my-3" />
            <NavItem
              active={activeTab === 'apps_for_schools'}
              onClick={() => setActiveTab('apps_for_schools')}
              icon={<LayoutGrid className="w-5 h-5" />}
              label="Recommended Apps"
            />
          </nav>
        </aside>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              actions={actions}
              connectedSystems={connectedSystems}
              agents={agents}
              onNavigate={setActiveTab}
              hasHiredAgents={hasHiredAgents}
              hasMonitoringSetup={hasMonitoringSetup}
              hasAutoUpdatesSetup={hasAutoUpdatesSetup}
            />
          )}
          {activeTab === 'hired_agents' && (
            <HiredAgentsChatView
              actions={actions}
              setActions={setActions}
              connectedSystems={connectedSystems}
              setConnectedSystems={setConnectedSystems}
              agents={agents}
              setAgents={setAgents}
            />
          )}
          {activeTab === 'workspace' && (
            <AiWorkspaceView
              onAgentsHired={() => setHasHiredAgents(true)}
              onFinishScenario={() => setActiveTab('dashboard')}
              onMonitoringComplete={() => setHasMonitoringSetup(true)}
              onAutoUpdatesComplete={() => {
                setHasAutoUpdatesSetup(true);
                setHasHiredAgents(true);
              }}
            />
          )}
          {activeTab === 'team' && (
            <OurTeamView
              agents={agents}
              connectedSystems={connectedSystems}
              autoUpdatesCount={actions.filter((a: any) => a.status === 'auto-applied' && a.isInternal).length}
            />
          )}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'utilities' && <UtilitiesHubView />}
          {activeTab === 'knowledge_base' && (
            <KnowledgeBaseView
              connectedSystems={connectedSystems}
              setConnectedSystems={setConnectedSystems}
              actions={actions}
              setActions={setActions}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'apps_for_schools' && <AppsForSchoolsView />}
        </main>
      </div>

    </div>
  );
}

function NavItem({
  active, onClick, icon, label, badge, small,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-4 rounded-xl font-medium transition-all text-sm border',
        small ? 'py-2' : 'py-3',
        active
          ? 'bg-blue-50 text-blue-700 shadow-sm border-blue-100'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent'
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {(badge !== undefined && badge > 0) && (
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

export default App;
