import { Sun, Moon, GitCompareArrows } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';
import { LanguageSelector } from '../Editor/LanguageSelector';

function ThemeToggle() {
  const theme = useComparisonStore((s) => s.theme);
  const toggleTheme = useComparisonStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className={`
        relative inline-flex h-7 w-[3.25rem] flex-shrink-0 cursor-pointer items-center
        rounded-full border-2 border-transparent outline-none
        transition-colors duration-300 ease-in-out
        focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
        focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
        ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}
      `}
    >
      {/* sliding knob */}
      <span
        className={`
          pointer-events-none flex h-5 w-5 items-center justify-center
          rounded-full bg-white shadow-md ring-0
          transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-[1.625rem]' : 'translate-x-0.5'}
        `}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-indigo-600" />
        ) : (
          <Sun className="h-3 w-3 text-amber-500" />
        )}
      </span>
    </button>
  );
}

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-lg font-semibold tracking-tight">
            Advanced Text Compare
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
