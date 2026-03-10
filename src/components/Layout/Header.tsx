import { Sun, Moon, GitCompareArrows } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';
import { LanguageSelector } from '../Editor/LanguageSelector';

export function Header() {
  const theme = useComparisonStore((s) => s.theme);
  const toggleTheme = useComparisonStore((s) => s.toggleTheme);

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-lg font-semibold tracking-tight">
            Text Compare
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
