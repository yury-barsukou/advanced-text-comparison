import { useState, useEffect } from 'react';
import { Info, RefreshCw } from 'lucide-react';
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

  function recalculate(modelId: string) {
    const result = countTokensForModel(leftText, rightText, modelId);
    setCounts(result);
  }

  // Recalculate whenever the selected model or the texts change (after compare).
  useEffect(() => {
    if (hasCompared) recalculate(selectedModelId);
    else setCounts(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompared, selectedModelId, leftText, rightText]);

  if (!hasCompared) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Click "Compare" to see token counts.</p>
      </div>
    );
  }

  const selectedModel = LLM_MODELS.find((m) => m.id === selectedModelId)!;
  const diff = counts ? counts.rightCount - counts.leftCount : null;

  return (
    <div className="p-6">
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
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-indigo-400"
        >
          {LLM_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => recalculate(selectedModelId)}
          title="Recalculate"
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Original tokens"
          value={counts?.leftCount ?? 0}
          colorClass="text-gray-900 dark:text-gray-100"
        />
        <StatCard
          label="Modified tokens"
          value={counts?.rightCount ?? 0}
          colorClass="text-gray-900 dark:text-gray-100"
        />
        <StatCard
          label="Difference"
          value={diff ?? 0}
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

      {/* Estimation notice */}
      {selectedModel.isEstimate && (
        <p className="mt-5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          Token counts for <strong>{selectedModel.name}</strong> are estimates
          based on average characters-per-token ratios. The official tokenizer
          for this model is not publicly available.
        </p>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  colorClass: string;
  signed?: boolean;
}

function StatCard({ label, value, colorClass, signed = false }: StatCardProps) {
  const display = signed && value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString();
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className={`text-4xl font-bold tabular-nums ${colorClass}`}>
        {display}
      </span>
    </div>
  );
}
