import type { TextStats as TextStatsType } from '../../types';

interface Props {
  stats: TextStatsType;
  label: string;
}

function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function TextStatsDisplay({ stats, label }: Props) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Characters" value={stats.characters.toLocaleString()} />
        <StatCard label="Words" value={stats.words.toLocaleString()} />
        <StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
        <StatCard label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
        <StatCard label="Reading Time" value={formatReadingTime(stats.readingTimeSeconds)} />
        <StatCard label="Avg Word Length" value={stats.avgWordLength} />
        <StatCard label="Unique Words" value={stats.uniqueWords.toLocaleString()} />
      </div>
    </div>
  );
}
