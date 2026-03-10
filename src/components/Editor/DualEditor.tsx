import Editor from '@monaco-editor/react';
import { ArrowLeftRight, Trash2, GitCompareArrows, Loader2 } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';

function EditorLoading() {
  return (
    <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export function DualEditor() {
  const leftText = useComparisonStore((s) => s.leftText);
  const rightText = useComparisonStore((s) => s.rightText);
  const language = useComparisonStore((s) => s.language);
  const theme = useComparisonStore((s) => s.theme);
  const setLeftText = useComparisonStore((s) => s.setLeftText);
  const setRightText = useComparisonStore((s) => s.setRightText);
  const compare = useComparisonStore((s) => s.compare);
  const swap = useComparisonStore((s) => s.swap);
  const clear = useComparisonStore((s) => s.clear);

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on' as const,
    wordWrap: 'on' as const,
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection' as const,
    padding: { top: 8 },
    automaticLayout: true,
    tabSize: 2,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
        <button
          onClick={compare}
          title="Compare texts (Ctrl+Enter)"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <GitCompareArrows className="h-4 w-4" />
          Compare
        </button>
        <button
          onClick={swap}
          title="Swap original and modified text"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap
        </button>
        <button
          onClick={clear}
          title="Clear both editors"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <div className="flex min-h-0 flex-col border-r border-gray-200 dark:border-gray-800">
          <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-1.5 dark:border-gray-800 dark:bg-gray-900/50">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Original Text
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language={language}
              theme={monacoTheme}
              value={leftText}
              onChange={(value) => setLeftText(value ?? '')}
              loading={<EditorLoading />}
              options={editorOptions}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-1.5 dark:border-gray-800 dark:bg-gray-900/50">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Modified Text
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language={language}
              theme={monacoTheme}
              value={rightText}
              onChange={(value) => setRightText(value ?? '')}
              loading={<EditorLoading />}
              options={editorOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
