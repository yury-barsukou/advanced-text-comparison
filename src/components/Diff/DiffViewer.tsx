import { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Columns2, Rows2 } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';

export function DiffViewer() {
  const leftText    = useComparisonStore((s) => s.leftText);
  const rightText   = useComparisonStore((s) => s.rightText);
  const language    = useComparisonStore((s) => s.language);
  const theme       = useComparisonStore((s) => s.theme);
  const hasCompared = useComparisonStore((s) => s.hasCompared);

  const [renderSideBySide, setRenderSideBySide] = useState(true);

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  if (!hasCompared) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Enter text in both editors above and click "Compare" to see the diff.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Visual Diff
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
          <button
            onClick={() => setRenderSideBySide(true)}
            className={`rounded-md p-1.5 transition-colors ${
              renderSideBySide
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Side by side"
          >
            <Columns2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setRenderSideBySide(false)}
            className={`rounded-md p-1.5 transition-colors ${
              !renderSideBySide
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Inline"
          >
            <Rows2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Monaco diff editor — fills all remaining height */}
      <div className="min-h-0 flex-1">
        <DiffEditor
          height="100%"
          language={language}
          theme={monacoTheme}
          original={leftText}
          modified={rightText}
          options={{
            readOnly: true,
            renderSideBySide,
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
