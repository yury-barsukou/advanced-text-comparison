import { useCallback, useEffect, useRef, useState } from 'react';
import { Allotment } from 'allotment';
import type { AllotmentHandle } from 'allotment';
import { GitCompareArrows, BarChart3, Coins, GitMerge, Maximize2, Minimize2 } from 'lucide-react';
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
  { id: 'diff',       label: 'Diff',       icon: <GitCompareArrows className="h-4 w-4" /> },
  { id: 'merge',      label: 'Merge',      icon: <GitMerge className="h-4 w-4" /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'tokens',     label: 'Tokens',     icon: <Coins className="h-4 w-4" /> },
];

function TabPanel() {
  const activeTab = useComparisonStore((s) => s.activeTab);
  switch (activeTab) {
    case 'diff':       return <DiffViewer />;
    case 'merge':      return <MergeEditor />;
    case 'statistics': return <StatisticsPanel />;
    case 'tokens':     return <TokenCounterPanel />;
  }
}

export default function App() {
  const theme      = useComparisonStore((s) => s.theme);
  const activeTab  = useComparisonStore((s) => s.activeTab);
  const setActiveTab = useComparisonStore((s) => s.setActiveTab);
  const compare    = useComparisonStore((s) => s.compare);
  const toggleTheme = useComparisonStore((s) => s.toggleTheme);

  const splitRef  = useRef<AllotmentHandle>(null);
  const mainRef   = useRef<HTMLElement>(null);
  const [maximized, setMaximized] = useState(false);

  const toggleMaximize = useCallback(() => {
    if (maximized) {
      splitRef.current?.reset();
      setMaximized(false);
    } else {
      // Measure the real container height so resize values sum exactly to it.
      const totalHeight = mainRef.current?.clientHeight ?? 800;
      const editorMin   = 150;
      splitRef.current?.resize([editorMin, totalHeight - editorMin]);
      setMaximized(true);
    }
  }, [maximized]);

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
      // Ctrl+Shift+F — toggle maximize analysis panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        toggleMaximize();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compare, toggleTheme, toggleMaximize]);

  return (
    <div className="flex h-full flex-col transition-colors duration-200">
      <Header />

      <main ref={mainRef} className="min-h-0 flex-1">
        <Allotment ref={splitRef} vertical defaultSizes={[28, 72]}>
          {/* ── Top pane: editors ── */}
          <Allotment.Pane minSize={150} preferredSize="28%">
            <DualEditor />
          </Allotment.Pane>

          {/* ── Bottom pane: tab nav + tab content ── */}
          <Allotment.Pane minSize={180}>
            <div className="flex h-full flex-col">
              {/* Tab bar */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white pr-2 dark:border-gray-800 dark:bg-gray-900">
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

                {/* Maximize / restore button */}
                <button
                  onClick={toggleMaximize}
                  title={maximized ? 'Restore editors (Ctrl+Shift+F)' : 'Maximize analysis panel (Ctrl+Shift+F)'}
                  className="flex-shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  {maximized
                    ? <Minimize2 className="h-4 w-4" />
                    : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>

              {/* Tab content */}
              <div className="min-h-0 flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950" role="tabpanel">
                <ErrorBoundary fallbackMessage="This panel encountered an error. Try clicking 'Compare' again.">
                  <TabPanel />
                </ErrorBoundary>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </main>

      <Footer />
    </div>
  );
}
