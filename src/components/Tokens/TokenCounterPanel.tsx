import { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';
import { LLM_MODELS, DEFAULT_MODEL_ID, countTokensForModel } from '../../utils/tokenizer';

interface Counts {
  leftCount: number;
  rightCount: number;
}

export function TokenCounterPanel() {
  const hasCompared = useComparisonStore((s) => s.hasCompared);
  const leftText = useComparisonStore((s) => s.leftText);
  const rightText = useComparisonStore((s) => s.rightText);

  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancel in-flight requests when model/texts change before they resolve
  const abortRef = useRef(0);

  async function calculate(modelId: string) {
    const requestId = ++abortRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await countTokensForModel(leftText, rightText, modelId);
      if (requestId !== abortRef.current) return; // superseded
      setCounts(result);
    } catch (e) {
      if (requestId !== abortRef.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load tokenizer.');
    } finally {
      if (requestId === abortRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasCompared) { setCounts(null); return; }
    calculate(selectedModelId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompared, selectedModelId, leftText, rightText]);

  if (!hasCompared) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Click "Compare" to see token counts.</p>
      </div>
    );
  }

  const diff = counts ? counts.rightCount - counts.leftCount : null;

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Model selector */}
      <div className="mb-6 flex items-center gap-3">
        <label
          htmlFor="model-select"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Model
        </label>
        <select
          id="model-select"
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-indigo-400"
        >
          {LLM_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          <button
            onClick={() => calculate(selectedModelId)}
            title="Recalculate"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Original tokens"
          value={counts?.leftCount ?? null}
          loading={loading}
          colorClass="text-gray-900 dark:text-gray-100"
        />
        <StatCard
          label="Modified tokens"
          value={counts?.rightCount ?? null}
          loading={loading}
          colorClass="text-gray-900 dark:text-gray-100"
        />
        <StatCard
          label="Difference"
          value={diff}
          loading={loading}
          signed
          colorClass={
            diff == null || diff === 0
              ? 'text-gray-500 dark:text-gray-400'
              : diff > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
          }
        />
      </div>

      {/* Encoding note */}
      {!loading && !error && (
        <p className="mt-5 text-xs text-gray-400 dark:text-gray-500">
          Counts use the official{' '}
          <span className="font-mono">
            {selectedModelId === 'gpt-4-turbo' ? 'cl100k_base' : 'o200k_base'}
          </span>{' '}
          tiktoken encoding — the same tokenizer the model uses internally.
        </p>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | null;
  loading: boolean;
  colorClass: string;
  signed?: boolean;
}

function StatCard({ label, value, loading, colorClass, signed = false }: StatCardProps) {
  let display: string;
  if (loading) {
    display = '…';
  } else if (value === null) {
    display = '—';
  } else if (signed && value > 0) {
    display = `+${value.toLocaleString()}`;
  } else {
    display = value.toLocaleString();
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={`text-4xl font-bold tabular-nums transition-opacity ${colorClass} ${loading ? 'opacity-40' : 'opacity-100'}`}
      >
        {display}
      </span>
    </div>
  );
}
