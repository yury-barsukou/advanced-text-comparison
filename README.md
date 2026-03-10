# Advanced Text Comparison Tool

A modern, client-side text comparison web application with diff visualization, syntax highlighting, LLM token counting, merge conflict resolution, and theme switching.

All processing happens in the browser -- your text never leaves your machine.

## Features

- **Side-by-side text editing** with Monaco Editor (VS Code's editor engine)
- **Syntax highlighting** for Markdown, JSON, XML, Java, JavaScript, TypeScript, Python, HTML, CSS, SQL, YAML
- **Visual diff** with side-by-side and inline modes
- **Comparison statistics**: characters, words, sentences, paragraphs, reading time, similarity %, additions, deletions
- **LLM token counting** for GPT-4, GPT-4o, GPT-3.5, Claude 3, Gemini, Llama 3
- **Merge editor**: Git-style conflict resolution with accept left/right/both per hunk
- **Light/dark theme** with system preference detection and localStorage persistence

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Monaco Editor
- Zustand (state management)
- diff (jsdiff)
- js-tiktoken (OpenAI tokenizers)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+Enter` | Compare texts |
| `Ctrl+Shift+T` | Toggle theme |

## Build

```bash
npm run build
npm run preview
```

## TODO (Future Features)

- [ ] User authentication (sign-in / sign-up) with OAuth2 / JWT
- [ ] Backend API (Node.js + Express or Next.js API routes)
- [ ] Comparison history stored in PostgreSQL / MongoDB per user
- [ ] File upload support (.txt, .md, .json, .xml, .doc, .docx)
- [ ] Export results as text, JSON, CSV, or PDF
- [ ] Shareable comparison links (unique URLs)
- [ ] Real-time collaboration via WebSockets
- [ ] REST / GraphQL API for programmatic comparison
