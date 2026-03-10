import { useCallback, useEffect, useRef, useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Columns2, Rows2, ArrowUp, ArrowDown } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';

interface LineChange {
  originalStartLineNumber: number;
  originalEndLineNumber: number;
  modifiedStartLineNumber: number;
  modifiedEndLineNumber: number;
}

function getDiffChanges(ed: editor.IStandaloneDiffEditor): LineChange[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = ed as any;
  return any.getDiffComputationResult?.()?.changes ?? any.getLineChanges?.() ?? [];
}

/**
 * Attach a right-edge flash bar to a Monaco sub-editor.
 * The bar is placed inside `.overflow-guard` (viewport-sized) so `right:0`
 * always means the visible right edge regardless of content/horizontal scroll.
 * `top` and `height` are computed from content coordinates and kept in sync
 * with scroll via an `onDidScrollChange` listener.
 */
function attachRightEdgeBar(
  subEditor: editor.IStandaloneCodeEditor,
  startLine: number,
  endLine: number,
  durationMs: number,
  isDark: boolean,
): ReturnType<typeof setTimeout> {
  const domNode = subEditor.getDomNode();
  if (!domNode) return setTimeout(() => {}, 0);

  domNode.querySelector('.diff-nav-right-bar')?.remove();

  if (endLine === 0) return setTimeout(() => {}, 0); // pure insertion/deletion — no lines on this side

  const overflowGuard = domNode.querySelector('.overflow-guard') as HTMLElement | null;
  if (!overflowGuard) return setTimeout(() => {}, 0);

  const bar = document.createElement('div');
  bar.className = 'diff-nav-right-bar' + (isDark ? ' diff-nav-right-bar--dark' : '');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edAny = subEditor as any;

  function reposition() {
    const scrollTop = subEditor.getScrollTop();
    const startY    = (edAny.getTopForLineNumber(startLine)    as number) - scrollTop;
    const endY      = (edAny.getTopForLineNumber(endLine + 1)  as number) - scrollTop;
    bar.style.top    = `${startY}px`;
    bar.style.height = `${Math.max(endY - startY, 19)}px`;
  }

  reposition();
  overflowGuard.appendChild(bar);
  const scrollSub = subEditor.onDidScrollChange(reposition);

  return setTimeout(() => {
    bar.remove();
    scrollSub.dispose();
  }, durationMs);
}

/** Remove all flash bars from a sub-editor's DOM. */
function clearRightEdgeBar(subEditor: editor.IStandaloneCodeEditor) {
  subEditor.getDomNode()?.querySelector('.diff-nav-right-bar')?.remove();
}

export function DiffViewer() {
  const leftText    = useComparisonStore((s) => s.leftText);
  const rightText   = useComparisonStore((s) => s.rightText);
  const language    = useComparisonStore((s) => s.language);
  const theme       = useComparisonStore((s) => s.theme);
  const hasCompared = useComparisonStore((s) => s.hasCompared);

  const [renderSideBySide, setRenderSideBySide] = useState(true);
  const editorRef     = useRef<editor.IStandaloneDiffEditor | null>(null);
  const monacoRef     = useRef<Monaco | null>(null);
  // Per-line decoration IDs (left bars via CSS class on .view-line elements).
  const origDecorRef  = useRef<string[]>([]);
  const modDecorRef   = useRef<string[]>([]);
  // Active timers — cleared when a new navigation starts.
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);

  const FLASH_DURATION_MS = 4500;

  const [changeCount, setChangeCount] = useState(0);
  const [currentIdx,  setCurrentIdx]  = useState(0);

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';
  const isDark      = theme === 'dark';

  const clearAllDecorations = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    origDecorRef.current = ed.getOriginalEditor().deltaDecorations(origDecorRef.current, []);
    modDecorRef.current  = ed.getModifiedEditor().deltaDecorations(modDecorRef.current, []);
    clearRightEdgeBar(ed.getOriginalEditor());
    clearRightEdgeBar(ed.getModifiedEditor());
  }, []);

  const goToChange = useCallback((idx: number) => {
    const ed     = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco) return;

    const changes = getDiffChanges(ed);
    if (changes.length === 0) return;

    const clamped   = Math.max(0, Math.min(idx, changes.length - 1));
    const change    = changes[clamped];

    const origStart = change.originalStartLineNumber || 1;
    const origEnd   = change.originalEndLineNumber;     // 0 = pure insertion
    const modStart  = change.modifiedStartLineNumber  || 1;
    const modEnd    = change.modifiedEndLineNumber;     // 0 = pure deletion

    ed.getModifiedEditor().revealLineInCenter(modStart || 1, 1 /* ScrollType.Smooth */);

    clearAllDecorations();

    // ── Left bar on both panels via per-line CSS class ──
    origDecorRef.current = ed.getOriginalEditor().deltaDecorations(
      origDecorRef.current,
      origEnd !== 0 ? [{ range: new monaco.Range(origStart, 1, origEnd, Number.MAX_VALUE),
         options: { isWholeLine: true, className: 'diff-nav-highlight' } }] : [],
    );
    modDecorRef.current = ed.getModifiedEditor().deltaDecorations(
      modDecorRef.current,
      modEnd !== 0 ? [{ range: new monaco.Range(modStart, 1, modEnd, Number.MAX_VALUE),
         options: { isWholeLine: true, className: 'diff-nav-highlight' } }] : [],
    );

    // ── Right bar on both panels via DOM overlay on .overflow-guard ──
    const t1 = attachRightEdgeBar(ed.getOriginalEditor(), origStart, origEnd, FLASH_DURATION_MS, isDark);
    const t2 = attachRightEdgeBar(ed.getModifiedEditor(), modStart,  modEnd,  FLASH_DURATION_MS, isDark);

    // Clear the left-bar decorations after the animation ends.
    const t3 = setTimeout(() => {
      origDecorRef.current = ed.getOriginalEditor().deltaDecorations(origDecorRef.current, []);
      modDecorRef.current  = ed.getModifiedEditor().deltaDecorations(modDecorRef.current, []);
    }, FLASH_DURATION_MS);

    timersRef.current = [t1, t2, t3];
    setCurrentIdx(clamped);
  }, [isDark, clearAllDecorations]);

  const goPrev = useCallback(() => {
    goToChange(currentIdx <= 0 ? changeCount - 1 : currentIdx - 1);
  }, [currentIdx, changeCount, goToChange]);

  const goNext = useCallback(() => {
    goToChange(currentIdx >= changeCount - 1 ? 0 : currentIdx + 1);
  }, [currentIdx, changeCount, goToChange]);

  const handleMount = useCallback((diffEditor: editor.IStandaloneDiffEditor, monaco: Monaco) => {
    editorRef.current = diffEditor;
    monacoRef.current = monaco;

    const wrapOpts: editor.IEditorOptions = {
      wordWrap: 'on',
      wrappingStrategy: 'advanced',
    };
    diffEditor.getOriginalEditor().updateOptions(wrapOpts);
    diffEditor.getModifiedEditor().updateOptions(wrapOpts);

    diffEditor.onDidUpdateDiff(() => {
      const count = getDiffChanges(diffEditor).length;
      setChangeCount(count);
      setCurrentIdx(0);
      if (count > 0) {
        requestAnimationFrame(() => goToChange(0));
      } else {
        clearAllDecorations();
      }
    });
  }, [goToChange, clearAllDecorations]);

  useEffect(() => {
    setCurrentIdx(0);
    setChangeCount(0);
  }, [leftText, rightText]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.key === 'ArrowUp')   { e.preventDefault(); goPrev(); }
      if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  if (!hasCompared) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Enter text in both editors above and click "Compare" to see the diff.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Visual Diff
          </span>

          {changeCount > 0 && (
            <>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                {changeCount} {changeCount === 1 ? 'change' : 'changes'}
              </span>

              <div className="flex items-center rounded-md border border-gray-300 dark:border-gray-600">
                <button
                  onClick={goPrev}
                  title="Previous change (Alt+↑)"
                  disabled={changeCount <= 1}
                  className="flex items-center rounded-l-md px-1.5 py-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <span className="border-x border-gray-300 px-2 py-1 text-xs font-medium tabular-nums text-gray-600 dark:border-gray-600 dark:text-gray-400">
                  {currentIdx + 1} / {changeCount}
                </span>
                <button
                  onClick={goNext}
                  title="Next change (Alt+↓)"
                  disabled={changeCount <= 1}
                  className="flex items-center rounded-r-md px-1.5 py-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          {changeCount === 0 && hasCompared && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
              Identical
            </span>
          )}
        </div>

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

      <div className="min-h-0 flex-1">
        <DiffEditor
          height="100%"
          language={language}
          theme={monacoTheme}
          original={leftText}
          modified={rightText}
          onMount={handleMount}
          options={{
            readOnly: true,
            renderSideBySide,
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
            wordWrapOverride1: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
