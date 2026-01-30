<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Ideator App

## Purpose

React 19 + Vite + TypeScript single-page application for document analysis and concept extraction. Provides upload interface, file processing pipeline, LLM-powered concept clustering, and visualization screens. Uses Dexie for client-side storage, Web Workers for heavy processing, and integrates with external LLM APIs for semantic analysis.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Project dependencies: React 19, Vite, D3, Dexie, PDF/Excel parsers, Zustand |
| `vite.config.ts` | Vite build configuration with PWA plugin |
| `tsconfig.json` | TypeScript configuration for the app |
| `tailwind.config.js` | Tailwind CSS configuration with custom design tokens |
| `index.html` | App entry point HTML |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Source code root - components, services, screens |
| `public/` | Static assets served as-is |
| `dist/` | Build output directory |

## For AI Agents

### Working Instructions

1. **Development Server**: `npm run dev` starts Vite dev server on port 5173
2. **Build**: `npm run build` runs TypeScript check then Vite build
3. **Preview**: `npm run preview` serves production build locally
4. **Code Style**: ESLint configured with React hooks rules

### Testing

- No test framework currently configured
- Manual testing via dev server
- Build verification via `npm run build`

### Common Patterns

- **Path Aliases**: `@/` maps to `src/` directory
- **Styling**: CSS custom properties + Tailwind utilities
- **State Management**: Zustand stores (see `src/stores/`)
- **Routing**: React Router v7 with `/upload`, `/concepts`, `/analyze/:id` routes
- **Database**: Dexie IndexedDB wrapper for client-side persistence

## Dependencies

### Internal
- TypeScript 5.9 with strict mode
- ESLint + TypeScript ESLint for linting
- Vite 7 for bundling and dev server

### External
- **React 19.2** - UI framework
- **React Router DOM 7** - Client-side routing
- **Dexie 4.2** - IndexedDB wrapper
- **Zustand 5** - State management
- **D3 7.9** - Data visualization
- **Tailwind CSS 4** - Utility-first styling
- **Parsers**: pdfjs-dist, xlsx, papaparse, mammoth
- **Utils**: fuse.js (fuzzy search), uuid, jszip, html2canvas, jspdf

<!-- MANUAL: -->
