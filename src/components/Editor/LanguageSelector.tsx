import { useComparisonStore } from '../../stores/comparisonStore';
import type { LanguageOption } from '../../types';

const LANGUAGES: LanguageOption[] = [
  { id: 'markdown', label: 'Markdown' },
  { id: 'plaintext', label: 'Plain Text' },
  { id: 'json', label: 'JSON' },
  { id: 'xml', label: 'XML' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'sql', label: 'SQL' },
  { id: 'yaml', label: 'YAML' },
];

export function LanguageSelector() {
  const language = useComparisonStore((s) => s.language);
  const setLanguage = useComparisonStore((s) => s.setLanguage);

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as LanguageOption['id'])}
      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
