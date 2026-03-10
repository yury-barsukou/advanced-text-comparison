import { useEffect } from 'react';
import { GitCompareArrows, BarChart3, Coins, GitMerge } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { DualEditor } from './components/Editor/DualEditor';
import { DiffViewer } from './components/Diff/DiffViewer';
import { StatisticsPanel } from './components/Statistics/StatisticsPanel';
import { TokenCounterPanel } from './components/Tokens/TokenCounterPanel';
import { MergeEditor } from './components/Merge/MergeEditor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useComparisonStore } from './stores/comparisonStore';
import type { TabId } from './types';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'diff', label: 'Diff', icon: <GitCompareArrows className="h-4 w-4" /> },
  { id: 'merge', label: 'Merge', icon: <GitMerge className="h-4 w-4" /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'tokens', label: 'Tokens', icon: <Coins className="h-4 w-4" /> },
];

function TabPanel() {
  const activeTab = useComparisonStore((s) => s.activeTab);

  switch (activeTab) {
    case 'diff':
      return <DiffViewer />;
    case 'merge':
      return <MergeEditor />;
    case 'statistics':
      return <StatisticsPanel />;
    case 'tokens':
      return <TokenCounterPanel />;
  }
}

export default function App() {
  const theme = useComparisonStore((s) => s.theme);
  const activeTab = useComparisonStore((s) => s.activeTab);
  const setActiveTab = useComparisonStore((s) => s.setActiveTab);
  const compare = useComparisonStore((s) => s.compare);
  const toggleTheme = useComparisonStore((s) => s.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        compare();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compare, toggleTheme]);

  return (
    <div className="flex h-full flex-col transition-colors duration-200">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex-shrink-0" style={{ height: 'clamp(250px, 42vh, 500px)' }}>
          <DualEditor />
        </div>

        <div className="flex-shrink-0 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-screen-2xl">
            <nav className="flex gap-0 overflow-x-auto px-4" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950" role="tabpanel">
          <div className="mx-auto max-w-screen-2xl">
            <ErrorBoundary fallbackMessage="This panel encountered an error. Try clicking 'Compare' again.">
              <TabPanel />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
